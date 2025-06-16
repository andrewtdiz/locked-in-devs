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
import { lockInCommand } from "./commands/lockin";
import { unlockCommand } from "./commands/unlock";
import ttsCommand from "./commands/tts";
import { randomCommand } from "./commands/random";
import vanishedCommand from "./commands/vanished";
import uncCommand from "./commands/unc";
import { createInteractionHandler } from "./routes/interactionCreate";
import { readyHandler } from "./routes/ready";
import { handleVoiceStateUpdate } from "./routes/voiceStateUpdate";

dotenv.config();

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
  ...musicBotCommands,
];

client.on(
  "interactionCreate",
  createInteractionHandler(commands, musicBotCommands)
);

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
