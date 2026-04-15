import { Platform } from 'react-native';

const DEFAULT_PORT = 8000;

const ENV_BACKEND_URL = (process.env.EXPO_PUBLIC_BACKEND_URL || '').trim();

export const DEFAULT_BACKEND_URL = Platform.select({
  android: ENV_BACKEND_URL || `http://10.0.2.2:${DEFAULT_PORT}`,
  default: ENV_BACKEND_URL || `http://localhost:${DEFAULT_PORT}`,
});

export const getBackendBaseUrl = (backendUrl) =>
  (backendUrl || DEFAULT_BACKEND_URL).trim().replace(/\/+$/, '');

export async function createClaudeRound({ backendUrl, seed } = {}) {
  const baseUrl = getBackendBaseUrl(backendUrl);
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

async function parseApiResponse(response) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.detail || `Backend request failed with status ${response.status}.`;
    throw new Error(message);
  }
  return data;
}

export async function joinNearbyGame({ backendUrl, player, roomCode = 'nearby-demo', seed = null }) {
  const response = await fetch(`${getBackendBaseUrl(backendUrl)}/games/join`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      player,
      room_code: roomCode,
      seed,
    }),
  });

  return parseApiResponse(response);
}

export async function fetchNearbyGame({ backendUrl, roomCode, playerId }) {
  const response = await fetch(
    `${getBackendBaseUrl(backendUrl)}/games/${encodeURIComponent(roomCode)}?player_id=${encodeURIComponent(playerId)}`
  );

  return parseApiResponse(response);
}

export async function submitNearbyCards({ backendUrl, roomCode, playerId, selectedIndices }) {
  const response = await fetch(
    `${getBackendBaseUrl(backendUrl)}/games/${encodeURIComponent(roomCode)}/submit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_id: playerId,
        selected_indices: selectedIndices,
      }),
    }
  );

  return parseApiResponse(response);
}

export async function chooseNearbyWinner({ backendUrl, roomCode, playerId, winnerPlayerId }) {
  const response = await fetch(
    `${getBackendBaseUrl(backendUrl)}/games/${encodeURIComponent(roomCode)}/winner`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_id: playerId,
        winner_player_id: winnerPlayerId,
      }),
    }
  );

  return parseApiResponse(response);
}

export async function dealNextNearbyRound({ backendUrl, roomCode, playerId, seed = null }) {
  const response = await fetch(
    `${getBackendBaseUrl(backendUrl)}/games/${encodeURIComponent(roomCode)}/next-round`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        player_id: playerId,
        seed,
      }),
    }
  );

  return parseApiResponse(response);
}
