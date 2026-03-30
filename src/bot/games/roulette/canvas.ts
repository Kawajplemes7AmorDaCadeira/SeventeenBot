import { createCanvas } from 'canvas';
import GIFEncoder from 'gif-encoder-2';

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export async function generateRouletteGif(resultNumber: number, tableColor: string = '#1a3a2a'): Promise<Buffer> {
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
    const bgGradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, width);
    bgGradient.addColorStop(0, tableColor);
    bgGradient.addColorStop(1, '#0a1a12');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);
    
    // Draw outer shadow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow

    // Draw wooden rim
    const woodGradient = ctx.createRadialGradient(centerX, centerY, radius, centerX, centerY, radius + 20);
    woodGradient.addColorStop(0, '#3e1c00');
    woodGradient.addColorStop(0.5, '#6b3205');
    woodGradient.addColorStop(1, '#2c1200');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.fillStyle = woodGradient;
    ctx.fill();
    
    // Inner metallic rim
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 2, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    const goldGradient = ctx.createLinearGradient(0, 0, width, height);
    goldGradient.addColorStop(0, '#f1c40f');
    goldGradient.addColorStop(0.5, '#f39c12');
    goldGradient.addColorStop(1, '#d35400');
    ctx.strokeStyle = goldGradient;
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
        ctx.fillStyle = '#27ae60'; // Brighter green
      } else if (RED_NUMBERS.has(num)) {
        ctx.fillStyle = '#c0392b'; // Richer red
      } else {
        ctx.fillStyle = '#1c1c1c'; // Darker black
      }
      ctx.fill();
      
      // Separator lines
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw number
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.translate(radius - 22, 0);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px "Arial Black", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Add slight shadow to text
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 2;
      ctx.fillText(num.toString(), 0, 0);
      ctx.restore();
    }
    
    // Center metallic cone
    const coneGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 45);
    coneGradient.addColorStop(0, '#f1c40f');
    coneGradient.addColorStop(0.7, '#d35400');
    coneGradient.addColorStop(1, '#7e3300');
    
    ctx.beginPath();
    ctx.arc(0, 0, 45, 0, 2 * Math.PI);
    ctx.fillStyle = coneGradient;
    ctx.fill();
    
    // Center highlight
    ctx.beginPath();
    ctx.arc(-10, -10, 15, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.fill();

    // Center pin
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ecf0f1';
    ctx.fill();
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
    
    // Draw ball
    const ballAngle = -Math.PI / 2 - (Math.PI * 10 * (1 - easedProgress)); // 5 spins counter-clockwise
    const ballDist = (radius - 12) - (25 * easedProgress); // Moves from r-12 to r-37

    const ballX = centerX + Math.cos(ballAngle) * ballDist;
    const ballY = centerY + Math.sin(ballAngle) * ballDist;
    
    // Ball shadow
    ctx.beginPath();
    ctx.arc(ballX + 3, ballY + 3, 6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.fill();

    // Ball body
    const ballGradient = ctx.createRadialGradient(ballX - 2, ballY - 2, 1, ballX, ballY, 6);
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.7, '#ecf0f1');
    ballGradient.addColorStop(1, '#bdc3c7');
    
    ctx.beginPath();
    ctx.arc(ballX, ballY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = ballGradient;
    ctx.fill();

    // Draw pointer at the top
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius - 25);
    ctx.lineTo(centerX - 12, centerY - radius - 5);
    ctx.lineTo(centerX + 12, centerY - radius - 5);
    ctx.closePath();
    
    const pointerGradient = ctx.createLinearGradient(centerX, centerY - radius - 25, centerX, centerY - radius - 5);
    pointerGradient.addColorStop(0, '#f1c40f');
    pointerGradient.addColorStop(1, '#e67e22');
    
    ctx.fillStyle = pointerGradient;
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
