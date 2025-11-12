# Verifier Checklist: Interactive Music Player

This document provides a checklist to verify the correct implementation of the Interactive Music Player feature, as specified in `FEATURE_SPEC.md`.

## Instructions for the Verifier

Please go through each item in the checklist below. Mark the checkbox for each item that is correctly implemented and functional. Provide details for any items that fail verification.

---

### 1. Embed Display

- [ ] **Embed Presence:** The bot sends a message with an embed when a song starts playing.
- [ ] **Embed Title:** The embed title is exactly "Now playing".
- [ ] **Song Information:** The embed correctly displays the song's title and artist.
- [ ] **Requester Information:** The embed shows the user who requested the song.
- [ ] **Voice Channel Information:** The embed shows the voice channel where the song was requested.
- [ ] **Time Display:** The embed displays the song's current time and total duration (e.g., `0:00 / 3:14`).
- [ ] **Time Updates:** The timestamp in the embed updates periodically as the song plays.

### 2. Interactive Buttons

- [ ] **Button Presence:** A row of buttons is displayed below the music player embed.
- [ ] **Button Set:** The buttons present are: Replay, Play/Pause, Skip, and Stop.
- [ ] **Button Icons:** The buttons use appropriate emojis (e.g., ⏪, ⏯️, ⏩, ⏹️).

### 3. Button Functionality

- [ ] **Play/Pause:**
    - [ ] Clicking the pause button pauses the music.
    - [ ] Clicking the play button resumes the music.
    - [ ] The button's icon updates to reflect the current state (Play vs. Pause).
- [ ] **Skip:**
    - [ ] Clicking the skip button immediately plays the next song in the queue.
    - [ ] The embed updates to show the new song's information.
    - [ ] If there is no next song, clicking skip stops playback.
- [ ] **Replay:**
    - [ ] Clicking the replay button restarts the current song from the beginning.
    - [ ] The timestamp resets to `0:00`.
- [ ] **Stop:**
    - [ ] Clicking the stop button stops the music playback.
    - [ ] The music queue is cleared.
    - [ ] The bot disconnects from the voice channel.
- [ ] **Player Message State:**
    - [ ] The music player message is either deleted or updated to a "stopped" state after the stop button is pressed or the queue ends.

### 4. Permissions

- [ ] **Interaction Permissions:** Test that only authorized users (e.g., the song requester or a user with a "DJ" role) can use the control buttons. Other users' interactions should be ignored or result in an ephemeral error message.

---

### Verification Summary

**Overall Status:** (Pass/Fail)

**Notes:**
(Add any notes, comments, or details about failed checks here.)
