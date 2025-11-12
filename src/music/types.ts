import type { Message } from "discord.js";
import type { BotClient } from "../constants/botclients";

export interface TrackMetadata {
  id: string;
  title: string;
  artist: string;
  durationMs: number;
  requestedById: string;
  requestedByDisplayName: string;
  voiceChannelId: string;
  voiceChannelName: string;
  textChannelId: string;
  guildId: string;
}

export interface RuntimeTrack extends TrackMetadata {
  startedAt: number;
  accumulatedMs: number;
  paused: boolean;
}

export interface PlayerState {
  id: string;
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  botId?: BotClient;
  current?: RuntimeTrack;
  queue: TrackMetadata[];
  message?: Message<boolean>;
  updateInterval?: NodeJS.Timeout;
}
