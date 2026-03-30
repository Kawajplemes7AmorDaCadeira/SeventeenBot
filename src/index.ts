import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import { config } from './bot/config.js';
import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
  ],
});

// We will store commands here
export const commands = new Collection<string, any>();

export async function startBot() {
  if (!config.DISCORD_TOKEN) {
    console.warn('DISCORD_TOKEN is not set. Bot will not start.');
    return;
  }

  // Load commands
  const commandsPath = path.join(__dirname, 'bot', 'commands');
  const commandData: any[] = [];
  
  const loadCommands = async (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        await loadCommands(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        const module = await import('file://' + fullPath);
        if (module.default && module.default.data) {
          commands.set(module.default.data.name, module.default);
          commandData.push(module.default.data.toJSON());
        }
      }
    }
  };

  await loadCommands(commandsPath);

  // Load events
  const eventsPath = path.join(__dirname, 'bot', 'events');
  if (fs.existsSync(eventsPath)) {
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'));
    for (const file of eventFiles) {
      const module = await import('file://' + path.join(eventsPath, file));
      const event = module.default;
      if (event && event.name) {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
      }
    }
  }

  try {
    if (commandData.length > 0) {
      const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);
      console.log(`Started refreshing ${commandData.length} application (/) commands.`);
      
      // Register global commands (Required for DMs and User Apps)
      await rest.put(
        Routes.applicationCommands(config.CLIENT_ID),
        { body: commandData },
      );

      console.log(`Successfully reloaded application (/) commands.`);
    }
  } catch (error) {
    console.error('Error registering commands:', error);
  }

  client.on('error', (error) => {
    console.error('Discord Client Error:', error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
  });

  await client.login(config.DISCORD_TOKEN);
}
