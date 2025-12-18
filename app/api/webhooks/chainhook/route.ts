import { NextRequest, NextResponse } from 'next/server';

// Types for Chainhook payload
interface Transaction {
  transaction_identifier: {
    hash: string;
  };
  metadata?: {
    kind?: string;
    receipt?: {
      contract_calls_stack?: Array<{
        contract_identifier: string;
        function_name: string;
        function_args?: any[];
      }>;
    };
    success?: boolean;
  };
  operations?: any[];
}

interface Block {
  block_identifier: {
    index: number;
    hash: string;
  };
  timestamp: number;
  transactions: Transaction[];
}

interface ChainhookPayload {
  apply: Block[];
  rollback: Block[];
  chainhook: {
    uuid: string;
    predicate: any;
  };
}

// Contract identifier
const CONTRACT_ID = 'SP2FY55DK4NESNH6E5CJSNZP2CQ5PZ5BX64B29FYG.passkey-nft-v3';

export async function POST(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CHAINHOOK_AUTH_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.warn('Unauthorized webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: ChainhookPayload = await req.json();

    console.log('📨 Received Chainhook event:', {
      uuid: payload.chainhook?.uuid,
      applyBlocks: payload.apply?.length || 0,
      rollbackBlocks: payload.rollback?.length || 0
    });

    // Process applied blocks (new events)
    if (payload.apply && payload.apply.length > 0) {
      for (const block of payload.apply) {
        await processBlock(block, 'apply');
      }
    }

    // Process rollbacks (chain reorganizations)
    if (payload.rollback && payload.rollback.length > 0) {
      for (const block of payload.rollback) {
        await processBlock(block, 'rollback');
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        applied: payload.apply?.length || 0,
        rolledBack: payload.rollback?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function processBlock(block: Block, type: 'apply' | 'rollback') {
  const blockHeight = block.block_identifier.index;
  const blockHash = block.block_identifier.hash;

  console.log(`\n${type === 'apply' ? '✅' : '⚠️'} Processing block #${blockHeight}`);

  for (const tx of block.transactions) {
    const txHash = tx.transaction_identifier.hash;

    // Check if transaction was successful
    if (tx.metadata?.success === false) {
      console.log(`⏭️  Skipping failed transaction: ${txHash}`);
      continue;
    }

    // Extract contract calls from the transaction
    const contractCalls = tx.metadata?.receipt?.contract_calls_stack || [];

    for (const call of contractCalls) {
      // Only process calls to our contract
      if (call.contract_identifier !== CONTRACT_ID) {
        continue;
      }

      const functionName = call.function_name;
      const args = call.function_args || [];

      console.log(`📞 Contract call: ${functionName}`);

      // Route to appropriate handler
      switch (functionName) {
        case 'mint-with-passkey':
          await handleMint(txHash, args, blockHeight, type);
          break;

        case 'transfer-with-passkey':
        case 'transfer':
          await handleTransfer(txHash, args, blockHeight, type);
          break;

        case 'register-passkey':
          await handleRegister(txHash, args, blockHeight, type);
          break;

        default:
          console.log(`ℹ️  Unhandled function: ${functionName}`);
      }
    }
  }
}

async function handleMint(
  txHash: string,
  args: any[],
  blockHeight: number,
  type: 'apply' | 'rollback'
) {
  if (type === 'rollback') {
    console.log(`⚠️  Mint rolled back: ${txHash}`);
    await sendDiscordNotification({
      title: '⚠️ NFT Mint Rolled Back',
      description: 'A mint transaction was rolled back due to a chain reorganization',
      txHash,
      blockHeight,
      color: 0xFFA500 // Orange
    });
    return;
  }

  console.log(`🎨 NFT Minted!`);
  console.log(`   Tx: ${txHash}`);
  console.log(`   Block: ${blockHeight}`);

  // Send Discord notification
  await sendDiscordNotification({
    title: '🎨 New NFT Minted!',
    description: 'A new Passkey NFT has been minted with biometric authentication',
    txHash,
    blockHeight,
    color: 0x00FF00 // Green
  });

  // TODO: Save to database
  // await db.nftMints.create({ txHash, blockHeight, timestamp: Date.now() });
}

async function handleTransfer(
  txHash: string,
  args: any[],
  blockHeight: number,
  type: 'apply' | 'rollback'
) {
  if (type === 'rollback') {
    console.log(`⚠️  Transfer rolled back: ${txHash}`);
    return;
  }

  console.log(`📦 NFT Transferred!`);
  console.log(`   Tx: ${txHash}`);
  console.log(`   Block: ${blockHeight}`);

  await sendDiscordNotification({
    title: '📦 NFT Transferred',
    description: 'An NFT was transferred using passkey authentication',
    txHash,
    blockHeight,
    color: 0x0099FF // Blue
  });
}

async function handleRegister(
  txHash: string,
  args: any[],
  blockHeight: number,
  type: 'apply' | 'rollback'
) {
  if (type === 'rollback') {
    console.log(`⚠️  Registration rolled back: ${txHash}`);
    return;
  }

  console.log(`🔑 Passkey Registered!`);
  console.log(`   Tx: ${txHash}`);
  console.log(`   Block: ${blockHeight}`);

  await sendDiscordNotification({
    title: '🔑 New Passkey Registered',
    description: 'A new user registered their passkey for biometric NFT minting',
    txHash,
    blockHeight,
    color: 0x9B59B6 // Purple
  });
}

interface DiscordNotification {
  title: string;
  description: string;
  txHash: string;
  blockHeight: number;
  color: number;
}

async function sendDiscordNotification(notification: DiscordNotification) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('ℹ️  Discord webhook not configured, skipping notification');
    return;
  }

  const explorerUrl = `https://explorer.hiro.so/txid/${notification.txHash}?chain=mainnet`;

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        embeds: [{
          title: notification.title,
          description: notification.description,
          color: notification.color,
          fields: [
            {
              name: 'Transaction',
              value: `[\`${notification.txHash.substring(0, 8)}...${notification.txHash.substring(notification.txHash.length - 6)}\`](${explorerUrl})`,
              inline: true
            },
            {
              name: 'Block Height',
              value: `#${notification.blockHeight}`,
              inline: true
            }
          ],
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Passkey NFT Vault • Powered by Hiro Chainhooks'
          }
        }]
      })
    });

    if (response.ok) {
      console.log('✅ Discord notification sent');
    } else {
      console.error('❌ Discord notification failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Failed to send Discord notification:', error);
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Passkey NFT Vault Chainhook Webhook',
    timestamp: new Date().toISOString()
  });
}
