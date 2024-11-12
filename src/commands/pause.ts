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
      return interaction.reply({
        content: "No bots available",
        ephemeral: true,
      });
    }

    const result = await sendToBot(interaction, bot, "pause");

    if (!result) {
      return interaction.reply({
        content: "Failed to send to bot",
        ephemeral: true,
      });
    }

    await interaction.editReply(result);
  },
};
