import { CanvasRenderingContext2D } from 'canvas';
import { Card } from '../games/blackjack/deck.js';

export const CARD_WIDTH = 110;
export const CARD_HEIGHT = 160;

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
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

export function drawCard(ctx: CanvasRenderingContext2D, card: Card, x: number, y: number, angle: number = 0, style: string = 'classic', width: number = CARD_WIDTH, height: number = CARD_HEIGHT) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  const drawX = -width / 2;
  const drawY = -height / 2;

  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  let mainColor = isRed ? '#d32f2f' : '#111111';
  let bgColor = '#ffffff';
  let borderColor = '#dddddd';

  if (style === 'vintage') {
    bgColor = '#f5f5dc';
    borderColor = '#d2b48c';
  } else if (style === 'minimalist') {
    borderColor = '#eeeeee';
  } else if (style === 'occult') {
    bgColor = '#f0f0f0';
    mainColor = isRed ? '#800000' : '#1a1a1a';
  }

  // Shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 4;

  // Card Body
  ctx.fillStyle = bgColor;
  roundRect(ctx, drawX, drawY, width, height, 6);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Border
  ctx.strokeStyle = borderColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = mainColor;

  const symbols: Record<string, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  const symbol = symbols[card.suit];

  // Corner Rank and Symbol
  const fontSize = Math.floor(width * 0.2);
  ctx.font = `bold ${fontSize}px "Arial", sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText(card.rank, drawX + width * 0.18, drawY + height * 0.175);
  ctx.font = `bold ${Math.floor(fontSize * 0.8)}px Arial`;
  ctx.fillText(symbol, drawX + width * 0.18, drawY + height * 0.3);

  ctx.save();
  ctx.translate(drawX + width - width * 0.18, drawY + height - height * 0.175);
  ctx.rotate(Math.PI);
  ctx.font = `bold ${fontSize}px "Arial", sans-serif`;
  ctx.fillText(card.rank, 0, 0);
  ctx.font = `bold ${Math.floor(fontSize * 0.8)}px Arial`;
  ctx.fillText(symbol, 0, height * 0.125);
  ctx.restore();

  // Center Content based on style
  if (style === 'hearts' && card.suit === 'hearts') {
    drawLargeSymbol(ctx, symbol, drawX, drawY, '#ff0000', width, height);
  } else if (style === 'clubs' && card.suit === 'clubs') {
    drawLargeSymbol(ctx, symbol, drawX, drawY, '#000000', width, height);
  } else if (style === 'diamonds' && card.suit === 'diamonds') {
    drawLargeSymbol(ctx, symbol, drawX, drawY, '#ff4500', width, height);
  } else if (style === 'artdeco') {
    drawArtDecoFront(ctx, symbol, card.rank, drawX, drawY, mainColor, width, height);
  } else if (style === 'vintage') {
    drawVintageFront(ctx, symbol, card.rank, drawX, drawY, mainColor, width, height);
  } else if (style === 'occult') {
    drawOccultFront(ctx, symbol, card.rank, drawX, drawY, mainColor, width, height);
  } else if (style === 'king_spades' && card.rank === 'K' && card.suit === 'spades') {
    drawSpecialRank(ctx, 'K', drawX, drawY, width, height);
  } else if (style === 'queen_hearts' && card.rank === 'Q' && card.suit === 'hearts') {
    drawSpecialRank(ctx, 'Q', drawX, drawY, width, height);
  } else if (style === 'joker') {
    drawSpecialRank(ctx, '★', drawX, drawY, width, height);
  } else if (style === 'jack_diamonds' && card.rank === 'J' && card.suit === 'diamonds') {
    drawSpecialRank(ctx, 'J', drawX, drawY, width, height);
  } else {
    // Default center symbol
    ctx.font = `bold ${Math.floor(width * 0.55)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, drawX + width / 2, drawY + height / 2);
  }

  ctx.restore();
}

