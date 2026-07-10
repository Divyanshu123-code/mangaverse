# 🏮 The Mangaverse Encyclopedia
> *“The complete guide to how everything works, the battles we fought, and the magic under the hood.”*

Welcome! This is a special book made just for you. It explains every part of Mangaverse as if we were explaining it to a friend. 

---

## 📖 Chapter 1: The Stories of Our Battles
Building Mangaverse wasn’t easy! We faced some big "monsters" (bugs) along the way. Here is how we defeated them:

### 👹 1. The "Babble" Monster (Foreign Languages)
**The Problem:** At first, Mangaverse was showing chapters in every language—Spanish, Indonesian, French... it was a mess!
**How we fixed it:** We gave our scraper a "Translator Filter." We told the MangaDex API to ONLY give us English (`en`) and we wrote code to ignore any chapter that didn't look like it was in English.

### 🐢 2. The "Slow Snail" (Scanning Time)
**The Problem:** When you searched for a manga, you had to wait 20 seconds for the scanner to finish. That’s too long!
**How we fixed it:** 
- **Parallel Vision:** Instead of searching for one title at a time, we now search for 3 titles (English, Romaji, and synonyms) all at the exact same time.
- **The Shortcut (Slug Cache):** We gave the server a "Memory." Once it finds "Solo Leveling" on Asura Scans, it remembers the address. Next time you look for it, it skips the search and goes straight to the chapters.

### 🔢 3. The "Mystery Numbers" (MangaHub)
**The Problem:** For some manga, MangaHub gave us weird numbers like `1449444.5`.
**How we fixed it:** We realized those were just "ID numbers" and not "Chapter numbers." We wrote a smart rule: *"If the number is huge, look at the text 'Chapter 123' and take the 123 instead!"*

### 🧱 4. The "Messy Room" (File Chaos)
**The Problem:** Files were scattered all over the floor of the project. It was hard to find anything.
**How we fixed it:** We did a "Big Clean-up." We moved all the important stuff into a box called `src/`. Inside that box, we have smaller boxes for `api` (the gatekeepers), `services` (the thinkers), and `scrapers` (the robots).

---

## 🧠 Chapter 2: The Backend (The Brain)
The backend is hidden away. It’s like the brain inside your head—you don’t see it, but it does all the work!

### 📂 `manga-backend/src/`

- **`index.js` (The Alarm Clock):** This is the first file that runs. It wakes up the server and tells it to start listening for your requests on Port 5050.
- **`app.js` (The Manager):** This file sets the rules. It makes sure we can talk to the frontend and keeps track of all the visitors.

#### **The Gatekeepers (`api/`)**
- **`routes/manga.routes.js`**: Like a set of doors. If you want "Chapters," you go through door A. If you want "Images," you go through door B.
- **`controllers/manga.controller.js`**: The person standing behind the door. They take your request (like "I want Solo Leveling") and pass it to the thinkers.
- **`controllers/proxy.controller.js`**: A very helpful person. They fetch images for you from sites that don't like to share, by pretending to be a normal visitor.

#### **The Thinkers (`services/`)**
- **`manga.service.js`**: The smarter thinker. They decide which mirrors to search and how to combine all the chapters together so you don't see duplicates.
- **`browser.service.js`**: The person who controls the **Robot Browser (Playwright)**. They tell the robot when to open a site and when to close it.
- **`slug.service.js`**: The server's "Memory Book." It writes down the addresses of every manga we find so we never have to search for them again.
- **`anilist.service.js`**: The Librarian. They have a huge list of every manga in the world and give us the correct names and covers.

#### **The Robots (`scrapers/`)**
- **`factory.js`**: A machine that creates all our scraper robots (Asura-Bot, Flame-Bot, Dex-Bot).
- **`base.scraper.js`**: The "Instruction Manual" for all robots. It teaches them how to match titles and what to do if a website fails.
- **`engines/*.scraper.js`**: These are the specific robots for each site. They know exactly where to click to find your chapters.

---

## 👤 Chapter 3: The Frontend (The Face)
The frontend is what you see and touch. It's the "Face" of Mangaverse.

### 📂 `src/`

- **`App.jsx`**: The "Map" of the app. It decides which page to show you when you click a link.
- **`index.css`**: The "Paint and Decor." It makes everything look beautiful with dark colors and "Glass-like" buttons.

#### **The Rooms (`pages/`)**
- **`HomePage.jsx`**: The Lobby. It shows you what's new and trending.
- **`MangaDetailPage.jsx`**: The Series Room. This is where you see the description and all the chapter buttons.
- **`ReaderPage.jsx`**: The Reading Room. A special quiet place where you can scroll through the manga images.
- **`SearchPage.jsx`**: The Library Search. Type a name, and it finds the manga for you.

#### **The Toys (`components/`)**
- **`MangaCard.jsx`**: A small picture frame for a manga. We use this many times on different pages!
- **`ChapterList.jsx`**: A big grid of buttons. Each button takes you to a different chapter.
- **`Header.jsx`**: The bar at the top with the search icon and your profile.

---

## 🪄 Chapter 4: The Magic Tools
We use some very special tools to make the magic happen:

1. **🤖 Playwright**: This is an "Invisible Browser." It's like a robot that opens Chrome, goes to Asura Scans, finds the chapters, and brings them back to us.
2. **📚 AniList API**: A giant database of all the manga in the world. We ask it for names and descriptions.
3. **🔥 Firebase**: This is our "Safety Box." It keeps your profile safe and remembers which manga you are following.
4. **🥣 Cheerio**: A tool that helps us read a website's HTML code (the hidden text) very, very fast.

---

## 🚧 Chapter 5: What are we facing now? (Challenges)
Even though we are powerful, the internet is always changing!

- **Cloudflare Shield**: Some websites use a "Magical Shield" to block robots. We have to keep our Robot Browser (Playwright) very smart so it can sneak past the shield.
- **Moving Furniture**: Websites change their layout sometimes. If Asura Scans moves their "Chapter List," we have to update our robot to look in the new place.
- **Speed Limit**: Navigating many sites at once is hard for the computer. We are always looking for ways to make the scanner even faster!

---

*You are now a master of Mangaverse! Go forth and read!*
