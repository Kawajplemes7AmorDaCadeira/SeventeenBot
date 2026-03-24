import { ChatInputCommandInteraction, EmbedBuilder, AttachmentBuilder, StringSelectMenuInteraction, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { generateRouletteGif } from './canvas.js';
import { updateBalance, recordBet } from '../../database/db.js';

const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

const RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const BLACK_NUMBERS = new Set([2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]);

export async function playRoulette(interaction: any, bet: number, type: string, number: number | null) {
  const userId = interaction.user.id;
  updateBalance(userId, -bet);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: 'Girando a roleta... 🔄', embeds: [], components: [] });
  } else {
    await interaction.deferReply();
  }

  const resultIndex = Math.floor(Math.random() * ROULETTE_NUMBERS.length);
  const resultNumber = ROULETTE_NUMBERS[resultIndex];

  let isWin = false;
  let multiplier = 0;

  if (type === 'number' && number === resultNumber) {
    isWin = true;
    multiplier = 36;
  } else if (type === 'red' && RED_NUMBERS.has(resultNumber)) {
    isWin = true;
    multiplier = 2;
  } else if (type === 'black' && BLACK_NUMBERS.has(resultNumber)) {
    isWin = true;
    multiplier = 2;
  } else if (type === 'even' && resultNumber !== 0 && resultNumber % 2 === 0) {
    isWin = true;
    multiplier = 2;
  } else if (type === 'odd' && resultNumber !== 0 && resultNumber % 2 !== 0) {
    isWin = true;
    multiplier = 2;
  } else if (type === 'dozen1' && resultNumber >= 1 && resultNumber <= 12) {
    isWin = true;
    multiplier = 3;
  } else if (type === 'dozen2' && resultNumber >= 13 && resultNumber <= 24) {
    isWin = true;
    multiplier = 3;
  } else if (type === 'dozen3' && resultNumber >= 25 && resultNumber <= 36) {
    isWin = true;
    multiplier = 3;
  } else if (type === 'half1' && resultNumber >= 1 && resultNumber <= 18) {
    isWin = true;
    multiplier = 2;
  } else if (type === 'half2' && resultNumber >= 19 && resultNumber <= 36) {
    isWin = true;
    multiplier = 2;
  }

  let winAmount = 0;
  let description = `**Aposta:** 🪙 ${bet.toLocaleString()}\n`;
  let result: any = {};
  
  if (type === 'number') {
    description += `**Tipo:** Número ${number}\n`;
  } else if (type === 'red') {
    description += `**Tipo:** 🔴 Vermelho\n`;
  } else if (type === 'black') {
    description += `**Tipo:** ⚫ Preto\n`;
  } else if (type === 'even') {
    description += `**Tipo:** 🔢 Par\n`;
  } else if (type === 'odd') {
    description += `**Tipo:** 🔢 Ímpar\n`;
  } else if (type === 'dozen1') {
    description += `**Tipo:** 1ª Dúzia (1-12)\n`;
  } else if (type === 'dozen2') {
    description += `**Tipo:** 2ª Dúzia (13-24)\n`;
  } else if (type === 'dozen3') {
    description += `**Tipo:** 3ª Dúzia (25-36)\n`;
  } else if (type === 'half1') {
    description += `**Tipo:** 1ª Metade (1-18)\n`;
  } else if (type === 'half2') {
    description += `**Tipo:** 2ª Metade (19-36)\n`;
  }

  let colorEmoji = '🟢';
  if (RED_NUMBERS.has(resultNumber)) colorEmoji = '🔴';
  if (BLACK_NUMBERS.has(resultNumber)) colorEmoji = '⚫';

  description += `**Sorteado:** ${colorEmoji} **${resultNumber}**\n\n`;

  if (isWin) {
    winAmount = bet * multiplier;
    updateBalance(userId, winAmount);
    result = recordBet(userId, bet, winAmount, 'roulette');
    description += `🎉 **Parabéns!** Você ganhou **🪙 ${winAmount.toLocaleString()}** (${multiplier}x)!`;
  } else {
    result = recordBet(userId, bet, 0, 'roulette');
    description += `❌ **Você perdeu!** Boa sorte na próxima vez.`;
  }
  
  if (result.newLevel) {
    description += `\n\n⭐ **LEVEL UP!** Você agora é nível **${result.newLevel}**!`;
  }
  
  if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
    result.unlockedAchievements.forEach((ach: any) => {
      description += `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`;
    });
  }

  const imageBuffer = await generateRouletteGif(resultNumber);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'roulette.gif' });

  const spinningEmbed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('🎡 Roleta')
    .setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()}\n\nGirando a roleta... 🔄`)
    .setImage('attachment://roulette.gif');

  await interaction.editReply({ embeds: [spinningEmbed], files: [attachment], components: [] });

  // Wait for the GIF to finish (30 frames + 10 extra = 40 frames * 50ms = 2000ms)
  await new Promise(resolve => setTimeout(resolve, 2000));

  const finalEmbed = new EmbedBuilder()
    .setColor(isWin ? '#00ff00' : '#ff0000')
    .setTitle('🎡 Roleta')
    .setDescription(description)
    .setImage('attachment://roulette.gif');

  await interaction.editReply({ embeds: [finalEmbed] });
}

export async function handleRouletteTypeSelect(interaction: StringSelectMenuInteraction) {
  const [_, __, betStr, userId] = interaction.customId.split('_');
  const bet = parseInt(betStr);
  const type = interaction.values[0];

  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Esta não é a sua roleta!', ephemeral: true });
  }

  if (type === 'number_select') {
    const select = new StringSelectMenuBuilder()
      .setCustomId(`roulette_number_${bet}_${userId}`)
      .setPlaceholder('Escolha um número de 0 a 36...');

    // Add numbers in chunks or just all 37 (select menu supports up to 25 options, so I need to split)
    // Actually, let's split into ranges: 0-12, 13-24, 25-36
    select.addOptions(
      new StringSelectMenuOptionBuilder().setLabel('0').setValue('0'),
      new StringSelectMenuOptionBuilder().setLabel('1-12').setValue('range1').setDescription('Escolher um número entre 1 e 12'),
      new StringSelectMenuOptionBuilder().setLabel('13-24').setValue('range2').setDescription('Escolher um número entre 13 e 24'),
      new StringSelectMenuOptionBuilder().setLabel('25-36').setValue('range3').setDescription('Escolher um número entre 25 e 36')
    );

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    await interaction.update({ content: 'Selecione a faixa de números:', embeds: [], components: [row] });
  } else {
    await playRoulette(interaction, bet, type, null);
  }
}

export async function handleRouletteNumberSelect(interaction: StringSelectMenuInteraction) {
  const [_, __, betStr, userId] = interaction.customId.split('_');
  const bet = parseInt(betStr);
  const value = interaction.values[0];

  if (interaction.user.id !== userId) {
    return interaction.reply({ content: 'Esta não é a sua roleta!', ephemeral: true });
  }

  if (value === 'range1' || value === 'range2' || value === 'range3') {
    const start = value === 'range1' ? 1 : value === 'range2' ? 13 : 25;
    const end = start + 11;
    
    const select = new StringSelectMenuBuilder()
      .setCustomId(`roulette_number_${bet}_${userId}`)
      .setPlaceholder(`Escolha um número entre ${start} e ${end}...`);

    for (let i = start; i <= end; i++) {
      select.addOptions(new StringSelectMenuOptionBuilder().setLabel(i.toString()).setValue(i.toString()));
    }

    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    await interaction.update({ content: `Escolha o número exato (${start}-${end}):`, embeds: [], components: [row] });
  } else {
    const number = parseInt(value);
    await playRoulette(interaction, bet, 'number', number);
  }
}
