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
    .setDescription("Search for a song on YouTube and play it"),

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

    const result = await sendToBot(interaction, bot, "play", { query });

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
