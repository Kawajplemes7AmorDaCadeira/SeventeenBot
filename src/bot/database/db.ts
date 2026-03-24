import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'casino.db');
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
    last_daily INTEGER DEFAULT 0,
    last_work INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    daily_streak INTEGER DEFAULT 0,
    coinflip_won INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    type TEXT NOT NULL,
    bonus_value REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS user_items (
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    PRIMARY KEY (user_id, item_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES items(id)
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
`);

// Seed initial items if empty
const itemCount = (db.prepare('SELECT COUNT(*) as count FROM items').get() as any).count;
if (itemCount === 0) {
  const insertItem = db.prepare('INSERT INTO items (id, name, description, price, type, bonus_value) VALUES (?, ?, ?, ?, ?, ?)');
  insertItem.run('xp_booster_1', 'Multiplicador de XP (1.5x)', 'Aumenta o ganho de XP em 50% permanentemente.', 50000, 'booster', 1.5);
  insertItem.run('daily_booster_1', 'Sorte Diária', 'Aumenta a recompensa do /daily em 20%.', 25000, 'booster', 1.2);
  insertItem.run('work_booster_1', 'Café Extra', 'Aumenta o ganho do /work em 30%.', 15000, 'booster', 1.3);
}

// Seed initial achievements if empty
const achCount = (db.prepare('SELECT COUNT(*) as count FROM achievements').get() as any).count;
if (achCount === 0) {
  const insertAch = db.prepare('INSERT INTO achievements (id, name, description, reward) VALUES (?, ?, ?, ?)');
  insertAch.run('first_win', 'Primeira de Muitas', 'Ganhe sua primeira aposta em qualquer jogo.', 500);
  insertAch.run('high_roller', 'Apostador de Elite', 'Aposte um total de 1.000.000 de fichas.', 10000);
  insertAch.run('level_10', 'Veterano', 'Alcance o nível 10.', 5000);
  insertAch.run('streak_7', 'Fiel ao Cassino', 'Mantenha uma sequência de 7 dias no /daily.', 2000);
}

// Ensure columns exist for existing databases
const columns = ['slots_won', 'blackjack_won', 'roulette_won', 'last_daily', 'last_work', 'xp', 'level', 'daily_streak', 'coinflip_won'];
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
  // amount can be positive (win) or negative (loss)
  getUser(id); // Ensure user exists
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, id);
};

export const recordBet = (id: string, betAmount: number, winAmount: number, gameType?: 'slots' | 'blackjack' | 'roulette' | 'coinflip') => {
  getUser(id);
  db.prepare('UPDATE users SET total_bet = total_bet + ?, total_won = total_won + ? WHERE id = ?').run(betAmount, winAmount, id);
  
  // Gain XP based on bet amount (10% of bet)
  const xpGain = Math.max(1, Math.floor(betAmount * 0.1));
  const newLevel = addXP(id, xpGain);

  if (gameType && winAmount > 0) {
    const column = `${gameType}_won`;
    db.prepare(`UPDATE users SET ${column} = ${column} + ? WHERE id = ?`).run(winAmount, id);
  }
  
  const unlockedAchievements = checkAchievements(id, winAmount);
  
  return { newLevel, unlockedAchievements };
};

export const getLeaderboard = (category: 'balance' | 'total_won' | 'slots_won' | 'blackjack_won' | 'roulette_won' | 'coinflip_won' | 'level', limit: number = 10) => {
  return db.prepare(`SELECT id, ${category} as value FROM users ORDER BY ${category} DESC LIMIT ?`).all(limit) as { id: string, value: number }[];
};

export const getItems = () => {
  return db.prepare('SELECT * FROM items').all() as any[];
};

export const getItem = (id: string) => {
  return db.prepare('SELECT * FROM items WHERE id = ?').get(id) as any;
};

export const buyItem = (userId: string, itemId: string) => {
  const item = getItem(itemId);
  const user = getUser(userId);
  
  if (user.balance < item.price) return { success: false, message: 'Saldo insuficiente.' };
  
  const existing = db.prepare('SELECT * FROM user_items WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;
  
  if (existing) {
    db.prepare('UPDATE user_items SET quantity = quantity + 1 WHERE user_id = ? AND item_id = ?').run(userId, itemId);
  } else {
    db.prepare('INSERT INTO user_items (user_id, item_id, quantity) VALUES (?, ?, 1)').run(userId, itemId);
  }
  
  updateBalance(userId, -item.price);
  return { success: true };
};

export const getUserItems = (userId: string) => {
  return db.prepare(`
    SELECT items.*, user_items.quantity 
    FROM user_items 
    JOIN items ON user_items.item_id = items.id 
    WHERE user_items.user_id = ?
  `).all(userId) as any[];
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
  
  // Check First Win - Only if they just won
  if (lastWinAmount > 0) {
    const res = unlockAchievement(userId, 'first_win');
    if (res) unlocked.push(res);
  }
  
  // Check High Roller
  if (user.total_bet >= 1000000) {
    const res = unlockAchievement(userId, 'high_roller');
    if (res) unlocked.push(res);
  }
  
  // Check Level 10
  if (user.level >= 10) {
    const res = unlockAchievement(userId, 'level_10');
    if (res) unlocked.push(res);
  }
  
  // Check Streak 7
  if (user.daily_streak >= 7) {
    const res = unlockAchievement(userId, 'streak_7');
    if (res) unlocked.push(res);
  }
  
  return unlocked;
};

export const updateCooldown = (id: string, type: 'daily' | 'work') => {
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
    db.prepare('UPDATE users SET xp = ?, level = ? WHERE id = ?').run(newXP - nextLevelXP, id);
    return newLevel; // Return new level
  } else {
    db.prepare('UPDATE users SET xp = ? WHERE id = ?').run(newXP, id);
    return null;
  }
};

export default db;
