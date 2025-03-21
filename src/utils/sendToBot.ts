import { CommandInteraction } from "discord.js";
import { MUSIC_BOT_1, MUSIC_BOT_2 } from "../constants/bots";
import type { BotClient } from "../constants/botclients";

const SEND_CHANNEL = "1305712138106441788";

const BOT_PORT = {
  [MUSIC_BOT_1]: "3001",
  [MUSIC_BOT_2]: "3002",
};

export async function sendToBot(
  interaction: CommandInteraction,
  botId: BotClient,
  command: string,
  data?: Record<string, string>
): Promise<string | null> {
  const member = interaction.member;
  console.log(member?.user.id);
  if (!member) return null;
  if (!member || !("voice" in member)) return null;

  console.log("POSTING");

  const startTime = Date.now();

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

  console.log(`Request took ${Date.now() - startTime}ms`);

  return body?.result || null;
}
