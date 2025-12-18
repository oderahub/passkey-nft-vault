import { Block, EventContext } from './types';
import { CONTRACT_ID } from './constants';
import { handleMint, handleTransfer, handleRegister } from './handlers';

export async function processBlock(block: Block, type: 'apply' | 'rollback') {
  const blockHeight = block.block_identifier.index;
  const blockHash = block.block_identifier.hash;

  console.log(`\n${type === 'apply' ? '✅' : '⚠️'} Processing block #${blockHeight}`);

  for (const tx of block.transactions) {
    const txHash = tx.transaction_identifier.hash;

    // Check if transaction was successful
    if (tx.metadata?.success === false) {
      console.log(`⏭️  Skipping failed transaction: ${txHash}`);
      continue;
    }

    // Extract contract calls from the transaction
    const contractCalls = tx.metadata?.receipt?.contract_calls_stack || [];

    for (const call of contractCalls) {
      // Only process calls to our contract
      if (call.contract_identifier !== CONTRACT_ID) {
        continue;
      }

      const functionName = call.function_name;
      const args = call.function_args || [];

      console.log(`📞 Contract call: ${functionName}`);

      const context: EventContext = {
        txHash,
        blockHeight,
        args,
        type
      };

      // Route to appropriate handler
      switch (functionName) {
        case 'mint-with-passkey':
          await handleMint(context);
          break;

        case 'transfer-with-passkey':
        case 'transfer':
          await handleTransfer(context);
          break;

        case 'register-passkey':
          await handleRegister(context);
          break;

        default:
          console.log(`ℹ️  Unhandled function: ${functionName}`);
      }
    }
  }
}
