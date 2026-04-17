/**
 * ============================================================
 *  VOLTAGE — script.js
 *  All application logic in vanilla JavaScript.
 *
 *  Sections:
 *   1. Constants & Data
 *   2. App State
 *   3. Firebase Initialisation
 *   4. Auth Logic
 *   5. Firestore Sync
 *   6. Navigation / Tabs
 *   7. Init Modal (Protocol Setup)
 *   8. Home Tab
 *   9. Workouts Tab
 *  10. Nutrition Tab
 *  11. Tracker Tab
 *  12. Habits Tab
 *  13. Profile Tab
 *  14. Notifications
 *  15. Settings Drawer
 *  16. Macro Override Modal
 *  17. AI Chatbot (Google Gemini)
 *  18. Charts (Chart.js)
 *  19. Utility helpers
 *  20. Boot
 * ============================================================
 */

"use strict";

/* ============================================================
   1. CONSTANTS & DATA
   ============================================================ */

const BADGES = [
  { name: 'Initiate',  min: 0,     color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' },
  { name: 'Elite',     min: 750,   color: '#60a5fa', bg: 'rgba(96,165,250,0.1)'  },
  { name: 'Master',    min: 3000,  color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  { name: 'Legend',    min: 9000,  color: '#fbbf24', bg: 'rgba(251,191,36,0.1)'  },
  { name: 'Immortal',  min: 18000, color: '#ff9062', bg: 'rgba(255,144,98,0.1)'  },
  { name: 'Apex',      min: 39000, color: '#34d399', bg: 'rgba(52,211,153,0.1)'  },
];

const HABITS = [
  { id: 'gym',        name: 'Elite Training',        points: 35, icon: 'dumbbell',  description: 'Complete your daily workout protocol',    color: '#ff9062' },
  { id: 'protein',    name: 'Nutrition Target',      points: 30, icon: 'flame',     description: 'Hit your daily macro protocol',           color: '#f87171' },
  { id: 'no-junk',    name: 'Recovery',              points: 20, icon: 'moon',      description: 'Sleep target 7+',                         color: '#60a5fa' },
  { id: 'clean-eat',  name: 'Clean Fuel',            points: 20, icon: 'apple',     description: 'Zero processed foods or sugars',          color: '#4ade80' },
  { id: 'water',      name: 'Hydration',             points: 15, icon: 'droplets',  description: 'Minimum 3L of filtered water',            color: '#93c5fd' },
  { id: 'meditation', name: 'Non-Exercise Movement', points: 10, icon: 'activity',  description: '10k steps or active recovery',            color: '#6ee7b7' },
  { id: 'journal',    name: 'Mindset',               points: 10, icon: 'brain',     description: 'Daily reflection and planning',           color: '#fb923c' },
  { id: 'screen',     name: 'Digital Detox',         points: 10, icon: 'monitor',   description: 'Less than 2h recreational screen time',  color: '#818cf8' },
];

const MOODS = ['Happy', 'Neutral', 'Sad', 'Motivated', 'Tired', 'Sick'];

const NUTRITION_DATA = {
  lose: {
    title: "Fat Loss Plan - High Protein",
    meals: {
      "Breakfast":    [{ name: "Greek yogurt bowl + oats + berries",          calories: 350, protein: 30, carbs: 40, fats: 8  }],
      "Lunch":        [{ name: "Grilled chicken breast + quinoa + salad",     calories: 450, protein: 45, carbs: 35, fats: 12 }],
      "Pre-Workout":  [{ name: "Banana + whey protein shake",                 calories: 250, protein: 25, carbs: 30, fats: 2  }],
      "Post-Workout": [{ name: "Whey protein + 1 fruit",                      calories: 200, protein: 25, carbs: 25, fats: 1  }],
      "Dinner":       [{ name: "Baked salmon + steamed vegetables",           calories: 500, protein: 40, carbs: 15, fats: 25 }],
      "Snacks":       [{ name: "Cottage cheese or skyr",                      calories: 150, protein: 20, carbs: 10, fats: 2  }]
    }
  },
  gain: {
    title: "Muscle Gain Plan - Lean Bulk",
    meals: {
      "Breakfast":    [{ name: "Oats + banana + peanut butter + 3 eggs",      calories: 700, protein: 35, carbs: 80,  fats: 25 }],
      "Lunch":        [{ name: "Lean beef + jasmine rice + avocado",           calories: 850, protein: 50, carbs: 90,  fats: 30 }],
      "Pre-Workout":  [{ name: "Rice cakes + honey + whey",                   calories: 350, protein: 25, carbs: 60,  fats: 2  }],
      "Post-Workout": [{ name: "Chicken pasta + olive oil",                   calories: 800, protein: 45, carbs: 100, fats: 20 }],
      "Dinner":       [{ name: "Steak + sweet potato + greens",               calories: 750, protein: 55, carbs: 60,  fats: 35 }],
      "Snacks":       [{ name: "Greek yogurt + mixed nuts",                   calories: 300, protein: 20, carbs: 15,  fats: 18 }]
    }
  },
  health: {
    title: "Balanced Health Plan",
    meals: {
      "Breakfast":    [{ name: "Whole-grain toast + avocado + eggs",          calories: 450, protein: 20, carbs: 35, fats: 25 }],
      "Lunch":        [{ name: "Mediterranean bowl with chickpeas",           calories: 550, protein: 25, carbs: 65, fats: 20 }],
      "Pre-Workout":  [{ name: "Apple + almonds",                             calories: 200, protein: 5,  carbs: 25, fats: 12 }],
      "Post-Workout": [{ name: "Protein smoothie",                            calories: 300, protein: 30, carbs: 40, fats: 5  }],
      "Dinner":       [{ name: "Grilled white fish + brown rice",             calories: 450, protein: 35, carbs: 45, fats: 10 }],
      "Snacks":       [{ name: "Herbal tea + protein pudding",                calories: 150, protein: 15, carbs: 15, fats: 3  }]
    }
  }
};

const EXERCISE_DATA = {
  gym: {
    push: [
      { name: "Incline Bench Press",       sets: 4, reps: "8-10",  note: "Upper chest focus",    description: "Compound movement targeting upper pectorals and anterior deltoids." },
      { name: "Shoulder Press (Machine)",  sets: 3, reps: "10-12", note: "Keep core tight",       description: "Overhead press to build shoulder strength and stability." },
      { name: "Cable Chest Flyes",         sets: 3, reps: "15",    note: "Constant tension",      description: "Isolation exercise for chest definition and inner pectoral activation." },
      { name: "Tricep Pushdowns",          sets: 3, reps: "12-15", note: "Elbows tucked",         description: "Isolation for the triceps brachii using a cable machine." },
      { name: "Lateral Raises",            sets: 3, reps: "15",    note: "Control the weight",    description: "Isolation for the lateral deltoids to build shoulder width." }
    ],
    pull: [
      { name: "Lat Pulldowns",             sets: 4, reps: "10-12", note: "Squeeze shoulder blades", description: "Vertical pull targeting the latissimus dorsi for back width." },
      { name: "Seated Cable Rows",         sets: 3, reps: "10-12", note: "Pull to belly button",    description: "Horizontal pull targeting the mid-back and rhomboids for thickness." },
      { name: "Face Pulls",                sets: 3, reps: "15",    note: "Rear delt focus",          description: "Corrective exercise for rear deltoids and upper back health." },
      { name: "Hammer Curls",              sets: 3, reps: "12",    note: "Neutral grip",             description: "Bicep curl targeting the brachialis and brachioradialis." },
      { name: "Preacher Curls",            sets: 3, reps: "10",    note: "Full stretch",             description: "Strict bicep isolation to prevent momentum and maximize peak." }
    ],
    legs: [
      { name: "Leg Press",                 sets: 4, reps: "10-12", note: "Deep range of motion", description: "Compound leg movement targeting quads, glutes, and hamstrings." },
      { name: "Leg Extensions",            sets: 3, reps: "15",    note: "Squeeze at top",        description: "Isolation for the quadriceps to build definition." },
      { name: "Seated Leg Curls",          sets: 3, reps: "12",    note: "Control the eccentric", description: "Isolation for the hamstrings to build leg thickness." },
      { name: "Calf Raises (Machine)",     sets: 4, reps: "15-20", note: "Full stretch",          description: "Isolation for the gastrocnemius and soleus muscles." },
      { name: "Walking Lunges",            sets: 3, reps: "12/leg",note: "Balance focus",         description: "Unilateral compound movement for leg strength and stability." }
    ]
  },
  home: {
    push: [
      { name: "Push-ups",               sets: 3, reps: "12-15", note: "Chest to floor",          description: "Classic bodyweight movement for chest, shoulders, and triceps." },
      { name: "Diamond Push-ups",       sets: 3, reps: "10",    note: "Tricep focus",             description: "Narrow grip push-up variation to emphasize the triceps." },
      { name: "Pike Push-ups",          sets: 3, reps: "8-10",  note: "Shoulder focus",           description: "Bodyweight overhead press variation targeting the shoulders." },
      { name: "Dips (Chair)",           sets: 3, reps: "12",    note: "Keep back close to chair", description: "Tricep isolation using a stable elevated surface." },
      { name: "Plank Hold",             sets: 3, reps: "60s",   note: "Core tight",               description: "Isometric core stability exercise." }
    ],
    pull: [
      { name: "Inverted Rows (Table)",  sets: 3, reps: "10-12", note: "Pull chest to edge",  description: "Bodyweight horizontal pull for back and bicep strength." },
      { name: "Superman Holds",         sets: 3, reps: "30s",   note: "Lower back focus",    description: "Isometric exercise for the erector spinae and posterior chain." },
      { name: "Towel Bicep Curls",      sets: 3, reps: "15",    note: "Isolate the bicep",   description: "Using a towel for resistance to target the biceps." },
      { name: "Doorway Rows",           sets: 3, reps: "15",    note: "One arm at a time",   description: "Unilateral pull using a door frame for resistance." },
      { name: "Bird Dog",               sets: 3, reps: "12/side",note: "Stability focus",    description: "Core and posterior chain stability movement." }
    ],
    legs: [
      { name: "Bodyweight Squats",      sets: 3, reps: "20",    note: "Keep back straight",  description: "Fundamental lower body movement for quads and glutes." },
      { name: "Lunges",                 sets: 3, reps: "12/leg", note: "Controlled descent",  description: "Unilateral leg movement for strength and balance." },
      { name: "Glute Bridges",          sets: 3, reps: "15",    note: "Squeeze glutes",       description: "Isolation for the glutes and hamstrings." },
      { name: "Bulgarian Split Squats", sets: 3, reps: "10/leg", note: "Elevate back foot",   description: "Advanced unilateral movement for deep leg activation." },
      { name: "Calf Raises",            sets: 4, reps: "25",    note: "Slow and controlled",  description: "Bodyweight isolation for the calves." }
    ]
  }
};

/* ============================================================
   2. APP STATE
   ============================================================ */

const state = {
  // Auth
  user: null,
  isGuestMode: false,

  // Profile
  weight: 75,
  height: 175,
  age: 25,
  sex: 'Male',
  activityLevel: 'Moderately Active',
  goal: 'lose',
  athleteName: '',
  profilePhoto: null,
  isGenerated: false,
  isProfileLoaded: false,

  // Macros (null = auto-calculated)
  manualMacros: null,

  // Workout
  workoutEnv: 'gym',
  workoutSession: 'push',
  customExerciseData: JSON.parse(JSON.stringify(EXERCISE_DATA)),
  customNutritionData: JSON.parse(JSON.stringify(NUTRITION_DATA)),

  // Tracker / logs
  weightLogs: [],
  sleepLogs: [],
  gymLogs: [],
  nutritionLogs: [],

  // Habits (stored locally; synced to Firestore on auth)
  habits: {},       // key: "habitId-day" => boolean
  habitPoints: {},  // key: day => number
  mood: {},         // key: day => string

  // UI
  activeTab: 'home',
  theme: 'dark',
  isMuted: false,
  notifications: [],
  welcomeSent: false,
  aiNotifSent: false,

  // Chat
  chatMessages: [],

  // Charts (Chart.js instances)
  weightChartInstance: null,
  weightChartTrackerInstance: null,
  sleepChartInstance: null,
};

const DEFAULT_PROFILE_STATE = {
  weight: 75,
  height: 175,
  age: 25,
  sex: 'Male',
  activityLevel: 'Moderately Active',
  goal: 'lose',
  athleteName: '',
  profilePhoto: null,
};

let hydrationReminderIntervalId = null;
let aiNotificationTimeoutId = null;

/* ============================================================
   3. FIREBASE INITIALISATION
   ============================================================ */

if (!CONFIG?.FIREBASE?.apiKey) {
  console.error('config.js: set Firebase apiKey and other fields from your .env file.');
}

const app  = firebase.initializeApp(CONFIG.FIREBASE);
const auth = firebase.auth();
const db   = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch((err) => {
  console.error('[auth] Failed to enable LOCAL persistence:', err);
});

auth.getRedirectResult().catch((err) => {
  console.error('[auth] Redirect result error:', err);
  showAuthError('login', friendlyAuthError(err?.code, err?.message));
});

function refreshIcons() {
  if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
    lucide.createIcons();
  }
}

function debugLog(message, payload) {
  if (payload === undefined) {
    console.log(`[voltage] ${message}`);
    return;
  }
  console.log(`[voltage] ${message}`, payload);
}

/* ============================================================
   4. AUTH LOGIC
   ============================================================ */

function showScreen(id) {
  ['loading-screen','landing-page','auth-page','main-app'].forEach(s => {
    document.getElementById(s).style.display = (s === id) ? '' : 'none';
  });
  if (id === 'main-app') {
    setTimeout(() => refreshIcons(), 50);
  }
}

auth.onAuthStateChanged((user) => {
  state.user = user;
  if (user) {
    debugLog('Auth state changed: signed in', { uid: user.uid, email: user.email });
    showScreen('loading-screen');
    state.isGuestMode = false;
    loadFirestoreData().catch((err) => {
      console.error('[auth] Failed to hydrate Firestore state:', err);
      state.isProfileLoaded = true;
      state.isGenerated = false;
      state.athleteName = user.displayName || '';
      state.profilePhoto = user.photoURL || null;
      bootApp();
    });
    refreshIcons();
  } else if (state.isGuestMode) {
    debugLog('Auth state changed: guest mode active');
    showScreen('main-app');
    state.isProfileLoaded = true;
    refreshIcons();
  } else {
    debugLog('Auth state changed: signed out');
    showScreen('landing-page');
    refreshIcons();
  }
});

function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  provider.setCustomParameters({ prompt: 'select_account' });

  const btn = document.getElementById('google-signin-btn');
  if (btn) btn.disabled = true;

  auth.signInWithPopup(provider)
    .then(() => {})
    .catch(err => {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') return;
      if (err.code === 'auth/popup-blocked') return auth.signInWithRedirect(provider);
      showAuthError('login', friendlyAuthError(err.code, err.message));
    })
    .finally(() => { if (btn) btn.disabled = false; });
}

