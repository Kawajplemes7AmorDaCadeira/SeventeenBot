import { ChatInputCommandInteraction, ButtonInteraction, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, AttachmentBuilder } from 'discord.js';
import { Deck, Card } from '../blackjack/deck.js';
import { updateBalance, recordBet, getUser, addActiveBet, removeActiveBet, updateActiveBet, getActiveSkin, getActiveTableSkin } from '../../database/db.js';
import { logBigWin } from '../../utils/logger.js';
import { generatePokerImage } from './canvas.js';
// @ts-ignore
import pkg from 'pokersolver';
const { Hand } = pkg;

interface GameState {
  betId: string;
  deck: Deck;
  playerHand: Card[];
  dealerHand: Card[];
  communityCards: Card[];
  ante: number;
  pot: number;
  playerInvested: number;
  dealerInvested: number;
  phase: 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';
  status: 'playing' | 'player_won' | 'dealer_won' | 'tie' | 'folded';
  lastActionMsg: string;
}

const activeGames = new Map<string, GameState>();

function cardToPokerSolver(card: Card): string {
  let rankStr: string = card.rank;
  if (rankStr === '10') rankStr = 'T';
  let suit = card.suit.charAt(0).toLowerCase();
  return `${rankStr}${suit}`;
}

const handTranslations: Record<string, string> = {
  'High Card': 'Carta Alta',
  'Two Pair': 'Dois Pares',
  'Pair': 'Par',
  'Three of a Kind': 'Trinca',
  'Four of a Kind': 'Quadra',
  'Straight Flush': 'Straight Flush',
  'Royal Flush': 'Royal Flush',
  'Straight': 'Sequência',
  'Flush': 'Flush',
  'Full House': 'Full House',
  'Hearts': 'Copas',
  'Diamonds': 'Ouros',
  'Clubs': 'Paus',
  'Spades': 'Espadas',
  ' over ': ' sobre ',
  ' & ': ' e ',
  ' High': ' (Maior carta)',
};

const rankTranslations: Record<string, string> = {
  "A's": 'Áses',
  "K's": 'Reis',
  "Q's": 'Damas',
  "J's": 'Valetes',
  "A": 'Ás',
  "K": 'Rei',
  "Q": 'Dama',
  "J": 'Valete',
};

function translateHand(descr: string): string {
  let pt = descr;
  for (const [en, br] of Object.entries(handTranslations)) {
    pt = pt.replace(en, br);
  }
  for (const [en, br] of Object.entries(rankTranslations)) {
    const regex = new RegExp(`\\b${en.replace("'", "\\'")}\\b`, 'g');
    pt = pt.replace(regex, br);
  }
  return pt.replace(/'s/g, 's');
}

export async function startPokerGame(interaction: ChatInputCommandInteraction | ButtonInteraction, ante: number) {
  const userId = interaction.user.id;

  if (activeGames.has(userId)) {
    try {
      if (interaction.deferred || interaction.replied) {
        // Already handled
      } else if (interaction.isButton()) {
        await interaction.deferUpdate();
      } else {
        await interaction.deferReply({ ephemeral: true });
      }
      await renderGame(interaction, userId);
    } catch (error) {
      console.error('Error rendering existing game:', error);
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({ content: 'Ocorreu um erro ao tentar retomar seu jogo.', ephemeral: true });
      }
    }
    return;
  }

  const user = getUser(userId);
  if (!user || user.balance < ante) {
    return interaction.reply({ content: `Você não tem Odiondos suficientes! Saldo atual: 🪙 ${user?.balance || 0}`, ephemeral: true });
  }

  // Deduct ante (Big Blind)
  updateBalance(userId, -ante);

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**', embeds: [], components: [] });
  } else if (interaction.isButton()) {
    await interaction.deferUpdate();
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**', embeds: [], components: [] });
  } else {
    await interaction.deferReply();
    await interaction.editReply({ content: '🃏 **Embaralhando as cartas...**' });
  }

  await new Promise(resolve => setTimeout(resolve, 1500));

  const deck = new Deck();
  const playerHand = [deck.draw(), deck.draw()];
  const dealerHand = [deck.draw(), deck.draw()];

  const betId = `${userId}_${Date.now()}`;
  addActiveBet(betId, userId, ante, 'poker');

  const state: GameState = {
    betId,
    deck,
    playerHand,
    dealerHand,
    communityCards: [],
    ante,
    pot: ante * 2, // Player ante + Bot ante
    playerInvested: ante,
    dealerInvested: ante,
    phase: 'pre-flop',
    status: 'playing',
    lastActionMsg: `O jogo começou! Você e o Bot pagaram o Big Blind (🪙 ${ante}).`,
  };

  activeGames.set(userId, state);
  await renderGame(interaction, userId);
}

