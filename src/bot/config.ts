import dotenv from 'dotenv';
dotenv.config();

export const config = {
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || '',
  CLIENT_ID: process.env.CLIENT_ID || '',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID || '',
};
