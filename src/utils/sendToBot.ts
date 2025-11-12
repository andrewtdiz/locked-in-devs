import { CommandInteraction } from "discord.js";
import { MUSIC_BOT_1, MUSIC_BOT_2 } from "../constants/bots";
import type { BotClient } from "../constants/botclients";

const BOT_PORT = {
  [MUSIC_BOT_1]: "3001",
  [MUSIC_BOT_2]: "3002",
};

export interface BotTrackPayload {
  id?: string;
  title?: string;
  artist?: string;
  durationMs?: number;
}

export interface BotCommandResponse {
  result?: string;
  track?: BotTrackPayload;
  queue?: BotTrackPayload[];
}

export async function sendBotCommand(
  botId: BotClient,
  command: string,
  data?: Record<string, string>
): Promise<BotCommandResponse | null> {
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

  const body = (await result.json()) as BotCommandResponse;
  console.log(`Request took ${Date.now() - startTime}ms`);

  return body;
}

export async function sendToBot(
  interaction: CommandInteraction,
  botId: BotClient,
  command: string,
  data?: Record<string, string>
): Promise<string | null> {
  const member = interaction.member;
  if (!member) return null;
  if (!("voice" in member)) return null;

  const response = await sendBotCommand(botId, command, data);

  return response?.result || null;
}
