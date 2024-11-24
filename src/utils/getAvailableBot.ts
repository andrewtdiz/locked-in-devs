import { ChannelType, Client, CommandInteraction } from "discord.js";
import botclients, { type MusicBots } from "../constants/botclients";
import { client } from "..";

export async function getAvailableBot(
  interaction: CommandInteraction
): Promise<MusicBots | null> {
  const guild = interaction.guild;
  if (!guild) return null;

  for (const botClientId of botclients) {
    const botMember = interaction.guild.members.cache.get(botClientId);
    const botIsInSomeVC = botMember?.voice.channel !== null;
    
    if (!botIsInSomeVC) {
      return botClientId;
    }
  }

  return null;
}
