import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getAvailableBot } from "../utils/getAvailableBot";

export const pingCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Replies with Pong! (v1.02)"),
  async execute(interaction: CommandInteraction) {
    const sent = await interaction.reply({
      content: "Pinging...",
      fetchReply: true,
    });

    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    const apiLatency = Math.round(interaction.client.ws.ping);

    const availableBot = await getAvailableBot(interaction);

    await interaction.editReply({
      content: `Latency: **${latency}ms**\nAPI Latency: **${apiLatency}ms**\nAvailable Bot: **${
        availableBot || "None"
      }**\n*v1.07*`,
    });
  },
};
