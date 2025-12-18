import { EventContext } from '../types';
import { sendDiscordNotification } from '../discord';
import { DiscordColors } from '../constants';

export async function handleTransfer(context: EventContext) {
  const { txHash, blockHeight, type } = context;

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
    color: DiscordColors.TRANSFER
  });

  // TODO: Update ownership in database
  // await db.nftOwnership.update({ ... });
}
