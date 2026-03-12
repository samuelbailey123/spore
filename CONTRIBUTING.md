# Contributing to Spore

Thanks for your interest in contributing to Spore! This guide will help you get started.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/spore.git`
3. Install dependencies: `npm install`
4. Copy the environment file: `cp .env.example .env.local`
5. Add your API keys to `.env.local` (see [Environment Variables](#environment-variables))
6. Start the dev server: `npm run dev`

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GOOGLE_POLLEN_API_KEY` | Yes | [Google Pollen API](https://developers.google.com/maps/documentation/pollen) key |
| `AMBEE_API_KEY` | Optional | [Ambee](https://www.getambee.com/) API key (enables historical trends) |
| `NEXT_PUBLIC_DEFAULT_LAT` | No | Default latitude (defaults to Houston, TX) |
| `NEXT_PUBLIC_DEFAULT_LNG` | No | Default longitude (defaults to Houston, TX) |
| `NEXT_PUBLIC_SITE_URL` | No | Public URL for OG metadata |

## Development Workflow

1. Create a branch for your change: `git checkout -b feat/your-feature`
2. Make your changes
3. Run tests: `npm test`
4. Run tests with coverage: `npm run test:coverage`
5. Ensure coverage stays at 99%+
6. Commit your changes with a clear message
7. Push and open a pull request

## Code Standards

- **TypeScript** — all code must be type-safe
- **Testing** — every new function/component needs tests, 99% coverage threshold enforced
- **Formatting** — follow existing code style
- **No hardcoded secrets** — use environment variables

## Reporting Issues

Open an issue with:
- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/OS if relevant

## Pull Requests

- Keep PRs focused on a single change
- Include tests for new functionality
- Update documentation if needed
- Ensure all tests pass before requesting review
