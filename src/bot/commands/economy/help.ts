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
      .setTitle('📚 Central de Ajuda - Cassino Odiondos')
      .setDescription('Bem-vindo ao Cassino Odiondos! Aqui estão todos os comandos disponíveis para você se divertir e gerenciar sua fortuna:')
      .addFields(
        {
          name: '💰 Economia & Perfil',
          value: 
            '`/profile` - Veja seu saldo, nível, conquistas e estatísticas.\n' +
            '`/daily` - Resgate sua recompensa diária de Odiondos.\n' +
            '`/mesada` - Receba uma pequena quantia se estiver sem saldo.\n' +
            '`/pay` - Transfira Odiondos para outros jogadores.\n' +
            '`/shop` - Visite a loja para comprar visuais de cartas e mesas.\n' +
            '`/inventory` - Gerencie e equipe seus itens comprados.\n' +
            '`/missions` - Veja e complete missões para ganhar bônus.\n' +
            '`/leaderboard` - Veja o ranking global dos magnatas.',
          inline: false
        },
        {
          name: '🎮 Jogos de Cassino',
          value: 
            '`/casino` - **Lobby Principal**: Acesse todos os jogos em um só lugar!\n' +
            '`/blackjack` - O clássico 21 contra o dealer.\n' +
            '`/poker` - Jogue Poker Texas Hold\'em contra a casa.\n' +
            '`/slots` - Tente a sorte no caça-níqueis temático.\n' +
            '`/roulette` - Aposte na roleta europeia.\n' +
            '`/mines` - Campo minado: multiplique sua aposta com cuidado.\n' +
            '`/crash` - O foguete sobe: pare antes que ele exploda!\n' +
            '`/coinflip` - Aposte no cara ou coroa.\n' +
            '`/corrida` - Aposte em corridas de cavalos emocionantes.\n' +
            '`/duelo` - Desafie um amigo para um duelo de dados.',
          inline: false
        },
        {
          name: 'ℹ️ Informações',
          value: 
            '`/help` - Mostra esta lista de comandos.\n' +
            '**Eventos:** Fique atento ao chat para multiplicadores globais!',
          inline: false
        }
      )
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .setFooter({ text: 'Jogue com responsabilidade • Cassino Odiondos © 2026' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
