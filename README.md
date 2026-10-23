# MindMatrix.ai

**An AI-assisted wellbeing companion prototype.**

MindMatrix.ai explores text- and voice-based wellbeing check-ins, AI-generated reflections, conversational personas, saved analysis history, and wellness-trend views. The current repository contains a React/TypeScript interface and Gemini-backed service functions; this README describes the code structure, not a clinical or production-readiness certification.

> **Project status:** Prototype / in development. The connected repository has no `test` script in `package.json`, and a build has not been executed as part of this documentation update.

## Features represented in the source

- **Text and voice check-ins:** the main application supports text input and a voice-recording flow.
- **AI-assisted reflections:** the Gemini service requests structured results such as a mood label, estimated stress level, short summary, coping suggestions, response text, and a risk flag.
- **Multilingual interaction:** service logic includes English, Hindi, and Marathi response selection.
- **Conversational UI:** persona-based chat components and a check-in assistant.
- **History and trends:** saved analysis history and wellness-trend interface components.
- **Local preferences:** light/dark theme preference is stored in browser local storage.
- **Nearby resources:** a location-based resource lookup is defined in the Gemini service and depends on location permission and external service availability.

These features are visible in the source tree; not every user flow, generated result, or external-service response has been independently tested.

## Technology stack

| Area | Technology |
| --- | --- |
| UI | React 19, TypeScript |
| Development/build | Vite |
| Generative AI | Google GenAI SDK / Gemini API |
| Charts | Recharts |
| Icons | Lucide React |

## Run locally

### Prerequisites

- A current Node.js LTS release and npm.
- A Gemini API key for AI-backed features.

### Setup

1. Clone this repository and open its root directory.
2. Install dependencies:

    npm install

3. Create a local `.env.local` file in the repository root with your development key:

    GEMINI_API_KEY=replace_with_your_own_key

4. Start the development server:

    npm run dev

5. Create a production bundle locally:

    npm run build

6. Preview the built bundle:

    npm run preview

The Vite configuration sets the development server to port 3000. Build/runtime behavior has not been independently verified during this README update.

## Important security note

The current Vite configuration injects `GEMINI_API_KEY` into a client-side `process.env.API_KEY` definition, which means a key used for a built web app may be recoverable from the browser bundle. Treat this as a local prototype configuration, not a safe pattern for a publicly deployed application using a private or privileged API key.

For production, move Gemini calls to a trusted backend or serverless endpoint that stores the key server-side, adds appropriate authentication and rate limits, and avoids exposing the secret to browsers. If a real key has already been included in a public build or repository, revoke or rotate it and review usage.

## Privacy and wellbeing limitations

- User-provided text or recorded audio may be sent to Gemini when AI-backed functions are invoked. Review the provider's data handling and do not submit sensitive personal information unless you have assessed that flow.
- Generated mood and stress labels are model-generated estimates, not clinical assessments, diagnoses, or validated measurements.
- Coping suggestions and risk labels can be incomplete or wrong. Do not rely on this prototype for emergency response or as a replacement for qualified professional support.
- Location-based resource results depend on permission, external APIs, location accuracy, and source quality. Verify resources independently.

## Repository map

- `App.tsx` — main UI state, analysis workflow, history, theme, and navigation logic.
- `components/` — landing, login, recorder, analysis result, chat, check-in, and trends components.
- `services/gemini.ts` — Gemini-backed analysis, chat, transcription, speech generation, and resource lookup functions.
- `services/storage.ts` — local storage abstraction used by the UI.
- `types.ts` — shared TypeScript models and UI-state definitions.
- `vite.config.ts` — Vite dev-server settings and current environment-variable injection behavior.

## Verification status

- `npm run dev`, `npm run build`, and `npm run preview` are defined in `package.json`.
- No automated test script is defined in the current `package.json`.
- This documentation review did not execute the build, run the UI, test Gemini requests, or verify deployed behavior.

## Next steps

1. Move AI requests behind a server-side boundary before public deployment.
2. Add an example configuration file containing placeholders only and ensure real `.env*` files remain untracked.
3. Add a test script and test input validation, service failures, history persistence, and privacy-sensitive flows.
4. Add screenshots and a verified demo only after checking that no private key is present in client assets.

---

MindMatrix.ai is an evolving project. Please distinguish implemented source, configured integrations, and behavior that has been tested in a running environment.