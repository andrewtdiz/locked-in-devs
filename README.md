# LockedInDevs
bot made by void

https://dsc.gg/lockedindevs

## Environment

Add the following variables to `.env`:

```
MODAL_BASE_URL=https://your-modal-app.modal.run
MODAL_KEY=your_modal_key
MODAL_SECRET=your_modal_secret
```

Slash command integrations:

- `/transcribe` sends `POST ${MODAL_BASE_URL}/start` with `guild_id` and `voice_channel_id`.
- `/done` sends `POST ${MODAL_BASE_URL}/stop` with `reason: "done_command"`.
- Both requests include `Modal-Key` and `Modal-Secret` headers from `.env`.
