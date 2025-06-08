import { EmbedBuilder, SlashCommandBuilder } from "@discordjs/builders";
import {
  CommandInteraction,
  GuildMember,
  PermissionsBitField,
} from "discord.js";
import { setLockInModeStartedTimestamp } from "../state/muteState";

export default {
  data: new SlashCommandBuilder()
    .setName("muteall")
    .setDescription("Mute all users in the voice channel"),

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
      for (const [_, member] of voiceMembers) {
        if (member.user.bot) continue;
        await member.voice.setMute(true);
      }
    }

    return interaction.reply({
      content: `Muted all users in the voice channel.`,
      ephemeral: true,
    });
  },
};
