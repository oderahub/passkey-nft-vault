import { Clarinet, Tx, Chain, Account, types } from 'https://deno.land/x/clarinet@v1.8.0/index.ts';
import { assertEquals, assertExists } from 'https://deno.land/std@0.224.0/assert/mod.ts';

// Test constants - these would be real P-256 keys in production
// Using placeholder values for structure testing
const MOCK_PUBLIC_KEY = '0x' + '02' + 'a'.repeat(64); // 33 bytes compressed pubkey
const MOCK_SIGNATURE = '0x' + 'b'.repeat(128); // 64 bytes signature
const MOCK_MESSAGE_HASH = '0x' + 'c'.repeat(64); // 32 bytes hash

Clarinet.test({
  name: "Can register a passkey public key",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from('02' + 'a'.repeat(64), 'hex'))
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify registration
    const isRegistered = chain.callReadOnlyFn(
      'passkey-nft',
      'is-registered',
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    assertEquals(isRegistered.result, 'true');
  }
});

Clarinet.test({
  name: "Cannot register passkey twice",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from('02' + 'a'.repeat(64), 'hex'))
      ], wallet1.address),
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from('02' + 'b'.repeat(64), 'hex'))
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    assertEquals(block.receipts[1].result, '(err u104)'); // ERR-ALREADY-REGISTERED
  }
});

Clarinet.test({
  name: "Admin can mint NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Verify ownership
    const owner = chain.callReadOnlyFn(
      'passkey-nft',
      'get-owner',
      [types.uint(1)],
      deployer.address
    );
    
    assertEquals(owner.result, `(ok (some ${wallet1.address}))`);
  }
});

Clarinet.test({
  name: "Non-admin cannot mint NFT",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
  }
});

Clarinet.test({
  name: "SIP-009 get-last-token-id works correctly",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Initially 0
    let lastId = chain.callReadOnlyFn(
      'passkey-nft',
      'get-last-token-id',
      [],
      deployer.address
    );
    assertEquals(lastId.result, '(ok u0)');
    
    // Mint some NFTs
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address),
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    // Should be 2 now
    lastId = chain.callReadOnlyFn(
      'passkey-nft',
      'get-last-token-id',
      [],
      deployer.address
    );
    assertEquals(lastId.result, '(ok u2)');
  }
});

Clarinet.test({
  name: "SIP-009 get-token-uri returns correct URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Mint an NFT first
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    const uri = chain.callReadOnlyFn(
      'passkey-nft',
      'get-token-uri',
      [types.uint(1)],
      deployer.address
    );
    
    // Should contain the base URI + token ID
    assertEquals(uri.result, '(ok (some "https://passkey-nft.vercel.app/api/metadata/1"))');
  }
});

Clarinet.test({
  name: "Standard transfer works for token owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Mint to wallet1
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    // Transfer from wallet1 to wallet2
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Verify new ownership
    const owner = chain.callReadOnlyFn(
      'passkey-nft',
      'get-owner',
      [types.uint(1)],
      deployer.address
    );
    assertEquals(owner.result, `(ok (some ${wallet2.address}))`);
  }
});

Clarinet.test({
  name: "Transfer fails if not token owner",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Mint to wallet1
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    // wallet2 tries to transfer wallet1's NFT
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet2.address) // wallet2 is calling but doesn't own it
    ]);
    
    assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
  }
});

Clarinet.test({
  name: "Get nonce returns correct value",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    // Before registration, nonce is 0
    let nonce = chain.callReadOnlyFn(
      'passkey-nft',
      'get-nonce',
      [types.principal(wallet1.address)],
      deployer.address
    );
    assertEquals(nonce.result, 'u0');
    
    // Register passkey
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from('02' + 'a'.repeat(64), 'hex'))
      ], wallet1.address)
    ]);
    
    // After registration, nonce is still 0 (initialized)
    nonce = chain.callReadOnlyFn(
      'passkey-nft',
      'get-nonce',
      [types.principal(wallet1.address)],
      deployer.address
    );
    assertEquals(nonce.result, 'u0');
  }
});

Clarinet.test({
  name: "Admin can set base URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    const newUri = "https://new-uri.com/metadata/";
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'set-base-uri', [
        types.ascii(newUri)
      ], deployer.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Mint and check URI
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    const uri = chain.callReadOnlyFn(
      'passkey-nft',
      'get-token-uri',
      [types.uint(1)],
      deployer.address
    );
    
    assertEquals(uri.result, `(ok (some "${newUri}1"))`);
  }
});

Clarinet.test({
  name: "Non-admin cannot set base URI",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const wallet1 = accounts.get('wallet_1')!;
    
    const block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'set-base-uri', [
        types.ascii("https://malicious.com/")
      ], wallet1.address)
    ]);
    
    assertEquals(block.receipts[0].result, '(err u100)'); // ERR-NOT-AUTHORIZED
  }
});

Clarinet.test({
  name: "Get passkey returns registered key",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    const pubKeyHex = '02' + 'a'.repeat(64);
    
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from(pubKeyHex, 'hex'))
      ], wallet1.address)
    ]);
    
    const passkey = chain.callReadOnlyFn(
      'passkey-nft',
      'get-passkey',
      [types.principal(wallet1.address)],
      deployer.address
    );
    
    assertExists(passkey.result);
    assertEquals(passkey.result.includes('0x02'), true);
  }
});

Clarinet.test({
  name: "Token metadata is stored correctly on mint",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    
    chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [types.principal(wallet1.address)], deployer.address)
    ]);
    
    const metadata = chain.callReadOnlyFn(
      'passkey-nft',
      'get-token-metadata',
      [types.uint(1)],
      deployer.address
    );
    
    assertExists(metadata.result);
    assertEquals(metadata.result.includes('minted-at'), true);
    assertEquals(metadata.result.includes('passkey-hash'), true);
  }
});

// Integration test for the full flow
Clarinet.test({
  name: "Full flow: register passkey, admin mint, transfer",
  async fn(chain: Chain, accounts: Map<string, Account>) {
    const deployer = accounts.get('deployer')!;
    const wallet1 = accounts.get('wallet_1')!;
    const wallet2 = accounts.get('wallet_2')!;
    
    // Step 1: Register passkey for wallet1
    let block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'register-passkey', [
        types.buff(Buffer.from('02' + 'a'.repeat(64), 'hex'))
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Step 2: Admin mint NFT to wallet1
    block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'admin-mint', [
        types.principal(wallet1.address)
      ], deployer.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok u1)');
    
    // Step 3: Verify wallet1 is registered
    let isRegistered = chain.callReadOnlyFn(
      'passkey-nft',
      'is-registered',
      [types.principal(wallet1.address)],
      deployer.address
    );
    assertEquals(isRegistered.result, 'true');
    
    // Step 4: wallet1 transfers to wallet2
    block = chain.mineBlock([
      Tx.contractCall('passkey-nft', 'transfer', [
        types.uint(1),
        types.principal(wallet1.address),
        types.principal(wallet2.address)
      ], wallet1.address)
    ]);
    assertEquals(block.receipts[0].result, '(ok true)');
    
    // Step 5: Verify wallet2 now owns the NFT
    const owner = chain.callReadOnlyFn(
      'passkey-nft',
      'get-owner',
      [types.uint(1)],
      deployer.address
    );
    assertEquals(owner.result, `(ok (some ${wallet2.address}))`);
  }
});
