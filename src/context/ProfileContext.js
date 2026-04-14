import React, { createContext, useContext, useState, useEffect } from 'react';
import { saveProfile, loadProfile, saveCollected, loadCollected } from '../utils/storage';

const ProfileContext = createContext(null);

export const ProfileProvider = ({ children }) => {
  const [profile, setProfileState] = useState(null);
  const [collected, setCollectedState] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [p, c] = await Promise.all([loadProfile(), loadCollected()]);
      if (p) setProfileState(p);
      if (c) setCollectedState(c);
      setLoading(false);
    })();
  }, []);

  const updateProfile = async (updates) => {
    const updated = { ...profile, ...updates };
    setProfileState(updated);
    await saveProfile(updated);
  };

  const addCollected = async (card) => {
    const exists = collected.find((c) => c.id === card.id);
    if (exists) return;
    const updated = [card, ...collected];
    setCollectedState(updated);
    await saveCollected(updated);
  };

  const addReview = async (cardId, review) => {
    const updated = collected.map((c) =>
      c.id === cardId
        ? { ...c, reviews: [review, ...(c.reviews || [])] }
        : c
    );
    setCollectedState(updated);
    await saveCollected(updated);
  };

  const updateMyReviews = async (review) => {
    const updated = { ...profile, reviews: [review, ...(profile.reviews || [])] };
    setProfileState(updated);
    await saveProfile(updated);
  };

  return (
    <ProfileContext.Provider value={{ profile, collected, loading, updateProfile, addCollected, addReview, updateMyReviews }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
