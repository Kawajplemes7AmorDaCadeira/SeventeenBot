import { SlashCommandBuilder, ChatInputCommandInteraction, InteractionContextType, ApplicationIntegrationType, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, EmbedBuilder } from 'discord.js';
import { playRoulette } from '../../games/roulette/game.js';
import { getUser } from '../../database/db.js';

export default {
  data: new SlashCommandBuilder()
    .setName('roleta')
    .setDescription('🎮 [Jogos] Jogue na roleta europeia.')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall])
    .addIntegerOption(option =>
      option.setName('aposta')
        .setDescription('O valor da sua aposta')
        .setRequired(true)
        .setMinValue(1))
    .addStringOption(option =>
      option.setName('tipo')
        .setDescription('O tipo de aposta (opcional, se não informado abrirá um menu)')
        .setRequired(false)
        .addChoices(
          { name: 'Número (0-36)', value: 'number' },
          { name: 'Vermelho', value: 'red' },
          { name: 'Preto', value: 'black' },
          { name: 'Par', value: 'even' },
          { name: 'Ímpar', value: 'odd' },
          { name: '1ª Dúzia (1-12)', value: 'dozen1' },
          { name: '2ª Dúzia (13-24)', value: 'dozen2' },
          { name: '3ª Dúzia (25-36)', value: 'dozen3' },
          { name: '1ª Metade (1-18)', value: 'half1' },
          { name: '2ª Metade (19-36)', value: 'half2' }
        ))
    .addIntegerOption(option =>
      option.setName('numero')
        .setDescription('O número se você escolheu "Número"')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(36)),
  async execute(interaction: ChatInputCommandInteraction) {
    const bet = interaction.options.getInteger('aposta', true);
    const type = interaction.options.getString('tipo');
    const number = interaction.options.getInteger('numero');

    const userId = interaction.user.id;
    const userData = getUser(userId);

    if (userData.balance < bet) {
      return interaction.reply({ content: `Você não tem fichas suficientes! Saldo atual: 🪙 ${userData.balance}`, ephemeral: true });
    }

    if (!type) {
      const embed = new EmbedBuilder()
        .setColor('#e67e22')
        .setTitle('🎡 Roleta Europeia - Seleção de Aposta')
        .setDescription(`**Aposta:** 🪙 ${bet.toLocaleString()}\n\nEscolha o tipo de aposta que deseja fazer no menu abaixo.`)
        .addFields(
          { name: '🔴 Cores', value: 'Vermelho ou Preto (Pagamento 2x)', inline: true },
          { name: '🔢 Números', value: 'Par ou Ímpar (Pagamento 2x)', inline: true },
          { name: '📏 Metades', value: '1-18 ou 19-36 (Pagamento 2x)', inline: true },
          { name: '📦 Dúzias', value: '1ª, 2ª ou 3ª Dúzia (Pagamento 3x)', inline: true },
          { name: '🎯 Direto', value: 'Um número específico (Pagamento 36x)', inline: true }
        )
        .setTimestamp();

      const select = new StringSelectMenuBuilder()
        .setCustomId(`roulette_type_${bet}_${userId}`)
        .setPlaceholder('Selecione o tipo de aposta...')
        .addOptions(
          new StringSelectMenuOptionBuilder().setLabel('🔴 Vermelho').setValue('red').setDescription('Aposta em todos os números vermelhos (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('⚫ Preto').setValue('black').setDescription('Aposta em todos os números pretos (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('🔢 Par').setValue('even').setDescription('Aposta em todos os números pares (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('🔢 Ímpar').setValue('odd').setDescription('Aposta em todos os números ímpares (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('📏 1ª Metade (1-18)').setValue('half1').setDescription('Números de 1 a 18 (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('📏 2ª Metade (19-36)').setValue('half2').setDescription('Números de 19 a 36 (2x)'),
          new StringSelectMenuOptionBuilder().setLabel('📦 1ª Dúzia (1-12)').setValue('dozen1').setDescription('Números de 1 a 12 (3x)'),
          new StringSelectMenuOptionBuilder().setLabel('📦 2ª Dúzia (13-24)').setValue('dozen2').setDescription('Números de 13 a 24 (3x)'),
          new StringSelectMenuOptionBuilder().setLabel('📦 3ª Dúzia (25-36)').setValue('dozen3').setDescription('Números de 25 a 36 (3x)'),
          new StringSelectMenuOptionBuilder().setLabel('🎯 Número Específico').setValue('number_select').setDescription('Escolha um número de 0 a 36 (36x)')
        );

      const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

      return interaction.reply({ embeds: [embed], components: [row] });
    }

    if (type === 'number' && number === null) {
      return interaction.reply({ content: 'Você precisa especificar um número para apostar em um número!', ephemeral: true });
    }

    await playRoulette(interaction, bet, type, number);
  },
};
