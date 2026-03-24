import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser, getUserAchievements } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('👤 [Info] Veja o seu perfil completo do cassino!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option =>
      option.setName('user')
        .setDescription('O usuário para ver o perfil')
        .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = getUser(targetUser.id);
    const achievements = getUserAchievements(targetUser.id);

    const totalWon = userData.total_won || 0;
    const totalBet = userData.total_bet || 0;
    const profit = totalWon - totalBet;
    const profitEmoji = profit >= 0 ? '📈' : '📉';
    
    const level = userData.level || 1;
    const xp = userData.xp || 0;
    const nextLevelXP = level * 1000;
    const progress = Math.floor((xp / nextLevelXP) * 10);
    const progressBar = '🟦'.repeat(progress) + '⬜'.repeat(10 - progress);

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setAuthor({ name: `Perfil de ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
      .setTitle('👤 Informações do Jogador')
      .setThumbnail(targetUser.displayAvatarURL())
      .addFields(
        { name: '⭐ Nível', value: `Nível **${level}** (${xp}/${nextLevelXP} XP)\n${progressBar}`, inline: false },
        { name: '💰 Saldo', value: `**🪙 ${(userData.balance || 0).toLocaleString()}**`, inline: true },
        { name: '📊 Lucro Total', value: `${profitEmoji} **🪙 ${profit.toLocaleString()}**`, inline: true },
        { name: '\u200B', value: '\u200B', inline: true },
        { name: '🎰 Slots', value: `🪙 ${(userData.slots_won || 0).toLocaleString()}`, inline: true },
        { name: '🃏 Blackjack', value: `🪙 ${(userData.blackjack_won || 0).toLocaleString()}`, inline: true },
        { name: '🎡 Roleta', value: `🪙 ${(userData.roulette_won || 0).toLocaleString()}`, inline: true },
        { name: '🪙 Coinflip', value: `🪙 ${(userData.coinflip_won || 0).toLocaleString()}`, inline: true },
        { name: '🏆 Conquistas', value: achievements.length > 0 ? achievements.map(a => `• **${a.name}**`).join('\n') : 'Nenhuma conquista ainda.', inline: false }
      )
      .setFooter({ text: `ID: ${targetUser.id}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
