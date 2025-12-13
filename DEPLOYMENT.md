# Deployment Guide - Passkey NFT Vault

## Prerequisites

- [ ] Clarinet 3.11.0+ installed
- [ ] Node.js 18+ installed
- [ ] A Stacks wallet with STX for deployment fees
- [ ] 24-word mnemonic phrase for deploying account

---

## 1. Testing (Local Development)

### Note: Test Command Currently Unavailable

The `clarinet test` command is not available in Clarinet 3.11.0. Tests are written in TypeScript/Deno format but require:
- **Option A:** Upgrade to Clarinet with test support
- **Option B:** Use Clarinet SDK with Vitest (requires migration)
- **Option C:** Manual testing via Clarinet console

### Syntax Check (Available)

```bash
# Check contract syntax
clarinet check contracts/passkey-nft.clar
clarinet check contracts/passkey-nft-simple.clar
```

### Manual Testing via Console

```bash
# Start interactive console
clarinet console

# In console:
(contract-call? .passkey-nft register-passkey 0x02...)
(contract-call? .passkey-nft admin-mint tx-sender)
```

---

## 2. Testnet Deployment

### Step 1: Set Environment Variable

```bash
export DEPLOYER_MNEMONIC="your 24-word mnemonic phrase here"
```

### Step 2: Verify Configuration

File: `settings/Testnet.toml`
```toml
[network]
name = "testnet"
stacks_node_rpc_address = "https://api.testnet.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "${DEPLOYER_MNEMONIC}"
```

### Step 3: Generate Deployment Plan

```bash
clarinet deployments generate --testnet
```

This creates: `deployments/default.testnet-plan.yaml`

### Step 4: Deploy to Testnet

```bash
clarinet deployments apply -p testnet
```

### Step 5: Update Frontend Configuration

After successful deployment, note your contract address (starts with `ST...`).

Update `.env.local`:
```env
NEXT_PUBLIC_NETWORK=testnet
NEXT_PUBLIC_CONTRACT_ADDRESS=ST... # Your deployed contract address
NEXT_PUBLIC_CONTRACT_NAME=passkey-nft
```

### Step 6: Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_NETWORK=testnet
# NEXT_PUBLIC_CONTRACT_ADDRESS=ST...
# NEXT_PUBLIC_CONTRACT_NAME=passkey-nft
```

---

## 3. Mainnet Deployment

### ⚠️ Important Security Checks

Before deploying to mainnet:

- [ ] Contract has been thoroughly tested on testnet
- [ ] All security considerations have been reviewed
- [ ] Admin functions are properly protected
- [ ] Base URI is set correctly for mainnet
- [ ] Frontend works correctly on testnet
- [ ] You have sufficient STX for deployment fees (~2-5 STX recommended)

### Step 1: Set Environment Variable

```bash
export DEPLOYER_MNEMONIC="your 24-word mnemonic phrase here"
```

### Step 2: Verify Mainnet Configuration

File: `settings/Mainnet.toml`
```toml
[network]
name = "mainnet"
stacks_node_rpc_address = "https://api.hiro.so"
deployment_fee_rate = 10

[accounts.deployer]
mnemonic = "${DEPLOYER_MNEMONIC}"
```

### Step 3: Generate Mainnet Deployment Plan

```bash
clarinet deployments generate --mainnet
```

This creates: `deployments/default.mainnet-plan.yaml`

**Review the plan carefully before proceeding!**

### Step 4: Deploy to Mainnet

```bash
clarinet deployments apply -p mainnet
```

**⚠️ This will spend real STX! Double-check everything before proceeding.**

### Step 5: Update Frontend for Mainnet

Create `.env.production`:
```env
NEXT_PUBLIC_NETWORK=mainnet
NEXT_PUBLIC_CONTRACT_ADDRESS=SP... # Your mainnet contract address
NEXT_PUBLIC_CONTRACT_NAME=passkey-nft
```

### Step 6: Deploy Production Frontend

```bash
# Deploy to Vercel with production environment
vercel --prod

