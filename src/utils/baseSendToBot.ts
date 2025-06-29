import { CommandInteraction } from "discord.js";
import { MUSIC_BOT_1, MUSIC_BOT_2 } from "../constants/bots";
import type { BotClient } from "../constants/botclients";


export async function baseSendToBot(
  command: string,
  data?: Record<string, string>,
): Promise<string | null> {
  console.log(command, data);
  const result = await fetch(`http://localhost:3001/`, {
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