function emailSignIn(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {})
    .catch(err => showAuthError('login', friendlyAuthError(err.code, err.message)));
}

function emailRegister(name, email, password) {
  auth.createUserWithEmailAndPassword(email, password)
    .then(cred => cred.user.updateProfile({ displayName: name }))
    .catch(err => showAuthError('register', friendlyAuthError(err.code, err.message)));
}

function friendlyAuthError(code, fallbackMsg) {
  const map = {
    'auth/user-not-found':                          'No account found with that email.',
    'auth/wrong-password':                          'Incorrect password.',
    'auth/email-already-in-use':                    'Email is already registered.',
    'auth/weak-password':                           'Password must be at least 6 characters.',
    'auth/invalid-email':                           'Please enter a valid email address.',
    'auth/unauthorized-domain':                     'This domain is not authorized. Add it in Firebase Console under Authentication → Settings → Authorized domains.',
    'auth/operation-not-allowed':                   'This sign-in method is disabled in Firebase Console. Enable Google (or Email/Password) for your project.',
    'auth/network-request-failed':                  'Network error. Check your connection and try again.',
    'auth/account-exists-with-different-credential':'An account already exists with this email using a different sign-in method.',
    'auth/invalid-credential':                      'Sign-in failed. Check Firebase config and that Google sign-in is enabled.',
  };
  return map[code] || fallbackMsg || 'Authentication failed. Please try again.';
}

function showAuthError(form, msg) {
  const el = document.getElementById(`${form}-error`);
  if (!el) return;
  el.textContent = msg || '';
  el.style.display = msg ? 'block' : 'none';
}

function handleLogout() {
  unsubscribeAll();
  if (state.user) {
    auth.signOut().then(() => { resetState(); showScreen('landing-page'); });
  } else {
    resetState();
    showScreen('landing-page');
  }
}

function resetState() {
  state.user              = null;
  state.isGuestMode       = false;
  state.weight            = DEFAULT_PROFILE_STATE.weight;
  state.height            = DEFAULT_PROFILE_STATE.height;
  state.age               = DEFAULT_PROFILE_STATE.age;
  state.sex               = DEFAULT_PROFILE_STATE.sex;
  state.activityLevel     = DEFAULT_PROFILE_STATE.activityLevel;
  state.goal              = DEFAULT_PROFILE_STATE.goal;
  state.athleteName       = DEFAULT_PROFILE_STATE.athleteName;
  state.profilePhoto      = DEFAULT_PROFILE_STATE.profilePhoto;
  state.isGenerated       = false;
  state.isProfileLoaded   = false;
  state.welcomeSent       = false;
  state.aiNotifSent       = false;
  state.weightLogs        = [];
  state.sleepLogs         = [];
  state.gymLogs           = [];
  state.nutritionLogs     = [];
  state.habits            = {};
  state.habitPoints       = {};
  state.mood              = {};
  state.notifications     = [];
  state.chatMessages      = [];
  state.manualMacros      = null;
  state.activeTab         = 'home';
  state.customExerciseData  = JSON.parse(JSON.stringify(EXERCISE_DATA));
  state.customNutritionData = JSON.parse(JSON.stringify(NUTRITION_DATA));

  if (aiNotificationTimeoutId) {
    clearTimeout(aiNotificationTimeoutId);
    aiNotificationTimeoutId = null;
  }
  if (hydrationReminderIntervalId) {
    clearInterval(hydrationReminderIntervalId);
    hydrationReminderIntervalId = null;
  }

  const avatarImg  = document.getElementById('topbar-avatar-img');
  const avatarIcon = document.getElementById('topbar-avatar-icon');
  if (avatarImg) {
    avatarImg.src = '';
    avatarImg.style.display = 'none';
  }
  if (avatarIcon) avatarIcon.style.display = '';
}

/* ============================================================
   5. FIRESTORE SYNC
   ============================================================ */

let firestoreUnsubs = [];

function hasSavedProfileData(data) {
  if (!data || typeof data !== 'object') return false;
  return [
    data.goal,
    data.startWeight,
    data.height,
    data.age,
    data.activityLevel,
    data.customExerciseData,
    data.customNutritionData,
    data.manualMacros
  ].some(value => value !== undefined && value !== null && value !== '');
}

function buildInitialUserDoc(user) {
  return {
    uid: user.uid,
    email: user.email || '',
    name: user.displayName || '',
    photoURL: user.photoURL || '',
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
  };
}

function applyUserProfile(docData = {}, user = state.user) {
  const data = docData && typeof docData === 'object' ? docData : {};

  state.goal            = data.goal          || 'lose';
  state.weight          = data.startWeight   || DEFAULT_PROFILE_STATE.weight;
  state.height          = data.height        || DEFAULT_PROFILE_STATE.height;
  state.age             = data.age           || DEFAULT_PROFILE_STATE.age;
  state.sex             = data.sex           || DEFAULT_PROFILE_STATE.sex;
  state.activityLevel   = data.activityLevel || DEFAULT_PROFILE_STATE.activityLevel;
  state.profilePhoto    = data.photoURL      || user?.photoURL || DEFAULT_PROFILE_STATE.profilePhoto;
  state.athleteName     = data.name          || user?.displayName || DEFAULT_PROFILE_STATE.athleteName;
  state.isGenerated     = hasSavedProfileData(data);

  state.customExerciseData  = data.customExerciseData
    ? data.customExerciseData
    : JSON.parse(JSON.stringify(EXERCISE_DATA));
  state.customNutritionData = data.customNutritionData
    ? data.customNutritionData
    : JSON.parse(JSON.stringify(NUTRITION_DATA));
  state.habits              = (data.habits && typeof data.habits === 'object') ? data.habits : {};
  state.habitPoints         = (data.habitPoints && typeof data.habitPoints === 'object') ? data.habitPoints : {};
  state.mood                = (data.mood && typeof data.mood === 'object') ? data.mood : {};
  state.manualMacros        = data.manualMacros !== undefined ? data.manualMacros : null;

  debugLog('Applied user profile state', {
    uid: user?.uid || null,
    isGenerated: state.isGenerated,
    athleteName: state.athleteName,
    hasPhoto: !!state.profilePhoto
  });
}

function attachCollectionListener(ref, label, onData) {
  return ref.onSnapshot(onData, (err) => {
    console.error(`[firestore] ${label} listener error:`, err);
  });
}

