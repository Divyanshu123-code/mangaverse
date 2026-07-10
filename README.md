# MangaVerse 📖

A full-stack manga reading platform with multi-source support, user authentication, and reading history tracking.

> **📚 Documentation is organized in the `documentation/` folder**

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| **[START_HERE.md](documentation/START_HERE.md)** ⭐ | New to the project? Start here! |
| **[CHANGELOG_DETAILED.md](documentation/CHANGELOG_DETAILED.md)** | Complete setup & development guide |
| **[README.md](documentation/README.md)** | Original project README |
| **[DEPLOYMENT.md](documentation/DEPLOYMENT.md)** | How to deploy the project |
| **[MANGAVERSE_ENCYCLOPEDIA.md](documentation/MANGAVERSE_ENCYCLOPEDIA.md)** | Feature documentation |
| **[CHANGELOG.md](documentation/CHANGELOG.md)** | Work history & git commits |

---

## ⚡ What's Working

✅ User authentication (Email + Google OAuth)  
✅ Manga search (6 sources: Asura, Flame, MangaHub, Manganato, MangaDex, AniList)  
✅ Chapter reading with image caching  
✅ Reading history tracking  
✅ User profiles with statistics  
✅ Mobile responsive design  
✅ Performance optimization (caching, pooling)  

---

## 🛠️ Tech Stack

- **Frontend:** React 18.2 + Vite + Tailwind CSS
- **Backend:** Node.js + Express
- **Database:** Firebase (Firestore, Auth, Storage)
- **Scrapers:** Playwright + Cheerio
- **Deployment:** Firebase Hosting

---

## 📁 Folder Structure

```
mangaverse/
├── documentation/          ← All documentation files
├── src/                   ← Frontend React code
├── manga-backend/         ← Backend Node.js code
├── public/                ← Static assets
├── functions/             ← Firebase Cloud Functions
├── package.json           ← Frontend dependencies
└── vite.config.js         ← Build configuration
```

---

## 🚀 Development

### Frontend
```bash
cd mangaverse
npm install
npm run dev        # Start dev server
npm run build      # Build for production
npm run lint       # Check code quality
```

### Backend (Optional, for local API testing)
```bash
cd manga-backend
npm install
npm start          # Start backend on port 5050
```

---

## 📚 Want to Continue Development?

1. **First:** Read [documentation/START_HERE.md](documentation/START_HERE.md)
2. **Then:** Read [documentation/CHANGELOG_DETAILED.md](documentation/CHANGELOG_DETAILED.md)
3. **Finally:** Start coding! 🎉

---

## 🔗 Links

- **GitHub:** https://github.com/Divyanshu123-code/mangaverse
- **Live Demo:** https://mangaverse-b4b47.firebaseapp.com
- **Firebase Console:** https://console.firebase.google.com/project/mangaverse-b4b47

---

**Status:** ✅ 95% Complete | **Last Updated:** July 10, 2026
