import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { startGame } from '../../games/blackjack/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('🎮 [Jogos] Jogue uma partida de Blackjack (21).')
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

    await startGame(interaction, bet);
  },
};
