import { Platform } from 'react-native';

const DEFAULT_PORT = 8000;

export const DEFAULT_BACKEND_URL = Platform.select({
  android: `http://10.0.2.2:${DEFAULT_PORT}`,
  default: `http://localhost:${DEFAULT_PORT}`,
});

export async function createClaudeRound({ backendUrl, seed } = {}) {
  const baseUrl = (backendUrl || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '');
  const response = await fetch(`${baseUrl}/round`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ seed: seed ?? null }),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.detail || `Backend request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return data;
}
