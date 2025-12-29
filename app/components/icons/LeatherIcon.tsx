/**
 * Leather Wallet Icon Component
 */

export function LeatherIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Leather Wallet"
    >
      <rect width="40" height="40" rx="8" fill="#5546FF" />
      <path
        d="M20 10L12 14V20C12 25.52 15.64 30.52 20 32C24.36 30.52 28 25.52 28 20V14L20 10Z"
        fill="white"
      />
      <path
        d="M20 13.5L15.5 16V20C15.5 23.71 17.99 27.21 20 28.5C22.01 27.21 24.5 23.71 24.5 20V16L20 13.5Z"
        fill="#5546FF"
      />
    </svg>
  );
}
