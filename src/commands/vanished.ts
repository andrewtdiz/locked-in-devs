import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { timeouts } from "..";

const VANISHED_TIMESTAMP = new Date("2024-11-19T10:34:00");
const unixTimestamp = Math.floor(VANISHED_TIMESTAMP.getTime() / 1000);

const LEFT_VERSIONS = ["dip doozied", "left", "vanished"];
const EMOJIS = [":cry:", ":sob:", ":smiling_face_with_tear:"];

function timestampDiff(timestamp1: number, timestamp2: number): string {
  const diff = Math.abs(timestamp1 - timestamp2); // Difference in milliseconds

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  return `${days} days, ${hours} hours, and ${minutes} minutes`;
}

export default {
  data: new SlashCommandBuilder()
    .setName("vanished")
    .setDescription("How long since Vanished left the server?"),
  async execute(interaction: CommandInteraction) {
    const timestamp1 = Date.now();
    const timestamp2 = new Date("2024-11-19T10:34:00").getTime();

    await interaction.reply({
      content: `Vanished ${
        LEFT_VERSIONS[Math.floor(Math.random() * LEFT_VERSIONS.length)]
      } ${timestampDiff(timestamp1, timestamp2)} ago.\n\nBring him back ${
        EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      }`,
    });
  },
};
