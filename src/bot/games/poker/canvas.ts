import { createCanvas, CanvasRenderingContext2D, loadImage } from 'canvas';
import { Card } from '../blackjack/deck.js';
import { drawCard as drawCardUtil, drawCardBack as drawCardBackUtil, CARD_WIDTH as DEFAULT_CARD_WIDTH, CARD_HEIGHT as DEFAULT_CARD_HEIGHT, roundRect } from '../../utils/cardDrawer.js';

const CARD_WIDTH = 90;
const CARD_HEIGHT = 130;
const PADDING = 10;

export async function generatePokerImage(
  playerHand: Card[],
  dealerHand: Card[],
  communityCards: Card[],
  hideDealerCard: boolean,
  statusMsg: string,
  ante: number,
  skinColor: string = '#b71c1c',
  tableColor: string = '#145c32',
  style: string = 'classic'
): Promise<Buffer> {
  const width = 900;
  const height = 600;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Background (Felt) with Radial Gradient for lighting
  const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 100, width / 2, height / 2, width * 0.8);
  radialGrad.addColorStop(0, tableColor);
  
  // Darken the color for the edges
  const darkenColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.max(0, r - 50)}, ${Math.max(0, g - 50)}, ${Math.max(0, b - 50)})`;
  };
  radialGrad.addColorStop(1, darkenColor(tableColor));
  
  ctx.fillStyle = radialGrad; 
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
  ctx.font = 'italic bold 28px "Georgia", serif';
  ctx.textAlign = 'center';

  // Dealer Text
  ctx.fillText(`Dealer`, width / 2, 80);

  // Player Text
  ctx.fillText(`Você`, width / 2, 530);

  // Status Text
  ctx.font = 'bold 22px "Arial", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(statusMsg, width / 2, 380);

  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // 4. Draw Dealer Cards
  const dealerTotalWidth = 2 * CARD_WIDTH + PADDING;
  const dealerStartX = (width - dealerTotalWidth) / 2;

  for (let i = 0; i < 2; i++) {
    const x = dealerStartX + i * (CARD_WIDTH + PADDING);
    const y = 100;
    const angle = (i === 0 ? -2 : 2) * (Math.PI / 180);
    
    if (hideDealerCard) {
      drawCardBackUtil(ctx, x, y, angle, skinColor, style, CARD_WIDTH, CARD_HEIGHT);
    } else {
      drawCardUtil(ctx, dealerHand[i], x, y, angle, style, CARD_WIDTH, CARD_HEIGHT);
    }
  }

  // 5. Draw Community Cards
  const maxCommunityCards = 5;
  const commTotalWidth = maxCommunityCards * CARD_WIDTH + (maxCommunityCards - 1) * PADDING;
  const commStartX = (width - commTotalWidth) / 2;

  for (let i = 0; i < maxCommunityCards; i++) {
    const x = commStartX + i * (CARD_WIDTH + PADDING);
    const y = 250;
    
    if (i < communityCards.length) {
      drawCardUtil(ctx, communityCards[i], x, y, 0, style, CARD_WIDTH, CARD_HEIGHT);
    } else {
      // Draw empty slot
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 6);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }

  // 6. Draw Player Cards
  const playerTotalWidth = 2 * CARD_WIDTH + PADDING;
  const playerStartX = (width - playerTotalWidth) / 2;

  for (let i = 0; i < 2; i++) {
    const x = playerStartX + i * (CARD_WIDTH + PADDING);
    const y = 400;
    const angle = (i === 0 ? -3 : 3) * (Math.PI / 180);
    drawCardUtil(ctx, playerHand[i], x, y, angle, style, CARD_WIDTH, CARD_HEIGHT);
  }

  // 7. Draw Chips
  drawChips(ctx, width / 2 - 150, 460, ante);

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
      ctx.rotate((Math.PI / 4));
      ctx.fillText(symbols[sIdx % 4], 0, 0);
      ctx.restore();
      sIdx++;
    }
    sIdx++;
  }
  ctx.restore();
}

function drawGoldenBorder(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const borderThickness = 30;
  const cornerRadius = 60;

  ctx.save();
  
  const goldGrad = ctx.createLinearGradient(0, 0, width, height);
  goldGrad.addColorStop(0, '#c59b47');
  goldGrad.addColorStop(0.2, '#fced8e');
  goldGrad.addColorStop(0.5, '#b8862d');
  goldGrad.addColorStop(0.8, '#fced8e');
  goldGrad.addColorStop(1, '#8a611c');

  ctx.fillStyle = goldGrad;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 5;

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

  ctx.strokeStyle = 'rgba(60, 40, 10, 0.6)';
  ctx.lineWidth = 2;
  
  ctx.beginPath();
  ctx.moveTo(10, height);
  ctx.lineTo(10, cornerRadius);
  ctx.quadraticCurveTo(10, 10, cornerRadius, 10);
  ctx.lineTo(width - cornerRadius, 10);
  ctx.quadraticCurveTo(width - 10, 10, width - 10, cornerRadius);
  ctx.lineTo(width - 10, height);
  ctx.stroke();

  ctx.restore();
}

function drawChips(ctx: CanvasRenderingContext2D, x: number, y: number, amount: number) {
  const drawChip = (cx: number, cy: number, color: string, text: string) => {
    ctx.save();
    ctx.translate(cx, cy);
    
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 5;
    ctx.shadowOffsetY = 3;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  };

  drawChip(x - 20, y, '#2e7d32', '');
  drawChip(x + 20, y, '#1565c0', '');
  drawChip(x, y - 10, '#b71c1c', '');
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Coins: ${amount}`, x, y + 25);
}
