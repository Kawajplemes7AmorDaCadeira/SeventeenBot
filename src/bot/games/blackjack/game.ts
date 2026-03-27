import { ChatInputCommandInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Deck, Card, calculateHandValue } from './deck.js';
import { generateBlackjackImage } from './canvas.js';
import { updateBalance, recordBet, getUser } from '../../database/db.js';
import { logBigWin } from '../../utils/logger.js';

interface GameState {
  deck: Deck;
  playerHand: Card[];
  dealerHand: Card[];
  bet: number;
  status: 'playing' | 'player_won' | 'dealer_won' | 'tie' | 'blackjack' | 'dealer_turn';
}

const activeGames = new Map<string, GameState>();

export async function startGame(interaction: ChatInputCommandInteraction | ButtonInteraction, bet: number) {
  const userId = interaction.user.id;

  if (activeGames.has(userId)) {
    return interaction.reply({ content: 'Você já tem um jogo em andamento!', ephemeral: true });
  }

  const user = getUser(userId);
  if (!user || user.balance < bet) {
    return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${user?.balance || 0}`, ephemeral: true });
  }

  // Deduct bet
  updateBalance(userId, -bet);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**', embeds: [], components: [], files: [] });
  } else if (interaction.isButton()) {
    await interaction.deferUpdate();
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**', embeds: [], components: [], files: [] });
  } else {
    await interaction.deferReply();
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**' });
  }
  
  await new Promise(resolve => setTimeout(resolve, 300));
  await interaction.editReply({ content: '🃏 **Distribuindo as cartas...** 🎴' });
  await new Promise(resolve => setTimeout(resolve, 300));

  const deck = new Deck();
  const playerHand = [deck.draw(), deck.draw()];
  const dealerHand = [deck.draw(), deck.draw()];

  const state: GameState = {
    deck,
    playerHand,
    dealerHand,
    bet,
    status: 'playing',
  };

  const playerValue = calculateHandValue(playerHand);
  if (playerValue === 21) {
    state.status = 'blackjack';
  }

  activeGames.set(userId, state);

  await renderGame(interaction, userId, state.status !== 'playing');
}

export async function handleBlackjackButton(interaction: ButtonInteraction, action: string, userId: string) {
  if (action === 'playagain' || action === 'double') {
    const betStr = interaction.customId.split('_')[3];
    let bet = parseInt(betStr, 10);
    if (action === 'double') bet *= 2;
    
    await startGame(interaction, bet);
    return;
  }

  const state = activeGames.get(userId);
  if (!state) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Jogo não encontrado ou já finalizado.', ephemeral: true });
    }
    return interaction.reply({ content: 'Jogo não encontrado ou já finalizado.', ephemeral: true });
  }

  if (action === 'hit') {
    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
    await interaction.editReply({ content: '🎴 **Comprando carta...**', components: [] });
    await new Promise(resolve => setTimeout(resolve, 300));

    state.playerHand.push(state.deck.draw());
    const playerValue = calculateHandValue(state.playerHand);
    if (playerValue > 21) {
      state.status = 'dealer_won';
    } else if (playerValue === 21) {
      state.status = 'player_won';
    }
    await renderGame(interaction, userId, state.status !== 'playing');
  } else if (action === 'double_down') {
    const user = getUser(userId);
    if (user.balance < state.bet) {
      if (interaction.deferred || interaction.replied) {
        return interaction.followUp({ content: 'Você não tem saldo suficiente para dobrar a aposta!', ephemeral: true });
      }
      return interaction.reply({ content: 'Você não tem saldo suficiente para dobrar a aposta!', ephemeral: true });
    }

    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
    updateBalance(userId, -state.bet);
    state.bet *= 2;
    state.playerHand.push(state.deck.draw());
    
    const playerValue = calculateHandValue(state.playerHand);
    if (playerValue > 21) {
      state.status = 'dealer_won';
      await renderGame(interaction, userId, true);
    } else if (playerValue === 21) {
      state.status = 'player_won';
      await renderGame(interaction, userId, true);
    } else {
      // After double down, player gets only one card and then it's dealer's turn
      await handleBlackjackButton(interaction, 'stand', userId);
    }
  } else if (action === 'stand') {
    state.status = 'dealer_turn';
    if (!interaction.deferred && !interaction.replied) {
      await interaction.deferUpdate();
    }
    await interaction.editReply({ content: '👀 **Dealer revelando a carta oculta...**', components: [] });
    
    await renderGame(interaction, userId, false, '👀 **Dealer revelando a carta oculta...**');
    await new Promise(resolve => setTimeout(resolve, 500));

    let dealerValue = calculateHandValue(state.dealerHand);
    
    const isSoft17 = (hand: any[]) => {
      let val = 0; let aces = 0;
      for (const c of hand) { val += c.value; if (c.rank === 'A') aces++; }
      while (val > 21 && aces > 0) { val -= 10; aces--; }
      // It's soft if we still have at least one ace counted as 11
      // Which means if we subtract 10 more, it's still >= 7
      return val === 17 && aces > 0 && (val - 10) >= 0; // Simplified check: if value is 17 and we have an ace that WASN'T reduced
    };

    while (dealerValue < 17 || isSoft17(state.dealerHand)) {
      await interaction.editReply({ content: '🃏 **Dealer comprando mais uma carta...**' });
      await new Promise(resolve => setTimeout(resolve, 400));

      state.dealerHand.push(state.deck.draw());
      dealerValue = calculateHandValue(state.dealerHand);

      await renderGame(interaction, userId, false, '🃏 **Dealer comprando mais uma carta...**');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const playerValue = calculateHandValue(state.playerHand);
    if (dealerValue > 21 || playerValue > dealerValue) {
      state.status = 'player_won';
    } else if (dealerValue > playerValue) {
      state.status = 'dealer_won';
    } else {
      state.status = 'tie';
    }
    await renderGame(interaction, userId, true);
  }
}

async function renderGame(interaction: ChatInputCommandInteraction | ButtonInteraction, userId: string, isGameOver: boolean, customContent?: string) {
  const state = activeGames.get(userId)!;
  
  const revealDealer = isGameOver || state.status === 'dealer_turn';
  const playerValue = calculateHandValue(state.playerHand);
  const dealerValue = revealDealer ? calculateHandValue(state.dealerHand) : '?';

  const imageBuffer = await generateBlackjackImage(state.playerHand, state.dealerHand, !revealDealer, playerValue, dealerValue);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'blackjack.png' });

  let apostaText = `🪙 ${state.bet}`;
  let statusMsg = customContent || 'O que você deseja fazer?';
  let color = '#0099ff';
  let result: any = {};
  let playerValueStr = `${playerValue}`;

  if (isGameOver) {
    if (state.status === 'blackjack') {
      const winAmount = state.bet * 2.5;
      apostaText = `🪙 +${state.bet * 1.5}`;
      playerValueStr = '21 🎯';
      statusMsg = '👑 BLACKJACK!\n💎 Vitória perfeita!';
      color = '#ffd700';
      updateBalance(userId, winAmount); // Return bet + 1.5x profit
      result = recordBet(userId, state.bet, winAmount, 'blackjack');
      
      if (result.isBigWin) {
        logBigWin(interaction.client, userId, winAmount, 'Blackjack');
      }
    } else if (state.status === 'player_won') {
      const winAmount = state.bet * 2;
      apostaText = `🪙 +${state.bet}`;
      if (dealerValue !== '?' && (dealerValue as number) > 21) {
        statusMsg = '🔥 Dealer estourou!\n✅ Você ganhou!';
      } else {
        statusMsg = '✅ Você ganhou!';
      }
      color = '#00ff00';
      updateBalance(userId, winAmount); // Return bet + 1x profit
      result = recordBet(userId, state.bet, winAmount, 'blackjack');
      
      if (result.isBigWin) {
        logBigWin(interaction.client, userId, winAmount, 'Blackjack');
      }
    } else if (state.status === 'dealer_won') {
      apostaText = `🪙 -${state.bet}`;
      if (playerValue > 21) {
        statusMsg = '💥 Você estourou!';
      } else {
        statusMsg = '❌ Você perdeu!';
      }
      color = '#ff0000';
      result = recordBet(userId, state.bet, 0, 'blackjack');
    } else if (state.status === 'tie') {
      const winAmount = state.bet;
      apostaText = `🪙 0`;
      statusMsg = '⚖️ Empate!';
      color = '#aaaaaa';
      updateBalance(userId, winAmount); // Return bet
      result = recordBet(userId, state.bet, winAmount, 'blackjack');
    }
    
    if (result.newLevel) {
      statusMsg += `\n\n⭐ **LEVEL UP!** Você agora é nível **${result.newLevel}**!`;
    }
    
    if (result.unlockedAchievements && result.unlockedAchievements.length > 0) {
      result.unlockedAchievements.forEach((ach: any) => {
        statusMsg += `\n\n🏆 **CONQUISTA DESBLOQUEADA:** **${ach.name}**\n*${ach.description}* (+🪙 ${ach.reward})`;
      });
    }
    
    activeGames.delete(userId);
  }

  const resultMsg = `╔═══════ 🎰 BLACKJACK 🎰 ══════╗\n💰 Aposta: ${apostaText}\n\n🧑 Sua mão: (${playerValueStr})\n🤖 shhhh: (${dealerValue})\n\n${statusMsg}\n╚═══════════════════════════╝`;

  const components: any[] = [];
  if (!isGameOver && state.status === 'playing') {
    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`blackjack_hit_${userId}`)
        .setLabel('🃏 COMPRAR (HIT)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`blackjack_stand_${userId}`)
        .setLabel('✋ PARAR (STAND)')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId(`blackjack_double_down_${userId}`)
        .setLabel('💰 DOBRAR (DOUBLE)')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(state.playerHand.length > 2)
    );
    components.push(row);
  } else if (isGameOver) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`blackjack_playagain_${userId}_${state.bet}`)
        .setLabel('🔄 Jogar Novamente')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`blackjack_double_${userId}_${state.bet}`)
        .setLabel('💰 Dobrar Aposta')
        .setStyle(ButtonStyle.Primary)
    );
    components.push(row);
  }

  const payload: any = { content: customContent || null, files: [attachment] };

  if (isGameOver) {
    const tableEmbed = new EmbedBuilder()
      .setColor('#2f3136')
      .setImage('attachment://blackjack.png');
      
    const resultEmbed = new EmbedBuilder()
      .setColor(color as any)
      .setDescription(resultMsg);

    payload.embeds = [tableEmbed, resultEmbed];
  } else {
    const embed = new EmbedBuilder()
      .setColor(color as any)
      .setDescription(resultMsg)
      .setImage('attachment://blackjack.png');
    payload.embeds = [embed];
  }

  if ((!isGameOver && state.status === 'playing') || isGameOver) {
    payload.components = components;
  } else {
    payload.components = [];
  }

  await interaction.editReply(payload);
}
