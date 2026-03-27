import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { playMines } from '../../games/mines/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mines')
    .setDescription('💣 [Jogos] Encontre os diamantes e evite as bombas para ganhar Odiondos!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(10))
    .addIntegerOption(option =>
      option.setName('bombas')
        .setDescription('A quantidade de bombas (1-24)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(24)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const bombs = interaction.options.getInteger('bombas', true);
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    await playMines(interaction, bet, bombs);
  },
};
