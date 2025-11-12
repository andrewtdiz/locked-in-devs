import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  PermissionFlagsBits,
  TextBasedChannel,
} from "discord.js";
import type { BotClient } from "../constants/botclients";
import { Config } from "../config";
import type { PlayerState, RuntimeTrack, TrackMetadata } from "./types";
import { sendBotCommand } from "../utils/sendToBot";

const UPDATE_INTERVAL_MS = 5000;
const PROGRESS_BAR_SEGMENTS = 16;

const MUSIC_BUTTON_PREFIX = "music-player";

export enum MusicButtonAction {
  Replay = "replay",
  Toggle = "toggle",
  Skip = "skip",
  Stop = "stop",
}

interface ButtonMeta {
  action: MusicButtonAction;
  playerId: string;
}

interface EnqueueResult {
  queued: boolean;
  position?: number;
}

function playerKey(guildId: string, voiceChannelId: string) {
  return `${guildId}:${voiceChannelId}`;
}

export class MusicPlayerManager {
  private players = new Map<string, PlayerState>();

  public async enqueueTrack(
    interaction: CommandInteraction,
    botId: BotClient,
    metadata: TrackMetadata
  ): Promise<EnqueueResult> {
    const channel = interaction.channel;
    if (!channel || !channel.isTextBased()) {
      return { queued: false };
    }
    const textChannel = channel as TextBasedChannel;

    const key = playerKey(metadata.guildId, metadata.voiceChannelId);
    let player = this.players.get(key);
    if (!player) {
      player = {
        id: key,
        guildId: metadata.guildId,
        voiceChannelId: metadata.voiceChannelId,
        textChannelId: metadata.textChannelId,
        botId,
        queue: [],
      };
      this.players.set(key, player);
    } else {
      player.botId = botId;
      player.textChannelId = metadata.textChannelId;
    }

    if (player.current) {
      player.queue.push(metadata);
      return { queued: true, position: player.queue.length };
    }

    player.current = this.createRuntimeTrack(metadata);
    await this.updateOrCreateMessage(textChannel, player);
    this.startTicker(player.id);

    return { queued: false };
  }

