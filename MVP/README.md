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

- Analyzing (prototype rules, demonstration mode)
- Guidance Result (`suitable` / `borderline` / `escalate`)
- Weather Snapshot (demonstration context only)
- Source Details
- Assumptions
- Safety and Expert Support

## Rules-first architecture

```text
Validated farm input
  → Prototype rules engine
  → Fixed classification
  → Template explanation generator
  → Structured guidance result
```

Service interfaces:

- `GuidanceService` → `PrototypeGuidanceService`
- `WeatherService` → `DemoWeatherService`
- `SupportContactService` → `PlaceholderSupportContactService`

The explanation layer can explain a result but **cannot change** the rules-engine classification.

## Classifications

- **suitable** — stated conditions satisfy the provisional prototype rules enough to present mung bean as an option to consider
- **borderline** — some support exists, but risks or uncertainty require caution
- **escalate** — missing critical information, substantial uncertainty, or conditions that need professional/local verification

## Demonstration weather

Weather is supporting context only. The current frontend uses clearly labeled **demonstration** weather. It does not claim live Roi Et conditions, retrieval timestamps, or connected agencies.

## Session storage

- Progress is stored in `sessionStorage` only
- Language preference is remembered for the browser session
- Outdated v1 payloads are migrated or ignored safely
- **Clear My Information** asks for confirmation before wiping progress

## Prototype limitations

- Guidance is prototype-only and labeled as non-live advice
- Planting-window months are provisional demonstration assumptions
- Verified agricultural sources are not connected
- Expert contact details are not connected
- No live AI, live weather API, soil database, n8n, login, or permanent profile

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

## Future n8n integration

1. Create an n8n webhook that accepts `FarmAssessmentInput`
2. Keep rules-first classification authoritative
3. Optionally use an LLM only to phrase the already-fixed classification
4. Implement `GuidanceService` against the webhook and replace `PrototypeGuidanceService`
5. Keep prototype labeling until verified sources and contacts are connected
