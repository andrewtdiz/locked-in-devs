import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

const stopCommand = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop the music and clear the queue"),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const guild = interaction.guild;

    const bot = await getBot(interaction);
    if (!bot || !guild) {
      return interaction.reply({
        content: "No bots available",
        ephemeral: true,
      });
    }

    const guildId = guild.id;

    const result = await sendToBot(interaction, bot, "stop", { guildId });

    if (!result) {
      return interaction.reply({
        content: "Failed to send to bot",
        ephemeral: true,
      });
    }

    await interaction.editReply(result);
  },
};

export default stopCommand;
