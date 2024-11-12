import type { CommandInteraction } from "discord.js";

export function isInChannel(interaction: CommandInteraction): boolean {
  const member = interaction.member;
  const guild = interaction.guild;

  if (!member || !("voice" in member) || !member.voice.channel || !guild) {
    console.log("Invalid member.");
    return false;
  }
  return true;
}
