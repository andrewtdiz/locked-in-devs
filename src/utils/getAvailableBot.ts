import { CommandInteraction } from "discord.js";
import botclients, { type MusicBots } from "../constants/botclients";

export function getAvailableBot(
  interaction: CommandInteraction
): MusicBots | null {
  const guild = interaction.guild;
  if (!guild) return null;

  for (const botClientId of botclients) {
    const bot = guild.members.cache.get(botClientId);
    if (!bot) continue;

    const botVoiceState = bot.voice;
    if (!botVoiceState) {
      return botClientId;
    }
  }

  return null;
}
