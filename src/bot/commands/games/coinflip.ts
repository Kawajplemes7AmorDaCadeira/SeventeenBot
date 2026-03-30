import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType, ButtonInteraction } from 'discord.js';
import { getUser, updateBalance, recordBet, addActiveBet, removeActiveBet } from '../../database/db.js';
import { logBigWin } from '../../utils/logger.js';

export async function playCoinflip(interaction: ChatInputCommandInteraction | ButtonInteraction, bet: number, side: string) {
  const userId = interaction.user.id;
  const userData = getUser(userId);

  if (userData.balance < bet) {
    const msg = '❌ Você não tem Odiondos suficientes para essa aposta!';
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: msg, ephemeral: true });
    }
    return interaction.reply({ content: msg, ephemeral: true });
  }

  const betId = `${userId}_${Date.now()}`;
  addActiveBet(betId, userId, bet, 'coinflip');

  // Deduct bet
  updateBalance(userId, -bet);

  const result = Math.random() < 0.49 ? side : (side === 'heads' ? 'tails' : 'heads');
  const isWin = result === side;
  const resultName = result === 'heads' ? 'Cara' : 'Coroa';
  const sideName = side === 'heads' ? 'Cara' : 'Coroa';
  let gameResult: any = {};

  // Loading Animation with GIF
  const spinningEmbed = new EmbedBuilder()
    .setColor('#f1c40f')
    .setTitle('🪙 Cara ou Coroa')
    .setDescription(`Você apostou **🪙 ${bet.toLocaleString()}** em **${sideName}**.\n\nGirando a moeda... 🔄`)
    .setImage('https://media.tenor.com/XqTfW1m9h5EAAAAi/spinning-coin.gif');

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: null, embeds: [spinningEmbed], components: [] });
  } else if (interaction.isButton()) {
    await interaction.deferUpdate();
    await interaction.editReply({ content: null, embeds: [spinningEmbed], components: [] });
  } else {
    await interaction.deferReply();
    await interaction.editReply({ embeds: [spinningEmbed] });
  }
  
  // Wait for the coin to spin
  await new Promise(resolve => setTimeout(resolve, 1000));

  const finalEmbed = new EmbedBuilder()
    .setTitle('🪙 Cara ou Coroa')
    .setTimestamp();

  const resultImage = result === 'heads' 
    ? 'https://cdn-icons-png.flaticon.com/512/1490/1490844.png' // Coin with star (Cara)
    : 'https://cdn-icons-png.flaticon.com/512/1490/1490853.png'; // Coin with number 1 (Coroa)

  finalEmbed.setThumbnail(resultImage);

  if (isWin) {
    const winAmount = bet * 2;
    updateBalance(userId, winAmount);
    gameResult = recordBet(userId, bet, winAmount, 'coinflip');
    
    if (gameResult.isBigWin) {
      logBigWin(interaction.client, interaction.user.id, winAmount, 'Cara ou Coroa');
    }
    
    finalEmbed.setColor('#2ecc71')
      .setDescription(`A moeda caiu em... **${resultName}**!\n\n🎉 Você escolheu **${sideName}** e ganhou **🪙 ${winAmount.toLocaleString()}** Odiondos!`);
  } else {
    gameResult = recordBet(userId, bet, 0, 'coinflip');
    
    finalEmbed.setColor('#e74c3c')
      .setDescription(`A moeda caiu em... **${resultName}**!\n\n😢 Você escolheu **${sideName}** e perdeu **🪙 ${bet.toLocaleString()}** Odiondos.`);
  }
  
  if (gameResult.newLevel) {
    finalEmbed.setDescription(finalEmbed.data.description + `\n\n⭐ **LEVEL UP!** Você agora é nível **${gameResult.newLevel}**!`);
  }
  
  if (gameResult.unlockedAchievements && gameResult.unlockedAchievements.length > 0) {
    gameResult.unlockedAchievements.forEach((ach: any) => {
      finalEmbed.setDescription(finalEmbed.data.description + `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`);
    });
  }

  removeActiveBet(betId);
  await interaction.editReply({ embeds: [finalEmbed] });
}

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
    const bet = interaction.options.getInteger('bet')!;
    const side = interaction.options.getString('side')!;
    await playCoinflip(interaction, bet, side);
  },
};
