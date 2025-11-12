import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";
import { musicPlayerManager } from "../music/MusicPlayerManager";

export default {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume the paused song"),

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
      console.log("Invalid member.");
      return interaction.editReply({
        content: "Failed to Play. You are not in voice channel!",
      });
    }

    const voiceChannelId = member.voice.channel.id;
    const guildId = guild.id;

    const result = await sendToBot(interaction, bot, "resume", {
      voiceChannelId,
      guildId,
    });

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
    await musicPlayerManager.markResumed(guildId, voiceChannelId);
  },
};
