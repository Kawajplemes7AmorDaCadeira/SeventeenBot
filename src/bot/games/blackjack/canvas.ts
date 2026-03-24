import { createCanvas } from 'canvas';
import { Card } from './deck.js';

const CARD_WIDTH = 100;
const CARD_HEIGHT = 140;
const PADDING = 15;

export async function generateBlackjackImage(
  playerHand: Card[],
  dealerHand: Card[],
  hideDealerCard: boolean,
  playerValue: number,
  dealerValue: string | number
): Promise<Buffer> {
  const maxCards = Math.max(playerHand.length, dealerHand.length);
  const width = Math.max(450, maxCards * (CARD_WIDTH + PADDING) + PADDING * 2);
  const height = 450;

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#0f4d29'; // Darker Casino green
  ctx.fillRect(0, 0, width, height);

  // Add a subtle border
  ctx.strokeStyle = '#d4af37'; // Gold border
  ctx.lineWidth = 6;
  ctx.strokeRect(3, 3, width - 6, height - 6);

  // Draw Dealer Hand
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Arial Black", Arial, sans-serif';
  ctx.fillText(`Dealer - Pontos: ${dealerValue}`, PADDING, 40);

  for (let i = 0; i < dealerHand.length; i++) {
    const x = PADDING + i * (CARD_WIDTH + PADDING);
    const y = 60;
    if (i === 1 && hideDealerCard) {
      drawCardBack(ctx, x, y);
    } else {
      drawCard(ctx, dealerHand[i], x, y);
    }
  }

  // Draw Player Hand
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Arial Black", Arial, sans-serif';
  ctx.fillText(`Você - Pontos: ${playerValue}`, PADDING, 260);

  for (let i = 0; i < playerHand.length; i++) {
    const x = PADDING + i * (CARD_WIDTH + PADDING);
    const y = 280;
    drawCard(ctx, playerHand[i], x, y);
  }

  return canvas.toBuffer('image/png');
}

function roundRect(ctx: any, x: number, y: number, width: number, height: number, radius: number) {
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

function drawCard(ctx: any, card: Card, x: number, y: number) {
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  // Card background
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#cccccc';
  ctx.stroke();

  // Text color
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  ctx.fillStyle = isRed ? '#d32f2f' : '#212121';

  // Suit symbol
  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  const symbol = symbols[card.suit];

  ctx.font = 'bold 20px Arial';
  ctx.fillText(card.rank, x + 8, y + 25);
  ctx.font = 'bold 20px Arial';
  ctx.fillText(symbol, x + 8, y + 45);

  // Center symbol
  ctx.font = 'bold 45px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(symbol, x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 15);
  ctx.textAlign = 'left'; // reset
}

function drawCardBack(ctx: any, x: number, y: number) {
  // Shadow
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = '#1565c0';
  roundRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, 10);
  ctx.fill();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.lineWidth = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Pattern
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CASINO', x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 5);
  ctx.textAlign = 'left';
}
