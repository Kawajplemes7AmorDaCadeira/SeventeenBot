import { Events, BaseInteraction } from 'discord.js';
import { commands } from '../index.js';

export default {
  name: Events.InteractionCreate,
  async execute(interaction: BaseInteraction) {
    if (interaction.isChatInputCommand()) {
      const command = commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
      }
    } else if (interaction.isButton()) {
      try {
        // Handle button interactions
        // We can route this to specific game handlers based on customId
        const parts = interaction.customId.split('_');
        const [game, action, userId] = parts;
        
        // Only check userId for games that follow the game_action_userId format
        if ((game === 'blackjack' || game === 'slots' || game === 'roulette' || game === 'corrida') && userId && interaction.user.id !== userId) {
          // Special case for blackjack double down: blackjack_double_down_userId
          if (game === 'blackjack' && action === 'double' && parts[2] === 'down') {
            if (parts[3] && interaction.user.id !== parts[3]) {
              await interaction.reply({ content: 'This is not your game!', ephemeral: true });
              return;
            }
          } else {
            await interaction.reply({ content: 'This is not your game!', ephemeral: true });
            return;
          }
        }

        if (game === 'blackjack') {
          await interaction.deferUpdate();
          const { handleBlackjackButton } = await import('../games/blackjack/game.js');
          // Handle double_down separately or map it
          const blackjackAction = action === 'double' && parts[2] === 'down' ? 'double_down' : action;
          const actualUserId = action === 'double' && parts[2] === 'down' ? parts[3] : userId;
          await handleBlackjackButton(interaction, blackjackAction, actualUserId);
        } else if (game === 'slots') {
          await interaction.deferUpdate();
          const { handleSlotsButton } = await import('../games/slots/game.js');
          await handleSlotsButton(interaction, action, userId);
        } else if (game === 'roulette') {
          await interaction.deferUpdate();
          const { handleRouletteButton } = await import('../games/roulette/game.js');
          await handleRouletteButton(interaction, action, userId);
        } else if (game === 'corrida') {
          await interaction.deferUpdate();
          const { handleCorridaButton } = await import('../games/corrida/game.js');
          await handleCorridaButton(interaction, action, userId);
        } else if (interaction.customId.startsWith('lobby_')) {
          await interaction.deferReply({ ephemeral: true });
          const { handleLobbyButton } = await import('../commands/games/casino.js');
          await handleLobbyButton(interaction);
        } else if (interaction.customId.startsWith('start_')) {
          await interaction.deferUpdate();
          const { handleStartGameButton } = await import('../commands/games/casino.js');
          await handleStartGameButton(interaction);
        }
      } catch (error) {
        console.error(`Error executing button interaction ${interaction.customId}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Ocorreu um erro ao processar este botão!', ephemeral: true }).catch(console.error);
        } else {
          await interaction.reply({ content: 'Ocorreu um erro ao processar este botão!', ephemeral: true }).catch(console.error);
        }
      }
    } else if (interaction.isStringSelectMenu()) {
      try {
        await interaction.deferUpdate();
        
        if (interaction.customId.startsWith('roulette_type_')) {
          const { handleRouletteTypeSelect } = await import('../games/roulette/game.js');
          await handleRouletteTypeSelect(interaction);
        } else if (interaction.customId.startsWith('roulette_number_')) {
          const { handleRouletteNumberSelect } = await import('../games/roulette/game.js');
          await handleRouletteNumberSelect(interaction);
        } else if (interaction.customId.startsWith('corrida_horse_')) {
          const { handleCorridaHorseSelect } = await import('../games/corrida/game.js');
          await handleCorridaHorseSelect(interaction);
        }
      } catch (error) {
        console.error(`Error executing select menu interaction ${interaction.customId}:`, error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Ocorreu um erro ao processar esta seleção!', ephemeral: true }).catch(console.error);
        } else {
          await interaction.reply({ content: 'Ocorreu um erro ao processar esta seleção!', ephemeral: true }).catch(console.error);
        }
      }
    }
  },
};
