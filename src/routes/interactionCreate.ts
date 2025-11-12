import type { Interaction } from "discord.js";
import { isInChannel } from "../utils/isInChannel";
import { musicPlayerManager } from "../music/MusicPlayerManager";

export function createInteractionHandler(
  commands: any[],
  musicBotCommands: any[]
) {
  function isMusicBotCommand(commandName: string): boolean {
    return musicBotCommands.some((cmd) => cmd.data.name === commandName);
  }

  return async function handleInteraction(interaction: Interaction) {
    if (interaction.isButton()) {
      if (interaction.customId.startsWith("music-player")) {
        await musicPlayerManager.handleButton(interaction);
      }
      return;
    }

    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    for (const command of commands) {
      if (command.data.name === commandName) {
        if (isMusicBotCommand(command.data.name)) {
          const inChannel = isInChannel(interaction);

          if (!inChannel) {
            return interaction.editReply(
              "You need to be in a voice channel to play music!"
            );
          }
        }

        await command.execute(interaction);
      }
    }
  };
}
