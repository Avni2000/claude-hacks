// Client for the match-blurb backend endpoint.
//
// Claude is called server-side (backend/match_service.py) so the API
// key stays in backend/.env. This module just posts the two profiles
// and returns the generated sentence.
//
// Base URL comes from EXPO_PUBLIC_BACKEND_URL (e.g. http://10.0.0.5:8000
// when running uvicorn on a dev machine and testing on a phone).

const getBaseUrl = () =>
  (process.env.EXPO_PUBLIC_BACKEND_URL || '').replace(/\/+$/, '');

export const isClaudeAvailable = () => !!getBaseUrl();

export const generateMatchBlurb = async (me, them) => {
  const base = getBaseUrl();
  if (!base) return null;

  const res = await fetch(`${base}/match/blurb`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ me, them }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`match/blurb ${res.status}: ${body.slice(0, 160)}`);
  }

  const json = await res.json();
  return json?.blurb || null;
};
