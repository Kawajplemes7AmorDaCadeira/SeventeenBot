import { createCanvas } from 'canvas';

export async function createCrashCanvas(multiplier: number, crashed: boolean = false) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#0f172a'); // slate-900
  bgGradient.addColorStop(1, '#020617'); // slate-950
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Grid system
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  const padding = 50;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  // Draw grid lines
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * graphHeight;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(width - padding, y);
    ctx.stroke();
  }
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * graphWidth;
    ctx.beginPath();
    ctx.moveTo(x, padding);
    ctx.lineTo(x, height - padding);
    ctx.stroke();
  }

  // Calculate curve points
  // Crash curve formula approximation: multiplier = e^(rt)
  // We'll map the current multiplier to the graph area
  const maxMultiplierDisplay = Math.max(2.0, multiplier * 1.2); // Dynamic Y axis
  const maxTimeDisplay = Math.log(maxMultiplierDisplay); // Dynamic X axis
  const currentTime = Math.log(multiplier);

  const points: {x: number, y: number}[] = [];
  const numPoints = 100;
  
  for (let i = 0; i <= numPoints; i++) {
    const t = (i / numPoints) * currentTime;
    const m = Math.exp(t);
    
    const x = padding + (t / maxTimeDisplay) * graphWidth;
    const y = height - padding - ((m - 1) / (maxMultiplierDisplay - 1)) * graphHeight;
    points.push({ x, y });
  }

  const primaryColor = crashed ? '#ef4444' : '#10b981'; // red-500 or emerald-500
  const glowColor = crashed ? 'rgba(239, 68, 68, 0.5)' : 'rgba(16, 185, 129, 0.5)';

  // Draw area under curve
  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, height - padding);
    for (const p of points) {
      ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(points[points.length - 1].x, height - padding);
    ctx.closePath();

    const fillGradient = ctx.createLinearGradient(0, padding, 0, height - padding);
    fillGradient.addColorStop(0, glowColor);
    fillGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = fillGradient;
    ctx.fill();
  }

  // Draw the curve line
  if (points.length > 0) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (const p of points) {
      ctx.lineTo(p.x, p.y);
    }
    
    ctx.strokeStyle = primaryColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Glow effect
    ctx.shadowColor = primaryColor;
    ctx.shadowBlur = 15;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowBlur = 0;

    // Draw rocket at the end
    const lastPoint = points[points.length - 1];
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Calculate angle for rocket
    let angle = -Math.PI / 4; // Default 45 degrees up
    if (points.length > 1) {
      const p1 = points[points.length - 2];
      const p2 = points[points.length - 1];
      angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    }
    
    ctx.save();
    ctx.translate(lastPoint.x, lastPoint.y);
    if (!crashed) {
      ctx.rotate(angle + Math.PI / 4); // Adjust emoji rotation
      ctx.fillText('🚀', 0, 0);
    } else {
      ctx.fillText('💥', 0, 0);
    }
    ctx.restore();
  }

  // Draw Multiplier Text
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Large multiplier
  ctx.font = 'bold 80px "Arial Black", Arial';
  ctx.fillStyle = primaryColor;
  ctx.shadowColor = 'rgba(0,0,0,0.5)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  ctx.fillText(`${multiplier.toFixed(2)}x`, width / 2, height / 2 - 20);
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Status text
  ctx.font = 'bold 30px Arial';
  if (crashed) {
    ctx.fillStyle = '#ef4444';
    ctx.fillText('CRASHED!', width / 2, height / 2 + 50);
  } else {
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('Subindo...', width / 2, height / 2 + 50);
  }

  // Draw Axis Labels
  ctx.fillStyle = '#64748b';
  ctx.font = '14px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  
  // Y Axis (Multipliers)
  for (let i = 0; i <= 5; i++) {
    const y = height - padding - (i / 5) * graphHeight;
    const val = 1 + (i / 5) * (maxMultiplierDisplay - 1);
    ctx.fillText(`${val.toFixed(1)}x`, padding - 10, y);
  }

  // X Axis (Time/Progress)
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let i = 0; i <= 5; i++) {
    const x = padding + (i / 5) * graphWidth;
    ctx.fillText(`${(i * 20)}%`, x, height - padding + 10);
  }

  return canvas.toBuffer('image/png');
}
