// Contract configuration
export const CONTRACT_ID = 'SP2FY55DK4NESNH6E5CJSNZP2CQ5PZ5BX64B29FYG.passkey-nft-v3';

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_NETWORK || 'mainnet';

// Explorer URL
export const getExplorerUrl = (txHash: string) => {
  const chain = NETWORK === 'mainnet' ? 'mainnet' : 'testnet';
  return `https://explorer.hiro.so/txid/${txHash}?chain=${chain}`;
};

// Discord embed colors
export const DiscordColors = {
  MINT: 0x00FF00,     // Green
  TRANSFER: 0x0099FF, // Blue
  REGISTER: 0x9B59B6, // Purple
  ROLLBACK: 0xFFA500, // Orange
  ERROR: 0xFF0000,    // Red
} as const;
