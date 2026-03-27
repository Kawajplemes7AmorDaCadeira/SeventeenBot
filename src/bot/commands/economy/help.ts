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
          value: '`/profile` - Veja seu saldo, nível e estatísticas.\n`/daily` - Resgate seus Odiondos diários.\n`/pay` - Transfira Odiondos para outro usuário.',
          inline: false
        },
        {
          name: '🎮 Jogos',
          value: '`/casino` - Entre no lobby do cassino e escolha seu jogo!\n`/blackjack` - Jogue uma partida de Blackjack (21).\n`/slots` - Jogue no caça-níqueis.\n`/roleta` - Jogue na roleta europeia.\n`/coinflip` - Cara ou coroa.\n`/crash` - Multiplicador dinâmico.\n`/mines` - Encontre os diamantes.\n`/duelo` - Desafie alguém para dados.',
          inline: false
        },
        {
          name: 'ℹ️ Utilidades',
          value: '`/help` - Mostra a lista de todos os comandos disponíveis.\n`/leaderboard` - Veja o ranking dos melhores jogadores.',
          inline: false
        }
      )
      .setFooter({ text: 'Divirta-se e jogue com responsabilidade!' });

    await interaction.reply({ embeds: [embed] });
  },
};
