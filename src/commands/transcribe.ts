import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { startTranscriptionSession } from "../utils/modalApi";

const AUTHORIZED_USER_ID = "408700878741176323";

const transcribeCommand = {
  data: new SlashCommandBuilder()
    .setName("transcribe")
    .setDescription("Start voice transcription for your current voice channel"),

  async execute(interaction: CommandInteraction) {
    if (interaction.user.id !== AUTHORIZED_USER_ID) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const member = interaction.member;

    if (!guild || !member || !("voice" in member) || !member.voice.channel) {
      console.error("[/transcribe] Missing guild or voice channel context");
      await interaction.deleteReply().catch(() => undefined);
      return;
    }

    try {
      await startTranscriptionSession({
        guild_id: guild.id,
        voice_channel_id: member.voice.channel.id,
      });

      await interaction.editReply("Transcription started.");
    } catch (error) {
      console.error("[/transcribe] Failed to start transcription:", error);
      await interaction.deleteReply().catch(() => undefined);
    }
  },
};

export default transcribeCommand;
