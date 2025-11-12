import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";
import { musicPlayerManager } from "../music/MusicPlayerManager";

export default {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause the current song"),

  async execute(interaction: CommandInteraction) {
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
        content: "Failed to pause. You are not in a voice channel!",
      });
    }

    const voiceChannelId = member.voice.channel.id;
    const guildId = guild.id;

    const result = await sendToBot(interaction, bot, "pause", {
      voiceChannelId,
      guildId,
    });

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
    await musicPlayerManager.markPaused(guildId, voiceChannelId);
  },
};
