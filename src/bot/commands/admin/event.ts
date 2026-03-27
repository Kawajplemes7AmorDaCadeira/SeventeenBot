import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, InteractionContextType, ApplicationIntegrationType, PermissionFlagsBits } from 'discord.js';
import { createEvent } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('🎉 [Admin] Inicie um evento global!')
    .setContexts([InteractionContextType.Guild])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(opt =>
      opt.setName('tipo')
        .setDescription('Tipo de evento')
        .setRequired(true)
        .addChoices(
          { name: 'XP em Dobro (2x)', value: 'xp' },
          { name: 'Bônus de Trabalho (+20%)', value: 'work' }
        ))
    .addNumberOption(opt =>
      opt.setName('multiplicador')
        .setDescription('O multiplicador do evento')
        .setRequired(true)
        .setMinValue(1.1)
        .setMaxValue(5.0))
    .addIntegerOption(opt =>
      opt.setName('duracao')
        .setDescription('Duração em minutos')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(1440)), // Max 24h
  async execute(interaction: ChatInputCommandInteraction) {
    const type = interaction.options.getString('tipo', true);
    const multiplier = interaction.options.getNumber('multiplicador', true);
    const duration = interaction.options.getInteger('duracao', true);

    createEvent(type, multiplier, duration);

    const embed = new EmbedBuilder()
      .setColor('#e67e22')
      .setTitle('🎉 EVENTO GLOBAL INICIADO!')
      .setDescription(`🚀 Um novo evento de **${type.toUpperCase()}** começou!\n\n**Multiplicador:** ${multiplier}x\n**Duração:** ${duration} minutos`)
      .setFooter({ text: 'Aproveite enquanto dura!' })
      .setTimestamp();

    return interaction.reply({ embeds: [embed] });
  },
};
