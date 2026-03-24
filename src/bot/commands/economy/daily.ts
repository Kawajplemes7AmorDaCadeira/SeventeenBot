import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import db, { getUser, updateBalance, updateCooldown, checkAchievements } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('🎁 [Economia] Resgate suas fichas diárias!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const userData = getUser(userId);
    
    const now = Date.now();
    const lastDaily = userData.last_daily || 0;
    const cooldown = 24 * 60 * 60 * 1000; // 24 hours
    const streakWindow = 48 * 60 * 60 * 1000; // 48 hours to keep streak
    
    if (now - lastDaily < cooldown) {
      const remaining = cooldown - (now - lastDaily);
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      
      return interaction.reply({
        content: `⏳ Você já resgatou seu prêmio hoje! Volte em **${hours}h ${minutes}m**.`,
        ephemeral: true
      });
    }
    
    let streak = userData.daily_streak || 0;
    if (now - lastDaily < streakWindow) {
      streak += 1;
    } else {
      streak = 1;
    }
    
    const baseReward = 1000;
    const streakBonus = Math.min(streak * 100, 2000); // Max 2000 bonus
    const totalReward = baseReward + streakBonus;
    
    updateBalance(userId, totalReward);
    updateCooldown(userId, 'daily');
    db.prepare('UPDATE users SET daily_streak = ? WHERE id = ?').run(streak, userId);
    
    const unlockedAchievements = checkAchievements(userId, 0);
    
    let description = `Parabéns! Você resgatou suas **🪙 ${totalReward.toLocaleString()}** fichas diárias.\n\n🔥 Sequência atual: **${streak} dias**\n💰 Bônus de sequência: **🪙 ${streakBonus}**`;
    
    if (unlockedAchievements.length > 0) {
      unlockedAchievements.forEach((ach: any) => {
        description += `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`;
      });
    }

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🎁 Recompensa Diária')
      .setDescription(description)
      .setFooter({ text: 'Volte amanhã para manter sua sequência!' })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed] });
  },
};
