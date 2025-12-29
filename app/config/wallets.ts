/**
 * Wallet Registry - Configuration for all supported Stacks wallets
 * Following WBIP004 standard for wallet detection
 */

import { WalletConfig } from '../types/wallet';
import { LeatherIcon } from '../components/icons/LeatherIcon';
import { XverseIcon } from '../components/icons/XverseIcon';
import { OKXIcon } from '../components/icons/OKXIcon';
import { HiroIcon } from '../components/icons/HiroIcon';
import { AsignaIcon } from '../components/icons/AsignaIcon';

/**
 * Registry of all supported Stacks wallets
 * Includes native wallets and WalletConnect-enabled wallets
 */
export const SUPPORTED_WALLETS: WalletConfig[] = [
  {
    id: 'leather',
    name: 'Leather',
    description: 'Bitcoin & Stacks wallet with Face ID support',
    icon: LeatherIcon,
    providerId: 'LeatherProvider',
    platforms: ['desktop', 'ios', 'android'],
    installUrls: {
      chrome: 'https://chromewebstore.google.com/detail/leather/ldinpeekobnhjjdofggfgjlcehhmanlj',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/leather-bitcoin-wallet/',
      ios: 'https://apps.apple.com/app/leather-bitcoin-wallet/id6476002250',
      android: 'https://play.google.com/store/apps/details?id=io.leather.wallet',
    },
    deepLink: 'leather://',
    featured: true,
    supportsWalletConnect: true,
  },
  {
    id: 'xverse',
    name: 'Xverse',
    description: 'Multi-chain wallet for Bitcoin, Stacks & more',
    icon: XverseIcon,
    providerId: 'XverseProviders.StacksProvider',
    platforms: ['desktop', 'ios', 'android'],
    installUrls: {
      chrome: 'https://chromewebstore.google.com/detail/xverse-wallet/idnnbdplmphpflfnlkomgpfbpcgelopg',
      ios: 'https://apps.apple.com/app/xverse-bitcoin-wallet/id1552817069',
      android: 'https://play.google.com/store/apps/details?id=io.xverse.wallet',
    },
    featured: true,
    supportsWalletConnect: true,
  },
  {
    id: 'okx',
    name: 'OKX Wallet',
    description: 'Multi-chain Web3 wallet with Stacks support',
    icon: OKXIcon,
    providerId: 'OKXProvider', // To be verified
    platforms: ['desktop', 'ios', 'android'],
    installUrls: {
      chrome: 'https://chromewebstore.google.com/detail/okx-wallet/mcohilncbfahbmgdjkbpemcciiolgcge',
      firefox: 'https://addons.mozilla.org/en-US/firefox/addon/okexwallet/',
      edge: 'https://microsoftedge.microsoft.com/addons/detail/okx-wallet/pbpjkcldjiffchgbbndmhojiacbgflha',
      ios: 'https://apps.apple.com/app/okx-buy-bitcoin-btc-crypto/id1327268470',
      android: 'https://play.google.com/store/apps/details?id=com.okinc.okex.gp',
    },
    featured: true,
    supportsWalletConnect: false,
  },
  {
    id: 'hiro',
    name: 'Hiro Wallet',
    description: 'Legacy Stacks wallet (now Leather)',
    icon: HiroIcon,
    providerId: 'HiroProvider',
    platforms: ['desktop'],
    installUrls: {
      chrome: 'https://chromewebstore.google.com/detail/hiro-wallet/ldinpeekobnhjjdofggfgjlcehhmanlj',
    },
    featured: false,
    supportsWalletConnect: false,
  },
  {
    id: 'asigna',
    name: 'Asigna',
    description: 'Multisig wallet for Stacks',
    icon: AsignaIcon,
    providerId: 'AsignaProvider', // To be verified
    platforms: ['desktop'],
    installUrls: {
      chrome: 'https://asigna.io',
    },
    featured: false,
    supportsWalletConnect: true,
  },
];

/**
 * Get featured wallets (shown prominently in UI)
 */
export function getFeaturedWallets(): WalletConfig[] {
  return SUPPORTED_WALLETS.filter((wallet) => wallet.featured);
}

/**
 * Get wallets that support WalletConnect
 */
export function getWalletConnectWallets(): WalletConfig[] {
  return SUPPORTED_WALLETS.filter((wallet) => wallet.supportsWalletConnect);
}

/**
 * Get wallet by ID
 */
export function getWalletById(id: string): WalletConfig | undefined {
  return SUPPORTED_WALLETS.find((wallet) => wallet.id === id);
}

/**
 * Get wallets available on a specific platform
 */
export function getWalletsByPlatform(platform: 'desktop' | 'ios' | 'android'): WalletConfig[] {
  return SUPPORTED_WALLETS.filter((wallet) => wallet.platforms.includes(platform));
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get appropriate wallets for current platform
 */
export function getPlatformWallets(): WalletConfig[] {
  if (typeof window === 'undefined') return SUPPORTED_WALLETS;

  const mobile = isMobile();
  const platform = mobile ?
    (/Android/i.test(navigator.userAgent) ? 'android' : 'ios') :
    'desktop';

  return getWalletsByPlatform(platform);
}
