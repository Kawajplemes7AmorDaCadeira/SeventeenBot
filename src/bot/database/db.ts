import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'casino.db');
const db = new Database(dbPath);

// Initialize tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    balance INTEGER DEFAULT 1000,
    total_bet INTEGER DEFAULT 0,
    total_won INTEGER DEFAULT 0,
    slots_won INTEGER DEFAULT 0,
    blackjack_won INTEGER DEFAULT 0,
    roulette_won INTEGER DEFAULT 0,
    crash_won INTEGER DEFAULT 0,
    mines_won INTEGER DEFAULT 0,
    dice_won INTEGER DEFAULT 0,
    coinflip_won INTEGER DEFAULT 0,
    corrida_won INTEGER DEFAULT 0,
    poker_won INTEGER DEFAULT 0,
    last_daily INTEGER DEFAULT 0,
    last_mesada INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    daily_streak INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS global_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    multiplier REAL NOT NULL,
    starts_at INTEGER NOT NULL,
    ends_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    reward INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
  );

  CREATE TABLE IF NOT EXISTS active_bets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount INTEGER NOT NULL,
    game TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'skin', 'booster', 'role', 'table_skin'
    metadata TEXT -- JSON string for extra data (e.g., skin colors, role ID)
  );

  CREATE TABLE IF NOT EXISTS user_items (
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    purchased_at INTEGER NOT NULL,
    is_active INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
  );

  CREATE TABLE IF NOT EXISTS missions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    goal INTEGER NOT NULL,
    reward INTEGER NOT NULL,
    type TEXT NOT NULL, -- 'win_count', 'bet_amount', 'specific_game'
    game TEXT, -- optional game filter
    period TEXT NOT NULL -- 'daily', 'weekly'
  );

  CREATE TABLE IF NOT EXISTS user_missions (
    user_id TEXT NOT NULL,
    mission_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    completed INTEGER DEFAULT 0,
    expires_at INTEGER NOT NULL,
    PRIMARY KEY (user_id, mission_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (mission_id) REFERENCES missions(id)
  );
`);

// Seed initial items and missions
const insertItem = db.prepare('INSERT OR IGNORE INTO items (id, name, description, price, type, metadata) VALUES (?, ?, ?, ?, ?, ?)');
insertItem.run('skin_classic', 'Clássico', 'O visual padrão das cartas.', 0, 'skin', JSON.stringify({ style: 'classic', color: '#b71c1c' }));
insertItem.run('skin_hearts', 'Copas', 'Estilo focado no naipe de Copas.', 25000, 'skin', JSON.stringify({ style: 'hearts', color: '#d32f2f' }));
insertItem.run('skin_clubs', 'Paus', 'Estilo focado no naipe de Paus.', 25000, 'skin', JSON.stringify({ style: 'clubs', color: '#111111' }));
insertItem.run('skin_diamonds', 'Ouros', 'Estilo focado no naipe de Ouros.', 25000, 'skin', JSON.stringify({ style: 'diamonds', color: '#d32f2f' }));
insertItem.run('skin_artdeco', 'Art-Deco', 'Padrões geométricos elegantes e luxuosos.', 100000, 'skin', JSON.stringify({ style: 'artdeco', color: '#d4af37' }));
insertItem.run('skin_minimalist', 'Minimalista', 'Design limpo e moderno, foco total no jogo.', 15000, 'skin', JSON.stringify({ style: 'minimalist', color: '#ffffff' }));
insertItem.run('skin_vintage', 'Vintage', 'Papel envelhecido e estilo retrô clássico.', 45000, 'skin', JSON.stringify({ style: 'vintage', color: '#f5f5dc' }));
insertItem.run('skin_occult', 'Oculto', 'Símbolos alquímicos e mistério nas cartas.', 120000, 'skin', JSON.stringify({ style: 'occult', color: '#4b0082' }));
insertItem.run('skin_king_spades', 'Rei de Espadas', 'O soberano das cartas em destaque.', 80000, 'skin', JSON.stringify({ style: 'king_spades', color: '#1a1a1a' }));
insertItem.run('skin_queen_hearts', 'Rainha de Copas', 'A majestade vermelha em seu baralho.', 80000, 'skin', JSON.stringify({ style: 'queen_hearts', color: '#b71c1c' }));
insertItem.run('skin_joker', 'Coringa', 'O caos e a sorte em um só visual.', 150000, 'skin', JSON.stringify({ style: 'joker', color: '#800080' }));
insertItem.run('skin_jack_diamonds', 'Valete de Ouros', 'O cavaleiro da fortuna em suas mãos.', 80000, 'skin', JSON.stringify({ style: 'jack_diamonds', color: '#d4af37' }));

insertItem.run('skin_gold', 'Dourado Luxo', 'Cartas com verso dourado reluzente.', 50000, 'skin', JSON.stringify({ style: 'classic', color: '#d4af37' }));
insertItem.run('skin_neon', 'Neon Cyber', 'Estilo futurista com bordas neon.', 75000, 'skin', JSON.stringify({ style: 'classic', color: '#00f2ff' }));
insertItem.run('skin_dark', 'Noite Sombria', 'Cartas pretas elegantes e discretas.', 30000, 'skin', JSON.stringify({ style: 'classic', color: '#1a1a1a' }));

// Table Skins
insertItem.run('table_classic', 'Mesa Clássica', 'O feltro verde tradicional dos cassinos.', 0, 'table_skin', JSON.stringify({ color: '#1a4a1a' }));
insertItem.run('table_royal', 'Mesa Real', 'Feltro azul profundo digno da realeza.', 40000, 'table_skin', JSON.stringify({ color: '#0a1a4a' }));
insertItem.run('table_luxury', 'Mesa de Luxo', 'Feltro vinho sofisticado.', 60000, 'table_skin', JSON.stringify({ color: '#4a0a0a' }));
insertItem.run('table_midnight', 'Mesa Meia-Noite', 'Feltro cinza escuro moderno.', 80000, 'table_skin', JSON.stringify({ color: '#1a1a1a' }));
insertItem.run('table_emerald', 'Mesa Esmeralda', 'Verde vibrante com detalhes dourados.', 100000, 'table_skin', JSON.stringify({ color: '#004d00' }));
insertItem.run('table_amethyst', 'Mesa Ametista', 'Roxo místico para grandes apostadores.', 120000, 'table_skin', JSON.stringify({ color: '#4b0082' }));
insertItem.run('table_carbon', 'Mesa de Carbono', 'Estilo fibra de carbono ultra-moderno.', 150000, 'table_skin', JSON.stringify({ color: '#000000' }));
insertItem.run('table_cyber', 'Mesa Cyberpunk', 'Feltro escuro com detalhes em ciano neon.', 200000, 'table_skin', JSON.stringify({ color: '#001a1a' }));

const insertMission = db.prepare('INSERT OR IGNORE INTO missions (id, title, description, goal, reward, type, game, period) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
// Daily Missions
insertMission.run('daily_blackjack_wins', 'Mestre do 21', 'Vença 5 partidas de Blackjack.', 5, 2000, 'win_count', 'blackjack', 'daily');
insertMission.run('daily_crash_bet', 'Arriscado', 'Aposte um total de 10.000 no Crash.', 10000, 1500, 'bet_amount', 'crash', 'daily');
insertMission.run('daily_slots_spins', 'Gira Gira', 'Jogue 20 vezes no Slots.', 20, 1000, 'play_count', 'slots', 'daily');
insertMission.run('daily_roulette_wins', 'Sorte na Roda', 'Vença 3 vezes na Roleta.', 3, 2500, 'win_count', 'roulette', 'daily');
insertMission.run('daily_coinflip_wins', 'Cara ou Coroa', 'Vença 5 vezes no Coinflip.', 5, 1200, 'win_count', 'coinflip', 'daily');
insertMission.run('daily_mines_wins', 'Caçador de Tesouros', 'Vença 3 vezes no Mines.', 3, 1800, 'win_count', 'mines', 'daily');
insertMission.run('daily_poker_wins', 'Blefe Diário', 'Vença 2 partidas de Poker.', 2, 3000, 'win_count', 'poker', 'daily');
insertMission.run('daily_corrida_wins', 'Puro Sangue', 'Vença 2 corridas de cavalos.', 2, 2200, 'win_count', 'corrida', 'daily');
insertMission.run('daily_dice_wins', 'Duelo de Dados', 'Vença 3 duelos de dados.', 3, 1500, 'win_count', 'dice', 'daily');
insertMission.run('daily_total_bet', 'Grande Apostador', 'Aposte um total de 50.000 em qualquer jogo.', 50000, 5000, 'bet_amount', null, 'daily');
insertMission.run('daily_total_wins', 'Maré de Sorte', 'Vença 15 vezes em qualquer jogo.', 15, 3500, 'win_count', null, 'daily');

// Weekly Missions
insertMission.run('weekly_poker_wins', 'Tubarão do Poker', 'Vença 10 partidas de Poker.', 10, 10000, 'win_count', 'poker', 'weekly');
insertMission.run('weekly_blackjack_wins', 'Estrategista', 'Vença 25 partidas de Blackjack.', 25, 8000, 'win_count', 'blackjack', 'weekly');
insertMission.run('weekly_slots_spins', 'Viciado em Slots', 'Jogue 100 vezes no Slots.', 100, 5000, 'play_count', 'slots', 'weekly');
insertMission.run('weekly_total_bet', 'Milionário', 'Aposte um total de 500.000 em qualquer jogo.', 500000, 25000, 'bet_amount', null, 'weekly');
insertMission.run('weekly_crash_wins', 'Piloto de Fuga', 'Vença 15 vezes no Crash.', 15, 7000, 'win_count', 'crash', 'weekly');
insertMission.run('weekly_mines_wins', 'Desarmador', 'Vença 20 vezes no Mines.', 20, 9000, 'win_count', 'mines', 'weekly');

// Refund any active bets from a previous crash/restart
const refundActiveBets = () => {
  const activeBets = db.prepare('SELECT * FROM active_bets').all() as any[];
  if (activeBets.length > 0) {
    console.log(`Refunding ${activeBets.length} active bets from previous session...`);
    const refundStmt = db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?');
    const deleteStmt = db.prepare('DELETE FROM active_bets WHERE id = ?');
    
    db.transaction(() => {
      for (const bet of activeBets) {
        refundStmt.run(bet.amount, bet.user_id);
        deleteStmt.run(bet.id);
        console.log(`Refunded 🪙 ${bet.amount} to user ${bet.user_id} for game ${bet.game}`);
      }
    })();
  }
};

refundActiveBets();

// Seed initial achievements if empty
const achCount = (db.prepare('SELECT COUNT(*) as count FROM achievements').get() as any).count;
if (achCount === 0) {
  const insertAch = db.prepare('INSERT INTO achievements (id, name, description, reward) VALUES (?, ?, ?, ?)');
  insertAch.run('first_win', 'Primeira de Muitas', 'Ganhe sua primeira aposta em qualquer jogo.', 500);
  insertAch.run('high_roller', 'Apostador de Elite', 'Aposte um total de 1.000.000 de Odiondos.', 10000);
  insertAch.run('level_10', 'Veterano', 'Alcance o nível 10.', 5000);
  insertAch.run('streak_7', 'Fiel ao Cassino', 'Mantenha uma sequência de 7 dias no /daily.', 2000);
}

// Ensure columns exist for existing databases
const columns = ['slots_won', 'blackjack_won', 'roulette_won', 'crash_won', 'mines_won', 'dice_won', 'coinflip_won', 'corrida_won', 'poker_won', 'last_daily', 'last_mesada', 'xp', 'level', 'daily_streak'];
for (const column of columns) {
  try {
    db.prepare(`ALTER TABLE users ADD COLUMN ${column} INTEGER DEFAULT 0`).run();
  } catch (err) {
    // Column already exists
  }
}

export const getUser = (id: string) => {
  let user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
  if (!user) {
    db.prepare('INSERT INTO users (id) VALUES (?)').run(id);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }
  return user;
};

export const updateBalance = (id: string, amount: number) => {
  getUser(id);
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, id);
};

export const recordBet = (id: string, betAmount: number, winAmount: number, gameType?: 'slots' | 'blackjack' | 'roulette' | 'coinflip' | 'crash' | 'mines' | 'dice' | 'corrida' | 'poker') => {
  getUser(id);
  db.prepare('UPDATE users SET total_bet = total_bet + ?, total_won = total_won + ? WHERE id = ?').run(betAmount, winAmount, id);
  
  // Gain XP based on bet amount (10% of bet)
  const xpEvent = getActiveEvent('xp');
  const xpMultiplier = xpEvent ? xpEvent.multiplier : 1;
  const xpGain = Math.max(1, Math.floor(betAmount * 0.1 * xpMultiplier));
  const newLevel = addXP(id, xpGain);

  // Update Mission Progress
  updateMissionProgress(id, 'bet_amount', betAmount, gameType);
  updateMissionProgress(id, 'play_count', 1, gameType);
  if (winAmount > 0) {
    updateMissionProgress(id, 'win_count', 1, gameType);
  }

  if (gameType && winAmount > 0) {
    const column = `${gameType}_won`;
    db.prepare(`UPDATE users SET ${column} = ${column} + ? WHERE id = ?`).run(winAmount, id);
  }

  const unlockedAchievements = checkAchievements(id, winAmount);
  
  return { newLevel, unlockedAchievements, isBigWin: winAmount >= 10000 };
};

export const getActiveEvent = (type: string) => {
  const now = Date.now();
  return db.prepare('SELECT * FROM global_events WHERE type = ? AND starts_at <= ? AND ends_at >= ?').get(type, now, now) as any;
};

export const createEvent = (type: string, multiplier: number, durationMinutes: number) => {
  const now = Date.now();
  const endsAt = now + (durationMinutes * 60 * 1000);
  db.prepare('INSERT INTO global_events (type, multiplier, starts_at, ends_at) VALUES (?, ?, ?, ?)').run(type, multiplier, now, endsAt);
};

export const getLeaderboard = (category: 'balance' | 'total_won' | 'slots_won' | 'blackjack_won' | 'roulette_won' | 'coinflip_won' | 'corrida_won' | 'poker_won' | 'level', limit: number = 10) => {
  return db.prepare(`SELECT id, ${category} as value FROM users ORDER BY ${category} DESC LIMIT ?`).all(limit) as { id: string, value: number }[];
};

export const getUserRank = (userId: string, category: 'balance' | 'total_won' | 'slots_won' | 'blackjack_won' | 'roulette_won' | 'coinflip_won' | 'corrida_won' | 'poker_won' | 'level') => {
  const result = db.prepare(`
    SELECT (
      SELECT COUNT(*) + 1 
      FROM users u2 
      WHERE u2.${category} > u1.${category}
    ) as rank, ${category} as value
    FROM users u1
    WHERE id = ?
  `).get(userId) as { rank: number, value: number } | undefined;
  return result;
};

export const unlockAchievement = (userId: string, achievementId: string) => {
  const existing = db.prepare('SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?').get(userId, achievementId);
  if (existing) return false;
  
  const achievement = db.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId) as any;
  if (!achievement) return false;
  
  db.prepare('INSERT INTO user_achievements (user_id, achievement_id, unlocked_at) VALUES (?, ?, ?)').run(userId, achievementId, Date.now());
  updateBalance(userId, achievement.reward);
  return achievement;
};

export const getUserAchievements = (userId: string) => {
  return db.prepare(`
    SELECT achievements.*, user_achievements.unlocked_at 
    FROM user_achievements 
    JOIN achievements ON user_achievements.achievement_id = achievements.id 
    WHERE user_achievements.user_id = ?
  `).all(userId) as any[];
};

export const checkAchievements = (userId: string, lastWinAmount: number = 0) => {
  const user = getUser(userId);
  const unlocked: any[] = [];
  
  if (lastWinAmount > 0) {
    const res = unlockAchievement(userId, 'first_win');
    if (res) unlocked.push(res);
  }
  
  if (user.total_bet >= 1000000) {
    const res = unlockAchievement(userId, 'high_roller');
    if (res) unlocked.push(res);
  }
  
  if (user.level >= 10) {
    const res = unlockAchievement(userId, 'level_10');
    if (res) unlocked.push(res);
  }
  
  if (user.daily_streak >= 7) {
    const res = unlockAchievement(userId, 'streak_7');
    if (res) unlocked.push(res);
  }
  
  return unlocked;
};

export const updateCooldown = (id: string, type: 'daily' | 'mesada') => {
  const column = `last_${type}`;
  db.prepare(`UPDATE users SET ${column} = ? WHERE id = ?`).run(Date.now(), id);
};

export const addXP = (id: string, amount: number) => {
  const user = getUser(id);
  const newXP = (user.xp || 0) + amount;
  const level = user.level || 1;
  const nextLevelXP = level * 1000;
  
  if (newXP >= nextLevelXP) {
    const newLevel = level + 1;
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP - nextLevelXP, newLevel, id);
    return newLevel;
  } else {
    db.prepare('UPDATE users SET xp = ? WHERE id = ?').run(newXP, id);
    return null;
  }
};

export const addActiveBet = (betId: string, userId: string, amount: number, game: string) => {
  db.prepare('INSERT INTO active_bets (id, user_id, amount, game, created_at) VALUES (?, ?, ?, ?, ?)').run(betId, userId, amount, game, Date.now());
};

export const updateActiveBet = (betId: string, additionalAmount: number) => {
  db.prepare('UPDATE active_bets SET amount = amount + ? WHERE id = ?').run(additionalAmount, betId);
};

export const removeActiveBet = (betId: string) => {
  db.prepare('DELETE FROM active_bets WHERE id = ?').run(betId);
};

// Shop & Inventory
export const getItems = () => {
  return db.prepare('SELECT * FROM items').all() as any[];
};

export const buyItem = (userId: string, itemId: string) => {
  const user = getUser(userId);
  const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId) as any;
  
  if (!item) throw new Error('Item não encontrado.');
  if (user.balance < item.price) throw new Error('Saldo insuficiente.');
  
  const existing = db.prepare('SELECT * FROM user_items WHERE user_id = ? AND item_id = ?').get(userId, itemId);
  if (existing) throw new Error('Você já possui este item.');
  
  db.transaction(() => {
    updateBalance(userId, -item.price);
    db.prepare('INSERT INTO user_items (user_id, item_id, purchased_at) VALUES (?, ?, ?)').run(userId, itemId, Date.now());
  })();
  
  return item;
};

export const getUserInventory = (userId: string) => {
  return db.prepare(`
    SELECT items.*, user_items.is_active 
    FROM user_items 
    JOIN items ON user_items.item_id = items.id 
    WHERE user_items.user_id = ?
  `).all(userId) as any[];
};

export const setActiveSkin = (userId: string, itemId: string) => {
  const item = db.prepare('SELECT type FROM items WHERE id = ?').get(itemId) as any;
  if (!item) return;

  db.transaction(() => {
    // Deactivate all items of the same type for this user
    db.prepare(`
      UPDATE user_items 
      SET is_active = 0 
      WHERE user_id = ? AND item_id IN (SELECT id FROM items WHERE type = ?)
    `).run(userId, item.type);
    
    // Activate the selected item
    db.prepare('UPDATE user_items SET is_active = 1 WHERE user_id = ? AND item_id = ?').run(userId, itemId);
  })();
};

export const getActiveSkin = (userId: string) => {
  const skin = db.prepare(`
    SELECT items.* 
    FROM user_items 
    JOIN items ON user_items.item_id = items.id 
    WHERE user_items.user_id = ? AND user_items.is_active = 1 AND items.type = 'skin'
  `).get(userId) as any;
  
  if (!skin) {
    // Default skin
    return db.prepare('SELECT * FROM items WHERE id = "skin_classic"').get() as any;
  }
  return skin;
};

export const getActiveTableSkin = (userId: string) => {
  const tableSkin = db.prepare(`
    SELECT items.* 
    FROM user_items 
    JOIN items ON user_items.item_id = items.id 
    WHERE user_items.user_id = ? AND user_items.is_active = 1 AND items.type = 'table_skin'
  `).get(userId) as any;
  
  if (!tableSkin) {
    // Default table skin
    return db.prepare('SELECT * FROM items WHERE id = "table_classic"').get() as any;
  }
  return tableSkin;
};

// Missions
export const getMissions = (period: 'daily' | 'weekly', limit: number = 3) => {
  return db.prepare('SELECT * FROM missions WHERE period = ? ORDER BY RANDOM() LIMIT ?').all(period, limit) as any[];
};

export const getUserMissions = (userId: string) => {
  const now = Date.now();
  // Ensure user has active missions
  const activeMissions = db.prepare('SELECT * FROM user_missions WHERE user_id = ? AND expires_at > ?').all(userId, now);
  
  if (activeMissions.length === 0) {
    // Assign new daily missions (3 random)
    const dailyMissions = getMissions('daily', 3);
    // Assign new weekly mission (1 random)
    const weeklyMissions = getMissions('weekly', 1);
    
    const expiresAtDaily = new Date().setHours(23, 59, 59, 999);
    const expiresAtWeekly = new Date();
    expiresAtWeekly.setDate(expiresAtWeekly.getDate() + (7 - expiresAtWeekly.getDay())); // End of current week (Sunday)
    expiresAtWeekly.setHours(23, 59, 59, 999);
    
    db.transaction(() => {
      for (const mission of dailyMissions) {
        db.prepare('INSERT OR IGNORE INTO user_missions (user_id, mission_id, expires_at) VALUES (?, ?, ?)').run(userId, mission.id, expiresAtDaily);
      }
      for (const mission of weeklyMissions) {
        db.prepare('INSERT OR IGNORE INTO user_missions (user_id, mission_id, expires_at) VALUES (?, ?, ?)').run(userId, mission.id, expiresAtWeekly.getTime());
      }
    })();
    
    return db.prepare(`
      SELECT missions.*, user_missions.progress, user_missions.completed 
      FROM user_missions 
      JOIN missions ON user_missions.mission_id = missions.id 
      WHERE user_missions.user_id = ? AND user_missions.expires_at > ?
    `).all(userId, now) as any[];
  }
  
  return db.prepare(`
    SELECT missions.*, user_missions.progress, user_missions.completed 
    FROM user_missions 
    JOIN missions ON user_missions.mission_id = missions.id 
    WHERE user_missions.user_id = ? AND user_missions.expires_at > ?
  `).all(userId, now) as any[];
};

export const updateMissionProgress = (userId: string, type: string, amount: number, game?: string) => {
  const now = Date.now();
  const missions = db.prepare(`
    SELECT user_missions.*, missions.goal, missions.type as m_type, missions.game as m_game
    FROM user_missions 
    JOIN missions ON user_missions.mission_id = missions.id 
    WHERE user_missions.user_id = ? AND user_missions.expires_at > ? AND user_missions.completed = 0
  `).all(userId, now) as any[];

  for (const m of missions) {
    if (m.m_type === type && (!m.m_game || m.m_game === game)) {
      const newProgress = m.progress + amount;
      db.prepare('UPDATE user_missions SET progress = ? WHERE user_id = ? AND mission_id = ?').run(newProgress, userId, m.mission_id);
      
      if (newProgress >= m.goal) {
        // Mission completed but not claimed
      }
    }
  }
};

export const claimMissionReward = (userId: string, missionId: string) => {
  const mission = db.prepare(`
    SELECT user_missions.*, missions.reward, missions.title
    FROM user_missions 
    JOIN missions ON user_missions.mission_id = missions.id 
    WHERE user_missions.user_id = ? AND user_missions.mission_id = ?
  `).get(userId, missionId) as any;

  if (!mission) throw new Error('Missão não encontrada.');
  if (mission.completed) throw new Error('Recompensa já resgatada.');
  if (mission.progress < mission.goal) throw new Error('Missão ainda não concluída.');

  db.transaction(() => {
    db.prepare('UPDATE user_missions SET completed = 1 WHERE user_id = ? AND mission_id = ?').run(userId, missionId);
    updateBalance(userId, mission.reward);
  })();

  return mission;
};

export default db;
