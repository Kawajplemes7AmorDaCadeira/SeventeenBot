import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getLeaderboard } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 [Info] Veja os melhores jogadores do cassino!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addStringOption(option =>
      option.setName('category')
        .setDescription('A categoria do ranking')
        .setRequired(false)
        .addChoices(
          { name: 'Saldo Atual', value: 'balance' },
          { name: 'Total Ganho (Geral)', value: 'total_won' },
          { name: 'Ganhos no Slots', value: 'slots_won' },
          { name: 'Ganhos no Blackjack', value: 'blackjack_won' },
          { name: 'Ganhos na Roleta', value: 'roulette_won' }
        )),
  async execute(interaction: ChatInputCommandInteraction) {
    const category = (interaction.options.getString('category') || 'balance') as any;
    const topPlayers = getLeaderboard(category);

    const categoryNames: Record<string, string> = {
      balance: 'Saldo Atual',
      total_won: 'Total Ganho (Geral)',
      slots_won: 'Ganhos no Slots',
      blackjack_won: 'Ganhos no Blackjack',
      roulette_won: 'Ganhos na Roleta'
    };

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle(`🏆 Ranking: ${categoryNames[category]}`)
      .setTimestamp();

    if (topPlayers.length === 0) {
      embed.setDescription('Nenhum jogador encontrado no ranking ainda.');
    } else {
      let description = '';
      for (let i = 0; i < topPlayers.length; i++) {
        const player = topPlayers[i];
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
        description += `${medal} <@${player.id}> - **🪙 ${player.value.toLocaleString()}**\n`;
      }
      embed.setDescription(description);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
