import { createCanvas } from 'canvas';
import { Card } from '../games/blackjack/deck.js';
import { drawCard, drawCardBack, CARD_WIDTH, CARD_HEIGHT } from './cardDrawer.js';

export async function generateSkinPreview(skinName: string, skinColor: string, style: string = 'classic'): Promise<Buffer> {
  const width = 400;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#1a1a1a');
  grad.addColorStop(1, '#000000');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Preview: ${skinName}`, width / 2, 35);

  // Draw Card Back
  drawCardBack(ctx, 60, 60, 0, skinColor, style);

  // Draw Card Front (Ace of Spades)
  const aceSpades: Card = { suit: 'spades', rank: 'A', value: 11 };
  drawCard(ctx, aceSpades, 230, 60, 0, style);

  return canvas.toBuffer('image/png');
}

export async function generateTablePreview(tableName: string, tableColor: string): Promise<Buffer> {
  const width = 400;
  const height = 250;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // 1. Background with Radial Gradient for lighting
  const radialGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
  radialGrad.addColorStop(0, tableColor);
  // Darken the color for the edges
  const darkenColor = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
  };
  radialGrad.addColorStop(1, darkenColor(tableColor));
  
  ctx.fillStyle = radialGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Felt pattern (Suits)
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  const symbols = ['♠', '♥', '♦', '♣'];
  let sIdx = 0;
  for (let y = 20; y < height; y += 50) {
    for (let x = 20; x < width; x += 50) {
      ctx.fillText(symbols[sIdx % 4], x, y);
      sIdx++;
    }
    sIdx++;
  }
  ctx.restore();

  // 3. Realistic Frame (Wood/Gold)
  const frameWidth = 15;
  // Outer frame (Dark wood)
  ctx.fillStyle = '#3d2b1f';
  ctx.fillRect(0, 0, width, frameWidth); // Top
  ctx.fillRect(0, height - frameWidth, width, frameWidth); // Bottom
  ctx.fillRect(0, 0, frameWidth, height); // Left
  ctx.fillRect(width - frameWidth, 0, frameWidth, height); // Right

  // Inner gold trim
  ctx.strokeStyle = '#e6c27a';
  ctx.lineWidth = 2;
  ctx.strokeRect(frameWidth - 2, frameWidth - 2, width - (frameWidth * 2) + 4, height - (frameWidth * 2) + 4);

  // 4. Title with shadow and better font
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px "Georgia", serif';
  ctx.textAlign = 'center';
  ctx.fillText(tableName, width / 2, 60);
  
  ctx.shadowBlur = 0;
  ctx.font = 'italic 14px Arial';
  ctx.fillStyle = '#e6c27a';
  ctx.fillText('Visual de Mesa Premium', width / 2, 85);
  ctx.restore();

  // 5. Draw a sample card on the table
  const sampleCard: Card = { suit: 'hearts', rank: 'K', value: 10 };
  ctx.save();
  ctx.translate(width / 2 - 45, 110);
  ctx.scale(0.8, 0.8);
  drawCard(ctx, sampleCard, 0, 0, 0, 'classic');
  ctx.restore();

  return canvas.toBuffer('image/png');
}
