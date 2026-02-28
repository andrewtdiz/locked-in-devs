type ModalStartSessionRequest = {
  guild_id: string;
  voice_channel_id: string;
};

type ModalStopSessionRequest = {
  reason: string;
};

type ModalConfig = {
  baseUrl: string;
  key: string;
  secret: string;
};

function getModalConfig(): ModalConfig {
  const baseUrl = process.env.MODAL_BASE_URL;
  const key = process.env.MODAL_KEY;
  const secret = process.env.MODAL_SECRET;

  if (!baseUrl) {
    throw new Error("Missing MODAL_BASE_URL");
  }

  if (!key) {
    throw new Error("Missing MODAL_KEY");
  }

  if (!secret) {
    throw new Error("Missing MODAL_SECRET");
  }

  return { baseUrl, key, secret };
}

function buildModalUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return new URL(normalizedPath, normalizedBase).toString();
}

async function postToModal(
  path: string,
  payload: Record<string, string>
): Promise<void> {
  const { baseUrl, key, secret } = getModalConfig();
  const url = buildModalUrl(baseUrl, path);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Modal-Key": key,
      "Modal-Secret": secret,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Modal request failed (${response.status} ${response.statusText}): ${errorBody}`
    );
  }
}

export async function startTranscriptionSession(
  payload: ModalStartSessionRequest
): Promise<void> {
  await postToModal("start", payload);
}

export async function stopTranscriptionSession(
  payload: ModalStopSessionRequest
): Promise<void> {
  await postToModal("stop", payload);
}
