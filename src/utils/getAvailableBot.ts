import { ChannelType, Client, CommandInteraction } from "discord.js";
import botclients, { type MusicBots } from "../constants/botclients";
import { client } from "..";

export async function getAvailableBot(
  interaction: CommandInteraction
): Promise<MusicBots | null> {
  const guild = interaction.guild;
  if (!guild) return null;

  for (const botClientId of botclients) {
    const botIsInSomeVC = interaction.guild.channels.cache.some(
      (channel) =>
        channel.type === ChannelType.GuildVoice &&
        channel.members.has(botClientId)
    );
    
    if (!botIsInSomeVC) {
      return botClientId;
    }
  }

  return null;
}
