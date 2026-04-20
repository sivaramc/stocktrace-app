# Releasing stocktrace to Google Play

One-time + per-release checklist for shipping `@stocktrace/mobile` as an Android
app on the Play Store.

## One-time setup

### 1. Google Play Console
1. Pay the $25 registration fee at https://play.google.com/console.
2. Complete identity verification (may take a few days).
3. Create a new app:
   - **App name**: stocktrace
   - **Default language**: English (India)
   - **App or game**: App
   - **Free or paid**: Free
4. Under **Setup → App integrity → Play App Signing**, accept Play App Signing
   (Google holds the app-signing key; EAS holds the upload key).

### 2. EAS / Expo
1. Create an Expo account at https://expo.dev.
2. Run `npx eas-cli@latest login` locally (or in CI — see the workflow).
3. From `apps/mobile/`, run `npx eas-cli init` once to bind the project to an
   EAS project ID. Replace the `PLACEHOLDER_SET_VIA_EAS_INIT` in
   `app.json` → `expo.extra.eas.projectId` with the value it prints.
4. Run `npx eas-cli credentials` → Android → production → **Generate a new
   Keystore**. EAS now manages your upload keystore.

### 3. GitHub secrets
Configure at `Settings → Secrets and variables → Actions`:

| Secret | Where to get it |
|--------|-----------------|
| `EXPO_TOKEN` | https://expo.dev/accounts/<you>/settings/access-tokens |
| `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` *(optional, enables auto-submit)* | Play Console → **Setup → API access** → create service account with **Release manager** role, then download the JSON key. |

Without the Play service-account secret, the workflow only builds the AAB;
you'll download it from `https://expo.dev/accounts/<you>/projects/stocktrace-mobile/builds`
and upload manually in Play Console.

### 4. Play Store listing (manual, one-time)
Still in Play Console, fill in:

- **Store listing**: short + full description, phone + 7" tablet screenshots,
  1024×500 feature graphic, 512×512 app icon.
- **Privacy policy URL**:
  `https://sivaramc.github.io/stocktrace-app/privacy/`
  (deployed automatically from `docs/privacy-policy.md` by the
  `pages.yml` workflow — enable GitHub Pages under repo settings, source =
  "GitHub Actions").
- **Content rating** questionnaire.
- **Data safety** form — see the matrix in `docs/privacy-policy.md`; declare
  the same data categories there.
- **Target audience**: 18+ (app deals with financial trading).

## Each release

1. Bump `versionCode` (integer, incremented every build) and `version`
   (string, human-readable, bumped on user-facing releases) in
   `apps/mobile/app.json`.
2. Commit, push, merge to `main`.
3. Tag and push:
   ```bash
   git tag mobile-v0.1.0
   git push --tags
   ```
   This triggers `.github/workflows/mobile-release.yml`:
   - `build` — `eas build --profile production` on EAS servers (~15 min).
   - `submit` — uploads to the **Internal testing** track as a **draft**
     release (only runs if `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` is set).
4. Open Play Console → Internal testing → review the draft → **Start
   rollout**.
5. Install via the Internal testing opt-in URL, verify on a real device, then
   **Promote release** to Closed testing → Production.

## Local build (no CI)

```bash
cd apps/mobile
npx eas-cli@latest login
npx eas-cli build --platform android --profile production   # AAB for Play
npx eas-cli build --platform android --profile preview      # APK for sideload
```

## API base URL

The app reads `EXPO_PUBLIC_API_BASE_URL` at build time (see
`eas.json`). Production builds currently point at `https://api.stocktrace.in`.
Change the URL in `eas.json` if you deploy the backend elsewhere — a full
rebuild is required because the value is inlined into the bundle.

## Troubleshooting

- **`eas build` fails resolving `@stocktrace/core`** — EAS handles npm
  workspaces automatically, but make sure `packages/core` is listed in the root
  `package.json` workspaces and that `npm ci` at the repo root succeeds locally.
- **Play Console rejects upload** — usually due to a `versionCode` collision.
  Bump `versionCode` in `app.json` and rebuild.
- **Target SDK too low** — Expo SDK 54 targets Android 15 / SDK 35, which
  satisfies Google Play's current minimum. If Play warns about it in the
  future, upgrade Expo SDK in `apps/mobile/package.json`.
