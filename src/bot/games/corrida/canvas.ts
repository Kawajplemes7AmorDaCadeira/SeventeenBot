import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const HORSES = ['🐎', '🏇', '🦄', '🦓', '🐴'];
const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6'];

function drawHorse(ctx: any, x: number, y: number, color: string, bob: number) {
  // Body
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y + bob, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head
  ctx.beginPath();
  ctx.arc(x + 12, y - 5 + bob, 7, 0, Math.PI * 2);
  ctx.fill();
  // Neck
  ctx.beginPath();
  ctx.moveTo(x + 5, y + bob);
  ctx.lineTo(x + 12, y - 5 + bob);
  ctx.lineWidth = 6;
  ctx.strokeStyle = color;
  ctx.stroke();
}

export async function generateCorridaGif(winnerIndex: number, horseProgress: number[][]): Promise<Buffer> {
  const width = 600;
  const height = 350;
  
  const encoder = new GIFEncoder(width, height);
  encoder.start();
  encoder.setRepeat(-1);
  encoder.setDelay(100); // 100ms per frame
  encoder.setQuality(10);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  const totalFrames = horseProgress[0].length;
  const trackWidth = width - 120; // Increased padding
  const startX = 60;
  const finishX = width - 60;
  const laneHeight = height / 5;

  for (let frame = 0; frame < totalFrames; frame++) {
    // Background (Grass with texture)
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(0, 100, 0, 0.1)';
    ctx.lineWidth = 2;
    for (let i = 0; i < width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    
    // Track (Dirt)
    ctx.fillStyle = '#d35400';
    ctx.fillRect(startX - 30, 0, trackWidth + 60, height);
    
    // Start line
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(startX - 10, 0, 10, height);
    
    // Finish line (Checkered)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(finishX, 0, 30, height);
    for (let i = 0; i < height; i += 15) {
      ctx.fillStyle = (Math.floor(i / 15)) % 2 === 0 ? '#000000' : '#ffffff';
      ctx.fillRect(finishX, i, 15, 15);
      ctx.fillRect(finishX + 15, i, 15, 15);
    }
    
    // Lanes
    for (let i = 1; i < 5; i++) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 2;
      ctx.setLineDash([10, 10]);
      ctx.beginPath();
      ctx.moveTo(startX - 30, i * laneHeight);
      ctx.lineTo(finishX + 30, i * laneHeight);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    
    // Draw Horses
    for (let h = 0; h < 5; h++) {
      const progress = horseProgress[h][frame]; // 0.0 to 1.0
      const x = startX + progress * trackWidth;
      const y = h * laneHeight + laneHeight / 2;
      
      // Bobbing effect
      const bob = Math.sin(frame * 0.5) * 5;

      // Draw horse number above
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText((h + 1).toString(), x + 20, y - 35 + bob);
      
      // Draw custom horse shape
      drawHorse(ctx, x + 20, y + 10, COLORS[h], bob);
    }
    
    encoder.addFrame(ctx as any);
  }
  
  // Add extra frames at the end to show the winner
  for(let i = 0; i < 15; i++) {
      encoder.addFrame(ctx as any);
  }
  
  encoder.finish();
  return encoder.out.getData();
}
