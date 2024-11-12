import { getVoiceConnection } from "@discordjs/voice";
import { ChannelType, CommandInteraction } from "discord.js";
import botclients, { type MusicBots } from "../constants/botclients";

export function getBotInSameChannel(
  interaction: CommandInteraction
): MusicBots | null {
  const guild = interaction.guild;
  if (!guild) return null;

  const userChannelId = interaction.channelId;
  const member = interaction.member;
  if (!userChannelId) return null;
  if (!member || !("voice" in member)) return null;

  const userVoiceState = member.voice;
  const userVoiceChannelId = userVoiceState.channelId;
  if (!userVoiceChannelId) return null;

  for (const botClientId of botclients) {
    const botIsInClientVC = interaction.guild.channels.cache.some(
      (channel) =>
        channel.id === userVoiceChannelId &&
        channel.type === ChannelType.GuildVoice &&
        channel.members.has(botClientId) &&
        channel.members.has(botClientId)
    );

    if (botIsInClientVC) {
      return botClientId;
    }
  }

  return null;
}
