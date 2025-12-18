// Chainhook event types

export interface Transaction {
  transaction_identifier: {
    hash: string;
  };
  metadata?: {
    kind?: string;
    receipt?: {
      contract_calls_stack?: Array<{
        contract_identifier: string;
        function_name: string;
        function_args?: any[];
      }>;
    };
    success?: boolean;
  };
  operations?: any[];
}

export interface Block {
  block_identifier: {
    index: number;
    hash: string;
  };
  timestamp: number;
  transactions: Transaction[];
}

export interface ChainhookPayload {
  apply: Block[];
  rollback: Block[];
  chainhook: {
    uuid: string;
    predicate: any;
  };
}

export interface EventContext {
  txHash: string;
  blockHeight: number;
  args: any[];
  type: 'apply' | 'rollback';
}
