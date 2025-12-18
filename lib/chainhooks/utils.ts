/**
 * Utility functions for Chainhook event processing
 */

/**
 * Validate webhook signature (placeholder for future implementation)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  // TODO: Implement HMAC signature validation
  // This would verify that the webhook came from Hiro Platform
  return true;
}

/**
 * Log event with structured formatting
 */
export function logEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  data?: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const prefix = {
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  }[level];

  console.log(`[${timestamp}] ${prefix} ${message}`);
  if (data) {
    console.log('  ', JSON.stringify(data, null, 2));
  }
}

/**
 * Check if a transaction should be processed
 */
export function shouldProcessTransaction(
  tx: any,
  contractId: string
): boolean {
  // Skip failed transactions
  if (tx.metadata?.success === false) {
    return false;
  }

  // Check if transaction interacts with our contract
  const contractCalls = tx.metadata?.receipt?.contract_calls_stack || [];
  return contractCalls.some((call: any) =>
    call.contract_identifier === contractId
  );
}
