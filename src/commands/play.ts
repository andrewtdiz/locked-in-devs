import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

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
    if (!interaction.isCommand()) return;

    const query = interaction.options.get("query")?.value as string;
    await interaction.deferReply();
    const bot = getBot(interaction);
    if (!bot) {
      return interaction.reply({
        content: "No bots available",
        ephemeral: true,
      });
    }

    const member = interaction.member;
    const guild = interaction.guild;

    if (!member || !("voice" in member) || !member.voice.channel || !guild) {
      console.log("Invalid member.");
      return interaction.reply({
        content: "Failed to Play. You are not in voice channel!",
        ephemeral: true,
      });
    }

    const voiceChannelId = member.voice.channel.id;

    const result = await sendToBot(interaction, bot, "play", {
      query,
      voiceChannelId,
    });

    if (!result) {
      return interaction.reply({
        content: "Failed to send to bot",
        ephemeral: true,
      });
    }

    await interaction.editReply(result);
  },
};

export default playCommand;
