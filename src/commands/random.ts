import { SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import { setLockInModeStartedTimestamp } from "..";

export const randomCommand = {
  data: new SlashCommandBuilder()
    .setName("random")
    .setDescription("Mute a random user"),
  async execute(interaction: CommandInteraction) {
    if (
      !interaction.memberPermissions?.has([
        PermissionsBitField.Flags.Administrator,
      ])
    ) {
      return interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
    }

    const memberId = interaction.member?.user.id;

    const guild = interaction.guild;
    if (!guild || !memberId) {
      return interaction.reply({
        content: "Invalid user or guild!",
        ephemeral: true,
      });
    }

    const guildMember = (await guild.members.fetch(memberId)) as GuildMember;
    const voiceChannelId = guildMember.voice.channelId;

    const voiceChannel = interaction.channel?.isVoiceBased()
      ? interaction.channel
      : null;

    if (voiceChannelId !== voiceChannel?.id) {
      return interaction.reply({
        content: "You are not in the voice channel!",
        ephemeral: true,
      });
    }

    setLockInModeStartedTimestamp(Date.now() + 1000 * 60 * 5);

    if (voiceChannel) {
      const voiceMembers = voiceChannel.members;

      const memberArray = Array.from(voiceMembers.values()).filter(
        (m) => !m.user.bot
      );
      if (memberArray.length === 0) {
        return interaction.reply({
          content: "No valid members found in voice channel.",
          ephemeral: true,
        });
      }
      const randomIndex = Math.floor(Math.random() * memberArray.length);
      const randomMember = memberArray[randomIndex];
      await randomMember.voice.setMute(true);

      return
    }

    return interaction.reply({
      content: "No valid members found in voice channel.",
      ephemeral: true,
    });
  },
};
