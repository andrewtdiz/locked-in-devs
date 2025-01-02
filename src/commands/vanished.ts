import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { timeouts } from "..";

const VANISHED_TIMESTAMP = new Date("2024-11-19T10:34:00");
const unixTimestamp = Math.floor(VANISHED_TIMESTAMP.getTime() / 1000);

const LEFT_VERSIONS = ["dip doozied", "left", "vanished"];
const EMOJIS = [":cry:", ":sob:", ":smiling_face_with_tear:"];

export default {
  data: new SlashCommandBuilder()
    .setName("vanished")
    .setDescription("How long since Vanished left the server?"),
  async execute(interaction: CommandInteraction) {
    await interaction.reply({
      content: `Vanished ${
        LEFT_VERSIONS[Math.floor(Math.random() * LEFT_VERSIONS.length)]
      } <t:${Math.floor(unixTimestamp)}:R>\n\nBring him back ${
        EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      }`,
    });
  },
};
