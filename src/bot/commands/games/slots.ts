import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { playSlots } from '../../games/slots/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('🎮 [Jogos] Jogue no caça-níqueis.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(1)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: `Você não tem fichas suficientes! Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    await playSlots(interaction, bet);
  },
};
