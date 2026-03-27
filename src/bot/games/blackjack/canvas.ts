import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import { Card } from './deck.js';

const CARD_WIDTH = 110;
const CARD_HEIGHT = 160;
const PADDING = 15;

export async function generateBlackjackImage(
  playerHand: Card[],
  dealerHand: Card[],
  hideDealerCard: boolean,
  playerValue: number,
  dealerValue: string | number
): Promise<Buffer> {
  const width = 900;
  const height = 600;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Background (Green Felt)
  ctx.fillStyle = '#145c32'; // Base dark green
  ctx.fillRect(0, 0, width, height);

  // Draw subtle felt pattern
  drawFeltPattern(ctx, width, height);

  // 2. Golden Border
  drawGoldenBorder(ctx, width, height);

  // 3. Text and Icons
  ctx.fillStyle = '#e6c27a'; // Gold text
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.font = 'italic bold 32px "Georgia", serif';
  ctx.textAlign = 'center';

  // Dealer Text
  ctx.fillText(`shhhh - Pontos: ${dealerValue}`, width / 2 + 20, 120);
  // Simple dealer icon (a circle with a tie/suit)
  drawDealerIcon(ctx, width / 2 - 160, 110);

  // Player Text
  ctx.fillText(`Você - Pontos: ${playerValue}`, width / 2 + 20, 360);
  // Simple player icon (clover)
  drawCloverIcon(ctx, width / 2 - 150, 350);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 4. Draw Dealer Cards
  const dealerTotalWidth = dealerHand.length * CARD_WIDTH + (dealerHand.length - 1) * PADDING;
  const dealerStartX = (width - dealerTotalWidth) / 2;

  for (let i = 0; i < dealerHand.length; i++) {
    const x = dealerStartX + i * (CARD_WIDTH + PADDING);
    const y = 150;
    // Slight alternating rotation
    const angle = (i % 2 === 0 ? -2 : 2) * (Math.PI / 180);
    
    if (i === 1 && hideDealerCard) {
      drawCardBack(ctx, x, y, angle);
    } else {
      drawCard(ctx, dealerHand[i], x, y, angle);
    }
  }

  // 5. Draw Player Cards
  const playerTotalWidth = playerHand.length * CARD_WIDTH + (playerHand.length - 1) * PADDING;
  const playerStartX = (width - playerTotalWidth) / 2;

  for (let i = 0; i < playerHand.length; i++) {
    const x = playerStartX + i * (CARD_WIDTH + PADDING);
    const y = 390;
    // Slight fan effect
    const angle = ((i - (playerHand.length - 1) / 2) * 3) * (Math.PI / 180);
    drawCard(ctx, playerHand[i], x, y, angle);
  }

  // 6. Draw Chips at the bottom
  drawChips(ctx, width / 2, 570);

  // 7. Draw corner image (shhhh)
  try {
    // Replace this URL with the actual image URL you want to use
    const cornerImageUrl = 'https://cdn.discordapp.com/avatars/1057333777308852226/311df3d7bb8ed36c313aae587af0d68f.png?size=2048'; // shhhh avatar
    const cornerImage = await loadImage(cornerImageUrl);
    
    // Draw in top right corner
    const imgWidth = 120;
    const imgHeight = 120;
    ctx.drawImage(cornerImage, width - imgWidth - 30, 30, imgWidth, imgHeight);
    
    // Optional: Add a subtle border/glow around the image
    ctx.strokeStyle = '#e6c27a';
    ctx.lineWidth = 3;
    ctx.strokeRect(width - imgWidth - 30, 30, imgWidth, imgHeight);
  } catch (err) {
    console.error('Failed to load corner image:', err);
  }

  return canvas.toBuffer('image/png');
}

function drawFeltPattern(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.font = '40px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const symbols = ['♠', '♥', '♦', '♣'];
  let sIdx = 0;

  for (let y = 30; y < height; y += 80) {
    for (let x = 30; x < width; x += 80) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((Math.PI / 4)); // Rotate 45 degrees
      ctx.fillText(symbols[sIdx % 4], 0, 0);
      ctx.restore();
      sIdx++;
    }
    sIdx++; // Shift pattern per row
  }
  ctx.restore();
}

function drawGoldenBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const borderThickness = 40;
  const cornerRadius = 80;

  ctx.save();
  
  // Create gold gradient
  const goldGrad = ctx.createLinearGradient(0, 0, width, height);
  goldGrad.addColorStop(0, '#c59b47');
  goldGrad.addColorStop(0.2, '#fced8e');
  goldGrad.addColorStop(0.5, '#b8862d');
  goldGrad.addColorStop(0.8, '#fced8e');
  goldGrad.addColorStop(1, '#8a611c');

  ctx.fillStyle = goldGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;

  // Draw outer border shape
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, cornerRadius);
  ctx.quadraticCurveTo(0, 0, cornerRadius, 0);
  ctx.lineTo(width - cornerRadius, 0);
  ctx.quadraticCurveTo(width, 0, width, cornerRadius);
  ctx.lineTo(width, height);
  ctx.lineTo(width - borderThickness, height);
  ctx.lineTo(width - borderThickness, cornerRadius);
  ctx.quadraticCurveTo(width - borderThickness, borderThickness, width - cornerRadius, borderThickness);
  ctx.lineTo(cornerRadius, borderThickness);
  ctx.quadraticCurveTo(borderThickness, borderThickness, borderThickness, cornerRadius);
  ctx.lineTo(borderThickness, height);
  ctx.closePath();
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Inner dark lines for detail
  ctx.strokeStyle = 'rgba(60, 40, 10, 0.6)';
  ctx.lineWidth = 2;
  
  // Line 1
  ctx.beginPath();
  ctx.moveTo(10, height);
  ctx.lineTo(10, cornerRadius);
  ctx.quadraticCurveTo(10, 10, cornerRadius, 10);
  ctx.lineTo(width - cornerRadius, 10);
  ctx.quadraticCurveTo(width - 10, 10, width - 10, cornerRadius);
  ctx.lineTo(width - 10, height);
  ctx.stroke();

  // Line 2
  ctx.beginPath();
  ctx.moveTo(30, height);
  ctx.lineTo(30, cornerRadius);
  ctx.quadraticCurveTo(30, 30, cornerRadius, 30);
  ctx.lineTo(width - cornerRadius, 30);
  ctx.quadraticCurveTo(width - 30, 30, width - 30, cornerRadius);
  ctx.lineTo(width - 30, height);
  ctx.stroke();

  // Draw Gems
  const gemPositions = [
    { x: cornerRadius / 2, y: cornerRadius / 2 },
    { x: width / 2, y: borderThickness / 2 },
    { x: width - cornerRadius / 2, y: cornerRadius / 2 },
    { x: borderThickness / 2, y: height / 2 },
    { x: width - borderThickness / 2, y: height / 2 },
  ];

  for (const pos of gemPositions) {
    drawGem(ctx, pos.x, pos.y);
  }

  ctx.restore();
}

function drawGem(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const radius = 8;
  
  // Gem shadow
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.arc(x + 2, y + 2, radius, 0, Math.PI * 2);
  ctx.fill();

  // Gem base (Dark Green)
  ctx.fillStyle = '#005522';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Gem highlight (Light Green)
  const highlightGrad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, radius);
  highlightGrad.addColorStop(0, '#55ff88');
  highlightGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = highlightGrad;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();

  // Gold rim
  ctx.strokeStyle = '#fced8e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function drawDealerIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  ctx.fillStyle = '#e6c27a';
  ctx.beginPath();
  ctx.arc(0, -5, 12, 0, Math.PI * 2); // Head
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(0, 15, 18, Math.PI, 0); // Shoulders
  ctx.fill();

  // Wreath around it
  ctx.strokeStyle = '#e6c27a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 5, 25, Math.PI * 0.7, Math.PI * 2.3);
  ctx.stroke();

  ctx.restore();
}

