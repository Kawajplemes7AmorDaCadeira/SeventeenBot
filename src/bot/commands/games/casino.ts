import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, InteractionContextType, ApplicationIntegrationType } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('casino')
    .setDescription('🎰 [Jogos] Entre no lobby do cassino e escolha seu jogo!')
    .setContexts([InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel])
    .setIntegrationTypes([ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall]),
  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setColor('#f1c40f')
      .setTitle('🎰 Bem-vindo ao Cassino Odiondos')
      .setDescription('Sinta a adrenalina! Escolha uma categoria e comece a apostar.')
      .addFields(
        { name: '🃏 Clássicos', value: 'Blackjack, Roleta, Slots, Poker', inline: true },
        { name: '⚡ Rápidos', value: 'Crash, Mines, Coinflip', inline: true },
        { name: '🏆 Competitivos', value: 'Duelo, Corrida', inline: true }
      )
      .setImage('https://media.tenor.com/XqTfW1m9h5EAAAAi/spinning-coin.gif')
      .setFooter({ text: 'Aposte com responsabilidade!' });

    const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lobby_blackjack').setLabel('Blackjack').setStyle(ButtonStyle.Primary).setEmoji('🃏'),
      new ButtonBuilder().setCustomId('lobby_slots').setLabel('Slots').setStyle(ButtonStyle.Primary).setEmoji('🎰'),
      new ButtonBuilder().setCustomId('lobby_roulette').setLabel('Roleta').setStyle(ButtonStyle.Primary).setEmoji('🎡'),
      new ButtonBuilder().setCustomId('lobby_poker').setLabel('Poker').setStyle(ButtonStyle.Primary).setEmoji('♠️')
    );

    const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lobby_crash').setLabel('Crash').setStyle(ButtonStyle.Secondary).setEmoji('🚀'),
      new ButtonBuilder().setCustomId('lobby_mines').setLabel('Mines').setStyle(ButtonStyle.Secondary).setEmoji('💣'),
      new ButtonBuilder().setCustomId('lobby_coinflip').setLabel('Coinflip').setStyle(ButtonStyle.Secondary).setEmoji('🪙')
    );

    const row3 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lobby_duelo').setLabel('Duelo').setStyle(ButtonStyle.Danger).setEmoji('🎲'),
      new ButtonBuilder().setCustomId('lobby_corrida').setLabel('Corrida').setStyle(ButtonStyle.Secondary).setEmoji('🐎')
    );

    const row4 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lobby_balance').setLabel('Meu Saldo').setStyle(ButtonStyle.Secondary).setEmoji('💰'),
      new ButtonBuilder().setCustomId('lobby_daily').setLabel('Diário').setStyle(ButtonStyle.Success).setEmoji('📅'),
      new ButtonBuilder().setCustomId('lobby_mesada').setLabel('Mesada').setStyle(ButtonStyle.Success).setEmoji('💵'),
      new ButtonBuilder().setCustomId('lobby_shop').setLabel('Loja').setStyle(ButtonStyle.Primary).setEmoji('🛒'),
      new ButtonBuilder().setCustomId('lobby_missions').setLabel('Missões').setStyle(ButtonStyle.Secondary).setEmoji('📜')
    );

    const row5 = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder().setCustomId('lobby_inventory').setLabel('Inventário').setStyle(ButtonStyle.Secondary).setEmoji('🎒')
    );

    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ embeds: [embed], components: [row1, row2, row3, row4, row5] });
    } else {
      await interaction.reply({ embeds: [embed], components: [row1, row2, row3, row4, row5] });
    }
  },
};

