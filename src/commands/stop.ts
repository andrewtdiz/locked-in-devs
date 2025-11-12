import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";
import { musicPlayerManager } from "../music/MusicPlayerManager";

const stopCommand = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const guild = interaction.guild;
    const bot = await getBot(interaction);
    if (!bot || !guild) {
      return interaction.editReply({
        content: "No bots available",
      });
    }

    const member = interaction.member;
    const voiceChannelId =
      member && "voice" in member && member.voice.channel
        ? member.voice.channel.id
        : undefined;

    const guildId = guild.id;
    const payload: Record<string, string> = { guildId };
    if (voiceChannelId) {
      payload.voiceChannelId = voiceChannelId;
    }

    const result = await sendToBot(interaction, bot, "stop", payload);

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
    if (voiceChannelId) {
      await musicPlayerManager.markStopped(guildId, voiceChannelId);
    } else {
      await musicPlayerManager.markStoppedByGuild(guildId);
    }
  },
};

export default stopCommand;
