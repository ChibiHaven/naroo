# NaRoo AI Farming Advisor — Revised Frontend MVP

NaRoo helps a **rice farmer in Roi Et** assess whether planting **mung bean after the major rice harvest** may be suitable under the farmer’s stated field, timing, water, drainage, and soil conditions.

This is a focused decision-support prototype. It is **not** a general crop-selection platform and does **not** include price, market, buyer-offer, or profit features.

## Supported decision

> Should a rice farmer in Roi Et plant mung bean after the major rice harvest under the stated field, water, drainage, timing, and soil conditions?

Geographic scope: **Roi Et Province only**  
Supported post-rice crop: **mung bean only**

## Three-step input flow

1. **Farm and location** — province (locked to Roi Et), district, field type, previous crop  
2. **Timing and water** — planned mung-bean planting month, water/moisture, drainage  
3. **Field details and summary** — area (rai), soil knowledge, primary goal, review card

Then:

- Analyzing (live n8n guidance request; may take up to about one minute)
- Guidance Result (`suitable` / `borderline` / `escalate`)
- Weather Snapshot (from the n8n response when available)
- Source Details
- Assumptions
- Safety and Expert Support

## Live guidance service

Production analysis uses the n8n webhook. Local rules are **not** used as a fallback.

```text
Validated farm input
  → POST VITE_N8N_WEBHOOK_URL
  → Runtime validation of the n8n response
  → Guidance result, weather, and AI explanation from the server
```

Configure the public webhook URL (not a secret):

```bash
# Copy MVP/.env.example to MVP/.env.local for local development
VITE_N8N_WEBHOOK_URL=https://chibihaven.app.n8n.cloud/webhook/naroo-guidance
```

`.env.local` is Git-ignored. GitHub Pages builds set the same `VITE_N8N_WEBHOOK_URL` in the workflow environment.

Service interfaces:

- `GuidanceService` → `N8nGuidanceService` (production)
- `WeatherService` → weather is taken from the n8n response; `DemoWeatherService` is not used for a completed live assessment
- `SupportContactService` → `PlaceholderSupportContactService`

The explanation text can describe a result but **cannot change** the server classification. If the webhook is missing or the request fails, the app shows an error with Retry and Edit answers — it does not calculate a local answer.

## Classifications

- **suitable** — stated conditions satisfy the provisional prototype rules enough to present mung bean as an option to consider
- **borderline** — some support exists, but risks or uncertainty require caution
- **escalate** — missing critical information, substantial uncertainty, or conditions that need professional/local verification

## Demonstration and live weather

Weather is supporting context only. A completed live assessment uses `response.weather` from n8n (Open-Meteo). If weather is unavailable, the app shows that state and does not invent measurements or call a second weather API.

Static assumptions, limitations, and agricultural reference sources remain local prototype content and are labeled as such.

## Session storage

- Progress is stored in `sessionStorage` only
- Successful n8n results are stored separately and restored on refresh without calling n8n again or replaying local rules
- Changing answers or starting a new assessment invalidates the saved result
- Language preference is remembered for the browser session
- Outdated v1 payloads are migrated or ignored safely
- **Clear My Information** asks for confirmation before wiping progress

## Prototype limitations

- Guidance is still labeled as prototype decision support, not live agronomic advice
- Planting-window months remain provisional demonstration assumptions in the static reference content
- Verified agricultural databases (beyond the n8n weather payload) are not connected
- Expert contact details are not connected
- No login or permanent profile

## Professional-advice disclaimer

This tool provides decision support only and does not replace advice from agricultural professionals.

## Commands

```bash
cd MVP
npm install
npm run dev
npm test
npm run typecheck
npm run lint
npm run build
npm run preview
```

## GitHub Pages

The app uses `base: './'` and `HashRouter`, so static hosting works with routes such as `/#/assessment/step-1`.

Build with `npm run build` and publish the `dist/` folder.

The GitHub Actions workflow injects `VITE_N8N_WEBHOOK_URL` at build time so the hosted app can call the public webhook.
