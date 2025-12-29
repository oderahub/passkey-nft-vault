/**
 * Xverse Wallet Icon Component
 */

export function XverseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Xverse Wallet"
    >
      <rect width="40" height="40" rx="8" fill="#EE7A30" />
      <path
        d="M13 12L20 20L27 12"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M27 28L20 20L13 28"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="20" cy="20" r="3" fill="white" />
    </svg>
  );
}
