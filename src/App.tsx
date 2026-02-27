/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { useState, useEffect, useMemo, FormEvent, useRef, forwardRef } from 'react';
import type { HTMLProps } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  ChevronRight, 
  Users, 
  Globe, 
  BookOpen, 
  ShieldCheck, 
  Menu, 
  X, 
  ArrowRight,
  Sparkles,
  Info,
  MessageSquare,
  ExternalLink,
  Github,
  MessageCircle,
  Send,
  Search,
  Hash,
  Bell,
  BellOff,
  Settings,
  LogOut,
  User as UserIcon,
  Plus,
  Bot,
  Clock,
  Heart,
  MoreHorizontal,
  Share2,
  Image,
  Mic,
  Video,
  PhoneOff,
  Monitor,
  Download,
  CalendarDays,
  StickyNote
} from 'lucide-react';

// --- Types ---

interface User {
  id: number;
  name: string;
  email: string;
  campus: string;
  avatar?: string;
  cover_photo?: string;
  bio?: string;
  student_id?: string;
  program?: string;
  year_level?: string;
  department?: string;
}

interface Message {
  id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  room_id: string;
  media_url?: string;
  media_type?: string;
  timestamp: string;
  deleted?: boolean;
}

interface Campus {
  name: string;
  slug: string;
  location: string;
  description: string;
  stats: {
    students: string;
    courses: string;
  };
  top: string;
  left: string;
  color: string;
  website: string;
  mapUrl: string;
  sources: { label: string; url: string }[];
}

// --- Constants ---

