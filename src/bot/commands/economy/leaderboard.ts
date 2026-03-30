import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getLeaderboard, getUserRank } from '../../database/db.js';

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
          { name: 'Coinflip', value: 'coinflip_won' },
          { name: 'Corrida', value: 'corrida_won' },
          { name: 'Poker', value: 'poker_won' }
        )),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();

    const category = (interaction.options.getString('category') || 'balance') as any;
    const leaderboard = getLeaderboard(category, 10);
    const userRankInfo = getUserRank(interaction.user.id, category);

    const categoryNames: Record<string, string> = {
      balance: '💰 Maior Saldo',
      total_won: '📈 Total Ganho',
      level: '⭐ Maior Nível',
      slots_won: '🎰 Ganhos em Slots',
      blackjack_won: '🃏 Ganhos em Blackjack',
      roulette_won: '🎡 Ganhos em Roleta',
      coinflip_won: '🪙 Ganhos em Coinflip',
      corrida_won: '🏎️ Ganhos na Corrida',
      poker_won: '♠️ Ganhos em Poker'
    };

    const embed = new EmbedBuilder()
      .setColor('#FFD700')
      .setTitle(`🏆 Ranking Global | ${categoryNames[category]}`)
      .setThumbnail(interaction.user.displayAvatarURL() || null)
      .setTimestamp();

    if (leaderboard.length === 0) {
      embed.setDescription('*Nenhum jogador encontrado no ranking ainda.*');
    } else {
      const list = await Promise.all(leaderboard.map(async (entry, index) => {
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        else medal = `\`#${index + 1}\``;

        let username = 'Usuário Desconhecido';
        try {
          const user = await interaction.client.users.fetch(entry.id);
          username = user.username;
        } catch (e) {
          // Ignore if user not found
        }

        const value = category === 'level' ? `Nível ${entry.value}` : `🪙 **${entry.value.toLocaleString('pt-BR')}**`;
        return `${medal} **${username}** — ${value}`;
      }));
      
      embed.setDescription(list.join('\n\n'));
    }

    if (userRankInfo) {
      const userValue = category === 'level' ? `Nível ${userRankInfo.value}` : `🪙 ${userRankInfo.value.toLocaleString('pt-BR')}`;
      embed.addFields({
        name: 'Sua Posição',
        value: `Você está em **#${userRankInfo.rank}** com ${userValue}.`
      });
    }

    await interaction.editReply({ embeds: [embed] });
  },
};
