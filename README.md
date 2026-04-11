<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/540d14fe-fc61-4493-abf7-68c9c7e9e6d1

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to GitHub Pages

This repo now includes an automatic Pages workflow at [.github/workflows/deploy-pages.yml](.github/workflows/deploy-pages.yml).

1. In GitHub, open **Settings -> Pages**.
2. Set **Source** to **GitHub Actions**.
3. (Optional but recommended) Add a repository secret named `GEMINI_API_KEY` in **Settings -> Secrets and variables -> Actions**.
4. Push to `main` (or run the workflow manually from **Actions**).

Notes:
- The workflow builds with `BASE_PATH=/<repo-name>/`, which is required for project pages URLs.
- If `GEMINI_API_KEY` is not configured, the app still deploys, but AI chat features that depend on Gemini requests may fail.
