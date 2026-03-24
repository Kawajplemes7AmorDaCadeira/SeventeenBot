import dotenv from 'dotenv';
dotenv.config();

export const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  GUILD_ID: process.env.GUILD_ID || '', // Optional, for testing
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
};
