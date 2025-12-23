'use client';

import { useState, useCallback, useEffect } from 'react';
import { AppConfig, UserSession, connect as stacksConnect } from '@stacks/connect';
import {
  openContractCall,
  FinishedTxData
} from '@stacks/connect';
import {
  bufferCV,
  principalCV,
  uintCV,
  cvToHex,
  PostConditionMode,
} from '@stacks/transactions';
import { StacksTestnet, StacksMainnet } from '@stacks/network';

// Contract configuration - set via environment variables
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';
const CONTRACT_NAME = process.env.NEXT_PUBLIC_CONTRACT_NAME || 'passkey-nft';

// Network configuration - defaults to testnet
const NETWORK_ENV = process.env.NEXT_PUBLIC_NETWORK || 'testnet';
const network = NETWORK_ENV === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
const isMainnet = NETWORK_ENV === 'mainnet';

// App configuration for Stacks Connect
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });

// Types
interface PasskeyCredential {
  id: string;
  publicKey: Uint8Array;
  signature?: Uint8Array;
}

type MintStatus = 'idle' | 'connecting' | 'registering' | 'signing' | 'minting' | 'success' | 'error';

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [userAddress, setUserAddress] = useState<string>('');
  const [status, setStatus] = useState<MintStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [txId, setTxId] = useState<string>('');
  const [passkey, setPasskey] = useState<PasskeyCredential | null>(null);
  const [isPasskeyRegistered, setIsPasskeyRegistered] = useState(false);

  // Check if user is already connected
  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      const userData = userSession.loadUserData();
      setIsConnected(true);
      setUserAddress(isMainnet ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet);
    }

    // Handle pending authentication (important for mobile wallet redirects)
    if (userSession.isSignInPending()) {
      userSession.handlePendingSignIn().then((userData) => {
        setIsConnected(true);
        setUserAddress(isMainnet ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet);
        setStatus('idle');
        setStatusMessage('Wallet connected successfully!');
      }).catch((error) => {
        console.error('Authentication error:', error);
        setStatus('error');
        setStatusMessage('Failed to connect wallet');
      });
    }
  }, []);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    setStatus('connecting');
    setStatusMessage('Connecting wallet...');

    try {
      const result = await stacksConnect({
        walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
      });

      // After connection, the userSession will be updated
      if (userSession.isUserSignedIn()) {
        const userData = userSession.loadUserData();
        setIsConnected(true);
        setUserAddress(isMainnet ? userData.profile.stxAddress.mainnet : userData.profile.stxAddress.testnet);
        setStatus('idle');
        setStatusMessage('Wallet connected!');
      }
    } catch (error: any) {
      if (error?.message?.includes('cancel') || error?.message?.includes('reject')) {
        setStatus('idle');
        setStatusMessage('Connection cancelled');
      } else {
        setStatus('error');
        setStatusMessage(`Connection failed: ${error.message || 'Unknown error'}`);
      }
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    userSession.signUserOut();
    setIsConnected(false);
    setUserAddress('');
    setPasskey(null);
    setIsPasskeyRegistered(false);
  }, []);

  // Register a new passkey using WebAuthn
  const registerPasskey = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      setStatusMessage('WebAuthn not supported in this browser');
      return;
    }

    setStatus('registering');
    setStatusMessage('Creating passkey with Face ID/Touch ID...');

    try {
      // Generate a random challenge
      const challenge = crypto.getRandomValues(new Uint8Array(32));
      
      // Create credential options for P-256 (required for secp256r1)
      const createOptions: CredentialCreationOptions = {
        publicKey: {
          challenge,
          rp: {
            name: 'Passkey NFT Vault',
            id: window.location.hostname,
          },
          user: {
            id: new TextEncoder().encode(userAddress),
            name: userAddress,
            displayName: `Stacks User ${userAddress.slice(0, 8)}...`,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' }, // ES256 (P-256/secp256r1)
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // Use platform authenticator (Face ID/Touch ID)
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
          attestation: 'none',
        },
      };

      const credential = await navigator.credentials.create(createOptions) as PublicKeyCredential;
      
      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Extract the public key from the attestation
      const publicKeyDer = response.getPublicKey();
      if (!publicKeyDer) {
        throw new Error('Failed to get public key');
      }

      // Convert DER-encoded public key to compressed format (33 bytes)
      // The DER format starts with: 0x3059301306072a8648ce3d020106082a8648ce3d030107034200
      // Followed by the uncompressed public key (04 || x || y)
      const publicKeyBytes = new Uint8Array(publicKeyDer);
      
      // Find the start of the actual key data (after the DER header)
      // For P-256, the uncompressed key is 65 bytes: 04 || x (32 bytes) || y (32 bytes)
      let keyStart = publicKeyBytes.findIndex((b, i, arr) => 
        b === 0x04 && arr.length - i >= 65
      );
      
      if (keyStart === -1) {
        throw new Error('Could not find public key in DER encoding');
      }

      const x = publicKeyBytes.slice(keyStart + 1, keyStart + 33);
      const y = publicKeyBytes.slice(keyStart + 33, keyStart + 65);
      
      // Create compressed public key (02/03 prefix + x coordinate)
      // If y is even, prefix is 02; if odd, prefix is 03
      const prefix = (y[31] & 1) === 0 ? 0x02 : 0x03;
      const compressedKey = new Uint8Array(33);
      compressedKey[0] = prefix;
      compressedKey.set(x, 1);

      setPasskey({
        id: credential.id,
        publicKey: compressedKey,
      });

      setStatusMessage('Passkey created! Now registering on-chain...');

      // Register the passkey on-chain
      await registerPasskeyOnChain(compressedKey);

    } catch (error: any) {
      console.error('Passkey registration error:', error);
      setStatus('error');
      setStatusMessage(`Failed to create passkey: ${error.message}`);
    }
  }, [userAddress]);

  // Register passkey public key on the Stacks blockchain
  const registerPasskeyOnChain = useCallback(async (publicKey: Uint8Array) => {
    try {
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'register-passkey',
        functionArgs: [
          bufferCV(publicKey),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data: FinishedTxData) => {
          setTxId(data.txId);
          setIsPasskeyRegistered(true);
          setStatus('idle');
          setStatusMessage('Passkey registered successfully!');
        },
        onCancel: () => {
          setStatus('idle');
          setStatusMessage('Registration cancelled');
        },
      });
    } catch (error: any) {
      setStatus('error');
      setStatusMessage(`Registration failed: ${error.message}`);
    }
  }, []);

  // Sign a message using the passkey (WebAuthn)
  const signWithPasskey = useCallback(async (message: Uint8Array): Promise<{ signature: Uint8Array; messageHash: Uint8Array }> => {
    if (!passkey) {
      throw new Error('No passkey registered');
    }

    // Create the message hash (SHA-256)
    const messageHash = new Uint8Array(await crypto.subtle.digest('SHA-256', message.buffer as ArrayBuffer));

    // Request signature from the authenticator
    const assertionOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: messageHash,
        allowCredentials: [{
          id: Uint8Array.from(atob(passkey.id.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          type: 'public-key',
        }],
        userVerification: 'required',
        timeout: 60000,
      },
    };

    const assertion = await navigator.credentials.get(assertionOptions) as PublicKeyCredential;
    
    if (!assertion) {
      throw new Error('Failed to get assertion');
    }

    const response = assertion.response as AuthenticatorAssertionResponse;
    
    // The signature is in DER format, we need to convert to compact (r || s)
    const signatureDer = new Uint8Array(response.signature);
    const compactSignature = derToCompact(signatureDer);

    return {
      signature: compactSignature,
      messageHash,
    };
  }, [passkey]);

  // Convert DER signature to raw format (64 bytes: r || s)
  function derToCompact(der: Uint8Array): Uint8Array {
    // DER format: 0x30 [total-length] 0x02 [r-length] [r] 0x02 [s-length] [s]
    let offset = 2; // Skip 0x30 and length byte

    // Read r
    if (der[offset] !== 0x02) throw new Error('Invalid DER signature');
    offset++;
    const rLength = der[offset];
    offset++;
    let r = der.slice(offset, offset + rLength);
    offset += rLength;

    // Read s
    if (der[offset] !== 0x02) throw new Error('Invalid DER signature');
    offset++;
    const sLength = der[offset];
    offset++;
    let s = der.slice(offset, offset + sLength);

    // Remove leading zeros and pad to 32 bytes each
    r = padTo32Bytes(r);
    s = padTo32Bytes(s);

    // Concatenate r || s = 64 bytes (no recovery byte needed for secp256r1)
    const compact = new Uint8Array(64);
    compact.set(r, 0);
    compact.set(s, 32);

    return compact;
  }

  function padTo32Bytes(arr: Uint8Array): Uint8Array<ArrayBuffer> {
    // Remove leading zero if present (DER adds it for negative numbers)
    let result = arr;
    if (result.length === 33 && result[0] === 0) {
      result = result.slice(1);
    }
    // Pad to 32 bytes
    if (result.length < 32) {
      const padded = new Uint8Array(32);
      padded.set(result, 32 - result.length);
      return padded as Uint8Array<ArrayBuffer>;
    }
    return result.slice(0, 32) as Uint8Array<ArrayBuffer>;
  }

  // Mint NFT with passkey signature
  const mintWithPasskey = useCallback(async () => {
    if (!passkey || !isPasskeyRegistered) {
      setStatusMessage('Please register a passkey first');
      return;
    }

    setStatus('signing');
    setStatusMessage('Requesting Face ID/Touch ID signature...');

    try {
      // Create the mint message (includes timestamp for uniqueness)
      const mintMessage = new TextEncoder().encode(
        `mint-nft:${userAddress}:${Date.now()}`
      );

      // Sign with passkey
      const { signature, messageHash } = await signWithPasskey(mintMessage);

      setStatus('minting');
      setStatusMessage('Submitting mint transaction...');

      // Call the contract
      await openContractCall({
        network,
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'mint-with-passkey',
        functionArgs: [
          bufferCV(messageHash),
          bufferCV(signature),
        ],
        postConditionMode: PostConditionMode.Deny,
        postConditions: [],
        onFinish: (data: FinishedTxData) => {
          setTxId(data.txId);
          setTokenId((prev) => (prev || 0) + 1);
          setStatus('success');
          setStatusMessage('NFT minted successfully!');
        },
        onCancel: () => {
          setStatus('idle');
          setStatusMessage('Minting cancelled');
        },
      });
    } catch (error: any) {
      console.error('Mint error:', error);
      setStatus('error');
      setStatusMessage(`Minting failed: ${error.message}`);
    }
  }, [passkey, isPasskeyRegistered, userAddress, signWithPasskey]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-stacks/20 to-bitcoin/20 border border-white/10 mb-4">
            <span className="text-sm font-medium">⚡ Clarity 4 on Stacks</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-orange-200 bg-clip-text text-transparent">
            Passkey NFT Vault
          </h1>
          <p className="text-gray-400 text-lg">
            Mint NFTs with Face ID/Touch ID using native P-256 signatures
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-8 mb-6">
          {/* Status indicator */}
          {statusMessage && (
            <div className={`mb-6 p-4 rounded-xl text-center ${
              status === 'error' ? 'bg-red-500/20 text-red-300' :
              status === 'success' ? 'bg-green-500/20 text-green-300' :
              'bg-blue-500/20 text-blue-300'
            }`}>
              {statusMessage}
            </div>
          )}

          {/* Connection status */}
          {!isConnected ? (
            <div className="space-y-3">
              <button
                onClick={connectWallet}
                disabled={status === 'connecting'}
                className="w-full py-4 px-6 rounded-2xl font-semibold text-lg
                  bg-gradient-to-r from-stacks to-purple-600 hover:from-stacks/90 hover:to-purple-500
                  transition-all duration-300 transform hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'connecting' ? 'Connecting...' : 'Connect Stacks Wallet'}
              </button>

              {/* WalletConnect support badge */}
              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Supports: Leather, Xverse, Asigna + <span className="text-stacks font-semibold">WalletConnect</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Connected address */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm text-gray-400">Connected</p>
                  <p className="font-mono text-sm">
                    {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
                  </p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Passkey registration */}
              {!isPasskeyRegistered && !passkey && (
                <button
                  onClick={registerPasskey}
                  disabled={status !== 'idle'}
                  className="w-full py-4 px-6 rounded-2xl font-semibold text-lg
                    bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                    transition-all duration-300 transform hover:scale-[1.02]
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Register Passkey
                  </span>
                </button>
              )}

              {/* Passkey status */}
              {(isPasskeyRegistered || passkey) && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    ✓
                  </div>
                  <div>
                    <p className="font-medium text-green-400">Passkey Registered</p>
                    <p className="text-sm text-gray-400">Ready to mint with biometrics</p>
                  </div>
                </div>
              )}

              {/* Mint button */}
              {isPasskeyRegistered && (
                <button
                  onClick={mintWithPasskey}
                  disabled={status !== 'idle' && status !== 'success'}
                  className="w-full py-6 px-6 rounded-2xl font-bold text-xl
                    bg-gradient-to-r from-bitcoin to-orange-600 hover:from-bitcoin/90 hover:to-orange-500
                    transition-all duration-300 transform hover:scale-[1.02]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    animate-glow"
                >
                  <span className="flex items-center justify-center gap-3">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Mint with Face ID
                  </span>
                </button>
              )}

              {/* Success state */}
              {tokenId && (
                <div className="p-6 rounded-xl bg-gradient-to-br from-stacks/20 to-bitcoin/20 border border-white/10">
                  <p className="text-center text-gray-400 mb-2">Your NFT</p>
                  <p className="text-center text-3xl font-bold mb-4">#{tokenId}</p>
                  {txId && (
                    <a
                      href={`https://explorer.stacks.co/txid/${txId}${isMainnet ? '' : '?chain=testnet'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-sm text-stacks hover:underline"
                    >
                      View on Explorer →
                    </a>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-2xl mb-2">🔐</div>
            <p className="text-xs text-gray-400">secp256r1</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-2xl mb-2">⚡</div>
            <p className="text-xs text-gray-400">Clarity 4</p>
          </div>
          <div className="p-4 rounded-xl bg-white/5">
            <div className="text-2xl mb-2">₿</div>
            <p className="text-xs text-gray-400">Bitcoin L2</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8">
          Built for Stacks Builder Challenge Week 1
        </p>
      </div>
    </main>
  );
}
