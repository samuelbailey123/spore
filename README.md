# Spore

![Coverage](https://img.shields.io/badge/coverage-99%25-brightgreen)

Pollen intelligence dashboard providing real-time pollen data, forecasts, species breakdowns, and health recommendations. Built with Next.js and powered by Google Pollen API and Ambee.

**Live:** [spore.decimahosted.com](https://spore.decimahosted.com)

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4, CVA, tailwind-merge
- **Charts:** Recharts
- **Data Fetching:** SWR
- **Testing:** Vitest + Testing Library (99%+ coverage)
- **Deployment:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `GOOGLE_POLLEN_API_KEY` | Google Pollen API key |
| `AMBEE_API_KEY` | Ambee Pollen API key |

## Testing

```bash
npm test              # Run tests
npm run test:coverage # Run with coverage report
```

Coverage thresholds enforced at 99% for statements, functions, and lines; 98% for branches.

## Project Structure

```
src/
  app/          # Next.js App Router pages and API routes
  components/   # React components (dashboard, forecast, species, layout, ui)
  context/      # React context providers (location)
  hooks/        # SWR data fetching hooks
  lib/          # API clients, pollen merge logic, utilities
  types/        # TypeScript type definitions
```
