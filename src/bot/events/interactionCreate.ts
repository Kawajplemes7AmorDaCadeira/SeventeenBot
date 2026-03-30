import { Events, BaseInteraction } from 'discord.js';
import { commands } from '../../index.js';

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
          await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
        } else {
          await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
        }
      }
    } else if (interaction.isButton()) {
      try {
        // Handle button interactions
        // We can route this to specific game handlers based on customId
        const parts = interaction.customId.split('_');
        const game = parts[0];
        const action = parts[1];
        // Try to find a part that looks like a Discord ID (17-20 digits)
        const userId = parts.find(p => /^\d{17,20}$/.test(p));
        
        // Only check userId for games that follow the game_action_userId format
        if ((game === 'blackjack' || game === 'slots' || game === 'roulette' || game === 'corrida' || game === 'poker') && userId && interaction.user.id !== userId) {
          if (interaction.deferred || interaction.replied) {
            await interaction.followUp({ content: 'Este não é o seu jogo!', ephemeral: true }).catch(console.error);
          } else {
            await interaction.reply({ content: 'Este não é o seu jogo!', ephemeral: true }).catch(console.error);
          }
          return;
        }

    if (game === 'blackjack') {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate().catch(console.error);
      }
      const { handleBlackjackButton } = await import('../games/blackjack/game.js');
      // Handle double_down separately or map it
      const blackjackAction = action === 'double' && parts[2] === 'down' ? 'double_down' : action;
      const actualUserId = action === 'double' && parts[2] === 'down' ? parts[3] : userId;
      await handleBlackjackButton(interaction, blackjackAction, actualUserId);
    } else if (game === 'poker') {
      const { handlePokerButton } = await import('../games/poker/game.js');
      await handlePokerButton(interaction, action, userId);
    } else if (game === 'slots') {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate().catch(console.error);
      }
      const { handleSlotsButton } = await import('../games/slots/game.js');
      await handleSlotsButton(interaction, action, userId);
    } else if (game === 'roulette') {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate().catch(console.error);
      }
      const { handleRouletteButton } = await import('../games/roulette/game.js');
      await handleRouletteButton(interaction, action, userId);
    } else if (game === 'corrida') {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate().catch(console.error);
      }
      const { handleCorridaButton } = await import('../games/corrida/game.js');
      await handleCorridaButton(interaction, action, userId);
    } else if (interaction.customId.startsWith('shop_')) {
      const { handleShopButton } = await import('../commands/economy/shop.js');
      await handleShopButton(interaction);
    } else if (interaction.customId.startsWith('inv_')) {
      const { handleInventoryButton } = await import('../commands/economy/inventory.js');
      await handleInventoryButton(interaction);
    } else if (interaction.customId.startsWith('mission_')) {
      const { handleMissionButton } = await import('../commands/economy/missions.js');
      await handleMissionButton(interaction);
    } else if (interaction.customId.startsWith('lobby_')) {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferReply({ ephemeral: true }).catch(console.error);
      }
      const { handleLobbyButton } = await import('../commands/games/casino.js');
      await handleLobbyButton(interaction);
    } else if (interaction.customId.startsWith('start_')) {
      if (!interaction.deferred && !interaction.replied) {
        await interaction.deferUpdate().catch(console.error);
      }
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
        if (interaction.customId.startsWith('roulette_type_')) {
          const { handleRouletteTypeSelect } = await import('../games/roulette/game.js');
          await handleRouletteTypeSelect(interaction);
        } else if (interaction.customId.startsWith('roulette_number_')) {
          const { handleRouletteNumberSelect } = await import('../games/roulette/game.js');
          await handleRouletteNumberSelect(interaction);
        } else if (interaction.customId.startsWith('corrida_horse_')) {
          const { handleCorridaHorseSelect } = await import('../games/corrida/game.js');
          await handleCorridaHorseSelect(interaction);
        } else if (interaction.customId.startsWith('shop_')) {
          const { handleShopButton } = await import('../commands/economy/shop.js');
          await handleShopButton(interaction);
        } else if (interaction.customId.startsWith('inv_')) {
          const { handleInventoryButton } = await import('../commands/economy/inventory.js');
          await handleInventoryButton(interaction);
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