async function loadFirestoreData() {
  if (!state.user) return;
  unsubscribeAll();
  state.isProfileLoaded = false;

  const user = state.user;
  const uid = user.uid;
  const userRef = db.doc(`users/${uid}`);

  debugLog('Starting Firestore hydration', { uid });

  saveProfile({
    email: user.email || '',
    name: user.displayName || '',
    photoURL: user.photoURL || '',
    lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { label: 'session metadata sync' });

  const unsubUser = userRef.onSnapshot((snap) => {
    debugLog('User document snapshot received', {
      uid,
      exists: snap.exists,
      fromCache: snap.metadata?.fromCache,
      hasPendingWrites: snap.metadata?.hasPendingWrites
    });

    if (!snap.exists) {
      const initialDoc = buildInitialUserDoc(user);
      debugLog('Creating missing user document from snapshot path', { uid, email: user.email || '' });
      userRef.set(initialDoc, { merge: true }).catch((err) => {
        console.error('[firestore] Failed to create missing user document:', err);
      });
      applyUserProfile(initialDoc, user);
    } else {
      const existingData = snap.data() || {};
      applyUserProfile(existingData, user);
    }

    state.isProfileLoaded = true;
    bootApp();
  }, (err) => {
    console.error('[firestore] User listener error:', err);
    state.isProfileLoaded = true;
    bootApp();
  });

  const unsubWeight = attachCollectionListener(
    db.collection(`users/${uid}/weightLogs`).orderBy('date', 'asc'),
    'weightLogs',
    (snap) => {
    state.weightLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderWeightChart();
    renderWeightChart('weight-chart-tracker', 'weightChartTrackerInstance');
    renderWeightLogList();
    updateHomeStats();
    }
  );

  const unsubSleep = attachCollectionListener(
    db.collection(`users/${uid}/sleepLogs`).orderBy('date', 'asc'),
    'sleepLogs',
    (snap) => {
    state.sleepLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    renderSleepChart();
    renderSleepLogList();
    updateHomeStats();
    }
  );

  const unsubGym = attachCollectionListener(
    db.collection(`users/${uid}/gymLogs`).orderBy('date', 'asc'),
    'gymLogs',
    (snap) => {
    state.gymLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateHomeStats();
    if (state.activeTab === 'tracker') renderTrackerTab();
    }
  );

  const unsubNutrition = attachCollectionListener(
    db.collection(`users/${uid}/nutritionLogs`).orderBy('date', 'asc'),
    'nutritionLogs',
    (snap) => {
    state.nutritionLogs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    if (state.activeTab === 'tracker') renderTrackerTab();
    }
  );

  firestoreUnsubs = [unsubUser, unsubWeight, unsubSleep, unsubGym, unsubNutrition];
}

function unsubscribeAll() {
  firestoreUnsubs.forEach(fn => fn && fn());
  firestoreUnsubs = [];
}

async function saveProfile(updates, options = {}) {
  if (!state.user) return false;
  const { label = 'profile save' } = options;
  try {
    debugLog(`Starting ${label}`, { uid: state.user.uid, keys: Object.keys(updates || {}) });
    await db.doc(`users/${state.user.uid}`).set({
      ...updates,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    debugLog(`Completed ${label}`, { uid: state.user.uid });
    return true;
  } catch (e) {
    console.error(`[firestore] ${label} failed:`, e);
    return false;
  }
}

async function logWeight(val) {
  if (!state.user) return;
  const w = Math.max(20, Math.min(300, val));
  const uid = state.user.uid;
  const today = new Date(); today.setHours(0,0,0,0);
  const existing = state.weightLogs.find(l => {
    if (!l.date?.seconds) return false;
    return new Date(l.date.seconds * 1000) >= today;
  });
  try {
    if (existing) {
      await db.doc(`users/${uid}/weightLogs/${existing.id}`).set({ weight: w, date: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else {
      await db.collection(`users/${uid}/weightLogs`).add({ userId: uid, weight: w, date: firebase.firestore.FieldValue.serverTimestamp() });
    }
    addNotification(`Weight logged: ${w} kg`);
  } catch (e) { console.error(e); }
}

async function logSleep(hours) {
  if (!state.user) return;
  const h = Math.max(0, Math.min(12, hours));
  const uid = state.user.uid;
  const today = new Date(); today.setHours(0,0,0,0);
  const existing = state.sleepLogs.find(l => {
    if (!l.date?.seconds) return false;
    return new Date(l.date.seconds * 1000) >= today;
  });
  try {
    if (existing) {
      await db.doc(`users/${uid}/sleepLogs/${existing.id}`).set({ hours: h, date: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else {
      await db.collection(`users/${uid}/sleepLogs`).add({ userId: uid, hours: h, date: firebase.firestore.FieldValue.serverTimestamp() });
    }
    addNotification(`Sleep logged: ${h} hrs`);
  } catch (e) { console.error(e); }
}

async function logGym(completed) {
  const day = Math.min(new Date().getDate(), 30);
  state.habits[`gym-${day}`] = !!completed;
  recalcHabitPoints();
  updateHomeStats();
  if (state.activeTab === 'habits') renderHabitsTab();
  if (state.activeTab === 'tracker') renderTrackerTab();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = state.gymLogs.find(l => {
    if (!l.date?.seconds) return false;
    return new Date(l.date.seconds * 1000) >= today;
  });

  const todayLog = {
    id: Date.now().toString(),
    completed: !!completed,
    date: { seconds: Math.floor(Date.now() / 1000) }
  };

  state.gymLogs = state.gymLogs.filter(l => {
    if (!l.date?.seconds) return true;
    const d = new Date(l.date.seconds * 1000);
    return d < today;
  });
  state.gymLogs.push(todayLog);
  syncWorkoutLogControls();

  if (!state.user) {
    addNotification(completed ? 'Session logged! Great work, Athlete.' : 'Rest day logged.');
    return;
  }

  try {
    if (existing) {
      await db.doc(`users/${state.user.uid}/gymLogs/${existing.id}`).set({ completed, date: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else {
      await db.collection(`users/${state.user.uid}/gymLogs`).add({ userId: state.user.uid, completed, date: firebase.firestore.FieldValue.serverTimestamp() });
    }
    saveProfile({ habits: state.habits, habitPoints: state.habitPoints });
    addNotification(completed ? 'Session logged! Great work, Athlete.' : 'Rest day logged.');
  } catch (e) { console.error(e); }
}

async function logNutrition(reached) {
  const day = Math.min(new Date().getDate(), 30);
  state.habits[`protein-${day}`] = !!reached;
  recalcHabitPoints();
  updateHomeStats();
  if (state.activeTab === 'habits') renderHabitsTab();
  if (state.activeTab === 'tracker') renderTrackerTab();

  const today = new Date(); today.setHours(0,0,0,0);
  const existing = state.nutritionLogs.find(l => {
    if (!l.date?.seconds) return false;
    return new Date(l.date.seconds * 1000) >= today;
  });

  const todayLog = {
    id: Date.now().toString(),
    reached: !!reached,
    date: { seconds: Math.floor(Date.now() / 1000) }
  };

  state.nutritionLogs = state.nutritionLogs.filter(l => {
    if (!l.date?.seconds) return true;
    const d = new Date(l.date.seconds * 1000);
    const now = new Date();
    return !(d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate());
  });
  state.nutritionLogs.push(todayLog);
  syncNutritionLogControls();

  if (!state.user) {
    addNotification(reached ? 'Nutrition target hit! Great consistency!' : 'Nutrition logged — keep pushing!');
    if (reached) playNutritionSuccessAnimation();
    return;
  }

  const uid = state.user.uid;
  try {
    if (existing) {
      await db.doc(`users/${uid}/nutritionLogs/${existing.id}`).set({ reached, date: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
    } else {
      await db.collection(`users/${uid}/nutritionLogs`).add({ userId: uid, reached, date: firebase.firestore.FieldValue.serverTimestamp() });
    }
    saveProfile({ habits: state.habits, habitPoints: state.habitPoints });
    addNotification(reached ? 'Nutrition target hit! Great consistency!' : 'Nutrition logged — keep pushing!');
    if (reached) playNutritionSuccessAnimation();
  } catch (e) { console.error(e); }
}

function playNutritionSuccessAnimation() {
  const button = document.getElementById('log-nutrition-yes');
  const card = document.getElementById('nutrition-log-card');

  if (button) {
    button.animate([
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(255,140,90,0)' },
      { transform: 'scale(1.05)', boxShadow: '0 0 28px rgba(255,140,90,0.45)' },
      { transform: 'scale(1)', boxShadow: '0 0 0 rgba(255,140,90,0)' }
    ], {
      duration: 500,
      easing: 'ease-out'
    });
  }

  if (card) {
    card.animate([
      { transform: 'translateY(0px)', borderColor: 'rgba(255,140,90,0.15)' },
      { transform: 'translateY(-3px)', borderColor: 'rgba(255,140,90,0.55)' },
      { transform: 'translateY(0px)', borderColor: 'rgba(255,140,90,0.15)' }
    ], {
      duration: 650,
      easing: 'ease-out'
    });
  }
}

async function deleteLog(collectionName, logId) {
  if (!state.user) return;
  try {
    await db.doc(`users/${state.user.uid}/${collectionName}/${logId}`).delete();
  } catch (e) { console.error(e); }
}

/* ============================================================
   6. NAVIGATION / TABS
   ============================================================ */

function switchTab(tabName) {
  state.activeTab = tabName;

  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById(`tab-${tabName}`);
  if (panel) panel.classList.add('active');

  document.querySelectorAll('.sidebar-link').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  if (tabName === 'home')      renderHomeTab();
  if (tabName === 'workouts')  renderWorkoutsTab();
  if (tabName === 'nutrition') renderNutritionTab();
  if (tabName === 'tracker')   renderTrackerTab();
  if (tabName === 'habits')    renderHabitsTab();
  if (tabName === 'profile')   renderProfileTab();

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   7. INIT MODAL (Protocol Setup)
   ============================================================ */

function showInitModal(isRecalibrating = false) {
  const modal      = document.getElementById('init-modal');
  const title      = document.getElementById('init-modal-title');
  const closeBtn   = document.getElementById('init-modal-close');
  const generateBtn = document.getElementById('generate-protocol-btn');

  document.getElementById('init-weight').value   = state.weight;
  document.getElementById('init-height').value   = state.height;
  document.getElementById('init-age').value      = state.age;
  document.getElementById('init-sex').value      = state.sex;
  document.getElementById('init-activity').value = state.activityLevel;
  document.getElementById('init-goal').value     = state.goal;

  title.textContent       = isRecalibrating ? 'Update Plan' : 'Set Up Your Plan';
  generateBtn.textContent = isRecalibrating ? 'Save Changes' : 'Create Plan';
  closeBtn.style.display  = isRecalibrating ? 'flex' : 'none';

  modal.classList.add('open');
  refreshIcons();
}

function hideInitModal() {
  document.getElementById('init-modal').classList.remove('open');
}

async function handleGenerateProtocol() {
  const generateBtn = document.getElementById('generate-protocol-btn');
  const originalBtnText = generateBtn?.textContent || 'Create Plan';
  if (generateBtn) {
    generateBtn.disabled = true;
    generateBtn.textContent = 'Saving...';
  }

  state.weight        = parseInt(document.getElementById('init-weight').value)   || 75;
  state.height        = parseInt(document.getElementById('init-height').value)   || 175;
  state.age           = parseInt(document.getElementById('init-age').value)      || 25;
  state.sex           = document.getElementById('init-sex').value;
  state.activityLevel = document.getElementById('init-activity').value;
  state.goal          = document.getElementById('init-goal').value;
  state.isGenerated   = true;

  hideInitModal();
  addNotification('Welcome, Athlete. Your Elite Protocol is now initialized. Time to execute.');
  renderHomeTab();
  renderNutritionTab();
  bootApp();
  refreshIcons();

  if (state.user) {
    saveProfile({
      uid:                state.user.uid,
      email:              state.user.email,
      name:               state.athleteName || state.user.displayName || '',
      photoURL:           state.profilePhoto || state.user.photoURL || '',
      goal:               state.goal,
      startWeight:        state.weight,
      height:             state.height,
      age:                state.age,
      sex:                state.sex,
      activityLevel:      state.activityLevel,
      customExerciseData: state.customExerciseData,
      customNutritionData: state.customNutritionData,
      createdAt:          firebase.firestore.FieldValue.serverTimestamp()
    }, { label: 'initial plan save' }).then((ok) => {
      if (!ok) {
        addNotification('Plan created locally, but Firebase sync failed. Try Update Plan again after checking Firestore rules/network.');
      }
    }).finally(() => {
      if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = originalBtnText;
      }
    });
    return;
  }

  if (state.isGuestMode) {
    state.welcomeSent = true;
  }
  if (generateBtn) {
    generateBtn.disabled = false;
    generateBtn.textContent = originalBtnText;
  }
}

/* ============================================================
   8. HOME TAB
   ============================================================ */

function renderHomeTab() {
  if (!state.isGenerated) return;

  const now   = new Date();
  const greet = now.getHours() < 12 ? 'Good Morning' : now.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const name  = state.athleteName || (state.user?.displayName) || 'Athlete';

  const greetEl = document.getElementById('home-greeting');
  if (greetEl) greetEl.textContent = `${greet}, ${name.toUpperCase()}`;

  const dateEl = document.getElementById('home-date');
  if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  updateHomeStats();
  renderWeightChart();
  updateMacroPanels();
}

function updateHomeStats() {
  if (!state.isGenerated) return;

  const currentDay = Math.min(new Date().getDate(), 30);
  let streak = 0;
  for (let d = currentDay; d >= 1; d--) {
    const hasAny = HABITS.some(h => state.habits[`${h.id}-${d}`]);
    if (hasAny) streak++; else break;
  }

  let totalPoints = 0;
  for (let d = 1; d <= 30; d++) totalPoints += state.habitPoints[d] || 0;

  const gymSessions = state.gymLogs.filter(l => l.completed).length;

  const firstOfMonth = new Date(); firstOfMonth.setDate(1); firstOfMonth.setHours(0,0,0,0);
  const monthlySleepLogs = state.sleepLogs.filter(l => l.date?.seconds && new Date(l.date.seconds*1000) >= firstOfMonth);
  const avgSleep = monthlySleepLogs.length > 0
    ? (monthlySleepLogs.reduce((a,c) => a + c.hours, 0) / monthlySleepLogs.length).toFixed(1)
    : '—';

  setText('stat-streak', streak);
  setText('stat-points', totalPoints);
  const badge = getBadge(totalPoints);
  setText('stat-badge', badge.name);
  setText('stat-gym', gymSessions);
  setText('stat-sleep', avgSleep);

  if (state.weight && state.height) {
    const bmi = +(state.weight / Math.pow(state.height/100, 2)).toFixed(1);
    setText('bmi-value', bmi);

    let label = 'Healthy', barWidth = 40, color = '#ff9062';
    if (bmi < 18.5)     { label = 'Underweight'; barWidth = 15; color = '#ffbd59'; }
    else if (bmi < 25)  { label = 'Healthy';     barWidth = 40; color = '#ff9062'; }
    else if (bmi < 30)  { label = 'Overweight';  barWidth = 70; color = '#ff4d00'; }
    else                { label = 'Obese';        barWidth = 90; color = '#8b0000'; }

    setText('bmi-label', label);
    const bar = document.getElementById('bmi-bar');
    if (bar) { bar.style.width = `${barWidth}%`; bar.style.background = color; }

    setText('profile-bmi', bmi);
  }

  setText('profile-streak', `${streak} days`);
  setText('profile-points', totalPoints);
  setText('profile-rank', badge.name);
}

function updateMacroPanels() {
  const m = getMacros();
  setText('macro-cal', `${m.cal} kcal`);
  setText('macro-p',   `${m.p}g`);
  setText('macro-c',   `${m.c}g`);
  setText('macro-f',   `${m.f}g`);
}

function getMacros() {
  if (state.manualMacros) return state.manualMacros;
  const { weight, goal } = state;
  if (!weight) return { cal:0, p:0, c:0, f:0, w:3 };
  let cal=0, p=0, f=0, c=0, w=3;
  if (goal === 'lose')      { cal = Math.round(weight*24); p = Math.round(weight*2.2); f = Math.round(weight*0.7); }
  else if (goal === 'gain') { cal = Math.round(weight*33); p = Math.round(weight*2.0); f = Math.round(weight*0.9); }
  else                      { cal = Math.round(weight*28); p = Math.round(weight*1.8); f = Math.round(weight*0.8); }
  c = Math.round((cal - (p*4) - (f*9)) / 4);
  return { cal, p, c, f, w };
}

/* ============================================================
   9. WORKOUTS TAB
   ============================================================ */

const GOAL_LABELS = { lose: 'LOSE', gain: 'GAIN', health: 'HEALTH' };

function renderWorkoutsTab() {
  const g = document.getElementById('workout-goal-label');
  if (g) g.textContent = GOAL_LABELS[state.goal] || 'LOSE';
  renderExerciseList();
  syncWorkoutLogControls();
}

function renderExerciseList() {
  const container = document.getElementById('exercise-list');
  if (!container) return;
  const exercises = (state.customExerciseData[state.workoutEnv] || {})[state.workoutSession] || [];
  container.innerHTML = '';

  if (exercises.length === 0) {
    container.innerHTML = `<p class="text-xs text-muted" style="padding:1rem;text-align:center;">No exercises for this split. Add one above.</p>`;
    return;
  }

  exercises.forEach((ex, idx) => {
    const focus = escHtml(ex.note || '');
    const desc  = escHtml(ex.description || '');
    const item  = document.createElement('div');
    item.className = 'exercise-card';
    item.innerHTML = `
      <div class="exercise-card-icon">
        <i data-lucide="dumbbell" width="20" height="20"></i>
      </div>
      <div class="exercise-card-body">
        <p class="exercise-card-name">${escHtml(ex.name)}</p>
        ${focus ? `<p class="exercise-card-focus">${focus}</p>` : ''}
        ${desc  ? `<p class="exercise-card-desc">${desc}</p>`  : ''}
      </div>
      <div class="exercise-card-stats">
        <div class="exercise-stat">
          <p class="exercise-stat-label">Sets</p>
          <p class="exercise-stat-val">${escHtml(String(ex.sets))}</p>
        </div>
        <div class="exercise-stat">
          <p class="exercise-stat-label">Reps</p>
          <p class="exercise-stat-val">${escHtml(String(ex.reps))}</p>
        </div>
      </div>
      <button type="button" class="exercise-card-del" data-ex-idx="${idx}" title="Remove">
        <i data-lucide="trash-2" width="16" height="16"></i>
      </button>
    `;
    const del = item.querySelector('.exercise-card-del');
    if (del) del.addEventListener('click', () => removeExercise(idx));
    container.appendChild(item);
  });
  refreshIcons();
}

function removeExercise(idx) {
  state.customExerciseData[state.workoutEnv][state.workoutSession].splice(idx, 1);
  if (state.user) saveProfile({ customExerciseData: state.customExerciseData });
  renderExerciseList();
}

function addExercise() {
  const name = document.getElementById('new-ex-name').value.trim();
  const sets = parseInt(document.getElementById('new-ex-sets').value) || 3;
  const reps = document.getElementById('new-ex-reps').value.trim() || '10-12';
  const note = document.getElementById('new-ex-note')?.value.trim() || '';
  const desc = document.getElementById('new-ex-desc').value.trim();

  if (!name) return;

  if (!state.customExerciseData[state.workoutEnv]) state.customExerciseData[state.workoutEnv] = {};
  if (!state.customExerciseData[state.workoutEnv][state.workoutSession]) state.customExerciseData[state.workoutEnv][state.workoutSession] = [];

  state.customExerciseData[state.workoutEnv][state.workoutSession].push({ name, sets, reps, note, description: desc });
  if (state.user) saveProfile({ customExerciseData: state.customExerciseData });

  document.getElementById('new-ex-name').value = '';
  document.getElementById('new-ex-sets').value = '';
  document.getElementById('new-ex-reps').value = '';
  document.getElementById('new-ex-desc').value = '';
  const noteEl = document.getElementById('new-ex-note');
  if (noteEl) noteEl.value = '';
  document.getElementById('add-exercise-form').classList.remove('open');

  renderExerciseList();
}

function hasLoggedWorkoutToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (state.habits[`gym-${today.getDate()}`]) return true;
  return state.gymLogs.some(log => {
    if (!log.date?.seconds) return false;
    return new Date(log.date.seconds * 1000) >= today;
  });
}

function syncWorkoutLogControls() {
  const actions = document.getElementById('workout-log-actions');
  const status = document.getElementById('workout-log-status');
  const logged = hasLoggedWorkoutToday();

  if (actions) actions.style.display = logged ? 'none' : 'block';
  if (status) status.style.display = logged ? 'block' : 'none';
}

/* ============================================================
  10. NUTRITION TAB
  ============================================================ */

function renderNutritionTab() {
  const planData = state.customNutritionData[state.goal] || NUTRITION_DATA[state.goal];
  const titleEl  = document.getElementById('nutrition-plan-title');
  if (titleEl) titleEl.textContent = planData?.title || '';

  const container = document.getElementById('meals-container');
  if (!container) return;
  container.innerHTML = '';

  const meals = planData?.meals || {};
  Object.entries(meals).forEach(([category, items]) => {
    if (!items || items.length === 0) return;

    const section = document.createElement('div');
    section.className = 'card';
    section.innerHTML = `
      <div class="flex justify-between items-center" style="margin-bottom:1rem;">
        <p class="card-title">${escHtml(category)}</p>
        <button class="btn btn-outline btn-sm" onclick="toggleMealAddForm('${escHtml(category)}')" style="gap:0.5rem;">
          <i data-lucide="plus" width="14" height="14"></i> Add
        </button>
      </div>
      <div class="flex flex-col" style="gap:0.5rem;" id="meal-list-${safeId(category)}">
        ${items.map((meal, idx) => renderMealRow(meal, category, idx)).join('')}
      </div>
      <div class="add-form" id="meal-add-form-${safeId(category)}" style="margin-top:1rem;">
        <div class="form-group">
          <label class="form-label">Meal Name</label>
          <input type="text" class="form-input" id="new-meal-name-${safeId(category)}" placeholder="e.g. Chicken salad" />
        </div>
        <div class="add-form-grid">
          <div class="form-group">
            <label class="form-label">Calories</label>
            <input type="number" class="form-input" id="new-meal-cal-${safeId(category)}" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Protein (g)</label>
            <input type="number" class="form-input" id="new-meal-p-${safeId(category)}" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Carbs (g)</label>
            <input type="number" class="form-input" id="new-meal-c-${safeId(category)}" placeholder="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Fat (g)</label>
            <input type="number" class="form-input" id="new-meal-f-${safeId(category)}" placeholder="0" />
          </div>
        </div>
        <div class="flex gap-2">
          <button class="btn btn-primary btn-sm" onclick="addMeal('${escHtml(category)}')">Save</button>
          <button class="btn btn-outline btn-sm" onclick="toggleMealAddForm('${escHtml(category)}')">Cancel</button>
        </div>
      </div>
    `;
    container.appendChild(section);
  });
  syncNutritionLogControls();
  refreshIcons();
}

function hasLoggedNutritionToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return state.nutritionLogs.some(log => {
    if (!log.date?.seconds) return false;
    return new Date(log.date.seconds * 1000) >= today;
  });
}

function syncNutritionLogControls() {
  const actions = document.getElementById('nutrition-log-actions');
  const status = document.getElementById('nutrition-log-status');
  const logged = hasLoggedNutritionToday();

  if (actions) actions.style.display = logged ? 'none' : 'flex';
  if (status) status.style.display = logged ? 'block' : 'none';
}

function renderMealRow(meal, category, idx) {
  return `
    <div class="data-row">
      <div class="data-row-left">
        <span class="data-row-name">${escHtml(meal.name)}</span>
        <span class="data-row-meta">${meal.calories} kcal</span>
      </div>
      <div class="data-row-macros">
        <div class="macro-pill"><span class="macro-pill-val">${meal.protein}g</span><span class="macro-pill-label">Protein</span></div>
        <div class="macro-pill"><span class="macro-pill-val">${meal.carbs}g</span><span class="macro-pill-label">Carbs</span></div>
        <div class="macro-pill"><span class="macro-pill-val">${meal.fats}g</span><span class="macro-pill-label">Fat</span></div>
        <button onclick="removeMeal('${escHtml(category)}',${idx})" style="background:none;border:none;cursor:pointer;color:var(--color-on-surface-variant);padding:4px;" title="Remove">
          <i data-lucide="trash-2" width="14" height="14"></i>
        </button>
      </div>
    </div>
  `;
}

function toggleMealAddForm(category) {
  const form = document.getElementById(`meal-add-form-${safeId(category)}`);
  if (form) form.classList.toggle('open');
  refreshIcons();
}

function addMeal(category) {
  const sid  = safeId(category);
  const name = document.getElementById(`new-meal-name-${sid}`)?.value.trim();
  const cal  = parseInt(document.getElementById(`new-meal-cal-${sid}`)?.value) || 0;
  const p    = parseInt(document.getElementById(`new-meal-p-${sid}`)?.value)   || 0;
  const c    = parseInt(document.getElementById(`new-meal-c-${sid}`)?.value)   || 0;
  const f    = parseInt(document.getElementById(`new-meal-f-${sid}`)?.value)   || 0;

  if (!name) return;

  if (!state.customNutritionData[state.goal]) state.customNutritionData[state.goal] = { title: state.goal, meals: {} };
  if (!state.customNutritionData[state.goal].meals[category]) state.customNutritionData[state.goal].meals[category] = [];
  state.customNutritionData[state.goal].meals[category].push({ name, calories: cal, protein: p, carbs: c, fats: f });

  if (state.user) saveProfile({ customNutritionData: state.customNutritionData });
  renderNutritionTab();
}

function removeMeal(category, idx) {
  if (!state.customNutritionData[state.goal]?.meals[category]) return;
  state.customNutritionData[state.goal].meals[category].splice(idx, 1);
  if (state.user) saveProfile({ customNutritionData: state.customNutritionData });
  renderNutritionTab();
}

/* ============================================================
  11. TRACKER TAB
  ============================================================ */

function renderWeightLogList() {
  const container = document.getElementById('weight-log-list');
  if (!container) return;

  if (state.weightLogs.length === 0) {
    container.innerHTML = `<p class="text-xs text-muted" style="padding:1rem;text-align:center;grid-column:1/-1;">No weight logs yet.</p>`;
    return;
  }

  container.innerHTML = [...state.weightLogs].reverse().map(log => `
    <div class="data-row" style="align-items:center;">
      <div>
        <p style="font-size:0.875rem;font-weight:900;">${log.weight} KG</p>
        <p class="text-xxs text-muted uppercase">${log.date?.seconds ? new Date(log.date.seconds*1000).toLocaleDateString() : 'Recent'}</p>
      </div>
      <button onclick="deleteLog('weightLogs','${log.id}')" style="background:none;border:none;cursor:pointer;color:var(--color-on-surface-variant);" title="Delete">
        <i data-lucide="trash-2" width="14" height="14"></i>
      </button>
    </div>
  `).join('');
  refreshIcons();
}

function renderSleepLogList() {
  const container = document.getElementById('sleep-log-list');
  if (!container) return;

  if (state.sleepLogs.length === 0) {
    container.innerHTML = `<p class="text-xs text-muted" style="padding:1rem;text-align:center;grid-column:1/-1;">No sleep logs yet.</p>`;
    return;
  }

  container.innerHTML = [...state.sleepLogs].reverse().map(log => `
    <div class="data-row" style="align-items:center;">
      <div>
        <p style="font-size:0.875rem;font-weight:900;color:${log.hours >= 7 ? 'var(--color-primary)' : 'var(--color-tertiary)'};">${log.hours} HRS</p>
        <p class="text-xxs text-muted uppercase">${log.date?.seconds ? new Date(log.date.seconds*1000).toLocaleDateString() : 'Recent'}</p>
      </div>
      <button onclick="deleteLog('sleepLogs','${log.id}')" style="background:none;border:none;cursor:pointer;color:var(--color-on-surface-variant);" title="Delete">
        <i data-lucide="trash-2" width="14" height="14"></i>
      </button>
    </div>
  `).join('');
  refreshIcons();
}

/* ============================================================
  12. HABITS TAB
  ============================================================ */

function renderHabitsTab() {
  renderHabits();
  renderMoodGrid();
}

function recalcHabitPoints() {
  for (let d = 1; d <= 30; d++) {
    let pts = 0;
    HABITS.forEach(h => { if (state.habits[`${h.id}-${d}`]) pts += h.points; });
    state.habitPoints[d] = pts;
  }
}

function renderConsistencyMap(currentDay) {
  const table = document.getElementById('habits-consistency-map');
  if (!table) return;

  let html = '<thead><tr><th class="cm-corner">Habits</th>';
  for (let d = 1; d <= 30; d++) {
    html += `<th class="cm-day-num${d === currentDay ? ' cm-day-highlight' : ''}" scope="col">${d}</th>`;
  }
  html += '</tr></thead><tbody>';

  HABITS.forEach(habit => {
    html += '<tr>';
    html += `<th class="cm-row-habit" scope="row">
      <span class="cm-row-icon"><i data-lucide="${habit.icon}" width="14" height="14" style="color:${habit.color};"></i></span>
      <span class="cm-row-label">${escHtml(habit.name)}</span>
    </th>`;
    for (let d = 1; d <= 30; d++) {
      const done     = !!state.habits[`${habit.id}-${d}`];
      const isFuture = d > currentDay;
      const cellClass = d === currentDay ? ' cm-day-highlight' : '';
      html += `<td class="cm-cell${cellClass}">
        <button type="button" class="cm-check${done ? ' done' : ''}${isFuture ? ' is-future' : ''}"
          data-habit="${escHtml(habit.id)}" data-day="${d}"
          ${isFuture ? 'disabled tabindex="-1"' : ''}
          aria-label="${escHtml(habit.name)} day ${d}${isFuture ? ' (future)' : ''}"
          aria-pressed="${done ? 'true' : 'false'}"></button>
      </td>`;
    }
    html += '</tr>';
  });

  html += '<tr class="cm-daily-points">';
  html += '<th class="cm-points-head" scope="row">Daily Points</th>';
  for (let d = 1; d <= 30; d++) {
    const pts = state.habitPoints[d] || 0;
    const highlight = d === currentDay ? ' cm-day-highlight' : '';
    html += `<td class="cm-points-td${highlight}"><span class="cm-points-num${pts > 0 ? ' cm-points-hot' : ''}">${pts}</span></td>`;
  }
  html += '</tr></tbody>';

  table.innerHTML = html;
  refreshIcons();
}

function renderHabits() {
  const container = document.getElementById('habits-container');
  if (!container) return;
  const currentDay = Math.min(new Date().getDate(), 30);
  recalcHabitPoints();
  container.innerHTML = '';

  let totalPoints = 0;
  for (let d = 1; d <= 30; d++) totalPoints += state.habitPoints[d] || 0;

  const badge = getBadge(totalPoints);
  setText('habits-rank-name', badge.name);
  setText('habits-total-pts', String(totalPoints));

  const nextTier = [...BADGES].find(b => b.min > totalPoints);
  const nextEl   = document.getElementById('habits-next-badge');
  if (nextEl) {
    nextEl.textContent = nextTier
      ? `Next badge: ${nextTier.name} at ${nextTier.min} pts (${Math.max(0, nextTier.min - totalPoints)} left)`
      : 'Maximum rank achieved.';
  }

  const ladder = document.getElementById('habits-badge-ladder');
  if (ladder) {
    ladder.innerHTML = BADGES.map(b => `
      <span class="badge-tier${b.name === badge.name ? ' current' : ''}">${escHtml(b.name)}</span>
    `).join('');
  }

  setText('habits-day-label', `Day ${currentDay}`);

  HABITS.forEach(habit => {
    const doneCount = Array.from({ length: currentDay }, (_, i) => i + 1)
      .filter(d => state.habits[`${habit.id}-${d}`]).length;
    const doneToday = !!state.habits[`${habit.id}-${currentDay}`];

    const wrap = document.createElement('div');
    wrap.className = 'habit-card-wrap-spacer';
    wrap.innerHTML = `
      <div class="habit-card-ref">
        <div class="flex items-center gap-3" style="min-width:0;">
          <div style="width:40px;height:40px;border-radius:0.5rem;background:rgba(255,140,90,0.1);display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <i data-lucide="${habit.icon}" width="18" height="18" style="color:${habit.color};"></i>
          </div>
          <div style="min-width:0;">
            <p class="habit-title">${escHtml(habit.name)}</p>
            <p class="habit-desc">${escHtml(habit.description)}</p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1" style="flex-shrink:0;">
          <button type="button" class="habit-check${doneToday ? ' done' : ''}" title="Toggle today" aria-label="Toggle ${escHtml(habit.name)} for today"></button>
          <span class="text-xxs text-muted">+${habit.points} pts · ${doneCount}/${currentDay}</span>
        </div>
      </div>
    `;
    container.appendChild(wrap);

    const btn = wrap.querySelector('.habit-check');
    if (btn) btn.addEventListener('click', () => toggleHabit(habit.id, currentDay));
  });

  renderConsistencyMap(currentDay);
}

function toggleHabit(habitId, day) {
  const key = `${habitId}-${day}`;
  state.habits[key] = !state.habits[key];
  renderHabits();
  updateHomeStats();
  renderTrackerTab();
  if (state.user) saveProfile({ habits: state.habits, habitPoints: state.habitPoints });
}

function renderMoodGrid() {
  const grid = document.getElementById('mood-grid');
  if (!grid) return;
  const today       = new Date().getDate();
  const currentMood = state.mood[today] || null;

  grid.innerHTML = MOODS.map(mood => `
    <button class="mood-pill ${currentMood === mood ? 'selected' : ''}" onclick="setMood('${mood}')">${mood}</button>
  `).join('');
}

function setMood(mood) {
  const today = new Date().getDate();
  state.mood[today] = mood;
  renderMoodGrid();
  if (state.user) saveProfile({ mood: state.mood });
}

/* ============================================================
  13. PROFILE TAB
  ============================================================ */

function renderProfileTab() {
  const setValue = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };

  setValue('profile-name',     state.athleteName);
  setValue('profile-weight',   state.weight);
  setValue('profile-height',   state.height);
  setValue('profile-age',      state.age);
  setValue('profile-sex',      state.sex);
  setValue('profile-activity', state.activityLevel);
  setValue('profile-goal',     state.goal);

  const dayEl = document.getElementById('profile-day-status');
  if (dayEl) dayEl.textContent = `Current Status: Day ${Math.min(new Date().getDate(), 30)}`;

  const img  = document.getElementById('profile-photo-img');
  const icon = document.getElementById('profile-icon');
  if (state.profilePhoto) {
    if (img)  { img.src = state.profilePhoto; img.style.display = 'block'; }
    if (icon) icon.style.display = 'none';
  } else {
    if (img)  img.style.display = 'none';
    if (icon) icon.style.display = '';
  }

  updateHomeStats();
}

function saveProfileFromForm() {
  state.athleteName   = document.getElementById('profile-name').value.trim();
  state.weight        = parseInt(document.getElementById('profile-weight').value)   || state.weight;
  state.height        = parseInt(document.getElementById('profile-height').value)   || state.height;
  state.age           = parseInt(document.getElementById('profile-age').value)      || state.age;
  state.sex           = document.getElementById('profile-sex').value;
  state.activityLevel = document.getElementById('profile-activity').value;
  state.goal          = document.getElementById('profile-goal').value;

  if (state.user) {
    saveProfile({
      name:          state.athleteName,
      startWeight:   state.weight,
      height:        state.height,
      age:           state.age,
      sex:           state.sex,
      activityLevel: state.activityLevel,
      goal:          state.goal
    });
  }
  updateHomeStats();
  updateMacroPanels();
  renderNutritionTab();
  addNotification('Athlete profile updated.');
}

function handlePhotoUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onloadend = () => {
    const b64 = reader.result;
    state.profilePhoto = b64;
    renderProfileTab();
    const avatarImg  = document.getElementById('topbar-avatar-img');
    const avatarIcon = document.getElementById('topbar-avatar-icon');
    if (avatarImg)  { avatarImg.src = b64; avatarImg.style.display = 'block'; }
    if (avatarIcon) avatarIcon.style.display = 'none';
    if (state.user) saveProfile({ photoURL: b64 });
  };
  reader.readAsDataURL(file);
}

/* ============================================================
  14. NOTIFICATIONS
  ============================================================ */

function addNotification(text) {
  if (state.isMuted) return;
  state.notifications.unshift({
    id:   Math.random().toString(36).substr(2, 9),
    text,
    time: new Date(),
    read: false
  });
  state.notifications = state.notifications.slice(0, 20);
  renderNotifications();
}

function renderNotifications() {
  const badge = document.getElementById('notif-badge');
  const list  = document.getElementById('notif-list');
  if (!list) return;

  const unread = state.notifications.filter(n => !n.read).length;
  if (badge) badge.style.display = unread > 0 && !state.isMuted ? 'block' : 'none';

  if (state.notifications.length === 0) {
    list.innerHTML = `<p class="notif-empty">No new notifications.</p>`;
    return;
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item">
      <button class="notif-delete" onclick="deleteNotification('${n.id}')">✕</button>
      <p>${escHtml(n.text)}</p>
      <time>${n.time.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}</time>
    </div>
  `).join('');
}

function deleteNotification(id) {
  state.notifications = state.notifications.filter(n => n.id !== id);
  renderNotifications();
}

/* ============================================================
  15. SETTINGS DRAWER
  ============================================================ */

function openSettings() {
  document.getElementById('settings-overlay').classList.add('open');
  document.getElementById('settings-drawer').classList.add('open');
  refreshIcons();
}

function closeSettings() {
  document.getElementById('settings-overlay').classList.remove('open');
  document.getElementById('settings-drawer').classList.remove('open');
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.body.classList.toggle('light', state.theme === 'light');
  const toggle = document.getElementById('theme-toggle');
  if (toggle) toggle.classList.toggle('on', state.theme === 'dark');
}

/* ============================================================
  16. MACRO OVERRIDE MODAL
  ============================================================ */

function openMacroModal() {
  const m = getMacros();
  document.getElementById('override-cal').value = m.cal;
  document.getElementById('override-p').value   = m.p;
  document.getElementById('override-c').value   = m.c;
  document.getElementById('override-f').value   = m.f;
  document.getElementById('override-w').value   = m.w;
  document.getElementById('macro-modal').classList.add('open');
  refreshIcons();
}

function closeMacroModal() {
  document.getElementById('macro-modal').classList.remove('open');
}

function saveMacroOverride() {
  state.manualMacros = {
    cal: parseInt(document.getElementById('override-cal').value) || 0,
    p:   parseInt(document.getElementById('override-p').value)   || 0,
    c:   parseInt(document.getElementById('override-c').value)   || 0,
    f:   parseInt(document.getElementById('override-f').value)   || 0,
    w:   parseFloat(document.getElementById('override-w').value) || 3,
  };
  if (state.user) saveProfile({ manualMacros: state.manualMacros });
  closeMacroModal();
  updateMacroPanels();
  addNotification('Manual macro override applied.');
}

function resetMacroOverride() {
  state.manualMacros = null;
  if (state.user) saveProfile({ manualMacros: null });
  closeMacroModal();
  updateMacroPanels();
}

/* ============================================================
  17. AI CHATBOT (Tito)
  ============================================================ */

function openChatbot() {
  document.getElementById('chatbot-window').classList.add('open');
  if (state.chatMessages.length === 0) {
    pushChatMessage('bot', `Elite Coach online. Ask me about your training, nutrition, or recovery.\n\nGoal: ${state.goal} · Weight: ${state.weight}kg`);
  }
}

function closeChatbot() {
  document.getElementById('chatbot-window').classList.remove('open');
}

function pushChatMessage(role, text) {
  state.chatMessages.push({ role, text });
  renderChatMessages();
}

function renderChatMessages() {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;
  container.innerHTML = state.chatMessages.map(msg => `
    <div class="chat-msg ${msg.role}">${escHtml(msg.text)}</div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chatbot-messages');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'typing-indicator';
  el.id = 'typing-indicator';
  el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  container.appendChild(el);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  document.getElementById('typing-indicator')?.remove();
}

function isQuotaOrRateLimitError(message) {
  const text = String(message || '').toLowerCase();
  return text.includes('quota exceeded')
    || text.includes('resource exhausted')
    || text.includes('rate limit')
    || text.includes('rate-limits')
    || text.includes('insufficient_quota')
    || text.includes('too many requests')
    || text.includes('rate_limit_exceeded')
    || text.includes('quota')
    || text.includes('limit: 0')
    || text.includes('please retry in')
    || text.includes('429');
}

function isInvalidApiKeyError(message) {
  const text = String(message || '').toLowerCase();
  return text.includes('invalid api key')
    || text.includes('invalid_api_key')
    || text.includes('incorrect api key')
    || text.includes('authentication failed')
    || text.includes('unauthorized');
}

function isPlaceholderApiKey(value) {
  const key = String(value || '').trim().toLowerCase();
  return !key
    || key === 'your_groq_key_here'
    || key === 'your_groq_api_key_here'
    || key === 'your_ai_api_key_here'
    || key.includes('your_')
    || key.includes('placeholder');
}

function formatKeyFingerprint(value) {
  const key = String(value || '').trim();
  if (!key) return 'none';
  if (key.length <= 10) return `${key.slice(0, 2)}...(${key.length})`;
  return `${key.slice(0, 6)}...${key.slice(-4)} (len:${key.length})`;
}

function getProxyUrl() {
  return String(CONFIG?.AI_PROXY_URL || '').trim();
}

function buildFallbackCoachReply(userText) {
  const text = String(userText || '').toLowerCase();

  if (text.includes('workout') || text.includes('train') || text.includes('exercise') || text.includes('gym')) {
    return 'Fallback coach: keep the session simple and measurable. Run one compound lift, one accessory, and one finisher. Aim for clean reps, steady tempo, and stop 1-2 reps before failure.';
  }
  if (text.includes('food') || text.includes('diet') || text.includes('macro') || text.includes('nutrition') || text.includes('eat')) {
    return 'Fallback coach: anchor the day around protein, vegetables, and a controlled carb portion. Hit your protein target first, keep hydration high, and reduce ultra-processed snacks.';
  }
  if (text.includes('sleep') || text.includes('recovery') || text.includes('rest') || text.includes('tired')) {
    return 'Fallback coach: protect recovery today. Get 7-9 hours of sleep, hydrate early, and choose low-intensity movement if you feel drained.';
  }
  if (text.includes('motivat') || text.includes('discipline') || text.includes('stuck')) {
    return 'Fallback coach: reduce the target to one action you can finish today. Consistency beats intensity when momentum is low.';
  }
  return 'Fallback coach: stay consistent, execute the next session, and keep your food and recovery targets tight. Ask me about training, nutrition, or recovery for tailored guidance.';
}

/**
 * Calls Groq's OpenAI-compatible chat completions endpoint.
 */
async function sendChatCompletionPrompt(fullPrompt) {
  const proxyUrl = getProxyUrl();
  const model = CONFIG?.AI_MODEL || 'llama-3.3-70b-versatile';

  if (proxyUrl) {
    const res = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: fullPrompt }],
        prompt: fullPrompt
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || data?.error || `HTTP ${res.status}`);

    const reply = data?.reply?.trim() || data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error('Empty response from AI proxy');
    return reply;
  }

  const key = CONFIG?.AI_API_KEY?.trim();
  if (isPlaceholderApiKey(key)) {
    throw new Error('Missing valid AI key. Set AI_PROXY_URL for public deployment, or set AI_API_KEY in config.local.js for local use.');
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`
    },
    body: JSON.stringify({
      model: CONFIG?.AI_MODEL || 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.8,
      max_tokens: 1024
    })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || `HTTP ${res.status}`);

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('Empty response from Groq');
  return reply;
}

async function sendCoachPrompt(fullPrompt) {
  if (typeof CONFIG !== 'undefined' && (getProxyUrl() || !isPlaceholderApiKey(CONFIG.AI_API_KEY))) {
    return sendChatCompletionPrompt(fullPrompt);
  }
  throw new Error('Missing AI configuration: set AI_PROXY_URL (public) or AI_API_KEY in config.local.js (local).');
}

async function sendChatMessage() {
  const input = document.getElementById('chatbot-input');
  const text  = input.value.trim();
  if (!text) return;

  input.value = '';
  pushChatMessage('user', text);
  showTypingIndicator();

  const m = getMacros();
  const systemPrompt = `You are TITO, the AI trainer for Sunstone fitness app.
Athlete profile:
- Goal: ${state.goal} (lose=fat loss, gain=muscle, health=balanced)
- Weight: ${state.weight}kg, Height: ${state.height}cm, Age: ${state.age}, Sex: ${state.sex}
- Activity: ${state.activityLevel}
- Daily targets: ${m.cal} kcal, ${m.p}g protein, ${m.c}g carbs, ${m.f}g fat, ${m.w}L water
Respond in a concise, high-performance coaching style. No excessive markdown.
User question: ${text}`;

  if (typeof CONFIG === 'undefined' || (!getProxyUrl() && isPlaceholderApiKey(CONFIG.AI_API_KEY))) {
    hideTypingIndicator();
    pushChatMessage('system', 'Tito is in demo mode on this deployment (no server-side key). Showing local coach response.');
    pushChatMessage('bot', buildFallbackCoachReply(text));
    return;
  }

  try {
    const reply = await sendCoachPrompt(systemPrompt);
    hideTypingIndicator();
    pushChatMessage('bot', reply);
  } catch (err) {
    console.error('AI coach error:', err);
    hideTypingIndicator();
    const msg = err?.message || String(err);

    if (isQuotaOrRateLimitError(msg)) {
      pushChatMessage('system', 'Groq quota or rate limit reached. Showing a local response instead.');
      pushChatMessage('bot', buildFallbackCoachReply(text));
      return;
    }

    if (isInvalidApiKeyError(msg)) {
      pushChatMessage('system', `Your Groq key is invalid or revoked. Active key: ${formatKeyFingerprint(CONFIG?.AI_API_KEY)}.`);
      pushChatMessage('system', 'Update AI_API_KEY in config.local.js, then hard refresh (Ctrl+F5) so the browser does not reuse stale config.');
      pushChatMessage('bot', buildFallbackCoachReply(text));
      return;
    }

    pushChatMessage('system', `Tito unavailable: ${msg}`);

    if (typeof CONFIG === 'undefined' || (!getProxyUrl() && isPlaceholderApiKey(CONFIG.AI_API_KEY))) {
      pushChatMessage('system', 'Set AI_PROXY_URL for public deployment, or add your Groq key to config.local.js for local development.');
    }

    pushChatMessage('system', 'Using local fallback coach response due to AI connectivity issue.');
    pushChatMessage('bot', buildFallbackCoachReply(text));
  }
}

/* ============================================================
  11b. TRACKER TAB (analytics panels)
  ============================================================ */

function getHabitProtocolAdherencePct() {
  const today = Math.min(new Date().getDate(), 30);
  if (today < 1) return 0;
  let done = 0;
  const total = HABITS.length * today;
  for (let d = 1; d <= today; d++) {
    HABITS.forEach(h => { if (state.habits[`${h.id}-${d}`]) done++; });
  }
  return total > 0 ? Math.round((done / total) * 100) : 0;
}

function dayHasNutritionHit(dayOfMonth) {
  const now = new Date();
  const y   = now.getFullYear();
  const m   = now.getMonth();
  if (state.habits[`protein-${dayOfMonth}`]) return true;
  return state.nutritionLogs.some(log => {
    if (!log.date?.seconds || !log.reached) return false;
    const d = new Date(log.date.seconds * 1000);
    return d.getFullYear() === y && d.getMonth() === m && d.getDate() === dayOfMonth;
  });
}

function getNutritionMonthStats() {
  const now        = new Date();
  const y          = now.getFullYear();
  const m          = now.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const today      = Math.min(now.getDate(), daysInMonth);
  let hit = 0;
  for (let d = 1; d <= today; d++) { if (dayHasNutritionHit(d)) hit++; }
  const pct = today > 0 ? Math.round((hit / today) * 100) : 0;
  return { hit, today, pct, daysInMonth };
}

function hasEliteTrainingForCalendarDate(t) {
  const y  = t.getFullYear();
  const mo = t.getMonth();
  const dom = t.getDate();
  const now = new Date();
  if (y === now.getFullYear() && mo === now.getMonth()) {
    if (state.habits[`gym-${dom}`]) return true;
  }
  return state.gymLogs.some(l => {
    if (!l.completed || !l.date?.seconds) return false;
    const d = new Date(l.date.seconds * 1000);
    return d.getFullYear() === y && d.getMonth() === mo && d.getDate() === dom;
  });
}

function getWeeklySessionCounts() {
  const weeks = [0, 0, 0, 0];
  const now   = new Date();
  const y     = now.getFullYear();
  const mo    = now.getMonth();
  const dim   = new Date(y, mo + 1, 0).getDate();
  for (let day = 1; day <= dim; day++) {
    const t = new Date(y, mo, day);
    if (!hasEliteTrainingForCalendarDate(t)) continue;
    const w = Math.min(3, Math.floor((day - 1) / 7));
    weeks[w]++;
  }
  return weeks;
}

function sessionsThisCalendarWeek() {
  const now   = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  start.setHours(0, 0, 0, 0);
  let count = 0;
  const cur = new Date(start);
  for (let i = 0; i < 7; i++) {
    if (hasEliteTrainingForCalendarDate(cur)) count++;
    cur.setDate(cur.getDate() + 1);
  }
  return count;
}

function getTodayNutritionReached() {
  const dom   = Math.min(new Date().getDate(), 30);
  if (state.habits[`protein-${dom}`]) return true;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const log   = state.nutritionLogs.find(l => {
    if (!l.date?.seconds) return false;
    return new Date(l.date.seconds * 1000) >= today;
  });
  return log?.reached === true;
}

function renderTrackerTab() {
  const day = Math.min(new Date().getDate(), 30);
  setText('tracker-day-label', `Day ${day}`);

  const habitPct = getHabitProtocolAdherencePct();
  const ring = document.getElementById('tracker-consistency-ring');
  if (ring) ring.style.setProperty('--consistency-pct', `${habitPct}%`);
  setText('tracker-consistency-pct', `${habitPct}%`);
  setText('tracker-consistency-ring-label', 'Progress');

  const nut   = getNutritionMonthStats();
  const nRing = document.getElementById('tracker-nutrition-ring');
  if (nRing) nRing.style.setProperty('--nutrition-pct', `${nut.pct}%`);
  const nLabel = document.getElementById('tracker-nutrition-ring-label');
  if (nLabel) nLabel.innerHTML = `${nut.pct}%<br/><span style="font-size:0.5rem;font-weight:800;letter-spacing:0.12em;color:var(--color-on-surface-variant);">CONSISTENCY</span>`;
  setText('tracker-nutrition-days', `${nut.hit} / ${nut.daysInMonth} Days`);
  const bar = document.getElementById('tracker-nutrition-bar');
  if (bar) bar.style.width = `${nut.daysInMonth > 0 ? (nut.hit / nut.daysInMonth) * 100 : 0}%`;

  const targetPill = document.getElementById('tracker-nutrition-target');
  if (targetPill) targetPill.textContent = getTodayNutritionReached() ? 'Target Reached' : 'In Progress';

  const wk = sessionsThisCalendarWeek();
  setText('tracker-weekly-sessions', `${wk} session${wk === 1 ? '' : 's'}`);

  const weeks    = getWeeklySessionCounts();
  const maxBar   = Math.max(1, ...weeks, 5);
  const barMaxPx = 120;
  const barsEl   = document.getElementById('tracker-weekly-bars');
  if (barsEl) {
    barsEl.innerHTML = weeks.map((count, i) => {
      const h = Math.round(Math.max(8, (count / maxBar) * barMaxPx));
      return `
      <div class="weekly-bar-wrap">
        <div class="weekly-bar ${count ? '' : 'empty'}" style="height:${h}px;"></div>
        <span class="weekly-bar-label">Week ${i + 1}</span>
      </div>`;
    }).join('');
  }

  const wDisplay = document.getElementById('tracker-weight-display');
  if (wDisplay) wDisplay.textContent = state.weight ? `${state.weight} kg` : '— kg';

  renderSleepChart();
  renderWeightChart('weight-chart',         'weightChartInstance');
  renderWeightChart('weight-chart-tracker', 'weightChartTrackerInstance');
  renderWeightLogList();
  renderSleepLogList();
}

/* ============================================================
  18. CHARTS (Chart.js)
  ============================================================ */

function renderWeightChart(canvasId = 'weight-chart', instanceKey = 'weightChartInstance') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const last14 = state.weightLogs.slice(-14);
  const labels = last14.map(l => l.date?.seconds ? new Date(l.date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...');
  const data   = last14.map(l => l.weight);

  if (state[instanceKey]) {
    state[instanceKey].data.labels             = labels;
    state[instanceKey].data.datasets[0].data   = data;
    state[instanceKey].update();
    return;
  }

  state[instanceKey] = new Chart(canvas.getContext('2d'), {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label:            'Weight (kg)',
        data,
        borderColor:      '#ff8c5a',
        backgroundColor:  'rgba(255,140,90,0.12)',
        borderWidth:      2,
        pointBackgroundColor: '#ff8c5a',
        pointRadius:      4,
        tension:          0.3,
        fill:             true
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#adaaaa', font: { size: 10, weight: '700' } } },
        y: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#adaaaa', font: { size: 10, weight: '700' } } }
      }
    }
  });
}

function renderSleepChart() {
  const canvas = document.getElementById('sleep-chart');
  if (!canvas) return;

  const last14 = state.sleepLogs.slice(-14);
  const labels = last14.map(l => l.date?.seconds ? new Date(l.date.seconds*1000).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '...');
  const data   = last14.map(l => l.hours);
  const colors = data.map(h => h >= 7 ? '#ff8c5a' : '#ffbd59');

  if (state.sleepChartInstance) {
    state.sleepChartInstance.data.labels                          = labels;
    state.sleepChartInstance.data.datasets[0].data               = data;
    state.sleepChartInstance.data.datasets[0].backgroundColor    = colors;
    state.sleepChartInstance.update();
    return;
  }

  state.sleepChartInstance = new Chart(canvas.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label:           'Hours',
        data,
        backgroundColor: colors,
        borderRadius:    6,
        borderSkipped:   false,
      }]
    },
    options: {
      responsive:          true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#adaaaa', font: { size: 10 } } },
        y: { min: 0, max: 12, grid: { color: 'rgba(255,255,255,0.03)' }, ticks: { color: '#adaaaa', font: { size: 10 } } }
      }
    }
  });
}

/* ============================================================
  19. UTILITY HELPERS
  ============================================================ */

function getBadge(points) {
  return [...BADGES].reverse().find(b => points >= b.min) || BADGES[0];
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function escHtml(str) {
  if (typeof str !== 'string') return String(str);
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function safeId(str) {
  return str.replace(/\s+/g,'-').replace(/[^a-zA-Z0-9-_]/g,'').toLowerCase();
}

/* ============================================================
  20. BOOT — Wire up all event listeners and start the app
  ============================================================ */

function bootApp() {
  if (!state.user && !state.isGuestMode) return;

  showScreen('main-app');

  if (state.isProfileLoaded && !state.isGenerated) {
    showInitModal(false);
  } else if (state.isGenerated) {
    hideInitModal();
  }

  if (state.isGenerated && !state.welcomeSent) {
    addNotification(`Welcome back, Athlete.`);
    state.welcomeSent = true;
  }

  if (state.isGenerated && !state.aiNotifSent) {
    if (aiNotificationTimeoutId) clearTimeout(aiNotificationTimeoutId);
    aiNotificationTimeoutId = setTimeout(() => {
      addNotification('Need optimization tips? Ask Tito for a personalized strategy.');
      state.aiNotifSent = true;
      aiNotificationTimeoutId = null;
    }, 5000);
  }

  if (state.profilePhoto) {
    const img  = document.getElementById('topbar-avatar-img');
    const icon = document.getElementById('topbar-avatar-icon');
    if (img)  { img.src = state.profilePhoto; img.style.display = 'block'; }
    if (icon) icon.style.display = 'none';
  }

  const nextTab = state.activeTab || 'home';
  switchTab(nextTab);
  if (state.isGenerated) renderTrackerTab();
  refreshIcons();

  if (hydrationReminderIntervalId) return;

  hydrationReminderIntervalId = setInterval(() => {
    const now = new Date();
    const h = now.getHours(), m = now.getMinutes();
    if ([[10,0],[14,0],[18,0],[21,0]].some(([rh,rm]) => rh===h && rm===m)) {
      addNotification('Hydration Protocol: Consume 500ml of filtered water now.');
    }
  }, 60000);
}

/* ---- DOM Ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  // Treat untyped buttons as UI actions, not form submissions.
  document.querySelectorAll('button:not([type])').forEach((button) => {
    button.type = 'button';
  });

  // Placeholder links should not navigate the page.
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (e) => e.preventDefault());
  });

  // Landing page
  document.getElementById('get-started-btn')?.addEventListener('click', () => showScreen('auth-page'));

  // Auth page tabs
  document.querySelectorAll('[data-auth-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.authTab;
      document.querySelectorAll('[data-auth-tab]').forEach(b => b.classList.toggle('active', b.dataset.authTab === tab));
      document.getElementById('auth-login-form').style.display    = tab === 'login'    ? '' : 'none';
      document.getElementById('auth-register-form').style.display = tab === 'register' ? '' : 'none';
    });
  });

  document.getElementById('login-btn')?.addEventListener('click', () => {
    const email = document.getElementById('login-email').value.trim();
    const pass  = document.getElementById('login-password').value;
    document.getElementById('login-error').style.display = 'none';
    emailSignIn(email, pass);
  });

  document.getElementById('register-btn')?.addEventListener('click', () => {
    const name  = document.getElementById('register-name').value.trim();
    const email = document.getElementById('register-email').value.trim();
    const pass  = document.getElementById('register-password').value;
    document.getElementById('register-error').style.display = 'none';
    emailRegister(name, email, pass);
  });

  document.getElementById('google-signin-btn')?.addEventListener('click', signInWithGoogle);

  document.getElementById('guest-btn')?.addEventListener('click', () => {
    state.isGuestMode     = true;
    state.isProfileLoaded = false;
    state.isGenerated     = false;
    showScreen('main-app');
    refreshIcons();
    setTimeout(() => showInitModal(false), 200);
  });

  document.getElementById('auth-back-btn')?.addEventListener('click', () => showScreen('landing-page'));

  // Main app nav
  document.querySelectorAll('[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', handleLogout);
  document.getElementById('profile-logout-btn')?.addEventListener('click', handleLogout);

  // Recalibrate
  document.getElementById('recalibrate-btn')?.addEventListener('click', () => showInitModal(true));

  // Init modal
  document.getElementById('generate-protocol-btn')?.addEventListener('click', handleGenerateProtocol);
  document.getElementById('init-modal-close')?.addEventListener('click', hideInitModal);

  // Notifications
  document.getElementById('notif-btn')?.addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('notif-dropdown')?.classList.toggle('open');
  });

  document.getElementById('notif-mute-btn')?.addEventListener('click', () => {
    state.isMuted = !state.isMuted;
    const btn = document.getElementById('notif-mute-btn');
    if (btn) btn.textContent = state.isMuted ? 'Unmute' : 'Mute';
    renderNotifications();
  });

  document.addEventListener('click', (e) => {
    const dd = document.getElementById('notif-dropdown');
    if (dd && !dd.contains(e.target) && e.target.id !== 'notif-btn') dd.classList.remove('open');
  });

  // Settings
  document.getElementById('settings-btn')?.addEventListener('click', openSettings);
  document.getElementById('settings-close')?.addEventListener('click', closeSettings);
  document.getElementById('settings-overlay')?.addEventListener('click', closeSettings);
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // Topbar avatar → profile tab
  document.getElementById('topbar-avatar')?.addEventListener('click', () => switchTab('profile'));

  // Weight log
  document.getElementById('log-weight-btn')?.addEventListener('click', () => {
    const val = parseFloat(document.getElementById('log-weight-input').value);
    if (isNaN(val)) return;
    if (state.user) {
      logWeight(val);
    } else {
      state.weightLogs.push({ id: Date.now().toString(), weight: val, date: { seconds: Math.floor(Date.now()/1000) } });
      renderWeightChart();
      renderWeightChart('weight-chart-tracker', 'weightChartTrackerInstance');
      renderWeightLogList();
      updateHomeStats();
      addNotification(`Weight logged: ${val} kg`);
    }
    document.getElementById('log-weight-input').value = '';
  });

  // Gym log
  document.getElementById('log-gym-btn')?.addEventListener('click', () => {
    logGym(true);
  });

  // Nutrition log
  document.getElementById('log-nutrition-yes')?.addEventListener('click', () => {
    logNutrition(true);
  });
  document.getElementById('log-nutrition-no')?.addEventListener('click', () => {
    logNutrition(false);
  });

  // Sleep log
  document.getElementById('log-sleep-btn')?.addEventListener('click', () => {
    const hours = parseFloat(document.getElementById('sleep-input').value);
    if (isNaN(hours)) return;
    if (state.user) {
      logSleep(hours);
    } else {
      state.sleepLogs.push({ id: Date.now().toString(), hours, date: { seconds: Math.floor(Date.now()/1000) } });
      renderSleepChart();
      renderSleepLogList();
      updateHomeStats();
      addNotification(`Sleep logged: ${hours} hrs`);
    }
    document.getElementById('sleep-input').value = '';
  });

  // Workout env / session tabs
  document.querySelectorAll('#env-tabs .session-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#env-tabs .session-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.workoutEnv = btn.dataset.env;
      renderExerciseList();
    });
  });

  document.querySelectorAll('#session-tabs .session-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#session-tabs .session-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.workoutSession = btn.dataset.session;
      renderExerciseList();
    });
  });

  // Add exercise
  document.getElementById('add-exercise-toggle')?.addEventListener('click', () => {
    document.getElementById('add-exercise-form')?.classList.toggle('open');
    refreshIcons();
  });

  document.getElementById('save-exercise-btn')?.addEventListener('click', addExercise);
  document.getElementById('cancel-exercise-btn')?.addEventListener('click', () => {
    document.getElementById('add-exercise-form')?.classList.remove('open');
  });

  // Profile save
  document.getElementById('profile-save-btn')?.addEventListener('click', saveProfileFromForm);

  // Profile photo
  document.getElementById('profile-photo-input')?.addEventListener('change', handlePhotoUpload);

  // Macro override
  document.getElementById('macro-override-btn')?.addEventListener('click', openMacroModal);
  document.getElementById('macro-modal-close')?.addEventListener('click', closeMacroModal);
  document.getElementById('macro-save-btn')?.addEventListener('click', saveMacroOverride);
  document.getElementById('macro-reset-btn')?.addEventListener('click', resetMacroOverride);
  document.getElementById('macro-modal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeMacroModal();
  });

  // Delete account
  ['settings-delete-btn', 'profile-delete-btn'].forEach(id => {
    document.getElementById(id)?.addEventListener('click', () => {
      if (confirm('CRITICAL: Are you sure you want to permanently delete your athlete profile? This action is irreversible.')) {
        alert('Account deletion initiated. Please contact support for final verification.');
      }
    });
  });

  // Chatbot
  document.getElementById('chatbot-fab')?.addEventListener('click', openChatbot);
  document.getElementById('chatbot-close')?.addEventListener('click', closeChatbot);
  document.getElementById('chatbot-send')?.addEventListener('click', sendChatMessage);
  document.getElementById('chatbot-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChatMessage(); }
  });

  // Habits: 30-day table cells
  document.getElementById('habits-consistency-scroll')?.addEventListener('click', (e) => {
    const btn = e.target.closest('.cm-check');
    if (!btn || btn.disabled) return;
    const habitId = btn.getAttribute('data-habit');
    const day     = parseInt(btn.getAttribute('data-day'), 10);
    if (habitId && day) toggleHabit(habitId, day);
  });

  // Init lucide icons
  if (typeof lucide !== 'undefined') refreshIcons();
});

/* Expose globals needed by inline onclick handlers */
window.removeExercise    = removeExercise;
window.removeMeal        = removeMeal;
window.addMeal           = addMeal;
window.toggleMealAddForm = toggleMealAddForm;
window.deleteLog         = deleteLog;
window.deleteNotification = deleteNotification;
window.setMood           = setMood;
