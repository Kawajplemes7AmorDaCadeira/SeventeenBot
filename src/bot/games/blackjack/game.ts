import { ChatInputCommandInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Deck, Card, calculateHandValue } from './deck.js';
import { generateBlackjackImage } from './canvas.js';
import { updateBalance, recordBet } from '../../database/db.js';

interface GameState {
  deck: Deck;
  playerHand: Card[];
  dealerHand: Card[];
  bet: number;
  status: 'playing' | 'player_won' | 'dealer_won' | 'tie' | 'blackjack';
}

const activeGames = new Map<string, GameState>();

export async function startGame(interaction: ChatInputCommandInteraction, bet: number) {
  const userId = interaction.user.id;

  if (activeGames.has(userId)) {
    return interaction.reply({ content: 'Você já tem um jogo em andamento!', ephemeral: true });
  }

  // Deduct bet
  updateBalance(userId, -bet);

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
  const state = activeGames.get(userId);
  if (!state) {
    return interaction.reply({ content: 'Jogo não encontrado ou já finalizado.', ephemeral: true });
  }

  if (action === 'hit') {
    state.playerHand.push(state.deck.draw());
    const playerValue = calculateHandValue(state.playerHand);
    if (playerValue > 21) {
      state.status = 'dealer_won';
    }
  } else if (action === 'stand') {
    let dealerValue = calculateHandValue(state.dealerHand);
    while (dealerValue < 17) {
      state.dealerHand.push(state.deck.draw());
      dealerValue = calculateHandValue(state.dealerHand);
    }

    const playerValue = calculateHandValue(state.playerHand);
    if (dealerValue > 21 || playerValue > dealerValue) {
      state.status = 'player_won';
    } else if (dealerValue > playerValue) {
      state.status = 'dealer_won';
    } else {
      state.status = 'tie';
    }
  }

  await renderGame(interaction, userId, state.status !== 'playing');
}

async function renderGame(interaction: ChatInputCommandInteraction | ButtonInteraction, userId: string, isGameOver: boolean) {
  const state = activeGames.get(userId)!;
  
  const playerValue = calculateHandValue(state.playerHand);
  const dealerValue = isGameOver ? calculateHandValue(state.dealerHand) : '?';

  const imageBuffer = await generateBlackjackImage(state.playerHand, state.dealerHand, !isGameOver, playerValue, dealerValue);
  const attachment = new AttachmentBuilder(imageBuffer, { name: 'blackjack.png' });

  let apostaText = `🪙 ${state.bet}`;
  let statusMsg = 'O que você deseja fazer?';
  let color = '#0099ff';
  let result: any = {};

  if (isGameOver) {
    if (state.status === 'blackjack') {
      const winAmount = state.bet * 2.5;
      apostaText = `🪙 +${state.bet * 1.5}`;
      statusMsg = '🎉 **BLACKJACK! Você ganhou 1.5x a aposta!**';
      color = '#ffd700';
      updateBalance(userId, winAmount); // Return bet + 1.5x profit
      result = recordBet(userId, state.bet, winAmount, 'blackjack');
    } else if (state.status === 'player_won') {
      const winAmount = state.bet * 2;
      apostaText = `🪙 +${state.bet}`;
      statusMsg = '✅ **Você ganhou!**';
      color = '#00ff00';
      updateBalance(userId, winAmount); // Return bet + 1x profit
      result = recordBet(userId, state.bet, winAmount, 'blackjack');
    } else if (state.status === 'dealer_won') {
      apostaText = `🪙 -${state.bet}`;
      statusMsg = '❌ **Você perdeu!**';
      color = '#ff0000';
      result = recordBet(userId, state.bet, 0, 'blackjack');
    } else if (state.status === 'tie') {
      const winAmount = state.bet;
      apostaText = `🪙 0`;
      statusMsg = '🤝 **Empate! Sua aposta foi devolvida.**';
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

  const resultMsg = `**Aposta:** ${apostaText}\n**Sua mão:** (${playerValue}) | **Dealer:** (${dealerValue})\n\n${statusMsg}`;

  const embed = new EmbedBuilder()
    .setColor(color as any)
    .setTitle('Blackjack')
    .setDescription(resultMsg)
    .setImage('attachment://blackjack.png');

  const row = new ActionRowBuilder<ButtonBuilder>();
  if (!isGameOver) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`blackjack_hit_${userId}`)
        .setLabel('Hit')
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`blackjack_stand_${userId}`)
        .setLabel('Stand')
        .setStyle(ButtonStyle.Secondary)
    );
  }

  const payload: any = { embeds: [embed], files: [attachment] };
  if (!isGameOver) {
    payload.components = [row];
  } else {
    payload.components = [];
  }

  if (interaction.isButton()) {
    await interaction.update(payload);
  } else {
    await interaction.reply(payload);
  }
}
