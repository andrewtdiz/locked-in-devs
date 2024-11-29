import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

const jumpCommand = {
  data: new SlashCommandBuilder()
    .setName("jump")
    .setDescription("Jump a song to the front of the queue")
    .addStringOption((option) =>
      option
        .setName("index")
        .setDescription("The index to jump to the front of the queue")
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

    const result = await sendToBot(interaction, bot, "jump", { index });

    if (!result) {
      return interaction.editReply({
        content: "Failed to send to bot",
      });
    }

    await interaction.editReply(result);
  },
};

export default jumpCommand;
