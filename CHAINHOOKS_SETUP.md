# Chainhooks Setup Guide

This guide will help you set up Hiro Chainhooks to monitor your Passkey NFT Vault contract for real-time events.

## 🎯 What You'll Get

- Real-time notifications when NFTs are minted
- Discord alerts for transfers and registrations
- Blockchain event monitoring without running your own infrastructure

## 📋 Prerequisites

- Deployed Next.js app (Vercel/Netlify/etc.)
- Discord server (optional, for notifications)
- Hiro Platform account (free)

## 🚀 Setup Steps

### Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Generate a secure auth token:
```bash
openssl rand -hex 32
```

3. Update `.env.local`:
```env
# Required
CHAINHOOK_AUTH_TOKEN=your-generated-token-here

# Optional - for Discord notifications
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

### Step 2: Get Your Discord Webhook URL (Optional)

1. Go to your Discord server
2. Click **Server Settings** → **Integrations** → **Webhooks**
3. Click **New Webhook**
4. Name it: "Passkey NFT Vault"
5. Choose a channel (e.g., #nft-alerts)
6. Click **Copy Webhook URL**
7. Paste it into your `.env.local` as `DISCORD_WEBHOOK_URL`

### Step 3: Deploy Your App

Deploy to get a public URL:

```bash
# Deploy to Vercel
vercel --prod

# Or deploy to Netlify, Railway, etc.
```

Your webhook endpoint will be at:
```
https://your-app.vercel.app/api/webhooks/chainhook
```

### Step 4: Register Chainhooks on Hiro Platform

1. Go to https://platform.hiro.so
2. Sign in or create account
3. Click **Chainhooks** in sidebar
4. Click **New Chainhook**

#### Chainhook #1: Monitor NFT Mints

Fill in these details:

| Field | Value |
|-------|-------|
| **Name** | Passkey NFT Mints |
| **Chain** | Stacks |
| **Network** | Mainnet |
| **If-this (Scope)** | `contract_call` |
| **Contract** | `SP2FY55DK4NESNH6E5CJSNZP2CQ5PZ5BX64B29FYG.passkey-nft-v3` |
| **Method** | `mint-with-passkey` |
| **Then-that (URL)** | `https://your-app.vercel.app/api/webhooks/chainhook` |
| **Authorization** | `Bearer your-generated-token-here` |

Click **Create Chainhook** ✅

#### Chainhook #2: Monitor Transfers

Repeat with these values:

| Field | Value |
|-------|-------|
| **Name** | Passkey NFT Transfers |
| **Method** | `transfer-with-passkey` |
| *(Other fields same as above)* |

#### Chainhook #3: Monitor Registrations

Repeat with these values:

| Field | Value |
|-------|-------|
| **Name** | Passkey Registrations |
| **Method** | `register-passkey` |
| *(Other fields same as above)* |

### Step 5: Test Your Webhook

#### Option A: Check Health Endpoint

Visit your webhook health check:
```
https://your-app.vercel.app/api/webhooks/chainhook
```

You should see:
```json
{
  "status": "ok",
  "service": "Passkey NFT Vault Chainhook Webhook",
  "timestamp": "2024-..."
}
```

#### Option B: Test with Real Mint

1. Go to your app: https://your-app.vercel.app
2. Mint an NFT
3. Check your Discord channel for notification
4. Check Vercel logs for webhook activity

## 📊 Monitoring

### View Webhook Logs

**Vercel:**
```bash
vercel logs --follow
```

Or visit: https://vercel.com/your-org/your-app/logs

**Hiro Platform:**
1. Go to platform.hiro.so
2. Click **Chainhooks**
3. Click on your chainhook
4. View **Activity** tab

### Expected Log Output

When an NFT is minted, you'll see:
```
📨 Received Chainhook event: { uuid: 'abc123', applyBlocks: 1 }
✅ Processing block #123456
📞 Contract call: mint-with-passkey
🎨 NFT Minted!
   Tx: 0xabc...def
   Block: 123456
✅ Discord notification sent
```

## 🐛 Troubleshooting

### Webhook Not Receiving Events

1. **Check URL is correct**
   - Must be publicly accessible
   - Should be HTTPS in production

2. **Verify auth token matches**
   - Same token in `.env.local` and Hiro Platform

3. **Check Hiro Platform activity**
   - View the Activity tab for delivery attempts
   - Look for error messages

### Discord Notifications Not Sending

1. **Verify webhook URL is correct**
   ```bash
   curl -X POST "$DISCORD_WEBHOOK_URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "Test message"}'
   ```

2. **Check channel permissions**
   - Webhook must have permission to post

3. **Check environment variable**
   - Ensure `DISCORD_WEBHOOK_URL` is set correctly
   - Restart your app after changing env vars

### 401 Unauthorized

- Auth token mismatch
- Missing `Bearer` prefix in Hiro Platform
- Token not set in `.env.local`

### 500 Internal Server Error

- Check Vercel logs for error details
- Verify payload structure matches expected format

## 🔧 Advanced Configuration

### Custom Event Processing

Edit `app/api/webhooks/chainhook/route.ts` to add custom logic:

```typescript
async function handleMint(txHash: string, args: any[], blockHeight: number) {
  // Save to database
  await db.nftMints.create({
    txHash,
    blockHeight,
    timestamp: Date.now()
  });

  // Send email notification
  await sendEmail({
    to: 'user@example.com',
    subject: 'NFT Minted!',
    body: `Your NFT was minted in block ${blockHeight}`
  });

  // Update analytics
  await analytics.track('nft_minted', { txHash });
}
```

### Multiple Webhooks

You can create separate endpoints for different events:

```
/api/webhooks/chainhook/mint
/api/webhooks/chainhook/transfer
/api/webhooks/chainhook/register
```

Just register each with its own predicate on Hiro Platform.

### Rate Limiting

Add rate limiting to prevent abuse:

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: /* your redis */,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
```

## 📚 Resources

- [Hiro Chainhooks Documentation](https://docs.hiro.so/chainhooks)
- [Hiro Platform](https://platform.hiro.so)
- [Stacks Explorer](https://explorer.hiro.so)
- [Discord Webhooks Guide](https://discord.com/developers/docs/resources/webhook)

## 🎉 You're All Set!

Your Passkey NFT Vault now has real-time blockchain event monitoring powered by Hiro Chainhooks!

Every mint, transfer, and registration will trigger notifications and you can build on this foundation to add more features like:
- Real-time activity dashboard
- Email notifications
- Analytics tracking
- Automated social media posts
- And more!

---

**Need help?** Open an issue at https://github.com/oderahub/passkey-nft-vault/issues