  public async handleButton(interaction: ButtonInteraction) {
    const meta = this.parseCustomId(interaction.customId);
    if (!meta) return;

    const player = this.players.get(meta.playerId);
    if (!player) {
      return interaction.reply({
        content: "Nothing is playing right now.",
        ephemeral: true,
      });
    }

    const member = interaction.member;
    if (!member || !("permissions" in member)) {
      return interaction.reply({
        content: "Unable to validate your permissions.",
        ephemeral: true,
      });
    }

    const guildMember = member as GuildMember;

    if (!this.canControlPlayer(guildMember, player.current)) {
      return interaction.reply({
        content:
          "Only the requester or a member with DJ permissions can use these controls.",
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    switch (meta.action) {
      case MusicButtonAction.Replay:
        await this.replay(player);
        await this.dispatchBotCommand(player, "replay");
        break;
      case MusicButtonAction.Toggle:
        if (player.current?.paused) {
          await this.resume(player);
          await this.dispatchBotCommand(player, "resume");
        } else {
          await this.pause(player);
          await this.dispatchBotCommand(player, "pause");
        }
        break;
      case MusicButtonAction.Skip:
        {
          const botId = player.botId;
          await this.skip(player);
          await this.dispatchBotCommand(player, "skip", botId);
        }
        break;
      case MusicButtonAction.Stop:
        {
          const botId = player.botId;
          await this.stop(player);
          await this.dispatchBotCommand(player, "stop", botId);
        }
        break;
    }
  }

  public async markPaused(guildId: string, voiceChannelId: string) {
    const player = this.players.get(playerKey(guildId, voiceChannelId));
    if (!player) return;
    await this.pause(player);
  }

  public async markResumed(guildId: string, voiceChannelId: string) {
    const player = this.players.get(playerKey(guildId, voiceChannelId));
    if (!player) return;
    await this.resume(player);
  }

  public async markSkipped(guildId: string, voiceChannelId: string) {
    const player = this.players.get(playerKey(guildId, voiceChannelId));
    if (!player) return;
    await this.skip(player);
  }

  public async markStopped(guildId: string, voiceChannelId: string) {
    const player = this.players.get(playerKey(guildId, voiceChannelId));
    if (!player) return;
    await this.stop(player);
  }

  public async markStoppedByGuild(guildId: string) {
    const targets = Array.from(this.players.values()).filter(
      (player) => player.guildId === guildId
    );

    if (targets.length === 0) {
      return;
    }

    for (const target of targets) {
      await this.stop(target);
    }
  }

  private async pause(player: PlayerState) {
    if (!player.current || player.current.paused) return;
    player.current.accumulatedMs = this.getProgress(player.current);
    player.current.paused = true;
    await this.render(player);
  }

  private async resume(player: PlayerState) {
    if (!player.current || !player.current.paused) return;
    player.current.paused = false;
    player.current.startedAt = Date.now();
    await this.render(player);
    this.startTicker(player.id);
  }

  private async skip(player: PlayerState) {
    if (player.queue.length === 0) {
      await this.stop(player);
      return;
    }

    const nextTrack = player.queue.shift()!;
    player.current = this.createRuntimeTrack(nextTrack);
    await this.render(player);
    this.startTicker(player.id);
  }

  private async stop(player: PlayerState) {
    player.current = undefined;
    player.queue = [];
    player.botId = undefined;
    this.clearTicker(player);
    if (player.message) {
      await player.message.edit({
        embeds: [this.createFinishedEmbed()],
        components: [],
      });
    }
  }

  private async replay(player: PlayerState) {
    if (!player.current) return;
    player.current.accumulatedMs = 0;
    player.current.startedAt = Date.now();
    player.current.paused = false;
    await this.render(player);
    this.startTicker(player.id);
  }

  private createRuntimeTrack(metadata: TrackMetadata): RuntimeTrack {
    return {
      ...metadata,
      startedAt: Date.now(),
      accumulatedMs: 0,
      paused: false,
    };
  }

  private async updateOrCreateMessage(
    channel: TextBasedChannel,
    player: PlayerState
  ) {
    const payload = {
      embeds: [this.createNowPlayingEmbed(player)],
      components: [this.createControls(player)],
    };

    if (!player.message) {
      player.message = await channel.send(payload);
      return;
    }

    await player.message.edit(payload);
  }

  private async render(player: PlayerState) {
    if (!player.message) {
      return;
    }

    await player.message.edit({
      embeds: [this.createNowPlayingEmbed(player)],
      components: player.current ? [this.createControls(player)] : [],
    });
  }

  private createNowPlayingEmbed(player: PlayerState) {
    if (!player.current) {
      return this.createFinishedEmbed();
    }

    const progress = this.getProgress(player.current);
    const total = player.current.durationMs;
    const progressBar = this.buildProgressBar(progress, total);
    const requester = `<@${player.current.requestedById}>`;
    const description = [
      `**${player.current.title} - ${player.current.artist}**`,
      "",
      `${requester} • ${player.current.voiceChannelName}`,
      "",
      progressBar,
      `${this.formatDuration(progress)} / ${this.formatDuration(total)}`,
    ].join("\n");

    return new EmbedBuilder()
      .setTitle("Now playing")
      .setDescription(description);
  }

  private createFinishedEmbed() {
    return new EmbedBuilder()
      .setTitle("Queue finished")
      .setDescription("No more songs in the queue.");
  }

  private createControls(player: PlayerState) {
    const isPlaying = Boolean(player.current) && !player.current?.paused;
    const disabled = !player.current;

    return new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(this.createCustomId(MusicButtonAction.Replay, player.id))
        .setEmoji("⏪")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(this.createCustomId(MusicButtonAction.Toggle, player.id))
        .setEmoji(isPlaying ? "⏸️" : "▶️")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(this.createCustomId(MusicButtonAction.Skip, player.id))
        .setEmoji("⏩")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(disabled),
      new ButtonBuilder()
        .setCustomId(this.createCustomId(MusicButtonAction.Stop, player.id))
        .setEmoji("⏹️")
        .setStyle(ButtonStyle.Danger)
        .setDisabled(disabled)
    );
  }

  private createCustomId(action: MusicButtonAction, playerId: string) {
    return `${MUSIC_BUTTON_PREFIX}:${action}:${playerId}`;
  }

  private parseCustomId(customId: string): ButtonMeta | null {
    if (!customId.startsWith(MUSIC_BUTTON_PREFIX)) return null;
    const [, action, playerId] = customId.split(":");
    if (
      !action ||
      !playerId ||
      !Object.values(MusicButtonAction).includes(action as MusicButtonAction)
    ) {
      return null;
    }

    return {
      action: action as MusicButtonAction,
      playerId,
    };
  }

  private canControlPlayer(
    member: GuildMember,
    track?: RuntimeTrack
  ): boolean {
    if (!track) return false;
    if (track.requestedById === member.id) return true;

    const djRoleId = Config.djRoleId;
    if (djRoleId && member.roles.cache.has(djRoleId)) {
      return true;
    }

    return member.permissions.has(PermissionFlagsBits.ManageGuild);
  }

  private getProgress(track: RuntimeTrack) {
    if (track.paused) {
      return Math.min(track.accumulatedMs, track.durationMs);
    }
    const elapsed = Date.now() - track.startedAt;
    const total = track.accumulatedMs + elapsed;
    return Math.min(total, track.durationMs);
  }

  private buildProgressBar(progress: number, total: number) {
    if (total <= 0) return "▬".repeat(PROGRESS_BAR_SEGMENTS);
    const ratio = progress / total;
    const indicatorIndex = Math.min(
      PROGRESS_BAR_SEGMENTS - 1,
      Math.floor(ratio * PROGRESS_BAR_SEGMENTS)
    );
    let result = "";

    for (let i = 0; i < PROGRESS_BAR_SEGMENTS; i += 1) {
      result += i === indicatorIndex ? "🔘" : "▬";
    }

    return result;
  }

  private formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  private startTicker(playerId: string) {
    const player = this.players.get(playerId);
    if (!player?.current) return;

    this.clearTicker(player);

    player.updateInterval = setInterval(() => {
      this.handleTick(playerId);
    }, UPDATE_INTERVAL_MS);
  }

  private clearTicker(player: PlayerState) {
    if (player.updateInterval) {
      clearInterval(player.updateInterval);
      player.updateInterval = undefined;
    }
  }

  private async handleTick(playerId: string) {
    const player = this.players.get(playerId);
    if (!player?.current) return;

    if (player.current.paused) {
      return;
    }

    const progress = this.getProgress(player.current);
    if (progress >= player.current.durationMs) {
      if (player.queue.length === 0) {
        await this.stop(player);
        return;
      }

      const nextTrack = player.queue.shift()!;
      player.current = this.createRuntimeTrack(nextTrack);
    }

    await this.render(player);
  }

  private async dispatchBotCommand(
    player: PlayerState,
    command: string,
    overrideBotId?: BotClient
  ) {
    const botId = overrideBotId ?? player.botId;
    if (!botId) return;
    try {
      await sendBotCommand(botId, command, {
        guildId: player.guildId,
        voiceChannelId: player.voiceChannelId,
      });
    } catch (error) {
      console.error("Failed to dispatch music command:", error);
    }
  }
}

export const musicPlayerManager = new MusicPlayerManager();
