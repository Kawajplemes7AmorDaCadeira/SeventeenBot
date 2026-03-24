import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { updateBalance, getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('withdraw')
    .setDescription('💰 [Economia] Remove fichas de um usuário (Apenas Admins).')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option => 
      option.setName('user')
        .setDescription('O usuário que perderá as fichas')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('A quantidade de fichas')
        .setRequired(true)
        .setMinValue(1))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction: ChatInputCommandInteraction) {
    const targetUser = interaction.options.getUser('user', true);
    const amount = interaction.options.getInteger('amount', true);

    const userData = getUser(targetUser.id);
    if (userData.balance < amount) {
      return interaction.reply({ content: `O usuário não tem fichas suficientes. Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    updateBalance(targetUser.id, -amount);

    await interaction.reply({ content: `Foram removidas 🪙 ${amount} fichas de ${targetUser.username}.`, ephemeral: false });
  },
};
