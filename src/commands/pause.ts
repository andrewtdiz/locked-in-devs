import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

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

    const result = await sendToBot(interaction, bot, "pause");

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
  },
};
