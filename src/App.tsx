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
  Monitor
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
    top: "12%", left: "8%",
    color: "#8e1212",
    website: "https://www.msumain.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Main+Campus+Marawi+City",
    sources: [
      { label: "MSU Main Official", url: "https://www.msumain.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mindanao_State_University" },
    ]
  },
  {
    name: "MSU IIT",
    slug: "msu-iit",
    location: "Iligan City",
    description: "A leading institute in science, engineering, IT, and liberal arts in Northern Mindanao.",
    stats: { students: "18k+", courses: "120+" },
    top: "18%", left: "82%",
    top: "26%", left: "82%",
    color: "#1a3a5a",
    website: "https://www.msuiit.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU-IIT+Iligan+City",
    sources: [
      { label: "MSU-IIT Official", url: "https://www.msuiit.edu.ph/" },
      { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mindanao_State_University%E2%80%93Iligan_Institute_of_Technology" },
    ]
  },
  {
    name: "MSU Gensan",
    slug: "msu-gensan",
    location: "General Santos City",
    description: "Serving the SOCCSKSARGEN region through programs in education, business, and applied sciences.",
    stats: { students: "12k+", courses: "90+" },
    top: "30%", left: "12%",
    top: "38%", left: "12%",
    color: "#1b5e20",
    website: "https://gensan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+General+Santos+Campus",
    sources: [
      { label: "MSU Gensan Official", url: "https://gensan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
    ]
  },
  {
    name: "MSU Tawi-Tawi",
    slug: "msu-tawi-tawi",
    location: "Bongao, Tawi-Tawi",
    description: "Known for fisheries, marine science, and ocean-related studies in the southern Philippines.",
    stats: { students: "8k+", courses: "45+" },
    top: "42%", left: "78%",
    top: "56%", left: "76%",
    color: "#01579b",
    website: "https://tawitawi.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Tawi-Tawi+College+of+Technology+and+Oceanography",
    sources: [
      { label: "MSU Tawi-Tawi Official", url: "https://tawitawi.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Tawi-Tawi+College+of+Technology+and+Oceanography" },
    ]
  },
  {
    name: "MSU Naawan",
    slug: "msu-naawan",
    location: "Naawan, Misamis Oriental",
    description: "A center for fisheries, aquaculture, and coastal resource research and development.",
    stats: { students: "5k+", courses: "35+" },
    top: "14%", left: "68%",
    top: "18%", left: "74%",
    color: "#e65100",
    website: "https://naawan.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Naawan",
    sources: [
      { label: "MSU Naawan Official", url: "https://naawan.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Naawan" },
    ]
  },
  {
    name: "MSU Maguindanao",
    slug: "msu-maguindanao",
    location: "Datu Odin Sinsuat, Maguindanao",
    description: "A major MSU campus focused on inclusive development, governance, and community-based learning.",
    stats: { students: "7k+", courses: "50+" },
    top: "60%", left: "10%",
    top: "64%", left: "10%",
    color: "#33691e",
    website: "https://maguindanao.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Maguindanao",
    sources: [
      { label: "MSU Maguindanao Official", url: "https://maguindanao.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Maguindanao" },
    ]
  },
  {
    name: "MSU Sulu",
    slug: "msu-sulu",
    location: "Jolo, Sulu",
    description: "Supports higher education access and peace-building initiatives in Sulu and nearby island communities.",
    stats: { students: "6k+", courses: "40+" },
    top: "48%", left: "86%",
    top: "44%", left: "84%",
    color: "#bf360c",
    website: "https://sulu.msu.edu.ph/",
    mapUrl: "https://www.google.com/maps/search/MSU+Sulu",
    sources: [
      { label: "MSU Sulu Official", url: "https://sulu.msu.edu.ph/" },
      { label: "MSU System", url: "https://www.msu.edu.ph/" },
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Sulu" },
    ]
  },
  {
    name: "MSU Buug",
    slug: "msu-buug",
    location: "Buug, Zamboanga Sibugay",
    description: "Provides programs in teacher education, agriculture, and community extension services.",
    stats: { students: "4k+", courses: "30+" },
    top: "72%", left: "68%",
    top: "70%", left: "68%",
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
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Maigo+School+of+Arts+and+Trades" },
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
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+LNCAT+Bacolod+Lanao+del+Norte" },
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
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Malabang+Community+High+School" },
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
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Marantao+Community+High+School" },
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
      { label: "Google Maps", url: "https://www.google.com/maps/search/MSU+Masiu+Community+High+School" },
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

const WELCOME_SCENES = [
  {
    title: 'Welcome to ONEMSU',
    text: 'Your digital hub connecting students across the Mindanao State University system.',
    tips: ['Explore campuses and official links', 'Join communities and groups', 'Use one account for updates and messaging']
  },
  {
    title: 'Campus Explorer Guide',
    text: 'Use Explorer to compare campuses, verify trusted sources, and open 3D campus map views.',
    tips: ['Tap any campus in the left panel', 'Open Reliable Sources for official pages', 'Use 3D Campus Map for immersive view']
  },
  {
    title: 'Social + Messenger',
    text: 'Post on the freedom wall, join groups, and chat in real-time with classmates and organizations.',
    tips: ['Use Messenger for direct and group channels', 'Join campus-based organizations', 'Share feedback to improve the platform']
  },
  {
    title: 'Stay Safe and Verified',
    text: 'Always rely on official campus links and verify announcements before sharing.',
    tips: ['Check source badges before opening links', 'Protect your account credentials', 'Report suspicious posts in-app']
  },
  {
    title: "Let's Get Started",
    text: 'Navigate to Explorer, Dashboard, and Messenger anytime from the top menu.',
    tips: ['Complete your profile', 'Follow your campus updates', 'Invite classmates to ONEMSU']
  }
] as const;

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
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('onemsu_splash_seen') !== 'true';
  });
  const [view, setView] = useState<'home' | 'explorer' | 'about' | 'dashboard' | 'messenger' | 'newsfeed' | 'profile' | 'confession' | 'feedbacks' | 'lostfound'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('onemsu_view');
      const validViews = ['home', 'explorer', 'about', 'dashboard', 'messenger', 'newsfeed', 'profile', 'confession', 'feedbacks', 'lostfound'];
      if (saved && validViews.includes(saved)) {
        return saved as any;
      }
    }
    return 'home';
  });

  useEffect(() => {
    if (!showSplash) return;

    // Mark splash as seen immediately so refresh won't replay it.
    localStorage.setItem('onemsu_splash_seen', 'true');

    const timer = setTimeout(() => {
      setShowSplash(false);
      localStorage.setItem('onemsu_splash_seen', 'true');
    }, 10000);

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
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('onemsu_welcome_seen') !== 'true';
  });
  const [welcomeSecond, setWelcomeSecond] = useState(60);

  useEffect(() => {
    if (showSplash) return;
    if (typeof window !== 'undefined' && localStorage.getItem('onemsu_welcome_seen') === 'true') return;
    if (view !== 'home') return;
    setShowWelcome(true);
    setWelcomeSecond(60);
  }, [showSplash, view]);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = setInterval(() => {
      setWelcomeSecond((prev) => {
        if (prev <= 1) {
          setShowWelcome(false);
          localStorage.setItem('onemsu_welcome_seen', 'true');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWelcome]);
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
  const [stickyNotes, setStickyNotes] = useState<{ id: string; content: string; color: string; createdAt: string }[]>(() => {
    try {
      const key = typeof window !== 'undefined'
        ? (user ? `onemsu_stickies_${user.id}` : 'onemsu_stickies_guest')
        : 'onemsu_stickies_guest';
      const saved = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const safeJson = async (r: Response) => {
    try {
      const t = await r.text();
      if (!t) return {};
      return JSON.parse(t);
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
      const data = await res.json();
      if (data.success) {
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
        setAuthError(data.message || 'Unable to create account.');
      }
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
