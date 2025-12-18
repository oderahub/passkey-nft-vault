import { NextRequest, NextResponse } from 'next/server';
import { ChainhookPayload } from '@/lib/chainhooks/types';
import { processBlock } from '@/lib/chainhooks/processor';

export async function POST(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.CHAINHOOK_AUTH_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      console.warn('Unauthorized webhook attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload: ChainhookPayload = await req.json();

    console.log('📨 Received Chainhook event:', {
      uuid: payload.chainhook?.uuid,
      applyBlocks: payload.apply?.length || 0,
      rollbackBlocks: payload.rollback?.length || 0
    });

    // Process applied blocks (new events)
    if (payload.apply && payload.apply.length > 0) {
      for (const block of payload.apply) {
        await processBlock(block, 'apply');
      }
    }

    // Process rollbacks (chain reorganizations)
    if (payload.rollback && payload.rollback.length > 0) {
      for (const block of payload.rollback) {
        await processBlock(block, 'rollback');
      }
    }

    return NextResponse.json({
      success: true,
      processed: {
        applied: payload.apply?.length || 0,
        rolledBack: payload.rollback?.length || 0
      }
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'Passkey NFT Vault Chainhook Webhook',
    timestamp: new Date().toISOString()
  });
}
