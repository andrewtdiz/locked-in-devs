# Feature Specification: Interactive Music Player

## 1. Overview

This document outlines the specifications for a new interactive music player feature for the Discord bot. The goal is to enhance the user experience by providing a visually appealing and interactive way to control music playback within a Discord channel. This will be achieved using Discord's Embeds and interactive Buttons.

NOTE: You will not be able to execute any code. DO NOT execute code, just implement the specification.

## 2. Visual Design

The music player will be presented as a Discord Embed message.

### Example:

```
Now playing
Hvn High - Jenevieve
 
 @AndrewD AI VC 

0:00 / 3:14
```

### Components:

*   **Embed Title:** The title of the embed will always be "Now playing".
*   **Embed Description:** This will display the song title and artist. For example: `Hvn High - Jenevieve`.
*   **Requester Information:** Below the song title, it will show the Discord user who requested the song (e.g., `@AndrewD`) and the name of the Voice Channel the request was sent in (e.g., `AI VC`)
*   **Progress Bar & Time:** A visual representation of the song's progress. It will display the current timestamp and the total duration of the song (e.g., `0:00 / 3:14`).

## 3. Interactive Buttons

Below the embed, there will be a row of interactive buttons to control the music playback.

### Button Layout:

A single `ActionRow` will contain the following buttons in order:

1.  **Replay (⏪):** Restarts the current song.
2.  **Play/Pause (⏯️):** Toggles between pausing and resuming the current song. The emoji should update to reflect the current state (e.g., ⏸️ for pause, ▶️ for play).
3.  **Skip (⏩):** Skips the current song and plays the next one in the queue.
4.  **Stop (⏹️):** Stops the music, clears the queue, and disconnects the bot from the voice channel.

## 4. Functional Requirements

*   **Now Playing Message:** When a new song starts playing, the bot will send a single message containing the music player embed and the interactive buttons. This message will be updated as the song progresses or when users interact with the buttons.
*   **Real-time Updates:** The progress bar and timestamp should update periodically (e.g., every 5-10 seconds) to reflect the current playback time.
*   **Button Interactions:**
    *   All button interactions should be handled promptly.
    *   After an interaction (e.g., pause, skip), the embed or buttons should be updated to reflect the new state.
    *   Only the user who requested the song or users with specific permissions (like a "DJ" role) should be able to use these controls.
*   **Queue End:** When the queue is empty and the last song finishes, the music player embed should be updated to a "Queue finished" state or be deleted.
