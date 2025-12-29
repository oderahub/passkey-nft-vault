/**
 * OKX Wallet Icon Component
 */

export function OKXIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="OKX Wallet"
    >
      <rect width="40" height="40" rx="8" fill="black" />
      <rect x="10" y="10" width="8" height="8" fill="white" />
      <rect x="22" y="10" width="8" height="8" fill="white" />
      <rect x="10" y="22" width="8" height="8" fill="white" />
      <rect x="22" y="22" width="8" height="8" fill="white" />
    </svg>
  );
}
