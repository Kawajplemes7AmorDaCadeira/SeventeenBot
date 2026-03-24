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
      // Handle button interactions
      // We can route this to specific game handlers based on customId
      const [game, action, userId] = interaction.customId.split('_');
      
      if (userId && interaction.user.id !== userId) {
        await interaction.reply({ content: 'This is not your game!', ephemeral: true });
        return;
      }

      if (game === 'blackjack') {
        const { handleBlackjackButton } = await import('../games/blackjack/game.js');
        await handleBlackjackButton(interaction, action, userId);
      }
    } else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === 'shop_buy') {
        const { handleShopSelect } = await import('../commands/economy/shop.js');
        await handleShopSelect(interaction);
      } else if (interaction.customId.startsWith('roulette_type_')) {
        const { handleRouletteTypeSelect } = await import('../games/roulette/game.js');
        await handleRouletteTypeSelect(interaction);
      } else if (interaction.customId.startsWith('roulette_number_')) {
        const { handleRouletteNumberSelect } = await import('../games/roulette/game.js');
        await handleRouletteNumberSelect(interaction);
      }
    }
  },
};
