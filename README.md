# Passkey NFT Vault 🔐

> **Stacks Builder Challenge Week 1 Submission**
> Mint NFTs with Face ID/Touch ID using Clarity 4's native secp256r1 signature verification

[![Clarity Version](https://img.shields.io/badge/Clarity-4.0-purple)](https://stacks.co)
[![License](https://img.shields.io/badge/License-MIT-blue)](LICENSE)
[![Built on Stacks](https://img.shields.io/badge/Built%20on-Stacks-orange)](https://stacks.co)
[![Live on Mainnet](https://img.shields.io/badge/Live%20on-Mainnet-success)](https://explorer.hiro.so/txid/89a90f99cec86be93d718779884da95192ba21437dbf95f21b9e312dacefd718?chain=mainnet)

## 🎯 Overview

Passkey NFT Vault is a **SIP-009 compliant NFT contract** that leverages **Clarity 4's new features** to enable seedless, biometric-authenticated NFT minting. Users can mint and transfer NFTs using Face ID or Touch ID instead of managing seed phrases.

### Key Clarity 4 Features Used

| Feature | Function | Purpose |
|---------|----------|---------|
| **secp256r1-verify** | `(secp256r1-verify message-hash signature public-key)` | Native P-256 signature verification for WebAuthn/passkey support |
| **int-to-ascii** | `(int-to-ascii value)` | Integer to string conversion for dynamic token URI generation |
| **Clarity 4 Epoch** | Version 4 features | Enabled via epoch 3.3 configuration |

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         Frontend                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  WebAuthn API (Face ID / Touch ID / Security Key)       │ │
│  │  ↓ P-256 signature (secp256r1)                          │ │
│  └─────────────────────────────────────────────────────────┘ │
│                            │                                  │
│                            ▼                                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  @stacks/connect + @stacks/transactions                 │ │
│  │  Contract call with signature as function argument      │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌──────────────────────────────────────────────────────────────┐
│                    Stacks Blockchain                          │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  passkey-nft-v3.clar (Clarity 4)                        │ │
│  │  SP2FY55DK4NESNH6E5CJSNZP2CQ5PZ5BX64B29FYG              │ │
│  │                                                          │ │
│  │  • secp256r1-verify → Validates P-256 signature         │ │
│  │  • int-to-ascii → Generates dynamic token URIs          │ │
│  │  • nft-mint? → Mints SIP-009 compliant NFT             │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) >= 2.0
- [Node.js](https://nodejs.org) >= 18
- A WebAuthn-compatible device (Face ID, Touch ID, or security key)

### Installation

```bash
# Clone the repository
git clone https://github.com/oderahub/passkey-nft-vault.git
cd passkey-nft-vault

# Install dependencies
npm install

# Configure environment (copy and edit)
cp .env.example .env.local
# Update NEXT_PUBLIC_NETWORK (mainnet/testnet)
# Update NEXT_PUBLIC_CONTRACT_ADDRESS with your deployed contract

# Run tests
npm test

# Start the development server
npm run dev
```

### Mainnet Deployment

The contract is **live on Stacks Mainnet**:

- **Contract**: `SP2FY55DK4NESNH6E5CJSNZP2CQ5PZ5BX64B29FYG.passkey-nft-v3`
- **TX ID**: `89a90f99cec86be93d718779884da95192ba21437dbf95f21b9e312dacefd718`
- **Explorer**: [View on Stacks Explorer](https://explorer.hiro.so/txid/89a90f99cec86be93d718779884da95192ba21437dbf95f21b9e312dacefd718?chain=mainnet)
- **Live App**: [https://passkey-nft-vault.vercel.app/](https://passkey-nft-vault.vercel.app/)

## 📡 Chainhooks Monitoring

This project uses [Hiro Chainhooks](https://platform.hiro.so/chainhooks) for real-time blockchain event monitoring. Three active Chainhooks track all contract activity on Stacks Mainnet:

### Active Chainhooks

| Chainhook | Version | Purpose | Status |
|-----------|---------|---------|--------|
| **Passkey Registrations** | v1.0 | Monitors new passkey registrations | ✅ Active |
| **Passkey NFT Mints** | v1.0 | Tracks NFT minting events | ✅ Active |
| **Passkey NFT Transfers** | v1.0 | Monitors NFT transfer activities | ✅ Active |

All Chainhooks are monitoring from block **5294584** on **Mainnet**.

### Webhook Integration

The application includes a secure webhook endpoint at `/api/webhooks/chainhook` that:
- Receives real-time events from Hiro Platform
- Validates webhook signatures for security
- Processes contract events (registrations, mints, transfers)
- Can be integrated with Discord for notifications (optional)

**Learn more**: [Hiro Chainhooks Platform](https://platform.hiro.so/chainhooks)

### Deploy to Testnet

1. Get testnet STX from the [Stacks Faucet](https://explorer.stacks.co/sandbox/faucet?chain=testnet)

2. Configure your deployment in `settings/Testnet.toml`

3. Deploy:
```bash
clarinet deployments apply --testnet
```

4. Update `.env.local` with your deployed contract address

## 📜 Smart Contract

### Core Functions

#### `register-passkey`
Register a P-256 public key from your device's secure enclave.

```clarity
(define-public (register-passkey (public-key (buff 33)))
  ;; Stores compressed P-256 public key for the user
)
```

#### `mint-with-passkey`
Mint an NFT after verifying your passkey signature.

```clarity
(define-public (mint-with-passkey 
  (message-hash (buff 32))
  (signature (buff 64))
)
  ;; Uses secp256r1-verify to validate WebAuthn signature
  ;; Mints SIP-009 NFT on success
)
```

#### `transfer-with-passkey`
Transfer NFT using passkey instead of wallet signature.

```clarity
(define-public (transfer-with-passkey
  (token-id uint)
  (recipient principal)
  (message-hash (buff 32))
  (signature (buff 64))
)
  ;; Passkey-authenticated transfer
)
```

#### `protected-transfer`
Transfer with Clarity 4 asset protection.

```clarity
(define-public (protected-transfer ...)
  ;; Uses restrict-assets? to ensure only authorized NFT moves
)
```

### SIP-009 Compliance

The contract implements all required SIP-009 functions:
- `get-last-token-id`
- `get-token-uri` (uses `to-ascii?` for dynamic URIs)
- `get-owner`
- `transfer`

## 🔒 Security Features

### WebAuthn Integration
- Private keys never leave the device's secure enclave
- Biometric verification required for each signature
- Replay protection via nonce tracking

### Clarity 4 Asset Protection
- `restrict-assets?` prevents unauthorized token movement
- Contract-level enforcement of transfer rules
- Protection against malicious contract calls

### Signature Verification
- Native `secp256r1-verify` in Clarity 4
- No external oracles or bridge contracts needed
- On-chain cryptographic verification

## 🧪 Testing

```bash
# Run all tests
clarinet test

# Run specific test
clarinet test --filter "passkey"

# Check contract syntax
clarinet check
```

### Test Coverage

| Test | Description |
|------|-------------|
| Registration | Passkey public key storage |
| Minting | SIP-009 NFT creation |
| Transfer | Standard and passkey-authenticated |
| Authorization | Owner and admin checks |
| URI Generation | Dynamic metadata URLs |

## 📁 Project Structure

```
passkey-nft-vault/
├── contracts/
│   └── passkey-nft-v3.clar    # Main Clarity 4 contract (v3)
├── tests/
│   └── passkey-nft.test.ts    # Vitest test suite
├── app/
│   ├── page.tsx               # Main UI with WebAuthn
│   ├── layout.tsx             # Next.js layout
│   ├── globals.css            # Tailwind styles
│   └── api/
│       ├── metadata/[tokenId]/
│       │   └── route.ts       # NFT metadata API
│       └── webhooks/chainhook/
│           └── route.ts       # Chainhook webhook endpoint
├── chainhooks/
│   └── lib/                   # Chainhook utility library
├── deployments/
│   ├── default.mainnet-plan.yaml  # Mainnet deployment config
│   └── *.chainhook.yaml       # Chainhook specifications
├── Clarinet.toml              # Clarinet configuration
├── settings/
│   ├── Devnet.toml            # Local development
│   ├── Testnet.toml           # Testnet deployment
│   └── Mainnet.toml           # Mainnet deployment (not in git)
├── vitest.config.js           # Test configuration
└── package.json
```

## 🎨 NFT Metadata

Each NFT includes:
- **Dynamic SVG** generated on-demand
- **Rarity tiers**: Common, Uncommon, Rare, Legendary
- **Attributes**: Authentication method, signature curve, network

## 🛣️ Roadmap

- [x] Week 1: Core contract + passkey minting ✅
- [x] Mainnet deployment ✅
- [x] Vitest testing infrastructure ✅
- [ ] Week 2: Multi-sig passkey support
- [ ] Week 3: Time-locked minting with `stacks-block-time`
- [ ] NFT marketplace integration

## 📚 Resources

- [Clarity 4 Documentation](https://docs.stacks.co/reference/clarity/functions)
- [SIP-033: Clarity 4 Specification](https://github.com/stacksgov/sips/pull/218)
- [WebAuthn Guide](https://webauthn.guide/)
- [Stacks.js Documentation](https://github.com/hirosystems/stacks.js)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

**Built with ❤️ for the Stacks ecosystem**

*Submitted for Stacks Builder Challenge Week 1 - Clarity 4*
