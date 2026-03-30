import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';
import { getUserInventory, setActiveSkin, getItems } from '../../database/db.js';
import { generateSkinPreview, generateTablePreview } from '../../utils/preview.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('🎒 Veja seus itens e equipe suas skins!'),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const inventory = getUserInventory(userId).sort((a, b) => a.price - b.price);

    if (inventory.length === 0) {
      const content = '🎒 Seu inventário está vazio! Visite a `/shop` para comprar algo.';
      if (interaction.deferred || interaction.replied) {
        return interaction.editReply({ content });
      }
      return interaction.reply({ content, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🎒 Seu Inventário')
      .setDescription('Seus itens adquiridos. Selecione um item no menu abaixo para equipar ou ver preview:')
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`inv_select_${userId}`)
      .setPlaceholder('Selecione um item...');

    inventory.forEach((item) => {
      const isActive = item.is_active === 1;
      
      embed.addFields({
        name: `${item.name} ${isActive ? '✨ (Ativo)' : ''}`,
        value: `${item.description}`,
        inline: true
      });

      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(`${isActive ? '✨ Ativo' : 'Equipável'} - ${item.description.substring(0, 50)}...`)
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

export async function handleInventoryButton(interaction: any) {
  const parts = interaction.customId.split('_');
  const action = parts[1]; // 'use', 'preview', 'select', or 'back'
  const userId = parts.pop();
  
  if (interaction.user.id !== userId) {
    const content = 'Este inventário não é seu!';
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content, ephemeral: true }).catch(console.error);
    }
    return interaction.reply({ content, ephemeral: true }).catch(console.error);
  }

  if (action === 'select') {
    const itemId = interaction.values[0];
    const inventory = getUserInventory(userId).sort((a, b) => a.price - b.price);
    const item = inventory.find(i => i.id === itemId);
    if (!item) return;

    const isActive = item.is_active === 1;

    const detailEmbed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle(`🎒 Item: ${item.name}`)
      .setDescription(`${item.description}\n\n**Tipo:** ${item.type === 'skin' ? 'Visual de Carta' : 'Visual de Mesa'}\n**Status:** ${isActive ? '✨ Equipado' : 'Não equipado'}`)
      .setTimestamp();

    const equipButton = new ButtonBuilder()
      .setCustomId(`inv_use_${item.id}_${userId}`)
      .setLabel(isActive ? 'Já Equipado' : `Equipar ${item.name}`)
      .setStyle(isActive ? ButtonStyle.Success : ButtonStyle.Primary)
      .setDisabled(isActive);

    const previewButton = new ButtonBuilder()
      .setCustomId(`inv_preview_${item.id}_${userId}`)
      .setLabel(`👁️ Ver Preview`)
      .setStyle(ButtonStyle.Secondary);

    const backToInvButton = new ButtonBuilder()
      .setCustomId(`inv_back_${userId}`)
      .setLabel('Voltar ao Inventário')
      .setStyle(ButtonStyle.Secondary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(equipButton, previewButton, backToInvButton);

    return interaction.update({ embeds: [detailEmbed], components: [row] });
  }

  if (action === 'back') {
    // Re-run the execute logic
    const inventory = getUserInventory(userId).sort((a, b) => a.price - b.price);
    const embed = new EmbedBuilder()
      .setColor('#3498db')
      .setTitle('🎒 Seu Inventário')
      .setDescription('Seus itens adquiridos. Selecione um item no menu abaixo para equipar ou ver preview:')
      .setTimestamp();

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`inv_select_${userId}`)
      .setPlaceholder('Selecione um item...');

    inventory.forEach((item) => {
      const isActive = item.is_active === 1;
      embed.addFields({
        name: `${item.name} ${isActive ? '✨ (Ativo)' : ''}`,
        value: `${item.description}`,
        inline: true
      });
      selectMenu.addOptions(
        new StringSelectMenuOptionBuilder()
          .setLabel(item.name)
          .setDescription(`${isActive ? '✨ Ativo' : 'Equipável'} - ${item.description.substring(0, 50)}...`)
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
    const items = getItems();
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    setActiveSkin(userId, itemId);
    const typeName = item.type === 'skin' ? 'skin de carta' : 'visual de mesa';
    
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ 
        content: `✨ Você equipou o **${item.name}** (${typeName})! Suas próximas partidas terão um novo visual.`, 
        embeds: [], components: []
      }).catch(console.error);
    } else {
      await interaction.reply({ 
        content: `✨ Você equipou o **${item.name}** (${typeName})! Suas próximas partidas terão um novo visual.`, 
        ephemeral: true 
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
