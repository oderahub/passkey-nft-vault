/**
 * WalletConnect Icon Component
 */

export function WalletConnectIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="WalletConnect"
    >
      <rect width="40" height="40" rx="8" fill="#3B99FC" />
      <path
        d="M13.5 16.5C17.366 12.634 23.634 12.634 27.5 16.5L28 17L25.5 19.5L25 19C22.514 16.514 18.486 16.514 16 19L15.5 19.5L13 17L13.5 16.5Z"
        fill="white"
      />
      <path
        d="M17 21.5L19.5 24L22 21.5C23.105 20.395 24.895 20.395 26 21.5L28.5 24L26 26.5C23.134 29.366 16.866 29.366 14 26.5L11.5 24L14 21.5C15.105 20.395 16.895 20.395 18 21.5"
        fill="white"
      />
      <circle cx="20" cy="24" r="2" fill="#3B99FC" />
    </svg>
  );
}
