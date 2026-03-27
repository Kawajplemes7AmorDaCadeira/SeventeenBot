import { createCanvas } from 'canvas';

export async function createMinesCanvas(grid: (string | null)[], revealed: boolean[] = [], gameOver: boolean = false) {
  const canvas = createCanvas(500, 400);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 500, 400);

  // Grid
  const cellSize = 90;
  const gap = 10;
  const startX = 5;
  const startY = 5;

  for (let i = 0; i < 20; i++) {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const x = startX + col * (cellSize + gap);
    const y = startY + row * (cellSize + gap);

    // Cell background
    ctx.fillStyle = revealed[i] ? '#2f3542' : '#57606f';
    if (gameOver && grid[i] === 'bomb') {
      ctx.fillStyle = '#ff4757';
    }
    ctx.fillRect(x, y, cellSize, cellSize);

    // Cell content
    if (revealed[i] || gameOver) {
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      if (grid[i] === 'bomb') {
        ctx.fillText('💣', x + cellSize / 2, y + cellSize / 2);
      } else {
        ctx.fillText('💎', x + cellSize / 2, y + cellSize / 2);
      }
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText((i + 1).toString(), x + cellSize / 2, y + cellSize / 2);
    }
  }

  return canvas.toBuffer('image/png');
}
