# stocktrace-web

Web UI for [stocktrace](https://github.com/sivaramc/stocktrace). Built with Vite + React 19 + TypeScript + Tailwind v4 + TanStack Query + React Router.

## Features

- **Auth**: self-service registration with optional Zerodha / 5paisa broker credentials; login returns a stocktrace JWT; admin activates accounts before the user can log in.
- **Admin**: user list with activate / deactivate / change role.
- **TradeOn**: per-broker session exchange modal. Zerodha takes a `request_token` from the Kite login redirect, 5paisa takes a TOTP + PIN.
- **Stocks**: live feed from the backend SSE stream (`/api/feed/stocks`), with BUY / SELL buttons that place owner-scoped orders on the user's own broker accounts.

## Development

```bash
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and proxies `/api/**` and `/actuator/**` to the stocktrace backend at http://localhost:8080. Start the backend (`cd ../stocktrace && mvn spring-boot:run`) first.

### Environment

Production builds read `VITE_API_BASE_URL` from the environment. In dev this is blank and the Vite proxy handles CORS.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start Vite dev server on :5173 |
| `npm run build` | Type-check then build to `dist/` |
| `npm run typecheck` | Just the TypeScript compiler, no emit |
| `npm run lint` | ESLint |
| `npm run preview` | Preview the production build |
