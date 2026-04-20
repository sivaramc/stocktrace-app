# stocktrace-app — running and smoke-testing locally

Use this skill whenever you need to bring up the monorepo and verify the web + mobile (Expo web) apps end-to-end in a browser.

## Layout

- `apps/web` — Vite + React 19 (dev server on `:5173`, proxies `/api` → `:8080`)
- `apps/mobile` — Expo SDK 54 + Expo Router + React Native 0.81 (Metro web bundle on `:19006`)
- `packages/core` — shared types, axios client, `AuthStore`, SSE parser (consumed as `@stocktrace/core`)
- Backend lives in the sibling `sivaramc/stocktrace` Spring Boot repo

## Startup order

1. **Backend** — in `sivaramc/stocktrace`: `./mvnw spring-boot:run` (profile `dev`, H2 file DB). Listens on `:8080`.
2. **Install** — from repo root: `npm install` (uses npm workspaces, installs all three packages).
3. **Web** — `npm --workspace apps/web run dev` (Vite, `:5173`).
4. **Mobile web** — `npx --prefix apps/mobile expo start --web --port 19006`.
   - If you just ran `npm install` or otherwise changed the lockfile, use `--clear` and nuke caches first (see Metro gotcha below).

## Seeded admin

- Email: `admin@stocktrace.local`
- Password: `admin12345`
- JWT TTL: 28800 s (8 h). Storage keys used by `AuthStore`: `stocktrace.jwt`, `stocktrace.me`.

## Smoke-test flow (web + mobile web are mirrored)

1. Load `/login` on each app → 0 console errors.
2. Sign in as admin → lands on `/stocks` (web) or `/(app)/stocks` (mobile).
3. Fire a Chartink alert:
   ```bash
   curl -X POST http://localhost:8080/api/webhook/chartink \
     -H 'Content-Type: application/json' \
     -d '{"stocks":"INFY","trigger_prices":"1500.00","scan_name":"smoke","alert_name":"smoke"}'
   ```
   A `BUY` tile should appear on both `/stocks` views within ~2 s via SSE (`GET /api/feed/stocks`).
4. Click `TradeOn` → modal (web) / bottom sheet (mobile) opens with Zerodha/5paisa tabs disabled when no broker is linked. Close cleanly.
5. Full reload on `/stocks` — user should stay signed in (exercises `AuthStore.hydrate()`).

## Gotchas (these have bitten before)

### 1. Metro cache stalls after lockfile changes

Symptom: Expo web still throws `authStore.getSnapshot is not a function` or `Maximum update depth exceeded` even though the source is fixed. The Metro bundler caches aggressively in `apps/mobile/.expo` and `/tmp/metro-*` / `/tmp/haste-map-*`.

Fix:
```bash
rm -rf apps/mobile/.expo /tmp/metro-* /tmp/haste-map-*
npx --prefix apps/mobile expo start --web --port 19006 --clear
```
Always re-run with `--clear` after `npm install` changes something under `node_modules`.

### 2. Two React copies at runtime

Symptom: Either app crashes with `Cannot read properties of null (reading 'useMemo')` as soon as a component uses hooks.

Cause: npm hoisting picked up two different React versions because `apps/web/package.json` and `apps/mobile/package.json` disagreed. Expo SDK 54 is strict about the exact React version it ships with.

Fix: pin `react` and `react-dom` to the exact version Expo expects (currently `19.1.0`) in **every** workspace's `package.json`. Ranges like `^19.2.x` will re-introduce a second copy on the next install. Check with `npm ls react` from the repo root — expect a single version.

### 3. `useSyncExternalStore` snapshot stability

Symptom: `Maximum update depth exceeded` error, React stops rendering, the tab may freeze.

Cause: `getSnapshot()` returned a new tuple on every call; `useSyncExternalStore` uses `Object.is` to compare.

Fix: cache the snapshot inside the store and only re-allocate when state actually changes. See `packages/core/src/storage.ts` — `AuthStore.getSnapshot()` returns `this.snapshot`, which is replaced only in `hydrate` / `set` / `setUser` / `clear`. Both `AuthProvider`s must call `authStore.getSnapshot()` directly (do NOT build the tuple in the component).

### 4. Metro needs hierarchical node_modules lookup in this monorepo

`apps/mobile/metro.config.js` explicitly lists `nodeModulesPaths` but leaves hierarchical lookup **enabled**. Do not re-enable `config.resolver.disableHierarchicalLookup = true` — it breaks nested transitive deps like `react-native-reanimated`'s internal `semver` copy.

## Backend Chartink webhook payload shape

```json
{
  "stocks": "INFY",                  // comma-separated if multiple
  "trigger_prices": "1500.00",       // comma-separated, aligned with stocks
  "scan_name": "<any>",
  "alert_name": "<any>"
}
```
`POST /api/webhook/chartink` is intentionally `permitAll` (no JWT needed). `GET /api/feed/stocks` (SSE) does require a JWT.

## Devin Secrets Needed

None for the dev flow — the admin user is seeded at startup from `application-dev.yml` (`stocktrace.admin.email` / `stocktrace.admin.password`). Real Kite Connect / 5paisa credentials are only needed if you're exercising the `TradeOn` sessions end-to-end with a real broker, which is out of scope for browser smoke-testing.
