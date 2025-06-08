import { Message } from "discord.js";

export const timeouts = new Map<
  string,
  { timer: Timer; timestamp: number; message?: Message; tts?: boolean }
>();

export const remainingTimeouts = new Map<
  string,
  { timeRemaining: number; tts?: boolean }
>();

export let lockInModeStartedTimestamp = 0;

export function setLockInModeStartedTimestamp(timestamp: number) {
  lockInModeStartedTimestamp = timestamp;

  setTimeout(() => {
    lockInModeStartedTimestamp = 0;
  }, 1000 * 60 * 5);
}
