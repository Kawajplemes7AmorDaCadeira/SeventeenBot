import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, ComponentType } from 'discord.js';
import { getUser, updateBalance, recordBet, addActiveBet, removeActiveBet } from '../../database/db.js';
import { createDiceCanvas } from '../../games/dice/canvas.js';
import { logBigWin } from '../../utils/logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('duelo')
    .setDescription('🎲 [Jogos] Desafie outro usuário para um duelo de dados!')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option =>
      option.setName('usuario')
        .setDescription('O usuário que você deseja desafiar')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da aposta')
        .setRequired(true)
        .setMinValue(10)),
  async execute(interaction: ChatInputCommandInteraction) {
    const target = interaction.options.getUser('usuario', true);
    const bet = interaction.options.getInteger('aposta', true);
    const challenger = interaction.user;

    if (target.id === challenger.id) {
      return interaction.reply({ content: 'Você não pode se desafiar!', ephemeral: true });
    }

    if (target.bot) {
      return interaction.reply({ content: 'Você não pode desafiar bots!', ephemeral: true });
    }

    const challengerData = getUser(challenger.id);
    const targetData = getUser(target.id);

    if (challengerData.balance < bet) {
      return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${challengerData.balance}`, ephemeral: true });
    }

    if (targetData.balance < bet) {
      return interaction.reply({ content: `O usuário desafiado não tem Odiondos suficientes!`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🎲 Desafio de Duelo de Dados!')
      .setDescription(`<@${challenger.id}> desafiou <@${target.id}> para um duelo de dados!\n\n**Aposta:** 🪙 ${bet.toLocaleString()} Odiondos\n**Total em Jogo:** 🪙 ${(bet * 2).toLocaleString()} Odiondos (Taxa de 5% será aplicada ao vencedor)`)
      .setFooter({ text: 'O desafiado tem 60 segundos para aceitar.' });

    const acceptButton = new ButtonBuilder()
      .setCustomId('duel_accept')
      .setLabel('Aceitar')
      .setStyle(ButtonStyle.Success);

    const declineButton = new ButtonBuilder()
      .setCustomId('duel_decline')
      .setLabel('Recusar')
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(acceptButton, declineButton);

    const message = await interaction.reply({ content: `<@${target.id}>`, embeds: [embed], components: [row], fetchReply: true });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: (i) => i.user.id === target.id,
      time: 60000,
    });

    collector.on('collect', async (i) => {
      await i.deferUpdate();

      if (i.customId === 'duel_decline') {
        collector.stop('declined');
        await i.editReply({ content: '❌ O desafio foi recusado.', embeds: [], components: [] }).catch(console.error);
        return;
      }

      // Check balance again
      const currentChallengerData = getUser(challenger.id);
      const currentTargetData = getUser(target.id);

      if (currentChallengerData.balance < bet || currentTargetData.balance < bet) {
        collector.stop('insufficient_funds');
        await i.editReply({ content: '❌ Um dos jogadores não tem mais saldo suficiente.', embeds: [], components: [] }).catch(console.error);
        return;
      }

      collector.stop('accepted');

      const challengerBetId = `${challenger.id}_${Date.now()}_duel`;
      const targetBetId = `${target.id}_${Date.now()}_duel`;
      addActiveBet(challengerBetId, challenger.id, bet, 'dice');
      addActiveBet(targetBetId, target.id, bet, 'dice');

      // Deduct bets
      updateBalance(challenger.id, -bet);
      updateBalance(target.id, -bet);

      // Roll dice
      const challengerRoll = Math.floor(Math.random() * 100) + 1;
      const targetRoll = Math.floor(Math.random() * 100) + 1;

      const diceCanvas = await createDiceCanvas(
        { name: challenger.username, roll: challengerRoll },
        { name: target.username, roll: targetRoll }
      );
      const attachment = new AttachmentBuilder(diceCanvas, { name: 'duel.png' });

      let resultText = '';
      let winnerId = '';
      let winAmount = 0;

      if (challengerRoll > targetRoll) {
        winnerId = challenger.id;
        winAmount = Math.floor(bet * 2 * 0.93); // 7% tax (increased from 5%)
        resultText = `🎉 <@${challenger.id}> venceu o duelo e ganhou **🪙 ${winAmount.toLocaleString()}** Odiondos!`;
        updateBalance(challenger.id, winAmount);
        const result = recordBet(challenger.id, bet, winAmount, 'dice');
        recordBet(target.id, bet, 0, 'dice');
        
        if (result.isBigWin) {
          logBigWin(interaction.client, challenger.id, winAmount, 'Duelo de Dados');
        }
      } else if (targetRoll > challengerRoll) {
        winnerId = target.id;
        winAmount = Math.floor(bet * 2 * 0.93); // 7% tax (increased from 5%)
        resultText = `🎉 <@${target.id}> venceu o duelo e ganhou **🪙 ${winAmount.toLocaleString()}** Odiondos!`;
        updateBalance(target.id, winAmount);
        const result = recordBet(target.id, bet, winAmount, 'dice');
        recordBet(challenger.id, bet, 0, 'dice');
        
        if (result.isBigWin) {
          logBigWin(interaction.client, target.id, winAmount, 'Duelo de Dados');
        }
      } else {
        resultText = '🤝 Empate! Os Odiondos foram devolvidos.';
        updateBalance(challenger.id, bet);
        updateBalance(target.id, bet);
        recordBet(challenger.id, bet, bet, 'dice');
        recordBet(target.id, bet, bet, 'dice');
      }

      const resultEmbed = new EmbedBuilder()
        .setColor(winnerId ? '#2ecc71' : '#f1c40f')
        .setTitle('🎲 Resultado do Duelo')
        .setDescription(resultText)
        .setImage('attachment://duel.png')
        .setTimestamp();

      removeActiveBet(challengerBetId);
      removeActiveBet(targetBetId);

      await i.editReply({ content: null, embeds: [resultEmbed], components: [], files: [attachment] }).catch(console.error);
    });

    collector.on('end', async (_, reason) => {
      if (reason === 'time') {
        await interaction.editReply({ content: '⏰ O tempo para aceitar o desafio expirou.', embeds: [], components: [] }).catch(console.error);
      }
    });
  },
};
