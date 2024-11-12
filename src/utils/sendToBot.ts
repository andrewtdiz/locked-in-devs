import { CommandInteraction } from "discord.js";
import { MUSIC_BOT_1, MUSIC_BOT_2 } from "../constants/bots";
import type { MusicBots } from "../constants/botclients";

const SEND_CHANNEL = "1305712138106441788";

const BOT_PORT = {
    [MUSIC_BOT_1]: "3001",
    [MUSIC_BOT_2]: "3002"
};

export async function sendToBot(
  interaction: CommandInteraction,
  botId: MusicBots,
  command: string,
  data?: Record<string, string>
): Promise<string | null> {
  const channel = interaction.guild?.channels.cache.get(SEND_CHANNEL);
  if (!channel || !channel.isTextBased()) {
    return null;
  }
  const member = interaction.member;
  if (!member) return null;
  if (!member || !("voice" in member)) return null;

  const result = await fetch(`http://localhost:${BOT_PORT[botId]}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      command,
      ...data,
    }),
  });
  if (!result.ok) {
    return null;
  }
  const body = await result.json();

  return body?.result || null;
}
