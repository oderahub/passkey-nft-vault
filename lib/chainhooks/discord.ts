import { getExplorerUrl } from './constants';

export interface DiscordNotification {
  title: string;
  description: string;
  txHash: string;
  blockHeight: number;
  color: number;
}

export async function sendDiscordNotification(notification: DiscordNotification) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('ℹ️  Discord webhook not configured, skipping notification');
    return;
  }

  const explorerUrl = getExplorerUrl(notification.txHash);
  const shortHash = `${notification.txHash.substring(0, 8)}...${notification.txHash.substring(notification.txHash.length - 6)}`;

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
              value: `[\`${shortHash}\`](${explorerUrl})`,
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
