import { CommandInteraction } from "discord.js";
import { getBotInSameChannel } from "./getBotInSameChannel";
import { getAvailableBot } from "./getAvailableBot";
import type { MusicBots } from "../constants/botclients";

export function getBot(interaction: CommandInteraction): MusicBots | null {
  const sameChannelBot = getBotInSameChannel(interaction);
  if (sameChannelBot) return sameChannelBot;

  return getAvailableBot(interaction);
}
