import { Client, EmbedBuilder, TextChannel, AttachmentBuilder } from 'discord.js';
import { config } from '../config.js';
import { generateCelebrationImage } from './ai.js';

export async function logBigWin(client: Client, userId: string, amount: number, game: string) {
  if (!config.LOG_CHANNEL_ID) return;

  try {
    const channel = await client.channels.fetch(config.LOG_CHANNEL_ID) as TextChannel;
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🎉 GRANDE VITÓRIA!')
      .setDescription(`🚀 <@${userId}> acaba de ganhar **🪙 ${amount.toLocaleString()}** Odiondos no **${game}**!`)
      .setTimestamp();

    // Generate AI celebration image for very big wins
    if (amount >= 100000) {
      const imageUrl = await generateCelebrationImage(game, amount);
      if (imageUrl) {
        const base64Data = imageUrl.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const attachment = new AttachmentBuilder(buffer, { name: 'celebration.png' });
        embed.setImage('attachment://celebration.png');
        await channel.send({ embeds: [embed], files: [attachment] });
        return;
      }
    }

    await channel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error logging big win:', error);
  }
}
