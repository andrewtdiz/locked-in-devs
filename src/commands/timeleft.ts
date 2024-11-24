import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { timeouts } from "..";

export default {
  data: new SlashCommandBuilder()
    .setName("timeleft")
    .setDescription("If you're muted, get the remaining duration."),
  async execute(interaction: CommandInteraction) {
    const timeout = timeouts.get(interaction.user.id);

    if (!timeout) {
      return interaction.reply({
        content: "You are not muted.",
      });
    }

    await interaction.reply({
      content: `<t:${Math.floor(timeout.timestamp / 1000)}:R>`,
    });
  },
};
