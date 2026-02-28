import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { stopTranscriptionSession } from "../utils/modalApi";

const AUTHORIZED_USER_ID = "408700878741176323";

const doneCommand = {
  data: new SlashCommandBuilder()
    .setName("done")
    .setDescription("Stop the active transcription session"),

  async execute(interaction: CommandInteraction) {
    if (interaction.user.id !== AUTHORIZED_USER_ID) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    try {
      await stopTranscriptionSession({ reason: "done_command" });
      await interaction.editReply("Transcription stopped.");
    } catch (error) {
      console.error("[/done] Failed to stop transcription:", error);
      await interaction.deleteReply().catch(() => undefined);
    }
  },
};

export default doneCommand;
