import {
  Client,
  GatewayIntentBits,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import dotenv from "dotenv";
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
import jumpCommand from "./commands/jump";
import ttsCommand from "./commands/tts";
import { randomCommand } from "./commands/random";
import vanishedCommand from "./commands/vanished";
import uncCommand from "./commands/unc";
import transcribeCommand from "./commands/transcribe";
import doneCommand from "./commands/done";
import { createInteractionHandler } from "./routes/interactionCreate";
import { readyHandler } from "./routes/ready";
import { handleVoiceStateUpdate } from "./routes/voiceStateUpdate";
import { baseSendToBot } from "./utils/baseSendToBot";
import { createCodingTaskEmbed } from "./embeds/CodingTaskEmbed";
import { muteDurationCache } from "./state/muteDurationCache";

dotenv.config();

// Response constants
const JSON_HEADERS = { 'Content-Type': 'application/json' };

const createErrorResponse = (error: string, status: number) =>
  new Response(JSON.stringify({ success: false, error }), {
    headers: JSON_HEADERS,
    status
  });

const createSuccessResponse = (message: string, status: number = 200) =>
  new Response(JSON.stringify({ success: true, message }), {
    headers: JSON_HEADERS,
    status
  });

const ERROR_RESPONSES = {
  GUILD_NOT_FOUND: createErrorResponse('Guild not found', 400),
  USER_NOT_FOUND: createErrorResponse('User not found in guild', 400),
  USER_NOT_IN_VOICE: createErrorResponse('User is not in a voice channel', 400),
  FAILED_TO_SEND: createErrorResponse('Failed to send to bot', 500),
  INVALID_JSON: createErrorResponse('Invalid JSON body', 400),
  NOT_FOUND: new Response('Not Found', { status: 404 })
};

const SUCCESS_RESPONSES = {
  COMMAND_RECEIVED: createSuccessResponse('Command received successfully')
};

export const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const musicBotCommands = [
  djmodeCommand,
  pauseCommand,
  muteAllCommand,
  jumpCommand,
  timeLeftCommand,
  playCommand,
  loopCommand,
  removeCommand,
  queueCommand,
  resumeCommand,
  skipCommand,
  stopCommand,
];

const commands = [
  ttsCommand,
  pingCommand,
  uncCommand,
  transcribeCommand,
  doneCommand,
  ...musicBotCommands,
];

client.on(
  "interactionCreate",
  createInteractionHandler(commands, musicBotCommands)
);

const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);
    console.log(url);

    if (url.pathname === '/' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { command, query, userIds, voiceChannelId, guildId, duration } = body;
        const guild = client.guilds.cache.get(guildId);
        if (!guild) {
          return ERROR_RESPONSES.GUILD_NOT_FOUND;
        }

        if (command === 'mute') {
          if (duration && userIds && Array.isArray(userIds)) {
            for (const userId of userIds) {
              muteDurationCache.set(userId, duration);
            }
          }
        }

        if (command === 'mute_all') {
          const channel = guild.channels.cache.get(voiceChannelId);
          if (channel && channel.isVoiceBased()) {
            const voiceMembers = channel.members;
            for (const [_, member] of voiceMembers) {
              if (member.user.bot) continue;
              await member.voice.setMute(true);
            }
          } else {
            return ERROR_RESPONSES.USER_NOT_IN_VOICE;
          }

          return SUCCESS_RESPONSES.COMMAND_RECEIVED;
        }

        if (command === 'mute' || command === 'unmute') {
          for (const userId of userIds) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
              continue;
            }

            const member = await guild.members.fetch(userId);
            if (!member) {
              continue;
            }

            if (!member.voice.channel) {
              continue;
            }

            await member.voice.setMute(command === 'mute');
          }
          return SUCCESS_RESPONSES.COMMAND_RECEIVED;
        }
        if (command === 'deafen' || command === 'undeafen') {
          for (const userId of userIds) {
            const guild = client.guilds.cache.get(guildId);
            if (!guild) {
              continue;
            }

            const member = await guild.members.fetch(userId);
            if (!member) {
              continue;
            }

            if (!member.voice.channel) {
              continue;
            }

            await member.voice.setDeaf(command === 'deafen');
          }
          return SUCCESS_RESPONSES.COMMAND_RECEIVED;
        }

        const result = await baseSendToBot({
          command,
          query,
          voiceChannelId,
          guildId,
        });

        if (!result) {
          return ERROR_RESPONSES.FAILED_TO_SEND;
        }

        if (guild) {
          const channel = guild.channels.cache.get(voiceChannelId);
          if (channel && channel.isVoiceBased()) {
            channel.send(result);
          }
        }

        return SUCCESS_RESPONSES.COMMAND_RECEIVED;

      } catch (error) {
        console.error('Error parsing JSON body:', error);
        return ERROR_RESPONSES.INVALID_JSON;
      }
    }

    return ERROR_RESPONSES.NOT_FOUND;
  },
});

console.log(`Server running on http://localhost:${server.port}`);

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

client.once("ready", readyHandler);

client.on("voiceStateUpdate", handleVoiceStateUpdate);
