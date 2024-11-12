import {
  SlashCommandBuilder,
  CommandInteraction,
  Role,
  type CacheType,
} from "discord.js";
import { getBot } from "../utils/getBot";
import { sendToBot } from "../utils/sendToBot";

const djmodeCommand = {
  data: new SlashCommandBuilder()
    .setName("djmode")
    .setDescription("Toggle DJ Mode on or off and set the DJ role")
    .addBooleanOption((option) =>
      option
        .setName("status")
        .setDescription("Turn DJ Mode on or off")
        .setRequired(true)
    )
    .addRoleOption((option) =>
      option.setName("role").setDescription("The DJ role").setRequired(true)
    ),

  async execute(interaction: CommandInteraction<CacheType>) {
    await interaction.deferReply();
    const bot = await getBot(interaction);
    if (!bot) {
      return interaction.reply({
        content: "No bots available",
        ephemeral: true,
      });
    }

    const result = await sendToBot(interaction, bot, "djmode");

    if (!result) {
      return interaction.reply({
        content: "Failed to send to bot",
        ephemeral: true,
      });
    }

    await interaction.editReply(result);
  },
};

export default djmodeCommand;
