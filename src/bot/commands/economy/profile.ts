import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder, InteractionContextType, ApplicationIntegrationType } from 'discord.js';
import { getUser, getUserAchievements } from '../../database/db.js';
import { createProfileCanvas } from '../../utils/profileCanvas.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('👤 [Economia] Veja seu saldo, nível e estatísticas completas.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addUserOption(option => 
      option.setName('user')
        .setDescription('O usuário para ver o perfil')
        .setRequired(false)),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    
    const targetUser = interaction.options.getUser('user') || interaction.user;
    const userData = getUser(targetUser.id);
    const achievements = getUserAchievements(targetUser.id);
    
    try {
      const buffer = await createProfileCanvas(targetUser, userData, achievements);
      const attachment = new AttachmentBuilder(buffer, { name: `profile-${targetUser.id}.png` });
      
      await interaction.editReply({ files: [attachment] });
    } catch (error) {
      console.error('Erro ao gerar canvas de perfil:', error);
      await interaction.editReply('Ocorreu um erro ao gerar a imagem do seu perfil. Tente novamente mais tarde.');
    }
  },
};
