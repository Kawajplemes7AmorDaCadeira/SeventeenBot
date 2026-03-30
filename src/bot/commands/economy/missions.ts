import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getUserMissions, claimMissionReward, getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('missions')
    .setDescription('📜 Veja suas missões diárias e semanais e ganhe recompensas!'),
  async execute(interaction: ChatInputCommandInteraction) {
    const userId = interaction.user.id;
    const missions = getUserMissions(userId);
    const user = getUser(userId);

    const embed = new EmbedBuilder()
      .setColor('#9b59b6')
      .setTitle('📜 Missões do Cassino')
      .setDescription(`Suas tarefas para ganhar Odiondos extras!\n\nSeu saldo: **🪙 ${user.balance.toLocaleString()}**`)
      .setTimestamp();

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    let currentRow = new ActionRowBuilder<ButtonBuilder>();

    missions.forEach((mission) => {
      const isClaimed = mission.completed === 1;
      const progress = mission.progress;
      const goal = mission.goal;
      const isCompleted = progress >= goal;
      const percent = Math.min(100, Math.floor((progress / goal) * 100));
      
      let status = '⏳ Em andamento';
      if (isClaimed) status = '✅ Recompensa Coletada';
      else if (isCompleted) status = '🎁 Pronto para coletar!';

      const typeLabel = mission.period === 'daily' ? '📅 Diária' : '🗓️ Semanal';

      embed.addFields({
        name: `${typeLabel}: ${mission.title} (${status})`,
        value: `${mission.description}\nProgresso: **${progress.toLocaleString()} / ${goal.toLocaleString()}** (${percent}%)\nRecompensa: **🪙 ${mission.reward.toLocaleString()}**`,
        inline: false
      });

      if (isCompleted && !isClaimed) {
        const button = new ButtonBuilder()
          .setCustomId(`mission_claim_${mission.id}_${userId}`)
          .setLabel(`Coletar ${mission.title}`)
          .setStyle(ButtonStyle.Success);

        if (currentRow.components.length < 5) {
          currentRow.addComponents(button);
        } else {
          rows.push(currentRow);
          currentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        }
      }
    });

    const backButton = new ButtonBuilder()
      .setCustomId(`lobby_back_${userId}`)
      .setLabel('Voltar ao Lobby')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji('🎰');

    if (currentRow.components.length < 5) {
      currentRow.addComponents(backButton);
    } else {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(backButton);
    }

    if (currentRow.components.length > 0) rows.push(currentRow);

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed], components: rows });
    } else {
      await interaction.reply({ embeds: [embed], components: rows });
    }
  },
};

export async function handleMissionButton(interaction: any) {
  const parts = interaction.customId.split('_');
  const userId = parts.pop();
  const missionId = parts.slice(2).join('_');
  
  if (interaction.user.id !== userId) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Estas missões não são suas!', ephemeral: true }).catch(console.error);
    }
    return interaction.reply({ content: 'Estas missões não são suas!', ephemeral: true }).catch(console.error);
  }

  try {
    const reward = claimMissionReward(userId, missionId);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ 
        content: `🎁 Recompensa coletada! Você ganhou **🪙 ${reward.toLocaleString()}** Odiondos!`, 
        embeds: [], components: []
      }).catch(console.error);
    } else {
      await interaction.reply({ 
        content: `🎁 Recompensa coletada! Você ganhou **🪙 ${reward.toLocaleString()}** Odiondos!`, 
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
