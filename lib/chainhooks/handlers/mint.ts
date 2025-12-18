import { EventContext } from '../types';
import { sendDiscordNotification } from '../discord';
import { DiscordColors } from '../constants';

export async function handleMint(context: EventContext) {
  const { txHash, blockHeight, type } = context;

  if (type === 'rollback') {
    console.log(`⚠️  Mint rolled back: ${txHash}`);
    await sendDiscordNotification({
      title: '⚠️ NFT Mint Rolled Back',
      description: 'A mint transaction was rolled back due to a chain reorganization',
      txHash,
      blockHeight,
      color: DiscordColors.ROLLBACK
    });
    return;
  }

  console.log(`🎨 NFT Minted!`);
  console.log(`   Tx: ${txHash}`);
  console.log(`   Block: ${blockHeight}`);

  await sendDiscordNotification({
    title: '🎨 New NFT Minted!',
    description: 'A new Passkey NFT has been minted with biometric authentication',
    txHash,
    blockHeight,
    color: DiscordColors.MINT
  });

  // TODO: Save to database
  // await db.nftMints.create({ txHash, blockHeight, timestamp: Date.now() });
}
