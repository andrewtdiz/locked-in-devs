import { CommandInteraction } from "discord.js";
import { getBotInSameChannel } from "./getBotInSameChannel";
import { getAvailableBot } from "./getAvailableBot";
import type { MusicBots } from "../constants/botclients";

export async function getBot(
  interaction: CommandInteraction
): Promise<MusicBots | null> {
  const sameChannelBot = await getBotInSameChannel(interaction);
  if (sameChannelBot) return sameChannelBot;

  return await getAvailableBot(interaction);
}
