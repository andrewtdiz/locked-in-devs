import { EmbedBuilder } from "discord.js";

export interface CodingTaskData {
    selectedText: string;
    startLine: number;
    endLine: number;
    filePath: string;
    relativePath: string;
    gitRepoRoot: string;
    gitBranch: string;
    gitCommit: string;
}

export function createCodingTaskEmbed(task: CodingTaskData): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "New Coding Task Created!",
        })
        .setTitle(`Coding Task: ${task.relativePath}`)
        .setDescription(
            `**Selected Code:**\n\n\`\`\`tsx\n${task.selectedText}\n\`\`\``
        )
        .addFields(
            {
                name: "File",
                value: task.relativePath,
                inline: false,
            },
            {
                name: "Lines",
                value: `${task.startLine} - ${task.endLine}`,
                inline: true,
            },
            {
                name: "Branch",
                value: task.gitBranch,
                inline: true,
            },
            {
                name: "Commit",
                value: `[ ${task.gitCommit.slice(0, 7)}](https://github.com/search?q=${encodeURIComponent(task.gitCommit)})`,
                inline: true,
            }
        )
        .setColor(0x2a44d5)
        .setFooter({ text: "Locked-In Devs" })
        .setTimestamp();

    return embed;
} 