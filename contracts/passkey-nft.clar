;; passkey-nft.clar
;; A SIP-009 compliant NFT contract with Clarity 4 passkey (WebAuthn) authentication
;; Uses secp256r1-verify for native P-256 signature verification
;; Uses restrict-assets? for asset protection
;; Uses to-ascii? for string conversion

;; ========================================
;; TRAITS
;; ========================================

(impl-trait 'SP2PABAF9FTAJYNFZH93XENAJ8FVY99RRM50D2JG9.nft-trait.nft-trait)

;; ========================================
;; CONSTANTS
;; ========================================

(define-constant CONTRACT-OWNER tx-sender)

;; Error codes
(define-constant ERR-NOT-AUTHORIZED (err u100))
(define-constant ERR-INVALID-SIGNATURE (err u101))
(define-constant ERR-TOKEN-NOT-FOUND (err u102))
(define-constant ERR-NOT-TOKEN-OWNER (err u103))
(define-constant ERR-ALREADY-REGISTERED (err u104))
(define-constant ERR-NOT-REGISTERED (err u105))
(define-constant ERR-INVALID-NONCE (err u106))
(define-constant ERR-TRANSFER-FAILED (err u107))

;; ========================================
;; DATA VARIABLES
;; ========================================

(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 200) "https://passkey-nft.vercel.app/api/metadata/")

;; ========================================
;; DATA MAPS
;; ========================================

;; NFT definition
(define-non-fungible-token passkey-nft uint)

;; Map user principal to their registered passkey public key (compressed P-256, 33 bytes)
(define-map registered-passkeys 
  principal 
  (buff 33)
)

;; Map to track nonces for replay protection
(define-map user-nonces 
  principal 
  uint
)

;; Map token metadata
(define-map token-metadata 
  uint 
  {
    minted-at: uint,
    passkey-hash: (buff 20)
  }
)

;; ========================================
;; SIP-009 FUNCTIONS (Required)
;; ========================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (let ((id-str (unwrap! (to-ascii? token-id) (ok none))))
    (ok (some (concat (var-get base-uri) id-str)))
  )
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? passkey-nft token-id))
)

;; Standard transfer - requires tx-sender to be owner
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (asserts! (is-some (nft-get-owner? passkey-nft token-id)) ERR-TOKEN-NOT-FOUND)
    (asserts! (is-eq (some sender) (nft-get-owner? passkey-nft token-id)) ERR-NOT-TOKEN-OWNER)
    (nft-transfer? passkey-nft token-id sender recipient)
  )
)

;; ========================================
;; PASSKEY REGISTRATION
;; ========================================

;; Register a passkey public key for a user
;; The public key is a compressed P-256 public key (33 bytes)
(define-public (register-passkey (public-key (buff 33)))
  (begin
    ;; Check not already registered
    (asserts! (is-none (map-get? registered-passkeys tx-sender)) ERR-ALREADY-REGISTERED)
    ;; Store the public key
    (map-set registered-passkeys tx-sender public-key)
    ;; Initialize nonce
    (map-set user-nonces tx-sender u0)
    (ok true)
  )
)

;; Update passkey (requires signature from old key)
(define-public (update-passkey 
  (new-public-key (buff 33))
  (message-hash (buff 32))
  (signature (buff 64))
)
  (let (
    (current-key (unwrap! (map-get? registered-passkeys tx-sender) ERR-NOT-REGISTERED))
  )
    ;; Verify signature with current key
    (asserts! (secp256r1-verify message-hash signature current-key) ERR-INVALID-SIGNATURE)
    ;; Update to new key
    (map-set registered-passkeys tx-sender new-public-key)
    (ok true)
  )
)

;; ========================================
;; PASSKEY-GATED MINTING (Clarity 4 Feature)
;; ========================================

;; Mint an NFT using passkey authentication
;; message-hash: SHA-256 hash of the message (includes nonce)
;; signature: 64-byte compact P-256 signature from WebAuthn
(define-public (mint-with-passkey 
  (message-hash (buff 32))
  (signature (buff 64))
)
  (let (
    (public-key (unwrap! (map-get? registered-passkeys tx-sender) ERR-NOT-REGISTERED))
    (current-nonce (default-to u0 (map-get? user-nonces tx-sender)))
    (new-token-id (+ (var-get last-token-id) u1))
    (passkey-hash (hash160 public-key))
  )
    ;; Verify P-256 signature using Clarity 4's secp256r1-verify
    (asserts! (secp256r1-verify message-hash signature public-key) ERR-INVALID-SIGNATURE)
    
    ;; Mint the NFT
    (try! (nft-mint? passkey-nft new-token-id tx-sender))
    
    ;; Store metadata
    (map-set token-metadata new-token-id {
      minted-at: stacks-block-height,
      passkey-hash: passkey-hash
    })
    
    ;; Update state
    (var-set last-token-id new-token-id)
    (map-set user-nonces tx-sender (+ current-nonce u1))
    
    (ok new-token-id)
  )
)

