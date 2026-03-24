import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('balance')
    .setDescription('💰 [Economia] Exibe o seu saldo atual ou o de outro usuário.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option => 
      option.setName('user')
        .setDescription('O usuário para ver o saldo')
        .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = getUser(targetUser.id);

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setAuthor({ name: `Carteira de ${targetUser.username}`, iconURL: targetUser.displayAvatarURL() })
      .setTitle('💰 Saldo Atual')
      .setDescription(`<@${targetUser.id}> possui atualmente:\n\n**🪙 ${(userData.balance || 0).toLocaleString()}** fichas`)
      .setFooter({ text: 'Use /profile para ver estatísticas detalhadas', iconURL: interaction.client.user?.displayAvatarURL() })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
