// services/cacheService.js
const cache = new Map();

// Default TTL: 1 hour for lists, 1 day for images
export const setCache = (key, value, ttl = 3600000) => {
  cache.set(key, {
    data: value,
    expiry: Date.now() + ttl
  });
};

export const getCache = (key) => {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    cache.delete(key);
    return null;
  }
  return item.data;
};