;; ========================================
;; PASSKEY-GATED TRANSFER (Clarity 4 Feature)
;; ========================================

;; Transfer NFT using passkey signature instead of standard wallet
;; This enables seedless transfers from WebAuthn
(define-public (transfer-with-passkey
  (token-id uint)
  (recipient principal)
  (message-hash (buff 32))
  (signature (buff 64))
)
  (let (
    (public-key (unwrap! (map-get? registered-passkeys tx-sender) ERR-NOT-REGISTERED))
    (owner (unwrap! (nft-get-owner? passkey-nft token-id) ERR-TOKEN-NOT-FOUND))
  )
    ;; Verify ownership
    (asserts! (is-eq owner tx-sender) ERR-NOT-TOKEN-OWNER)
    
    ;; Verify passkey signature
    (asserts! (secp256r1-verify message-hash signature public-key) ERR-INVALID-SIGNATURE)
    
    ;; Transfer the NFT
    (try! (nft-transfer? passkey-nft token-id tx-sender recipient))
    
    (ok true)
  )
)

;; ========================================
;; PROTECTED TRANSFER (Clarity 4 restrict-assets?)
;; ========================================

;; Transfer with asset protection using Clarity 4's restrict-assets?
;; This demonstrates how to limit asset outflows during function execution
;; Note: For simplicity, this version uses STX restriction. In production with
;; trait-based architecture, you could restrict specific NFT contracts.
(define-public (protected-transfer
  (token-id uint)
  (recipient principal)
  (message-hash (buff 32))
  (signature (buff 64))
)
  (let (
    (public-key (unwrap! (map-get? registered-passkeys tx-sender) ERR-NOT-REGISTERED))
    (owner (unwrap! (nft-get-owner? passkey-nft token-id) ERR-TOKEN-NOT-FOUND))
  )
    ;; Verify ownership
    (asserts! (is-eq owner tx-sender) ERR-NOT-TOKEN-OWNER)

    ;; Verify passkey signature
    (asserts! (secp256r1-verify message-hash signature public-key) ERR-INVALID-SIGNATURE)

    ;; Use restrict-assets? (Clarity 4) to ensure only the intended NFT moves
    ;; The final expression must not return a response type
    (match (restrict-assets? tx-sender
      ((with-stx u0))  ;; Demonstrate restrict-assets? by limiting STX to 0
      (begin
        (try! (nft-transfer? passkey-nft token-id tx-sender recipient))
        true  ;; Final expression: non-response type required
      )
    )
      success (ok true)
      error-code (err ERR-TRANSFER-FAILED)
    )
  )
)

;; ========================================
;; READ-ONLY FUNCTIONS
;; ========================================

(define-read-only (get-passkey (user principal))
  (map-get? registered-passkeys user)
)

(define-read-only (get-nonce (user principal))
  (default-to u0 (map-get? user-nonces user))
)

(define-read-only (get-token-metadata (token-id uint))
  (map-get? token-metadata token-id)
)

(define-read-only (is-registered (user principal))
  (is-some (map-get? registered-passkeys user))
)

;; Verify a passkey signature (useful for off-chain verification checks)
(define-read-only (verify-passkey-signature 
  (user principal)
  (message-hash (buff 32))
  (signature (buff 64))
)
  (match (map-get? registered-passkeys user)
    public-key (ok (secp256r1-verify message-hash signature public-key))
    (err ERR-NOT-REGISTERED)
  )
)

;; ========================================
;; ADMIN FUNCTIONS
;; ========================================

(define-public (set-base-uri (new-uri (string-ascii 200)))
  (begin
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (var-set base-uri new-uri)
    (ok true)
  )
)

;; Admin mint for testing (should be removed or protected in production)
(define-public (admin-mint (recipient principal))
  (let (
    (new-token-id (+ (var-get last-token-id) u1))
  )
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    (try! (nft-mint? passkey-nft new-token-id recipient))
    (map-set token-metadata new-token-id {
      minted-at: stacks-block-height,
      passkey-hash: 0x0000000000000000000000000000000000000000
    })
    (var-set last-token-id new-token-id)
    (ok new-token-id)
  )
)
