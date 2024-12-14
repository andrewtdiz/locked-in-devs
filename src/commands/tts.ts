import {
  CommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import ttsToggleRole from "../constants/ttsToggleRole";
import ttsRole from "../constants/ttsRole";

export default {
  data: new SlashCommandBuilder()
    .setName("tts")
    .setDescription("Toggles TTS for the current user"),

  async execute(interaction: CommandInteraction) {
    await interaction.deferReply();

    const member = interaction.member as GuildMember;
    const userHasToggleRole = member.roles.cache.has(ttsToggleRole);

    if (userHasToggleRole) {
      const hasTTSRole = member.roles.cache.has(ttsRole);
      if (hasTTSRole) {
        member.roles.remove(ttsRole);
        await interaction.editReply("Successfully toggled TTS to `false`");
      } else {
        member.roles.add(ttsRole);
        await interaction.editReply("Successfully toggled TTS to `true`");
      }
      return;
    }

    await interaction.editReply("Cannot toggle TTS, lacking Trusted TTS role");
  },
};
