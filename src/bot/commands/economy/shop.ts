import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getItems, getUserInventory, buyItem, getUser } from '../../database/db.js';
import { generateSkinPreview, generateTablePreview } from '../../utils/preview.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('🛒 Visite a loja do cassino e compre itens exclusivos!'),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const items = getItems().sort((a, b) => a.price - b.price);
    const inventory = getUserInventory(userId);
    const user = getUser(userId);

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🛒 Loja do Cassino Odiondos')
      .setDescription(`Seu saldo: **🪙 ${user.balance.toLocaleString()}**\n\nEscolha um item no menu abaixo para ver detalhes e comprar:`)
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`shop_select_${userId}`)
      .setPlaceholder('Selecione um item para ver detalhes...');

    items.forEach((item) => {
      const isOwned = inventory.some(i => i.id === item.id);
      
      embed.addFields({
        name: `${item.name} (${isOwned ? '✅ Já possui' : `🪙 ${item.price.toLocaleString()}`})`,
        value: `${item.description}`,
        inline: true
      });

      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(`${isOwned ? '✅ Já possui' : `🪙 ${item.price.toLocaleString()}`} - ${item.description.substring(0, 50)}...`)
          .setValue(item.id)
          .setEmoji(item.type === 'skin' ? '🃏' : '🎨')
      );
    });

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    
    const backButton = new ButtonBuilder()
      .setCustomId(`lobby_back_${userId}`)
      .setLabel('Voltar ao Lobby')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎰');

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed], components: [row1, row2] });
    } else {
      await interaction.reply({ embeds: [embed], components: [row1, row2] });
    }
  },
};

export async function handleShopButton(interaction: any) {
  const parts = interaction.customId.split('_');
  const action = parts[1]; // 'buy', 'preview', or 'select'
  const userId = parts.pop();
  
  if (interaction.user.id !== userId) {
    const content = 'Esta loja não é sua!';
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content, ephemeral: true }).catch(console.error);
    }
    return interaction.reply({ content, ephemeral: true }).catch(console.error);
  }

  if (action === 'select') {
    const itemId = interaction.values[0];
    const items = getItems().sort((a, b) => a.price - b.price);
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const inventory = getUserInventory(userId);
    const user = getUser(userId);
    const isOwned = inventory.some(i => i.id === item.id);

    const detailEmbed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle(`🛒 Detalhes: ${item.name}`)
      .setDescription(`${item.description}\n\n**Preço:** 🪙 ${item.price.toLocaleString()}\n**Tipo:** ${item.type === 'skin' ? 'Visual de Carta' : 'Visual de Mesa'}\n**Status:** ${isOwned ? '✅ Já possui' : '❌ Não possui'}`)
      .setTimestamp();

    const buyButton = new ButtonBuilder()
      .setCustomId(`shop_buy_${item.id}_${userId}`)
      .setLabel(isOwned ? 'Já possui' : `Comprar por 🪙 ${item.price.toLocaleString()}`)
      .setStyle(ButtonStyle.Primary)
      .setDisabled(isOwned || user.balance < item.price);

    const previewButton = new ButtonBuilder()
      .setCustomId(`shop_preview_${item.id}_${userId}`)
      .setLabel(`👁️ Ver Preview`)
      .setStyle(ButtonStyle.Secondary);

    const backToShopButton = new ButtonBuilder()
      .setCustomId(`shop_back_${userId}`)
      .setLabel('Voltar à Loja')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(buyButton, previewButton, backToShopButton);

    return interaction.update({ embeds: [detailEmbed], components: [row] });
  }

  if (action === 'back') {
    // Re-run the execute logic to show the main shop view
    const items = getItems().sort((a, b) => a.price - b.price);
    const inventory = getUserInventory(userId);
    const user = getUser(userId);

    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🛒 Loja do Cassino Odiondos')
      .setDescription(`Seu saldo: **🪙 ${user.balance.toLocaleString()}**\n\nEscolha um item no menu abaixo para ver detalhes e comprar:`)
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`shop_select_${userId}`)
      .setPlaceholder('Selecione um item para ver detalhes...');

    items.forEach((item) => {
      const isOwned = inventory.some(i => i.id === item.id);
      embed.addFields({
        name: `${item.name} (${isOwned ? '✅ Já possui' : `🪙 ${item.price.toLocaleString()}`})`,
        value: `${item.description}`,
        inline: true
      });
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(`${isOwned ? '✅ Já possui' : `🪙 ${item.price.toLocaleString()}`} - ${item.description.substring(0, 50)}...`)
          .setValue(item.id)
          .setEmoji(item.type === 'skin' ? '🃏' : '🎨')
      );
    });

    const row1 = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(selectMenu);
    const backButton = new ButtonBuilder()
      .setCustomId(`lobby_back_${userId}`)
      .setLabel('Voltar ao Lobby')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎰');
    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);

    return interaction.update({ embeds: [embed], components: [row1, row2] });
  }

  const itemId = parts.slice(2).join('_');

  if (action === 'preview') {
    try {
      const items = getItems();
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      const metadata = JSON.parse(item.metadata || '{}');
      const color = metadata.color || (item.type === 'skin' ? '#b71c1c' : '#1a4a1a');
      const style = metadata.style || 'classic';

      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true }).catch(console.error);
      }

      let previewBuffer: Buffer;
      if (item.type === 'skin') {
        previewBuffer = await generateSkinPreview(item.name, color, style);
      } else if (item.type === 'table_skin') {
        previewBuffer = await generateTablePreview(item.name, color);
      } else {
        return interaction.editReply({ content: 'Este item não possui preview.' }).catch(console.error);
      }

      const attachment = new AttachmentBuilder(previewBuffer, { name: 'preview.png' });

      await interaction.editReply({ 
        content: `🎨 **Preview do item: ${item.name}**`,
        files: [attachment]
      }).catch(console.error);
    } catch (error) {
      console.error('Error generating skin preview:', error);
      await interaction.followUp({ content: 'Erro ao gerar o preview.', ephemeral: true }).catch(console.error);
    }
    return;
  }

  try {
    const item = buyItem(userId, itemId);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ 
        content: `🎉 Parabéns! Você comprou **${item.name}** por **🪙 ${item.price.toLocaleString()}**!\nUse \`/inventory\` para equipar seu novo item.`, 
        embeds: [], components: []
      }).catch(console.error);
    } else {
      await interaction.reply({ 
        content: `🎉 Parabéns! Você comprou **${item.name}** por **🪙 ${item.price.toLocaleString()}**!\nUse \`/inventory\` para equipar seu novo item.`, 
        ephemeral: false 
      }).catch(console.error);
    }
  } catch (error: any) {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `❌ Erro: ${error.message}`, embeds: [], components: [] }).catch(console.error);
    } else {
      await interaction.reply({ content: `❌ Erro: ${error.message}`, ephemeral: true }).catch(console.error);
    }
  }
}