export async function handlePokerButton(interaction: ButtonInteraction, action: string, userId: string) {
  if (action === 'playagain') {
    const anteStr = interaction.customId.split('_')[3];
    let ante = parseInt(anteStr, 10);
    await startPokerGame(interaction, ante);
    return;
  }

  const state = activeGames.get(userId);
  if (!state) {
    if (interaction.deferred || interaction.replied) {
      return interaction.followUp({ content: 'Jogo não encontrado ou já finalizado.', ephemeral: true });
    }
    return interaction.reply({ content: 'Jogo não encontrado ou já finalizado.', ephemeral: true });
  }

  if (state.status !== 'playing') {
    return interaction.reply({ content: 'Ação inválida para o estado atual do jogo.', ephemeral: true });
  }

  if (action === 'fold') {
    if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
    state.status = 'folded';
    state.lastActionMsg = 'Você desistiu (Fold). O Bot levou o pote.';
    
    removeActiveBet(state.betId);
    recordBet(userId, state.playerInvested, 0, 'poker');
    await renderGame(interaction, userId);
    return;
  }

  if (action === 'check' || action === 'raise') {
    let playerAction = '';
    if (action === 'raise') {
      const raiseAmount = state.ante;
      const user = getUser(userId);
      if (user.balance < raiseAmount) {
        return interaction.reply({ content: `Saldo insuficiente para aumentar a aposta (🪙 ${raiseAmount})!`, ephemeral: true });
      }
      
      if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
      
      updateBalance(userId, -raiseAmount);
      updateActiveBet(state.betId, raiseAmount);
      state.playerInvested += raiseAmount;
      state.pot += raiseAmount;
      playerAction = `Você aumentou a aposta em 🪙 ${raiseAmount}.`;
    } else {
      if (!interaction.deferred && !interaction.replied) await interaction.deferUpdate();
      playerAction = 'Você passou a vez (Check).';
    }

    // Bot AI Logic
    const botDecision = decideBotAction(state);
    
    if (botDecision === 'fold') {
      state.status = 'player_won';
      const winAmount = state.pot;
      updateBalance(userId, winAmount);
      state.lastActionMsg = `${playerAction} O Bot desistiu (Fold)! Você levou o pote de 🪙 ${state.pot}.`;
      removeActiveBet(state.betId);
      recordBet(userId, state.playerInvested, winAmount, 'poker');
      await renderGame(interaction, userId);
      return;
    } else if (botDecision === 'raise') {
      const raiseAmount = state.ante;
      state.dealerInvested += raiseAmount;
      state.pot += raiseAmount;
      state.lastActionMsg = `${playerAction} O Bot aumentou a aposta em 🪙 ${raiseAmount}!`;
    } else {
      // Bot calls or checks
      if (action === 'raise') {
        state.dealerInvested += state.ante;
        state.pot += state.ante;
        state.lastActionMsg = `${playerAction} O Bot pagou (Call).`;
      } else {
        state.lastActionMsg = `${playerAction} O Bot também passou (Check).`;
      }
    }

    // Advance Phase
    if (state.phase === 'pre-flop') {
      state.phase = 'flop';
      state.communityCards.push(state.deck.draw(), state.deck.draw(), state.deck.draw());
    } else if (state.phase === 'flop') {
      state.phase = 'turn';
      state.communityCards.push(state.deck.draw());
    } else if (state.phase === 'turn') {
      state.phase = 'river';
      state.communityCards.push(state.deck.draw());
    } else if (state.phase === 'river') {
      state.phase = 'showdown';
      await evaluateWinner(state, userId, interaction);
      return;
    }

    await renderGame(interaction, userId);
  }
}

function decideBotAction(state: GameState): 'fold' | 'call' | 'raise' {
  // Pre-flop logic
  if (state.phase === 'pre-flop') {
    const ranks = state.dealerHand.map(c => c.rank);
    const hasHighCard = ranks.some(r => ['A', 'K', 'Q', 'J'].includes(r));
    const isPair = ranks[0] === ranks[1];
    
    if (isPair || hasHighCard) return Math.random() > 0.7 ? 'raise' : 'call';
    return 'call';
  }

  // Post-flop logic
  const dealerCards = [...state.dealerHand, ...state.communityCards].map(cardToPokerSolver);
  const dealerSolved = Hand.solve(dealerCards);
  const rank = dealerSolved.rank; // 1 (High Card) to 10 (Royal Flush)

  // Bluffing factor
  const bluff = Math.random() > 0.9;

  if (rank >= 4 || (rank >= 3 && Math.random() > 0.5) || bluff) {
    return 'raise';
  }

  if (rank >= 2 || Math.random() > 0.3) {
    return 'call';
  }

  // Only fold if it's really bad and we are not at the river yet
  if (state.phase !== 'river' && rank === 1 && Math.random() > 0.8) {
    return 'fold';
  }

  return 'call';
}

