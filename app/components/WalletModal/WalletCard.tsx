/**
 * WalletCard Component
 * Displays individual wallet option with connect/install button
 */

'use client';

import { WalletCardProps } from '../../types/wallet';

export function WalletCard({ wallet, isInstalled, isConnecting, onConnect }: WalletCardProps) {
  const Icon = wallet.icon;

  const handleClick = () => {
    if (isInstalled && !isConnecting) {
      onConnect(wallet.id);
    }
  };

  const handleInstallClick = () => {
    // Determine which install URL to use based on browser
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

    let installUrl = wallet.installUrls.chrome; // Default to Chrome

    if (isMobile) {
      if (isAndroid && wallet.installUrls.android) {
        installUrl = wallet.installUrls.android;
      } else if (isIOS && wallet.installUrls.ios) {
        installUrl = wallet.installUrls.ios;
      }
    } else {
      // Desktop - try to detect browser
      const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
      const isEdge = navigator.userAgent.toLowerCase().includes('edg');

      if (isFirefox && wallet.installUrls.firefox) {
        installUrl = wallet.installUrls.firefox;
      } else if (isEdge && wallet.installUrls.edge) {
        installUrl = wallet.installUrls.edge;
      }
    }

    if (installUrl) {
      window.open(installUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={`wallet-card ${isInstalled ? 'wallet-card-installed' : 'wallet-card-not-installed'}`}
      onClick={isInstalled ? handleClick : undefined}
    >
      <div className="wallet-card-content">
        <Icon className="wallet-card-icon" />

        <div className="wallet-card-info">
          <h3 className="wallet-card-name">{wallet.name}</h3>
          <p className="wallet-card-description">{wallet.description}</p>

          <div className="wallet-card-platforms">
            {wallet.platforms.map((platform) => (
              <span key={platform} className="wallet-platform-badge">
                {platform === 'desktop' ? '💻' : platform === 'ios' ? '📱' : '🤖'}
                {platform}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="wallet-card-actions">
        {isInstalled ? (
          <button
            onClick={handleClick}
            disabled={isConnecting}
            className="wallet-card-button wallet-card-button-connect"
          >
            {isConnecting ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={handleInstallClick}
            className="wallet-card-button wallet-card-button-install"
          >
            Install
          </button>
        )}
      </div>
    </div>
  );
}
