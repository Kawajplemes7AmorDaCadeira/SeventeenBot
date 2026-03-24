import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getItems, buyItem } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 [Economia] Compre itens e boosters para o cassino!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const items = getItems();
    
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🛒 Loja do Cassino')
      .setDescription('Selecione um item no menu abaixo para comprar. Itens dão bônus permanentes!')
      .setTimestamp();
      
    const select = new StringSelectMenuBuilder()
      .setCustomId('shop_buy')
      .setPlaceholder('Escolha um item para comprar...');
      
    items.forEach(item => {
      embed.addFields({ 
        name: `${item.name} - 🪙 ${item.price.toLocaleString()}`, 
        value: item.description, 
        inline: false 
      });
      
      select.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(`Preço: 🪙 ${item.price.toLocaleString()}`)
          .setValue(item.id)
      );
    });
    
    const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);
    
    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

export async function handleShopSelect(interaction: any) {
  const itemId = interaction.values[0];
  const userId = interaction.user.id;
  
  const result = buyItem(userId, itemId);
  
  if (!result.success) {
    return interaction.reply({ content: `❌ ${result.message}`, ephemeral: true });
  }
  
  const item = getItems().find(i => i.id === itemId);
  await interaction.reply({ content: `✅ Você comprou **${item.name}** com sucesso!`, ephemeral: true });
}
