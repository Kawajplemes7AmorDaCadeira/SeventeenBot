import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('ℹ️ [Utilidades] Mostra a lista de todos os comandos disponíveis.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📚 Lista de Comandos')
      .setDescription('Aqui estão todos os comandos disponíveis, divididos por categorias:')
      .addFields(
        {
          name: '💰 Economia',
          value: '`/balance` - Exibe o seu saldo atual.\n`/daily` - Resgate suas fichas diárias.\n`/work` - Trabalhe para ganhar fichas.\n`/pay` - Transfira fichas para outro usuário.\n`/shop` - Compre itens e boosters.\n`/inventory` - Veja seus itens comprados.',
          inline: false
        },
        {
          name: '🎮 Jogos',
          value: '`/blackjack` - Jogue uma partida de Blackjack (21).\n`/slots` - Jogue no caça-níqueis.\n`/roleta` - Jogue na roleta europeia.\n`/coinflip` - Cara ou coroa.',
          inline: false
        },
        {
          name: 'ℹ️ Utilidades',
          value: '`/help` - Mostra a lista de todos os comandos disponíveis.\n`/leaderboard` - Veja o ranking dos melhores jogadores.\n`/profile` - Veja o seu perfil completo e estatísticas.',
          inline: false
        }
      )
      .setFooter({ text: 'Divirta-se e jogue com responsabilidade!' });

    await interaction.reply({ embeds: [embed] });
  },
};
