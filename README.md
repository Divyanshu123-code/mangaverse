# 🌌 Mangaverse (v2.0.0 "Extreme Speed")

Mangaverse is a high-performance, multi-source manga and manhwa aggregator designed for speed, reliability, and a premium reading experience. It consolidates chapters from multiple scanlation mirrors into a single, sleek interface.

---

## 🚀 Key Features

### 1. **Extreme Speed Aggregation**
The engine uses a sophisticated "Primary-First" parallel search strategy to find your favorite series across all mirrors simultaneously.
- **Slug Caching**: Remembers the exact URL of every series found, making subsequent visits nearly instant.
- **Parallel Multi-Search**: Scans all title variations (English, Romaji, Synonyms) in parallel to ensure 100% find rates without delay.
- **Low Latency Scanning**: Ultra-tight 8-second timeouts ensure the UI remains snappy even if a mirror site is slow.

### 2. **Professional Modular Architecture (v2.0.0 Redesign)**
The backend has been completely redesigned with a "Clean Architecture" pattern, separating concerns into API, Services, and Engines.

---

## 📁 Deep Dive: Detailed File Breakdown

### 🖥️ Backend Implementation (`manga-backend/src/`)

#### **🏗️ Server Core**
- **`index.js`**: The foundational entry point. It initializes the HTTP server, maps the listening port, and implements graceful shutdown handlers (SIGTERM) to ensure the process closes safely without dropping active connections.
- **`app.js`**: The Express application configuration. This file acts as the middleware hub, setting up CORS (for frontend access), JSON parsing for requests, and global request logging. It is where all API routes are mounted.
- **`config/index.js`**: The central source of truth for all application settings. It pulls variables from `.env` and exports constants for timeouts, default ports, and environment modes, ensuring no hardcoded values exist in the logic.

#### **📡 API Layer (Controllers & Routes)**
- **`api/routes/manga.routes.js`**: The traffic controller. It defines every public URL endpoint (like `/chapters`, `/proxy`, or `/search`) and points them to the correct logic function in the controllers.
- **`api/controllers/manga.controller.js`**: Handles the logic for manga data. It extracts IDs or titles from the user's request, communicates with the `mangaService`, and returns the final aggregated results as clean JSON.
- **`api/controllers/proxy.controller.js`**: Provides an essential "Bypass Proxy." Many mirror sites block direct image loading (Hotlinking). This file fetches images on the backend and pipes them to the frontend using the correct `Referer` headers to ensure they load successfully.

#### **🧠 Business Logic (Services)**
- **`services/manga.service.js`**: The heart of the project. It orchestrates the entire search flow—first gathering metadata from AniList, then triggering 5 different mirrors in parallel, and finally merging and deduplicating hundreds of chapters into a single, unique list.
- **`services/browser.service.js`**: Manages the life cycle of the Playwright browser. It handles opening pages, setting "Human-like" User-Agents, and ensuring that multiple scrapers can share the browser instance efficiently to save memory.
- **`services/cache.service.js`**: A high-speed in-memory cache. It stores chapter lists for 30 minutes, ensuring that if multiple users look for the same manga, the server doesn't waste time re-scraping the mirror sites.
- **`services/slug.service.js`**: A persistent "Memory" service. It maps manga titles to their exact URLs on sites like Asura or Manganato. This allows the engine to skip the "Search" phase entirely for known titles, making the scan process instant.
- **`services/anilist.service.js`**: Connects to the AniList GraphQL API. It is responsible for fetching high-quality metadata, including English/Romaji titles and synonyms, which are vital for finding accurate matches on mirror sites.