async function evaluateWinner(state: GameState, userId: string, interaction: ButtonInteraction) {
  const playerCards = [...state.playerHand, ...state.communityCards].map(cardToPokerSolver);
  const dealerCards = [...state.dealerHand, ...state.communityCards].map(cardToPokerSolver);

  const playerSolved = Hand.solve(playerCards);
  const dealerSolved = Hand.solve(dealerCards);

  const winner = Hand.winners([playerSolved, dealerSolved]);

  let winAmount = 0;
  if (winner.length === 2) {
    state.status = 'tie';
    winAmount = state.playerInvested; // Return investment
    state.lastActionMsg = 'Empate! O pote foi dividido e sua aposta devolvida.';
  } else if (winner[0] === playerSolved) {
    state.status = 'player_won';
    winAmount = state.pot;
    state.lastActionMsg = `Você venceu com ${translateHand(playerSolved.descr)}!`;
  } else {
    state.status = 'dealer_won';
    state.lastActionMsg = `O Bot venceu com ${translateHand(dealerSolved.descr)}!`;
  }

  if (winAmount > 0) {
    updateBalance(userId, winAmount);
  }

  removeActiveBet(state.betId);
  const result = recordBet(userId, state.playerInvested, winAmount, 'poker');
  if (result.isBigWin) {
    logBigWin(interaction.client, userId, winAmount, "Texas Hold'em");
  }

  await renderGame(interaction, userId, playerSolved, dealerSolved);
}

function formatSolvedCards(cards: any[]): string {
  const suits: Record<string, string> = { 's': '♠', 'h': '♥', 'd': '♦', 'c': '♣' };
  return cards.map(c => {
    let val = c.value;
    if (val === 'T') val = '10';
    return `${val}${suits[c.suit] || c.suit}`;
  }).join(', ');
}

async function renderGame(interaction: ChatInputCommandInteraction | ButtonInteraction, userId: string, playerSolved?: any, dealerSolved?: any) {
  const state = activeGames.get(userId)!;
  const isGameOver = state.status !== 'playing';
  const activeSkin = getActiveSkin(userId);
  const skinMetadata = JSON.parse(activeSkin.metadata || '{}');
  const skinColor = skinMetadata.color || '#b71c1c';
  const skinStyle = skinMetadata.style || 'classic';

  const activeTableSkin = getActiveTableSkin(userId);
  const tableMetadata = JSON.parse(activeTableSkin.metadata || '{}');
  const tableColor = tableMetadata.color || '#1a4a1a';

  let color = '#0099ff';
  if (state.status === 'player_won') color = '#00ff00';
  if (state.status === 'dealer_won' || state.status === 'folded') color = '#ff0000';
  if (state.status === 'tie') color = '#aaaaaa';

  const hideDealerCard = !isGameOver;

  let phaseName = '';
  if (state.phase === 'pre-flop') phaseName = 'Pré-Flop';
  if (state.phase === 'flop') phaseName = 'Flop';
  if (state.phase === 'turn') phaseName = 'Turn';
  if (state.phase === 'river') phaseName = 'River';
  if (state.phase === 'showdown') phaseName = 'Showdown';

  const imageBuffer = await generatePokerImage(
    state.playerHand,
    state.dealerHand,
    state.communityCards,
    hideDealerCard,
    isGameOver ? (state.status === 'folded' ? 'Você Desistiu' : 'Fim de Jogo') : `Fase: ${phaseName}`,
    state.pot,
    skinColor,
    tableColor,
    skinStyle
  );

  const attachment = new AttachmentBuilder(imageBuffer, { name: 'poker.png' });

  const components: any[] = [];
  if (!isGameOver) {
    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`poker_check_${userId}`)
        .setLabel('MESA / PAGAR (Check/Call)')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId(`poker_raise_${userId}`)
        .setLabel(`AUMENTAR (Raise 🪙 ${state.ante})`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`poker_fold_${userId}`)
        .setLabel('DESISTIR (Fold)')
        .setStyle(ButtonStyle.Danger)
    );
    components.push(row);
  } else {
    const row = new ActionRowBuilder<ButtonBuilder>();
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`poker_playagain_${userId}_${state.ante}`)
        .setLabel('🔄 Jogar Novamente')
        .setStyle(ButtonStyle.Primary)
    );
    components.push(row);
    activeGames.delete(userId);
  }

  let currentPlayerSolved = playerSolved;
  if (!currentPlayerSolved) {
    const playerCards = [...state.playerHand, ...state.communityCards].map(cardToPokerSolver);
    currentPlayerSolved = Hand.solve(playerCards);
  }

  let playerHandStr = translateHand(currentPlayerSolved.descr);
  if (isGameOver && state.status !== 'folded') {
    playerHandStr += `\n*(Cartas: ${formatSolvedCards(currentPlayerSolved.cards)})*`;
  }

  let desc = `**Fase:** ${phaseName}\n**Pote:** 🪙 ${state.pot}\n**Sua Mão:** ${playerHandStr}\n\n${state.lastActionMsg}`;
  if (isGameOver && dealerSolved && state.status !== 'folded') {
    desc += `\n\n**Mão do Bot:** ${translateHand(dealerSolved.descr)}\n*(Cartas: ${formatSolvedCards(dealerSolved.cards)})*`;
  }

  const embed = new EmbedBuilder()
    .setColor(color as any)
    .setTitle('🃏 Texas Hold\'em (1v1)')
    .setDescription(desc)
    .setImage('attachment://poker.png');

  if (interaction.deferred || interaction.replied) {
    await interaction.editReply({ content: null, embeds: [embed], components, files: [attachment] });
  } else {
    await interaction.reply({ embeds: [embed], components, files: [attachment] });
  }
}
