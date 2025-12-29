/**
 * Asigna Wallet Icon Component
 */

export function AsignaIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Asigna Wallet"
    >
      <rect width="40" height="40" rx="8" fill="#2B2B2B" />
      <path
        d="M20 10L10 16V24L20 30L30 24V16L20 10Z"
        stroke="white"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M20 18L15 21V25L20 28L25 25V21L20 18Z"
        fill="white"
      />
    </svg>
  );
}
