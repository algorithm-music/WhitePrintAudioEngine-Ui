<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/4b591809-9379-4f98-a53a-6b0e21aa52ef

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Create `.env.local` (see `.env.example`) and set:
   - `CONCERTMASTER_URL` (e.g. `http://localhost:8000` or your Cloud Run URL)
   - `CONCERTMASTER_API_KEY` (sent as `X-Api-Key` from the server-side proxy)
3. Run the app:
   `npm run dev`

## Deploy on Vercel

1. Import this repo into Vercel as a Next.js project.
2. Add Environment Variables (Project Settings → Environment Variables):
   - `CONCERTMASTER_URL`
   - `CONCERTMASTER_API_KEY`
3. Deploy.

Notes:
- Do **not** expose the API key to the browser. Keep `CONCERTMASTER_API_KEY` server-side only (no `NEXT_PUBLIC_` prefix).
- The frontend calls the backend via `POST /api/master`, which proxies to `concertmaster POST /api/v1/jobs/master`.
