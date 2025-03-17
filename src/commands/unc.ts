import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { timeouts } from "..";

const ANDREW_BIRTHDAY_TIMESTAMP = new Date("2025-06-16T00:00:00-06:00");

function timestampDiff(timestamp1: number, timestamp2: number): string {
  const diff = Math.abs(timestamp1 - timestamp2);

  // Calculate total days first
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  // Convert to months, weeks, and remaining days
  const months = Math.floor(totalDays / 30);
  const remainingDaysAfterMonths = totalDays % 30;
  const weeks = Math.floor(remainingDaysAfterMonths / 7);
  const days = remainingDaysAfterMonths % 7;

  // Build the string based on what values we have
  let result = '';
  if (months > 0) {
    result += `${months} month${months !== 1 ? 's' : ''}`;
  }
  if (weeks > 0) {
    result += result ? ', ' : '';
    result += `${weeks} week${weeks !== 1 ? 's' : ''}`;
  }
  if (days > 0 || (months === 0 && weeks === 0)) {
    result += result ? ', and ' : '';
    result += `${days} day${days !== 1 ? 's' : ''}`;
  }

  return result;
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
