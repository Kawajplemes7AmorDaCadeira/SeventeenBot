import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { playCorrida } from '../../games/corrida/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('corrida')
    .setDescription('🐎 [Jogos] Aposte em uma corrida de cavalos!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(10))
    .addIntegerOption(option =>
      option.setName('cavalo')
        .setDescription('Escolha o cavalo vencedor (1 a 5)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(5)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const horse = interaction.options.getInteger('cavalo', true);
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (!userData || userData.balance < bet) {
      return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${userData?.balance || 0}`, ephemeral: true });
    }

    await playCorrida(interaction, bet, horse);
  },
};
