import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";
import { musicPlayerManager } from "../music/MusicPlayerManager";

const skipCommand = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip the currently playing song"),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const bot = await getBot(interaction);
    if (!bot) {
      return interaction.editReply({
        content: "No bots available",
      });
    }

    const member = interaction.member;
    const guild = interaction.guild;

    if (!member || !("voice" in member) || !member.voice.channel || !guild) {
      return interaction.editReply({
        content: "Failed to skip. You are not in a voice channel!",
      });
    }

    const voiceChannelId = member.voice.channel.id;
    const guildId = guild.id;

    const result = await sendToBot(interaction, bot, "skip", {
      voiceChannelId,
      guildId,
    });

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
    await musicPlayerManager.markSkipped(guildId, voiceChannelId);
  },
};

export default skipCommand;