# Or set environment variables in Vercel dashboard:
# NEXT_PUBLIC_NETWORK=mainnet
# NEXT_PUBLIC_CONTRACT_ADDRESS=SP...
# NEXT_PUBLIC_CONTRACT_NAME=passkey-nft
```

### Step 7: Verify Deployment

1. Check contract on explorer:
   ```
   https://explorer.stacks.co/address/SP...?chain=mainnet
   ```

2. Test the following functions:
   - [ ] Connect wallet (Hiro/Leather on mainnet)
   - [ ] Register passkey
   - [ ] Mint NFT with passkey
   - [ ] View NFT metadata
   - [ ] Verify transaction on explorer

---

## 4. Post-Deployment Tasks

### Contract Verification

1. **Verify NFT Trait Compliance:**
   - Test `get-last-token-id`
   - Test `get-token-uri`
   - Test `get-owner`
   - Test `transfer`

2. **Verify Passkey Functions:**
   - Test `register-passkey`
   - Test `mint-with-passkey` with real biometric auth
   - Verify `secp256r1-verify` works correctly

3. **Test NFT Metadata API:**
   ```bash
   curl https://your-app.vercel.app/api/metadata/1
   ```

### Security Considerations

- [ ] Admin functions only callable by deployer
- [ ] Base URI cannot be changed by non-admin
- [ ] Passkey registration prevents duplicates
- [ ] Nonce tracking prevents replay attacks
- [ ] Signature verification works correctly

### Marketing & Documentation

- [ ] Update README with deployed contract addresses
- [ ] Add links to live demo
- [ ] Share on Stacks Discord/Twitter
- [ ] Submit to Stacks ecosystem directory

---

## 5. Monitoring & Maintenance

### Monitor Contract Activity

```bash
# Check contract transactions
https://explorer.stacks.co/address/SP...?chain=mainnet

# Monitor API errors in Vercel
vercel logs
```

### Update Base URI (If Needed)

```bash
# Via Clarinet console or frontend
(contract-call? .passkey-nft set-base-uri "https://new-url.com/api/metadata/")
```

---

## Troubleshooting

### "Mnemonic has invalid checksum"
- Ensure your mnemonic is exactly 12, 15, 18, 21, or 24 words
- Verify each word is in the BIP39 wordlist
- Remove any extra spaces or line breaks

### "Insufficient balance"
- Check your STX balance: `https://explorer.stacks.co/address/ST...`
- Acquire more STX from an exchange or faucet (testnet)

### "Contract already exists"
- Contract names must be unique per address
- Either use a different deployer address or change the contract name

### Frontend Not Connecting to Contract
- Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` matches deployed address
- Check network setting (`mainnet` vs `testnet`)
- Clear browser cache and reconnect wallet

---

## Environment Variables Reference

| Variable | Testnet Value | Mainnet Value |
|----------|--------------|---------------|
| `NEXT_PUBLIC_NETWORK` | `testnet` | `mainnet` |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `ST...` | `SP...` |
| `NEXT_PUBLIC_CONTRACT_NAME` | `passkey-nft` | `passkey-nft` |
| `DEPLOYER_MNEMONIC` | (your test mnemonic) | (your mainnet mnemonic) |

---

## Useful Commands

```bash
# Check contract syntax
clarinet check contracts/passkey-nft.clar

# Start local development server
npm run dev

# Build for production
npm run build

# Deploy to testnet
export DEPLOYER_MNEMONIC="..."
clarinet deployments apply -p testnet

# Deploy to mainnet
export DEPLOYER_MNEMONIC="..."
clarinet deployments apply -p mainnet

# Deploy frontend
vercel --prod
```

---

## Resources

- [Clarinet Documentation](https://docs.stacks.co/reference)
- [Stacks Explorer](https://explorer.stacks.co)
- [Hiro Wallet](https://wallet.hiro.so)
- [Stacks Discord](https://stacks.chat)
- [SIP-033: Clarity 4](https://stacks.org/sip-033-clarity-4)