#### **⚙️ Scraper Engine**
- **`scrapers/factory.js`**: Implements the Factory Pattern. It creates and manages instances of every scraper engine, allowing the rest of the application to interact with "All Sources" without needing to know the specific details of each one.
- **`scrapers/base.scraper.js`**: The "Blueprint" for every scraper. It contains shared logic used by all mirrors, including Fuzzy Title Matching (scoring), Exponential Backoff Retries, and safe HTML fetching.
- **`scrapers/engines/asura.scraper.js`**: Specialized for Asura Scans. It handles their complex series navigation and extract chapters from their custom "grid" layout.
- **`scrapers/engines/flame.scraper.js`**: Designed for Flame Comics. It knows how to navigate their "Browse" section and identify chapter links accurately.
- **`scrapers/engines/mangadex.scraper.js`**: The fast API implementation. Instead of scraping HTML, it talks directly to the MangaDex API and enforces strict "English-only" filters as per the redesign.
- **`scrapers/engines/manganato.scraper.js`**: A robust scraper for Manganato. It handles their domain rotation logic (e.g., swapping between `manganato.com` and `chapmanganato.to`) so it never goes down.
- **`scrapers/engines/mangahub.scraper.js`**: A high-efficiency scraper that utilizes MangaHub's internal GraphQL endpoint to fetch chapter lists without needing a full browser render.

#### **🛠️ Utilities**
- **`utils/logger.js`**: A professional terminal logger that provides color-coded, timestamped feedback for every backend action (🟢 Success, 🔵 Info, 🟡 Warn, 🔴 Error).
- **`utils/proxy.utils.js`**: A configuration helper that maps every mirror source to its specific Referer and Host headers for use in the Image Proxy.

---

### 📱 Frontend Implementation (`src/`)

#### **🖼️ Pages (The Views)**
- **`App.jsx`**: The root of the frontend. It sets up the overall application shell and manages the Client-Side Routing via `react-router-dom`.
- **`pages/HomePage.jsx`**: The main entry view. It coordinates multiple "Manga Carousels" and Hero banners to showcase trending and newly updated series.
- **`pages/MangaDetailPage.jsx`**: The "Scan Center." When you visit a manga's page, this file triggers the backend sweep and manages the "Scanning Mirrors..." UI state while data is being aggregated.
- **`pages/ReaderPage.jsx`**: The viewing hub. It implements a "Long-Strip" scrollable interface for reading chapters, includes chapter-jump navigation, and integrates with the proxy to load protected images.
- **`pages/SearchPage.jsx`**: A dynamic result view that allows users to find series across the entire AniList database with real-time feedback.
- **`pages/ProfilePage.jsx`**: The user's dashboard where they can see their followed series, bookmarks, and reading history stored in Firebase.

#### **🧩 Components (Reusable UI)**
- **`components/MangaCard.jsx`**: The standard visual block for a manga. It features a sleek glassmorphic design and handles hover animations.
- **`components/ChapterList.jsx`**: A specialized grid that displays hundreds of chapters. It includes "Source Tabs" so users can switch between different versions of the same chapter (e.g., Asura vs MangaDex).
- **`components/Header.jsx`**: The persistent top bar with search triggers, category navigation, and user authentication status.
- **`components/HeroSection.jsx`**: A large, visually intense banner used to showcase top-rated or trending "must-reads" on the home page.
- **`components/SearchModel.jsx`**: The advanced modal overlay that provides a focus-search experience from any page in the app.

#### **🔄 Global State & Data**
- **`api/mangaApi.js`**: The central utility for API calls. It configures the Axios instance for the backend and provides named functions for every API endpoint.
- **`Context/AuthContext.jsx`**: Manages the Firebase Authentication state. It tracks if a user is logged in, their profile info, and provides login/logout methods globaly.
- **`Context/FollowContext.jsx`**: Synchronizes the user's "Followed" list with the cloud database, ensuring bookmarks are saved across all devices.
- **`firebase.js`**: The configuration file that initializes the Firebase SDK for both the real-time database and secure authentication.

#### **🎨 Design System**
- **`index.css`**: The core of the visual experience. It defines the global "Glassmorphism" design system, custom scrollbars, and the dark-mode color palette used across the entire application.

---

## 🚀 Installation & Running

### **1. Setup Backend**
```bash
cd manga-backend
npm install
npm run install-browsers 
npm start
```

### **2. Setup Frontend**
```bash
npm install
npm run dev
```

---

*Developed with ❤️ for the Manga community.*
