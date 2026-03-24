import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser, updateBalance, updateCooldown } from '../../database/db.js';

const workMessages = [
  'Você trabalhou como dealer no cassino e ganhou **🪙 {amount}** fichas.',
  'Você limpou as mesas de blackjack e recebeu **🪙 {amount}** de gorjeta.',
  'Você consertou uma máquina de slots quebrada e o dono te pagou **🪙 {amount}** fichas.',
  'Você serviu drinks para um grande apostador e ele te deu **🪙 {amount}** fichas.',
  'Você foi o segurança do cassino por uma noite e recebeu **🪙 {amount}** fichas.',
  'Você encontrou algumas fichas perdidas embaixo de uma mesa e pegou **🪙 {amount}** para você.',
];

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('💼 [Economia] Trabalhe para ganhar algumas fichas!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const userData = getUser(userId);
    
    const now = Date.now();
    const lastWork = userData.last_work || 0;
    const cooldown = 60 * 60 * 1000; // 1 hour
    
    if (now - lastWork < cooldown) {
      const remaining = cooldown - (now - lastWork);
      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      
      return interaction.reply({
        content: `⏳ Você está cansado! Volte a trabalhar em **${minutes}m ${seconds}s**.`,
        ephemeral: true
      });
    }
    
    const amount = Math.floor(Math.random() * (300 - 100 + 1)) + 100; // 100-300
    updateBalance(userId, amount);
    updateCooldown(userId, 'work');
    
    const message = workMessages[Math.floor(Math.random() * workMessages.length)].replace('{amount}', amount.toLocaleString());
    
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('💼 Dia de Trabalho')
      .setDescription(message)
      .setFooter({ text: 'Volte em 1 hora para trabalhar novamente.' })
      .setTimestamp();
      
    await interaction.reply({ embeds: [embed] });
  },
};
