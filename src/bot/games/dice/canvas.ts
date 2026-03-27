import { createCanvas } from 'canvas';

export async function createDiceCanvas(user1: { name: string, roll: number }, user2: { name: string, roll: number }) {
  const canvas = createCanvas(600, 300);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, 600, 300);

  // Draw dice
  const drawDie = (x: number, y: number, value: number, name: string, color: string) => {
    // Die body
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.roundRect(x, y, 150, 150, 20);
    ctx.fill();
    ctx.stroke();

    // Value text
    ctx.fillStyle = '#1a1a1a';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toString(), x + 75, y + 75);

    // Name text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px Arial';
    ctx.fillText(name, x + 75, y + 180);
  };

  const color1 = user1.roll > user2.roll ? '#2ecc71' : (user1.roll < user2.roll ? '#ff4757' : '#f1c40f');
  const color2 = user2.roll > user1.roll ? '#2ecc71' : (user2.roll < user1.roll ? '#ff4757' : '#f1c40f');

  drawDie(100, 50, user1.roll, user1.name, color1);
  drawDie(350, 50, user2.roll, user2.name, color2);

  // VS text
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 40px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('VS', 300, 125);

  return canvas.toBuffer('image/png');
}
