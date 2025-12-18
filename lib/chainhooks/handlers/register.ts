import { EventContext } from '../types';
import { sendDiscordNotification } from '../discord';
import { DiscordColors } from '../constants';

export async function handleRegister(context: EventContext) {
  const { txHash, blockHeight, type } = context;

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
    color: DiscordColors.REGISTER
  });

  // TODO: Track user registration
  // await db.userRegistrations.create({ ... });
}
