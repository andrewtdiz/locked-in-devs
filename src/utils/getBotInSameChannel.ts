import { ChannelType, CommandInteraction } from "discord.js";
import botclients, { type BotClient } from "../constants/botclients";

export function getBotInSameChannel(
  interaction: CommandInteraction
): BotClient | null {
  const guild = interaction.guild;
  if (!guild) return null;

  const userChannelId = interaction.channelId;
  const member = interaction.member;
  if (!userChannelId) return null;
  if (!member || !("voice" in member)) return null;

  const userVoiceState = member.voice;
  const userVoiceChannelId = userVoiceState.channelId;
  if (!userVoiceChannelId) return null;

  for (const botClient of botclients) {
    const { APP_ID: botAppId } = botClient;

    const botIsInClientVC = interaction.guild.channels.cache.some(
      (channel) =>
        channel.id === userVoiceChannelId &&
        channel.type === ChannelType.GuildVoice &&
        channel.members.has(botAppId)
    );

    if (botIsInClientVC) {
      return botClient;
    }
  }

  return null;
}
