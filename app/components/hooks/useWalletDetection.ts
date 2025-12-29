/**
 * useWalletDetection Hook
 * Detects installed Stacks wallets using WBIP004 standard
 */

'use client';

import { useState, useEffect } from 'react';
import { WalletConfig, WBIP004Provider, UseWalletDetectionReturn } from '../../types/wallet';
import { SUPPORTED_WALLETS } from '../../config/wallets';

/**
 * Hook to detect installed Stacks wallets via WBIP004 providers
 *
 * WBIP004 (Wallet Browser Integration Proposal 004) is a standard where
 * wallets register themselves on window.wbip_providers for dApp discovery
 *
 * @returns Object containing lists of installed and not-installed wallets
 */
export function useWalletDetection(): UseWalletDetectionReturn {
  const [installedWallets, setInstalledWallets] = useState<WalletConfig[]>([]);
  const [notInstalledWallets, setNotInstalledWallets] = useState<WalletConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure we're in browser environment
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    /**
     * Detect installed wallets by checking window.wbip_providers
     * This array is populated by wallet extensions following WBIP004
     */
    const detectWallets = () => {
      try {
        // Get WBIP004 providers from window
        const providers: WBIP004Provider[] = (window as any).wbip_providers || [];

        // Match registered providers against our wallet registry
        const installed = SUPPORTED_WALLETS.filter((wallet) => {
          if (!wallet.providerId) return false;

          // Check if this wallet's provider is registered
          return providers.some((provider) => {
            // Handle both exact matches and nested provider IDs
            // e.g., 'LeatherProvider' or 'XverseProviders.StacksProvider'
            if (!wallet.providerId) return false;
            return provider.id === wallet.providerId ||
                   provider.id.includes(wallet.providerId) ||
                   wallet.providerId.includes(provider.id);
          });
        });

        const notInstalled = SUPPORTED_WALLETS.filter(
          (wallet) => !installed.find((w) => w.id === wallet.id)
        );

        setInstalledWallets(installed);
        setNotInstalledWallets(notInstalled);
      } catch (error) {
        console.error('Error detecting wallets:', error);
        // On error, assume no wallets are installed
        setInstalledWallets([]);
        setNotInstalledWallets(SUPPORTED_WALLETS);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial detection
    detectWallets();

    // Re-detect if providers change (some wallets register asynchronously)
    const checkInterval = setInterval(detectWallets, 1000);

    // Clean up after 5 seconds (most wallets register within this time)
    const timeout = setTimeout(() => {
      clearInterval(checkInterval);
    }, 5000);

    return () => {
      clearInterval(checkInterval);
      clearTimeout(timeout);
    };
  }, []);

  return {
    installedWallets,
    notInstalledWallets,
    isLoading,
  };
}

/**
 * Helper: Check if a specific wallet is installed
 */
export function useIsWalletInstalled(walletId: string): boolean {
  const { installedWallets, isLoading } = useWalletDetection();

  if (isLoading) return false;

  return installedWallets.some((wallet) => wallet.id === walletId);
}

/**
 * Helper: Get all WBIP004 providers currently registered
 */
export function getRegisteredProviders(): WBIP004Provider[] {
  if (typeof window === 'undefined') return [];
  return (window as any).wbip_providers || [];
}
