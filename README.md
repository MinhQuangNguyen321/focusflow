# FocusFlow

FocusFlow is a modern productivity web app built with React and Vite to manage tasks, notes, events, and focus sessions in one streamlined workspace.

![React](https://img.shields.io/badge/React-18-61dafb?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Cloud-ffca28?logo=firebase&logoColor=black)
![PWA](https://img.shields.io/badge/PWA-Enabled-0f172a)
![License](https://img.shields.io/badge/License-MIT-green)

## Live Demo

- Production: https://minhquangnguyen321.github.io/focusflow/

## Product Preview

![FocusFlow Dashboard Guide](public/previews/dashboard-overview.png)
![FocusFlow Dashboard Main](public/previews/dashboard-main.png)

## Key Features

- Smart dashboard with real-time productivity overview
- AI assistant flow for creating tasks and events from natural language
- Task and note management with clean UX and fast interactions
- Focus mode timer for deep-work sessions
- Optional Google Calendar integration
- PWA-ready installable web experience
- Bilingual-ready UX foundation (English and Vietnamese)

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS
- Framer Motion
- Firebase
- Google OAuth
- vite-plugin-pwa

## Project Structure

```text
public/
  previews/             README preview visuals
  favicon.svg           App icon
src/
  components/           Feature and UI components
  lib/                  Shared utilities (i18n, firebase)
  pages/                Main app pages
index.html              Application shell
vite.config.js          Vite + PWA configuration
```

## Quick Start

### 1. Clone repository

```bash
git clone https://github.com/MinhQuangNguyen321/focusflow.git
cd ai-todo
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create local environment file

```bash
cp .env.example .env.local
```

Required environment variables:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Optional environment variables:

```env
VITE_GOOGLE_CLIENT_ID=
```

Gemini integration note:

- Do not set `VITE_GEMINI_API_KEY` for production static deployments.
- Enter Gemini key at runtime in Settings instead. The app stores it in `sessionStorage` only and does not sync it to Firestore.
- For real production usage, route Gemini calls through a backend/serverless proxy.

### 4. Run in development

```bash
npm run dev
```

## Scripts

```bash
npm run dev       # Run local dev server
npm run build     # Build production bundle
npm run preview   # Preview production build locally
npm run security:check-secrets  # Scan src/dist for exposed API keys
npm run deploy    # Publish dist to GitHub Pages
npm run lint      # Run ESLint
```

`npm run deploy` now runs an automatic secret scan after build and blocks deployment if a key-like value is found.

## Deployment (GitHub Pages)

- Deploy target branch: gh-pages
- Base path: /focusflow/
- Auto deploy on push to main via GitHub Actions

Workflow:

- Push code to `main`
- GitHub Actions builds the app
- The generated `dist` folder is published to `gh-pages`

Manual deploy command:

```bash
npm run deploy
```

If the site appears blank after deployment:

- Hard refresh with Ctrl + F5
- Test in Incognito mode
- Confirm latest gh-pages commit is published
- Verify assets resolve from /focusflow/assets/

## Security Notes

- Never commit .env.local
- Treat API keys as secrets
- For production-grade Gemini integration, use a backend or serverless proxy to protect keys

## Known Build Notes

- Current build may show duplicate-key warnings in src/lib/i18n.jsx
- Keep translation keys unique to avoid warning noise

## Roadmap

- Secure server-side AI gateway
- Better code splitting for smaller bundles
- Richer analytics and reporting widgets
- Expanded test coverage

## Changelog

### v0.3.0 - 2026-04-05

- Rebranded app identity from AI Todo to FocusFlow
- Updated GitHub Pages base path to /focusflow/
- Improved README with bilingual documentation and visual previews

### v0.2.0 - 2026-04-05

- Added Gemini-powered AI assistant integration
- Expanded dashboard and feature-level UI updates

### v0.1.0 - Initial release

- Core productivity workspace with tasks, notes, calendar, and focus mode

## Author

Minh Quang Nguyen

## License

This project is licensed under the MIT License.
See LICENSE for full terms.
