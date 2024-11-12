import {
  SlashCommandBuilder,
  CommandInteraction,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

const queueCommand = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Shows the current song and the queue of upcoming songs"),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const bot = await getBot(interaction);
    if (!bot) {
      return interaction.reply({
        content: "No bots available",
        ephemeral: true,
      });
    }

    const result = await sendToBot(interaction, bot, "queue");

    if (!result) {
      return interaction.reply({
        content: "Failed to send to bot",
        ephemeral: true,
      });
    }

    await interaction.editReply(result);
  },
};

export default queueCommand;
