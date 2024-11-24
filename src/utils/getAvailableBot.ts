import { ChannelType, Client, CommandInteraction } from "discord.js";
import botclients, { type BotClient } from "../constants/botclients";
import { client } from "..";

export async function getAvailableBot(
  interaction: CommandInteraction
): Promise<BotClient | null> {
  const guild = interaction.guild;
  if (!guild) return null;

  console.log("getAvailableBot...");

  for (const botIds of botclients) {
    const { APP_ID: botAppId } = botIds;
    const botIsInSomeVC = interaction.guild.channels.cache.some(
      (channel) =>
        channel.type === ChannelType.GuildVoice && channel.members.has(botAppId)
    );

    if (!botIsInSomeVC) {
      return botIds;
    }
  }

  return null;
}