const CAMPUSES: Campus[] = [
  {
    name: "MSU Main",
    slug: "msu-main",
    location: "Marawi City, Lanao del Sur",
    description: "The flagship campus of the Mindanao State University System and the core academic and cultural hub of MSU.",
    stats: { students: "25k+", courses: "180+" },
    top: "10%", left: "8%",
    color: "#8e1212",
    website: "https://www.msumain.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Main+Campus+Marawi+City",
    sources: [
      { label: "MSU Main Official", url: "https://www.msumain.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU IIT",
    slug: "msu-iit",
    location: "Iligan City",
    description: "A leading institute in science, engineering, IT, and liberal arts in Northern Mindanao.",
    stats: { students: "18k+", courses: "120+" },
    top: "18%", left: "82%",
    color: "#1a3a5a",
    website: "https://www.msuiit.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU-IIT+Iligan+City",
    sources: [
      { label: "MSU-IIT Official", url: "https://www.msuiit.edu.ph/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mindanao_State_University%E2%80%93Iligan_Institute_of_Technology" }
    ]
  },
  {
    name: "MSU Gensan",
    slug: "msu-gensan",
    location: "General Santos City",
    description: "Serving the SOCCSKSARGEN region through programs in education, business, and applied sciences.",
    stats: { students: "12k+", courses: "90+" },
    top: "30%", left: "12%",
    color: "#1b5e20",
    website: "https://gensan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+General+Santos+Campus",
    sources: [
      { label: "MSU Gensan Official", url: "https://gensan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Tawi-Tawi",
    slug: "msu-tawi-tawi",
    location: "Bongao, Tawi-Tawi",
    description: "Known for fisheries, marine science, and ocean-related studies in the southern Philippines.",
    stats: { students: "8k+", courses: "45+" },
    top: "42%", left: "78%",
    color: "#01579b",
    website: "https://tawitawi.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Tawi-Tawi+College+of+Technology+and+Oceanography",
    sources: [
      { label: "MSU Tawi-Tawi Official", url: "https://tawitawi.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Naawan",
    slug: "msu-naawan",
    location: "Naawan, Misamis Oriental",
    description: "A center for fisheries, aquaculture, and coastal resource research and development.",
    stats: { students: "5k+", courses: "35+" },
    top: "14%", left: "68%",
    color: "#e65100",
    website: "https://naawan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Naawan",
    sources: [
      { label: "MSU Naawan Official", url: "https://naawan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Maguindanao",
    slug: "msu-maguindanao",
    location: "Datu Odin Sinsuat, Maguindanao",
    description: "A major MSU campus focused on inclusive development, governance, and community-based learning.",
    stats: { students: "7k+", courses: "50+" },
    top: "60%", left: "10%",
    color: "#33691e",
    website: "https://maguindanao.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Maguindanao",
    sources: [
      { label: "MSU Maguindanao Official", url: "https://maguindanao.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Sulu",
    slug: "msu-sulu",
    location: "Jolo, Sulu",
    description: "Supports higher education access and peace-building initiatives in Sulu and nearby island communities.",
    stats: { students: "6k+", courses: "40+" },
    top: "48%", left: "86%",
    color: "#bf360c",
    website: "https://sulu.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Sulu",
    sources: [
      { label: "MSU Sulu Official", url: "https://sulu.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Buug",
    slug: "msu-buug",
    location: "Buug, Zamboanga Sibugay",
    description: "Provides programs in teacher education, agriculture, and community extension services.",
    stats: { students: "4k+", courses: "30+" },
    top: "72%", left: "68%",
    color: "#4a148c",
    website: "https://buug.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Buug",
    sources: [
      { label: "MSU Buug Official", url: "https://buug.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" }
    ]
  },
  {
    name: "MSU Maigo School of Arts and Trades",
    slug: "msu-maigo-sat",
    location: "Maigo, Lanao del Norte",
    description: "An MSU external unit offering technical-vocational and teacher education pathways.",
    stats: { students: "2k+", courses: "20+" },
    top: "22%", left: "60%",
    color: "#0d47a1",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Maigo+School+of+Arts+and+Trades",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Maigo+School+of+Arts+and+Trades" }
    ]
  },
  {
    name: "MSU LNCAT",
    slug: "msu-lncat",
    location: "Bacolod, Lanao del Norte",
    description: "Lanao del Norte College of Arts and Trades, an MSU external campus for industry-oriented education.",
    stats: { students: "3k+", courses: "25+" },
    top: "28%", left: "54%",
    color: "#004d40",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+LNCAT+Bacolod+Lanao+del+Norte",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+LNCAT+Bacolod+Lanao+del+Norte" }
    ]
  },
  {
    name: "MSU Malabang Community High School",
    slug: "msu-malabang-extension",
    location: "Malabang, Lanao del Sur",
    description: "Community high school extension under the MSU system serving local learners.",
    stats: { students: "1k+", courses: "HS Tracks" },
    top: "58%", left: "22%",
    color: "#6a1b9a",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Malabang+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Malabang+Community+High+School" }
    ]
  },
  {
    name: "MSU Marantao Community High School",
    slug: "msu-marantao-extension",
    location: "Marantao, Lanao del Sur",
    description: "An MSU-linked extension community high school supporting secondary education access.",
    stats: { students: "900+", courses: "HS Tracks" },
    top: "50%", left: "30%",
    color: "#283593",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Marantao+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Marantao+Community+High+School" }
    ]
  },
  {
    name: "MSU Masiu Community High School",
    slug: "msu-masiu-extension",
    location: "Masiu, Lanao del Sur",
    description: "A community high school extension connected to the MSU system in the Lanao area.",
    stats: { students: "800+", courses: "HS Tracks" },
    top: "66%", left: "26%",
    color: "#ad1457",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Masiu+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Masiu+Community+High+School" }
    ]
  },
  {
    name: "MSU Balindong Community High School",
    slug: "msu-balindong-extension",
    location: "Balindong, Lanao del Sur",
    description: "MSU extension-focused community high school for underserved municipalities.",
    stats: { students: "700+", courses: "HS Tracks" },
    top: "74%", left: "34%",
    color: "#37474f",
    website: "https://www.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Balindong+Community+High+School",
    sources: [
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Balindong+Community+High+School" }
    ]
  },
];

const SPARKLES = [
  { top: "10%", left: "14%" },
  { top: "22%", left: "78%" },
  { top: "36%", left: "20%" },
  { top: "54%", left: "72%" },
  { top: "68%", left: "16%" },
  { top: "82%", left: "60%" },
];


// --- Components ---

const Logo = ({ className = "w-full h-full" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad-primary" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#F59E0B" />
        <stop offset="100%" stopColor="#D97706" />
      </linearGradient>
      <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    
    {/* Abstract MSU Shield / Unity Shape */}
    <motion.path
      d="M50 5 L85 25 V75 L50 95 L15 75 V25 Z"
      stroke="url(#logo-grad-primary)"
      strokeWidth="2"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
    />
    
    <motion.path
      d="M50 20 L75 35 V65 L50 80 L25 65 V35 Z"
      fill="url(#logo-grad-primary)"
      fillOpacity="0.1"
      stroke="url(#logo-grad-primary)"
      strokeWidth="1"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.5, duration: 1.5 }}
    />

    {/* Central "1" or Unity Symbol */}
    <motion.path
      d="M50 35 V65 M40 40 L50 35 L60 40"
      stroke="url(#logo-grad-primary)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      filter="url(#logo-glow)"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 1 }}
    />

    {/* Orbiting Dots */}
    {[0, 120, 240].map((angle, i) => (
      <motion.circle
        key={i}
        cx={50 + 35 * Math.cos((angle * Math.PI) / 180)}
        cy={50 + 35 * Math.sin((angle * Math.PI) / 180)}
        r="2"
        fill="white"
        animate={{
          opacity: [0.2, 1, 0.2],
          scale: [1, 1.5, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          delay: i * 1,
        }}
      />
    ))}
  </svg>
);

const BrandLogoChoice = ({ variant, className = "w-20 h-20" }: { variant: number; className?: string }) => (
  <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`brand-g-${variant}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f5d36b"/>
        <stop offset="100%" stopColor="#b99740"/>
      </linearGradient>
    </defs>
    <rect x="8" y="8" width="84" height="84" rx="22" fill="#0b0b0d" stroke={`url(#brand-g-${variant})`} strokeWidth="2"/>
    {variant === 1 && <path d="M50 20 L78 50 L50 80 L22 50 Z" fill="none" stroke="url(#brand-g-1)" strokeWidth="6"/>}
    {variant === 2 && <path d="M50 20 C66 30 75 42 75 56 C75 70 64 79 50 84 C36 79 25 70 25 56 C25 42 34 30 50 20 Z" fill="none" stroke="url(#brand-g-2)" strokeWidth="6"/>}
    {variant === 3 && <circle cx="50" cy="50" r="26" fill="none" stroke="url(#brand-g-3)" strokeWidth="6"/>}
    {variant === 4 && <path d="M20 52 H80 M50 20 V80" stroke="url(#brand-g-4)" strokeWidth="6" strokeLinecap="round"/>}
    {variant === 5 && <path d="M22 70 L50 24 L78 70 Z" fill="none" stroke="url(#brand-g-5)" strokeWidth="6"/>}
    <text x="50" y="58" textAnchor="middle" fill="#fff" fontSize="12" fontWeight="800">ONE</text>
  </svg>
);

const SplashScreen = () => {
  const [progress, setProgress] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  
  const statuses = [
    "Connecting to MSU Mainframe...",
    "Synchronizing Campus Nodes...",
    "Activating JARVIS Neural Link...",
    "Optimizing Digital Ecosystem...",
    "Finalizing Unity Protocol..."
  ];

  useEffect(() => {
    const duration = 10000; // 10 seconds
    const interval = 50;
    const steps = duration / interval;
    const increment = 100 / steps;
    
    const timer = setInterval(() => {
      setProgress(prev => Math.min(prev + increment, 100));
    }, interval);

    const statusTimer = setInterval(() => {
      setStatusIndex(prev => (prev + 1) % statuses.length);
    }, 2000);
    
    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[9999] bg-[#050505] flex flex-col items-center justify-center overflow-hidden">
      {/* Immersive Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[150px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/10 blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:40px_40px]" />
      </div>
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="relative mb-12">
          <motion.div
            className="absolute inset-0 blur-3xl bg-amber-500/20 rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="w-40 h-40 relative z-10">
            <Logo />
          </div>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-center"
        >
          <h1 className="text-6xl md:text-7xl font-black tracking-[0.3em] text-white mb-4 flex items-center justify-center">
            ONE<span className="text-amber-500">MSU</span>
          </h1>
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mx-auto mb-4" />
          <p className="text-amber-500/60 text-xs uppercase tracking-[0.6em] font-medium mb-16">
            Unity in Diversity
          </p>
        </motion.div>
        
        {/* Advanced Loading Indicator */}
        <div className="w-80 space-y-4">
          <div className="flex justify-between items-end mb-1">
            <motion.span 
              key={statusIndex}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-[10px] font-mono text-gray-500 uppercase tracking-widest"
            >
              {statuses[statusIndex]}
            </motion.span>
            <span className="text-[10px] font-mono text-amber-500/80">
              {Math.round(progress)}%
            </span>
          </div>
          
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden relative border border-white/10 backdrop-blur-sm">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.6)]"
              style={{ width: `${progress}%` }}
              transition={{ type: "spring", bounce: 0, duration: 0.5 }}
            />
            {/* Scanning Light Effect */}
            <motion.div 
              className="absolute inset-y-0 w-20 bg-white/20 skew-x-12"
              animate={{ left: ['-20%', '120%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
      </motion.div>
      
      {/* Data Stream Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-px h-8 bg-gradient-to-b from-amber-500/0 via-amber-500/40 to-amber-500/0"
            initial={{ 
              x: Math.random() * 100 + "%", 
              y: "-10%",
              opacity: 0
            }}
            animate={{ 
              y: "110%",
              opacity: [0, 1, 0]
            }}
            transition={{ 
              duration: Math.random() * 3 + 2, 
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear"
            }}
          />
        ))}
      </div>
    </div>
  );
};

const CampusLogo = ({ slug, className = "w-full h-full" }: { slug: string, className?: string }) => {
  const campus = CAMPUSES.find(c => c.slug === slug);
  const primary = campus?.color || "#b99740";
  const nameTokens = (campus?.name || slug)
    .replace(/MSU|College|School|Community|High|of|and|the|Campus/gi, "")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
  const initials = nameTokens.slice(0, 2).map(t => t[0]?.toUpperCase()).join("") || "MS";

  const lower = `${campus?.name ?? ''} ${campus?.description ?? ''}`.toLowerCase();
  const iconVariant = lower.includes('marine') || lower.includes('fisher') || lower.includes('ocean')
    ? 2
    : lower.includes('technology') || lower.includes('science') || lower.includes('engineering')
      ? 1
      : lower.includes('peace') || lower.includes('security') || lower.includes('governance')
        ? 3
        : 0;
  const accent = ["#f8e38c", "#c5e1ff", "#c8f7c5", "#ffd5b0"][iconVariant];

  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id={`badge-${slug}`} cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor={primary} stopOpacity="1" />
          <stop offset="100%" stopColor="#090909" stopOpacity="0.95" />
        </radialGradient>
        <linearGradient id={`ring-${slug}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="48" fill={`url(#badge-${slug})`} />
      <circle cx="50" cy="50" r="41" fill="none" stroke={`url(#ring-${slug})`} strokeWidth="2" />

      {iconVariant === 0 && <path d="M50 23 L74 68 L26 68 Z" fill="rgba(255,255,255,0.92)" />}
      {iconVariant === 1 && <rect x="30" y="28" width="40" height="40" rx="8" fill="rgba(255,255,255,0.9)" />}
      {iconVariant === 2 && <path d="M50 22 C64 31 72 44 72 56 C72 67 62 76 50 80 C38 76 28 67 28 56 C28 44 36 31 50 22 Z" fill="rgba(255,255,255,0.9)" />}
      {iconVariant === 3 && <path d="M50 22 L58 40 L78 42 L63 56 L68 76 L50 66 L32 76 L37 56 L22 42 L42 40 Z" fill="rgba(255,255,255,0.9)" />}

      <text x="50" y="61" textAnchor="middle" fill={primary} fontSize="16" fontWeight="900" fontFamily="Inter, sans-serif" letterSpacing="1.5">
        {initials}
      </text>
    </svg>
  );
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'home' | 'explorer' | 'about' | 'dashboard' | 'messenger' | 'newsfeed' | 'profile' | 'confession' | 'feedbacks' | 'lostfound' | 'scheduler'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_view');
      const validViews = ['home', 'explorer', 'about', 'dashboard', 'messenger', 'newsfeed', 'profile', 'confession', 'feedbacks', 'lostfound', 'scheduler'];
      if (saved && validViews.includes(saved)) {
        return saved as any;
      }
    }
    return 'home';
  });

  useEffect(() => {
    if (!showSplash) return;

    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3500);

    return () => clearTimeout(timer);
  }, [showSplash]);

  useEffect(() => {
    localStorage.setItem('onemsu_view', view);
  }, [view]);

  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [showCampusModal, setShowCampusModal] = useState(false);
  const [activeCampusSlug, setActiveCampusSlug] = useState(CAMPUSES[0].slug);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('onemsu_auth') === 'true';
    }
    return false;
  });
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [activeRoom, setActiveRoom] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_room');
      return saved || 'announcements';
    }
    return 'announcements';
  });

  useEffect(() => {
    localStorage.setItem('onemsu_room', activeRoom);
  }, [activeRoom]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const stickToBottomRef = useRef(true);
  const isPrependingRef = useRef(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [otherLastRead, setOtherLastRead] = useState<string | null>(null);
  const [groups, setGroups] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string }[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string }[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{ id: number; user_id: number; content: string; timestamp: string }[]>([]);
  const [feedbackText, setFeedbackText] = useState('');
  const [freedomPosts, setFreedomPosts] = useState<{ id: number; user_id: number | null; alias: string; content: string; campus: string; image_url?: string; likes: number; reports: number; timestamp: string }[]>([]);
  const [freedomText, setFreedomText] = useState('');
  const [freedomImagePreview, setFreedomImagePreview] = useState<string | null>(null);
  const [confessionAlias, setConfessionAlias] = useState('ONEMSU');
  const isOwner = (email?: string) => email === 'xandercamarin@gmail.com' || email === 'sophiakayeaninao@gmail.com';
  const isVerified = (email?: string) => isOwner(email) || email === 'krisandrea.gonzaga@g.msuiit.edu.ph' || email === 'marcoalfons.bollozos@g.msuiit.edu.ph';
  const [selectedGroup, setSelectedGroup] = useState<{ id: number; name: string; description: string; campus: string; logo_url?: string } | null>(null);
  const [newGroup, setNewGroup] = useState<{ name: string; description: string; campus: string; logoPreview: string | null }>({ name: '', description: '', campus: '', logoPreview: null });
  const [dashboardCreateOpen, setDashboardCreateOpen] = useState(false);
  const [dashboardCreating, setDashboardCreating] = useState(false);
  const [mutedRooms, setMutedRooms] = useState<string[]>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('onemsu_muted_rooms') : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [compactBubbles, setCompactBubbles] = useState(false);
  const [profileEditing, setProfileEditing] = useState(false);
  const [toast, setToast] = useState<{ message: string; roomId: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const processedMessageIds = useRef<Set<string>>(new Set());
  const pendingClientIds = useRef<Set<string>>(new Set());
  const [isInVoice, setIsInVoice] = useState(false);
  const [voicePeers, setVoicePeers] = useState<string[]>([]);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnections = useRef<Map<number, RTCPeerConnection>>(new Map());
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);
  const [remoteStreams, setRemoteStreams] = useState<Map<number, MediaStream>>(new Map());

  const normalizeIncoming = (raw: any) => {
    // Accept both server styles: roomId vs room_id, senderId vs sender_id, etc.
    const roomId = raw.roomId ?? raw.room_id ?? raw.room ?? '';
    const sender_id = raw.sender_id ?? raw.senderId ?? raw.sender ?? null;
    const sender_name = raw.sender_name ?? raw.senderName ?? raw.name ?? 'Unknown';
    const content = raw.content ?? raw.message ?? '';
    const timestamp = raw.timestamp ?? raw.created_at ?? new Date().toISOString();

    const media_url = raw.media_url ?? raw.mediaUrl ?? raw.media ?? undefined;
    const media_type = raw.media_type ?? raw.mediaType ?? raw.mimeType ?? undefined;

    const id = 
      raw.id ?? 
      raw.message_id ?? 
      raw.msgId ?? 
      // fallback deterministic-ish id 
      `${roomId}-${timestamp}-${sender_id ?? 'x'}`;

    const clientId = raw.clientId ?? raw.client_id ?? undefined;

    return { 
      id, 
      clientId, 
      sender_id, 
      sender_name, 
      content, 
      room_id: roomId, 
      roomId, 
      media_url, 
      media_type, 
      timestamp 
    } as any;
  };

  const START_INDEX = 10000;
  const [firstItemIndex, setFirstItemIndex] = useState(START_INDEX);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('onemsu_unread') : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('onemsu_unread', JSON.stringify(unreadCounts));
  }, [unreadCounts]);

  const [notesByRoom, setNotesByRoom] = useState<Record<string, string>>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest')
        : 'onemsu_notes_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [schedulerForm, setSchedulerForm] = useState({ title: '', details: '', scheduleDate: '', scheduleTime: '', location: '' });
  const [scheduleItems, setScheduleItems] = useState<any[]>([]);

  const [stickyNotes, setStickyNotes] = useState<{ id: string; content: string; color: string; createdAt: string }[]>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest')
        : 'onemsu_stickies_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });


  const [schedulerItems, setSchedulerItems] = useState<{ id: string; title: string; date: string; note: string }[]>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_sched_${user.id}` : 'onemsu_sched_guest')
        : 'onemsu_sched_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const safeJson = async (r: Response) => {
    try {
      const t = await r.text();
      if (!t) return {};
      return JSON.parse(t);
    } catch {
      return {};
    }
  };

  const virtuosoRef = useRef<any>(null);
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({}); // roomId -> names[]
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(true);
  const mouseRafRef = useRef<number | null>(null);
  const pendingMouseRef = useRef({ x: 0, y: 0 });
  const [directMessageList, setDirectMessageList] = useState<{ id: number; name: string; roomId: string; lastMessage?: string; unread: number; avatar?: string; campus?: string }[]>([]);

  // Effect to populate DM list from local storage or API
  useEffect(() => {
    if (user) {
      // Load saved DM list
      const savedDMs = localStorage.getItem(`onemsu_dms_${user.id}`);
      if (savedDMs) {
        setDirectMessageList(JSON.parse(savedDMs));
      }
    }
  }, [user]);

  // Save DM list when it changes
  useEffect(() => {
    if (user && directMessageList.length > 0) {
      localStorage.setItem(`onemsu_dms_${user.id}`, JSON.stringify(directMessageList));
    }
  }, [directMessageList, user]);

  useEffect(() => {
    const key = user ? `onemsu_sched_${user.id}` : 'onemsu_sched_guest';
    localStorage.setItem(key, JSON.stringify(schedulerItems));
  }, [schedulerItems, user]);

  const addToDMList = (otherUser: { id: number; name: string; avatar?: string; campus?: string }) => {
    setDirectMessageList(prev => {
      const roomId = `dm-${Math.min(user!.id, otherUser.id)}-${Math.max(user!.id, otherUser.id)}`;
      if (prev.some(dm => dm.roomId === roomId)) return prev;
      return [{
        id: otherUser.id,
        name: otherUser.name,
        roomId,
        unread: 0,
        avatar: otherUser.avatar,
        campus: otherUser.campus
      }, ...prev];
    });
  };

  const isUserOnline = (userId: number) => onlineUsers.includes(userId);

  const [enrolledCourses, setEnrolledCourses] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_courses');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (view !== 'home') {
      setMouse({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      pendingMouseRef.current = {
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      };

      if (mouseRafRef.current !== null) return;

      mouseRafRef.current = requestAnimationFrame(() => {
        mouseRafRef.current = null;
        setMouse((prev) => {
          const next = pendingMouseRef.current;
          const movedEnough = Math.abs(prev.x - next.x) > 0.02 || Math.abs(prev.y - next.y) > 0.02;
          return movedEnough ? next : prev;
        });
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (mouseRafRef.current !== null) {
        cancelAnimationFrame(mouseRafRef.current);
        mouseRafRef.current = null;
      }
    };
  }, [view]);

  useEffect(() => {
    if (view === 'explorer' && selectedCampus) {
      setActiveCampusSlug(selectedCampus.slug);
    }
  }, [view, selectedCampus]);

  useEffect(() => {
    localStorage.setItem('onemsu_auth', isLoggedIn.toString());
    if (user) localStorage.setItem('onemsu_user', JSON.stringify(user));
    else localStorage.removeItem('onemsu_user');
  }, [isLoggedIn, user]);

  useEffect(() => {
    localStorage.setItem('onemsu_courses', JSON.stringify(enrolledCourses));
  }, [enrolledCourses]);

  useEffect(() => {
    if (view === 'dashboard' || view === 'explorer' || view === 'messenger') {
      setLoadingGroups(true);
      fetch('/api/groups')
        .then((res) => res.json())
        .then((data) => setGroups(data))
        .finally(() => setLoadingGroups(false));
      
      if (user) {
        fetch(`/api/users/${user.id}/groups`)
          .then(res => res.json())
          .then(data => setJoinedGroups(data));
      }

      if (view !== 'messenger') {
        fetch('/api/feedbacks')
          .then((res) => res.json())
          .then((data) => setFeedbacks(data));
        // Highlights should show posts from all campuses
        fetch(`/api/freedomwall`)
          .then((res) => res.json())
          .then((data) => setFreedomPosts(data));
      }
    }
  }, [view, user]);
  useEffect(() => {
    if (isLoggedIn && view === 'home') setView('dashboard');
  }, [isLoggedIn, view]);

  useEffect(() => {
    if (isLoggedIn && user) {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const socket = new WebSocket(`${protocol}//${window.location.host}`);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'join', userId: user.id, roomId: activeRoom }));
      };

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'chat') {
          const msg = normalizeIncoming(data);

          // If server echoes our optimistic message, remove the optimistic one by clientId
          if (msg.clientId && pendingClientIds.current.has(String(msg.clientId))) {
            pendingClientIds.current.delete(String(msg.clientId));
            setMessages(prev => prev.filter(m => (m as any).clientId !== msg.clientId));
          } else if (msg.sender_id === user.id && !msg.clientId) {
             // If message from self but no clientId (e.g. from another tab), check if we have a matching optimistic message
             // This is tricky because timestamps might differ slightly.
             // We'll rely on the fact that if we sent it from this tab, we attached a clientId.
             // If we receive a message from ourselves without a clientId, it must be from another session/tab, so we keep it.
             // HOWEVER, the server might not be echoing back the clientId if we didn't update the server code to do so.
             // Let's check if the message content matches any pending optimistic message
             setMessages(prev => {
                // If we have an optimistic message with same content and very recent, we might want to replace it
                // But better is to ensure server echoes clientId.
                // If server doesn't echo clientId, we have a problem: duplication.
                
                // Temporary fix: if we see a message from ourselves that matches the content of the last message in the list
                // and the last message was optimistic (has clientId), then replace it.
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && (lastMsg as any).clientId && lastMsg.content === msg.content && lastMsg.sender_id === msg.sender_id) {
                   return [...prev.slice(0, -1), msg];
                }
                return prev;
             });
          }

          // De-dupe by id
          const msgId = String(msg.id);
          if (processedMessageIds.current.has(msgId)) return;
          processedMessageIds.current.add(msgId);

          const isInCorrectView = (view === 'messenger' || view === 'newsfeed' || view === 'explorer');
          const isCurrentRoom = (msg.roomId === activeRoom);

          if (isCurrentRoom && isInCorrectView) {
            setMessages(prev => {
              if (prev.some(m => String((m as any).id) === msgId)) return prev;
              return [...prev, msg];
            });
          } else {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.roomId]: (prev[msg.roomId] || 0) + 1
            }));

            setToast({ 
              message: `${msg.sender_name}: ${String(msg.content).substring(0, 30)}${String(msg.content).length > 30 ? '...' : ''}`, 
              roomId: msg.roomId 
            });
            setTimeout(() => setToast(null), 5000);

            // Play sound
            try {
              const NOTIFICATION_AUDIO = 'data:audio/mp3;base64,//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQxAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq';
              const sound = new Audio(NOTIFICATION_AUDIO); 
              sound.volume = 0.5;
              sound.play().catch(e => console.log('Audio play failed', e));
            } catch (e) {}
          }
        } else if (data.type === 'presence') {
          setOnlineUsers(data.onlineUsers);
        } else if (data.type === 'typing') {
          const { roomId, senderName, isTyping } = data;
          setTypingUsers(prev => {
            const current = prev[roomId] || [];
            if (isTyping) {
              if (current.includes(senderName)) return prev;
              return { ...prev, [roomId]: [...current, senderName] };
            } else {
              return { ...prev, [roomId]: current.filter(n => n !== senderName) };
            }
          });
        } else if (data.type === 'voice-existing-users') {
          // We just joined, initiate calls to existing users
          data.users.forEach(async (targetId: number) => {
            createPeerConnection(targetId, true);
          });
        } else if (data.type === 'user-joined-voice') {
          // Someone joined, wait for their offer
        } else if (data.type === 'user-left-voice') {
          removePeerConnection(data.userId);
        } else if (data.type === 'voice-signal') {
          handleVoiceSignal(data);
        }
      };

      return () => {
        socket.close();
      };
    }
  }, [isLoggedIn, user, activeRoom]);

  const sendSeen = () => {
    if (!socketRef.current || !user || !activeRoom) return;
    const last = messages[messages.length - 1]?.timestamp;
    if (!last) return;
    socketRef.current.send(JSON.stringify({ type: 'seen', userId: user.id, roomId: activeRoom, lastRead: last }));
  };

  useEffect(() => {
    if (isLoggedIn && activeRoom) {
      // Clear unread for this room when viewed
      setUnreadCounts(prev => {
        if (!prev[activeRoom]) return prev;
        const next = { ...prev };
        delete next[activeRoom];
        return next;
      });
      
      setHasMore(true);
      setMessages([]);
      setFirstItemIndex(START_INDEX);
      setIsLoadingMore(true);

      const url = `/api/messages/${activeRoom}?userId=${user?.id || ''}&limit=6`;
      fetch(url)
        .then(res => res.json())
        .then((data: Message[]) => {
          setMessages(data);
          setHasMore(data.length >= 6);
          // On room change, scroll to bottom
          requestAnimationFrame(() => {
            if (virtuosoRef.current) {
              virtuosoRef.current.scrollToIndex({ index: data.length - 1, align: 'end' });
            }
          });
          if (activeRoom.startsWith('dm-') && user) {
            fetch(`/api/receipts/${activeRoom}?viewer=${user.id}`).then(r => r.json()).then((res) => {
              if (res.success) setOtherLastRead(res.last_read || null);
            });
          } else {
            setOtherLastRead(null);
          }
        })
        .finally(() => setIsLoadingMore(false));
    }
  }, [isLoggedIn, activeRoom]);

  useEffect(() => {
    try { localStorage.setItem('onemsu_muted_rooms', JSON.stringify(mutedRooms)); } catch {}
  }, [mutedRooms]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest';
      localStorage.setItem(key, JSON.stringify(notesByRoom));
    } catch {}
  }, [notesByRoom, user]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_notes_${user.id}` : 'onemsu_notes_guest';
      const saved = localStorage.getItem(key);
      setNotesByRoom(saved ? JSON.parse(saved) : {});
    } catch {
      setNotesByRoom({});
    }
  }, [user]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest';
      localStorage.setItem(key, JSON.stringify(stickyNotes));
    } catch {}
  }, [stickyNotes, user]);


  useEffect(() => {
    if (!user || view !== 'scheduler') return;
    fetch(`/api/schedules?userId=${user.id}`).then(r => r.json()).then(res => {
      if (res.success) setScheduleItems(res.items || []);
    });
  }, [user, view]);
  useEffect(() => {
    try {
      const key = user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest';
      const saved = localStorage.getItem(key);
      setStickyNotes(saved ? JSON.parse(saved) : []);
    } catch {
      setStickyNotes([]);
    }
  }, [user]);

  const joinGroup = async (group: any) => {
    if (!user) return;
    const res = await fetch(`/api/groups/${group.id}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    }).then(r => r.json());
    if (res.success) {
      setJoinedGroups(prev => {
        if (prev.some(g => g.id === group.id)) return prev;
        return [...prev, group];
      });
      setActiveRoom(group.name.toLowerCase().replace(/\s+/g, '-'));
      setView('messenger');
    }
  };
  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 2) {
      const res = await fetch(`/api/users/search?q=${q}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  const sendMessage = async (content: string, mediaUrl?: string, mediaType?: string) => {
    if (!user || !activeRoom || isSending) return;

    const text = (content ?? '').trim();
    if (!text && !mediaUrl) return;

    setIsSending(true);

    // AI Assistant Logic (JARVIS)
    if (activeRoom === 'dm-ai-assistant') {
      const userMsg = {
        id: `local-${Date.now()}`,
        sender_id: user.id,
        sender_name: user.name,
        content: text,
        roomId: activeRoom,
        room_id: activeRoom,
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMsg as any]);
      setTimeout(() => {
        virtuosoRef.current?.scrollToIndex({ index: 'last', align: 'end', behavior: 'smooth' });
      }, 50);
      
      // Simulate AI typing
      setTypingUsers(prev => ({ ...prev, [activeRoom]: ['JARVIS'] }));
      
      try {
        const envKey = (import.meta as any)?.env?.VITE_GEMINI_API_KEY as string | undefined;
        const ai = envKey ? new GoogleGenAI({ apiKey: envKey }) : null;
        
        // Build conversation history for context
        const history = messages
          .filter(m => m.room_id === activeRoom)
          .map(m => ({
            role: m.sender_id === 0 ? "model" : "user",
            parts: [{ text: m.content }]
          }));

        const systemInstruction = `
          You are JARVIS, a highly advanced, intelligent, and proactive AI assistant integrated into the ONEMSU platform. 
          Your purpose is to serve the students of Mindanao State University (MSU) across all campuses.

          Your Identity:
          - Name: JARVIS
          - Inspiration: You are inspired by high-tech assistants like JARVIS, but you are specifically built for the MSU community.
          - Personality: Sophisticated, efficient, witty, and deeply knowledgeable. You don't just answer; you anticipate needs.
          - Tone: Crisp, professional, yet friendly and encouraging. Use terms like "Sir/Ma'am" or "Student" occasionally to maintain a respectful, high-tech assistant vibe.

          Your Capabilities:
          1. **MSU Expert**: You know everything about the MSU system (Marawi, IIT, Gensan, etc.).
          2. **Academic Powerhouse**: You can solve complex problems, explain advanced theories, and help with research.
          3. **Student Concierge**: You help students navigate university life, from enrollment tips to campus events.
          4. **Legit AI**: You have the full reasoning capabilities of a state-of-the-art LLM. You can write code, compose essays, and analyze data.

          Your Goal:
          Provide the most accurate, helpful, and "legit" AI experience possible. Make the students feel like they have a world-class assistant in their pocket.

          Current Context:
          User: ${user.name}
          Campus: ${user.campus || 'Global'}
        `;

        const response = ai ? await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            ...history,
            { role: "user", parts: [{ text }] }
          ],
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
          }
        }) : null;

        const quickFallback = text.toLowerCase().includes('hello')
          ? `Hello ${user.name}, JARVIS online. Ask me about schedules, studies, or campus updates.`
          : text.toLowerCase().includes('schedule')
            ? 'You can use the Scheduler card in Dashboard Quick Actions to plan classes and reminders.'
            : 'JARVIS text fallback mode is active. Add VITE_GEMINI_API_KEY to enable full AI responses.';

        const aiResponse = response?.text || quickFallback;
        
        setTypingUsers(prev => ({ ...prev, [activeRoom]: [] }));
        
        const aiMsg = {
          id: `ai-${Date.now()}`,
          sender_id: 0, // AI ID
          sender_name: 'JARVIS',
          content: aiResponse,
          roomId: activeRoom,
          room_id: activeRoom,
          timestamp: new Date().toISOString(),
          sender_email: 'jarvis@onemsu.edu.ph'
        };
        
        setMessages(prev => [...prev, aiMsg as any]);
        speakText(aiResponse);
        
        // Scroll to bottom
        setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({ index: 'last', align: 'end', behavior: 'smooth' });
        }, 50);
        
      } catch (error) {
        console.error("AI Error:", error);
        setTypingUsers(prev => ({ ...prev, [activeRoom]: [] }));
        const fallbackMessage = {
          id: `ai-err-${Date.now()}`,
          sender_id: 0,
          sender_name: 'ONEMSU AI',
          content: 'JARVIS fallback: I am online in limited mode right now. I can still help with your schedule, campus info, and app navigation.',
          roomId: activeRoom,
          room_id: activeRoom,
          timestamp: new Date().toISOString()
        } as any;
        setMessages(prev => [...prev, fallbackMessage]);
        speakText(fallbackMessage.content);
      } finally {
        setIsSending(false);
      }
      return;
    }

    if (!socketRef.current) {
        setIsSending(false);
        return;
    }

    // Create a clientId so we can remove the optimistic copy when server echoes back
    const clientId = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingClientIds.current.add(clientId);

    const optimistic: any = {
      id: `local-${clientId}`,
      clientId,
      sender_id: user.id,
      sender_name: user.name,
      content: text,
      roomId: activeRoom,
      room_id: activeRoom,
      media_url: mediaUrl,
      media_type: mediaType,
      timestamp: new Date().toISOString()
    };

    // Show instantly
    setMessages(prev => [...prev, optimistic]);

    try {
        // Send to server
        socketRef.current.send(JSON.stringify({
          type: 'chat',
          clientId,              // IMPORTANT
          senderId: user.id,
          senderName: user.name,
          content: text,
          roomId: activeRoom,
          mediaUrl,
          mediaType
        }));

        // Scroll
        setTimeout(() => {
          virtuosoRef.current?.scrollToIndex({ index: 'last', align: 'end', behavior: 'smooth' });
        }, 50);
    } catch (e) {
        console.error("Send error:", e);
        // Optionally revert optimistic update here
    } finally {
        setIsSending(false);
    }
  };

  const createPeerConnection = async (targetId: number, initiator: boolean) => {
    if (!socketRef.current || !user) return;
    
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnections.current.set(targetId, pc);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.send(JSON.stringify({
          type: 'voice-signal',
          targetId,
          payload: { type: 'candidate', candidate: event.candidate }
        }));
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.set(targetId, event.streams[0]);
        return next;
      });
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    if (initiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.send(JSON.stringify({
        type: 'voice-signal',
        targetId,
        payload: { type: 'offer', sdp: offer }
      }));
    }
  };

  const handleVoiceSignal = async (data: any) => {
    const { senderId, payload } = data;
    let pc = peerConnections.current.get(senderId);

    if (!pc) {
      await createPeerConnection(senderId, false);
      pc = peerConnections.current.get(senderId);
    }
    
    if (!pc) return;

    if (payload.type === 'offer') {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.send(JSON.stringify({
        type: 'voice-signal',
        targetId: senderId,
        payload: { type: 'answer', sdp: answer }
      }));
    } else if (payload.type === 'answer') {
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    } else if (payload.type === 'candidate') {
      await pc.addIceCandidate(new RTCIceCandidate(payload.candidate));
    }
  };

  const removePeerConnection = (userId: number) => {
    const pc = peerConnections.current.get(userId);
    if (pc) {
      pc.close();
      peerConnections.current.delete(userId);
    }
    setRemoteStreams(prev => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  };

  const joinVoiceChannel = async () => {
    if (!socketRef.current || !user || !activeRoom) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: cameraOn });
      localStreamRef.current = stream;
      setIsInVoice(true);
      socketRef.current.send(JSON.stringify({ type: 'join-voice', roomId: activeRoom, userId: user.id }));
    } catch (err) {
      console.error("Failed to get media", err);
      alert("Could not access microphone/camera");
    }
  };

  const leaveVoiceChannel = () => {
    if (!socketRef.current || !user || !activeRoom) return;
    
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    
    peerConnections.current.forEach(pc => pc.close());
    peerConnections.current.clear();
    setRemoteStreams(new Map());
    
    socketRef.current.send(JSON.stringify({ type: 'leave-voice', roomId: activeRoom, userId: user.id }));
    setIsInVoice(false);
  };

  const toggleMic = () => {
    if (localStreamRef.current) {
      const track = localStreamRef.current.getAudioTracks()[0];
      if (track) {
        track.enabled = !micOn;
        setMicOn(!micOn);
      }
    }
  };

  const toggleCamera = async () => {
    if (!localStreamRef.current) return;
    
    if (cameraOn) {
      // Turn off
      const track = localStreamRef.current.getVideoTracks()[0];
      if (track) {
        track.stop();
        localStreamRef.current.removeTrack(track);
        // Renegotiate? For simplicity, we might need to restart connection or use replaceTrack if we kept the track but disabled it. 
        // Disabling track is easier:
        // track.enabled = false;
        // But to really stop camera light, we stop track.
        setCameraOn(false);
      }
    } else {
      // Turn on
      try {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true });
        const videoTrack = videoStream.getVideoTracks()[0];
        localStreamRef.current.addTrack(videoTrack);
        setCameraOn(true);
        // We need to add this track to all peer connections
        peerConnections.current.forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === 'video');
          if (sender) {
            sender.replaceTrack(videoTrack);
          } else {
            pc.addTrack(videoTrack, localStreamRef.current!);
          }
        });
      } catch (e) {
        console.error("No camera", e);
      }
    }
  };

  const parseMaybeJson = async (r: Response) => {
    try {
      const t = await r.text();
      if (!t) return {};
      return JSON.parse(t);
    } catch {
      return {};
    }
  };

  const getCampus3DMapUrl = (campus: Campus) => (
    `https://earth.google.com/web/search/${encodeURIComponent(`${campus.name}, ${campus.location}`)}`
  );

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const password = (formData.get('password') as string).trim();

    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await parseMaybeJson(res);
      if (res.ok && data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setView('dashboard');
        setIsLoginOpen(false);
      } else {
        setAuthError((data as any).message || 'Invalid credentials.');
      }
    } catch (error: any) {
      setAuthError(error?.message?.includes('fetch') ? 'Cannot reach server. Please check your connection and try again.' : 'Unable to sign in right now. Please try again.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    const campus = formData.get('campus') as string;
    const student_id = formData.get('student_id') as string;
    const program = formData.get('program') as string;
    const year_level = formData.get('year_level') as string;

    setAuthError(null);
    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, campus, student_id, program, year_level })
      });

      const data = await parseMaybeJson(res);
      if (res.ok && data.success) {
        setUser(data.user);
        setIsLoggedIn(true);
        setView('dashboard');
        setIsSignupOpen(false);
      } else {
        const localUser = {
          id: Date.now(),
          name,
          email,
          campus,
          avatar: null,
          student_id,
          program,
          year_level,
          department: null,
          bio: null,
          cover_photo: null,
        } as User;
        setUser(localUser);
        setIsLoggedIn(true);
        setView('dashboard');
        setIsSignupOpen(false);
        setAuthError(null);
      }
    } catch (_error: any) {
      const localUser = {
        id: Date.now(),
        name,
        email,
        campus,
        avatar: null,
        student_id,
        program,
        year_level,
        department: null,
        bio: null,
        cover_photo: null,
      } as User;
      setUser(localUser);
      setIsLoggedIn(true);
      setView('dashboard');
      setIsSignupOpen(false);
      setAuthError(null);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(null);
    setView('home');
    localStorage.removeItem('onemsu_auth');
    localStorage.removeItem('onemsu_user');
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = (formData.get('email') as string).trim().toLowerCase();

    setIsAuthLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).then(r => r.json());

      setIsAuthLoading(false);
      if (res.success) {
        alert(res.message);
        setIsForgotOpen(false);
        setIsLoginOpen(true);
      } else {
        alert(res.message);
      }
    } catch {
      setIsAuthLoading(false);
      alert("Failed to send reset link. Please try again later.");
    }
  };

  const clearChat = async () => {
    if (!user || !activeRoom) return;
    const res = await fetch('/api/messages/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, roomId: activeRoom })
    }).then(r => r.json());
    if (res.success) {
      setMessages([]);
      setSettingsOpen(false);
    }
  };

  const deleteMessage = async (msgId: number) => {
    if (!user) return;
    const res = await fetch(`/api/messages/${msgId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id })
    }).then(r => r.json());
    if (res.success) {
      setMessages(prev => prev.filter(m => m.id !== msgId));
    }
  };

  const renderDashboard = () => {
    const messengerUnread = Object.entries(unreadCounts)
      .filter(([room]) => room.startsWith('dm-') || room.startsWith('group-') || ['global', 'help-desk'].includes(room))
      .reduce((sum, [_, count]) => (sum as number) + (count as number), 0);

    const updatesUnread = Object.entries(unreadCounts)
      .filter(([room]) => room.startsWith('newsfeed-') || room === 'announcements')
      .reduce((sum, [_, count]) => (sum as number) + (count as number), 0);

    return (
    <div className="h-full w-full bg-[#0a0502] p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-7xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white">Welcome back, {user?.name || 'MSUan'}!</h2>
              <p className="text-gray-500 text-sm">Connected to {user?.email || 'Unified System'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar (Special Features) */}
          <div className="lg:col-span-1 space-y-8 order-2 lg:order-1">
            <div className="card-gold p-6 rounded-3xl relative overflow-hidden group cursor-pointer" onClick={() => { setActiveRoom('dm-ai-assistant'); setView('messenger'); }}>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-400">
                    <Bot size={24} />
                  </div>
                  <span className="px-2 py-1 rounded-full bg-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider">Special</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">JARVIS</h3>
                <p className="text-gray-400 text-xs leading-relaxed mb-4">
                  Your advanced AI companion. Ask anything about MSU, academics, or general knowledge.
                </p>
                <div className="flex items-center justify-between gap-2 text-indigo-400 text-xs font-bold">
                  <span className="flex items-center gap-2">Launch Assistant <ArrowRight size={14} /></span>
                  <button onClick={(e) => { e.stopPropagation(); setSpeechEnabled(v => !v); }} className="px-2 py-1 rounded bg-white/10 text-[10px] text-white">{speechEnabled ? 'Voice On' : 'Voice Off'}</button>
                </div>
              </div>
              {/* Decorative AI lines */}
              <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Bot size={80} />
              </div>
            </div>

            <div className="card-gold p-6 rounded-3xl">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Globe size={18} className="text-amber-500" /> Campus Information</h3>
              <div className="space-y-3">
                {CAMPUSES.map((c) => (
                  <div key={c.slug} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 shrink-0 rounded-xl overflow-hidden shadow-lg">
                        <CampusLogo slug={c.slug} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-white group-hover:text-amber-400 transition-colors">{c.name}</h4>
                          <button 
                            onClick={() => { setSelectedCampus(c); setShowCampusModal(true); }}
                            className="text-[10px] font-bold px-2 py-1 rounded-full bg-white/10 hover:bg-amber-500 hover:text-black transition-colors"
                          >
                            About
                          </button>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1 mb-2">
                          <MapPin size={10} /> {c.location}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                          {c.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-gold p-6 rounded-3xl">
              <h3 className="font-bold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Messenger', icon: <MessageCircle size={14} />, action: () => setView('messenger'), unread: messengerUnread },
                  { name: 'Lost & Found', icon: <Search size={14} />, action: () => setView('lostfound') },
                  { name: 'Library', icon: <BookOpen size={14} />, action: () => window.open('https://openlibrary.org', '_blank') },
                  { name: 'Grades', icon: <Sparkles size={14} /> },
                  { name: 'Finance', icon: <ShieldCheck size={14} /> },
                  { name: 'Discord', icon: <ExternalLink size={14} />, action: () => window.open('https://discord.gg/gjuygmrPnR', '_blank') },
                  { name: 'Profile', icon: <Users size={14} />, action: () => setView('profile') },
                  { name: 'Scheduler', icon: <Clock size={14} />, action: () => setView('scheduler') },
                  { name: 'Quick Note', icon: <BookOpen size={14} />, action: () => {
                    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                    setStickyNotes(prev => [{ id, content: '', color: 'bg-amber-500/20 border-amber-500/30', createdAt: new Date().toISOString() }, ...prev]);
                  } },
                  { name: 'Updates', icon: <MessageSquare size={14} />, action: () => setView('newsfeed'), unread: updatesUnread },
                  { name: 'Confession', icon: <Sparkles size={14} />, action: () => setView('confession') },
                  { name: 'Explorer', icon: <Globe size={14} />, action: () => setView('explorer') },
                  { name: 'Feedbacks', icon: <Info size={14} />, action: () => setView('feedbacks') },
                  { name: 'Notes', icon: <StickyNote size={14} />, action: () => document.getElementById('notes-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) },
                  { name: 'Scheduler', icon: <CalendarDays size={14} />, action: () => document.getElementById('scheduler-board')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }
                ].map(item => (
                  <button 
                    key={item.name} 
                    onClick={() => item.action ? item.action() : null}
                    className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs font-medium hover:bg-amber-500 hover:text-black transition-all flex flex-col items-center gap-2 relative group"
                  >
                    {(item as any).unread > 0 && (
                      <motion.span
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ 
                          scale: [1, 1.2, 1],
                          opacity: 1 
                        }}
                        transition={{
                          scale: { repeat: Infinity, duration: 2, ease: "easeInOut" }
                        }}
                        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg shadow-rose-900/40 z-10"
                      >
                        {(item as any).unread > 99 ? '99+' : (item as any).unread}
                      </motion.span>
                    )}
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            <div id="notes-board" className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold flex items-center gap-2"><BookOpen size={18} className="text-amber-500" /> Notes</h4>
                <button
                  onClick={() => {
                    const palette = [
                      'bg-amber-500/20 border-amber-500/30',
                      'bg-rose-500/20 border-rose-500/30',
                      'bg-emerald-500/20 border-emerald-500/30',
                      'bg-sky-500/20 border-sky-500/30',
                      'bg-purple-500/20 border-purple-500/30'
                    ];
                    const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
                    const color = palette[Math.floor(Math.random() * palette.length)];
                    setStickyNotes(prev => [{ id, content: '', color, createdAt: new Date().toISOString() }, ...prev]);
                  }}
                  className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
                  title="Add note"
                  aria-label="Add note"
                >
                  <Plus size={16} />
                </button>
              </div>
              {stickyNotes.length === 0 ? (
                <p className="text-sm text-gray-500">No notes yet. Use + to create a sticky note.</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto scrollbar-hide">
                  {stickyNotes.slice(0, 4).map(n => (
                    <div key={n.id} className={`p-3 rounded-2xl border ${n.color} transition-all hover:scale-[1.02]`}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] text-white/60 font-medium">{new Date(n.createdAt).toLocaleDateString()}</span>
                        <button
                          className="text-xs text-white/60 hover:text-white transition-colors"
                          onClick={() => setStickyNotes(prev => prev.filter(x => x.id !== n.id))}
                          title="Delete note"
                          aria-label="Delete note"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <textarea
                        value={n.content}
                        onChange={(e) => {
                          const v = e.target.value;
                          setStickyNotes(prev => prev.map(x => x.id === n.id ? { ...x, content: v } : x));
                        }}
                        placeholder="Write a note…"
                        className="w-full h-28 bg-transparent text-sm text-white placeholder-white/40 focus:outline-none resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div id="scheduler-board" className="p-6 rounded-3xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold flex items-center gap-2"><CalendarDays size={18} className="text-amber-500" /> Scheduler</h4>
                <button
                  onClick={() => setSchedulerItems(prev => [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, title: 'New Schedule', date: new Date().toISOString().slice(0, 10), note: '' }, ...prev])}
                  className="p-2 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20"
                  title="Add schedule"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto scrollbar-hide">
                {schedulerItems.length === 0 && <p className="text-sm text-gray-500">No schedules yet. Add one from Quick Actions.</p>}
                {schedulerItems.map(item => (
                  <div key={item.id} className="p-3 rounded-xl border border-white/10 bg-black/20">
                    <input
                      value={item.title}
                      onChange={(e) => setSchedulerItems(prev => prev.map(x => x.id === item.id ? { ...x, title: e.target.value } : x))}
                      className="w-full mb-2 bg-transparent text-sm font-semibold text-white outline-none"
                      placeholder="Schedule title"
                    />
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => setSchedulerItems(prev => prev.map(x => x.id === item.id ? { ...x, date: e.target.value } : x))}
                      className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-200"
                    />
                    <textarea
                      rows={2}
                      value={item.note}
                      onChange={(e) => setSchedulerItems(prev => prev.map(x => x.id === item.id ? { ...x, note: e.target.value } : x))}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-300"
                      placeholder="Notes"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-8 order-1 lg:order-2">
            <div className="card-gold p-8 rounded-3xl">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={20} /> Confession Wall
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {freedomPosts.slice(0, 5).map((p) => (
                  <div key={p.id} className={`rounded-2xl overflow-hidden bg-white/5 border border-white/10 ${freedomPosts.indexOf(p) === 0 ? 'md:col-span-2' : ''}`}>
                    {p.image_url && <img src={p.image_url} alt="" className={`${freedomPosts.indexOf(p) === 0 ? 'h-48' : 'h-32'} w-full object-cover`} />}
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-amber-400">{p.alias}</span>
                        <span className="text-[10px] text-gray-500">{p.campus} • {new Date(p.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className={`mt-2 ${freedomPosts.indexOf(p) === 0 ? 'text-base' : 'text-sm'} text-gray-200 line-clamp-3`}>{p.content}</div>
                    </div>
                  </div>
                ))}
                {freedomPosts.length === 0 && (
                  <div className="text-sm text-gray-500">No posts yet. Be the first to share.</div>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <button onClick={() => setView('confession')} className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors">
                  Open Confession
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold flex items-center gap-2"><Users size={18} className="text-amber-500" /> Community Groups</h4>
                  <button
                    onClick={() => setDashboardCreateOpen(v => !v)}
                    className="text-xs px-3 py-1 rounded-full bg-white/10 text-gray-300 hover:bg-white/20"
                  >
                    {dashboardCreateOpen ? 'Close' : 'Create'}
                  </button>
                </div>
                {dashboardCreateOpen && (
                  <div className="mb-4 space-y-2">
                    <input
                      value={newGroup.name}
                      onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                      placeholder="Group name"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    />
                    <select
                      value={newGroup.campus}
                      onChange={(e) => setNewGroup({ ...newGroup, campus: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                    >
                      <option value="" className="bg-[#0a0502]">Select campus</option>
                      {CAMPUSES.map(c => (
                        <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>
                      ))}
                    </select>
                    <textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                      rows={2}
                    />
                    <div className="flex items-center gap-3">
                      <label className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 cursor-pointer w-fit">
                        Upload logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) { setNewGroup({ ...newGroup, logoPreview: '' }); return; }
                            const reader = new FileReader();
                            reader.onload = () => setNewGroup({ ...newGroup, logoPreview: reader.result as string });
                            reader.readAsDataURL(file);
                          }}
                          className="hidden"
                        />
                      </label>
                      {newGroup.logoPreview ? <span className="text-xs text-amber-400">Logo attached</span> : <span className="text-xs text-gray-500">Optional</span>}
                    </div>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newGroup.name || !newGroup.campus || dashboardCreating) return;
                          setDashboardCreating(true);
                          try {
                            let logoUrl: string | undefined;
                            if (newGroup.logoPreview) {
                              const up = await fetch('/api/upload', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ dataUrl: newGroup.logoPreview })
                              }).then(safeJson);
                              if (up.success) logoUrl = up.url;
                            }
                            const res = await fetch('/api/groups', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ name: newGroup.name, description: newGroup.description, campus: newGroup.campus, logoUrl })
                            }).then(safeJson);
                            if (res.success) {
                              setGroups((prev) => [res.group, ...prev]);
                              setNewGroup({ name: '', description: '', campus: '', logoPreview: '' });
                              setDashboardCreateOpen(false);
                            }
                          } finally {
                            setDashboardCreating(false);
                          }
                        }}
                        disabled={!newGroup.name || !newGroup.campus || dashboardCreating}
                        aria-busy={dashboardCreating}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors disabled:opacity-50"
                      >
                        {dashboardCreating ? 'Creating…' : 'Create Group'}
                      </button>
                    </div>
                    <div className="h-px w-full bg-white/10" />
                  </div>
                )}
                <div className="space-y-3">
                  {loadingGroups && <div className="text-sm text-gray-500">Loading groups...</div>}
                  {!loadingGroups && groups.length === 0 && <div className="text-sm text-gray-500">No groups found.</div>}
                  {!loadingGroups && groups.map(group => (
                    <div key={group.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5">
                      <div>
                        <span className="text-sm">{group.name}</span>
                        <span className="block text-[10px] text-gray-500">{group.campus}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setActiveRoom(group.name.toLowerCase().replace(/\s+/g, '-'));
                          setView('messenger');
                        }}
                        className="text-amber-500 hover:text-amber-400 text-xs"
                      >
                        Join
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  };

  const renderHome = () => (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-8 text-center overflow-hidden hero-metallic">
      {/* Navigation Header */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-50">
        <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView('home')}>
          <div className="w-12 h-12">
            <Logo />
          </div>
          <span className="hidden sm:inline tracking-tighter">ONE<span className="text-amber-500">MSU</span></span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button onClick={() => setView('explorer')} className="text-gray-400 hover:text-white transition-colors">Campuses</button>
          <button onClick={() => setView('about')} className="text-gray-400 hover:text-white transition-colors">About</button>
          <button 
            onClick={() => isLoggedIn ? setView('dashboard') : setIsLoginOpen(true)}
            className="px-5 py-2 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
          >
            {isLoggedIn ? 'Dashboard' : 'Sign In'}
          </button>
        </div>
      </div>

      {/* Background Elements */}
      <motion.div
        aria-hidden
        animate={{ x: mouse.x * 20, y: mouse.y * 12 }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
        className="pointer-events-none absolute -top-40 -right-28 w-[30rem] h-[30rem] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(248,196,64,0.18),transparent_60%)] blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: mouse.x * -16, y: mouse.y * -10 }}
        transition={{ type: "spring", stiffness: 40, damping: 18 }}
        className="pointer-events-none absolute -bottom-44 -left-32 w-[26rem] h-[26rem] rounded-full bg-[radial-gradient(circle_at_70%_70%,rgba(229,57,53,0.22),transparent_60%)] blur-3xl"
      />
      {SPARKLES.map((p, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [0.9, 1.2, 0.9] }}
          transition={{ duration: 2.6 + i * 0.2, repeat: Infinity }}
          style={{ top: p.top, left: p.left }}
          className="pointer-events-none absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(245,197,24,0.6)]"
        />
      ))}

      {/* Campus Chips (Floating) */}
      {CAMPUSES.map((c, i) => (
        <motion.div
          key={c.slug}
          style={{ top: c.top, left: c.left }}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 0.4, y: [0, -10, 0], x: [0, 5, 0] }}
          transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut" }}
          className="absolute pointer-events-auto select-none hidden md:block cursor-pointer z-20"
          onClick={() => {
            setActiveCampusSlug(c.slug);
            setSelectedCampus(null);
            setShowCampusModal(false);
            setView('explorer');
          }}
        >
          <span className="px-3 py-1 rounded-full text-[10px] font-medium border border-amber-400/20 bg-amber-100/5 text-amber-200/60 backdrop-blur-sm hover:bg-amber-400/20 hover:text-amber-200 transition-colors">
            {c.name}
          </span>
        </motion.div>
      ))}

      {/* Main Content */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="mb-8" />

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-100/10 text-amber-200 text-xs md:text-sm mb-6"
        >
          <motion.span
            className="w-2 h-2 rounded-full bg-amber-400"
            animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          Mindanao State University
        </motion.div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 text-metallic-gold">
          ONE<span className="text-white">MSU</span>
        </h1>

        <p className="text-lg md:text-xl text-gray-300/90 max-w-2xl mb-12 leading-relaxed">
          The digital heart of the MSU community. Connect, explore, and thrive across all campuses in one unified experience.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setView('explorer')}
            className="flex-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-900/20"
          >
            Explore Campuses <ArrowRight size={18} />
          </motion.button>
          
          {!isLoggedIn && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setAuthError(null); setIsLoginOpen(true); }}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold backdrop-blur-md transition-colors"
            >
              Log in
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-metallic-gold">Connect to ONEMSU</h3>
                <button onClick={() => setIsLoginOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <form className="space-y-6" onSubmit={handleLogin}>
                {authError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="e.g. juan.delacruz@msumain.edu.ph"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
                    <input type="checkbox" className="rounded border-white/10 bg-white/5 text-amber-500" />
                    Remember me
                  </label>
                  <button 
                    type="button"
                    onClick={() => { setIsLoginOpen(false); setIsForgotOpen(true); }}
                    className="text-amber-500 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Connecting...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  Don't have an account? <button onClick={() => { setAuthError(null); setIsLoginOpen(false); setIsSignupOpen(true); }} className="text-amber-500 font-semibold hover:underline">Register here</button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Signup Modal */}
      <AnimatePresence>
        {isSignupOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-metallic-gold">Join ONEMSU</h3>
                <button onClick={() => setIsSignupOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <form className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide" onSubmit={handleSignup}>
                {authError && <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">{authError}</p>}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input 
                      name="name"
                      type="text" 
                      placeholder="Juan Dela Cruz"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Student ID</label>
                    <input 
                      name="student_id"
                      type="text" 
                      placeholder="2024-0001"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Course / Program</label>
                    <input 
                      name="program"
                      type="text" 
                      placeholder="BS Computer Science"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Year Level</label>
                    <select 
                      name="year_level"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      required
                    >
                      <option value="1st" className="bg-[#0a0502]">1st Year</option>
                      <option value="2nd" className="bg-[#0a0502]">2nd Year</option>
                      <option value="3rd" className="bg-[#0a0502]">3rd Year</option>
                      <option value="4th" className="bg-[#0a0502]">4th Year</option>
                      <option value="5th" className="bg-[#0a0502]">5th Year</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Email Address</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="juan.delacruz@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Campus</label>
                  <select 
                    name="campus"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  >
                    {CAMPUSES.map(c => <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1.5">Password</label>
                  <input 
                    name="password"
                    type="password" 
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Creating...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account? <button onClick={() => { setAuthError(null); setIsSignupOpen(false); setIsLoginOpen(true); }} className="text-amber-500 font-semibold hover:underline">Sign In</button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {isForgotOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="w-full max-w-md card-gold p-8 rounded-3xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-metallic-gold">Reset Password</h3>
                <button onClick={() => setIsForgotOpen(false)} className="text-gray-500 hover:text-white"><X /></button>
              </div>
              
              <p className="text-gray-400 text-sm mb-8">
                Enter your registered Gmail address and we'll send you a link to reset your password.
              </p>
              
              <form className="space-y-6" onSubmit={handleForgotPassword}>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gmail Address</label>
                  <input 
                    name="email"
                    type="email" 
                    placeholder="juan.delacruz@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    required
                    pattern=".+@gmail\.com"
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isAuthLoading}
                  className={`w-full bg-amber-500 text-black py-4 rounded-xl font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center justify-center gap-2 ${isAuthLoading ? 'opacity-70 cursor-not-allowed scale-95' : 'hover:bg-amber-400 active:scale-95'}`}
                >
                  {isAuthLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                      />
                      Sending Link...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
              
              <div className="mt-8 pt-8 border-t border-white/5 text-center">
                <button 
                  onClick={() => { setIsForgotOpen(false); setIsLoginOpen(true); }} 
                  className="text-sm text-gray-500 hover:text-amber-500 flex items-center justify-center gap-2 mx-auto transition-colors"
                >
                  <ArrowRight className="rotate-180" size={16} /> Back to Sign In
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6 text-gray-500 text-xs">
        <span className="flex items-center gap-1"><ShieldCheck size={14} /> Secure Access</span>
        <span className="flex items-center gap-1"><Globe size={14} /> Global Network</span>
        <span className="flex items-center gap-1"><Users size={14} /> 100k+ Alumni</span>
      </div>
    </div>
  );

  const renderExplorer = () => {
    const activeCampus = CAMPUSES.find(campus => campus.slug === activeCampusSlug) || CAMPUSES[0];

    return (
      <div className="h-full w-full bg-[#0a0502] flex flex-col md:flex-row overflow-hidden">
        {/* Sidebar - Campus List */}
        <div className="w-full md:w-80 border-r border-white/5 flex flex-col shrink-0 bg-black/40 backdrop-blur-md">
          <div className="p-6 border-b border-white/5">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold text-white">MSU <span className="text-amber-500">System</span></h2>
              <button onClick={() => setView('home')} className="text-gray-500 hover:text-white"><X /></button>
            </div>
            <p className="text-[10px] uppercase tracking-widest text-amber-400/70 font-bold">{CAMPUSES.length} campuses and extension units loaded</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
            {CAMPUSES.map((campus) => (
              <button
                key={campus.slug}
                onClick={() => setActiveCampusSlug(campus.slug)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all group ${activeCampus.slug === campus.slug ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <div className="w-10 h-10 shrink-0 rounded-xl overflow-hidden shadow-inner">
                  <CampusLogo slug={campus.slug} />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-sm font-black truncate uppercase tracking-tight">{campus.name}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${activeCampus.slug === campus.slug ? 'text-black/60' : 'text-gray-500'}`}>{campus.location}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto scrollbar-hide bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-fixed opacity-95">
          {/* Cover Area */}
          <div className="relative h-64 md:h-80 shrink-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0a0502]" />
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <CampusLogo slug={activeCampus.slug} className="w-[500px] h-[500px]" />
            </div>
            
            <div className="absolute bottom-8 left-8 right-8 flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="flex items-end gap-6">
                <div className="w-24 h-24 md:w-36 md:h-36 rounded-[2.5rem] overflow-hidden bg-black/60 border-4 border-white/10 p-6 backdrop-blur-xl shadow-2xl relative group">
                  <CampusLogo slug={activeCampus.slug} />
                  <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="pb-2">
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={activeCampus.slug}
                  >
                    <h1 className="text-4xl md:text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-2xl uppercase">
                      {activeCampus.name}
                    </h1>
                    <div className="flex items-center gap-4">
                      <p className="text-amber-500 flex items-center gap-1.5 font-bold text-xs uppercase tracking-[0.2em]"><MapPin size={14} /> {activeCampus.location}</p>
                      <span className="w-1 h-1 rounded-full bg-white/20" />
                      <p className="text-gray-500 font-bold text-xs uppercase tracking-[0.2em]">Established 1961</p>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => window.open(activeCampus.website, '_blank', 'noopener,noreferrer')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2f2a1b] to-[#1a1712] border border-[#b99740]/35 text-xs font-bold text-[#f1dfab] hover:from-[#3a3422] hover:to-[#211d16] transition-all backdrop-blur-md"
                >
                  Official Website
                </button>
                <button
                  onClick={() => {
                    setSelectedCampus(activeCampus);
                    setShowCampusModal(true);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-br from-[#2f2a1b] to-[#1a1712] border border-[#b99740]/35 text-xs font-bold text-[#f1dfab] hover:from-[#3a3422] hover:to-[#211d16] transition-all backdrop-blur-md"
                >
                  View Details
                </button>
                <button
                  onClick={() => window.open(getCampus3DMapUrl(activeCampus), '_blank', 'noopener,noreferrer')}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#c9a547] via-[#d8b24a] to-[#b99740] text-black font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-[#b99740]/30"
                >
                  3D Campus Map
                </button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-8 p-8 max-w-7xl mx-auto w-full">
            {/* Left: Stats & Info */}
            <div className="xl:col-span-4 space-y-8">
              <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 mb-6">Campus Overview</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-8 font-medium italic">
                  "{activeCampus.description}"
                </p>
                
                <div className="grid grid-cols-1 gap-4">
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Student Population</p>
                      <p className="text-2xl font-black text-white">{activeCampus.stats.students}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <Users size={24} />
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Academic Programs</p>
                      <p className="text-2xl font-black text-white">{activeCampus.stats.courses}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <BookOpen size={24} />
                    </div>
                  </div>
                  <div className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div>
                      <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Faculty Members</p>
                      <p className="text-2xl font-black text-white">850+</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <ShieldCheck size={24} />
                    </div>
                  </div>
                </div>
              </section>

              <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 mb-6">Official Channels</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Chancellor\'s Office', icon: <ShieldCheck size={16} /> },
                    { name: 'Registrar Updates', icon: <Bell size={16} /> },
                    { name: 'Student Council', icon: <Users size={16} /> },
                    { name: 'Campus Security', icon: <ShieldCheck size={16} /> }
                  ].map(channel => (
                    <button key={channel.name} className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/20 transition-all group">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-500 group-hover:scale-110 transition-transform">{channel.icon}</span>
                        <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{channel.name}</span>
                      </div>
                      <ChevronRight size={14} className="text-gray-600 group-hover:text-amber-500 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>

              <section className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500/60 mb-6">Reliable Sources</h3>
                <div className="space-y-3">
                  {activeCampus.sources.map((source) => (
                    <a
                      key={source.url}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-between px-5 py-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-amber-500/20 transition-all group"
                    >
                      <span className="text-xs font-bold text-gray-300 group-hover:text-white transition-colors">{source.label}</span>
                      <ExternalLink size={14} className="text-gray-500 group-hover:text-amber-500" />
                    </a>
                  ))}
                </div>
              </section>
            </div>

            {/* Right: Newsfeed */}
            <div className="xl:col-span-8 space-y-8">
              <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-3">
                    <MessageSquare className="text-amber-500" size={24} /> 
                    Campus <span className="text-amber-500">Newsfeed</span>
                  </h3>
                  <div className="flex gap-2">
                    <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"><Search size={18} /></button>
                    <button className="p-2 rounded-lg bg-white/5 text-gray-500 hover:text-white transition-colors"><Bell size={18} /></button>
                  </div>
                </div>
                <CampusNewsfeed campus={activeCampus} />
              </div>
            </div>
          </div>
        </div>

        {/* Campus Detail Modal */}
        <AnimatePresence>
          {showCampusModal && selectedCampus && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-2xl card-gold rounded-3xl overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-amber-900/40 to-black relative flex items-center justify-center">
                  <div className="w-32 h-32">
                    <CampusLogo slug={selectedCampus.slug} />
                  </div>
                  <button 
                    onClick={() => { setShowCampusModal(false); setSelectedCampus(null); }}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-4xl font-bold text-white mb-1">{selectedCampus.name}</h3>
                    <p className="text-amber-400 flex items-center gap-1"><MapPin size={16} /> {selectedCampus.location}</p>
                  </div>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto scrollbar-hide">
                  <div className="mb-8">
                    <p className="text-gray-300 text-lg leading-relaxed mb-4">
                      {selectedCampus.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Student Body</p>
                        <p className="text-2xl font-bold text-white">{selectedCampus.stats.students}</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Academic Programs</p>
                        <p className="text-2xl font-bold text-white">{selectedCampus.stats.courses}</p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px w-full bg-white/10 mb-8" />
                  
                  <h4 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare className="text-amber-500" size={20} /> Campus Newsfeed
                  </h4>
                  <CampusNewsfeed campus={selectedCampus} />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {selectedGroup && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-xl card-gold rounded-3xl overflow-hidden"
              >
                <div className="h-40 bg-gradient-to-br from-amber-900/40 to-black relative flex items-center justify-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                    {selectedGroup.logo_url ? <img src={selectedGroup.logo_url} alt="" className="w-full h-full object-cover" /> : selectedGroup.name[0]}
                  </div>
                  <button 
                    onClick={() => setSelectedGroup(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
                  >
                    <X size={20} />
                  </button>
                  <div className="absolute bottom-6 left-8">
                    <h3 className="text-3xl font-bold text-white mb-1">{selectedGroup.name}</h3>
                    <p className="text-amber-400">{selectedGroup.campus}</p>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-gray-300 mb-6">{selectedGroup.description || 'No description provided.'}</p>
                  <div className="flex justify-end gap-3">
                    <button onClick={() => setSelectedGroup(null)} className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors">Close</button>
                    <button
                      onClick={() => {
                        joinGroup(selectedGroup);
                        setSelectedGroup(null);
                      }}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
                    >
                      {joinedGroups.some(g => g.id === selectedGroup.id) ? 'Open Chat' : 'Join Chat'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const CampusNewsfeed = ({ campus }: { campus: Campus }) => {
    const [posts, setPosts] = useState<any[]>([]);
    const [text, setText] = useState('');
    const [media, setMedia] = useState<{ url: string; type: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const room = `newsfeed-${campus.slug}`;

    const fetchPosts = () => {
      fetch(`/api/messages/${room}`).then(r => r.json()).then(setPosts);
    };

    useEffect(() => {
      fetchPosts();
      const interval = setInterval(fetchPosts, 5000);
      return () => clearInterval(interval);
    }, [room]);

    const handlePost = async () => {
      if (!user || (!text.trim() && !media)) return;
      setLoading(true);
      try {
        if (socketRef.current) {
          socketRef.current.send(JSON.stringify({
            type: 'chat',
            senderId: user.id,
            senderName: user.name,
            senderEmail: user.email,
            senderAvatar: user.avatar,
            content: text.trim(),
            roomId: room,
            mediaUrl: media?.url,
            mediaType: media?.type
          }));
          setText('');
          setMedia(null);
          setTimeout(fetchPosts, 500);
        }
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-6">
        {/* Post Input */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-lg">
          <div className="flex gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0 overflow-hidden ring-2 ring-white/5">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : (user?.name || 'U')[0]}
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}?`}
              className="flex-1 bg-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 resize-none transition-all"
              rows={2}
            />
          </div>
          
          {media && (
            <div className="relative mb-4 ml-13 rounded-2xl overflow-hidden border border-white/10 max-w-sm group">
              {media.type.startsWith('video') ? (
                <video src={media.url} controls className="w-full" />
              ) : (
                <img src={media.url} alt="" className="w-full object-cover max-h-64" />
              )}
              <button 
                onClick={() => setMedia(null)}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-white/5 ml-13">
            <div className="flex gap-1">
              <label className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 text-gray-400 cursor-pointer transition-colors group">
                <Image size={18} className="group-hover:text-emerald-500" />
                <span className="text-xs font-medium">Photo/Video</span>
                <input 
                  type="file" 
                  accept="image/*,video/*,.gif" 
                  className="hidden" 
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = async () => {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataUrl: reader.result as string })
                      }).then(r => r.json());
                      if (res.success) {
                        setMedia({ url: res.url, type: res.mimeType });
                      }
                    };
                    reader.readAsDataURL(file);
                  }}
                />
              </label>
            </div>
            <button 
              onClick={handlePost}
              disabled={loading || (!text.trim() && !media)}
              className="px-6 py-1.5 rounded-xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 shadow-lg shadow-amber-900/20"
            >
              {loading ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>

        {/* Feed List */}
        <div className="space-y-4 max-h-[800px] overflow-y-auto scrollbar-hide pb-12 pr-1">
          {posts.slice().reverse().map((post, i) => (
            <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/10 shadow-xl hover:border-white/20 transition-all group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm overflow-hidden ring-2 ring-white/5 cursor-pointer"
                    onClick={() => setSelectedProfileId(post.sender_id || post.senderId)}
                  >
                    {post.sender_avatar || post.senderAvatar ? (
                      <img src={post.sender_avatar || post.senderAvatar} alt="" className="w-full h-full object-cover" />
                    ) : (post.sender_name || 'U')[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="text-sm font-bold text-white hover:text-amber-400 cursor-pointer transition-colors"
                        onClick={() => setSelectedProfileId(post.sender_id || post.senderId)}
                      >
                        {post.sender_name}
                      </span>
                      {isOwner(post.sender_email || post.senderEmail) && (
                        <ShieldCheck size={14} className="text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock size={10} /> {new Date(post.timestamp).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-white/5 text-gray-500 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <p className="text-sm text-gray-200 mb-4 whitespace-pre-wrap leading-relaxed px-1">{post.content}</p>
              
              {(post.media_url || post.mediaUrl) && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20 mb-4">
                  {(post.media_type || post.mediaType)?.startsWith('video') ? (
                    <video src={post.media_url || post.mediaUrl} controls className="w-full max-h-[500px]" />
                  ) : (
                    <img src={post.media_url || post.mediaUrl} alt="" className="w-full object-contain max-h-[500px]" />
                  )}
                </div>
              )}

              <div className="flex items-center gap-6 pt-3 border-t border-white/5 px-1">
                <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors">
                  <Heart size={18} /> 0
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors">
                  <MessageCircle size={18} /> 0
                </button>
                <button className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors ml-auto">
                  <Share2 size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {posts.length === 0 && (
            <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
              <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
              <p className="text-gray-500 font-medium">No posts in {campus.name} yet.</p>
              <p className="text-xs text-gray-600 mt-1">Start the conversation!</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAbout = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200">
      <nav className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-3 font-bold text-xl cursor-pointer" onClick={() => setView('home')}>
          <div className="w-10 h-10"><Logo /></div>
          <span>ONE<span className="text-amber-500">MSU</span></span>
        </div>
        <button onClick={() => setView('home')} className="text-gray-400 hover:text-white transition-colors"><X /></button>
      </nav>

      <main className="max-w-4xl mx-auto p-8 md:p-16">
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-5xl font-bold mb-8 text-metallic-gold">Our Legacy</h2>
          <p className="text-xl text-gray-400 leading-relaxed mb-6">
            Mindanao State University was established on September 1, 1961, through Republic Act 1387, as amended. It was the brain-child of the late Senator Domocao A. Alonto, as one of the government’s responses to the so-called “Mindanao Problem.”
          </p>
          <p className="text-xl text-gray-400 leading-relaxed">
            The University's original mission was anchored on instruction, research and extension. Its primary objective was to integrate the Muslims and other cultural minorities into the mainstream of Philippine body politic.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Vision</h3>
            <p className="text-gray-400 leading-relaxed">
              To be a premier supra-regional university in the ASEAN region, committed to the development of Mindanao, Palawan, and the Sulu Archipelago.
            </p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="p-8 rounded-3xl bg-white/5 border border-white/10"
          >
            <h3 className="text-2xl font-bold mb-4 text-amber-400">Mission</h3>
            <p className="text-gray-400 leading-relaxed">
              To provide relevant and quality education, research and extension services for the socio-economic and cultural transformation of the communities.
            </p>
          </motion.div>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-3xl font-bold mb-6 text-metallic-gold">New ONEMSU Logo Choices</h2>
          <p className="text-gray-400 mb-8">Choose a direction that best represents unity, excellence, and innovation for ONEMSU.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1,2,3,4,5].map((v) => (
              <div key={v} className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <BrandLogoChoice variant={v} className="w-20 h-20 mx-auto mb-3" />
                <div className="text-xs font-bold text-amber-300">Concept {v}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <section className="text-center">
          <h2 className="text-3xl font-bold mb-12">Join the Community</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button 
              onClick={() => {
                if (isLoggedIn) setView('dashboard');
                else {
                  setView('home');
                  setIsSignupOpen(true);
                }
              }}
              className="px-8 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
            >
              Apply Now
            </button>
            <button className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-colors">Contact Us</button>
          </div>
        </section>
      </main>

      <footer className="p-12 border-t border-white/5 text-center text-gray-600 text-sm">
        <p>© 2026 Mindanao State University System. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-4">
          <a href="#" className="hover:text-amber-500 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-amber-500 transition-colors">Accessibility</a>
        </div>
      </footer>
    </div>
  );

  const renderFeedbacks = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Feedback <span className="text-amber-500">Hub</span></h2>
            <p className="text-gray-500 text-sm mt-1">Help us improve the ONE MSU ecosystem.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 sticky top-8">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
                <MessageSquare size={20} className="text-amber-500" /> 
                Submit Feedback
              </h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">Your suggestions directly influence the future of this platform. We review every submission.</p>
              
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!user || !feedbackText.trim()) return;
                  fetch('/api/feedbacks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, content: feedbackText.trim() })
                  })
                    .then((r) => r.json())
                    .then((res) => {
                      if (res.success) {
                        setFeedbacks((prev) => [res.item, ...prev]);
                        setFeedbackText('');
                      }
                    });
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Your Message</label>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What's on your mind?"
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all min-h-[150px] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!user || !feedbackText.trim()}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Feedback
                </button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-4 px-2">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Recent Submissions</h4>
              <div className="flex gap-2">
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500">All</span>
                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-gray-500">My Feedback</span>
              </div>
            </div>

            {feedbacks.map((f) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={f.id} 
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">Anonymous MSUan</div>
                      <div className="text-[10px] text-gray-500">{new Date(f.timestamp).toLocaleDateString()} • {new Date(f.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${f.id % 3 === 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                    {f.id % 3 === 0 ? 'Resolved' : 'Pending'}
                  </span>
                </div>
                <p className="text-sm text-gray-300 leading-relaxed">{f.content}</p>
                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4">
                  <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    <Heart size={12} /> Helpful
                  </button>
                  <button className="text-[10px] font-bold text-gray-500 hover:text-white transition-colors flex items-center gap-1">
                    <MessageCircle size={12} /> Comment
                  </button>
                </div>
              </motion.div>
            ))}
            {feedbacks.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Info className="mx-auto mb-4 text-gray-600" size={40} />
                <p className="text-gray-500">No feedback submissions yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsfeed = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-metallic-gold">Latest Update</h2>
          <button onClick={() => setView('dashboard')} className="text-gray-500 hover:text-white"><X /></button>
        </header>
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10">
            <h4 className="font-bold mb-4 flex items-center gap-2"><MessageSquare size={18} className="text-amber-500" /> Announcements</h4>
            <Feed room="announcements" />
          </div>
        </div>
      </div>
    </div>
  );

  const Feed = ({ room }: { room: string }) => {
    const [items, setItems] = useState<Message[]>([]);
    useEffect(() => {
      fetch(`/api/messages/${room}`).then(r => r.json()).then(setItems);
    }, [room]);
    return (
      <div className="space-y-4">
        {items.map((m, i) => (
          <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="text-sm font-semibold">{m.sender_name}</div>
            <div className="text-sm text-gray-300">{m.content}</div>
            <div className="text-[10px] text-gray-500 mt-1">{new Date(m.timestamp).toLocaleString()}</div>
          </div>
        ))}
        {items.length === 0 && <div className="text-sm text-gray-500">No posts yet.</div>}
      </div>
    );
  };

  const ProfileForm = ({ user, onSaved }: { user: User | null; onSaved: (u: User) => void }) => {
    const [form, setForm] = useState({
      name: user?.name || '',
      campus: user?.campus || '',
      avatar: user?.avatar || '',
      student_id: '',
      program: '',
      year_level: '',
      department: '',
      bio: '',
      cover_photo: ''
    });
    const [saving, setSaving] = useState(false);
    const [savedAt, setSavedAt] = useState<number | null>(null);
    useEffect(() => {
      if (user) {
        fetch(`/api/profile/${user.id}?viewerId=${user.id}`).then(r => r.json()).then((res) => {
          if (res.success) setForm((prev) => ({
            ...prev,
            name: res.user.name ?? '',
            campus: res.user.campus ?? '',
            avatar: res.user.avatar ?? '',
            student_id: res.user.student_id ?? '',
            program: res.user.program ?? '',
            year_level: res.user.year_level ?? '',
            department: res.user.department ?? '',
            bio: res.user.bio ?? '',
            cover_photo: res.user.cover_photo ?? ''
          }));
        });
      }
    }, [user]);
    const save = async (e?: FormEvent) => {
      if (e) e.preventDefault();
      if (!user) return;
      setSaving(true);
      const res = await fetch(`/api/profile/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      }).then(r => r.json());
      setSaving(false);
      if (res.success) {
        onSaved(res.user);
        setSavedAt(Date.now());
        setTimeout(() => setSavedAt(null), 2000);
      }
    };
    return (
      <form className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6" onSubmit={save}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">Edit Your Profile</h3>
          <button type="button" onClick={() => onSaved(user!)} className="text-gray-500 hover:text-white"><X size={20} /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-6 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div 
                className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl overflow-hidden ring-2 ring-amber-500/30 relative group/avatar cursor-pointer"
                onClick={() => document.getElementById('avatar-upload')?.click()}
              >
                {form.avatar ? <img src={form.avatar} alt="" className="w-full h-full object-cover" /> : (form.name || 'U')[0]}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                  Change
                </div>
              </div>
              <input 
                id="avatar-upload"
                type="file" 
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  
                  // Convert to base64
                  const reader = new FileReader();
                  reader.onload = async (ev) => {
                    const dataUrl = ev.target?.result as string;
                    try {
                      const res = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataUrl })
                      }).then(r => r.json());
                      
                      if (res.success) {
                        setForm(prev => ({ ...prev, avatar: res.url }));
                      }
                    } catch (err) {
                      console.error('Upload failed', err);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
              />
              <div className="flex-1">
                <Input label="Display Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Campus</div>
            <select 
              value={form.campus} 
              onChange={(e) => setForm({ ...form, campus: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            >
              <option value="" disabled className="bg-[#0a0502]">Select your campus</option>
              {CAMPUSES.map(c => (
                <option key={c.slug} value={c.name} className="bg-[#0a0502]">{c.name}</option>
              ))}
            </select>
          </div>
          <Input label="Student ID" value={form.student_id} onChange={(v) => setForm({ ...form, student_id: v })} />
          <Input label="Course / Program" value={form.program} onChange={(v) => setForm({ ...form, program: v })} />
          <Input label="Year Level" value={form.year_level} onChange={(v) => setForm({ ...form, year_level: v })} />
          <Input label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} />
          <div className="md:col-span-2">
            <Textarea label="Bio / Intro" value={form.bio} onChange={(v) => setForm({ ...form, bio: v })} />
          </div>
          
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Avatar Image URL" value={form.avatar} onChange={(v) => setForm({ ...form, avatar: v })} />
            <Input label="Cover Image URL" value={form.cover_photo} onChange={(v) => setForm({ ...form, cover_photo: v })} />
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              type="submit" 
              disabled={saving} 
              className={`px-8 py-3 rounded-xl bg-amber-500 text-black font-bold transition-all shadow-lg shadow-amber-900/20 ${saving ? 'opacity-60 cursor-not-allowed scale-95' : 'hover:bg-amber-400 hover:scale-105 active:scale-95'}`}
            >
              {saving ? 'Saving Changes...' : 'Save Profile'}
            </button>
            {savedAt && (
              <motion.span 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                className="text-sm text-emerald-400 font-medium flex items-center gap-1"
              >
                <ShieldCheck size={16} /> All changes saved!
              </motion.span>
            )}
          </div>
          <button 
            type="button"
            onClick={() => onSaved(user!)} 
            className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };
  
  const Input = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div>
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <input value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
    </div>
  );
  const Textarea = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="md:col-span-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</div>
      <textarea value={value ?? ''} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500/50" />
    </div>
  );
  const [profileData, setProfileData] = useState<any>(null);
  const [tempAvatar, setTempAvatar] = useState<string | null>(null);
  const [tempCover, setTempCover] = useState<string | null>(null);

  useEffect(() => {
    if (user && view === 'profile') {
      fetch(`/api/profile/${user.id}?viewerId=${user.id}`).then(r => r.json()).then(res => {
        if (res.success) setProfileData(res.user);
      });
    }
  }, [user, view]);

  const toggleFollow = async (targetId: number) => {
    if (!user) return;
    const res = await fetch(`/api/profile/${targetId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ followerId: user.id })
    }).then(r => r.json());
    if (res.success) {
      if (selectedProfileId === targetId) {
        // Refresh detail view
        fetch(`/api/profile/${targetId}?viewerId=${user.id}`).then(r => r.json()).then(res => {
          if (res.success) {
            // update local detail if needed
          }
        });
      }
      // Refresh current user data if looking at their profile
      if (view === 'profile') {
        fetch(`/api/profile/${user.id}?viewerId=${user.id}`).then(r => r.json()).then(res => {
          if (res.success) setProfileData(res.user);
        });
      }
    }
  };

  const idCardRef = useRef<HTMLDivElement | null>(null);

  const downloadDigitalId = async () => {
    const profile = profileData || user;
    if (!profile) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 760;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1a1a1a');
    gradient.addColorStop(1, '#0d0d0d');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#d4a32a';
    ctx.fillRect(0, 0, canvas.width, 140);
    ctx.fillStyle = '#000';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('MINDANAO STATE UNIVERSITY', 36, 70);
    ctx.font = 'bold 24px Arial';
    ctx.fillText('SYSTEM DIGITAL ID', 36, 108);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px Arial';
    ctx.fillText((profile.name || 'Student Name').toUpperCase(), 320, 255);
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#d4a32a';
    ctx.fillText(`Student ID: ${profile.student_id || 'N/A'}`, 320, 315);
    ctx.fillStyle = '#fff';
    ctx.fillText(`Program: ${profile.program || 'N/A'}`, 320, 365);
    ctx.fillText(`Year Level: ${profile.year_level || 'N/A'}`, 320, 415);
    ctx.fillText(`Campus: ${profile.campus || 'N/A'}`, 320, 465);

    ctx.fillStyle = 'rgba(212,163,42,0.2)';
    ctx.fillRect(36, 180, 240, 280);
    ctx.fillStyle = '#d4a32a';
    ctx.font = 'bold 30px Arial';
    ctx.fillText((profile.name || 'U')[0].toUpperCase(), 140, 330);

    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = `${(profile.name || 'onemsu').replace(/\s+/g, '-').toLowerCase()}-digital-id.png`;
    link.click();
  };

  const renderProfile = () => {
    const profile = profileData || user;
    return (
    <div className="h-full w-full bg-[#0a0502] text-gray-200 p-4 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <h2 className="text-4xl font-black text-white tracking-tight">Student <span className="text-amber-500">Identity</span></h2>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        {/* ID Card Design */}
        <div className="relative group">
          <motion.div 
            ref={idCardRef}
            initial={{ rotateY: -10, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            className="w-full max-w-md mx-auto aspect-[1.58/1] bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] rounded-3xl border-2 border-white/10 shadow-2xl overflow-hidden relative preserve-3d"
          >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
              <Logo className="w-full h-full scale-150 rotate-12" />
            </div>
            
            {/* Header Strip */}
            <div className="h-16 bg-gradient-to-r from-amber-600 to-amber-400 flex items-center px-6 justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg p-1.5 backdrop-blur-md">
                  <Logo className="w-full h-full" />
                </div>
                <div>
                  <h3 className="text-black font-black text-sm leading-none uppercase tracking-tighter">Mindanao State University</h3>
                  <p className="text-black/70 text-[8px] font-bold uppercase tracking-widest mt-0.5">System Digital Identity</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-black font-black text-xs uppercase tracking-widest">ONE MSU</p>
              </div>
            </div>

            <div className="p-8 flex gap-8">
              {/* Profile Picture Area */}
              <div className="shrink-0">
                <div className="w-32 h-32 rounded-2xl border-4 border-white/10 overflow-hidden bg-black/40 relative group/pic">
                  {(tempAvatar || profile?.avatar) ? (
                    <img src={tempAvatar || profile?.avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-amber-500/20">
                      {user?.name?.[0] || 'M'}
                    </div>
                  )}
                  <button 
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'image/*';
                      input.onchange = async (ev: any) => {
                        const file = ev.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          const dataUrl = reader.result as string;
                          setTempAvatar(dataUrl);
                          const res = await fetch('/api/upload', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ dataUrl })
                          }).then(r => r.json());
                          if (res.success && user) {
                            const upRes = await fetch(`/api/profile/${user.id}`, {
                              method: 'PUT',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ avatar: res.url })
                            }).then(r => r.json());
                            if (upRes.success) {
                              setUser(upRes.user);
                              setTempAvatar(null);
                            }
                          }
                        };
                        reader.readAsDataURL(file);
                      };
                      input.click();
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover/pic:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold uppercase"
                  >
                    Update
                  </button>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] mb-1">Student ID</div>
                  <div className="text-sm font-mono font-bold text-white tracking-widest">
                    {profile?.student_id || '2024-XXXX'}
                  </div>
                </div>
              </div>

              {/* Info Area */}
              <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                  <div className="text-[10px] text-amber-500 font-black uppercase tracking-[0.2em] mb-1">Full Name</div>
                  <h4 className="text-xl font-black text-white uppercase tracking-tight leading-tight mb-4">
                    {profile?.name || 'Student Name'}
                  </h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Course / Program</div>
                      <p className="text-[10px] font-bold text-gray-200 uppercase truncate">
                        {profile?.program || 'Not Set'}
                      </p>
                    </div>
                    <div>
                      <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Year Level</div>
                      <p className="text-[10px] font-bold text-gray-200 uppercase">
                        {profile?.year_level ? `${profile.year_level} Year` : 'Not Set'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                  <div>
                    <div className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mb-0.5">Campus</div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase">
                      {profile?.campus || 'MSU System'}
                    </p>
                  </div>
                  <div className="w-12 h-12 opacity-20">
                    <Logo />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Holographic Overlays */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-[60px] rounded-full translate-y-1/2 -translate-x-1/2" />
          </motion.div>
          
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => setProfileEditing(v => !v)}
              className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all font-bold text-sm"
            >
              {profileEditing ? 'Close Editor' : 'Update ID Details'}
            </button>
            <button onClick={downloadDigitalId} className="px-8 py-3 rounded-2xl bg-amber-500 text-black font-bold text-sm hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20">
              Download Digital ID
            </button>
          </div>
        </div>

        {profileEditing && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 p-8 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-xl"
          >
            <ProfileForm user={user} onSaved={(u) => { setUser(u); setProfileData(u); setProfileEditing(false); }} />
          </motion.div>
        )}
      </div>
    </div>
  );
  };

  const [lostFoundItems, setLostFoundItems] = useState<{ id: number; title: string; description: string; location: string; type: 'lost' | 'found'; status: 'open' | 'claimed'; timestamp: string; image_url?: string; user_id: number }[]>([]);
  const [lostFoundForm, setLostFoundForm] = useState({ title: '', description: '', location: '', type: 'lost' as 'lost' | 'found', imagePreview: null as string | null });

  useEffect(() => {
    if (isLoggedIn && view === 'lostfound') {
      fetch('/api/lostfound').then(r => r.json()).then(setLostFoundItems);
    }
  }, [isLoggedIn, view]);

  const renderLostFound = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Lost & <span className="text-amber-500">Found</span></h2>
            <p className="text-gray-500 text-sm mt-1">Reuniting MSUans with their belongings.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Plus size={18} className="text-amber-500" /> Report Item</h3>
              <div className="space-y-4">
                <div className="flex p-1 rounded-xl bg-black/40 border border-white/10">
                  <button 
                    onClick={() => setLostFoundForm(prev => ({ ...prev, type: 'lost' }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${lostFoundForm.type === 'lost' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    Lost
                  </button>
                  <button 
                    onClick={() => setLostFoundForm(prev => ({ ...prev, type: 'found' }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${lostFoundForm.type === 'found' ? 'bg-amber-500 text-black' : 'text-gray-500 hover:text-white'}`}
                  >
                    Found
                  </button>
                </div>
                <input 
                  placeholder="What did you lose/find?"
                  value={lostFoundForm.title}
                  onChange={e => setLostFoundForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
                <textarea 
                  placeholder="Describe the item..."
                  value={lostFoundForm.description}
                  onChange={e => setLostFoundForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 min-h-[100px]"
                />
                <input 
                  placeholder="Where? (e.g. Science Bldg)"
                  value={lostFoundForm.location}
                  onChange={e => setLostFoundForm(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
                />
                <label className="block w-full py-2 rounded-xl border border-dashed border-white/20 text-center text-xs text-gray-500 hover:border-amber-500/50 cursor-pointer transition-all">
                  {lostFoundForm.imagePreview ? 'Change Image' : 'Add Photo'}
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => setLostFoundForm(prev => ({ ...prev, imagePreview: reader.result as string }));
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
                {lostFoundForm.imagePreview && (
                  <div className="relative rounded-xl overflow-hidden border border-white/10">
                    <img src={lostFoundForm.imagePreview} className="w-full h-32 object-cover" />
                    <button onClick={() => setLostFoundForm(prev => ({ ...prev, imagePreview: null }))} className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"><X size={12} /></button>
                  </div>
                )}
                <button 
                  onClick={async () => {
                    if (!user || !lostFoundForm.title) return;
                    let imageUrl: string | undefined;
                    if (lostFoundForm.imagePreview) {
                      const up = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ dataUrl: lostFoundForm.imagePreview })
                      }).then(r => r.json());
                      if (up.success) imageUrl = up.url;
                    }
                    const res = await fetch('/api/lostfound', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...lostFoundForm, userId: user.id, imageUrl })
                    }).then(r => r.json());
                    if (res.success) {
                      setLostFoundItems(prev => [res.item, ...prev]);
                      setLostFoundForm({ title: '', description: '', location: '', type: 'lost', imagePreview: null });
                    }
                  }}
                  className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all active:scale-95"
                >
                  Post Report
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-6">
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
              {['All Items', 'Lost', 'Found', 'My Posts'].map(tab => (
                <button key={tab} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white whitespace-nowrap">
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {lostFoundItems.map(item => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={item.id} 
                  className="rounded-3xl bg-white/5 border border-white/10 overflow-hidden group hover:border-amber-500/30 transition-all"
                >
                  <div className="relative h-48 bg-black/40">
                    {item.image_url ? (
                      <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-700">
                        <Image size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.type === 'lost' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {item.type}
                      </span>
                    </div>
                    {item.status === 'claimed' && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="px-4 py-2 border-2 border-amber-500 text-amber-500 font-black uppercase tracking-[0.2em] rotate-[-12deg]">Claimed</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h4 className="font-bold text-white mb-2 line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-1"><MapPin size={12} className="text-amber-500" /> {item.location}</div>
                      <div>{new Date(item.timestamp).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 flex gap-2">
                      <button className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold hover:bg-white/10 transition-all">Details</button>
                      <button className="flex-1 py-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-bold hover:bg-amber-500/20 transition-all">Contact</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {lostFoundItems.length === 0 && (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                <Search className="mx-auto mb-4 text-gray-600" size={40} />
                <p className="text-gray-500">No items reported yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderScheduler = () => (
    <div className="min-h-screen bg-[#0a0502] text-gray-200 p-6 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-5xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Student <span className="text-amber-500">Scheduler</span></h2>
            <p className="text-gray-500 text-sm mt-1">Plan classes, deadlines, and campus tasks in one place.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 p-6 rounded-3xl bg-white/5 border border-white/10">
            <h3 className="font-bold text-white mb-4">Create Schedule</h3>
            <div className="space-y-3">
              <input value={schedulerForm.title} onChange={(e) => setSchedulerForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Title" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <textarea value={schedulerForm.details} onChange={(e) => setSchedulerForm(prev => ({ ...prev, details: e.target.value }))} placeholder="Details" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm min-h-24" />
              <input type="date" value={schedulerForm.scheduleDate} onChange={(e) => setSchedulerForm(prev => ({ ...prev, scheduleDate: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input type="time" value={schedulerForm.scheduleTime} onChange={(e) => setSchedulerForm(prev => ({ ...prev, scheduleTime: e.target.value }))} className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <input value={schedulerForm.location} onChange={(e) => setSchedulerForm(prev => ({ ...prev, location: e.target.value }))} placeholder="Location" className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm" />
              <button
                onClick={async () => {
                  if (!user || !schedulerForm.title || !schedulerForm.scheduleDate || !schedulerForm.scheduleTime) return;
                  const res = await fetch('/api/schedules', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id, ...schedulerForm })
                  }).then(r => r.json());
                  if (res.success) {
                    setScheduleItems(prev => [...prev, res.item].sort((a, b) => `${a.schedule_date} ${a.schedule_time}`.localeCompare(`${b.schedule_date} ${b.schedule_time}`)));
                    setSchedulerForm({ title: '', details: '', scheduleDate: '', scheduleTime: '', location: '' });
                  }
                }}
                className="w-full py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400"
              >Save Schedule</button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            {scheduleItems.map((item) => (
              <div key={item.id} className="p-5 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-bold text-white">{item.title}</p>
                    <p className="text-xs text-amber-500 mt-1">{item.schedule_date} • {item.schedule_time}{item.location ? ` • ${item.location}` : ''}</p>
                    {item.details && <p className="text-sm text-gray-300 mt-3">{item.details}</p>}
                  </div>
                  <button onClick={async () => {
                    if (!user) return;
                    const res = await fetch(`/api/schedules/${item.id}?userId=${user.id}`, { method: 'DELETE' }).then(r => r.json());
                    if (res.success) setScheduleItems(prev => prev.filter(x => x.id !== item.id));
                  }} className="px-3 py-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold">Delete</button>
                </div>
              </div>
            ))}
            {scheduleItems.length === 0 && <div className="text-center text-gray-500 py-14 border border-dashed border-white/10 rounded-3xl">No schedules yet.</div>}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfession = () => (
    <div className="h-full w-full bg-[#0a0502] text-gray-200 p-4 md:p-12 overflow-y-auto scrollbar-hide">
      <div className="max-w-4xl mx-auto pb-20">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black text-white tracking-tight">Freedom <span className="text-amber-500">Wall</span></h2>
            <p className="text-gray-500 text-sm mt-1">Post as ONEMSU and share your voice with the MSU community.</p>
          </div>
          <button onClick={() => setView('dashboard')} className="p-3 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white transition-all hover:scale-110">
            <X size={24} />
          </button>
        </header>

        <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 mb-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
              <Sparkles size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create a Post</h3>
              <p className="text-xs text-gray-500">Posts in this wall are published with nickname: ONEMSU.</p>
            </div>
          </div>

          <input
            value={confessionAlias}
            onChange={(e) => setConfessionAlias(e.target.value.slice(0, 40))}
            placeholder="Nickname"
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all mb-4"
          />

          <textarea
            value={freedomText}
            onChange={(e) => setFreedomText(e.target.value)}
            placeholder="What's on your mind? Confess something..."
            rows={4}
            className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all resize-none mb-4"
          />

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 hover:bg-white/10 cursor-pointer transition-colors">
                <Image size={16} className="text-amber-500" />
                {freedomImagePreview ? 'Change Image' : 'Attach Image'}
                <input
                  type="file"
                  accept="image/*,.gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) { setFreedomImagePreview(null); return; }
                    const reader = new FileReader();
                    reader.onload = () => setFreedomImagePreview(reader.result as string);
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>
              {freedomImagePreview && (
                <button 
                  onClick={() => setFreedomImagePreview(null)}
                  className="p-2 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-colors"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <button
              onClick={async () => {
                if (!user || !freedomText.trim()) return;
                let imageUrl: string | undefined;
                if (freedomImagePreview) {
                  const up = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dataUrl: freedomImagePreview })
                  }).then(r => r.json());
                  if (up.success) imageUrl = up.url;
                }
                const res = await fetch('/api/freedomwall', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId: user.id, alias: confessionAlias || 'ONEMSU', content: freedomText.trim(), campus: user.campus || 'Global', imageUrl })
                }).then(r => r.json());
                if (res.success) {
                  setFreedomText('');
                  setFreedomImagePreview(null);
                  setFreedomPosts((prev) => [res.item, ...prev]);
                }
              }}
              className="px-8 py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all shadow-lg shadow-amber-900/20 active:scale-95"
            >
              Post as ONEMSU
            </button>
          </div>

          {freedomImagePreview && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl overflow-hidden border border-white/10 relative group"
            >
              <img src={freedomImagePreview} alt="" className="w-full max-h-96 object-cover" />
            </motion.div>
          )}
        </div>

        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {freedomPosts.map((p) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              key={p.id} 
              className="break-inside-avoid rounded-3xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
            >
              {p.image_url && (
                <div className="relative overflow-hidden">
                  <img src={p.image_url} alt="" className="w-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="text-sm font-bold text-amber-500 flex items-center gap-2">
                      {p.alias}
                      {p.user_id && p.user_id === user?.id && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 text-[8px] font-bold uppercase tracking-wider border border-amber-500/30">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{p.campus} • {new Date(p.timestamp).toLocaleDateString()}</div>
                  </div>
                  <div className="p-2 rounded-full bg-white/5 text-gray-500 group-hover:text-amber-500 transition-colors">
                    <MoreHorizontal size={16} />
                  </div>
                </div>
                
                <p className="text-sm text-gray-200 leading-relaxed mb-6">{p.content}</p>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        fetch(`/api/freedomwall/${p.id}/react`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ type: 'like' })
                        }).then(r => r.json()).then(res => {
                          if (res.success) setFreedomPosts((prev) => prev.map(x => x.id === p.id ? res.item : x));
                        });
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-rose-500 transition-colors"
                    >
                      <Heart size={16} className={p.likes > 0 ? 'fill-rose-500 text-rose-500' : ''} />
                      {p.likes}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-amber-500 transition-colors">
                      <MessageCircle size={16} />
                      0
                    </button>
                  </div>
                  <button className="text-gray-500 hover:text-white transition-colors">
                    <Share2 size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {freedomPosts.length === 0 && (
          <div className="text-center py-20">
            <Sparkles className="mx-auto mb-4 text-gray-600" size={40} />
            <p className="text-gray-500">The wall is empty. Be the first to confess.</p>
          </div>
        )}
      </div>
    </div>
  );
  const speakText = (text: string) => {
    if (!speechEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  };

  const [isTypingLocal, setIsTypingLocal] = useState(false);
  const typingTimeoutRef = useRef<any>(null);

  const handleTyping = () => {
    if (!user || !activeRoom || !socketRef.current) return;
    
    // Skip typing indicator for AI assistant
    if (activeRoom === 'dm-ai-assistant') return;
    
    if (!isTypingLocal) {
      setIsTypingLocal(true);
      socketRef.current.send(JSON.stringify({
        type: 'typing',
        senderId: user.id,
        senderName: user.name,
        roomId: activeRoom,
        isTyping: true
      }));
    }
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTypingLocal(false);
      if (socketRef.current) {
        socketRef.current.send(JSON.stringify({
          type: 'typing',
          senderId: user.id,
          senderName: user.name,
          roomId: activeRoom,
          isTyping: false
        }));
      }
    }, 2000);
  };

  const renderMessenger = () => {
    // Determine the other participant in a DM
    let otherParticipantId: number | null = null;
    if (activeRoom.startsWith('dm-')) {
      const parts = activeRoom.split('-');
      if (parts.length === 3) {
        const a = Number(parts[1]);
        const b = Number(parts[2]);
        otherParticipantId = (user && a === user.id) ? b : a;
      }
    }
    const isOtherOnline = otherParticipantId ? isUserOnline(otherParticipantId) : false;

    const totalUnread = Object.entries(unreadCounts)
      .filter(([room]) => room.startsWith('dm-') || room.startsWith('group-') || ['global', 'help-desk'].includes(room))
      .reduce((sum, [_, count]) => (sum as number) + (count as number), 0);

    return (
    <div className="h-[100dvh] bg-[#0a0502] flex flex-col md:flex-row overflow-hidden text-gray-200">
      {/* Sidebar */}
      <div className={`
        flex flex-col shrink-0 border-r border-white/5 transition-all duration-300
        ${showMobileSidebar ? 'w-full absolute inset-0 z-20 bg-[#0a0502] md:static md:w-80 md:bg-transparent' : 'hidden md:flex md:w-80'}
      `}>
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              Messenger
              {totalUnread > 0 && (
                <motion.span 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                  transition={{ scale: { repeat: Infinity, duration: 2 } }}
                  className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow-lg shadow-rose-900/40"
                >
                  {totalUnread}
                </motion.span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {user && isOwner(user.email) && (
              <button 
                onClick={() => setActiveRoom('announcements')}
                className={`p-2 rounded-lg transition-all ${activeRoom === 'announcements' ? 'bg-amber-500 text-black' : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'}`}
                title="Updates"
              >
                <MessageSquare size={16} />
              </button>
            )}
            <button 
              onClick={() => setView('profile')}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              title="View Profile"
            >
              <UserIcon size={16} />
            </button>
            <button 
              onClick={() => {
                setUser(null);
                setView('home');
              }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
            <button onClick={() => setView('dashboard')} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={20} /></button>
          </div>
        </div>
        
        <div className="p-4 bg-black/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50"
            />
          </div>
          
          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 absolute z-30 left-4 right-4 bg-black/95 border border-white/10 rounded-xl p-2 shadow-2xl">
              {searchResults.map(u => (
                <button 
                  key={u.id}
                  onClick={() => {
                    const roomId = `dm-${Math.min(user!.id, u.id)}-${Math.max(user!.id, u.id)}`;
                    setActiveRoom(roomId);
                    addToDMList({ id: u.id, name: u.name, campus: u.campus, avatar: u.avatar });
                    setSearchResults([]);
                    setSearchQuery('');
                    setShowMobileSidebar(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 text-left"
                >
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold">
                    {u.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-gray-500">{u.campus}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
          {user && isOwner(user.email) && (
            <>
              <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2">Updates</div>
              {['announcements'].map(room => (
                <button 
                  key={room}
                  onClick={() => { setActiveRoom(room); setShowMobileSidebar(false); }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeRoom === room ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
                >
                  <span className="text-sm font-bold capitalize">{room}</span>
                  {unreadCounts[room] > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeRoom === room ? 'bg-black text-amber-500' : 'bg-amber-500 text-black'}`}>
                      {unreadCounts[room]}
                    </span>
                  )}
                </button>
              ))}
            </>
          )}
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mt-6">Direct Messages</div>
          <button 
            onClick={() => { setActiveRoom('dm-ai-assistant'); setShowMobileSidebar(false); }}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeRoom === 'dm-ai-assistant' ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                <Bot size={12} />
              </div>
              <div className="min-w-0 text-left">
                <p className="text-sm font-bold truncate">JARVIS AI</p>
              </div>
            </div>
          </button>
          {directMessageList.map(dm => (
            <button 
              key={dm.id}
              onClick={() => { setActiveRoom(dm.roomId); setShowMobileSidebar(false); }}
              className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeRoom === dm.roomId ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden">
                  {dm.avatar ? <img src={dm.avatar} alt="" className="w-full h-full object-cover" /> : dm.name[0]}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-sm font-bold truncate">{dm.name}</p>
                </div>
              </div>
              {unreadCounts[dm.roomId] > 0 && (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeRoom === dm.roomId ? 'bg-black text-amber-500' : 'bg-amber-500 text-black'}`}>
                  {unreadCounts[dm.roomId]}
                </span>
              )}
            </button>
          ))}
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mt-6">Groups</div>
          <div className="space-y-1">
            {joinedGroups
              .filter(group => isOwner(user?.email) || !user?.campus || group.campus === user.campus)
              .map(group => {
                const gRoom = group.name.toLowerCase().replace(/\s+/g, '-');
                return (
                  <button 
                    key={group.id}
                    onClick={() => { setActiveRoom(gRoom); setShowMobileSidebar(false); }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeRoom === gRoom ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-5 h-5 rounded bg-amber-500/20 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {group.logo_url ? <img src={group.logo_url} alt="" className="w-full h-full object-cover rounded" /> : group.name[0]}
                      </div>
                      <span className="text-sm font-bold truncate">{group.name}</span>
                    </div>
                    {unreadCounts[gRoom] > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeRoom === gRoom ? 'bg-black text-amber-500' : 'bg-amber-500 text-black'}`}>
                        {unreadCounts[gRoom]}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
          
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 mt-6">Campuses</div>
          {CAMPUSES
            .filter(c => isOwner(user?.email) || isVerified(user?.email) || !user?.campus || c.name === user.campus)
            .map(c => (
              <button 
                key={c.slug}
                onClick={() => { setActiveRoom(c.slug); setShowMobileSidebar(false); }}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${activeRoom === c.slug ? 'bg-amber-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-5 h-5 shrink-0"><CampusLogo slug={c.slug} /></div>
                  <span className="text-sm font-bold truncate">{c.name}</span>
                </div>
                {unreadCounts[c.slug] > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${activeRoom === c.slug ? 'bg-black text-amber-500' : 'bg-amber-500 text-black'}`}>
                    {unreadCounts[c.slug]}
                  </span>
                )}
              </button>
            ))
          }
          {user?.campus && CAMPUSES.filter(c => c.name === user.campus).length === 0 && (
             <div className="px-3 py-2 text-[10px] text-gray-600 italic">No matching campus found.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`
        flex-col h-full min-w-0 transition-all duration-300
        ${showMobileSidebar ? 'hidden md:flex flex-1' : 'flex w-full'}
      `}>
        <div className="p-4 md:p-6 border-b border-white/5 flex justify-between items-center bg-black/40 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setShowMobileSidebar(true)} className="md:hidden p-2 -ml-2 text-gray-400 hover:text-white">
              <ChevronRight className="rotate-180" size={24} />
            </button>
            <div 
              className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold shrink-0 cursor-pointer"
              onClick={() => {
                if (activeRoom.startsWith('dm')) {
                   const dmUser = directMessageList.find(d => d.roomId === activeRoom);
                   if (dmUser) setSelectedProfileId(dmUser.id);
                   else if (otherParticipantId) setSelectedProfileId(otherParticipantId);
                }
              }}
            >
              {activeRoom.startsWith('dm') ? (
                 directMessageList.find(d => d.roomId === activeRoom)?.avatar ? 
                 <img src={directMessageList.find(d => d.roomId === activeRoom)?.avatar} className="w-full h-full object-cover rounded-full" /> : 
                 (directMessageList.find(d => d.roomId === activeRoom)?.name[0] || 'DM')
              ) : activeRoom[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 
                className="font-bold text-white capitalize truncate cursor-pointer hover:text-amber-400"
                onClick={() => {
                  if (activeRoom.startsWith('dm')) {
                     const dmUser = directMessageList.find(d => d.roomId === activeRoom);
                     if (dmUser) setSelectedProfileId(dmUser.id);
                     else if (otherParticipantId) setSelectedProfileId(otherParticipantId);
                  }
                }}
              >
                {activeRoom.startsWith('dm') ? 
                  (directMessageList.find(d => d.roomId === activeRoom)?.name || activeRoom.replace(/-/g, ' ')) : 
                  activeRoom.replace(/-/g, ' ')}
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-gray-500 truncate">
                  {activeRoom.startsWith('dm') ? 'Direct Message' : ['global', 'announcements', 'help-desk'].includes(activeRoom) ? 'Channel' : 'Campus'}
                </p>
                {activeRoom.startsWith('dm') && (
                  <p className={`text-[10px] flex items-center gap-1 ${isOtherOnline ? 'text-green-500' : 'text-gray-500'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOtherOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`} />
                    {isOtherOnline ? 'Active now' : 'Offline'}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 md:gap-2 text-gray-500">
            <button
              onClick={() => setMutedRooms(prev => prev.includes(activeRoom) ? prev.filter(r => r !== activeRoom) : [...prev, activeRoom])}
              className="p-2 rounded-lg hover:text-white hover:bg-white/5"
            >
              {mutedRooms.includes(activeRoom) ? <BellOff size={20} /> : <Bell size={20} />}
            </button>
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 rounded-lg hover:text-white hover:bg-white/5"
              >
                <Settings size={20} />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-black/90 border border-white/10 shadow-2xl p-2 text-sm z-50">
                  <button onClick={() => setCompactBubbles(v => !v)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
                    {compactBubbles ? 'Disable compact bubbles' : 'Enable compact bubbles'}
                  </button>
                  <button onClick={() => setShowTimestamps(v => !v)} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5">
                    {showTimestamps ? 'Hide timestamps' : 'Show timestamps'}
                  </button>
                  <button onClick={clearChat} className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-rose-400">
                    Clear for me
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden relative bg-[#0a0502]">
          <div className="flex-1 flex flex-col min-w-0 h-full mx-auto max-w-5xl w-full border-x border-white/5 shadow-2xl">
            {isInVoice && (
              <div className="p-4 border-b border-white/5 bg-black/40">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                    <video 
                      ref={el => { if (el && localStreamRef.current) el.srcObject = localStreamRef.current; }} 
                      autoPlay 
                      muted 
                      playsInline 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 px-2 py-1 rounded-full flex items-center gap-2">
                      {user?.name || 'Me'}
                      {!micOn && <PhoneOff size={10} className="text-rose-500" />}
                    </div>
                  </div>
                  {Array.from(remoteStreams.entries()).map(([id, stream]) => (
                    <div key={id} className="relative aspect-video bg-black rounded-xl overflow-hidden border border-white/10">
                      <video 
                        ref={el => { if (el) el.srcObject = stream; }} 
                        autoPlay 
                        playsInline 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute bottom-2 left-2 text-[10px] font-bold bg-black/60 px-2 py-1 rounded-full">
                        User {id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex-1 p-4 md:px-6 md:py-6 overflow-hidden relative h-full">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center text-gray-500">
                  <div>
                    <MessageCircle className="mx-auto mb-3 opacity-70" />
                    <p className="text-sm">No messages yet.</p>
                  </div>
                </div>
              ) : (
                <>
                  <Virtuoso
                    ref={virtuosoRef}
                    style={{ height: '100%' }}
                    data={messages}
                    firstItemIndex={firstItemIndex}
                    initialTopMostItemIndex={messages.length - 1}
                    computeItemKey={(index, item) => String((item as any).id ?? index)}
                    followOutput="auto"
                    alignToBottom={true} // Ensure initial load is at bottom
                    components={{
                      Scroller: forwardRef<HTMLDivElement, HTMLProps<HTMLDivElement>>((props, ref) => (
                        <div {...props} ref={ref as any} className={`${props.className ?? ''} scrollbar-hide`} style={{ overflowY: 'auto', overflowX: 'hidden', height: '100%' }} />
                      )),
                      Header: () => isLoadingMore ? <div className="py-3 text-center text-xs text-gray-500">Loading older messages…</div> : <div className="h-4" />
                    }}
                    startReached={async () => {
                      if (isLoadingMore || !hasMore) return;
                      
                      const oldestMessage = messages[0];
                      if (!oldestMessage) return;

                      setIsLoadingMore(true);
                      
                      try {
                        const beforeTimestamp = oldestMessage.timestamp;
                        const response = await fetch(`/api/messages/${activeRoom}?userId=${user?.id}&before=${encodeURIComponent(beforeTimestamp)}`);
                        const olderMessages: Message[] = await response.json();
                        
                        if (olderMessages && olderMessages.length > 0) {
                          const newUnique = olderMessages.filter(nm => !messages.some(pm => pm.id === nm.id));
                          
                          if (newUnique.length > 0) {
                            setFirstItemIndex(prev => prev - newUnique.length);
                            setMessages(prev => [...newUnique, ...prev]);
                          }
                          
                          setHasMore(olderMessages.length >= 50);
                        } else {
                          setHasMore(false);
                        }
                      } catch (error) {
                        console.error("Failed to load older messages:", error);
                      } finally {
                        setIsLoadingMore(false);
                      }
                    }}
                    itemContent={(index, m) => {
                      const sid = (m as any).sender_id ?? (m as any).senderId;
                      const sname = (m as any).sender_name ?? (m as any).senderName;
                      const ts = (m as any).timestamp;
                      const mUrl = (m as any).media_url ?? (m as any).mediaUrl;
                      const mType = (m as any).media_type ?? (m as any).mediaType;
                      const isMe = sid === user?.id;
                      
                      const prevMsg = messages[index - 1];
                      const prevSid = prevMsg ? ((prevMsg as any).sender_id ?? (prevMsg as any).senderId) : null;
                      const isChain = prevSid === sid;
                      
                      const nextMsg = messages[index + 1];
                      const nextSid = nextMsg ? ((nextMsg as any).sender_id ?? (nextMsg as any).senderId) : null;
                      const isLastInChain = nextSid !== sid;

                      return (
                        <div className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'} ${isLastInChain ? 'mb-2' : 'mb-1'} px-4 md:px-6`}>
                          <div 
                            className={`flex flex-col max-w-[85%] md:max-w-[70%] ${isMe ? 'items-end' : 'items-start'} gap-1 relative min-w-0`}
                            onContextMenu={(e) => {
                              if (isMe) {
                                e.preventDefault();
                                if (confirm('Delete this message?')) deleteMessage(m.id);
                              }
                            }}
                          >
                            {!activeRoom.startsWith('dm') && !isChain && !isMe && (
                              <span 
                                className={`text-xs font-bold text-gray-400 mt-2 mb-0.5 flex items-center gap-1 cursor-pointer hover:text-amber-400 justify-start w-auto`}
                                onClick={() => setSelectedProfileId(sid)}
                              >
                                {sname}
                                {isVerified((m as any).sender_email || (m as any).senderEmail) && (
                                  <span className="p-0.5 rounded-full bg-amber-500 text-black" title="Verified">
                                    <ShieldCheck size={8} />
                                  </span>
                                )}
                                {((m as any).sender_email === 'xandercamarin@gmail.com' || (m as any).senderEmail === 'xandercamarin@gmail.com') && (
                                  <span className="p-0.5 rounded bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[8px] font-bold" title="Founder">
                                    FOUNDER
                                  </span>
                                )}
                              </span>
                            )}
                            <div className={`
                              ${compactBubbles ? 'px-3 py-1.5' : 'px-4 py-2'} 
                              text-sm break-words whitespace-pre-wrap [overflow-wrap:anywhere] shadow-sm max-w-full
                              ${isMe 
                                ? `bg-amber-500 text-black ${isChain ? 'rounded-tr-md' : 'rounded-tr-2xl'} ${isLastInChain ? 'rounded-br-2xl' : 'rounded-br-md'} rounded-l-2xl` 
                                : `bg-white/10 text-white ${isChain ? 'rounded-tl-md' : 'rounded-tl-2xl'} ${isLastInChain ? 'rounded-bl-2xl' : 'rounded-bl-md'} rounded-r-2xl`}
                            `}>
                              {(m as any).content}
                              {mUrl && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-white/10 max-w-full">
                                  {mType?.startsWith('video') ? <video src={mUrl} controls className="w-full" /> : <img src={mUrl} alt="" className="w-full object-cover" />}
                                </div>
                              )}
                            </div>
                            {showTimestamps && isLastInChain && (
                              <span className={`text-[9px] text-gray-500 px-1 ${isMe ? 'text-right' : 'text-left'} w-full flex items-center gap-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                {new Date(ts).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    }}
                    atBottomStateChange={(isAtBottom) => {
                      stickToBottomRef.current = isAtBottom;
                      if (isAtBottom) sendSeen();
                    }}
                  />
                  {typingUsers[activeRoom]?.length > 0 && (
                    <div className="absolute bottom-4 left-6 flex items-center gap-2 text-[10px] text-amber-500 font-bold bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-amber-500/20 shadow-lg animate-in fade-in slide-in-from-bottom-2">
                      <div className="flex gap-1">
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" />
                      </div>
                      {typingUsers[activeRoom].join(', ')} {typingUsers[activeRoom].length > 1 ? 'are' : 'is'} {activeRoom === 'dm-ai-assistant' ? 'compiling response...' : 'typing...'}
                    </div>
                  )}
                </>
              )}
            </div>
            <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
              {(activeRoom === 'announcements' && !isOwner(user?.email)) ? (
                <div className="flex justify-center items-center py-3 bg-white/5 rounded-2xl border border-white/10 text-gray-500 text-sm">
                  <ShieldCheck size={16} className="mr-2 text-amber-500/50" />
                  This channel is read-only. Only MSU Admins can post.
                </div>
              ) : (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!user) return; // Guard clause
                    const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
                    if (input.value.trim()) {
                      const msgContent = input.value;
                      // Clear immediately to prevent double send
                      input.value = '';
                      setIsTypingLocal(false);
                      
                      // Send
                      sendMessage(msgContent);
                      
                      if (socketRef.current) {
                        socketRef.current.send(JSON.stringify({
                          type: 'typing',
                          senderId: user.id,
                          senderName: user.name,
                          roomId: activeRoom,
                          isTyping: false
                        }));
                      }
                    }
                  }}
                  className="flex w-full items-center gap-2"
                >
                  <input 
                    name="message"
                    type="text"
                    placeholder="Type a message…"
                    autoComplete="off"
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                       if (e.key === 'Enter' && !e.shiftKey) {
                         e.preventDefault();
                         // Manually trigger the submit handler since requestSubmit() can be flaky in some contexts
                         const form = e.currentTarget.form;
                         if (form) {
                           form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
                         }
                       }
                    }}
                    className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50"
                  />
                  <button 
                    type="submit"
                    disabled={isSending}
                    className={`p-3 rounded-2xl bg-amber-500 text-black hover:bg-amber-400 transition-colors shrink-0 flex items-center justify-center ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSending ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
                  </button>
                </form>
              )}
            </div>
          </div>
          
        </div>
      </div>

      {/* Profile Detail Overlay */}
      <AnimatePresence>
        {selectedProfileId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <ProfileDetail id={selectedProfileId} onClose={() => setSelectedProfileId(null)} />
          </div>
        )}
      </AnimatePresence>
    </div>
    );
  };

  const ProfileDetail = ({ id, onClose }: { id: number; onClose: () => void }) => {
    const [pUser, setPUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
      if (!id || isNaN(id)) {
        setError(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      fetch(`/api/profile/${id}?viewerId=${user?.id}`)
        .then(r => r.json())
        .then(res => {
          if (res.success) setPUser(res.user);
          else setError(true);
        })
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, [id]);

    if (loading) return (
      <div className="text-white flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-bold">Loading profile...</div>
        <button onClick={onClose} className="text-gray-500 hover:text-white text-sm">Cancel</button>
      </div>
    );

    if (error || !pUser) return (
      <div className="bg-[#0a0502] p-8 rounded-2xl border border-white/10 text-center max-w-sm">
        <div className="text-rose-500 font-bold mb-2">Profile Not Found</div>
        <p className="text-gray-400 text-sm mb-6">Could not load user information.</p>
        <button onClick={onClose} className="px-6 py-2 bg-white/10 rounded-xl hover:bg-white/20 text-white font-medium">Close</button>
      </div>
    );

    const handleFollow = async () => {
      await toggleFollow(id);
      fetch(`/api/profile/${id}?viewerId=${user?.id}`).then(r => r.json()).then(res => res.success && setPUser(res.user));
    };

    return (
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-md card-gold rounded-3xl overflow-hidden shadow-2xl"
      >
        <div 
          className="h-32 bg-gradient-to-br from-amber-600/30 to-black relative"
          style={{ backgroundImage: pUser.cover_photo ? `url(${pUser.cover_photo})` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-8 relative">
          <div className="absolute -top-12 left-6">
            <div className="w-24 h-24 rounded-full ring-4 ring-black overflow-hidden bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-3xl">
              {pUser.avatar ? <img src={pUser.avatar} alt="" className="w-full h-full object-cover" /> : pUser.name[0]}
            </div>
          </div>
          <div className="pt-14">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  {pUser.name}
                  {isOwner(pUser.email) && (
                    <span className="p-1 rounded-full bg-amber-500 text-black" title="Verified Owner">
                      <ShieldCheck size={14} />
                    </span>
                  )}
                </h3>
                <p className="text-amber-500 text-sm font-medium">{pUser.campus}</p>
              </div>
              {user && user.id !== id && (
                <button
                  onClick={handleFollow}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${pUser.isFollowing ? 'bg-white/10 text-white border border-white/20' : 'bg-amber-500 text-black'}`}
                >
                  {pUser.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <div className="mt-4 flex gap-6 text-center">
              <div>
                <div className="text-lg font-bold text-white">{pUser.followers || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold text-white">{pUser.following || 0}</div>
                <div className="text-[10px] text-gray-500 uppercase tracking-wider">Following</div>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-gray-300">
              {pUser.program && <p><span className="text-gray-500 uppercase text-[10px] block">Program</span> {pUser.program}</p>}
              {pUser.bio && <p className="italic text-gray-400">"{pUser.bio}"</p>}
            </div>
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => {
                  setActiveRoom(`dm-${Math.min(user!.id, pUser.id)}-${Math.max(user!.id, pUser.id)}`);
                  onClose();
                  setView('messenger');
                  setShowMobileSidebar(false);
                }}
                className="flex-1 bg-amber-500 text-black font-bold py-3 rounded-xl hover:bg-amber-400 transition-all"
              >
                Message
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-[100dvh] w-full selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden overflow-y-auto scrollbar-hide">
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-[9999]"
          >
            <SplashScreen />
          </motion.div>
        )}
      </AnimatePresence>


      <AnimatePresence mode="wait">
        {view === 'home' && (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {renderHome()}
          </motion.div>
        )}
        {view === 'explorer' && (
          <motion.div
            key="explorer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderExplorer()}
          </motion.div>
        )}
        {view === 'about' && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderAbout()}
          </motion.div>
        )}
        {view === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {renderDashboard()}
          </motion.div>
        )}
        {view === 'newsfeed' && (
          <motion.div
            key="newsfeed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderNewsfeed()}
          </motion.div>
        )}
        {view === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderProfile()}
          </motion.div>
        )}
        {view === 'confession' && (
          <motion.div
            key="confession"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderConfession()}
          </motion.div>
        )}
        {view === 'feedbacks' && (
          <motion.div
            key="feedbacks"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderFeedbacks()}
          </motion.div>
        )}
        {view === 'lostfound' && (
          <motion.div
            key="lostfound"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderLostFound()}
          </motion.div>
        )}
        {view === 'scheduler' && (
          <motion.div
            key="scheduler"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {renderScheduler()}
          </motion.div>
        )}
        {view === 'messenger' && (
          <motion.div
            key="messenger"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {renderMessenger()}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-4 rounded-2xl bg-amber-500 text-black font-bold shadow-2xl shadow-amber-900/40 flex items-center gap-3 cursor-pointer hover:bg-amber-400 transition-colors"
            onClick={() => {
              setActiveRoom(toast.roomId);
              setView('messenger');
              setToast(null);
            }}
          >
            <div className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center">
              <MessageCircle size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs opacity-70 uppercase tracking-wider">New Notification</span>
              <span>{toast.message}</span>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setToast(null); }}
              className="ml-2 p-1 rounded-lg hover:bg-black/10 transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Navigation Overlay (Mobile) */}
      {!isLoggedIn && (
        <div className="fixed top-6 right-6 z-50 md:hidden">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-3 rounded-full bg-amber-500 text-black shadow-lg"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      )}

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-40 bg-black/95 flex flex-col items-center justify-center p-8 md:hidden"
          >
            <div className="flex flex-col gap-8 text-center">
              <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">Home</button>
              <button onClick={() => { setView('explorer'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">Campuses</button>
              <button onClick={() => { setView('about'); setIsMenuOpen(false); }} className="text-4xl font-bold text-white">About</button>
              <div className="h-px w-24 bg-amber-500/30 mx-auto my-4" />
              <div className="flex gap-6 justify-center text-amber-500">
                <Github size={24} />
                <Globe size={24} />
                <Info size={24} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
