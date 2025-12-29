/**
 * Hiro Wallet Icon Component (Legacy Leather)
 */

export function HiroIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Hiro Wallet"
    >
      <rect width="40" height="40" rx="8" fill="#4D00FF" />
      <path
        d="M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM20 27C16.13 27 13 23.87 13 20C13 16.13 16.13 13 20 13C23.87 13 27 16.13 27 20C27 23.87 23.87 27 20 27Z"
        fill="white"
      />
      <circle cx="20" cy="20" r="4" fill="white" />
    </svg>
  );
}
