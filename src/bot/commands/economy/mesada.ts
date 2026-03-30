import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';
import { getUser, updateBalance, updateCooldown } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mesada')
    .setDescription('💰 Receba sua mesada periódica com bônus por nível!'),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const user = getUser(userId);
    const now = Date.now();
    const cooldown = 60 * 60 * 1000; // 60 minutes
    const lastMesada = user.last_mesada || 0;

    if (now - lastMesada < cooldown) {
      const remaining = cooldown - (now - lastMesada);
      const minutes = Math.floor(remaining / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
      
      return interaction.reply({ 
        content: `⏰ Calma lá! Você já pegou sua mesada. Volte em **${minutes}m ${seconds}s**.`, 
        ephemeral: true 
      });
    }

    const baseAmount = 1000;
    const level = user.level || 1;
    
    // Formula: 1000 * (1 + 0.1 * (2^(level-1) - 1))
    // This follows the user's request: +0.1, +0.2, +0.4, +0.8... per level
    const bonusMultiplier = 0.1 * (Math.pow(2, level - 1) - 1);
    const totalAmount = Math.floor(baseAmount * (1 + bonusMultiplier));

    updateBalance(userId, totalAmount);
    updateCooldown(userId, 'mesada');

    const embed = new EmbedBuilder()
      .setColor('#2ecc71')
      .setTitle('💰 Mesada Recebida!')
      .setDescription(`Você recebeu sua mesada de **🪙 ${totalAmount.toLocaleString()}** Odiondos!`)
      .addFields(
        { name: 'Base', value: `🪙 ${baseAmount.toLocaleString()}`, inline: true },
        { name: 'Bônus de Nível', value: `+ 🪙 ${(totalAmount - baseAmount).toLocaleString()} (Nível ${level})`, inline: true }
      )
      .setTimestamp()
      .setFooter({ text: 'Volte em 60 minutos para mais!' });

    await interaction.reply({ embeds: [embed] });
  },
};
