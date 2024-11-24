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
import { timeLeftCommand } from "./commands/timeleft";
import { unlockCommand } from "./commands/unlock";
import { lockInCommand } from "./commands/lockin";
import playCommand from "./commands/play";
import pauseCommand from "./commands/pause";
import resumeCommand from "./commands/resume";
import queueCommand from "./commands/queue";
import stopCommand from "./commands/stop";
import mutedCommand from "./commands/muted";
import skipCommand from "./commands/skip";
import loopCommand from "./commands/loop";
import djmodeCommand from "./commands/djmode";
import removeCommand from "./commands/remove";
import { isInChannel } from "./utils/isInChannel";
import mutedDuration from "./constants/mutedDuration";

dotenv.config();

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const musicBotCommands = [
  djmodeCommand,
  pauseCommand,
  playCommand,
  // mutedCommand,
  loopCommand,
  removeCommand,
  queueCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
];

const commands = [
  // lockInCommand,
  // timeLeftCommand,
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

export const timeouts = new Map<string, { timer: Timer; timestamp: number }>();

client.on("voiceStateUpdate", async (oldState, newState) => {
  const member = newState.member as GuildMember;
  const userId = member.id;
  const isMuted = member.voice.mute;

  const hasBeenMuted = !oldState.serverMute && newState.serverMute;
  const hasBeenUnmuted = oldState.serverMute && !newState.serverMute;

  if (!member || !newState.guild) return;

  const isInLockedVC =
    newState.channelId && Config.lockedVCIds.includes(newState.channelId);
  const hasStartedStreaming = !oldState.streaming && newState.streaming;
  const hasStoppedStreaming = oldState.streaming && !newState.streaming;
  const hasLeftVC = oldState.channelId && !newState.channelId;
  const hasMuteRole = member.roles.cache.has(Config.muteRoleId);

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
    const waitDuration = 60 * mutedDuration * 1000;

    const timeout = timeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout.timer);
      timeouts.delete(userId);
    }

    const channel = member.voice.channel;
    let sentMessage: Message | null = null;
    if (channel) {
      sentMessage = await channel.send(
        `<@${
          member.id
        }> has been muted for ${mutedDuration} minutes.\nUnmuting <t:${Math.floor(
          (Date.now() + waitDuration) / 1000
        )}:R>`
      );
    }

    const createdTimeout = setTimeout(() => {
      if (!member.voice.channelId) return;
      member.voice?.setMute(false);
      timeouts.delete(userId);

      if (sentMessage) {
        sentMessage.edit(`${member.user.displayName} has been unmuted.`);
      }
    }, waitDuration);

    timeouts.set(userId, {
      timer: createdTimeout,
      timestamp: Date.now() + waitDuration,
    });
  } else if (hasBeenUnmuted) {
    const timeout = timeouts.get(userId);
    if (timeout) {
      clearTimeout(timeout.timer);
      timeouts.delete(userId);
    }
  }
});
