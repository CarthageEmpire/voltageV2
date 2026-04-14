# Voltage (Sunstone Fitness Dashboard)

A single-page fitness dashboard with Firebase auth/data and AI-powered assistance.

## Files

- `index.html` - app markup
- `style.css` - app styles
- `script.js` - app logic
- `config.js` - frontend configuration (API and Firebase settings)
- `config.local.js` - local secret overrides (ignored by git)
- `.env.example` - sample local environment values

## Quick Start

1. Open `config.js` and keep placeholder values committed.
2. Put your real `AI_API_KEY` in `config.local.js`.
3. Fill the `FIREBASE` object in `config.js` with values from your Firebase project.
4. Open `index.html` in a browser or serve the folder with a static server.

## Public URL (GitHub Pages) With Real AI

For public deployment, do not expose your Groq key in frontend files.

1. Deploy a small serverless proxy using `proxy/cloudflare-worker.js`.
2. Set your secret in the worker environment (`GROQ_API_KEY`).
3. Put your worker URL in `config.js` as `AI_PROXY_URL`.
4. Keep `AI_API_KEY` in `config.js` as a placeholder.

If `AI_PROXY_URL` is empty and no local key is present, Tito runs in demo fallback mode.

## Security Notes

- Do not commit real API keys.
- Keep `config.js` values as placeholders in version control.
- Keep `config.local.js` in `.gitignore`.
- Use `AI_PROXY_URL` for public deployments so keys stay server-side.
- Restrict API keys in provider dashboards (domain and API restrictions).
- Use strict Firestore Security Rules.

## Environment Template

Use `.env.example` as a source of placeholder values. This frontend reads from `config.js`, not directly from `.env`.
