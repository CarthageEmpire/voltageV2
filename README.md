# Voltage (Sunstone Fitness Dashboard)

A single-page fitness dashboard with Firebase auth/data and AI-powered assistance.

## Files

- `index.html` - app markup
- `style.css` - app styles
- `script.js` - app logic
- `config.js` - frontend configuration (API and Firebase settings)
- `.env.example` - sample local environment values

## Quick Start

1. Open `config.js`.
2. Set `AI_API_KEY` with your Groq API key.
3. Fill the `FIREBASE` object with values from your Firebase project.
4. Open `index.html` in a browser or serve the folder with a static server.

## Security Notes

- Do not commit real API keys.
- Keep `config.js` values as placeholders in version control.
- Restrict API keys in provider dashboards (domain and API restrictions).
- Use strict Firestore Security Rules.

## Environment Template

Use `.env.example` as a source of placeholder values. This frontend reads from `config.js`, not directly from `.env`.
