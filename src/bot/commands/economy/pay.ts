import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser, updateBalance } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('pay')
    .setDescription('💸 [Economia] Transfira Odiondos para outro usuário!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option =>
      option.setName('target')
        .setDescription('O usuário que receberá os Odiondos')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('O valor a ser transferido')
        .setRequired(true)
        .setMinValue(10)),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('target')!;
    const amount = interaction.options.getInteger('amount')!;
    const userData = getUser(userId);

    if (target.id === userId) {
      return interaction.reply({ content: '❌ Você não pode transferir Odiondos para você mesmo!', ephemeral: true });
    }

    if (target.bot) {
      return interaction.reply({ content: '❌ Você não pode transferir Odiondos para bots!', ephemeral: true });
    }

    if (userData.balance < amount) {
      return interaction.reply({ content: '❌ Você não tem Odiondos suficientes para essa transferência!', ephemeral: true });
    }

    // Transfer
    updateBalance(userId, -amount);
    updateBalance(target.id, amount);

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💸 Transferência Realizada')
      .setDescription(`Você transferiu **🪙 ${amount.toLocaleString()}** Odiondos para <@${target.id}>!`)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
