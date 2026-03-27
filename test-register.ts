import { REST, Routes } from 'discord.js';
import { config } from './src/bot/config.js';
import fs from 'fs';
import path from 'path';

async function testRegister() {
  if (!config.DISCORD_TOKEN || !config.CLIENT_ID) {
    console.error('DISCORD_TOKEN or CLIENT_ID is not set.');
    return;
  }

  const commandsPath = path.join(process.cwd(), 'src', 'bot', 'commands');
  const commandData: any[] = [];
  
  const loadCommands = async (dir: string) => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        await loadCommands(fullPath);
      } else if (file.endsWith('.ts') || file.endsWith('.js')) {
        try {
          const module = await import('file://' + fullPath);
          if (module.default && module.default.data) {
            console.log(`Loading command: ${module.default.data.name}`);
            commandData.push(module.default.data.toJSON());
          }
        } catch (e) {
          console.error(`Failed to load ${file}:`, e);
        }
      }
    }
  };

  await loadCommands(commandsPath);

  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  try {
    console.log(`Started refreshing ${commandData.length} application (/) commands.`);
    await rest.put(
      Routes.applicationCommands(config.CLIENT_ID),
      { body: commandData },
    );
    console.log('Successfully reloaded application (/) commands.');
  } catch (error: any) {
    console.error('Error registering commands:', error);
    if (error.errors) {
      console.error('Detailed API Errors:', JSON.stringify(error.errors, null, 2));
    }
    if (error.requestBody) {
      // console.error('Request Body:', JSON.stringify(error.requestBody, null, 2));
      // Let's inspect the request body for each command to see if something is wrong
      const body = error.requestBody.json;
      if (Array.isArray(body)) {
        body.forEach((cmd: any, index: number) => {
          console.log(`Command ${index}: ${cmd.name}`);
          if (cmd.options) {
            cmd.options.forEach((opt: any, optIndex: number) => {
              // console.log(`  Option ${optIndex}: ${opt.name}`);
            });
          }
        });
      }
    }
  }
}

testRegister();
