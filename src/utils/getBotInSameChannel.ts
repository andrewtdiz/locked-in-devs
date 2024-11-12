import { getVoiceConnection } from "@discordjs/voice";
import { CommandInteraction } from "discord.js";
import botclients, { type MusicBots } from "../constants/botclients";

export function getBotInSameChannel(
  interaction: CommandInteraction
): MusicBots | null {
  const guild = interaction.guild;
  if (!guild) return null;

  const connection = getVoiceConnection(guild.id);
  if (!connection) return null;

  const userChannelId = interaction.channelId;
  const member = interaction.member;
  if (!userChannelId) return null;
  if (!member || !("voice" in member)) return null;

  const userVoiceState = member.voice;
  const userVoiceChannelId = userVoiceState.channelId;
  if (!userVoiceChannelId) return null;

  for (const botClientId of botclients) {
    const bot = guild.members.cache.get(botClientId);
    if (!bot) continue;

    const botVoiceState = bot.voice;
    const channelId = botVoiceState.channelId;
    if (!channelId) continue;

    if (channelId === userVoiceChannelId) {
      return botClientId;
    }
  }

  return null;
}
