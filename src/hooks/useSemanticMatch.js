import { useEffect, useState, useCallback, useRef } from 'react';
import {
  embedProfile, profileToText, isEmbeddingAvailable,
} from '../services/embeddings';
import {
  loadVectorStore, upsert, getEntry, search, textHash,
} from '../services/vectorStore';

// Embed a card if we don't already have a vector for its current text.
// Returns true if the store now has an up-to-date vector for this id.
const indexCard = async (card) => {
  if (!card?.id) return false;
  const text = profileToText(card);
  if (!text) return false;
  const hash = textHash(text);
  const existing = await getEntry(card.id);
  if (existing && existing.hash === hash) return true;
  try {
    const vector = await embedProfile(card);
    await upsert(card.id, vector, hash);
    return true;
  } catch (err) {
    console.warn('[semantic] indexCard failed', card.id, err.message);
    return false;
  }
};

export const useSemanticMatch = (profile, cards) => {
  // id -> score (0..1, mapped from cosine -1..1)
  const [scores, setScores] = useState({});
  const [indexing, setIndexing] = useState(false);
  const myIdRef = useRef(null);

  const available = isEmbeddingAvailable();

  // Keep my own embedding fresh.
  useEffect(() => {
    if (!available || !profile) return;
    const id = profile.id || 'me';
    myIdRef.current = id;
    (async () => {
      await loadVectorStore();
      const text = profileToText({ ...profile, id });
      if (!text) return;
      const hash = textHash(text);
      const existing = await getEntry(id);
      if (existing && existing.hash === hash) return;
      try {
        const vector = await embedProfile(profile);
        await upsert(id, vector, hash);
      } catch (err) {
        console.warn('[semantic] embed self failed', err.message);
      }
    })();
  }, [available, profile]);

  // Index and rank the given cards whenever the list changes.
  useEffect(() => {
    if (!available || !cards?.length) {
      setScores({});
      return;
    }
    let cancelled = false;

    (async () => {
      setIndexing(true);
      await loadVectorStore();

      const myId = myIdRef.current || profile?.id || 'me';
      const mine = await getEntry(myId);
      if (!mine) { setIndexing(false); return; }

      // Index cards in parallel; limit to a modest batch to be polite to
      // the embedding API.
      const BATCH = 4;
      for (let i = 0; i < cards.length; i += BATCH) {
        if (cancelled) return;
        await Promise.all(cards.slice(i, i + BATCH).map(indexCard));
      }

      const ids = cards.map((c) => c.id);
      const ranked = await search(mine.vector, { k: ids.length, excludeId: myId, ids });
      if (cancelled) return;
      const next = {};
      for (const { id, score } of ranked) {
        // Map cosine (-1..1) to 0..1 for display. Real scores cluster
        // above 0.5, so this is still a faithful ordering.
        next[id] = Math.max(0, Math.min(1, (score + 1) / 2));
      }
      setScores(next);
      setIndexing(false);
    })();

    return () => { cancelled = true; };
  }, [available, cards, profile]);

  const rankedCards = available && Object.keys(scores).length
    ? [...cards].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0))
    : cards;

  return { rankedCards, scores, indexing, available };
};
