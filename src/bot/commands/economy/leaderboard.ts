import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getLeaderboard } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('🏆 [Economia] Veja os melhores jogadores do cassino!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addStringOption(option =>
      option.setName('category')
        .setDescription('A categoria do ranking')
        .setRequired(false)
        .addChoices(
          { name: 'Saldo', value: 'balance' },
          { name: 'Total Ganho', value: 'total_won' },
          { name: 'Nível', value: 'level' },
          { name: 'Slots', value: 'slots_won' },
          { name: 'Blackjack', value: 'blackjack_won' },
          { name: 'Roleta', value: 'roulette_won' },
          { name: 'Coinflip', value: 'coinflip_won' }
        )),
  async execute(interaction: ChatInputCommandInteraction) {
    const category = (interaction.options.getString('category') || 'balance') as any;
    const leaderboard = getLeaderboard(category);

    const categoryNames: Record<string, string> = {
      balance: 'Saldo',
      total_won: 'Total Ganho',
      level: 'Nível',
      slots_won: 'Ganhos em Slots',
      blackjack_won: 'Ganhos em Blackjack',
      roulette_won: 'Ganhos em Roleta',
      coinflip_won: 'Ganhos em Coinflip'
    };

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle(`🏆 Ranking - ${categoryNames[category]}`)
      .setTimestamp();

    if (leaderboard.length === 0) {
      embed.setDescription('Nenhum jogador encontrado no ranking ainda.');
    } else {
      const list = leaderboard.map((entry, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
        const value = category === 'level' ? `Nível ${entry.value}` : `🪙 ${entry.value.toLocaleString()}`;
        return `${medal} <@${entry.id}> - **${value}**`;
      }).join('\n');
      
      embed.setDescription(list);
    }

    await interaction.reply({ embeds: [embed] });
  },
};
