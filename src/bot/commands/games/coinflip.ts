import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser, updateBalance, recordBet } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('🪙 [Jogos] Aposte no cara ou coroa!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(10))
    .addStringOption(option =>
      option.setName('side')
        .setDescription('Escolha um lado')
        .setRequired(true)
        .addChoices(
          { name: 'Cara', value: 'heads' },
          { name: 'Coroa', value: 'tails' }
        )),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet')!;
    const side = interaction.options.getString('side')!;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: '❌ Você não tem fichas suficientes para essa aposta!', ephemeral: true });
    }

    // Deduct bet
    updateBalance(userId, -bet);

    const result = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWin = result === side;
    const resultName = result === 'heads' ? 'Cara' : 'Coroa';
    const sideName = side === 'heads' ? 'Cara' : 'Coroa';
    let gameResult: any = {};

    const embed = new EmbedBuilder()
      .setTitle('🪙 Cara ou Coroa')
      .setTimestamp();

    if (isWin) {
      const winAmount = bet * 2;
      updateBalance(userId, winAmount);
      gameResult = recordBet(userId, bet, winAmount, 'coinflip');
      
      embed.setColor('#f1c40f')
        .setDescription(`A moeda girou e caiu em... **${resultName}**!\n\n🎉 Você escolheu **${sideName}** e ganhou **🪙 ${winAmount.toLocaleString()}** fichas!`);
    } else {
      gameResult = recordBet(userId, bet, 0, 'coinflip');
      
      embed.setColor('#e74c3c')
        .setDescription(`A moeda girou e caiu em... **${resultName}**!\n\n😢 Você escolheu **${sideName}** e perdeu **🪙 ${bet.toLocaleString()}** fichas.`);
    }
    
    if (gameResult.newLevel) {
      embed.setDescription(embed.data.description + `\n\n⭐ **LEVEL UP!** Você agora é nível **${gameResult.newLevel}**!`);
    }
    
    if (gameResult.unlockedAchievements && gameResult.unlockedAchievements.length > 0) {
      gameResult.unlockedAchievements.forEach((ach: any) => {
        embed.setDescription(embed.data.description + `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`);
      });
    }

    await interaction.reply({ embeds: [embed] });
  },
};
