import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { playCrash } from '../../games/crash/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crash')
    .setDescription('🚀 [Jogos] Aposte e retire antes do crash para ganhar Odiondos!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(10)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    await playCrash(interaction, bet);
  },
};
