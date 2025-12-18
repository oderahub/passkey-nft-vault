# Chainhooks Library

This library provides a modular system for processing blockchain events from Hiro Chainhooks.

## Structure

```
lib/chainhooks/
├── types.ts          # TypeScript type definitions
├── constants.ts      # Contract IDs and configuration
├── discord.ts        # Discord notification service
├── processor.ts      # Block processing and event routing
├── utils.ts          # Utility functions
├── handlers/         # Event handlers
│   ├── mint.ts       # NFT mint events
│   ├── transfer.ts   # NFT transfer events
│   ├── register.ts   # Passkey registration events
│   └── index.ts      # Handler exports
└── index.ts          # Main library exports
```

## Usage

```typescript
import { processBlock, ChainhookPayload } from '@/lib/chainhooks';

// Process webhook payload
const payload: ChainhookPayload = await req.json();

for (const block of payload.apply) {
  await processBlock(block, 'apply');
}
```

## Adding New Event Handlers

1. Create a new handler in `handlers/`:

```typescript
// handlers/my-event.ts
import { EventContext } from '../types';

export async function handleMyEvent(context: EventContext) {
  const { txHash, blockHeight, args } = context;
  // Process event...
}
```

2. Export from `handlers/index.ts`:

```typescript
export { handleMyEvent } from './my-event';
```

3. Add to processor routing in `processor.ts`:

```typescript
case 'my-function-name':
  await handleMyEvent(context);
  break;
```

## Testing

```bash
# Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/chainhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d @test-payload.json
```

## Environment Variables

Required:
- `CHAINHOOK_AUTH_TOKEN` - Secret token for webhook authentication

Optional:
- `DISCORD_WEBHOOK_URL` - Discord webhook for notifications
