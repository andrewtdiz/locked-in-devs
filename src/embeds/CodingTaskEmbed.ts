import { EmbedBuilder } from "discord.js";

export interface CodingTaskData {
    task: string; // Added task property
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
        .setTitle(`${task.relativePath}`)
        .addFields(
            {
                name: "Task",
                value: task.task,
                inline: false,
            }
        )
        .setDescription(
            `**Selected Code:**\n\`\`\`tsx\n${task.selectedText.length > 150 ? task.selectedText.slice(0, 150) + '...' : task.selectedText}\n\`\`\``
        )
        .addFields(
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