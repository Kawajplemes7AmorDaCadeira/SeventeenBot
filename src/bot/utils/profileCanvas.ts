import { createCanvas, loadImage, registerFont } from 'canvas';
import path from 'path';

export async function createProfileCanvas(user: any, userData: any, achievements: any[]) {
  const canvas = createCanvas(800, 450);
  const ctx = canvas.getContext('2d');

  // Background - Dark Gradient
  const gradient = ctx.createLinearGradient(0, 0, 800, 450);
  gradient.addColorStop(0, '#0f172a'); // slate-900
  gradient.addColorStop(0.5, '#1e1b4b'); // indigo-950
  gradient.addColorStop(1, '#020617'); // slate-950
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 450);

  // Decorative glowing orbs
  const drawOrb = (x: number, y: number, r: number, color: string) => {
    const orbGradient = ctx.createRadialGradient(x, y, 0, x, y, r);
    orbGradient.addColorStop(0, color);
    orbGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = orbGradient;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };
  drawOrb(100, 100, 250, 'rgba(99, 102, 241, 0.15)'); // indigo
  drawOrb(700, 350, 300, 'rgba(168, 85, 247, 0.12)'); // purple

  // Glassmorphism Card
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(30, 30, 740, 390, 24);
  ctx.fill();
  ctx.stroke();

  const avatarX = 130;
  const avatarY = 125;
  const avatarRadius = 65;

  // Avatar Border (Gradient)
  const avatarGradient = ctx.createLinearGradient(avatarX - avatarRadius, avatarY - avatarRadius, avatarX + avatarRadius, avatarY + avatarRadius);
  avatarGradient.addColorStop(0, '#818cf8');
  avatarGradient.addColorStop(1, '#c084fc');

  // Avatar
  try {
    const avatarUrl = user.displayAvatarURL({ extension: 'png', size: 256 });
    const avatar = await loadImage(avatarUrl);
    
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX - avatarRadius, avatarY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
    ctx.restore();
    
    ctx.strokeStyle = avatarGradient;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius + 2, 0, Math.PI * 2);
    ctx.stroke();
  } catch (e) {
    // Fallback if avatar fails
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title based on level
  const getTitle = (level: number) => {
    if (level >= 50) return 'Lenda do Cassino';
    if (level >= 30) return 'Apostador Profissional';
    if (level >= 15) return 'Veterano';
    if (level >= 5) return 'Apostador Frequente';
    return 'Iniciante';
  };

  // Username
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  
  let uname = user.username;
  if (ctx.measureText(uname).width > 380) {
    uname = uname.substring(0, 15) + '...';
  }
  ctx.fillText(uname, 230, 110);

  // Title
  ctx.fillStyle = '#a5b4fc'; // indigo-300
  ctx.font = '20px "Segoe UI", Arial, sans-serif';
  ctx.fillText(getTitle(userData.level || 1), 230, 145);

  // Level Badge
  ctx.fillStyle = avatarGradient;
  ctx.beginPath();
  ctx.roundRect(630, 75, 100, 36, 12);
  ctx.fill();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(`LVL ${userData.level || 1}`, 680, 99);

  // XP Progress Bar
  const level = userData.level || 1;
  const xp = userData.xp || 0;
  const nextLevelXP = level * 1000;
  const progress = Math.min(xp / nextLevelXP, 1);
  
  // Background bar
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.beginPath();
  ctx.roundRect(230, 180, 500, 16, 8);
  ctx.fill();
  
  // Progress bar
  ctx.fillStyle = avatarGradient;
  ctx.beginPath();
  ctx.roundRect(230, 180, Math.max(500 * progress, 16), 16, 8);
  ctx.fill();
  
  // XP Text
  ctx.fillStyle = '#cbd5e1'; // slate-300
  ctx.font = '14px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`${xp.toLocaleString()} / ${nextLevelXP.toLocaleString()} XP`, 730, 170);

  // Stats Grid
  const drawStat = (x: number, y: number, label: string, value: string, color: string) => {
    // Stat Card
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, 150, 90, 16);
    ctx.fill();
    ctx.stroke();
    
    // Top accent line
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(x, y, 150, 4, [16, 16, 0, 0]);
    ctx.fill();
    
    ctx.fillStyle = '#94a3b8'; // slate-400
    ctx.font = 'bold 12px "Segoe UI", Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label.toUpperCase(), x + 75, y + 35);
    
    // Adjust font size for long values
    let fontSize = 22;
    ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    while (ctx.measureText(value).width > 130 && fontSize > 12) {
      fontSize -= 1;
      ctx.font = `bold ${fontSize}px "Segoe UI", Arial, sans-serif`;
    }
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText(value, x + 75, y + 65);
  };

  const profit = (userData.total_won || 0) - (userData.total_bet || 0);
  const profitStr = profit > 0 ? `+${profit.toLocaleString()}` : profit.toLocaleString();
  const profitColor = profit > 0 ? '#4ade80' : (profit < 0 ? '#f87171' : '#94a3b8');

  const games = [
    { name: 'Slots', won: userData.slots_won || 0 },
    { name: 'Blackjack', won: userData.blackjack_won || 0 },
    { name: 'Roleta', won: userData.roulette_won || 0 },
    { name: 'Crash', won: userData.crash_won || 0 },
    { name: 'Mines', won: userData.mines_won || 0 },
    { name: 'Dados', won: userData.dice_won || 0 },
    { name: 'Coinflip', won: userData.coinflip_won || 0 },
    { name: 'Corrida', won: userData.corrida_won || 0 },
    { name: 'Poker', won: userData.poker_won || 0 },
  ];
  const favoriteGame = games.reduce((prev, current) => (prev.won > current.won) ? prev : current);
  const favGameName = favoriteGame.won > 0 ? favoriteGame.name : 'Nenhum';

  drawStat(70, 240, 'Carteira', `${(userData.balance || 0).toLocaleString()}`, '#fbbf24');
  drawStat(240, 240, 'Apostado', `${(userData.total_bet || 0).toLocaleString()}`, '#60a5fa');
  drawStat(410, 240, 'Lucro', profitStr, profitColor);
  drawStat(580, 240, 'Favorito', favGameName, '#c084fc');

  // Footer Info
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '16px "Segoe UI", Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`🏆 Conquistas: ${achievements.length}`, 70, 380);
  
  ctx.textAlign = 'right';
  ctx.fillText(`🔥 Ofensiva Diária: ${userData.daily_streak || 0} dias`, 730, 380);

  return canvas.toBuffer('image/png');
}
