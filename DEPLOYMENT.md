# MangaVerse Deployment

This repo is prepared for:

- Firebase Hosting for the Vite frontend
- Google Cloud Run for the Express + Playwright backend

The current Firebase project is `mangaverse-b4b47`.

## Assumptions

- Cloud Run service name: `mangaverse-backend`
- Cloud Run region: `asia-south1`

If you want a different service name or region, update [firebase.json](/Users/divanshu/project2.0/mangaverse/firebase.json).

## 1. Deploy the backend to Cloud Run

From the backend directory:

```bash
cd /Users/divanshu/project2.0/mangaverse/manga-backend
gcloud config set project mangaverse-b4b47
gcloud run deploy mangaverse-backend \
  --source . \
  --region asia-south1 \
  --allow-unauthenticated
```

Notes:

- This backend uses Playwright and includes a Dockerfile so Cloud Run builds the service with the required browser/runtime dependencies.
- Cloud Run will inject the `PORT` environment variable automatically.

## 2. Deploy the frontend to Firebase Hosting

From the project root:

```bash
cd /Users/divanshu/project2.0/mangaverse
npm run build
firebase deploy --only hosting
```

The Hosting config serves `dist/` and rewrites `/api/**` to the Cloud Run service.

## 3. Update Firebase Authentication domains

After Hosting is deployed, add the deployed hostnames in Firebase Console:

- `mangaverse-b4b47.web.app`
- `mangaverse-b4b47.firebaseapp.com`
- Any custom domain you connect later

You can manage this in:

- Firebase Console -> Authentication -> Settings -> Authorized domains

## 4. Verify

After both deploys:

1. Open the Firebase Hosting URL
2. Visit a manga detail page
3. Confirm `/api/chapters` is served through Hosting to Cloud Run
4. Test Google sign-in on the hosted domain