function drawLargeSymbol(ctx: CanvasRenderingContext2D, symbol: string, drawX: number, drawY: number, color: string, width: number, height: number) {
  ctx.fillStyle = color;
  ctx.font = `bold ${Math.floor(width * 0.7)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, drawX + width / 2, drawY + height / 2);
}

function drawSpecialRank(ctx: CanvasRenderingContext2D, emoji: string, drawX: number, drawY: number, width: number, height: number) {
  ctx.font = `${Math.floor(width * 0.55)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(emoji, drawX + width / 2, drawY + height / 2);
}

function drawArtDecoFront(ctx: CanvasRenderingContext2D, symbol: string, rank: string, drawX: number, drawY: number, color: string, width: number, height: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(drawX + 10, drawY + 10, width - 20, height - 20);
  ctx.strokeRect(drawX + 15, drawY + 15, width - 30, height - 30);
  
  ctx.font = `bold ${Math.floor(width * 0.45)}px "Georgia", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, drawX + width / 2, drawY + height / 2);
}

function drawVintageFront(ctx: CanvasRenderingContext2D, symbol: string, rank: string, drawX: number, drawY: number, color: string, width: number, height: number) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.font = `bold ${Math.floor(width * 0.55)}px "Times New Roman", serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, drawX + width / 2, drawY + height / 2);
  
  // Add some "dirt"
  ctx.fillStyle = 'rgba(139, 69, 19, 0.1)';
  for(let i=0; i<20; i++) {
    ctx.beginPath();
    ctx.arc(drawX + Math.random()*width, drawY + Math.random()*height, Math.random()*3, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.restore();
}

function drawOccultFront(ctx: CanvasRenderingContext2D, symbol: string, rank: string, drawX: number, drawY: number, color: string, width: number, height: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(drawX + width/2, drawY + height/2, Math.floor(width * 0.35), 0, Math.PI*2);
  ctx.stroke();
  
  ctx.beginPath();
  ctx.moveTo(drawX + width/2, drawY + height/2 - Math.floor(width * 0.35));
  ctx.lineTo(drawX + width/2 + Math.floor(width * 0.32), drawY + height/2 + Math.floor(width * 0.18));
  ctx.lineTo(drawX + width/2 - Math.floor(width * 0.32), drawY + height/2 + Math.floor(width * 0.18));
  ctx.closePath();
  ctx.stroke();

  ctx.font = `bold ${Math.floor(width * 0.27)}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(symbol, drawX + width / 2, drawY + height / 2);
}

export function drawCardBack(ctx: CanvasRenderingContext2D, x: number, y: number, angle: number = 0, skinColor: string = '#b71c1c', style: string = 'classic', width: number = CARD_WIDTH, height: number = CARD_HEIGHT) {
  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.rotate(angle);
  const drawX = -width / 2;
  const drawY = -height / 2;

  // Drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;

  // White border
  ctx.fillStyle = '#ffffff';
  roundRect(ctx, drawX, drawY, width, height, 8);
  ctx.fill();
  
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Inner pattern fill
  ctx.fillStyle = skinColor; 
  if (style === 'minimalist') ctx.fillStyle = '#f0f0f0';
  if (style === 'vintage') ctx.fillStyle = '#d2b48c';
  if (style === 'occult') ctx.fillStyle = '#1a1a1a';

  roundRect(ctx, drawX + 6, drawY + 6, width - 12, height - 12, 6);
  ctx.fill();

  // Pattern based on style
  if (style === 'minimalist') {
    // No pattern
  } else if (style === 'artdeco') {
    drawArtDecoPattern(ctx, drawX, drawY, skinColor, width, height);
  } else if (style === 'occult') {
    drawOccultPattern(ctx, drawX, drawY, width, height);
  } else if (style === 'vintage') {
    drawVintagePattern(ctx, drawX, drawY, width, height);
  } else {
    // Default pattern
    drawDefaultPattern(ctx, drawX, drawY, width, height);
  }

  // Center logo
  const iconSize = Math.floor(width * 0.27);
  if (style === 'hearts') drawCenterIcon(ctx, '♥', '#ffffff', iconSize);
  else if (style === 'clubs') drawCenterIcon(ctx, '♣', '#ffffff', iconSize);
  else if (style === 'diamonds') drawCenterIcon(ctx, '♦', '#ffffff', iconSize);
  else if (style === 'occult') drawCenterIcon(ctx, '◎', '#ffffff', iconSize);
  else if (style === 'joker') drawCenterIcon(ctx, '★', '#ffffff', iconSize);
  else if (style === 'minimalist') drawCenterIcon(ctx, '♠', '#333333', iconSize);
  else drawCenterIcon(ctx, '♠', '#ffffff', iconSize);

  ctx.restore();
}

function drawDefaultPattern(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
  ctx.lineWidth = 1;
  for (let i = -height; i < width + height; i += 12) {
    ctx.beginPath();
    ctx.moveTo(drawX + i, drawY + 6);
    ctx.lineTo(drawX + i - height, drawY + height - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(drawX + i, drawY + 6);
    ctx.lineTo(drawX + i + height, drawY + height - 6);
    ctx.stroke();
  }
}

function drawArtDecoPattern(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, color: string, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  for (let i = 10; i < width - 10; i += 15) {
    ctx.strokeRect(drawX + i, drawY + 10, 10, height - 20);
  }
}

function drawOccultPattern(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, width: number, height: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    ctx.beginPath();
    ctx.arc(drawX + Math.random()*width, drawY + Math.random()*height, Math.random()*10, 0, Math.PI*2);
    ctx.stroke();
  }
}

function drawVintagePattern(ctx: CanvasRenderingContext2D, drawX: number, drawY: number, width: number, height: number) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
  for (let i = 0; i < 100; i++) {
    ctx.fillRect(drawX + Math.random()*width, drawY + Math.random()*height, 2, 2);
  }
}

function drawCenterIcon(ctx: CanvasRenderingContext2D, icon: string, color: string, size: number) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.8, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(0,0,0,0.2)';
  ctx.font = `${size}px Arial`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, 0, 0);
}
