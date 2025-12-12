import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Passkey NFT Vault | Clarity 4 on Stacks',
  description: 'Mint NFTs with Face ID/Touch ID using Clarity 4 secp256r1 signature verification on the Stacks Bitcoin L2',
  keywords: ['stacks', 'bitcoin', 'nft', 'passkey', 'webauthn', 'clarity', 'clarity-4'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