function drawCloverIcon(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);
  
  ctx.fillStyle = '#e6c27a';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♣', 0, 0);

  // Wreath around it
  ctx.strokeStyle = '#e6c27a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function drawChips(ctx: CanvasRenderingContext2D, x: number, y: number) {
  const drawChip = (cx: number, cy: number, color: string, text: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    
    // Shadow
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    // Outer edge
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 25, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Dashes
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Inner circle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fill();

    // Inner color
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();
  };

  drawChip(x - 30, y, '#2e7d32', 'V');
  drawChip(x + 30, y, '#1565c0', 'V');
  drawChip(x, y - 10, '#b71c1c', '★');
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function drawCard(ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, angle: number = 0) {
  ctx.save();
  // Translate to center of card for rotation
  ctx.translate(x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2);
  ctx.rotate(angle);
  // Translate back to top-left
  const drawX = -CARD_WIDTH / 2;
  const drawY = -CARD_HEIGHT / 2;

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  const mainColor = isRed ? '#d32f2f' : '#111111';

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  // Card background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, drawX, drawY, CARD_WIDTH, CARD_HEIGHT, 6);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Text color
  ctx.fillStyle = mainColor;

  // Suit symbol
  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  const symbol = symbols[card.suit];

  // Top-left rank and suit
  ctx.font = 'bold 22px "Arial", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(card.rank, drawX + 20, drawY + 28);
  ctx.font = 'bold 18px Arial';
  ctx.fillText(symbol, drawX + 20, drawY + 48);

  // Bottom-right rank and suit (inverted)
  ctx.save();
  ctx.translate(drawX + CARD_WIDTH - 20, drawY + CARD_HEIGHT - 28);
  ctx.rotate(Math.PI);
  ctx.font = 'bold 22px "Arial", sans-serif';
  ctx.fillText(card.rank, 0, 0);
  ctx.font = 'bold 18px Arial';
  ctx.fillText(symbol, 0, 20);
  ctx.restore();

  // Center symbols (simplified pattern based on rank)
  drawCenterSymbols(ctx, card.rank, symbol, drawX, drawY, CARD_WIDTH, CARD_HEIGHT);

  ctx.restore();
}

function drawCenterSymbols(ctx: CanvasRenderingContext2D, rank: string, symbol: string, x: number, y: number, w: number, h: number) {
  ctx.font = 'bold 30px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (['J', 'Q', 'K', 'A'].includes(rank)) {
    // Single large symbol for face cards and Ace
    ctx.font = 'bold 60px Arial';
    ctx.fillText(symbol, cx, cy);
  } else {
    // Number cards
    const num = parseInt(rank);
    if (num === 2 || num === 3) {
      ctx.fillText(symbol, cx, cy - 30);
      ctx.fillText(symbol, cx, cy + 30);
      if (num === 3) ctx.fillText(symbol, cx, cy);
    } else if (num >= 4 && num <= 6) {
      ctx.fillText(symbol, cx - 20, cy - 30);
      ctx.fillText(symbol, cx + 20, cy - 30);
      ctx.fillText(symbol, cx - 20, cy + 30);
      ctx.fillText(symbol, cx + 20, cy + 30);
      if (num === 5) ctx.fillText(symbol, cx, cy);
      if (num === 6) {
        ctx.fillText(symbol, cx - 20, cy);
        ctx.fillText(symbol, cx + 20, cy);
      }
    } else {
      // 7 to 10 - just draw a cluster to represent many
      ctx.fillText(symbol, cx - 20, cy - 40);
      ctx.fillText(symbol, cx + 20, cy - 40);
      ctx.fillText(symbol, cx - 20, cy);
      ctx.fillText(symbol, cx + 20, cy);
      ctx.fillText(symbol, cx - 20, cy + 40);
      ctx.fillText(symbol, cx + 20, cy + 40);
      if (num >= 8) ctx.fillText(symbol, cx, cy - 20);
      if (num >= 9) ctx.fillText(symbol, cx, cy + 20);
      if (num === 10) {
        ctx.fillText(symbol, cx, cy - 60);
        ctx.fillText(symbol, cx, cy + 60);
      }
    }
  }
}

function drawCardBack(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number = 0) {
  ctx.save();
  ctx.translate(x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2);
  ctx.rotate(angle);
  const drawX = -CARD_WIDTH / 2;
  const drawY = -CARD_HEIGHT / 2;

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  // White border
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, drawX, drawY, CARD_WIDTH, CARD_HEIGHT, 6);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Inner pattern fill (Red like the image)
  ctx.fillStyle = '#b71c1c'; 
  roundRect(ctx, drawX + 6, drawY + 6, CARD_WIDTH - 12, CARD_HEIGHT - 12, 4);
  ctx.fill();

  // Simple diamond pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  for(let py = drawY + 15; py < drawY + CARD_HEIGHT - 15; py += 20) {
    for(let px = drawX + 15; px < drawX + CARD_WIDTH - 15; px += 20) {
      ctx.beginPath();
      ctx.moveTo(px, py - 5);
      ctx.lineTo(px + 5, py);
      ctx.lineTo(px, py + 5);
      ctx.lineTo(px - 5, py);
      ctx.fill();
    }
  }

  // Center logo
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 25, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = '#b71c1c';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♠', 0, 0);

  ctx.restore();
}
