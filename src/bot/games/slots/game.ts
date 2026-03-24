import { ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { generateSlotsGif } from './canvas.js';
import { updateBalance, recordBet } from '../../database/db.js';

const SYMBOLS = ['🍒', '🍋', '🔔', '💎', '7️⃣'];
const MULTIPLIERS: Record<string, number> = {
  '🍒': 2,
  '🍋': 3,
  '🔔': 5,
  '💎': 10,
  '7️⃣': 50,
};

export async function playSlots(interaction: ChatInputCommandInteraction, bet: number) {
  const userId = interaction.user.id;
  updateBalance(userId, -bet);

  await interaction.deferReply();

  const grid: string[][] = [];
  for (let i = 0; i < 3; i++) {
    const row: string[] = [];
    for (let j = 0; j < 3; j++) {
      row.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
    }
    grid.push(row);
  }

  // 0: Top, 1: Middle, 2: Bottom, 3: Diag1 (\), 4: Diag2 (/)
  const lines = [
    [grid[0][0], grid[0][1], grid[0][2]],
    [grid[1][0], grid[1][1], grid[1][2]],
    [grid[2][0], grid[2][1], grid[2][2]],
    [grid[0][0], grid[1][1], grid[2][2]],
    [grid[2][0], grid[1][1], grid[0][2]],
  ];

  const winningLines: number[] = [];
  let totalMultiplier = 0;
  let winDetails = '';

  lines.forEach((line, index) => {
    if (line[0] === line[1] && line[1] === line[2]) {
      winningLines.push(index);
      const symbol = line[0];
      const multiplier = MULTIPLIERS[symbol];
      totalMultiplier += multiplier;
      
      let lineName = '';
      if (index === 0) lineName = 'Linha Superior';
      if (index === 1) lineName = 'Linha do Meio';
      if (index === 2) lineName = 'Linha Inferior';
      if (index === 3) lineName = 'Diagonal ↘️';
      if (index === 4) lineName = 'Diagonal ↗️';
      
      winDetails += `**${lineName}:** ${symbol} ${symbol} ${symbol} (${multiplier}x)\n`;
    }
  });

  const isWin = winningLines.length > 0;
  let winAmount = 0;
  let description = `**Aposta:** 🪙 ${bet}\n\n`;
  let result: any = {};

  if (isWin) {
    winAmount = bet * totalMultiplier;
    updateBalance(userId, winAmount);
    result = recordBet(userId, bet, winAmount, 'slots');
    description += winDetails;
    description += `\n🎉 **JACKPOT!** Você ganhou **🪙 ${winAmount.toLocaleString()}** (Total: ${totalMultiplier}x)!`;
  } else {
    result = recordBet(userId, bet, 0, 'slots');
    description += `😢 **Que pena!** Não houve alinhamentos. Você perdeu **🪙 ${bet.toLocaleString()}**.`;
  }
  
  if (result.newLevel) {
    description += `\n\n⭐ **LEVEL UP!** Você agora é nível **${result.newLevel}**!`;
  }
  
  if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
    result.unlockedAchievements.forEach((ach: any) => {
      description += `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`;
    });
  }

  const imageBuffer = await generateSlotsGif(grid, winningLines);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'slots.gif' });

  const spinningEmbed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('🎰 Caça-Níqueis')
    .setDescription(`**Aposta:** 🪙 ${bet}\n\nGirando os rolos... 🔄`)
    .setImage('attachment://slots.gif');

  const message = await interaction.editReply({ embeds: [spinningEmbed], files: [attachment] });

  // Wait for the GIF to finish (40 frames + 15 extra = 55 frames * 50ms = 2750ms)
  await new Promise(resolve => setTimeout(resolve, 2750));

  const finalEmbed = new EmbedBuilder()
    .setColor(isWin ? '#00ff00' : '#ff0000')
    .setTitle('🎰 Caça-Níqueis')
    .setDescription(description)
    .setImage('attachment://slots.gif');

  await interaction.editReply({ embeds: [finalEmbed] });
}
