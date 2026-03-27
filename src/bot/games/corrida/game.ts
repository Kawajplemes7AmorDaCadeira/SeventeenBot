import { ChatInputCommandInteraction, ButtonInteraction, EmbedBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuInteraction } from 'discord.js';
import { generateCorridaGif } from './canvas.js';
import { updateBalance, recordBet, getUser } from '../../database/db.js';
import { logBigWin } from '../../utils/logger.js';

export async function playCorrida(interaction: ChatInputCommandInteraction | ButtonInteraction | StringSelectMenuInteraction, bet: number, chosenHorse: number) {
  const userId = interaction.user.id;
  
  const user = getUser(userId);
  if (!user || user.balance < bet) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${user?.balance || 0}`, ephemeral: true });
    }
    return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${user?.balance || 0}`, ephemeral: true });
  }

  updateBalance(userId, -bet);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: '🐎 **Preparando os cavalos...**', embeds: [], components: [], files: [] });
  } else if (interaction.isButton() || interaction.isStringSelectMenu()) {
    await interaction.deferUpdate();
    await interaction.editReply({ content: '🐎 **Preparando os cavalos...**', embeds: [], components: [], files: [] });
  } else {
    await interaction.deferReply();
    await interaction.editReply({ content: '🐎 **Preparando os cavalos...**' });
  }
  
  await new Promise(resolve => setTimeout(resolve, 500));
  await interaction.editReply({ content: '🔫 **Foi dada a largada!**' });
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simulate race
  const numFrames = 40; // Approx 4 seconds
  const horseProgress: number[][] = Array.from({ length: 5 }, () => [0]);
  const currentProgress = [0, 0, 0, 0, 0];
  let winnerIndex = -1;
  let finished = false;

  for (let frame = 1; frame < numFrames; frame++) {
    for (let h = 0; h < 5; h++) {
      if (!finished) {
        // Random step between 0.01 and 0.05
        const step = Math.random() * 0.04 + 0.01;
        currentProgress[h] += step;
        if (currentProgress[h] >= 1.0) {
          currentProgress[h] = 1.0;
          if (winnerIndex === -1) {
            winnerIndex = h;
            finished = true;
          }
        }
      } else {
        // Keep moving slightly after finish line if not the winner
        if (currentProgress[h] < 1.0) {
          currentProgress[h] += Math.random() * 0.02;
        }
      }
      horseProgress[h].push(Math.min(currentProgress[h], 1.1)); // allow slightly past finish line
    }
  }

  // Ensure there's a winner if we reached max frames without one
  if (winnerIndex === -1) {
    let maxProgress = 0;
    for (let h = 0; h < 5; h++) {
      if (currentProgress[h] > maxProgress) {
        maxProgress = currentProgress[h];
        winnerIndex = h;
      }
    }
    // Force winner to 1.0
    horseProgress[winnerIndex][numFrames - 1] = 1.0;
  }

  const winningHorse = winnerIndex + 1;
  const isWin = chosenHorse === winningHorse;
  const actualMultiplier = 4.5; // 5 horses, 4.5x payout (10% house edge)

  let winAmount = 0;
  let description = `**Aposta:** 🪙 ${bet.toLocaleString()}\n**Cavalo Escolhido:** Cavalo ${chosenHorse}\n\n`;
  let result: any = {};

  if (isWin) {
    winAmount = Math.floor(bet * actualMultiplier);
    updateBalance(userId, winAmount);
    result = recordBet(userId, bet, winAmount, 'corrida');
    if (result.isBigWin) {
      logBigWin(interaction.client, userId, winAmount, 'Corrida de Cavalos');
    }
    description += `🎉 **O Cavalo ${winningHorse} venceu!** Você ganhou **🪙 ${winAmount.toLocaleString()}** (${actualMultiplier}x)!`;
  } else {
    result = recordBet(userId, bet, 0, 'corrida');
    description += `❌ **O Cavalo ${winningHorse} venceu!** Seu cavalo chegou para trás. Você perdeu **🪙 ${bet.toLocaleString()}**.`;
  }
  
  if (result.newLevel) {
    description += `\n\n⭐ **LEVEL UP!** Você agora é nível **${result.newLevel}**!`;
  }
  
  if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
    result.unlockedAchievements.forEach((ach: any) => {
      description += `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`;
    });
  }

  const imageBuffer = await generateCorridaGif(winnerIndex, horseProgress);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'corrida.gif' });

  const racingEmbed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('🐎 Corrida de Cavalos')
    .setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()}\n**Seu Cavalo:** ${chosenHorse}\n\nA corrida está acontecendo... 🏇`)
    .setImage('attachment://corrida.gif');

  await interaction.editReply({ content: null, embeds: [racingEmbed], files: [attachment] });

  // Wait for GIF to finish (numFrames * 100ms + 1500ms extra)
  await new Promise(resolve => setTimeout(resolve, numFrames * 100 + 1500));

  const finalEmbed = new EmbedBuilder()
    .setColor(isWin ? '#00ff00' : '#ff0000')
    .setTitle('🐎 Corrida de Cavalos')
    .setDescription(description)
    .setImage('attachment://corrida.gif');

  const row = new ActionRowBuilder<ButtonBuilder>();
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(`corrida_playagain_${userId}_${bet}_${chosenHorse}`)
      .setLabel('🔄 Jogar Novamente')
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId(`corrida_double_${userId}_${bet}_${chosenHorse}`)
      .setLabel('💰 Dobrar Aposta')
      .setStyle(ButtonStyle.Primary)
  );

  await interaction.editReply({ embeds: [finalEmbed], components: [row] }).catch(console.error);
}

export async function handleCorridaButton(interaction: ButtonInteraction, action: string, userId: string) {
  if (action === 'playagain' || action === 'double') {
    const parts = interaction.customId.split('_');
    const betStr = parts[3];
    const horseStr = parts[4];
    
    let bet = parseInt(betStr, 10);
    if (action === 'double') bet *= 2;
    
    const horse = parseInt(horseStr, 10);
    
    await playCorrida(interaction, bet, horse);
    return;
  }
}

export async function handleCorridaHorseSelect(interaction: StringSelectMenuInteraction) {
  const parts = interaction.customId.split('_');
  const betStr = parts[2];
  const userId = parts[3];
  
  const bet = parseInt(betStr, 10);
  const horse = parseInt(interaction.values[0], 10);

  if (interaction.user.id !== userId) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Esta não é a sua corrida!', ephemeral: true });
    }
    return interaction.reply({ content: 'Esta não é a sua corrida!', ephemeral: true });
  }

  await playCorrida(interaction, bet, horse);
}
