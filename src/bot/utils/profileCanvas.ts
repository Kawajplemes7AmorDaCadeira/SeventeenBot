import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

export async function createProfileCanvas(user: any, userData: any, achievements: any[]) {
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext('2d');

  // Background - Dark Gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 450);
  gradient.addColorStop(0, '#0f0c29');
  gradient.addColorStop(0.5, '#302b63');
  gradient.addColorStop(1, '#24243e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 450);

  // Decorative circles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.beginPath();
  ctx.arc(750, 50, 150, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(50, 400, 100, 0, Math.PI * 2);
  ctx.fill();

  // Glassmorphism Card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(40, 40, 720, 370, 30);
  ctx.fill();
  ctx.stroke();

  // Avatar
  try {
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(140, 140, 70, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 70, 70, 140, 140);
    ctx.restore();
    
    // Avatar Border
    ctx.strokeStyle = '#6366f1';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(140, 140, 72, 0, Math.PI * 2);
    ctx.stroke();
  } catch (e) {
    // Fallback if avatar fails
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(140, 140, 70, 0, Math.PI * 2);
    ctx.fill();
  }

  // Username
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px Arial';
  ctx.textAlign = 'left';
  ctx.fillText(user.username, 230, 125);

  // Level Badge
  ctx.fillStyle = '#6366f1';
  ctx.beginPath();
  ctx.roundRect(230, 145, 120, 40, 10);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Arial';
  ctx.fillText(`NÍVEL ${userData.level || 1}`, 245, 172);

  // XP Progress Bar
  const level = userData.level || 1;
  const xp = userData.xp || 0;
  const nextLevelXP = level * 1000;
  const progress = Math.min(xp / nextLevelXP, 1);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.beginPath();
  ctx.roundRect(230, 205, 500, 12, 6);
  ctx.fill();
  
  const barGradient = ctx.createLinearGradient(230, 0, 730, 0);
  barGradient.addColorStop(0, '#6366f1');
  barGradient.addColorStop(1, '#a855f7');
  ctx.fillStyle = barGradient;
  ctx.beginPath();
  ctx.roundRect(230, 205, 500 * progress, 12, 6);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.font = '14px Arial';
  ctx.fillText(`${xp.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP`, 230, 235);

  // Stats Grid
  const drawStat = (x: number, y: number, label: string, value: string, icon: string) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.roundRect(x, y, 220, 80, 20);
    ctx.fill();
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.font = 'bold 14px Arial';
    ctx.fillText(label.toUpperCase(), x + 20, y + 30);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(value, x + 20, y + 60);
  };

  drawStat(70, 270, 'Carteira', `🪙 ${(userData.balance || 0).toLocaleString()}`, '💰');
  drawStat(305, 270, 'Apostado', `🪙 ${(userData.total_bet || 0).toLocaleString()}`, '🎰');
  drawStat(540, 270, 'Lucro', `${(userData.total_won - userData.total_bet || 0) >= 0 ? '+' : ''}${(userData.total_won - userData.total_bet || 0).toLocaleString()}`, '📈');

  // Footer Info
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.font = 'italic 14px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Conquistas: ${achievements.length} | Streak: ${userData.daily_streak || 0} dias`, 400, 390);

  return canvas.toBuffer('image/png');
}
