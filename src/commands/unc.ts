import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { timeouts } from "..";

const ANDREW_BIRTHDAY_TIMESTAMP = new Date("2025-06-16T00:00:00-06:00");

function timestampDiff(timestamp1: number, timestamp2: number): string {
  const diff = Math.abs(timestamp1 - timestamp2);

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} days, ${hours} hours, and ${minutes} minutes`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("unc")
    .setDescription("How long until Andrew D's 30th birthday?"),
  async execute(interaction: CommandInteraction) {
    const timestamp1 = Date.now();
    const timestamp2 = ANDREW_BIRTHDAY_TIMESTAMP.getTime();

    await interaction.reply({
      content: `Andrew D's 30th birthday 👴 \n\nIs in ${timestampDiff(
        timestamp1,
        timestamp2
      )}! 🎂🎉`,
    });
  },
};
