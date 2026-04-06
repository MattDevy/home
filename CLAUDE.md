# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A personal developer homepage/portfolio, deployed as a GitHub Pages static site. Built with Vite + React + TypeScript + TailwindCSS v4.

Live at: `https://mattdevy.github.io/home/`

## Commands

```bash
npm run dev           # Dev server (uses the committed repos.json placeholder)
npm run fetch-repos   # Fetch real repos from GitHub API → overwrites src/data/repos.json
npm run build         # fetch-repos + tsc + vite build (requires GITHUB_TOKEN env var)
npm run build:ci      # tsc + vite build only (CI fetches repos separately)
npm run preview       # Preview the built site at http://localhost:4173/home/
npm run lint          # TypeScript type-check only (tsc --noEmit)
```

For local dev with real repo data:
```bash
GITHUB_TOKEN=<your-pat> npm run fetch-repos
npm run dev
```

## Architecture

**Repository data flow:**
- `scripts/fetch-repos.ts` — runs at build time, calls the GitHub API (`GITHUB_TOKEN` + `GITHUB_USERNAME=MattDevy`), writes public non-fork repos sorted by stars to `src/data/repos.json`.
- `src/data/repos.json` — committed as a placeholder; overwritten by CI before build. Never committed back to the repo from CI.
- `App.tsx` — statically imports `repos.json` so data is baked into the bundle (no client-side API calls).

**Personalisation:**
- `src/config.ts` — single source of truth for name, title, bio, social links, and an optional `featuredRepos` list (repo slugs) to control ordering in the grid.

**Components:**
- `Hero` — name, title, bio, social icon links
- `RepoGrid` — responsive 1→2→3 column card grid; respects `featuredRepos` ordering
- `RepoCard` — repo name (linked), description, language dot, star/fork counts, topic tags
- `Footer` — copyright + optional "Buy Me a Coffee" link (shown when `buyMeACoffee` is set in config)

**Deployment:**
- `.github/workflows/deploy.yml` — triggers on push to `main`: installs deps → fetches repos → builds → deploys to GitHub Pages via `actions/deploy-pages`.
- GitHub Pages must be enabled once manually: Settings → Pages → Source: **GitHub Actions**.

**Vite base URL:**
- Currently `/home/` (matches repo name). Change `base` in `vite.config.ts` if repo is renamed.
