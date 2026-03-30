import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { startPokerGame } from '../../games/poker/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('poker')
    .setDescription("🎮 [Jogos] Jogue uma partida de Texas Hold'em Poker contra o bot.")
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor do Big Blind (Aposta inicial) - Padrão: 100')
        .setRequired(false)
        .setMinValue(1)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta') || 100;
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: `Você não tem Odiondos suficientes para essa aposta! Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    await startPokerGame(interaction, bet);
  },
};