export async function handleLobbyButton(interaction: any) {
  const parts = interaction.customId.split('_');
  const game = parts[1];
  const userId = parts[2];
  
  if (userId && interaction.user.id !== userId) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Esta navegação não é sua!', ephemeral: true }).catch(console.error);
    }
    return interaction.reply({ content: 'Esta navegação não é sua!', ephemeral: true }).catch(console.error);
  }
  
  if (game === 'balance') {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'Use o comando `/profile` para ver seu saldo e estatísticas!' });
    } else {
      await interaction.reply({ content: 'Use o comando `/profile` para ver seu saldo e estatísticas!', ephemeral: true });
    }
    return;
  } else if (game === 'daily') {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'Use o comando `/daily` para pegar sua recompensa diária!' });
    } else {
      await interaction.reply({ content: 'Use o comando `/daily` para pegar sua recompensa diária!', ephemeral: true });
    }
    return;
  } else if (game === 'mesada') {
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: 'Use o comando `/mesada` para pegar sua mesada periódica!' });
    } else {
      await interaction.reply({ content: 'Use o comando `/mesada` para pegar sua mesada periódica!', ephemeral: true });
    }
    return;
  } else if (game === 'shop') {
    const { default: shop } = await import('../economy/shop.js');
    await shop.execute(interaction as any);
    return;
  } else if (game === 'missions') {
    const { default: missions } = await import('../economy/missions.js');
    await missions.execute(interaction as any);
    return;
  } else if (game === 'inventory') {
    const { default: inventory } = await import('../economy/inventory.js');
    await inventory.execute(interaction as any);
    return;
  } else if (game === 'back') {
    const { default: casino } = await import('./casino.js');
    await casino.execute(interaction as any);
    return;
  }

  const embed = new EmbedBuilder()
    .setColor('#3498db')
    .setTitle(`🎮 Iniciar ${game.charAt(0).toUpperCase() + game.slice(1)}`)
    .setDescription(`Escolha o valor da sua aposta inicial para começar a jogar **${game}**:`);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`start_${game}_100`).setLabel('🪙 100').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`start_${game}_500`).setLabel('🪙 500').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`start_${game}_1000`).setLabel('🪙 1.000').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`start_${game}_5000`).setLabel('🪙 5.000').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId(`start_${game}_custom`).setLabel('Outro Valor').setStyle(ButtonStyle.Secondary)
  );

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ embeds: [embed], components: [row] });
  } else {
    await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
  }
}

