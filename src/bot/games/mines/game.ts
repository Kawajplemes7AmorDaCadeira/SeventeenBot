import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType, ButtonInteraction } from 'discord.js';
import { getUser, updateBalance, recordBet } from '../../database/db.js';
import { createMinesCanvas } from './canvas.js';
import { logBigWin } from '../../utils/logger.js';

export async function playMines(interaction: ChatInputCommandInteraction | ButtonInteraction, bet: number, bombs: number) {
  const userId = interaction.user.id;
  const userData = getUser(userId);

  if (userData.balance < bet) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Você não tem Odiondos suficientes!', ephemeral: true });
    }
    return interaction.reply({ content: 'Você não tem Odiondos suficientes!', ephemeral: true });
  }

  if (interaction.deferred || interaction.replied) {
    // already deferred
  } else if (interaction.isButton()) {
    await interaction.deferUpdate();
  } else {
    await interaction.deferReply();
  }

  // Deduct bet
  updateBalance(userId, -bet);

  // Initialize grid
  const grid: (string | null)[] = new Array(20).fill('diamond');
  const bombIndices: number[] = [];
  while (bombIndices.length < bombs) {
    const index = Math.floor(Math.random() * 20);
    if (!bombIndices.includes(index)) {
      bombIndices.push(index);
      grid[index] = 'bomb';
    }
  }

  const revealed: boolean[] = new Array(20).fill(false);
  let diamondsFound = 0;
  let isGameOver = false;
  let isCashedOut = false;

  const calculateMultiplier = (found: number) => {
    // Basic multiplier formula for mines
    // Multiplier = (Total Squares / Remaining Diamonds) * (1 - House Edge)
    // Let's use a simpler one for now
    let multiplier = 1.0;
    for (let i = 0; i < found; i++) {
        multiplier *= (20 - i) / (20 - i - bombs);
    }
    return multiplier * 0.93; // 7% house edge (increased from 5%)
  };

  const getEmbed = (multiplier: number) => {
    return new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('💣 Mines - Encontre os Diamantes!')
      .setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()} Odiondos\n**Bombas:** ${bombs}\n**Diamantes Encontrados:** ${diamondsFound}\n**Multiplicador Atual:** ${multiplier.toFixed(2)}x\n**Possível Ganho:** 🪙 ${Math.floor(bet * multiplier).toLocaleString()} Odiondos`)
      .setFooter({ text: 'Escolha um número de 1 a 20 para revelar!' });
  };

  const getRows = () => {
    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let i = 0; i < 4; i++) {
      const row = new ActionRowBuilder<ButtonBuilder>();
      for (let j = 0; j < 5; j++) {
        const index = i * 5 + j;
        const button = new ButtonBuilder()
          .setCustomId(`mines_cell_${index}`)
          .setLabel((index + 1).toString())
          .setStyle(revealed[index] ? ButtonStyle.Secondary : ButtonStyle.Primary)
          .setDisabled(revealed[index] || isGameOver || isCashedOut);
        row.addComponents(button);
      }
      rows.push(row);
    }
    
    const cashOutRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId('mines_cashout')
        .setLabel('Cash Out')
        .setStyle(ButtonStyle.Success)
        .setDisabled(diamondsFound === 0 || isGameOver || isCashedOut)
    );
    rows.push(cashOutRow);
    return rows;
  };

  const initialCanvas = await createMinesCanvas(grid, revealed);
  const attachment = new AttachmentBuilder(initialCanvas, { name: 'mines.png' });
  const embed = getEmbed(1.0);
  embed.setImage('attachment://mines.png');

  if (interaction.isButton()) {
    await interaction.editReply({ embeds: [embed], components: getRows(), files: [attachment] });
  } else {
    await interaction.editReply({ embeds: [embed], components: getRows(), files: [attachment] });
  }

  const message = await interaction.fetchReply();

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    filter: (i) => i.user.id === userId,
    time: 300000, // 5 minutes
  });

  collector.on('collect', async (i) => {
    await i.deferUpdate();

    if (i.customId === 'mines_cashout') {
      isCashedOut = true;
      collector.stop('cashed_out');
      
      const multiplier = calculateMultiplier(diamondsFound);
      const winAmount = Math.floor(bet * multiplier);
      updateBalance(userId, winAmount);
      const result = recordBet(userId, bet, winAmount, 'mines');
      
      if (result.isBigWin) {
        logBigWin(interaction.client, userId, winAmount, 'Mines');
      }

      const finalCanvas = await createMinesCanvas(grid, revealed, true);
      const finalAttachment = new AttachmentBuilder(finalCanvas, { name: 'mines_final.png' });
      
      const winEmbed = new EmbedBuilder()
        .setColor('#2ecc71')
        .setTitle('💰 Cash Out Realizado!')
        .setDescription(`Você encontrou **${diamondsFound}** diamantes e ganhou **🪙 ${winAmount.toLocaleString()}** Odiondos! (Multiplicador: ${multiplier.toFixed(2)}x)`)
        .setImage('attachment://mines_final.png')
        .setTimestamp();

      await i.editReply({ embeds: [winEmbed], components: [], files: [finalAttachment] }).catch(console.error);
      return;
    }

    const index = parseInt(i.customId.split('_')[2]);
    revealed[index] = true;

    if (grid[index] === 'bomb') {
      isGameOver = true;
      collector.stop('game_over');
      
      recordBet(userId, bet, 0, 'mines');

      const bombCanvas = await createMinesCanvas(grid, revealed, true);
      const bombAttachment = new AttachmentBuilder(bombCanvas, { name: 'mines_bomb.png' });

      const bombEmbed = new EmbedBuilder()
        .setColor('#ff4757')
        .setTitle('💥 BOOM! Você pisou em uma bomba!')
        .setDescription(`Você perdeu **🪙 ${bet.toLocaleString()}** Odiondos.`)
        .setImage('attachment://mines_bomb.png')
        .setTimestamp();

      await i.editReply({ embeds: [bombEmbed], components: [], files: [bombAttachment] }).catch(console.error);
    } else {
      diamondsFound++;
      const multiplier = calculateMultiplier(diamondsFound);
      
      const updatedCanvas = await createMinesCanvas(grid, revealed);
      const updatedAttachment = new AttachmentBuilder(updatedCanvas, { name: 'mines_update.png' });
      
      const updatedEmbed = getEmbed(multiplier);
      updatedEmbed.setImage('attachment://mines_update.png');

      await i.editReply({ embeds: [updatedEmbed], components: getRows(), files: [updatedAttachment] }).catch(console.error);
    }
  });
}
