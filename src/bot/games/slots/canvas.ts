import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣', '💀'];

function drawSymbol(ctx: any, symbol: string, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Add a slight drop shadow for all symbols
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 4;

  if (symbol === '🍒') {
    // Cherry
    // Stems
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-12, 10);
    ctx.quadraticCurveTo(-5, -20, 5, -25);
    ctx.moveTo(15, 8);
    ctx.quadraticCurveTo(8, -20, 5, -25);
    ctx.stroke();
    
    // Leaf
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(12, -22, 10, 5, -Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // Cherries
    const gradient1 = ctx.createRadialGradient(-15, 5, 2, -12, 10, 14);
    gradient1.addColorStop(0, '#ff8a80');
    gradient1.addColorStop(0.3, '#ff5252');
    gradient1.addColorStop(1, '#c62828');
    ctx.fillStyle = gradient1;
    ctx.beginPath();
    ctx.arc(-12, 10, 14, 0, Math.PI * 2);
    ctx.fill();

    const gradient2 = ctx.createRadialGradient(12, 3, 2, 15, 8, 14);
    gradient2.addColorStop(0, '#ff8a80');
    gradient2.addColorStop(0.3, '#ff5252');
    gradient2.addColorStop(1, '#c62828');
    ctx.fillStyle = gradient2;
    ctx.beginPath();
    ctx.arc(15, 8, 14, 0, Math.PI * 2);
    ctx.fill();
    
  } else if (symbol === '🍋') {
    // Lemon
    ctx.rotate(Math.PI / 6);
    const gradient = ctx.createRadialGradient(-5, -5, 5, 0, 0, 25);
    gradient.addColorStop(0, '#fff9c4');
    gradient.addColorStop(0.4, '#ffee58');
    gradient.addColorStop(1, '#fbc02d');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    // Lemon shape
    ctx.moveTo(-25, 0);
    ctx.bezierCurveTo(-25, -20, 25, -20, 25, 0);
    ctx.bezierCurveTo(25, 20, -25, 20, -25, 0);
    ctx.fill();
    
    // Lemon nipples
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.arc(-24, 0, 4, 0, Math.PI * 2);
    ctx.arc(24, 0, 4, 0, Math.PI * 2);
    ctx.fill();

  } else if (symbol === '🔔') {
    // Bell
    const gradient = ctx.createLinearGradient(-20, -20, 20, 20);
    gradient.addColorStop(0, '#fff59d');
    gradient.addColorStop(0.5, '#fbc02d');
    gradient.addColorStop(1, '#f57f17');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(0, -15);
    ctx.bezierCurveTo(15, -15, 15, 5, 22, 15);
    ctx.lineTo(-22, 15);
    ctx.bezierCurveTo(-15, 5, -15, -15, 0, -15);
    ctx.fill();
    
    // Clapper
    ctx.fillStyle = '#e65100';
    ctx.beginPath();
    ctx.arc(0, 15, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Top ring
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, -18, 4, 0, Math.PI * 2);
    ctx.stroke();

  } else if (symbol === '💎') {
    // Diamond
    ctx.fillStyle = '#84ffff';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(22, -5);
    ctx.lineTo(0, 25);
    ctx.lineTo(-22, -5);
    ctx.closePath();
    ctx.fill();
    
    // Facets
    ctx.fillStyle = '#18ffff';
    ctx.beginPath();
    ctx.moveTo(0, -22);
    ctx.lineTo(12, -5);
    ctx.lineTo(0, 25);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#00e5ff';
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(12, -5);
    ctx.lineTo(0, 25);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#e0ffff';
    ctx.beginPath();
    ctx.moveTo(-12, -5);
    ctx.lineTo(0, -22);
    ctx.lineTo(12, -5);
    ctx.closePath();
    ctx.fill();

  } else if (symbol === '7️⃣') {
    // Seven
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetY = 5;
    
    const gradient = ctx.createLinearGradient(0, -25, 0, 25);
    gradient.addColorStop(0, '#ff5252');
    gradient.addColorStop(0.5, '#e53935');
    gradient.addColorStop(1, '#b71c1c');
    
    ctx.fillStyle = gradient;
    ctx.font = '900 65px "Arial Black", Impact, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('7', 0, 5);
    
    ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#ffeb3b';
    ctx.lineWidth = 3;
    ctx.strokeText('7', 0, 5);
  } else if (symbol === '💀') {
    // Skull
    ctx.fillStyle = '#e0e0e0';
    
    // Cranium
    ctx.beginPath();
    ctx.arc(0, -5, 18, 0, Math.PI * 2);
    ctx.fill();
    
    // Jaw
    ctx.fillRect(-10, 5, 20, 15);
    
    // Eyes
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(-7, -5, 5, 0, Math.PI * 2);
    ctx.arc(7, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Nose
    ctx.beginPath();
    ctx.moveTo(0, 2);
    ctx.lineTo(-3, 7);
    ctx.lineTo(3, 7);
    ctx.closePath();
    ctx.fill();
    
    // Teeth
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-10, 15);
    ctx.lineTo(10, 15);
    ctx.moveTo(-5, 10);
    ctx.lineTo(-5, 20);
    ctx.moveTo(0, 10);
    ctx.lineTo(0, 20);
    ctx.moveTo(5, 10);
    ctx.lineTo(5, 20);
    ctx.stroke();
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
    const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
    bgGradient.addColorStop(0, '#1a2a3a');
    bgGradient.addColorStop(1, '#0d151d');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Machine Border (Metallic Gold)
    const borderGradient = ctx.createLinearGradient(0, 0, width, height);
    borderGradient.addColorStop(0, '#f1c40f');
    borderGradient.addColorStop(0.5, '#f39c12');
    borderGradient.addColorStop(1, '#d35400');
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Inner shadow/background for slots
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(offsetX, offsetY, 300, 300);
    
    // Inner shadow effect
    const innerShadow = ctx.createLinearGradient(offsetX, offsetY, offsetX, offsetY + 20);
    innerShadow.addColorStop(0, 'rgba(0,0,0,0.5)');
    innerShadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = innerShadow;
    ctx.fillRect(offsetX, offsetY, 300, 20);
    
    const bottomShadow = ctx.createLinearGradient(offsetX, offsetY + 280, offsetX, offsetY + 300);
    bottomShadow.addColorStop(0, 'rgba(0,0,0,0)');
    bottomShadow.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = bottomShadow;
    ctx.fillRect(offsetX, offsetY + 280, 300, 20);

    // Grid lines (Separators between reels)
    for (let i = 1; i < 3; i++) {
      // Vertical lines (reel separators)
      ctx.strokeStyle = '#e0e0e0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(offsetX + i * slotSize, offsetY);
      ctx.lineTo(offsetX + i * slotSize, offsetY + 300);
      ctx.stroke();
      
      // Add a slight 3D effect to separators
      ctx.strokeStyle = '#9e9e9e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(offsetX + i * slotSize - 2, offsetY);
      ctx.lineTo(offsetX + i * slotSize - 2, offsetY + 300);
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
      winningLines.forEach(lineIdx => {
        // Draw glow
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        ctx.lineWidth = 16;
        ctx.lineCap = 'round';
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

        // Draw core line
        ctx.strokeStyle = '#ffeb3b';
        ctx.lineWidth = 6;
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
