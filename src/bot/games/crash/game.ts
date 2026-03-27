import { ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ButtonInteraction } from 'discord.js';
import { getUser, updateBalance, recordBet } from '../../database/db.js';
import { createCrashCanvas } from './canvas.js';
import { logBigWin } from '../../utils/logger.js';

export async function playCrash(interaction: ChatInputCommandInteraction | ButtonInteraction, bet: number) {
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

  // Calculate crash point
  // 0.97 / (1 - Math.random()) gives a distribution where 1.0x is possible but rare, and high multipliers are possible but rarer.
  // We'll cap it at 100x for safety.
  let crashPoint = 0.97 / (1 - Math.random());
  crashPoint = Math.min(100, Math.max(1.0, crashPoint));

  let currentMultiplier = 1.0;
  let isCashedOut = false;
  let isCrashed = false;

  const embed = new EmbedBuilder()
    .setColor('#2ecc71')
    .setTitle('🚀 Crash - Decolagem!')
    .setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()} Odiondos\n**Multiplicador Atual:** 1.00x`)
    .setFooter({ text: 'Clique em "Cash Out" para garantir seu lucro antes do crash!' });

  const cashOutButton = new ButtonBuilder()
    .setCustomId('crash_cashout')
    .setLabel('Cash Out')
    .setStyle(ButtonStyle.Success);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(cashOutButton);

  const initialCanvas = await createCrashCanvas(currentMultiplier);
  const attachment = new AttachmentBuilder(initialCanvas, { name: 'crash.png' });
  embed.setImage('attachment://crash.png');

  if (interaction.isButton()) {
    await interaction.editReply({ embeds: [embed], components: [row], files: [attachment] });
  } else {
    await interaction.editReply({ embeds: [embed], components: [row], files: [attachment] });
  }

  const message = await interaction.fetchReply();

  const collector = message.createMessageComponentCollector({
    filter: (i) => i.user.id === userId && i.customId === 'crash_cashout',
    time: 60000, // 1 minute max
  });

  collector.on('collect', async (i) => {
    await i.deferUpdate();
    isCashedOut = true;
    collector.stop('cashed_out');
    
    const winAmount = Math.floor(bet * currentMultiplier);
    updateBalance(userId, winAmount);
    const result = recordBet(userId, bet, winAmount, 'crash');
    
    if (result.isBigWin) {
      logBigWin(interaction.client, userId, winAmount, 'Crash');
    }

    const finalCanvas = await createCrashCanvas(currentMultiplier);
    const finalAttachment = new AttachmentBuilder(finalCanvas, { name: 'crash_final.png' });
    
    const winEmbed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💰 Cash Out Realizado!')
      .setDescription(`Você retirou em **${currentMultiplier.toFixed(2)}x** e ganhou **🪙 ${winAmount.toLocaleString()}** Odiondos!`)
      .setImage('attachment://crash_final.png')
      .setTimestamp();

    await i.editReply({ embeds: [winEmbed], components: [], files: [finalAttachment] }).catch(console.error);
  });

  // Game loop
  const interval = setInterval(async () => {
    if (isCashedOut || isCrashed) {
      clearInterval(interval);
      return;
    }

    // Increase multiplier
    // The higher the multiplier, the faster it increases
    const increment = 0.05 + (currentMultiplier * 0.05);
    currentMultiplier += increment;

    if (currentMultiplier >= crashPoint) {
      isCrashed = true;
      clearInterval(interval);
      collector.stop('crashed');

      recordBet(userId, bet, 0, 'crash');

      const crashCanvas = await createCrashCanvas(currentMultiplier, true);
      const crashAttachment = new AttachmentBuilder(crashCanvas, { name: 'crash_crashed.png' });

      const crashEmbed = new EmbedBuilder()
        .setColor('#ff4757')
        .setTitle('💥 CRASHED!')
        .setDescription(`O multiplicador quebrou em **${currentMultiplier.toFixed(2)}x**.\nVocê perdeu **🪙 ${bet.toLocaleString()}** Odiondos.`)
        .setImage('attachment://crash_crashed.png')
        .setTimestamp();

      await interaction.editReply({ embeds: [crashEmbed], components: [], files: [crashAttachment] }).catch(console.error);
      return;
    }

    // Update message
    const updatedCanvas = await createCrashCanvas(currentMultiplier);
    const updatedAttachment = new AttachmentBuilder(updatedCanvas, { name: 'crash_update.png' });
    
    embed.setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()} Odiondos\n**Multiplicador Atual:** ${currentMultiplier.toFixed(2)}x`);
    embed.setImage('attachment://crash_update.png');

    await interaction.editReply({ embeds: [embed], files: [updatedAttachment] }).catch(() => {
        // Handle case where message was deleted or interaction expired
        clearInterval(interval);
    });
  }, 1200); // Reduced interval for better fluidity
}
