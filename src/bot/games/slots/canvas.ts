import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣'];

function drawSymbol(ctx: any, symbol: string, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  if (symbol === '🍒') {
    // Cherry
    ctx.fillStyle = '#ff0000';
    ctx.beginPath();
    ctx.arc(-10, 10, 12, 0, Math.PI * 2);
    ctx.arc(15, 10, 12, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#00aa00';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, 10);
    ctx.quadraticCurveTo(0, -15, 5, -20);
    ctx.moveTo(15, 10);
    ctx.quadraticCurveTo(5, -15, 5, -20);
    ctx.stroke();
  } else if (symbol === '🍋') {
    // Lemon
    ctx.fillStyle = '#ffee00';
    ctx.beginPath();
    ctx.ellipse(0, 0, 20, 15, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
  } else if (symbol === '🔔') {
    // Bell
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(0, -5, 12, Math.PI, 0);
    ctx.lineTo(20, 15);
    ctx.lineTo(-20, 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#b8860b';
    ctx.beginPath();
    ctx.arc(0, 15, 6, 0, Math.PI * 2);
    ctx.fill();
  } else if (symbol === '💎') {
    // Diamond
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(20, 0);
    ctx.lineTo(0, 25);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = '#008888';
    ctx.lineWidth = 2;
    ctx.stroke();
  } else if (symbol === '7️⃣') {
    // Seven
    ctx.fillStyle = '#ff0000';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('7', 0, 5);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeText('7', 0, 5);
  }

  ctx.restore();
}

export async function generateSlotsGif(finalGrid: string[][], winningLines: number[]): Promise<Buffer> {
  const width = 340;
  const height = 340;
  const slotSize = 100;
  const offsetX = 20;
  const offsetY = 20;
  
  const encoder = new GIFEncoder(width, height);
  encoder.start();
  encoder.setRepeat(-1); // No repeat
  encoder.setDelay(50); // 50ms per frame
  encoder.setQuality(10);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  const totalFrames = 40;
  
  // Create a long strip of symbols for each column to simulate spinning
  const stripLength = 20;
  const strips: string[][] = [[], [], []];
  
  for (let col = 0; col < 3; col++) {
    for (let i = 0; i < stripLength - 3; i++) {
      strips[col].push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    // The last 3 symbols in the strip are the final result
    strips[col].push(finalGrid[0][col], finalGrid[1][col], finalGrid[2][col]);
  }
  
  // Easing function for spin
  const easeOutCubic = (x: number): number => 1 - Math.pow(1 - x, 3);
  
  for (let frame = 0; frame < totalFrames; frame++) {
    // Background (Machine Casing)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, width, height);

    // Machine Border
    ctx.strokeStyle = '#f1c40f';
    ctx.lineWidth = 10;
    ctx.strokeRect(5, 5, width - 10, height - 10);

    // Inner shadow/background for slots
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(offsetX, offsetY, 300, 300);

    // Grid lines
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 4;
    for (let i = 1; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(offsetX, offsetY + i * slotSize);
      ctx.lineTo(offsetX + 300, offsetY + i * slotSize);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(offsetX + i * slotSize, offsetY);
      ctx.lineTo(offsetX + i * slotSize, offsetY + 300);
      ctx.stroke();
    }
    
    // Draw symbols for each column
    for (let col = 0; col < 3; col++) {
      // Stagger the stopping of reels
      // Col 0 stops at frame 20, Col 1 at 30, Col 2 at 40
      const stopFrame = 20 + (col * 10);
      let progress = Math.min(frame / stopFrame, 1);
      const easedProgress = easeOutCubic(progress);
      
      // Total distance to move is (stripLength - 3) * slotSize
      const totalDistance = (stripLength - 3) * slotSize;
      const currentYOffset = totalDistance * easedProgress;
      
      // Draw the visible symbols for this column
      ctx.save();
      ctx.beginPath();
      ctx.rect(offsetX + col * slotSize, offsetY, slotSize, 300);
      ctx.clip();
      
      for (let i = 0; i < stripLength; i++) {
        const symbol = strips[col][i];
        // Calculate Y position based on offset
        // We start drawing from the bottom (final result) and move up
        const yPos = (i * slotSize) - currentYOffset;
        
        // Only draw if it's visible on screen
        if (yPos > -slotSize && yPos < 300 + slotSize) {
          drawSymbol(ctx, symbol, offsetX + col * slotSize + slotSize / 2, offsetY + yPos + slotSize / 2);
        }
      }
      ctx.restore();
    }
    
    // Draw paylines at the end
    if (frame === totalFrames - 1) {
      ctx.strokeStyle = '#e74c3c';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      
      winningLines.forEach(lineIdx => {
        ctx.beginPath();
        if (lineIdx === 0) { // Top
          ctx.moveTo(offsetX, offsetY + 50);
          ctx.lineTo(offsetX + 300, offsetY + 50);
        } else if (lineIdx === 1) { // Middle
          ctx.moveTo(offsetX, offsetY + 150);
          ctx.lineTo(offsetX + 300, offsetY + 150);
        } else if (lineIdx === 2) { // Bottom
          ctx.moveTo(offsetX, offsetY + 250);
          ctx.lineTo(offsetX + 300, offsetY + 250);
        } else if (lineIdx === 3) { // Diag 1
          ctx.moveTo(offsetX, offsetY);
          ctx.lineTo(offsetX + 300, offsetY + 300);
        } else if (lineIdx === 4) { // Diag 2
          ctx.moveTo(offsetX, offsetY + 300);
          ctx.lineTo(offsetX + 300, offsetY);
        }
        ctx.stroke();
      });
    }
    
    encoder.addFrame(ctx as any);
  }
  
  // Add a few extra frames at the end to show the result clearly
  for(let i = 0; i < 15; i++) {
      encoder.addFrame(ctx as any);
  }
  
  encoder.finish();
  return encoder.out.getData();
}
