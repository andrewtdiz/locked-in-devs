import {
  Client,
  GatewayIntentBits,
  GuildMember,
  Message,
  type Interaction,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";
import { Config } from "./config";
import { cancelTimer, startTimer } from "./utils/LockinTimer";
import { pingCommand } from "./commands/ping";
import playCommand from "./commands/play";
import pauseCommand from "./commands/pause";
import resumeCommand from "./commands/resume";
import queueCommand from "./commands/queue";
import stopCommand from "./commands/stop";
import timeLeftCommand from "./commands/timeleft";
import skipCommand from "./commands/skip";
import loopCommand from "./commands/loop";
import djmodeCommand from "./commands/djmode";
import muteAllCommand from "./commands/muteall";
import removeCommand from "./commands/remove";
import { isInChannel } from "./utils/isInChannel";
import mutedDuration from "./constants/mutedDuration";
import ttsRole from "./constants/ttsRole";
import jumpCommand from "./commands/jump";
import { lockInCommand } from "./commands/lockin";
import { unlockCommand } from "./commands/unlock";
import ttsCommand from "./commands/tts";

dotenv.config();

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const musicBotCommands = [
  djmodeCommand,
  pauseCommand,
  muteAllCommand,
  jumpCommand,
  playCommand,
  timeLeftCommand,
  loopCommand,
  removeCommand,
  queueCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
];

const commands = [
  ttsCommand,
  // lockInCommand,
  pingCommand,
  // unlockCommand,
  ...musicBotCommands,
];

function isMusicBotCommand(commandName: string): boolean {
  return musicBotCommands.some((command) => command.data.name === commandName);
}

client.on("interactionCreate", async (interaction: Interaction) => {
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
});

const rest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_TOKEN as string
);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID as string),
      { body: commands.map((command) => command.data) }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();

client.login(process.env.DISCORD_TOKEN);

client.once("ready", () => {
  console.log("Bot is online!");
});

export const timeouts = new Map<
  string,
  { timer: Timer; timestamp: number; message?: Message; tts?: boolean }
>();
const remainingTimeouts = new Map<
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

client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member as GuildMember;
  const userId = member.id;
  const isMuted = member.voice.mute;

  const hasBeenMuted = !oldState.serverMute && newState.serverMute;
  const hasBeenUnmuted = oldState.serverMute && !newState.serverMute;

  if (!member || !newState.guild) return;
  if (member.user.bot) return;

  const isInLockedVC =
    newState.channelId && Config.lockedVCIds.includes(newState.channelId);
  const hasStartedStreaming = !oldState.streaming && newState.streaming;
  const hasStoppedStreaming = oldState.streaming && !newState.streaming;
  const hasMuteRole = member.roles.cache.has(Config.muteRoleId);

  const hasJoinedVC = !oldState.channelId && newState.channelId;
  const hasLeftVC = oldState.channelId && !newState.channelId;

  if (hasMuteRole) {
    const shouldBeMuted = Boolean(isInLockedVC);
    if (isMuted !== shouldBeMuted) {
      await member.voice.setMute(shouldBeMuted);
    }

    if (isInLockedVC && hasStartedStreaming) {
      startTimer(userId, member);
    }

    if (hasStoppedStreaming || hasLeftVC) {
      cancelTimer(userId);
    }
  } else if (hasBeenMuted) {
    const lockInModeTimeRemaining =
      (lockInModeStartedTimestamp - Date.now()) / (1000 * 60);
    const waitMinutes =
      lockInModeTimeRemaining > 0 ? lockInModeTimeRemaining : mutedDuration;
    const waitDuration = 60 * waitMinutes * 1000;

    const timeout = timeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout.timer);
      timeouts.delete(userId);
    }

    const channel = member.voice.channel;
    let sentMessage: Message | undefined = undefined;
    const roundedWaitMinutes = Math.round(waitMinutes);
    if (channel) {
      sentMessage = await channel.send(
        `<@${
          member.id
        }> has been muted for ${roundedWaitMinutes} minutes.\nUnmuting <t:${Math.floor(
          (Date.now() + waitDuration) / 1000
        )}:R>`
      );
    }
    const tts = member.roles.cache.has(ttsRole);
    if (tts) {
      member.roles.remove(ttsRole);
    }

    const createdTimeout = setTimeout(() => {
      timeouts.delete(userId);
      if (!member.voice.channelId) return;
      member.voice?.setMute(false);

      if (tts) {
        member.roles.add(ttsRole);
      }

      if (sentMessage) {
        sentMessage.edit(`${member.user.displayName} has been unmuted.`);
      }
    }, waitDuration);

    timeouts.set(userId, {
      timer: createdTimeout,
      timestamp: Date.now() + waitDuration,
      message: sentMessage,
      tts,
    });
  } else if (hasBeenUnmuted) {
    const timeout = timeouts.get(userId);
    const tts = timeout?.tts;
    if (timeout) {
      if (tts) {
        member.roles.add(ttsRole);
      }
      timeout.message?.edit(`${member.user.displayName} has been unmuted.`);
      timeouts.delete(userId);
      clearTimeout(timeout.timer);
    }
  } else if (hasJoinedVC) {
    const remainingTimeout = remainingTimeouts.get(userId);
    const isLockInMode = lockInModeStartedTimestamp > Date.now();
    const lockInModeTimeRemaining =
      (lockInModeStartedTimestamp - Date.now()) / (1000 * 60);
    const tts = remainingTimeout?.tts;
    if (!remainingTimeout && !isLockInMode) return;

    if (!newState.serverMute && isLockInMode) {
      member.voice?.setMute(true);
      return;
    }

    const timeRemaining =
      remainingTimeout?.timeRemaining || lockInModeTimeRemaining;

    const channel = member.voice.channel;
    if (!channel) return;

    remainingTimeouts.delete(userId);

    let sentMessage = await channel.send(
      `<@${member.id}> is still muted.\nUnmuting <t:${Math.floor(
        (Date.now() + timeRemaining) / 1000
      )}:R>`
    );

    const createdTimeout = setTimeout(() => {
      timeouts.delete(userId);
      if (!member.voice.channelId) return;
      member.voice?.setMute(false);

      if (tts) {
        member.roles.add(ttsRole);
      }

      sentMessage.edit(`${member.user.displayName} has been unmuted.`);
    }, timeRemaining);

    timeouts.set(userId, {
      timer: createdTimeout,
      timestamp: Date.now() + timeRemaining,
      message: sentMessage,
      tts,
    });
  } else if (hasLeftVC) {
    const timeout = timeouts.get(userId);
    const tts = timeout?.tts;
    if (timeout) {
      remainingTimeouts.set(userId, {
        timeRemaining: timeout.timestamp - Date.now(),
        tts,
      });

      timeout.message?.edit(
        `${member.user.displayName} left the voice channel.`
      );

      timeouts.delete(userId);
      clearTimeout(timeout.timer);
    }
  }
});
