import { NextRequest, NextResponse } from 'next/server';

// Generate cyberpunk-themed SVG for each token
function generateSVG(tokenId: number): string {
  // Generate unique colors based on token ID
  const hue1 = (tokenId * 137) % 360;
  const hue2 = (hue1 + 180) % 360;
  
  // Determine rarity based on token ID
  const rarityNum = tokenId % 100;
  let rarity = 'Common';
  let glowIntensity = '0.3';
  if (rarityNum < 5) {
    rarity = 'Legendary';
    glowIntensity = '0.8';
  } else if (rarityNum < 20) {
    rarity = 'Rare';
    glowIntensity = '0.6';
  } else if (rarityNum < 50) {
    rarity = 'Uncommon';
    glowIntensity = '0.4';
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <defs>
    <linearGradient id="bg${tokenId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1}, 80%, 10%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(${hue2}, 80%, 5%);stop-opacity:1" />
    </linearGradient>
    <linearGradient id="ring${tokenId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:hsl(${hue1}, 100%, 60%);stop-opacity:1" />
      <stop offset="100%" style="stop-color:hsl(${hue2}, 100%, 50%);stop-opacity:1" />
    </linearGradient>
    <filter id="glow${tokenId}">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="400" height="400" fill="url(#bg${tokenId})"/>
  
  <!-- Grid pattern -->
  <g stroke="hsl(${hue1}, 50%, 20%)" stroke-width="0.5" opacity="0.3">
    ${Array.from({length: 20}, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="400"/>`).join('')}
    ${Array.from({length: 20}, (_, i) => `<line x1="0" y1="${i * 20}" x2="400" y2="${i * 20}"/>`).join('')}
  </g>
  
  <!-- Central biometric ring -->
  <g filter="url(#glow${tokenId})">
    <circle cx="200" cy="180" r="80" fill="none" stroke="url(#ring${tokenId})" stroke-width="4" opacity="${glowIntensity}"/>
    <circle cx="200" cy="180" r="60" fill="none" stroke="url(#ring${tokenId})" stroke-width="2" opacity="${glowIntensity}"/>
    <circle cx="200" cy="180" r="40" fill="none" stroke="url(#ring${tokenId})" stroke-width="1" opacity="${glowIntensity}"/>
  </g>
  
  <!-- Fingerprint pattern -->
  <g stroke="hsl(${hue1}, 80%, 60%)" fill="none" stroke-width="1" opacity="0.6">
    <path d="M180 160 Q200 140 220 160 Q240 180 220 200 Q200 220 180 200 Q160 180 180 160" />
    <path d="M185 165 Q200 150 215 165 Q230 180 215 195 Q200 210 185 195 Q170 180 185 165" />
    <path d="M190 170 Q200 160 210 170 Q220 180 210 190 Q200 200 190 190 Q180 180 190 170" />
  </g>
  
  <!-- Passkey icon -->
  <g transform="translate(175, 155)" filter="url(#glow${tokenId})">
    <path d="M25 0 L35 10 L25 20 L15 10 Z" fill="hsl(${hue2}, 100%, 70%)" opacity="0.8"/>
  </g>
  
  <!-- Token ID -->
  <text x="200" y="300" text-anchor="middle" font-family="monospace" font-size="32" font-weight="bold" fill="white">
    #${tokenId}
  </text>
  
  <!-- Title -->
  <text x="200" y="340" text-anchor="middle" font-family="monospace" font-size="14" fill="hsl(${hue1}, 80%, 70%)">
    PASSKEY VAULT
  </text>
  
  <!-- Rarity badge -->
  <rect x="140" y="355" width="120" height="24" rx="12" fill="hsl(${hue2}, 80%, 20%)" stroke="hsl(${hue2}, 100%, 50%)" stroke-width="1"/>
  <text x="200" y="372" text-anchor="middle" font-family="monospace" font-size="12" fill="hsl(${hue2}, 100%, 70%)">
    ${rarity.toUpperCase()}
  </text>
  
  <!-- Corner accents -->
  <g stroke="hsl(${hue1}, 100%, 60%)" stroke-width="2" fill="none">
    <path d="M10 30 L10 10 L30 10"/>
    <path d="M370 10 L390 10 L390 30"/>
    <path d="M390 370 L390 390 L370 390"/>
    <path d="M30 390 L10 390 L10 370"/>
  </g>
  
  <!-- Bitcoin/Stacks indicator -->
  <g transform="translate(360, 360)">
    <circle cx="0" cy="0" r="15" fill="hsl(${hue1}, 80%, 15%)" stroke="hsl(${hue1}, 100%, 50%)" stroke-width="1"/>
    <text x="0" y="5" text-anchor="middle" font-size="14" fill="hsl(${hue1}, 100%, 70%)">₿</text>
  </g>
</svg>`;
}

// Determine rarity from token ID
function getRarity(tokenId: number): string {
  const rarityNum = tokenId % 100;
  if (rarityNum < 5) return 'Legendary';
  if (rarityNum < 20) return 'Rare';
  if (rarityNum < 50) return 'Uncommon';
  return 'Common';
}

export async function GET(
  request: NextRequest,
  { params }: { params: { tokenId: string } }
) {
  const tokenIdStr = params.tokenId.replace('.json', '');
  const tokenId = parseInt(tokenIdStr, 10);

  if (isNaN(tokenId) || tokenId < 1) {
    return NextResponse.json(
      { error: 'Invalid token ID' },
      { status: 400 }
    );
  }

  const svg = generateSVG(tokenId);
  const svgBase64 = Buffer.from(svg).toString('base64');
  const rarity = getRarity(tokenId);

  const metadata = {
    name: `Passkey Vault #${tokenId}`,
    description: `A biometrically-secured NFT minted with Face ID/Touch ID using Clarity 4's native secp256r1 signature verification. This NFT represents ownership authenticated by your device's secure enclave, secured by Bitcoin through Stacks.`,
    image: `data:image/svg+xml;base64,${svgBase64}`,
    external_url: `https://passkey-nft.vercel.app/token/${tokenId}`,
    attributes: [
      {
        trait_type: 'Rarity',
        value: rarity,
      },
      {
        trait_type: 'Authentication',
        value: 'Passkey (WebAuthn)',
      },
      {
        trait_type: 'Signature Curve',
        value: 'secp256r1 (P-256)',
      },
      {
        trait_type: 'Smart Contract',
        value: 'Clarity 4',
      },
      {
        trait_type: 'Network',
        value: 'Stacks (Bitcoin L2)',
      },
      {
        display_type: 'number',
        trait_type: 'Token ID',
        value: tokenId,
      },
    ],
    properties: {
      category: 'authentication',
      creators: [
        {
          address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
          share: 100,
        },
      ],
    },
  };

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
