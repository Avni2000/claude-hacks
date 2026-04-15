// Gemini Embedding 2 client.
//
// Docs: https://ai.google.dev/gemini-api/docs/embeddings
// Model: gemini-embedding-2-preview (multimodal; no taskType supported).
// Endpoint: POST /v1beta/models/gemini-embedding-2-preview:embedContent
// Request:  { content: { parts: [{ text }] }, output_dimensionality }
// Response: { embeddings: [{ values: number[] }] } (some variants return
//           { embedding: { values: [...] } } — handle both)
//
// The API key is read from EXPO_PUBLIC_GEMINI_API_KEY. Expo bundles
// EXPO_PUBLIC_* vars into the client, which is fine for a prototype but
// in production this call should be proxied through a backend.

const MODEL = 'gemini-embedding-2-preview';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:embedContent`;
const DIM = 768;

const getApiKey = () => process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export const isEmbeddingAvailable = () => !!getApiKey();

// Build a compact natural-language representation of a profile. Putting
// labeled fields into flowing sentences gives the model more signal than
// a JSON dump and lands closer to how humans describe each other.
export const profileToText = (p) => {
  if (!p) return '';
  const parts = [];
  if (p.name) parts.push(`Name: ${p.name}.`);
  if (p.jobTitle || p.company) {
    parts.push(
      `Role: ${[p.jobTitle, p.company].filter(Boolean).join(' at ')}.`
    );
  }
  if (p.bio) parts.push(`Bio: ${p.bio}`);
  if (Array.isArray(p.skills) && p.skills.length) {
    parts.push(`Skills: ${p.skills.join(', ')}.`);
  }
  return parts.join(' ').trim();
};

export const embedText = async (text) => {
  const key = getApiKey();
  if (!key) throw new Error('EXPO_PUBLIC_GEMINI_API_KEY is not set');
  if (!text || !text.trim()) throw new Error('Cannot embed empty text');

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify({
      content: { parts: [{ text }] },
      output_dimensionality: DIM,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`Gemini embed failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const json = await res.json();
  const values =
    json?.embeddings?.[0]?.values ||
    json?.embedding?.values ||
    null;
  if (!Array.isArray(values)) {
    throw new Error('Gemini embed response missing values array');
  }
  return values;
};

export const embedProfile = (profile) => embedText(profileToText(profile));

export const EMBED_DIM = DIM;
