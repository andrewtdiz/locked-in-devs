import { randomUUID } from "crypto";
import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendBotCommand } from "../utils/sendToBot";
import { musicPlayerManager } from "../music/MusicPlayerManager";
import type { TrackMetadata } from "../music/types";

const DEFAULT_DURATION_MS = 3 * 60 * 1000;

const playCommand = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Search for a song on YouTube and play it")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("The search query to find the song")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    if (!interaction.isCommand()) return;

    const query = interaction.options.get("query")?.value as string;

    const bot = await getBot(interaction);
    if (!bot) {
      return interaction.editReply({
        content: "No bots available",
      });
    }

    const member = interaction.member;
    const guild = interaction.guild;

    if (!member || !("voice" in member) || !member.voice.channel || !guild) {
      console.log("Invalid member.");
      return interaction.editReply({
        content: "Failed to Play. You are not in voice channel!",
      });
    }

    const voiceChannelId = member.voice.channel.id;
    const guildId = guild.id;

    const response = await sendBotCommand(bot, "play", {
      userId: member.id,
      query,
      voiceChannelId,
      guildId,
    });

    if (!response) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    const content = response.result ?? "Added to the queue.";
    await interaction.editReply({ content });

    const metadata = buildTrackMetadata({
      query,
      responseTitle: response.track?.title,
      responseArtist: response.track?.artist,
      durationMs: response.track?.durationMs,
      requesterId: member.id,
      requesterDisplay: member.displayName ?? member.user.username,
      voiceChannelId,
      voiceChannelName: member.voice.channel?.name ?? "Voice Channel",
      textChannelId: interaction.channelId,
      guildId,
    });

    const enqueueResult = await musicPlayerManager.enqueueTrack(
      interaction,
      bot,
      metadata
    );

    if (enqueueResult.queued && enqueueResult.position) {
      await interaction.editReply({
        content: `${content}\nPosition in queue: ${enqueueResult.position}`,
      });
    }
  },
};

export default playCommand;

interface TrackMetadataArgs {
  query: string;
  responseTitle?: string;
  responseArtist?: string;
  durationMs?: number;
  requesterId: string;
  requesterDisplay: string;
  voiceChannelId: string;
  voiceChannelName: string;
  textChannelId: string;
  guildId: string;
}

function buildTrackMetadata(args: TrackMetadataArgs): TrackMetadata {
  const { query, responseTitle, responseArtist } = args;
  const parsed = parseSongInfo(responseTitle ?? query);

  const title = responseTitle ?? parsed.title;
  const artist = responseArtist ?? parsed.artist;

  return {
    id: randomUUID(),
    title,
    artist,
    durationMs: args.durationMs ?? DEFAULT_DURATION_MS,
    requestedById: args.requesterId,
    requestedByDisplayName: args.requesterDisplay,
    voiceChannelId: args.voiceChannelId,
    voiceChannelName: args.voiceChannelName,
    textChannelId: args.textChannelId,
    guildId: args.guildId,
  };
}

function parseSongInfo(input: string) {
  const separators = [" - ", " – ", " — ", " — "];
  for (const separator of separators) {
    if (input.includes(separator)) {
      const [title, ...rest] = input.split(separator);
      const artist = rest.join(separator).trim();
      return {
        title: title.trim() || input.trim(),
        artist: artist || "Unknown Artist",
      };
    }
  }

  return {
    title: input.trim(),
    artist: "Unknown Artist",
  };
}
