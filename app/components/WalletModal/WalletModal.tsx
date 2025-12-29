/**
 * WalletModal Component
 * Main modal for wallet selection with categorized sections
 */

'use client';

import { useState } from 'react';
import { WalletModalProps } from '../../types/wallet';
import { useWalletDetection } from '../hooks/useWalletDetection';
import { getFeaturedWallets } from '../../config/wallets';
import { WalletCard } from './WalletCard';

export function WalletModal({ isOpen, onClose, onConnect }: WalletModalProps) {
  const { installedWallets, notInstalledWallets, isLoading } = useWalletDetection();
  const [connectingWalletId, setConnectingWalletId] = useState<string | null>(null);

  const handleConnect = async (walletId: string) => {
    try {
      setConnectingWalletId(walletId);
      await onConnect(walletId);
      // onConnect should handle closing the modal on success
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      setConnectingWalletId(null);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const featuredWallets = getFeaturedWallets();
  const featuredInstalled = installedWallets.filter((w) => featuredWallets.some((f) => f.id === w.id));
  const featuredNotInstalled = notInstalledWallets.filter((w) => featuredWallets.some((f) => f.id === w.id));
  const otherInstalled = installedWallets.filter((w) => !featuredWallets.some((f) => f.id === w.id));
  const otherNotInstalled = notInstalledWallets.filter((w) => !featuredWallets.some((f) => f.id === w.id));

  return (
    <div className="wallet-modal-backdrop" onClick={handleBackdropClick}>
      <div className="wallet-modal">
        <div className="wallet-modal-header">
          <h2 className="wallet-modal-title">Connect Wallet</h2>
          <button className="wallet-modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="wallet-modal-content">
          {isLoading ? (
            <div className="wallet-modal-loading">
              <div className="wallet-modal-spinner" />
              <p>Detecting wallets...</p>
            </div>
          ) : (
            <>
              {/* Installed Wallets Section */}
              {installedWallets.length > 0 && (
                <section className="wallet-modal-section">
                  <h3 className="wallet-modal-section-title">
                    ✅ Installed ({installedWallets.length})
                  </h3>
                  <div className="wallet-modal-grid">
                    {featuredInstalled.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        isInstalled={true}
                        isConnecting={connectingWalletId === wallet.id}
                        onConnect={handleConnect}
                      />
                    ))}
                    {otherInstalled.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        isInstalled={true}
                        isConnecting={connectingWalletId === wallet.id}
                        onConnect={handleConnect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Popular Wallets Section (Not Installed) */}
              {featuredNotInstalled.length > 0 && (
                <section className="wallet-modal-section">
                  <h3 className="wallet-modal-section-title">
                    ⭐ Popular Wallets
                  </h3>
                  <div className="wallet-modal-grid">
                    {featuredNotInstalled.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        isInstalled={false}
                        isConnecting={false}
                        onConnect={handleConnect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Other Wallets Section (Not Installed) */}
              {otherNotInstalled.length > 0 && (
                <section className="wallet-modal-section">
                  <h3 className="wallet-modal-section-title">
                    More Wallets
                  </h3>
                  <div className="wallet-modal-grid">
                    {otherNotInstalled.map((wallet) => (
                      <WalletCard
                        key={wallet.id}
                        wallet={wallet}
                        isInstalled={false}
                        isConnecting={false}
                        onConnect={handleConnect}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* No Wallets Found */}
              {installedWallets.length === 0 && notInstalledWallets.length === 0 && (
                <div className="wallet-modal-empty">
                  <p>No wallets available</p>
                </div>
              )}
            </>
          )}
        </div>

        <div className="wallet-modal-footer">
          <p className="wallet-modal-footer-text">
            New to Stacks?{' '}
            <a
              href="https://leather.io"
              target="_blank"
              rel="noopener noreferrer"
              className="wallet-modal-footer-link"
            >
              Get Leather Wallet
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
