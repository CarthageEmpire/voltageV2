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
 *    - Restrict your Gemini API key in Google AI Studio /
 *      Google Cloud Console under API restrictions.
 *    - Set Firestore Security Rules to allow only authenticated
 *      users to read/write their own data.
 */

const CONFIG = {
  // ----------------------------------------------------------
  // AI provider settings
  // Powered by Groq via the OpenAI-compatible chat endpoint.
  // Get your free key at: https://console.groq.com
  // Paste it below as AI_API_KEY.
  // For public deployment, set AI_PROXY_URL to your serverless proxy
  // and keep AI_API_KEY as a placeholder in this file.
  // ----------------------------------------------------------
 AI_API_KEY: "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",
 
  AI_PROXY_URL: "https://jolly-union-0159.midou-skhiri000.workers.dev",

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
  apiKey: "AIzaSyD8wlQKmUCTENHoPbb0Leq9Z1luZUfNN6M",
  authDomain: "gen-lang-client-0476894197.firebaseapp.com",
  projectId: "gen-lang-client-0476894197",
  storageBucket: "gen-lang-client-0476894197.firebasestorage.app",
  messagingSenderId: "509380570266",
  appId: "1:509380570266:web:f22eb02c01cd5b51ac0323"
  }
};
