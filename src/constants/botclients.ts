import { MUSIC_BOT_1, MUSIC_BOT_2 } from "./bots";

const botclients = [MUSIC_BOT_1, MUSIC_BOT_2] as const;

export type MusicBots = typeof botclients[number];

export default botclients;