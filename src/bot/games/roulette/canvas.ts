import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export async function generateRouletteGif(resultNumber: number): Promise<Buffer> {
  const width = 400;
  const height = 400;
  
  const encoder = new GIFEncoder(width, height);
  encoder.start();
  encoder.setRepeat(-1); // No repeat
  encoder.setDelay(50); // 50ms per frame
  encoder.setQuality(10);
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 180;
  
  const numSlices = ROULETTE_NUMBERS.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const resultIndex = ROULETTE_NUMBERS.indexOf(resultNumber);
  const finalRotation = -Math.PI / 2 - (resultIndex * sliceAngle);
  
  const totalFrames = 30;
  const spins = 3; // 3 full spins
  const startRotation = finalRotation - (spins * 2 * Math.PI);
  
  const easeOutQuart = (x: number): number => 1 - Math.pow(1 - x, 4);
  
  for (let frame = 0; frame < totalFrames; frame++) {
    const progress = frame / (totalFrames - 1);
    const easedProgress = easeOutQuart(progress);
    const currentRotation = startRotation + (finalRotation - startRotation) * easedProgress;
    
    // Background
    ctx.fillStyle = '#1e3a2f';
    ctx.fillRect(0, 0, width, height);
    
    // Draw wooden rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#5c2a11';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#3a1700';
    ctx.stroke();
    
    // Draw wheel
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(currentRotation);
    
    for (let i = 0; i < numSlices; i++) {
      const num = ROULETTE_NUMBERS[i];
      const startAngle = i * sliceAngle - sliceAngle / 2;
      const endAngle = startAngle + sliceAngle;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      if (num === 0) {
        ctx.fillStyle = '#00aa00';
      } else if (RED_NUMBERS.has(num)) {
        ctx.fillStyle = '#aa0000';
      } else {
        ctx.fillStyle = '#222222';
      }
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw number
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.translate(radius - 25, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    }
    
    ctx.restore();
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI);
    ctx.fillStyle = '#111111';
    ctx.fill();
    ctx.strokeStyle = '#d4af37'; // Gold
    ctx.lineWidth = 4;
    ctx.stroke();

    // Draw ball
    const ballAngle = -Math.PI / 2 - (Math.PI * 10 * (1 - easedProgress)); // 5 spins counter-clockwise
    const ballDist = (radius - 10) - (25 * easedProgress); // Moves from r-10 to r-35

    const ballX = centerX + Math.cos(ballAngle) * ballDist;
    const ballY = centerY + Math.sin(ballAngle) * ballDist;
    
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Ball highlight
    ctx.beginPath();
    ctx.arc(ballX - 2, ballY - 2, 2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fill();

    // Draw pointer at the top
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 10);
    ctx.lineTo(centerX - 10, centerY - radius + 10);
    ctx.lineTo(centerX + 10, centerY - radius + 10);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    encoder.addFrame(ctx as any);
  }
  
  // Add extra frames at the end to show the result clearly
  for(let i = 0; i < 10; i++) {
      encoder.addFrame(ctx as any);
  }
  
  encoder.finish();
  return encoder.out.getData();
}
