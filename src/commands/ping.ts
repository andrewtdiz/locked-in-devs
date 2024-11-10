import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong! (v1.02)"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply("Pong!");
  },
};
