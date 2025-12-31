import React, { createContext, useContext, useEffect, useState } from "react";

const FollowContext = createContext();

export function FollowProvider({ children }) {
  const [followed, setFollowed] = useState([]);

  // Load followed manga from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("followedManga");
    if (saved) setFollowed(JSON.parse(saved));
  }, []);

  // Save to localStorage whenever changed
  useEffect(() => {
    localStorage.setItem("followedManga", JSON.stringify(followed));
  }, [followed]);

  // ✅ Add/Remove follow toggle
  const toggleFollow = (manga) => {
    setFollowed((prev) => {
      const exists = prev.find((m) => m.id === manga.id);
      if (exists) {
        return prev.filter((m) => m.id !== manga.id);
      } else {
        return [...prev, manga];
      }
    });
  };

  const isFollowed = (id) => followed.some((m) => m.id === id);

  return (
    <FollowContext.Provider value={{ followed, toggleFollow, isFollowed }}>
      {children}
    </FollowContext.Provider>
  );
}

export const useFollow = () => useContext(FollowContext);