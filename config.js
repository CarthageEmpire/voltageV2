/**
 * ============================================================
 *  VOLTAGE — config.js
 *  Frontend configuration file.
 *
 *  HOW TO USE:
 *  1. Copy values from your .env file into this file manually.
 *  2. Never commit this file with real keys to a public repo.
 *     Add config.js to your .gitignore if needed.
 *  ============================================================
 *
 *  SECURITY NOTICE:
 *  API keys placed in frontend JS are visible to anyone who
 *  views the page source. To limit abuse:
 *    - Restrict your Firebase API key to specific domains in
 *      Firebase Console > Project Settings > API restrictions.
 *    - Keep Groq secrets in a server-side proxy for public deployments.
 *    - Set Firestore Security Rules to allow only authenticated
 *      users to read/write their own data.
 */

const CONFIG = {
  // ----------------------------------------------------------
  // AI provider settings
  // Powered by Groq via the OpenAI-compatible chat endpoint.
  // For public deployment, set AI_PROXY_URL to your serverless proxy
  // and keep AI_API_KEY as a placeholder in this file.
  // For local development, put the real AI_API_KEY in config.local.js.
  // ----------------------------------------------------------
  AI_API_KEY: "your_groq_api_key_here",

  AI_PROXY_URL: "https://lively-band-ab58.midou-skhiri000.workers.dev",

  // ----------------------------------------------------------
  // Firebase Configuration
  // From .env: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, etc. -> paste into FIREBASE below.
  // All values must come from the SAME Firebase project (Console -> Project settings).
  // Google sign-in: enable the Google provider (Authentication -> Sign-in method).
  // Add your hosting domain under Authentication -> Settings -> Authorized domains.
  //
  // firestoreDatabaseId: omit or use "(default)" - this app uses the default Firestore
  // database via the compat SDK. Named databases need the modular SDK.
  // ----------------------------------------------------------
  FIREBASE: {
  apiKey: "AIzaSyCFfQ-LL9_lNHB5HYtCKTIGno3HMc4RrwM",
  authDomain: "sunstone2-766d9.firebaseapp.com",
  projectId: "sunstone2-766d9",
  storageBucket: "sunstone2-766d9.firebasestorage.app",
  messagingSenderId: "561580634594",
  appId: "1:561580634594:web:99f4ff0354e5f04ca1c9bb"
  }
};
