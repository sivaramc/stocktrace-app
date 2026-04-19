# stocktrace-app

Monorepo for the stocktrace client apps. Shares types, API client, auth state and the SSE event parser between web and mobile so a single change updates both apps.

## Layout

```
packages/
  core/              # @stocktrace/core — platform-agnostic types, axios client,
                     # auth token store, SSE event parser, trade helpers
apps/
  web/               # @stocktrace/web — Vite + React 19 + Tailwind v4
  mobile/            # @stocktrace/mobile — Expo + Expo Router + React Native
```

The paired Spring Boot backend is [sivaramc/stocktrace](https://github.com/sivaramc/stocktrace). Run it on `http://localhost:8080` first; both apps proxy `/api` to it in dev.

## Quickstart

```bash
npm install
npm run build:core        # emit packages/core/dist for web + mobile
npm run dev:web           # http://localhost:5173 (Vite proxy → :8080)
npm run dev:mobile        # Expo dev server (scan the QR with Expo Go)
```

## Checks

```bash
npm run lint              # core + web + mobile
npm run typecheck         # core + web + mobile
npm run build             # core + web bundle
```

CI at `.github/workflows/ci.yml` runs lint + typecheck + build on every PR.
