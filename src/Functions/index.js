// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");  // or `import fetch` if you prefer modules

admin.initializeApp();
const db = admin.firestore();

// Assume you have a "follows" collection where
// each doc has { userId: ..., mangaId: ... }

exports.checkNewMangaUpdates = functions.pubsub
  .schedule("every 1 hours")   // adjust as needed
  .onRun(async (context) => {
    console.log("Running scheduled checkNewMangaUpdates");

    try {
      // Fetch recently updated manga, with english translations & covers
      const resp = await fetch(
        "https://api.mangadex.org/manga?limit=20&order[updatedAt]=desc&availableTranslatedLanguage[]=en&includes[]=cover_art"
      );
      if (!resp.ok) throw new Error(`MangaDex fetch failed: ${resp.status}`);
      const json = await resp.json();
      const mangaList = json.data || [];

      // Load follows
      const followsSnap = await db.collection("follows").get();
      const followMap = {};
      followsSnap.forEach(doc => {
        const { userId, mangaId } = doc.data();
        if (!followMap[mangaId]) followMap[mangaId] = [];
        followMap[mangaId].push(userId);
      });

      // For each manga in recent list, create notifications
      for (const manga of mangaList) {
        const mId = manga.id;
        // If nobody follows it, skip
        if (!followMap[mId] || followMap[mId].length === 0) continue;

        // You might want to check if you've already notified users for this manga update
        // else users will get duplicate notifications every hour.
        // For simplicity: you can store lastUpdate timestamp per mangaId, or
        // mark a document collection e.g. "mangaUpdates" with mangaId + timestamp, to avoid duplicates.

        const title = manga.attributes?.title?.en
          || (manga.attributes.altTitles?.find(t => t.en)?.en)
          || "Untitled";
        
        const message = `“${title}” has been recently updated.`;

        const batch = db.batch();
        const now = admin.firestore.FieldValue.serverTimestamp();

        followMap[mId].forEach(userId => {
          const notifRef = db.collection("notifications").doc();
          batch.set(notifRef, {
            userId,
            title,
            message,
            read: false,
            timestamp: now,
            mangaId: mId
          });
        });
        await batch.commit();
      }

    } catch (err) {
      console.error("Error in scheduled update function:", err);
    }
  });