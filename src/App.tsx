/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  LayoutDashboard, 
  Dumbbell, 
  Utensils, 
  TrendingUp, 
  Bell, 
  Settings, 
  Zap, 
  Activity, 
  ArrowRight,
  Home,
  User,
  Menu,
  MessageSquare,
  X,
  Plus,
  Minus,
  Moon,
  Smile,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Scale,
  Weight,
  Calendar,
  LogOut,
  LogIn,
  Droplets,
  Apple,
  Brain,
  Monitor,
  PenTool,
  Flame,
  Coffee,
  Sun,
  Target,
  Dna,
  Trophy,
  BellOff,
  Camera,
  Trash2,
  BicepsFlexed,
  History,
  Shield,
  Lock,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useMemo, useRef, Component } from 'react';
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  RadialBarChart,
  RadialBar,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { auth, db, signInWithGoogle, logout } from './firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  onSnapshot, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';

// --- Types ---
interface Exercise {
  name: string;
  sets: number;
  reps: string;
  note: string;
  description?: string;
}

interface Meal {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Habit {
  id: string;
  name: string;
  points: number;
  icon: any;
  description: string;
  color: string;
}

interface TrackerData {
  habits: Record<string, boolean>;
  sleep: Record<number, number>;
  mood: Record<number, string>;
  points: Record<number, number>;
  nutrition: Record<number, boolean>;
}

// --- Constants ---
const BADGES = [
  { name: 'Initiate', min: 0, color: 'text-gray-400', bg: 'bg-gray-400/10' },
  { name: 'Elite', min: 750, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { name: 'Master', min: 3000, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { name: 'Legend', min: 9000, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { name: 'Immortal', min: 18000, color: 'text-primary', bg: 'bg-primary/10' },
  { name: 'Apex', min: 39000, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
];

const getBadge = (points: number) => {
  return [...BADGES].reverse().find(b => points >= b.min) || BADGES[0];
};

const HABITS: Habit[] = [
  { id: 'gym', name: 'Elite Training', points: 35, icon: Dumbbell, description: 'Complete your daily workout protocol', color: 'text-primary' },
  { id: 'protein', name: 'Nutrition Target', points: 30, icon: Flame, description: 'Hit your daily macro protocol', color: 'text-red-400' },
  { id: 'no-junk', name: 'Recovery', points: 20, icon: Moon, description: 'Sleep target 7+', color: 'text-blue-500' },
  { id: 'clean-eat', name: 'Clean Fuel', points: 20, icon: Apple, description: 'Zero processed foods or sugars', color: 'text-green-400' },
  { id: 'water', name: 'Hydration', points: 15, icon: Droplets, description: 'Minimum 3L of filtered water', color: 'text-blue-400' },
  { id: 'meditation', name: 'Non-Exercise Movement', points: 10, icon: Activity, description: '10k steps or active recovery', color: 'text-emerald-400' },
  { id: 'journal', name: 'Mindset', points: 10, icon: Brain, description: 'Daily reflection and planning', color: 'text-orange-400' },
  { id: 'screen', name: 'Digital Detox', points: 10, icon: Monitor, description: 'Less than 2h recreational screen time', color: 'text-indigo-400' }
];

const MOODS = ['Happy', 'Neutral', 'Sad', 'Motivated', 'Tired', 'Sick'];

const NUTRITION_DATA: Record<string, { title: string; meals: Record<string, Meal[]> }> = {
  lose: {
    title: "Fat Loss Plan - High Protein",
    meals: {
      "Breakfast": [{ name: "Greek yogurt bowl + oats + berries", calories: 350, protein: 30, carbs: 40, fats: 8 }],
      "Lunch": [{ name: "Grilled chicken breast + quinoa + salad", calories: 450, protein: 45, carbs: 35, fats: 12 }],
      "Pre-Workout": [{ name: "Banana + whey protein shake", calories: 250, protein: 25, carbs: 30, fats: 2 }],
      "Post-Workout": [{ name: "Whey protein + 1 fruit", calories: 200, protein: 25, carbs: 25, fats: 1 }],
      "Dinner": [{ name: "Baked salmon + steamed vegetables", calories: 500, protein: 40, carbs: 15, fats: 25 }],
      "Snacks": [{ name: "Cottage cheese or skyr", calories: 150, protein: 20, carbs: 10, fats: 2 }]
    }
  },
  gain: {
    title: "Muscle Gain Plan - Lean Bulk",
    meals: {
      "Breakfast": [{ name: "Oats + banana + peanut butter + 3 eggs", calories: 700, protein: 35, carbs: 80, fats: 25 }],
      "Lunch": [{ name: "Lean beef + jasmine rice + avocado", calories: 850, protein: 50, carbs: 90, fats: 30 }],
      "Pre-Workout": [{ name: "Rice cakes + honey + whey", calories: 350, protein: 25, carbs: 60, fats: 2 }],
      "Post-Workout": [{ name: "Chicken pasta + olive oil", calories: 800, protein: 45, carbs: 100, fats: 20 }],
      "Dinner": [{ name: "Steak + sweet potato + greens", calories: 750, protein: 55, carbs: 60, fats: 35 }],
      "Snacks": [{ name: "Greek yogurt + mixed nuts", calories: 300, protein: 20, carbs: 15, fats: 18 }]
    }
  },
  health: {
    title: "Balanced Health Plan",
    meals: {
      "Breakfast": [{ name: "Whole-grain toast + avocado + eggs", calories: 450, protein: 20, carbs: 35, fats: 25 }],
      "Lunch": [{ name: "Mediterranean bowl with chickpeas", calories: 550, protein: 25, carbs: 65, fats: 20 }],
      "Pre-Workout": [{ name: "Apple + almonds", calories: 200, protein: 5, carbs: 25, fats: 12 }],
      "Post-Workout": [{ name: "Protein smoothie", calories: 300, protein: 30, carbs: 40, fats: 5 }],
      "Dinner": [{ name: "Grilled white fish + brown rice", calories: 450, protein: 35, carbs: 45, fats: 10 }],
      "Snacks": [{ name: "Herbal tea + protein pudding", calories: 150, protein: 15, carbs: 15, fats: 3 }]
    }
  }
};

const EXERCISE_DATA: Record<string, Record<string, Exercise[]>> = {
  gym: {
    push: [
      { name: "Incline Bench Press", sets: 4, reps: "8-10", note: "Upper chest focus", description: "Compound movement targeting the upper pectorals and anterior deltoids." },
      { name: "Shoulder Press (Machine)", sets: 3, reps: "10-12", note: "Keep core tight", description: "Overhead press to build shoulder strength and stability." },
      { name: "Cable Chest Flyes", sets: 3, reps: "15", note: "Constant tension", description: "Isolation exercise for chest definition and inner pectoral activation." },
      { name: "Tricep Pushdowns", sets: 3, reps: "12-15", note: "Elbows tucked", description: "Isolation for the triceps brachii using a cable machine." },
      { name: "Lateral Raises", sets: 3, reps: "15", note: "Control the weight", description: "Isolation for the lateral deltoids to build shoulder width." }
    ],
    pull: [
      { name: "Lat Pulldowns", sets: 4, reps: "10-12", note: "Squeeze shoulder blades", description: "Vertical pull targeting the latissimus dorsi for back width." },
      { name: "Seated Cable Rows", sets: 3, reps: "10-12", note: "Pull to belly button", description: "Horizontal pull targeting the mid-back and rhomboids for thickness." },
      { name: "Face Pulls", sets: 3, reps: "15", note: "Rear delt focus", description: "Corrective exercise for rear deltoids and upper back health." },
      { name: "Hammer Curls", sets: 3, reps: "12", note: "Neutral grip", description: "Bicep curl targeting the brachialis and brachioradialis." },
      { name: "Preacher Curls", sets: 3, reps: "10", note: "Full stretch", description: "Strict bicep isolation to prevent momentum and maximize peak." }
    ],
    legs: [
      { name: "Leg Press", sets: 4, reps: "10-12", note: "Deep range of motion", description: "Compound leg movement targeting quads, glutes, and hamstrings." },
      { name: "Leg Extensions", sets: 3, reps: "15", note: "Squeeze at top", description: "Isolation for the quadriceps to build definition." },
      { name: "Seated Leg Curls", sets: 3, reps: "12", note: "Control the eccentric", description: "Isolation for the hamstrings to build leg thickness." },
      { name: "Calf Raises (Machine)", sets: 4, reps: "15-20", note: "Full stretch", description: "Isolation for the gastrocnemius and soleus muscles." },
      { name: "Walking Lunges", sets: 3, reps: "12/leg", note: "Balance focus", description: "Unilateral compound movement for leg strength and stability." }
    ]
  },
  home: {
    push: [
      { name: "Push-ups", sets: 3, reps: "12-15", note: "Chest to floor", description: "Classic bodyweight movement for chest, shoulders, and triceps." },
      { name: "Diamond Push-ups", sets: 3, reps: "10", note: "Tricep focus", description: "Narrow grip push-up variation to emphasize the triceps." },
      { name: "Pike Push-ups", sets: 3, reps: "8-10", note: "Shoulder focus", description: "Bodyweight overhead press variation targeting the shoulders." },
      { name: "Dips (Chair)", sets: 3, reps: "12", note: "Keep back close to chair", description: "Tricep isolation using a stable elevated surface." },
      { name: "Plank Hold", sets: 3, reps: "60s", note: "Core tight", description: "Isometric core stability exercise." }
    ],
    pull: [
      { name: "Inverted Rows (Table)", sets: 3, reps: "10-12", note: "Pull chest to edge", description: "Bodyweight horizontal pull for back and bicep strength." },
      { name: "Superman Holds", sets: 3, reps: "30s", note: "Lower back focus", description: "Isometric exercise for the erector spinae and posterior chain." },
      { name: "Towel Bicep Curls", sets: 3, reps: "15", note: "Isolate the bicep", description: "Using a towel for resistance to target the biceps." },
      { name: "Doorway Rows", sets: 3, reps: "15", note: "One arm at a time", description: "Unilateral pull using a door frame for resistance." },
      { name: "Bird Dog", sets: 3, reps: "12/side", note: "Stability focus", description: "Core and posterior chain stability movement." }
    ],
    legs: [
      { name: "Bodyweight Squats", sets: 3, reps: "20", note: "Keep back straight", description: "Fundamental lower body movement for quads and glutes." },
      { name: "Lunges", sets: 3, reps: "12/leg", note: "Controlled descent", description: "Unilateral leg movement for strength and balance." },
      { name: "Glute Bridges", sets: 3, reps: "15", note: "Squeeze glutes", description: "Isolation for the glutes and hamstrings." },
      { name: "Bulgarian Split Squats", sets: 3, reps: "10/leg", note: "Elevate back foot", description: "Advanced unilateral movement for deep leg activation." },
      { name: "Calf Raises", sets: 4, reps: "25", note: "Slow and controlled", description: "Bodyweight isolation for the calves." }
    ]
  }
};

// --- Firestore Error Handling ---
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab, onLogout, onRecalibrate }: { activeTab: string; setActiveTab: (t: string) => void; onLogout: () => void; onRecalibrate: () => void }) => (
  <aside className="hidden lg:flex flex-col h-screen py-8 bg-surface border-r border-white/5 w-64 fixed left-0 top-0 shadow-[40px_0_40px_rgba(255,144,98,0.05)]">
    <div className="px-8 mb-12">
      <h1 className="text-3xl font-black text-primary italic tracking-tighter mb-8">VOLTAGE</h1>
    </div>
    <nav className="flex-1 flex flex-col">
      <button 
        onClick={() => setActiveTab('home')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'home' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <Home size={18} />
        Home
      </button>
      <button 
        onClick={() => setActiveTab('workouts')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'workouts' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <Dumbbell size={18} />
        Workouts
      </button>
      <button 
        onClick={() => setActiveTab('nutrition')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'nutrition' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <Utensils size={18} />
        Nutrition
      </button>
      <button 
        onClick={() => setActiveTab('tracker')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'tracker' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <TrendingUp size={18} />
        30-Day Tracker
      </button>
      <button 
        onClick={() => setActiveTab('habits')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'habits' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <Target size={18} />
        Habits
      </button>
      <button 
        onClick={() => setActiveTab('profile')}
        className={`flex items-center gap-4 px-8 py-4 transition-all duration-300 font-bold text-[10px] tracking-[0.2em] uppercase ${activeTab === 'profile' ? 'text-primary border-r-4 border-primary bg-gradient-to-r from-primary/5 to-transparent' : 'text-on-surface-variant hover:bg-surface-container hover:text-white'}`}
      >
        <User size={18} />
        Profile
      </button>
    </nav>
    <div className="px-6 mt-auto space-y-3">
      <button 
        onClick={onRecalibrate}
        className="w-full bg-surface-container-highest text-on-surface-variant hover:text-white font-black py-4 rounded-xl tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2 group h-[52px]"
      >
        <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
        RECALIBRATE
      </button>
      <button 
        onClick={onLogout}
        className="w-full bg-surface-container-highest text-on-surface-variant hover:text-white font-black py-4 rounded-xl tracking-widest text-[10px] transition-colors shadow-lg h-[52px]"
      >
        LOGOUT
      </button>
    </div>
  </aside>
);

const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => (
  <div className="min-h-screen bg-surface overflow-hidden relative">
    {/* Background Glows */}
    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-tertiary/10 blur-[120px] rounded-full" />

    <div className="max-w-7xl mx-auto px-6 pt-32 pb-20 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8"
      >
        <div className="inline-block px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Next-Gen Fitness Intelligence</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter leading-[0.9]">
          UNLEASH YOUR <br />
          <span className="text-primary">KINETIC POWER</span>
        </h1>
        
        <p className="max-w-2xl mx-auto text-on-surface-variant text-sm md:text-base font-medium leading-relaxed">
          Voltage is an elite performance dashboard designed for those who demand precision. 
          Synchronize your biometrics, track your evolution, and optimize your potential with AI-driven protocols.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-8">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGetStarted}
            className="px-10 py-5 kinetic-gradient text-on-primary-fixed font-black rounded-2xl tracking-widest uppercase shadow-[0_0_30px_rgba(255,144,98,0.3)]"
          >
            Get Started
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-5 bg-surface-container border border-white/10 text-white font-black rounded-2xl tracking-widest uppercase hover:bg-surface-container-highest transition-colors"
          >
            Learn More
          </motion.button>
        </div>
      </motion.div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32">
        {[
          { icon: Zap, title: "AI Elite Coach", desc: "Real-time performance optimization powered by advanced neural intelligence." },
          { icon: TrendingUp, title: "30-Day Evolution", desc: "Precision tracking for habits, recovery, and metabolic consistency." },
          { icon: Activity, title: "Biometric Sync", desc: "Dynamic protocols that adapt to your unique physiological profile." }
        ].map((f, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            className="bg-surface-container-low p-8 rounded-3xl border border-white/5 space-y-4 group hover:border-primary/30 transition-colors"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
              <f.icon size={24} />
            </div>
            <h3 className="text-lg font-black uppercase italic">{f.title}</h3>
            <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </div>
);

const LoginPage = ({ onLogin, onBack }: { onLogin: () => void; onBack: () => void }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onLogin();
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setError("Google login failed. Please try again.");
        console.error("Login failed", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
          // Also save to firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            name: name,
            createdAt: serverTimestamp()
          }, { merge: true });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err: any) {
      console.error("Auth error", err);
      if (err.code === 'auth/email-already-in-use') {
        setError("This email is already registered.");
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else if (err.code === 'auth/weak-password') {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Authentication failed. Ensure Email/Password is enabled in Firebase Console.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6 relative">
      <button 
        onClick={onBack}
        className="absolute top-8 left-8 text-on-surface-variant hover:text-white flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-colors"
      >
        <ChevronRight size={16} className="rotate-180" />
        Back to Home
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-surface-container p-10 rounded-2xl border border-white/5 space-y-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="text-4xl font-black text-primary italic tracking-tighter mb-2">VOLTAGE</div>
          <p className="text-[10px] text-on-surface-variant font-bold tracking-[0.2em] uppercase">
            {isSignUp ? 'Create Athlete Profile' : 'Elite Performance Access'}
          </p>
        </div>
        
        <form onSubmit={handleEmailAuth} className="space-y-4">
          {isSignUp && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Full Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                placeholder="John Doe"
              />
            </div>
          )}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Email Address</label>
            <input 
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              placeholder="athlete@voltage.com"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-1">Password</label>
            <input 
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
              {error}
            </p>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full kinetic-gradient text-on-primary-fixed font-black py-4 rounded-xl tracking-widest uppercase shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-on-primary-fixed border-t-transparent rounded-full animate-spin mx-auto" />
            ) : (
              isSignUp ? 'Initialize Profile' : 'Enter Dashboard'
            )}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5"></div>
          </div>
          <div className="relative flex justify-center text-[8px] uppercase tracking-[0.3em] font-black">
            <span className="bg-surface-container px-4 text-on-surface-variant">Or continue with</span>
          </div>
        </div>

        <button 
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white text-black font-black py-4 rounded-xl tracking-widest uppercase shadow-lg flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors disabled:opacity-50"
        >
          <LogIn size={20} />
          Google Account
        </button>

        <div className="text-center space-y-4">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
          >
            {isSignUp ? 'Already have an account? Login' : "Don't have an account? Sign Up"}
          </button>
          
          <p className="text-[8px] text-on-surface-variant uppercase tracking-widest leading-loose">
            By accessing the dashboard, you agree to the <br />
            <span className="text-primary">Kinetic Performance Protocols</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

const ManualMacroModal = ({ isOpen, onClose, onSave, currentMacros }: any) => {
  const [macros, setMacros] = useState(currentMacros || { cal: 2000, p: 150, c: 200, f: 60, w: 3 });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-surface-container p-8 rounded-3xl border border-white/10 shadow-2xl space-y-8"
      >
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter">Manual Protocol Override</h3>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Define your custom nutritional architecture</p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Calories (KCAL)</label>
            <input 
              type="number" 
              value={macros.cal} 
              onChange={(e) => setMacros({ ...macros, cal: Number(e.target.value) })}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Protein (G)</label>
            <input 
              type="number" 
              value={macros.p} 
              onChange={(e) => setMacros({ ...macros, p: Number(e.target.value) })}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Carbs (G)</label>
            <input 
              type="number" 
              value={macros.c} 
              onChange={(e) => setMacros({ ...macros, c: Number(e.target.value) })}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Fat (G)</label>
            <input 
              type="number" 
              value={macros.f} 
              onChange={(e) => setMacros({ ...macros, f: Number(e.target.value) })}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2 col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">Hydration (L)</label>
            <input 
              type="number" 
              step="0.1"
              value={macros.w} 
              onChange={(e) => setMacros({ ...macros, w: Number(e.target.value) })}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            onClick={() => onSave(null)}
            className="flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 hover:bg-white/5 transition-all"
          >
            Reset to Auto
          </button>
          <button 
            onClick={() => onSave(macros)}
            className="flex-1 kinetic-gradient text-on-primary-fixed font-black py-4 rounded-xl text-[10px] tracking-widest uppercase shadow-lg transition-all"
          >
            Apply Protocol
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfilePage = ({ weight, height, age, sex, activityLevel, goal, setWeight, setHeight, setAge, setSex, setActivityLevel, setGoal, stats, profilePhoto, onPhotoUpload, onRemovePhoto, athleteName, setAthleteName, currentDay }: any) => (
  <div className="space-y-12">
    <div className="flex items-center gap-8">
      <div className="relative group">
        <div className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white/5 shadow-2xl bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={64} />
          )}
        </div>
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-2xl">
          <label className="cursor-pointer p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors">
            <Camera size={18} />
            <input type="file" className="hidden" accept="image/*" onChange={onPhotoUpload} />
          </label>
          {profilePhoto && (
            <button onClick={onRemovePhoto} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/40 transition-colors">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-5xl font-black italic tracking-tighter uppercase leading-none">Athlete Profile</h2>
        <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-2">Current Status: Day {currentDay}</p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Biometrics */}
      <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Biometrics</h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Athlete Name</label>
            <input 
              type="text" 
              value={athleteName} 
              onChange={(e) => setAthleteName(e.target.value)}
              placeholder="Enter your name"
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Weight (KG)</label>
            <input 
              type="number" 
              value={weight} 
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Height (CM)</label>
            <input 
              type="number" 
              value={height} 
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Age</label>
            <input 
              type="number" 
              value={age} 
              onChange={(e) => setAge(Number(e.target.value))}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Sex</label>
            <select 
              value={sex} 
              onChange={(e) => setSex(e.target.value)}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>
      </div>

      {/* Performance Config */}
      <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Performance Config</h3>
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Performance Goal</label>
            <select 
              value={goal} 
              onChange={(e) => setGoal(e.target.value)}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="lose">Fat Loss / Definition</option>
              <option value="gain">Hypertrophy / Power</option>
              <option value="health">Endurance / Longevity</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Activity Level</label>
            <select 
              value={activityLevel} 
              onChange={(e) => setActivityLevel(e.target.value)}
              className="w-full bg-surface-container-low border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:border-primary transition-all appearance-none"
            >
              <option value="Sedentary">Sedentary</option>
              <option value="Lightly Active">Lightly Active</option>
              <option value="Moderately Active">Moderately Active</option>
              <option value="Very Active">Very Active</option>
              <option value="Elite Athlete">Elite Athlete</option>
            </select>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6">
        <h3 className="text-sm font-black uppercase tracking-widest text-on-surface-variant">Achievements</h3>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-widest">Total Points</span>
            <span className="text-lg font-black text-white">{stats.totalPoints}</span>
          </div>
          <div className="pt-4 border-t border-white/5">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-4">Current Badge</p>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${getBadge(stats.totalPoints).bg} flex items-center justify-center ${getBadge(stats.totalPoints).color}`}>
                <Trophy size={24} />
              </div>
              <div>
                <h4 className={`font-black uppercase italic text-sm ${getBadge(stats.totalPoints).color}`}>{getBadge(stats.totalPoints).name}</h4>
                <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Rank Authenticated</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SettingsDrawer = ({ isOpen, onClose, theme, setTheme }: any) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-80 bg-surface-container border-l border-white/10 z-[70] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Settings size={20} className="text-primary" />
                <h2 className="text-lg font-black uppercase italic tracking-tight">System Settings</h2>
              </div>
              <button onClick={onClose} className="text-on-surface-variant hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Appearance</h3>
                <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    {theme === 'dark' ? <Moon size={18} className="text-primary" /> : <Sun size={18} className="text-primary" />}
                    <span className="text-xs font-bold uppercase tracking-widest">Change Mode</span>
                  </div>
                  <button 
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`w-12 h-6 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-primary' : 'bg-surface-container-highest'}`}
                  >
                    <motion.div 
                      animate={{ x: theme === 'dark' ? 24 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Account Security</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <Lock size={18} className="text-on-surface-variant group-hover:text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">Change Password</span>
                    </div>
                    <ChevronRight size={16} className="text-on-surface-variant" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 bg-surface-container-low rounded-xl border border-white/5 hover:border-primary/30 transition-all group">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-on-surface-variant group-hover:text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest">Two-Factor Auth</span>
                    </div>
                    <div className="px-2 py-1 bg-surface-container-highest rounded text-[8px] font-black uppercase text-on-surface-variant">Disabled</div>
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-400">Danger Zone</h3>
                <button 
                  onClick={() => {
                    if (window.confirm("CRITICAL: Are you sure you want to permanently delete your athlete profile? This action is irreversible.")) {
                      alert("Account deletion protocol initiated. Please contact support for final verification.");
                    }
                  }}
                  className="w-full flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20 transition-all group"
                >
                  <Trash2 size={18} />
                  <span className="text-xs font-bold uppercase tracking-widest">Delete Account</span>
                </button>
              </div>
            </div>

            <div className="p-6 border-t border-white/10 bg-surface-container-low">
              <p className="text-[8px] text-on-surface-variant uppercase tracking-[0.3em] text-center font-black">Voltage Elite v2.4.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TopBar = ({ 
  notifications, 
  isNotificationsOpen, 
  setIsNotificationsOpen, 
  isMuted, 
  setIsMuted, 
  profilePhoto, 
  onDeleteNotification,
  setIsSettingsOpen,
  setActiveTab
}: any) => (
  <header className="w-full top-0 sticky bg-surface/80 backdrop-blur-xl z-50 border-b border-white/5">
    <div className="flex justify-between items-center px-8 py-4 w-full gap-6">
      <div className="text-2xl font-black text-primary italic tracking-tighter">VOLTAGE</div>
      <div className="flex items-center gap-6 ml-auto">
        <div className="relative">
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="text-on-surface-variant hover:text-primary transition-colors relative"
          >
            {isMuted ? <BellOff size={20} /> : <Bell size={20} />}
            {!isMuted && notifications.some((n: any) => !n.read) && (
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
            )}
          </button>
          
          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-4 w-80 bg-surface-container p-4 rounded-2xl border border-white/10 shadow-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest">Notifications</h4>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-[8px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-primary"
                  >
                    {isMuted ? 'Unmute' : 'Mute'}
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3 scrollbar-hide">
                  {notifications.length === 0 ? (
                    <p className="text-[10px] text-on-surface-variant text-center py-4">No new transmissions.</p>
                  ) : (
                    notifications.map((n: any) => (
                      <div key={n.id} className="p-3 bg-surface-container-low rounded-xl border border-white/5 space-y-1 relative group">
                        <button 
                          onClick={() => onDeleteNotification(n.id)}
                          className="absolute top-2 right-2 text-on-surface-variant hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                        <p className="text-[10px] text-white leading-relaxed pr-4">{n.text}</p>
                        <p className="text-[8px] text-on-surface-variant uppercase">{n.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="text-on-surface-variant hover:text-primary transition-colors"
        >
          <Settings size={20} />
        </button>

        <button 
          onClick={() => setActiveTab('profile')}
          className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shadow-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant hover:border-primary/50 transition-all"
        >
          {profilePhoto ? (
            <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <User size={20} />
          )}
        </button>
      </div>
    </div>
  </header>
);

const StatCard = ({ label, value, unit, subtext, colorClass, progress, icon: Icon }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-surface-container-low p-6 rounded-xl relative overflow-hidden group border-l-4 ${colorClass}`}
  >
    {Icon && (
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-30 transition-opacity">
        <Icon size={48} className="text-primary" />
      </div>
    )}
    <label className="text-[10px] text-on-surface-variant uppercase tracking-[0.2em] font-bold">{label}</label>
    <div className="flex items-baseline gap-2 mt-2">
      <span className="text-4xl font-black tracking-tighter">{value}</span>
      <span className="text-primary text-xs font-bold">{unit}</span>
    </div>
    {progress !== undefined ? (
      <div className="mt-6 flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="text-[10px] font-bold text-primary whitespace-nowrap">{progress}% OF GOAL</span>
      </div>
    ) : (
      <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest">{subtext}</p>
    )}
  </motion.div>
);

const ChatBot = ({ 
  goal, 
  meals, 
  exercises, 
  customNutritionData, 
  setCustomNutritionData, 
  customExerciseData, 
  setCustomExerciseData,
  user,
  db
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot' | 'system'; text: string }[]>([
    { role: 'bot', text: "I'm your Voltage Elite Coach. How can I optimize your performance today?" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsTyping(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
      
      const addMealFunction: FunctionDeclaration = {
        name: "addMeal",
        description: "Add a meal to a specific category with nutritional values.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ["Breakfast", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Snacks"],
              description: "The meal category to add to."
            },
            mealName: {
              type: Type.STRING,
              description: "The name of the meal to add."
            },
            calories: {
              type: Type.NUMBER,
              description: "Estimated calories."
            },
            protein: {
              type: Type.NUMBER,
              description: "Estimated protein in grams."
            },
            carbs: {
              type: Type.NUMBER,
              description: "Estimated carbs in grams."
            },
            fats: {
              type: Type.NUMBER,
              description: "Estimated fats in grams."
            }
          },
          required: ["category", "mealName", "calories", "protein", "carbs", "fats"]
        }
      };

      const removeMealFunction: FunctionDeclaration = {
        name: "removeMeal",
        description: "Remove a meal from a specific category or remove all meals.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: {
              type: Type.STRING,
              enum: ["Breakfast", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Snacks", "All"],
              description: "The category to remove from, or 'All' to clear everything."
            },
            mealName: {
              type: Type.STRING,
              description: "The name of the meal to remove. If category is 'All', this is ignored."
            }
          },
          required: ["category"]
        }
      };

      const addExerciseFunction: FunctionDeclaration = {
        name: "addExercise",
        description: "Add an exercise to a specific workout environment and session.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            environment: {
              type: Type.STRING,
              enum: ["gym", "home"],
              description: "The workout environment."
            },
            session: {
              type: Type.STRING,
              enum: ["push", "pull", "legs"],
              description: "The workout session."
            },
            exerciseName: {
              type: Type.STRING,
              description: "The name of the exercise."
            },
            sets: {
              type: Type.NUMBER,
              description: "Number of sets."
            },
            reps: {
              type: Type.STRING,
              description: "Rep range (e.g. '8-12')."
            },
            description: {
              type: Type.STRING,
              description: "A short description of the exercise and its benefits."
            }
          },
          required: ["environment", "session", "exerciseName", "description"]
        }
      };

      const removeExerciseFunction: FunctionDeclaration = {
        name: "removeExercise",
        description: "Remove an exercise from a specific workout environment and session.",
        parameters: {
          type: Type.OBJECT,
          properties: {
            environment: {
              type: Type.STRING,
              enum: ["gym", "home"],
              description: "The workout environment."
            },
            session: {
              type: Type.STRING,
              enum: ["push", "pull", "legs"],
              description: "The workout session."
            },
            exerciseName: {
              type: Type.STRING,
              description: "The name of the exercise to remove."
            }
          },
          required: ["environment", "session", "exerciseName"]
        }
      };

      const systemPrompt = `You are a supportive Elite Performance Fitness Coach. 
      Current Plan: Goal: ${goal}, Meals: ${meals.join(', ')}, Exercises: ${exercises.join(', ')}.
      Help the user modify their plan or answer fitness questions. 
      You can add or remove meals and exercises using the provided tools.

      COACHING GUIDELINES:
      1. When adding exercises, ALWAYS provide a concise, high-impact description (e.g., "Control the weight, Elbows tucked", "Explosive concentric, Slow eccentric").
      2. When adding meals, provide realistic estimates for calories, protein, carbs, and fats based on the meal name.
      
      FORMATTING RULES:
      1. DO NOT use excessive markdown bold (**) or headers (###).
      2. Use simple new lines and tabulations (spaces) for lists and structure.
      3. Write in a clean, professional, and high-performance oriented style.
      4. Avoid long paragraphs; break information into readable chunks.
      5. Use "    " (4 spaces) for indentation where appropriate.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: "Understood. I am ready to assist." }] },
          { role: 'user', parts: [{ text: userText }] }
        ],
        config: {
          tools: [{ functionDeclarations: [addMealFunction, removeMealFunction, addExerciseFunction, removeExerciseFunction] }]
        }
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        const functionResponses: any[] = [];
        
        // Prepare new data objects to avoid side effects in state updaters
        let updatedNutrition = { ...customNutritionData };
        let updatedExercise = { ...customExerciseData };
        let nutritionChanged = false;
        let exerciseChanged = false;

        for (const call of functionCalls) {
          let result = { status: "success" };
          try {
            if (call.name === 'addMeal') {
              const { category, mealName, calories, protein, carbs, fats } = call.args as any;
              if (!updatedNutrition[goal]) updatedNutrition[goal] = { title: goal, meals: {} };
              if (!updatedNutrition[goal].meals[category]) updatedNutrition[goal].meals[category] = [];
              if (!updatedNutrition[goal].meals[category].some((m: any) => m.name === mealName)) {
                updatedNutrition[goal].meals[category] = [
                  ...updatedNutrition[goal].meals[category], 
                  { name: mealName, calories: calories || 0, protein: protein || 0, carbs: carbs || 0, fats: fats || 0 }
                ];
                nutritionChanged = true;
              }
            } else if (call.name === 'removeMeal') {
              const { category, mealName } = call.args as any;
              if (category === 'All') {
                if (updatedNutrition[goal]) {
                  Object.keys(updatedNutrition[goal].meals).forEach(cat => {
                    updatedNutrition[goal].meals[cat] = [];
                  });
                  nutritionChanged = true;
                }
              } else if (updatedNutrition[goal] && updatedNutrition[goal].meals[category]) {
                const originalCount = updatedNutrition[goal].meals[category].length;
                updatedNutrition[goal].meals[category] = updatedNutrition[goal].meals[category].filter((m: any) => m.name !== mealName);
                if (updatedNutrition[goal].meals[category].length !== originalCount) {
                  nutritionChanged = true;
                }
              }
            } else if (call.name === 'addExercise') {
              const { environment, session, exerciseName, sets, reps, description } = call.args as any;
              if (!updatedExercise[environment]) updatedExercise[environment] = {};
              if (!updatedExercise[environment][session]) updatedExercise[environment][session] = [];
              if (!updatedExercise[environment][session].some((e: any) => e.name === exerciseName)) {
                updatedExercise[environment][session] = [
                  ...updatedExercise[environment][session],
                  { name: exerciseName, sets: sets || 3, reps: reps || "10-12", note: "Added by AI Coach", description: description || "" }
                ];
                exerciseChanged = true;
              }
            } else if (call.name === 'removeExercise') {
              const { environment, session, exerciseName } = call.args as any;
              if (updatedExercise[environment] && updatedExercise[environment][session]) {
                const originalCount = updatedExercise[environment][session].length;
                updatedExercise[environment][session] = updatedExercise[environment][session].filter((e: any) => e.name !== exerciseName);
                if (updatedExercise[environment][session].length !== originalCount) {
                  exerciseChanged = true;
                }
              }
            }
          } catch (e) {
            result = { status: "error" };
          }
          
          functionResponses.push({
            functionResponse: {
              name: call.name,
              response: result
            }
          });
        }

        // Apply state updates
        if (nutritionChanged) {
          setCustomNutritionData(updatedNutrition);
          if (user) setDoc(doc(db, 'users', user.uid), { customNutritionData: updatedNutrition }, { merge: true });
        }
        if (exerciseChanged) {
          setCustomExerciseData(updatedExercise);
          if (user) setDoc(doc(db, 'users', user.uid), { customExerciseData: updatedExercise }, { merge: true });
        }
        
        const followUpResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: "Understood. I am ready to assist." }] },
            { role: 'user', parts: [{ text: userText }] },
            { role: 'model', parts: response.candidates?.[0]?.content?.parts || [] },
            { role: 'user', parts: functionResponses }
          ]
        });
        const reply = followUpResponse.text || "I've updated your plan as requested.";
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      } else {
        const reply = response.text || "I'm sorry, I couldn't process that. Let's try again.";
        setMessages(prev => [...prev, { role: 'bot', text: reply }]);
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'system', text: "AI Coach is currently offline. Please check your connection." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 kinetic-gradient rounded-full flex items-center justify-center text-on-primary-fixed shadow-lg hover:scale-110 transition-transform group relative"
          title="Ask AI Coach"
        >
          <MessageSquare size={24} />
          <span className="absolute right-16 bg-surface-container px-3 py-1 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Ask AI</span>
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-8 w-80 h-[450px] bg-surface-container border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden glass-panel"
          >
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-primary/10">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-primary" />
                <span className="font-bold text-sm tracking-tight">ELITE COACH</span>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-on-surface-variant hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-primary text-on-primary-fixed font-medium' : m.role === 'system' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-surface-container-highest text-white'}`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-surface-container-highest p-3 rounded-xl flex gap-1">
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-primary rounded-full" />
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your coach..."
                className="flex-1 bg-surface-container-low border border-white/5 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
              />
              <button onClick={handleSend} className="p-2 kinetic-gradient rounded-lg text-on-primary-fixed">
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [workoutType, setWorkoutType] = useState<'gym' | 'home'>('gym');
  const [workoutSession, setWorkoutSession] = useState<'push' | 'pull' | 'legs'>('push');
  const [weight, setWeight] = useState<number>(75);
  const [height, setHeight] = useState<number>(175);
  const [age, setAge] = useState<number>(25);
  const [sex, setSex] = useState<string>('Male');
  const [activityLevel, setActivityLevel] = useState<string>('Moderately Active');
  const [goal, setGoal] = useState('lose');
  const [isGenerated, setIsGenerated] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  const [manualMacros, setManualMacros] = useState<{ cal: number, p: number, c: number, f: number, w: number } | null>(null);
  const [isManualOverrideOpen, setIsManualOverrideOpen] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<{ id: string; text: string; time: Date; read: boolean }[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [lastBadge, setLastBadge] = useState<string | null>(null);
  const [athleteName, setAthleteName] = useState<string>('');
  const [aiNotifSent, setAiNotifSent] = useState(false);
  const [customExerciseData, setCustomExerciseData] = useState(EXERCISE_DATA);
  const [customNutritionData, setCustomNutritionData] = useState(NUTRITION_DATA);
  const [activeHistory, setActiveHistory] = useState<string | null>(null);
  const welcomeSent = useRef(false);
  const [addingExerciseTo, setAddingExerciseTo] = useState<string | null>(null);
  const [addingMealTo, setAddingMealTo] = useState<string | null>(null);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState<number | ''>('');
  const [newExerciseReps, setNewExerciseReps] = useState('');
  const [newExerciseDescription, setNewExerciseDescription] = useState('');
  const [newMealName, setNewMealName] = useState('');
  const [newMealCalories, setNewMealCalories] = useState<number | ''>('');
  const [newMealProtein, setNewMealProtein] = useState<number | ''>('');
  const [newMealCarbs, setNewMealCarbs] = useState<number | ''>('');
  const [newMealFats, setNewMealFats] = useState<number | ''>('');

  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const saveProfile = async (updates: any) => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (athleteName) saveProfile({ name: athleteName });
    }, 1000);
    return () => clearTimeout(timer);
  }, [athleteName]);

  const addNotification = (text: string) => {
    if (isMuted) return;
    setNotifications(prev => [{ id: Math.random().toString(36).substr(2, 9), text, time: new Date(), read: false }, ...prev].slice(0, 20));
  };

  // Tracker State
  const [tracker, setTracker] = useState<TrackerData>({ habits: {}, sleep: {}, mood: {}, points: {}, nutrition: {} });
  const [weightLogs, setWeightLogs] = useState<any[]>([]);
  const [sleepLogs, setSleepLogs] = useState<any[]>([]);
  const [gymLogs, setGymLogs] = useState<any[]>([]);
  const [nutritionLogs, setNutritionLogs] = useState<any[]>([]);

  const currentDay = useMemo(() => Math.min(new Date().getDate(), 30), []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
      if (u) setShowAuth(false);
    });
    return unsubscribe;
  }, []);

  // Firestore Sync
  useEffect(() => {
    if (!user) return;

    // Sync User Profile
    const userDocRef = doc(db, 'users', user.uid);
    const unsubUser = onSnapshot(userDocRef, (docSnap) => {
      setIsProfileLoaded(true);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGoal(data.goal || 'lose');
        setWeight(data.startWeight || 75);
        setProfilePhoto(data.photoURL || null);
        setAthleteName(data.name || '');
        setIsGenerated(true);
        if (data.customExerciseData) setCustomExerciseData(data.customExerciseData);
        if (data.customNutritionData) {
          setCustomNutritionData(data.customNutritionData);
        } else {
          // Initialize with default NUTRITION_DATA if not present
          setCustomNutritionData(NUTRITION_DATA);
          saveProfile({ customNutritionData: NUTRITION_DATA });
        }
      } else {
        setIsGenerated(false);
      }
    }, (error) => {
      setIsProfileLoaded(true);
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
    });

    // Sync Weight Logs
    const weightQuery = query(collection(db, `users/${user.uid}/weightLogs`), orderBy('date', 'asc'));
    const unsubWeight = onSnapshot(weightQuery, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setWeightLogs(logs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/weightLogs`));

    // Sync Sleep Logs
    const sleepQuery = query(collection(db, `users/${user.uid}/sleepLogs`), orderBy('date', 'asc'));
    const unsubSleep = onSnapshot(sleepQuery, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setSleepLogs(logs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/sleepLogs`));

    // Sync Gym Logs
    const gymQuery = query(collection(db, `users/${user.uid}/gymLogs`), orderBy('date', 'asc'));
    const unsubGym = onSnapshot(gymQuery, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setGymLogs(logs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/gymLogs`));

    // Sync Nutrition Logs
    const nutritionQuery = query(collection(db, `users/${user.uid}/nutritionLogs`), orderBy('date', 'asc'));
    const unsubNutrition = onSnapshot(nutritionQuery, (snap) => {
      const logs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setNutritionLogs(logs);
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}/nutritionLogs`));

    return () => {
      unsubUser();
      unsubWeight();
      unsubSleep();
      unsubGym();
      unsubNutrition();
    };
  }, [user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setProfilePhoto(base64String);
      try {
        await setDoc(doc(db, 'users', user.uid), { photoURL: base64String }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = async () => {
    if (!user) return;
    setProfilePhoto(null);
    try {
      await setDoc(doc(db, 'users', user.uid), { photoURL: null }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const handleInitialize = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        goal,
        startWeight: weight,
        height,
        age,
        sex,
        activityLevel,
        customNutritionData: NUTRITION_DATA,
        createdAt: serverTimestamp()
      }, { merge: true });
      setIsGenerated(true);
      setIsRecalibrating(false);
      addNotification(isRecalibrating ? "Protocol recalibrated. Your strategy has been updated." : "Welcome, Athlete. Your Elite Protocol is now initialized. Time to execute.");
      welcomeSent.current = true;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  const logWeight = async (val: number) => {
    if (!user) return;
    // Enforce 20-100 range
    const sanitizedWeight = Math.max(20, Math.min(100, val));
    
    try {
      // Check if today's log already exists
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingToday = weightLogs.find(l => {
        if (!l.date?.seconds) return false;
        const d = new Date(l.date.seconds * 1000);
        return d >= today;
      });

      if (existingToday) {
        await setDoc(doc(db, `users/${user.uid}/weightLogs`, existingToday.id), {
          weight: sanitizedWeight,
          date: serverTimestamp()
        }, { merge: true });
      } else {
        await addDoc(collection(db, `users/${user.uid}/weightLogs`), {
          userId: user.uid,
          weight: sanitizedWeight,
          date: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/weightLogs`);
    }
  };

  const logSleep = async (hours: number) => {
    if (!user) return;
    // Enforce 0-12 range
    const sanitizedHours = Math.max(0, Math.min(12, hours));
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingToday = sleepLogs.find(l => {
        if (!l.date?.seconds) return false;
        const d = new Date(l.date.seconds * 1000);
        return d >= today;
      });

      if (existingToday) {
        await setDoc(doc(db, `users/${user.uid}/sleepLogs`, existingToday.id), {
          hours: sanitizedHours,
          date: serverTimestamp()
        }, { merge: true });
      } else {
        await addDoc(collection(db, `users/${user.uid}/sleepLogs`), {
          userId: user.uid,
          hours: sanitizedHours,
          date: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/sleepLogs`);
    }
  };

  const logGym = async (completed: boolean) => {
    if (!user) return;
    try {
      await addDoc(collection(db, `users/${user.uid}/gymLogs`), {
        userId: user.uid,
        completed,
        date: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/gymLogs`);
    }
  };

  const logNutrition = async (reached: boolean) => {
    if (!user) return;
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const existingToday = nutritionLogs.find(l => {
        if (!l.date?.seconds) return false;
        const d = new Date(l.date.seconds * 1000);
        return d >= today;
      });

      if (existingToday) {
        await setDoc(doc(db, `users/${user.uid}/nutritionLogs`, existingToday.id), {
          reached,
          date: serverTimestamp()
        }, { merge: true });
      } else {
        await addDoc(collection(db, `users/${user.uid}/nutritionLogs`), {
          userId: user.uid,
          reached,
          date: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/nutritionLogs`);
    }
  };

  const deleteLog = async (collectionName: string, logId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/${collectionName}`, logId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `users/${user.uid}/${collectionName}/${logId}`);
    }
  };

  const bmi = useMemo(() => {
    if (!weight || !height) return 0;
    return parseFloat((weight / ((height / 100) ** 2)).toFixed(1));
  }, [weight, height]);

  const bmiStatus = useMemo(() => {
    let label = "Healthy";
    let color = "text-amber-500";
    let pos = 35;
    let hex = "#ff9062";

    if (bmi < 18.5) {
      label = "Underweight";
      color = "text-yellow-400";
      pos = 15;
      hex = "#ffbd59";
    } else if (bmi < 25) {
      label = "Healthy";
      color = "text-amber-500";
      pos = 40;
      hex = "#ff9062";
    } else if (bmi < 30) {
      label = "Overweight";
      color = "text-orange-600";
      pos = 70;
      hex = "#ff4d00";
    } else {
      label = "Obese";
      color = "text-red-600";
      pos = 90;
      hex = "#8b0000";
    }
    return { label, color, pos, hex };
  }, [bmi]);

  const toggleHabit = (habitId: string, day: number) => {
    if (day > currentDay) return;
    const key = `${habitId}-${day}`;
    setTracker(prev => {
      const newHabits = { ...prev.habits, [key]: !prev.habits[key] };
      
      // Update points for the day
      let dayPoints = 0;
      HABITS.forEach(h => {
        if (newHabits[`${h.id}-${day}`]) dayPoints += h.points;
      });
      
      return {
        ...prev,
        habits: newHabits,
        points: { ...prev.points, [day]: dayPoints }
      };
    });
  };

  const setSleep = (hours: number) => {
    setTracker(prev => ({
      ...prev,
      sleep: { ...prev.sleep, [currentDay]: hours }
    }));
  };

  const setMood = (mood: string) => {
    setTracker(prev => ({
      ...prev,
      mood: { ...prev.mood, [currentDay]: mood }
    }));
  };

  const stats = useMemo(() => {
    let streak = 0;
    for (let d = currentDay; d >= 1; d--) {
      const hasAny = HABITS.some(h => tracker.habits[`${h.id}-${d}`]);
      if (hasAny) streak++; else break;
    }
    const totalPoints = (Object.values(tracker.points) as number[]).reduce((a, b) => a + b, 0);
    const gymSessions = gymLogs.filter(l => l.completed).length;
    
    // Current week sessions for warning
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const currentWeekSessions = gymLogs.filter(l => {
      if (!l.date?.seconds) return false;
      const d = new Date(l.date.seconds * 1000);
      return d >= startOfWeek && l.completed;
    }).length;

    const bmi = weight && height ? (weight / Math.pow(height / 100, 2)).toFixed(1) : "0.0";
    
    // Monthly Metrics
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlySleepLogs = sleepLogs.filter(l => {
      if (!l.date?.seconds) return false;
      const d = new Date(l.date.seconds * 1000);
      return d >= firstOfMonth;
    });
    const avgSleep = monthlySleepLogs.length > 0 
      ? (monthlySleepLogs.reduce((acc, curr) => acc + curr.hours, 0) / monthlySleepLogs.length).toFixed(1)
      : "0.0";

    const monthlyWorkouts = gymLogs.filter(l => {
      if (!l.date?.seconds) return false;
      const d = new Date(l.date.seconds * 1000);
      return d >= firstOfMonth && l.completed;
    }).length;

    const startOfMonthWeight = weightLogs.find(l => {
      if (!l.date?.seconds) return false;
      const d = new Date(l.date.seconds * 1000);
      return d >= firstOfMonth;
    })?.weight || weight;
    const weightDelta = (weight - startOfMonthWeight).toFixed(1);

    // Macro Calculation Logic
    const calculateMacros = () => {
      if (manualMacros) return manualMacros;
      if (!weight) return { cal: 0, p: 0, c: 0, f: 0, w: 0 };
      let cal = 0, p = 0, f = 0, c = 0, w = 3; // Default 3L water
      
      if (goal === 'lose') {
        cal = Math.round(weight * 24);
        p = Math.round(weight * 2.2);
        f = Math.round(weight * 0.7);
      } else if (goal === 'gain') {
        cal = Math.round(weight * 33);
        p = Math.round(weight * 2.0);
        f = Math.round(weight * 0.9);
      } else {
        cal = Math.round(weight * 28);
        p = Math.round(weight * 1.8);
        f = Math.round(weight * 0.8);
      }
      c = Math.round((cal - (p * 4) - (f * 9)) / 4);
      return { cal, p, c, f, w };
    };

    const macros = calculateMacros();

    const currentExercises = customExerciseData[workoutType][workoutSession] || [];
    const currentMeals = customNutritionData[goal]?.meals || {};

    const currentBadge = getBadge(totalPoints);
    const nextBadgeIndex = BADGES.findIndex(b => b.name === currentBadge.name) + 1;
    const nextBadge = nextBadgeIndex < BADGES.length ? BADGES[nextBadgeIndex] : null;
    const pointsToNext = nextBadge ? nextBadge.min - totalPoints : 0;

    return { 
      streak, 
      totalPoints, 
      gymSessions, 
      currentWeekSessions, 
      bmi, 
      macros, 
      avgSleep, 
      monthlyWorkouts, 
      weightDelta,
      currentBadge,
      nextBadge,
      pointsToNext,
      currentExercises,
      currentMeals
    };
  }, [tracker, currentDay, gymLogs, weight, height, goal, manualMacros, sleepLogs, weightLogs, customExerciseData, customNutritionData, workoutType, workoutSession]);

  // Welcome Notification
  useEffect(() => {
    if (user && isAuthReady && isGenerated && !welcomeSent.current) {
      addNotification(`Welcome back, Athlete.`);
      welcomeSent.current = true;
    }
  }, [user, isAuthReady, isGenerated]);

  // AI Encouragement Notification
  useEffect(() => {
    if (!aiNotifSent && isGenerated) {
      const timer = setTimeout(() => {
        addNotification("Need optimization tips? Ask your Elite AI Coach for a personalized strategy.");
        setAiNotifSent(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isGenerated, aiNotifSent]);

  // Badge Notification
  useEffect(() => {
    const currentBadge = getBadge(stats.totalPoints).name;
    if (lastBadge && currentBadge !== lastBadge) {
      addNotification(`Rank Ascended: You are now a ${currentBadge}!`);
    }
    setLastBadge(currentBadge);
  }, [stats.totalPoints]);

  // Hydration Reminders
  useEffect(() => {
    const intervals = [
      { h: 10, m: 0 },
      { h: 14, m: 0 },
      { h: 18, m: 0 },
      { h: 21, m: 0 }
    ];

    const checkReminders = setInterval(() => {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      
      if (intervals.some(i => i.h === h && i.m === m)) {
        addNotification("Hydration Protocol: Consume 500ml of filtered water now.");
      }
    }, 60000);

    return () => clearInterval(checkReminders);
  }, [isMuted]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    if (showAuth) {
      return <LoginPage onLogin={() => {}} onBack={() => setShowAuth(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  return (
    <div className={`min-h-screen bg-surface selection:bg-primary selection:text-on-primary-fixed ${theme}`}>
      <TopBar 
        notifications={notifications} 
        isNotificationsOpen={isNotificationsOpen} 
        setIsNotificationsOpen={setIsNotificationsOpen}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        profilePhoto={profilePhoto}
        onDeleteNotification={(id: string) => {
          setNotifications(prev => prev.filter(n => n.id !== id));
        }}
        setIsSettingsOpen={setIsSettingsOpen}
        setActiveTab={setActiveTab}
      />
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        theme={theme} 
        setTheme={setTheme} 
      />
      <div className="flex">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} onRecalibrate={() => setIsRecalibrating(true)} />
        
        <main className="flex-1 lg:ml-64 p-6 lg:p-10 mb-24 lg:mb-0">
          <AnimatePresence>
            {isProfileLoaded && (!isGenerated || isRecalibrating) && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-[32px] bg-black/70"
              >
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  className="max-w-xl w-full bg-surface-container/80 backdrop-blur-2xl p-10 rounded-3xl border border-white/10 space-y-8 shadow-[0_0_100px_rgba(255,77,0,0.15)] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[120px] -mr-48 -mt-48 rounded-full" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 blur-[100px] -ml-32 -mb-32 rounded-full" />
                  
                  {isGenerated && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRecalibrating(false);
                      }}
                      className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20 cursor-pointer active:scale-90"
                      aria-label="Close"
                    >
                      <X size={20} />
                    </button>
                  )}

                  <h2 className="text-3xl font-black italic tracking-tight uppercase text-white relative z-10">
                    {isRecalibrating ? 'Recalibrate Protocol' : 'Initialize Protocol'}
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Weight (kg)</label>
                      <input 
                        type="number" 
                        value={weight} 
                        onChange={(e) => setWeight(Number(e.target.value))}
                        placeholder="75"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Height (cm)</label>
                      <input 
                        type="number" 
                        value={height} 
                        onChange={(e) => setHeight(Number(e.target.value))}
                        placeholder="175"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8 relative z-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Age</label>
                      <input 
                        type="number" 
                        value={age} 
                        onChange={(e) => setAge(Number(e.target.value))}
                        placeholder="25"
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Sex</label>
                      <div className="relative">
                        <select 
                          value={sex} 
                          onChange={(e) => setSex(e.target.value)}
                          className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Activity Level</label>
                    <div className="relative">
                      <select 
                        value={activityLevel} 
                        onChange={(e) => setActivityLevel(e.target.value)}
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="Sedentary">Sedentary (Office job, little exercise)</option>
                        <option value="Lightly Active">Lightly Active (1-2 days/week)</option>
                        <option value="Moderately Active">Moderately Active (3-5 days/week)</option>
                        <option value="Very Active">Very Active (6-7 days/week)</option>
                        <option value="Elite Athlete">Elite Athlete (Professional training)</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">Performance Goal</label>
                    <div className="relative">
                      <select 
                        value={goal} 
                        onChange={(e) => setGoal(e.target.value)}
                        className="w-full bg-surface-container-low border border-white/5 rounded-xl px-5 py-4 text-white font-bold focus:outline-none focus:border-primary/50 transition-all appearance-none cursor-pointer"
                      >
                        <option value="lose">Fat Loss / Definition</option>
                        <option value="gain">Hypertrophy / Power</option>
                        <option value="health">Endurance / Longevity</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                    </div>
                  </div>

                  <button 
                    onClick={handleInitialize}
                    className="w-full kinetic-gradient text-on-primary-fixed font-black py-5 rounded-xl tracking-[0.2em] uppercase shadow-[0_0_30px_rgba(255,77,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all relative z-10"
                  >
                    {isRecalibrating ? 'Update Protocol' : 'Generate Protocol'}
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {activeTab === 'home' ? (
              <motion.div 
                key="home"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {/* Dashboard Content */}
                {isGenerated && (
                  <>
                    {/* 1. BMI Card & Status/Badge */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Zap size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Elite Performance Index</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                          <span className="text-4xl font-black text-white">{bmi}</span>
                          <span className="text-xs font-bold text-primary uppercase">BMI</span>
                        </div>
                        <p className="text-[10px] font-bold text-on-surface-variant mt-2 uppercase tracking-widest relative z-10">{bmiStatus.label}</p>
                      </div>

                      <div className="flex gap-6">
                        <div className="flex-1 bg-surface-container p-6 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden group hover:border-primary/20 transition-all">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary relative z-10">
                            <Activity size={20} />
                          </div>
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Current Status</p>
                            <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">DAY {currentDay}</h3>
                          </div>
                        </div>
                        <div className="flex-1 bg-surface-container p-6 rounded-2xl border border-white/5 flex items-center gap-4 relative overflow-hidden group hover:border-primary/20 transition-all">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 blur-3xl -mr-12 -mt-12 rounded-full" />
                          <div className={`w-10 h-10 rounded-xl ${getBadge(stats.totalPoints).bg} flex items-center justify-center ${getBadge(stats.totalPoints).color} shadow-lg relative z-10`}>
                            <Trophy size={20} />
                          </div>
                          <div className="relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Current Rank</p>
                            <h3 className={`text-xl font-black uppercase italic tracking-tighter ${getBadge(stats.totalPoints).color}`}>
                              {getBadge(stats.totalPoints).name}
                            </h3>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. BMI Analysis Gauge */}
                    <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant">BMI Analysis</label>
                        <span className={`text-xs font-black italic uppercase ${bmiStatus.color}`}>{bmiStatus.label}</span>
                      </div>
                      
                      <div className="relative pt-2 pb-8">
                        {/* The Gauge Bar */}
                        <div className="h-3 rounded-full bg-gradient-to-r from-[#ffbd59] via-[#ff9062] to-[#8b0000] relative shadow-inner" />
                        
                        {/* The Indicator (Vertical Bar) */}
                        <motion.div 
                          initial={{ left: 0, backgroundColor: "#ffbd59" }}
                          animate={{ 
                            left: `${bmiStatus.pos}%`,
                            backgroundColor: bmiStatus.hex,
                            boxShadow: `0 0 20px ${bmiStatus.hex}88`
                          }}
                          transition={{ type: "spring", stiffness: 50, damping: 15 }}
                          className="absolute top-0 -translate-x-1/2 h-7 w-2 rounded-full border border-white/20 z-10"
                        />

                        {/* Labels underneath */}
                        <div className="absolute w-full flex justify-between mt-4 px-1">
                          {[
                            { label: 'Underweight', pos: 'text-left' },
                            { label: 'Healthy', pos: 'text-center' },
                            { label: 'Overweight', pos: 'text-center' },
                            { label: 'Obese', pos: 'text-right' }
                          ].map((l, i) => (
                            <span key={i} className={`text-[9px] font-bold text-on-surface-variant/60 uppercase tracking-widest ${l.pos} flex-1`}>
                              {l.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 3. Active Nutrition Protocol Summary */}
                    <div className="bg-surface-container p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all">
                      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Utensils size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-black uppercase italic tracking-tight">Active Nutrition Protocol</h4>
                            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Metabolic Strategy</p>
                          </div>
                        </div>
                        <div className="flex gap-8">
                          {[
                            { label: 'KCAL', val: stats.macros.cal, color: 'text-white' },
                            { label: 'PRO', val: `${stats.macros.p}g`, color: 'text-primary' },
                            { label: 'CHO', val: `${stats.macros.c}g`, color: 'text-tertiary' },
                            { label: 'FAT', val: `${stats.macros.f}g`, color: 'text-orange-400' },
                          ].map((m, i) => (
                            <div key={i} className="text-center">
                              <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-1">{m.label}</p>
                              <p className={`text-lg font-black ${m.color}`}>{m.val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Row of 3: Sleep, Training, Power Points */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-surface-container p-6 rounded-2xl border border-white/5 space-y-4 relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <Moon size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Sleep Architecture</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                          <span className="text-3xl font-black text-white">{stats.avgSleep}</span>
                          <span className="text-xs font-bold text-on-surface-variant uppercase">AVG HRS / MO</span>
                        </div>
                      </div>

                      <div className="bg-surface-container p-6 rounded-2xl border border-white/5 space-y-4 relative overflow-hidden group hover:border-tertiary/20 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-tertiary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-8 h-8 bg-tertiary/10 rounded-lg flex items-center justify-center text-tertiary">
                            <Dumbbell size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Training Volume</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                          <span className="text-3xl font-black text-white">{stats.monthlyWorkouts}</span>
                          <span className="text-xs font-bold text-on-surface-variant uppercase">SESSIONS / MO</span>
                        </div>
                      </div>

                      <div className="bg-surface-container p-6 rounded-2xl border border-white/5 space-y-4 relative overflow-hidden group hover:border-primary/20 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16 rounded-full" />
                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                            <BicepsFlexed size={16} />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Power Points</span>
                        </div>
                        <div className="flex items-baseline gap-2 relative z-10">
                          <span className="text-3xl font-black text-white">{stats.totalPoints}</span>
                          <span className="text-xs font-bold text-on-surface-variant uppercase">PTS TOTAL</span>
                        </div>
                      </div>
                    </div>

                    {/* 5. Protocol Active Footer */}
                    <div className="bg-surface-container-low p-8 rounded-2xl border border-white/5 text-center space-y-4">
                      <h3 className="text-xl font-black italic uppercase">Protocol Active</h3>
                      <p className="text-on-surface-variant text-xs max-w-md mx-auto">Your biometrics are synchronized. Navigate to Workouts or Nutrition to view your specialized optimization plan.</p>
                      <div className="flex justify-center flex-wrap gap-4 pt-4">
                        <button onClick={() => setActiveTab('workouts')} className="text-primary text-[10px] font-bold uppercase tracking-widest border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/10 transition-colors">View Workouts</button>
                        <button onClick={() => setActiveTab('nutrition')} className="text-tertiary text-[10px] font-bold uppercase tracking-widest border border-tertiary/20 px-4 py-2 rounded-lg hover:bg-tertiary/10 transition-colors">View Nutrition</button>
                        <button 
                          onClick={() => {
                            // Open ChatBot
                            const chatBtn = document.querySelector('button[class*="fixed bottom-8 right-8"]') as HTMLButtonElement;
                            if (chatBtn) chatBtn.click();
                          }}
                          className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest border border-emerald-400/20 px-4 py-2 rounded-lg hover:bg-emerald-400/10 transition-colors flex items-center gap-2"
                        >
                          <Brain size={12} />
                          Ask AI
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : activeTab === 'workouts' ? (
              <motion.div 
                key="workouts"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-black tracking-tight uppercase italic">Training Protocol</h3>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Optimized for: <span className="text-primary">{goal}</span></p>
                    </div>
                    
                    <div className="flex bg-surface-container-highest p-1 rounded-xl border border-white/5 w-fit">
                      <button 
                        onClick={() => setWorkoutType('gym')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${workoutType === 'gym' ? 'bg-primary text-on-primary-fixed shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        Gym / Machines
                      </button>
                      <button 
                        onClick={() => setWorkoutType('home')}
                        className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${workoutType === 'home' ? 'bg-primary text-on-primary-fixed shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        Home / Outdoor
                      </button>
                    </div>
                  </div>

                  <div className="flex bg-surface-container-highest p-1 rounded-xl border border-white/5">
                    {['push', 'pull', 'legs'].map((session) => (
                      <button 
                        key={session}
                        onClick={() => setWorkoutSession(session as any)}
                        className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${workoutSession === session ? 'bg-tertiary text-on-tertiary-fixed shadow-lg' : 'text-on-surface-variant hover:text-white'}`}
                      >
                        {session}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Session Exercises</h4>
                    <button 
                      onClick={() => setAddingExerciseTo(workoutSession)}
                      className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
                    >
                      <Plus size={12} /> Add Exercise
                    </button>
                  </div>

                  <AnimatePresence>
                    {addingExerciseTo === workoutSession && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-surface-container-highest p-4 rounded-xl border border-primary/20 space-y-3 overflow-hidden"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <div className="col-span-2">
                            <input 
                              autoFocus
                              value={newExerciseName}
                              onChange={(e) => setNewExerciseName(e.target.value)}
                              placeholder="Exercise name (e.g. Bench Press)"
                              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                            />
                          </div>
                          <input 
                            type="number"
                            value={newExerciseSets}
                            onChange={(e) => setNewExerciseSets(e.target.value === '' ? '' : Number(e.target.value))}
                            placeholder="Sets"
                            className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                          />
                          <input 
                            value={newExerciseReps}
                            onChange={(e) => setNewExerciseReps(e.target.value)}
                            placeholder="Reps (e.g. 8-12)"
                            className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50"
                          />
                          <div className="col-span-2">
                            <textarea 
                              value={newExerciseDescription}
                              onChange={(e) => setNewExerciseDescription(e.target.value)}
                              placeholder="Description..."
                              className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary/50 min-h-[60px]"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                          <button 
                            onClick={() => { 
                              setAddingExerciseTo(null); 
                              setNewExerciseName('');
                              setNewExerciseSets('');
                              setNewExerciseReps('');
                              setNewExerciseDescription('');
                            }}
                            className="px-3 py-1 text-[10px] font-bold uppercase text-on-surface-variant hover:text-white"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              if (newExerciseName.trim()) {
                                const currentSessionExercises = customExerciseData[workoutType][workoutSession] || [];
                                const newExObj: Exercise = {
                                  name: newExerciseName.trim(),
                                  sets: Number(newExerciseSets) || 3,
                                  reps: newExerciseReps || "10-12",
                                  note: "Custom exercise",
                                  description: newExerciseDescription.trim()
                                };
                                const newExercises = [...currentSessionExercises, newExObj];
                                const newData = { ...customExerciseData, [workoutType]: { ...customExerciseData[workoutType], [workoutSession]: newExercises } };
                                setCustomExerciseData(newData);
                                saveProfile({ customExerciseData: newData });
                                addNotification(`Added ${newExerciseName.trim()} to ${workoutSession} protocol.`);
                                setNewExerciseName('');
                                setNewExerciseSets('');
                                setNewExerciseReps('');
                                setNewExerciseDescription('');
                                setAddingExerciseTo(null);
                              }
                            }}
                            className="px-3 py-1 bg-primary text-on-primary-fixed rounded-lg text-[10px] font-bold uppercase"
                          >
                            Add
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {stats.currentExercises.map((ex, i) => {
                    return (
                      <div key={i} className="bg-surface-container-low p-5 rounded-xl flex items-center gap-6 group border border-white/5 hover:border-primary/20 transition-colors">
                        <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <Dumbbell size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-white text-sm group-hover:text-primary transition-colors">{ex.name}</h4>
                          <p className="text-on-surface-variant text-[10px]">{ex.note}</p>
                          {ex.description && (
                            <p className="text-[10px] text-on-surface-variant/60 mt-1 italic leading-relaxed">{ex.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-12">
                          <div className="w-10 text-center">
                            <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Sets</p>
                            <p className="text-sm font-black text-white">{ex.sets}</p>
                          </div>
                          <div className="w-16 text-center">
                            <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mb-1">Reps</p>
                            <p className="text-sm font-black text-white whitespace-nowrap">{ex.reps}</p>
                          </div>
                          <button 
                            onClick={() => {
                              const newExercises = customExerciseData[workoutType][workoutSession].filter((_, index) => index !== i);
                              const newData = { ...customExerciseData, [workoutType]: { ...customExerciseData[workoutType], [workoutSession]: newExercises } };
                              setCustomExerciseData(newData);
                              saveProfile({ customExerciseData: newData });
                            }}
                            className="text-on-surface-variant hover:text-red-400 transition-colors shrink-0"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : activeTab === 'nutrition' ? (
              <motion.div 
                key="nutrition"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                {/* Protocol Header & Macro Breakdown */}
                <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                  
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-[0_0_20px_rgba(255,144,98,0.2)]">
                        <Dna size={24} />
                      </div>
                      <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">
                        {goal === 'lose' ? 'Fat Loss Protocol — High Protein Deficit' : 
                         goal === 'gain' ? 'Hypertrophy Protocol — Power Surge' : 
                         'Endurance Protocol — Longevity Focus'}
                      </h3>
                    </div>
                    <button 
                      onClick={() => setIsManualOverrideOpen(true)}
                      className="flex items-center gap-2 px-6 py-2.5 bg-surface-container-highest rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-primary transition-all border border-white/10 shadow-lg group"
                    >
                      <PenTool size={14} className="group-hover:rotate-12 transition-transform" />
                      Manual Override
                    </button>
                  </div>

                  <div className="flex flex-col lg:flex-row items-center lg:justify-center gap-16 relative z-10">
                    <div className="relative w-56 h-56 shrink-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Protein', value: stats.macros.p * 4 },
                              { name: 'Carbs', value: stats.macros.c * 4 },
                              { name: 'Fat', value: stats.macros.f * 9 },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            startAngle={90}
                            endAngle={450}
                          >
                            <Cell fill="#ff4d00" />
                            <Cell fill="#ffbd59" />
                            <Cell fill="#ff9062" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-4xl font-black text-white leading-none tracking-tighter">{stats.macros.cal}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.3em] mt-2">KCAL</span>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 w-full max-w-2xl">
                      {[
                        { label: 'PROTEIN', val: `${stats.macros.p}g`, pct: `${Math.round((stats.macros.p * 4 / (stats.macros.cal || 1)) * 100)}%`, color: 'bg-[#ff4d00]', shadow: 'shadow-[0_0_15px_rgba(255,77,0,0.4)]' },
                        { label: 'CARBS', val: `${stats.macros.c}g`, pct: `${Math.round((stats.macros.c * 4 / (stats.macros.cal || 1)) * 100)}%`, color: 'bg-[#ffbd59]', shadow: 'shadow-[0_0_15px_rgba(255,189,89,0.4)]' },
                        { label: 'FAT', val: `${stats.macros.f}g`, pct: `${Math.round((stats.macros.f * 9 / (stats.macros.cal || 1)) * 100)}%`, color: 'bg-[#ff9062]', shadow: 'shadow-[0_0_15px_rgba(255,144,98,0.4)]' },
                        { label: 'HYDRATION', val: `${stats.macros.w}L`, pct: 'TARGET', color: 'bg-blue-500', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.4)]' },
                      ].map((m, i) => (
                        <div key={i} className="flex items-center justify-between group bg-surface-container-low/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                          <div className="flex items-center gap-5">
                            <div className={`w-3.5 h-3.5 rounded-full ${m.color} ${m.shadow}`} />
                            <span className="text-xs font-black text-on-surface-variant tracking-[0.2em] uppercase">{m.label}</span>
                          </div>
                          <div className="flex items-baseline gap-3">
                            <span className="text-2xl font-black text-white tracking-tight">{m.val}</span>
                            <span className="text-xs font-bold text-on-surface-variant/60">({m.pct})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-surface-container p-8 rounded-2xl border border-white/5 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-96 h-96 bg-tertiary/5 blur-[120px] -ml-48 -mt-48 rounded-full" />
                  
                  <h3 className="text-2xl font-black uppercase mb-8 flex items-center gap-4 italic relative z-10">
                    <div className="w-10 h-10 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shadow-[0_0_20px_rgba(255,189,89,0.1)]">
                      <Utensils size={22} />
                    </div>
                    Fuel Strategy
                  </h3>
                  <div className="space-y-10 relative z-10">
                    {["Breakfast", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Snacks"].map((slot) => (
                      <div key={slot} className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-tertiary">{slot}</h4>
                          <button 
                            onClick={() => setAddingMealTo(slot)}
                            className="flex items-center gap-2 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors"
                          >
                            <Plus size={12} /> Add {slot}
                          </button>
                        </div>

                        <AnimatePresence>
                          {addingMealTo === slot && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="bg-surface-container-highest p-4 rounded-xl border border-tertiary/20 space-y-3 overflow-hidden"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-2">
                                  <input 
                                    autoFocus
                                    value={newMealName}
                                    onChange={(e) => setNewMealName(e.target.value)}
                                    placeholder="Meal Name..."
                                    className="w-full bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-tertiary/50"
                                  />
                                </div>
                                <input 
                                  type="number"
                                  value={newMealCalories}
                                  onChange={(e) => setNewMealCalories(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Kcal"
                                  className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-tertiary/50"
                                />
                                <input 
                                  type="number"
                                  value={newMealProtein}
                                  onChange={(e) => setNewMealProtein(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Protein (g)"
                                  className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-tertiary/50"
                                />
                                <input 
                                  type="number"
                                  value={newMealCarbs}
                                  onChange={(e) => setNewMealCarbs(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Carbs (g)"
                                  className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-tertiary/50"
                                />
                                <input 
                                  type="number"
                                  value={newMealFats}
                                  onChange={(e) => setNewMealFats(e.target.value === '' ? '' : Number(e.target.value))}
                                  placeholder="Fats (g)"
                                  className="bg-surface-container-low border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-tertiary/50"
                                />
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button 
                                  onClick={() => { 
                                    setAddingMealTo(null); 
                                    setNewMealName('');
                                    setNewMealCalories('');
                                    setNewMealProtein('');
                                    setNewMealCarbs('');
                                    setNewMealFats('');
                                  }}
                                  className="px-3 py-1 text-[10px] font-bold uppercase text-on-surface-variant hover:text-white"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => {
                                    if (newMealName.trim()) {
                                      const currentGoalData = customNutritionData[goal] || { meals: {}, macros: {} };
                                      const slotMeals = currentGoalData.meals?.[slot] || [];
                                      const newMealObj: Meal = {
                                        name: newMealName.trim(),
                                        calories: Number(newMealCalories) || 0,
                                        protein: Number(newMealProtein) || 0,
                                        carbs: Number(newMealCarbs) || 0,
                                        fats: Number(newMealFats) || 0
                                      };
                                      const newMeals = { ...currentGoalData.meals, [slot]: [...slotMeals, newMealObj] };
                                      const newData = { ...customNutritionData, [goal]: { ...currentGoalData, meals: newMeals } };
                                      setCustomNutritionData(newData);
                                      saveProfile({ customNutritionData: newData });
                                      addNotification(`Added to ${slot} protocol.`);
                                      setNewMealName('');
                                      setNewMealCalories('');
                                      setNewMealProtein('');
                                      setNewMealCarbs('');
                                      setNewMealFats('');
                                      setAddingMealTo(null);
                                    }
                                  }}
                                  className="px-3 py-1 bg-tertiary text-on-tertiary-fixed rounded-lg text-[10px] font-bold uppercase"
                                >
                                  Add
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(stats.currentMeals[slot] || []).map((meal: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2 bg-surface-container-low/50 p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all group">
                              <div className="flex gap-4 items-center">
                                <div className="w-1.5 h-1.5 bg-tertiary rounded-full shrink-0 shadow-[0_0_10px_rgba(255,189,89,0.5)]" />
                                <p className="text-xs text-white leading-relaxed font-medium flex-1">{meal.name || meal}</p>
                                <button 
                                  onClick={() => {
                                    const currentGoalData = customNutritionData[goal];
                                    const slotMeals = currentGoalData.meals[slot].filter((_: any, index: number) => index !== i);
                                    const newMeals = { ...currentGoalData.meals, [slot]: slotMeals };
                                    const newData = { ...customNutritionData, [goal]: { ...currentGoalData, meals: newMeals } };
                                    setCustomNutritionData(newData);
                                    saveProfile({ customNutritionData: newData });
                                  }}
                                  className="text-on-surface-variant hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                              {meal.calories !== undefined && (
                                <div className="flex gap-4 pl-5">
                                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">{meal.calories} KCAL</span>
                                  <span className="text-[8px] font-bold text-primary uppercase tracking-widest">{meal.protein} PROTEIN</span>
                                  <span className="text-[8px] font-bold text-tertiary uppercase tracking-widest">{meal.carbs} CARBS</span>
                                  <span className="text-[8px] font-bold text-orange-400 uppercase tracking-widest">{meal.fats} FATS</span>
                                </div>
                              )}
                            </div>
                          ))}
                          {(!stats.currentMeals[slot] || stats.currentMeals[slot].length === 0) && (
                            <p className="text-[10px] text-on-surface-variant/40 italic">No meals in {slot}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'habits' ? (
              <motion.div 
                key="habits"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-10"
              >
                <div className="flex justify-between items-end">
                  <div>
                    <h2 className="text-3xl font-black italic tracking-tight uppercase">Daily Habit Protocol</h2>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Consistency is the ultimate performance multiplier</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Status</p>
                    <p className="text-xl font-black text-primary">DAY {currentDay}</p>
                  </div>
                </div>

                {/* Badge System */}
                <div className="bg-surface-container p-8 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-32 -mt-32 rounded-full" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className={`w-20 h-20 rounded-2xl ${stats.currentBadge.bg} flex items-center justify-center ${stats.currentBadge.color} shadow-2xl`}>
                      <Trophy size={40} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Power Rank</p>
                      <h3 className={`text-4xl font-black uppercase italic tracking-tighter ${stats.currentBadge.color}`}>
                        {stats.currentBadge.name}
                      </h3>
                      <div className="flex flex-col mt-1">
                        <p className="text-xs font-bold text-white/60 uppercase tracking-widest">Total Accumulation: {stats.totalPoints} Power Points</p>
                        {stats.nextBadge && (
                          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-1">
                            Next Badge: {stats.nextBadge.name} at {stats.nextBadge.min} pts ({stats.pointsToNext} left)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 relative z-10 w-full md:w-auto">
                    {BADGES.map((b, i) => (
                      <div key={i} className={`flex flex-col items-center gap-2 p-3 rounded-xl border ${stats.totalPoints >= b.min ? 'bg-surface-container-highest border-primary/20' : 'bg-surface-container-low border-white/5 opacity-30'}`}>
                        <Trophy size={16} className={stats.totalPoints >= b.min ? b.color : 'text-on-surface-variant'} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {HABITS.map(habit => {
                    const isChecked = tracker.habits[`${habit.id}-${currentDay}`];
                    return (
                      <motion.button
                        key={habit.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleHabit(habit.id, currentDay)}
                        className={`flex items-center gap-6 p-6 rounded-2xl border transition-all text-left group ${isChecked ? 'bg-primary/10 border-primary/30' : 'bg-surface-container border-white/5 hover:border-white/20'}`}
                      >
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${isChecked ? 'bg-primary text-on-primary-fixed' : 'bg-surface-container-highest text-on-surface-variant group-hover:text-white'}`}>
                          <habit.icon size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-black uppercase italic text-sm ${isChecked ? 'text-primary' : 'text-white'}`}>{habit.name}</h4>
                          <p className="text-[10px] text-on-surface-variant font-medium mt-1 leading-relaxed">{habit.description}</p>
                        </div>
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${isChecked ? 'bg-primary border-primary text-on-primary-fixed' : 'border-white/10'}`}>
                          {isChecked && <CheckCircle2 size={16} />}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Habits History Table */}
                <div className="bg-surface-container rounded-2xl border border-white/5 overflow-hidden mt-12">
                  <div className="p-6 border-b border-white/5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-on-surface-variant">30-Day Consistency Map</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-surface-container-highest">
                          <th className="p-4 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-surface-container-highest z-10 border-r border-white/5">Habits</th>
                          {Array.from({ length: 30 }, (_, i) => (
                            <th key={i} className={`p-2 text-[10px] font-black text-center min-w-[40px] ${i + 1 === currentDay ? 'text-primary bg-primary/10' : 'text-on-surface-variant'}`}>
                              {i + 1}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {HABITS.map(habit => (
                          <tr key={habit.id} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                            <td className="p-4 text-xs font-bold sticky left-0 bg-surface-container z-10 border-r border-white/5 flex items-center gap-2">
                              <habit.icon size={14} className={habit.color} />
                              {habit.name}
                            </td>
                            {Array.from({ length: 30 }, (_, i) => {
                              const day = i + 1;
                              const isChecked = tracker.habits[`${habit.id}-${day}`];
                              const isFuture = day > currentDay;
                              return (
                                <td key={i} className="p-2 text-center">
                                  <div className={`w-4 h-4 mx-auto rounded-sm border transition-all ${isChecked ? 'bg-primary border-primary' : isFuture ? 'border-white/5 opacity-20' : 'border-white/10'}`} />
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        <tr className="border-t border-white/10 bg-surface-container-low/20">
                          <td className="p-4 text-[10px] font-black uppercase tracking-widest sticky left-0 bg-surface-container-highest z-10 border-r border-white/5">Daily Points</td>
                          {Array.from({ length: 30 }, (_, i) => {
                            const day = i + 1;
                            const dayPoints = tracker.points[day] || 0;
                            return (
                              <td key={i} className={`p-2 text-[10px] font-black text-center ${dayPoints > 0 ? 'text-primary' : 'text-on-surface-variant/30'}`}>
                                {dayPoints}
                              </td>
                            );
                          })}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ) : activeTab === 'profile' ? (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <ProfilePage 
                  weight={weight} 
                  height={height} 
                  age={age}
                  sex={sex}
                  activityLevel={activityLevel}
                  goal={goal} 
                  setWeight={setWeight} 
                  setHeight={setHeight} 
                  setAge={setAge}
                  setSex={setSex}
                  setActivityLevel={setActivityLevel}
                  setGoal={setGoal} 
                  stats={stats}
                  profilePhoto={profilePhoto}
                  onPhotoUpload={handlePhotoUpload}
                  onRemovePhoto={removePhoto}
                  athleteName={athleteName}
                  setAthleteName={setAthleteName}
                  currentDay={currentDay}
                />
              </motion.div>
            ) : (
              <motion.div 
                key="tracker"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-10"
              >
                <div className="flex justify-between items-end">
                  <h2 className="text-3xl font-black italic tracking-tight uppercase">Performance Analytics</h2>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Current Status</p>
                    <p className="text-xl font-black text-primary">DAY {currentDay}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-12">
                  {/* Weight Progress Chart */}
                  <div className="bg-surface-container p-8 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div>
                        <h3 className="text-xl font-black uppercase flex items-center gap-3 italic">
                          <Weight size={22} className="text-tertiary" />
                          Mass Evolution
                        </h3>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Body composition trajectory</p>
                      </div>
                      
                      <div className="flex gap-3 items-center bg-surface-container-low p-2 rounded-2xl border border-white/5">
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="Weight"
                            step="0.1"
                            min="20"
                            max="500"
                            className="bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2 text-xs w-24 focus:outline-none focus:border-tertiary transition-all"
                            onKeyDown={(e: any) => {
                              if (e.key === 'Enter') {
                                logWeight(Number(e.target.value));
                                e.target.value = '';
                              }
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-on-surface-variant uppercase">KG</span>
                        </div>
                        <button 
                          onClick={() => setActiveHistory(activeHistory === 'weight' ? null : 'weight')}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeHistory === 'weight' ? 'bg-tertiary text-white' : 'bg-white/5 text-on-surface-variant hover:text-white'}`}
                          title="Manage Logs"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="relative min-h-[320px]">
                      <AnimatePresence mode="wait">
                        {activeHistory === 'weight' ? (
                          <motion.div 
                            key="weight-history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-tertiary">Historical Data Points</h4>
                              <button onClick={() => setActiveHistory(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-white uppercase">Close History</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-hide">
                              {weightLogs.length === 0 ? (
                                <p className="col-span-full text-center py-10 text-xs text-on-surface-variant italic">No weight logs recorded yet.</p>
                              ) : (
                                weightLogs.slice().reverse().map((log) => (
                                  <div key={log.id} className="bg-surface-container-highest p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-tertiary/30 transition-all">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-white">{log.weight} KG</span>
                                      <span className="text-[8px] font-bold text-on-surface-variant uppercase">
                                        {log.date?.seconds ? new Date(log.date.seconds * 1000).toLocaleDateString() : 'Recent'}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => deleteLog('weightLogs', log.id)}
                                      className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="weight-chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-80 w-full relative z-10"
                          >
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={weightLogs.map(l => ({
                                date: l.date?.seconds ? new Date(l.date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...',
                                weight: l.weight
                              }))}>
                                <defs>
                                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#ffbd59" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#ffbd59" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                <XAxis 
                                  dataKey="date" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 'bold' }} 
                                  dy={10}
                                />
                                <YAxis 
                                  domain={['dataMin - 1', 'dataMax + 1']}
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 'bold' }} 
                                />
                                <Tooltip 
                                  contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                  itemStyle={{ color: '#ffbd59', fontWeight: 'bold', fontSize: '12px' }}
                                  labelStyle={{ color: '#adaaaa', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
                                />
                                <Area 
                                  type="monotone" 
                                  dataKey="weight" 
                                  stroke="#ffbd59" 
                                  strokeWidth={4} 
                                  fillOpacity={1} 
                                  fill="url(#weightGradient)"
                                  dot={{ r: 5, fill: '#ffbd59', strokeWidth: 2, stroke: '#0e0e0e' }}
                                  activeDot={{ r: 8, strokeWidth: 0, fill: '#fff' }}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Workout Commitment Analysis */}
                  <div className="bg-surface-container p-8 rounded-2xl border border-white/5 space-y-6 lg:col-span-1">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-black uppercase flex items-center gap-3 italic">
                        <Dumbbell size={22} className="text-primary" />
                        Workout Commitment
                      </h3>
                      <div className="flex gap-3 items-center">
                        <button 
                          onClick={() => logGym(true)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/10"
                          title="Add session"
                        >
                          <Plus size={20} />
                        </button>
                        <button 
                          onClick={() => setActiveHistory(activeHistory === 'gym' ? null : 'gym')}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeHistory === 'gym' ? 'bg-primary text-white' : 'bg-white/5 text-on-surface-variant hover:text-white'}`}
                          title="Manage Sessions"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="relative min-h-[200px]">
                      <AnimatePresence mode="wait">
                        {activeHistory === 'gym' ? (
                          <motion.div 
                            key="gym-history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Session History</h4>
                              <button onClick={() => setActiveHistory(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-white uppercase">Close History</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[160px] overflow-y-auto pr-2 scrollbar-hide">
                              {gymLogs.length === 0 ? (
                                <p className="col-span-full text-center py-6 text-xs text-on-surface-variant italic">No sessions logged yet.</p>
                              ) : (
                                gymLogs.slice().reverse().map((log) => (
                                  <div key={log.id} className="bg-surface-container-highest p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-primary/30 transition-all">
                                    <span className="text-[10px] font-black text-white">
                                      {log.date?.seconds ? new Date(log.date.seconds * 1000).toLocaleDateString() : 'Recent Session'}
                                    </span>
                                    <button 
                                      onClick={() => deleteLog('gymLogs', log.id)}
                                      className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="gym-chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-3 gap-8"
                          >
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Weekly Frequency</p>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-4xl font-black">{stats.gymSessions}</span>
                                  <span className="text-xs font-bold text-primary">SESSIONS</span>
                                </div>
                                <p className="text-[10px] text-on-surface-variant font-medium">Recommended: 3-5 sessions / week</p>
                                {stats.currentWeekSessions > 5 && (
                                  <div className="flex items-center gap-1 text-[10px] font-bold text-red-400 uppercase animate-pulse">
                                    <Activity size={12} />
                                    Warning: Excessive Training
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="md:col-span-2 h-48 w-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart 
                                  data={Array.from({ length: 4 }, (_, i) => {
                                    const now = new Date();
                                    const currentDayOfWeek = now.getDay();
                                    const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
                                    const mondayThisWeek = new Date(now);
                                    mondayThisWeek.setDate(now.getDate() + diffToMonday);
                                    mondayThisWeek.setHours(0, 0, 0, 0);

                                    const weekStart = new Date(mondayThisWeek);
                                    weekStart.setDate(mondayThisWeek.getDate() - (3 - i) * 7);
                                    const weekEnd = new Date(weekStart);
                                    weekEnd.setDate(weekStart.getDate() + 7);
                                    
                                    const sessions = gymLogs.filter(l => {
                                      if (!l.date?.seconds) return false;
                                      const d = new Date(l.date.seconds * 1000);
                                      return d >= weekStart && d < weekEnd && l.completed;
                                    }).length;
                                    
                                    return {
                                      week: `Week ${i + 1}`,
                                      sessions,
                                      target: 4
                                    };
                                  })}
                                  barGap={-40}
                                >
                                  <YAxis domain={[0, 5]} hide />
                                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 'bold' }} />
                                  <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }} />
                                  <Bar dataKey="target" fill="rgba(255,255,255,0.05)" radius={[4, 4, 0, 0]} barSize={40} />
                                  <Bar dataKey="sessions" fill="#ff9062" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Nutrition Adherence Chart */}
                  <div className="bg-surface-container p-8 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div>
                        <h3 className="text-xl font-black uppercase flex items-center gap-3 italic">
                          <Apple size={22} className="text-green-400" />
                          Nutritional Consistency
                        </h3>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Macro target adherence tracking</p>
                      </div>
                      
                      <div className="flex gap-3 items-center bg-surface-container-low p-2 rounded-2xl border border-white/5">
                        <button 
                          onClick={() => logNutrition(true)}
                          className="px-6 py-2 rounded-xl kinetic-gradient text-on-primary-fixed text-[10px] font-black uppercase tracking-widest shadow-lg"
                        >
                          Target Reached
                        </button>
                        <button 
                          onClick={() => setActiveHistory(activeHistory === 'nutrition' ? null : 'nutrition')}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeHistory === 'nutrition' ? 'bg-green-400 text-black' : 'bg-white/5 text-on-surface-variant hover:text-white'}`}
                          title="Manage Logs"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="relative min-h-[300px]">
                      <AnimatePresence mode="wait">
                        {activeHistory === 'nutrition' ? (
                          <motion.div 
                            key="nutrition-history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-green-400">Adherence History</h4>
                              <button onClick={() => setActiveHistory(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-white uppercase">Close History</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-[260px] overflow-y-auto pr-2 scrollbar-hide">
                              {nutritionLogs.length === 0 ? (
                                <p className="col-span-full text-center py-10 text-xs text-on-surface-variant italic">No nutrition logs yet.</p>
                              ) : (
                                nutritionLogs.slice().reverse().map((log) => (
                                  <div key={log.id} className="bg-surface-container-highest p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-green-400/30 transition-all">
                                    <span className="text-[10px] font-black text-white">
                                      {log.date?.seconds ? new Date(log.date.seconds * 1000).toLocaleDateString() : 'Recent Entry'}
                                    </span>
                                    <button 
                                      onClick={() => deleteLog('nutritionLogs', log.id)}
                                      className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="nutrition-chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                          >
                            <div className="space-y-6">
                              <div className="h-64 w-full relative">
                                <ResponsiveContainer width="100%" height="100%">
                                  <PieChart>
                                    <Pie
                                      data={[
                                        { name: 'Reached', value: nutritionLogs.filter(l => l.reached).length },
                                        { name: 'Missed', value: Math.max(0, 30 - nutritionLogs.filter(l => l.reached).length) }
                                      ]}
                                      cx="50%"
                                      cy="50%"
                                      innerRadius={60}
                                      outerRadius={80}
                                      paddingAngle={5}
                                      dataKey="value"
                                    >
                                      <Cell fill="#ff9062" />
                                      <Cell fill="rgba(255,255,255,0.05)" />
                                    </Pie>
                                    <Tooltip 
                                      contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '8px' }}
                                      itemStyle={{ color: '#fff' }}
                                    />
                                  </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="text-3xl font-black text-white">
                                    {Math.round((nutritionLogs.filter(l => l.reached).length / 30) * 100)}%
                                  </span>
                                  <span className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest">Consistency</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-4">
                              <div className="bg-surface-container-low p-4 rounded-xl border border-white/5">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Monthly Target</span>
                                  <span className="text-xs font-black text-white">{nutritionLogs.filter(l => l.reached).length} / 30 Days</span>
                                </div>
                                <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary transition-all duration-1000" 
                                    style={{ width: `${(nutritionLogs.filter(l => l.reached).length / 30) * 100}%` }}
                                  />
                                </div>
                              </div>
                              <p className="text-[10px] text-on-surface-variant leading-relaxed italic">
                                "Optimal performance requires precise fueling. Maintain a consistency rate above 80% to maximize metabolic adaptation."
                              </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Sleep Tracker Chart */}
                  <div className="bg-surface-container p-8 rounded-3xl border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
                      <div>
                        <h3 className="text-xl font-black uppercase flex items-center gap-3 italic">
                          <Moon size={22} className="text-primary" />
                          Sleep Architecture
                        </h3>
                        <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Daily recovery monitoring (0-12h)</p>
                      </div>
                      
                      <div className="flex gap-3 items-center bg-surface-container-low p-2 rounded-2xl border border-white/5">
                        <div className="relative">
                          <input 
                            type="number" 
                            placeholder="Hours"
                            min="0"
                            max="24"
                            className="bg-surface-container-highest border border-white/10 rounded-xl px-4 py-2 text-xs w-24 focus:outline-none focus:border-primary transition-all"
                            onKeyDown={(e: any) => {
                              if (e.key === 'Enter') {
                                logSleep(Number((e.target as HTMLInputElement).value));
                                (e.target as HTMLInputElement).value = '';
                              }
                            }}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-on-surface-variant uppercase">HRS</span>
                        </div>
                        <button 
                          onClick={() => setActiveHistory(activeHistory === 'sleep' ? null : 'sleep')}
                          className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${activeHistory === 'sleep' ? 'bg-primary text-white' : 'bg-white/5 text-on-surface-variant hover:text-white'}`}
                          title="Manage Logs"
                        >
                          <History size={18} />
                        </button>
                      </div>
                    </div>

                    <div className="relative min-h-[320px]">
                      <AnimatePresence mode="wait">
                        {activeHistory === 'sleep' ? (
                          <motion.div 
                            key="sleep-history"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-4"
                          >
                            <div className="flex justify-between items-center">
                              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Recovery History</h4>
                              <button onClick={() => setActiveHistory(null)} className="text-[10px] font-bold text-on-surface-variant hover:text-white uppercase">Close History</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[280px] overflow-y-auto pr-2 scrollbar-hide">
                              {sleepLogs.length === 0 ? (
                                <p className="col-span-full text-center py-10 text-xs text-on-surface-variant italic">No sleep logs yet.</p>
                              ) : (
                                sleepLogs.slice().reverse().map((log) => (
                                  <div key={log.id} className="bg-surface-container-highest p-3 rounded-xl border border-white/5 flex justify-between items-center group hover:border-primary/30 transition-all">
                                    <div className="flex flex-col">
                                      <span className="text-xs font-black text-white">{log.hours} HRS</span>
                                      <span className="text-[8px] font-bold text-on-surface-variant uppercase">
                                        {log.date?.seconds ? new Date(log.date.seconds * 1000).toLocaleDateString() : 'Recent'}
                                      </span>
                                    </div>
                                    <button 
                                      onClick={() => deleteLog('sleepLogs', log.id)}
                                      className="p-2 rounded-lg text-on-surface-variant hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                ))
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            key="sleep-chart"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                          >
                            <div className="h-80 w-full relative z-10">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sleepLogs.slice(-14).map(l => ({
                                  day: l.date?.seconds ? new Date(l.date.seconds * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '...',
                                  hours: l.hours
                                }))}>
                                  <defs>
                                    <linearGradient id="sleepGradient" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#ff9062" stopOpacity={0.8}/>
                                      <stop offset="95%" stopColor="#ff9062" stopOpacity={0.2}/>
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
                                  <XAxis 
                                    dataKey="day" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 'bold' }} 
                                    dy={10}
                                  />
                                  <YAxis 
                                    domain={[0, 12]}
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#adaaaa', fontSize: 10, fontWeight: 'bold' }} 
                                  />
                                  <Tooltip 
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#ff9062', fontWeight: 'bold', fontSize: '12px' }}
                                    labelStyle={{ color: '#adaaaa', fontSize: '10px', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
                                  />
                                  <Bar dataKey="hours" fill="url(#sleepGradient)" radius={[6, 6, 0, 0]} barSize={40}>
                                    {sleepLogs.slice(-14).map((entry, index) => (
                                      <Cell key={`cell-${index}`} fill={entry.hours >= 7 ? 'url(#sleepGradient)' : '#ffbd59'} />
                                    ))}
                                  </Bar>
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <ChatBot 
        goal={goal} 
        meals={Object.values(customNutritionData[goal]?.meals || {}).flat()} 
        exercises={Object.values(customExerciseData).flatMap(env => Object.values(env).flat()).map(e => e.name)} 
        customNutritionData={customNutritionData}
        setCustomNutritionData={setCustomNutritionData}
        customExerciseData={customExerciseData}
        setCustomExerciseData={setCustomExerciseData}
        user={user}
        db={db}
      />

      <ManualMacroModal 
        isOpen={isManualOverrideOpen}
        onClose={() => setIsManualOverrideOpen(false)}
        currentMacros={manualMacros || stats.macros}
        onSave={(newMacros: any) => {
          setManualMacros(newMacros);
          setIsManualOverrideOpen(false);
        }}
      />

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface-container-low/90 backdrop-blur-xl border-t border-white/5">
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center rounded-lg py-1 px-4 ${activeTab === 'home' ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}
        >
          <Home size={20} />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('workouts')}
          className={`flex flex-col items-center justify-center rounded-lg py-1 px-4 ${activeTab === 'workouts' ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}
        >
          <Dumbbell size={20} />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">Workouts</span>
        </button>
        <button 
          onClick={() => setActiveTab('tracker')}
          className={`flex flex-col items-center justify-center rounded-lg py-1 px-4 ${activeTab === 'tracker' ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}
        >
          <TrendingUp size={20} />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">30-Day Tracker</span>
        </button>
        <button 
          onClick={() => setActiveTab('habits')}
          className={`flex flex-col items-center justify-center rounded-lg py-1 px-4 ${activeTab === 'habits' ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}
        >
          <Target size={20} />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">Habits</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center justify-center rounded-lg py-1 px-4 ${activeTab === 'profile' ? 'bg-primary text-on-primary-fixed' : 'text-on-surface-variant'}`}
        >
          <User size={20} />
          <span className="text-[8px] uppercase font-bold tracking-tighter mt-0.5">Profile</span>
        </button>
      </nav>

      {/* Footer */}
      <footer className="w-full flex flex-col items-center gap-6 border-t border-white/5 py-12 bg-surface mt-10">
        <div className="text-primary font-bold tracking-tighter italic">VOLTAGE</div>
        <div className="flex gap-8">
          {['Privacy', 'Terms', 'Support', 'Contact'].map(link => (
            <a key={link} className="text-[10px] text-on-surface-variant uppercase tracking-widest hover:text-white transition-colors" href="#">{link}</a>
          ))}
        </div>
        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">© 2026 KINETIC PRECISION. ALL RIGHTS RESERVED.</p>
      </footer>
    </div>
  );
}
