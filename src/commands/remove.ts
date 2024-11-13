import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

const removeCommand = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Remove a song from the list")
    .addStringOption((option) =>
      option
        .setName("index")
        .setDescription("The index to remove from the queue (index at 0)")
        .setRequired(true)
    ),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const bot = await getBot(interaction);
    if (!bot) {
      return interaction.editReply({
        content: "No bots available",
      });
    }

    const index = interaction.options.get("index")?.value as string;

    if (!index) {
      return interaction.editReply({
        content: "Invalid index provided",
      });
    }

    const result = await sendToBot(interaction, bot, "remove", { index });

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
  },
};

export default removeCommand;