export async function handleStartGameButton(interaction: any) {
  const parts = interaction.customId.split('_');
  const game = parts[1];
  const betStr = parts[2];

  if (betStr === 'custom') {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: `Para apostar um valor personalizado, use o comando: \`/${game} aposta:<valor>\``, ephemeral: true });
    }
    return interaction.reply({ content: `Para apostar um valor personalizado, use o comando: \`/${game} aposta:<valor>\``, ephemeral: true });
  }

  const bet = parseInt(betStr);
  
  // Route to the specific game start function
  if (game === 'blackjack') {
    const { startGame } = await import('../../games/blackjack/game.js');
    await startGame(interaction, bet);
  } else if (game === 'poker') {
    const { startPokerGame } = await import('../../games/poker/game.js');
    await startPokerGame(interaction, bet);
  } else if (game === 'roulette') {
    // Roulette needs a bit more setup usually, but let's just show the type selection
    const { playRoulette } = await import('../../games/roulette/game.js');
    // For roulette, we'll need to show the type selection menu first
    const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = await import('discord.js');
    const select = new StringSelectMenuBuilder()
      .setCustomId(`roulette_type_${bet}_${interaction.user.id}`)
      .setPlaceholder('Escolha o tipo de aposta...');

    select.addOptions(
      new StringSelectMenuOptionBuilder().setLabel('🔴 Vermelho (2x)').setValue('red').setEmoji('🔴'),
      new StringSelectMenuOptionBuilder().setLabel('⚫ Preto (2x)').setValue('black').setEmoji('⚫'),
      new StringSelectMenuOptionBuilder().setLabel('🔢 Par (2x)').setValue('even'),
      new StringSelectMenuOptionBuilder().setLabel('🔢 Ímpar (2x)').setValue('odd'),
      new StringSelectMenuOptionBuilder().setLabel('🎯 Número Exato (36x)').setValue('number_select'),
      new StringSelectMenuOptionBuilder().setLabel('📦 1ª Dúzia (1-12) (3x)').setValue('dozen1'),
      new StringSelectMenuOptionBuilder().setLabel('📦 2ª Dúzia (13-24) (3x)').setValue('dozen2'),
      new StringSelectMenuOptionBuilder().setLabel('📦 3ª Dúzia (25-36) (3x)').setValue('dozen3')
    );

    const row = new ActionRowBuilder<any>().addComponents(select);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Agora escolha o tipo de aposta:`, components: [row] });
    } else {
      await interaction.reply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Agora escolha o tipo de aposta:`, components: [row], ephemeral: true });
    }
  } else if (game === 'slots') {
    const { playSlots } = await import('../../games/slots/game.js');
    await playSlots(interaction, bet);
  } else if (game === 'crash') {
    const { playCrash } = await import('../../games/crash/game.js');
    await playCrash(interaction, bet);
  } else if (game === 'mines') {
    const { playMines } = await import('../../games/mines/game.js');
    // Mines needs bombs count, default to 3
    await playMines(interaction, bet, 3);
  } else if (game === 'coinflip') {
    const parts = interaction.customId.split('_');
    if (parts.length === 3) {
      // Just bet selected, show side selection
      const bet = parseInt(parts[2]);
      const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = await import('discord.js');
      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId(`start_coinflip_heads_${bet}`).setLabel('Cara').setStyle(ButtonStyle.Primary).setEmoji('🪙'),
        new ButtonBuilder().setCustomId(`start_coinflip_tails_${bet}`).setLabel('Coroa').setStyle(ButtonStyle.Primary).setEmoji('🪙')
      );
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Escolha o lado:`, components: [row] });
      } else {
        await interaction.reply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Escolha o lado:`, components: [row], ephemeral: true });
      }
    } else {
      // Side and bet selected, play
      const { playCoinflip } = await import('./coinflip.js');
      const side = parts[2];
      const bet = parseInt(parts[3]);
      await playCoinflip(interaction, bet, side);
    }
  } else if (game === 'duelo') {
    if (interaction.deferred || interaction.replied) {
      await interaction.followUp({ content: 'Para desafiar alguém para um duelo, use o comando: `/duelo usuario:<@membro> aposta:<valor>`', ephemeral: true });
    } else {
      await interaction.reply({ content: 'Para desafiar alguém para um duelo, use o comando: `/duelo usuario:<@membro> aposta:<valor>`', ephemeral: true });
    }
  } else if (game === 'corrida') {
    const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = await import('discord.js');
    const select = new StringSelectMenuBuilder()
      .setCustomId(`corrida_horse_${bet}_${interaction.user.id}`)
      .setPlaceholder('Escolha o seu cavalo...');

    select.addOptions(
      new StringSelectMenuOptionBuilder().setLabel('Cavalo 1').setValue('1').setEmoji('🐎'),
      new StringSelectMenuOptionBuilder().setLabel('Cavalo 2').setValue('2').setEmoji('🏇'),
      new StringSelectMenuOptionBuilder().setLabel('Cavalo 3').setValue('3').setEmoji('🦄'),
      new StringSelectMenuOptionBuilder().setLabel('Cavalo 4').setValue('4').setEmoji('🦓'),
      new StringSelectMenuOptionBuilder().setLabel('Cavalo 5').setValue('5').setEmoji('🐴')
    );

    const row = new ActionRowBuilder<any>().addComponents(select);
    if (interaction.deferred || interaction.replied) {
      await interaction.editReply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Agora escolha o seu cavalo:`, components: [row] });
    } else {
      await interaction.reply({ content: `Você escolheu apostar **🪙 ${bet.toLocaleString()}**. Agora escolha o seu cavalo:`, components: [row], ephemeral: true });
    }
  }
}
