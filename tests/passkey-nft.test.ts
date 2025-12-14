import { describe, expect, it } from 'vitest';
import { Cl } from '@stacks/transactions';

// Test constants - mock P-256 keys for structure testing
const MOCK_PUBLIC_KEY = Cl.buffer(Buffer.from('02' + 'a'.repeat(64), 'hex')); // 33 bytes compressed
const MOCK_SIGNATURE = Cl.buffer(Buffer.from('b'.repeat(128), 'hex')); // 64 bytes
const MOCK_MESSAGE_HASH = Cl.buffer(Buffer.from('c'.repeat(64), 'hex')); // 32 bytes

describe('Passkey NFT Contract Tests', () => {
  describe('Passkey Registration', () => {
    it('can register a passkey public key', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [MOCK_PUBLIC_KEY],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify registration
      const isRegistered = simnet.callReadOnlyFn(
        'passkey-nft',
        'is-registered',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(isRegistered.result).toBeBool(true);
    });

    it('cannot register passkey twice', () => {
      const accounts = simnet.getAccounts();
      const wallet1 = accounts.get('wallet_1')!;

      // First registration
      const { result: result1 } = simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [MOCK_PUBLIC_KEY],
        wallet1
      );
      expect(result1).toBeOk(Cl.bool(true));

      // Second registration should fail
      const mockKey2 = Cl.buffer(Buffer.from('02' + 'b'.repeat(64), 'hex'));
      const { result: result2 } = simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [mockKey2],
        wallet1
      );

      expect(result2).toBeErr(Cl.uint(104)); // ERR-ALREADY-REGISTERED
    });
  });

  describe('Admin Minting', () => {
    it('admin can mint NFT', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'admin-mint',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(result).toBeOk(Cl.uint(1));

      // Verify ownership
      const owner = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-owner',
        [Cl.uint(1)],
        deployer
      );

      expect(owner.result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });

    it('non-admin cannot mint NFT', () => {
      const accounts = simnet.getAccounts();
      const wallet1 = accounts.get('wallet_1')!;
      const wallet2 = accounts.get('wallet_2')!;

      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'admin-mint',
        [Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('SIP-009 Compliance', () => {
    it('get-last-token-id works correctly', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      // Initially 0
      let lastId = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-last-token-id',
        [],
        deployer
      );
      expect(lastId.result).toBeOk(Cl.uint(0));

      // Mint some NFTs
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      // Should be 2 now
      lastId = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-last-token-id',
        [],
        deployer
      );
      expect(lastId.result).toBeOk(Cl.uint(2));
    });

    it('get-token-uri returns correct URI', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      // Mint an NFT first
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      const uri = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-token-uri',
        [Cl.uint(1)],
        deployer
      );

      expect(uri.result).toBeOk(
        Cl.some(Cl.stringAscii('https://passkey-nft.vercel.app/api/metadata/1'))
      );
    });
  });

  describe('Transfer Functionality', () => {
    it('standard transfer works for token owner', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;
      const wallet2 = accounts.get('wallet_2')!;

      // Mint to wallet1
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      // Transfer from wallet1 to wallet2
      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'transfer',
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );

      expect(result).toBeOk(Cl.bool(true));

      // Verify new ownership
      const owner = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-owner',
        [Cl.uint(1)],
        deployer
      );
      expect(owner.result).toBeOk(Cl.some(Cl.principal(wallet2)));
    });

    it('transfer fails if not token owner', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;
      const wallet2 = accounts.get('wallet_2')!;

      // Mint to wallet1
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      // wallet2 tries to transfer wallet1's NFT
      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'transfer',
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet2
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('Nonce Tracking', () => {
    it('get nonce returns correct value', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      // Before registration, nonce is 0
      let nonce = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-nonce',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(nonce.result).toBeUint(0);

      // Register passkey
      simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [MOCK_PUBLIC_KEY],
        wallet1
      );

      // After registration, nonce is still 0 (initialized)
      nonce = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-nonce',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(nonce.result).toBeUint(0);
    });
  });

  describe('Base URI Management', () => {
    it('admin can set base URI', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      const newUri = 'https://new-uri.com/metadata/';

      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'set-base-uri',
        [Cl.stringAscii(newUri)],
        deployer
      );

      expect(result).toBeOk(Cl.bool(true));

      // Mint and check URI
      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      const uri = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-token-uri',
        [Cl.uint(1)],
        deployer
      );

      expect(uri.result).toBeOk(Cl.some(Cl.stringAscii(`${newUri}1`)));
    });

    it('non-admin cannot set base URI', () => {
      const accounts = simnet.getAccounts();
      const wallet1 = accounts.get('wallet_1')!;

      const { result } = simnet.callPublicFn(
        'passkey-nft',
        'set-base-uri',
        [Cl.stringAscii('https://malicious.com/')],
        wallet1
      );

      expect(result).toBeErr(Cl.uint(100)); // ERR-NOT-AUTHORIZED
    });
  });

  describe('Passkey Retrieval', () => {
    it('get passkey returns registered key', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [MOCK_PUBLIC_KEY],
        wallet1
      );

      const passkey = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-passkey',
        [Cl.principal(wallet1)],
        deployer
      );

      expect(passkey.result).toBeSome();
    });
  });

  describe('Token Metadata', () => {
    it('token metadata is stored correctly on mint', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;

      simnet.callPublicFn('passkey-nft', 'admin-mint', [Cl.principal(wallet1)], deployer);

      const metadata = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-token-metadata',
        [Cl.uint(1)],
        deployer
      );

      expect(metadata.result).toBeSome();
    });
  });

  describe('Full Integration Flow', () => {
    it('complete flow: register passkey, admin mint, transfer', () => {
      const accounts = simnet.getAccounts();
      const deployer = accounts.get('deployer')!;
      const wallet1 = accounts.get('wallet_1')!;
      const wallet2 = accounts.get('wallet_2')!;

      // Step 1: Register passkey for wallet1
      let { result } = simnet.callPublicFn(
        'passkey-nft',
        'register-passkey',
        [MOCK_PUBLIC_KEY],
        wallet1
      );
      expect(result).toBeOk(Cl.bool(true));

      // Step 2: Admin mint NFT to wallet1
      ({ result } = simnet.callPublicFn(
        'passkey-nft',
        'admin-mint',
        [Cl.principal(wallet1)],
        deployer
      ));
      expect(result).toBeOk(Cl.uint(1));

      // Step 3: Verify wallet1 is registered
      let isRegistered = simnet.callReadOnlyFn(
        'passkey-nft',
        'is-registered',
        [Cl.principal(wallet1)],
        deployer
      );
      expect(isRegistered.result).toBeBool(true);

      // Step 4: wallet1 transfers to wallet2
      ({ result } = simnet.callPublicFn(
        'passkey-nft',
        'transfer',
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      ));
      expect(result).toBeOk(Cl.bool(true));

      // Step 5: Verify wallet2 now owns the NFT
      const owner = simnet.callReadOnlyFn(
        'passkey-nft',
        'get-owner',
        [Cl.uint(1)],
        deployer
      );
      expect(owner.result).toBeOk(Cl.some(Cl.principal(wallet2)));
    });
  });
});
