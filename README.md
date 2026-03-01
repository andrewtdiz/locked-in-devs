# LockedInDevs
bot made by void

https://dsc.gg/lockedindevs

## Environment

Add the following variables to `.env`:

```
MODAL_BASE_URL=https://your-modal-app.modal.run
MODAL_KEY=wk-...
MODAL_SECRET=ws-...
```

## Modal Deploy + API Flow

What you do now:

1. Redeploy:

```bash
modal deploy modal_app.py
```

2. Keep the current TS/command flow (JSON is correct):

- `/transcribe` sends `POST ${MODAL_BASE_URL}/start` with `guild_id` and `voice_channel_id`.
- `/done` sends `POST ${MODAL_BASE_URL}/stop` with `reason: "done_command"`.
- Both requests include `Modal-Key` and `Modal-Secret` headers from `.env`.

3. You should no longer get `410` from `/start` or `/stop`.
