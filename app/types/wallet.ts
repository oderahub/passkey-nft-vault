/**
 * Wallet configuration and provider types for multi-wallet support
 * Following WBIP004 standard for Stacks wallet detection
 */

import { ComponentType } from 'react';

/**
 * Platform types for wallet availability
 */
export type WalletPlatform = 'desktop' | 'ios' | 'android';

/**
 * Install URLs for different platforms
 */
export interface WalletInstallUrls {
  chrome?: string;
  firefox?: string;
  edge?: string;
  ios?: string;
  android?: string;
}

/**
 * Configuration for a supported wallet
 */
export interface WalletConfig {
  /** Unique identifier for the wallet */
  id: string;

  /** Display name of the wallet */
  name: string;

  /** Short description of wallet features */
  description: string;

  /** Icon component for the wallet logo */
  icon: ComponentType<{ className?: string }>;

  /** WBIP004 provider ID for detection (e.g., 'LeatherProvider') */
  providerId?: string;

  /** Platforms where this wallet is available */
  platforms: WalletPlatform[];

  /** Installation URLs for different platforms */
  installUrls: WalletInstallUrls;

  /** Deep link URL for mobile wallet (e.g., 'leather://') */
  deepLink?: string;

  /** Whether to feature this wallet prominently */
  featured: boolean;

  /** Whether the wallet supports WalletConnect protocol */
  supportsWalletConnect: boolean;
}

/**
 * WBIP004 Provider interface
 * Wallets register themselves on window.wbip_providers
 */
export interface WBIP004Provider {
  id: string;
  name: string;
  icon?: string;
}

/**
 * Window interface extension for WBIP004 providers
 */
declare global {
  interface Window {
    wbip_providers?: WBIP004Provider[];
  }
}

/**
 * Wallet connection state
 */
export type WalletConnectionState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'disconnected';

/**
 * Props for WalletModal component
 */
export interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (walletId: string) => Promise<void>;
}

/**
 * Props for WalletCard component
 */
export interface WalletCardProps {
  wallet: WalletConfig;
  isInstalled: boolean;
  isConnecting: boolean;
  onConnect: (walletId: string) => void;
}

/**
 * Wallet detection hook return type
 */
export interface UseWalletDetectionReturn {
  installedWallets: WalletConfig[];
  notInstalledWallets: WalletConfig[];
  isLoading: boolean;
}
