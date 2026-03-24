import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { updateBalance } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deposit')
    .setDescription('💰 [Economia] Adiciona fichas a um usuário (Apenas Admins).')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option => 
      option.setName('user')
        .setDescription('O usuário que receberá as fichas')
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

    updateBalance(targetUser.id, amount);

    await interaction.reply({ content: `Foram adicionadas 🪙 ${amount} fichas para ${targetUser.username}.`, ephemeral: false });
  },
};
