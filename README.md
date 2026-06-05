# GreenOps AI Dashboard

A polished, interactive React + TypeScript + Tailwind CSS dashboard prototype built from the GreenOps AI Dashboard PRD v1.0 for Xebia.

## Stack

- Vite
- React with TypeScript
- Tailwind CSS v4
- Recharts
- Framer Motion
- Lucide React icons
- Vercel serverless function for optional Groq-powered AI insight

## Working functionality

- Navigation buttons smooth-scroll to dashboard sections.
- Hero CTAs jump to Emissions Explorer and Green Score.
- Date range and provider controls update the displayed chart data.
- CSV export downloads emissions data.
- Dashboard export downloads recommendation CSV and opens the browser print flow for PDF.
- Recommendation actions Accept, Snooze, and Dismiss update UI state and persist in `localStorage`.
- Impact sorting reorders recommendations.
- Green Score form computes an A-F grade, numeric score, factor breakdown, and CI/CD-style exit code.
- Region rows show region-specific carbon intensity details.
- Admin threshold slider simulates alert threshold behavior and saves an alert rule notification.
- Optional AI insight calls `/api/ai-insight`, which reads `GROQ_API_KEY` securely from server environment variables.

## Important security note

Do not put API keys in React client code. Browser bundles are public. Use `.env.example` as a template, set `GROQ_API_KEY` in Vercel Environment Variables, and rotate any key that was pasted into chat or committed anywhere.

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite, usually `http://localhost:5173`.

For local AI endpoint testing with Vercel CLI:

```bash
npm install -g vercel
vercel env pull .env.local
vercel dev
```

## Build

```bash
npm run build
npm run preview
```

## Deploy to Vercel

### Option 1: Vercel dashboard

1. Push this folder to a GitHub repository.
2. Go to https://vercel.com/new.
3. Import the repository.
4. Framework preset: `Vite`.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Add Environment Variable: `GROQ_API_KEY` with your rotated Groq key.
8. Click **Deploy**.

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
vercel env add GROQ_API_KEY
vercel --prod
```

When prompted, use:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Production notes

The app now has functioning front-end workflows and a secure AI endpoint pattern. Cloud billing, AWS/Azure ingestion, real RBAC, SSO, audit logs, and persisted recommendation state still require the backend services described in the PRD: FastAPI, PostgreSQL/TimescaleDB, cloud connectors, emissions workers, and auth provider integration.
