import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUserItems } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('🎒 [Economia] Veja seus itens e boosters comprados.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const items = getUserItems(userId);
    
    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('🎒 Seu Inventário')
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp();
      
    if (items.length === 0) {
      embed.setDescription('Você ainda não possui nenhum item. Visite a `/shop`!');
    } else {
      items.forEach(item => {
        embed.addFields({ 
          name: `${item.name} (x${item.quantity})`, 
          value: item.description, 
          inline: false 
        });
      });
    }
    
    await interaction.reply({ embeds: [embed] });
  },
};
