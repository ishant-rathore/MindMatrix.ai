import React, { useEffect, useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  ChevronRight,
  GraduationCap,
  Heart,
  Languages,
  MapPin,
  Menu,
  MessageCircle,
  Mic,
  Moon,
  ShieldCheck,
  Sparkles,
  Users,
  Waves,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'AI personas', href: '#personas' },
  { label: 'About', href: '#responsible-ai' },
];

const FEATURES = [
  {
    number: '01',
    icon: BrainCircuit,
    title: 'AI mood insights',
    description:
      'Explore an AI-generated summary of your emotional state and an estimated stress level from the words or voice you share.',
    accent: 'orange',
  },
  {
    number: '02',
    icon: Users,
    title: 'Personal AI companions',
    description:
      'Choose from specialized conversation personas for emotional support, study, productivity, career guidance and wellness.',
    accent: 'violet',
  },
  {
    number: '03',
    icon: Mic,
    title: 'Voice-powered check-ins',
    description:
      'Record a voice entry, use speech transcription and interact with voice-enabled AI experiences.',
    accent: 'teal',
  },
  {
    number: '04',
    icon: Languages,
    title: 'Speak your language',
    description:
      'Use the mood analysis experience in English, Hindi or Marathi, with responses tailored to your selected language.',
    accent: 'amber',
  },
  {
    number: '05',
    icon: Activity,
    title: 'Wellness history',
    description:
      'Revisit saved check-ins and view a simple visualization of stress-level entries over time.',
    accent: 'rose',
  },
  {
    number: '06',
    icon: MapPin,
    title: 'Local support discovery',
    description:
      'Explore nearby mental health resources using location-based discovery when you choose to share location access.',
    accent: 'blue',
  },
];

const STEPS = [
  {
    number: '01',
    title: 'Check in',
    description: 'Write what is on your mind or record a voice entry in the language you prefer.',
    icon: MessageCircle,
  },
  {
    number: '02',
    title: 'AI reflects',
    description: 'Gemini processes the submitted input and returns a structured, AI-generated reflection.',
    icon: BrainCircuit,
  },
  {
    number: '03',
    title: 'Explore next steps',
    description: 'Review the emotional summary and practical coping suggestions generated for your check-in.',
    icon: Sparkles,
  },
  {
    number: '04',
    title: 'Keep your history',
    description: 'Continue conversations with AI personas and revisit saved check-ins and trends.',
    icon: Activity,
  },
];

const PERSONAS = [
  {
    initials: 'AN',
    name: 'Ananya',
    role: 'Empathetic Friend',
    category: 'Emotional support',
    description: 'A warm, non-judgmental companion who listens and validates feelings.',
    tint: 'orange',
  },
  {
    initials: 'RA',
    name: 'Rahul',
    role: 'Best Friend',
    category: 'Emotional support',
    description: 'A supportive, easygoing friend for everyday conversations.',
    tint: 'teal',
  },
  {
    initials: 'AA',
    name: 'Aarav',
    role: 'Goal Motivator',
    category: 'Productivity',
    description: 'An energetic coach focused on action, discipline and study goals.',
    tint: 'rose',
  },
  {
    initials: 'RI',
    name: 'Riya',
    role: 'Study Partner',
    category: 'Productivity',
    description: 'A calm study companion for breaking topics into manageable steps.',
    tint: 'blue',
  },
  {
    initials: 'DA',
    name: 'Dadaji',
    role: 'Grandfather',
    category: 'Family wisdom',
    description: 'A patient, grandfatherly perspective for thoughtful conversations.',
    tint: 'amber',
  },
  {
    initials: 'PR',
    name: 'Prof. Rao',
    role: 'Academic Guide',
    category: 'Career & growth',
    description: 'A mentor for academic pressure, career choices and confidence.',
    tint: 'violet',
  },
  {
    initials: 'VI',
    name: 'Vikrant',
    role: 'Career Mentor',
    category: 'Career & growth',
    description: 'Practical guidance on interviews, skill-building and work life.',
    tint: 'teal',
  },
  {
    initials: 'DR',
    name: 'Dr. Anjali',
    role: 'Health Guide',
    category: 'Health & wellness',
    description: 'A wellness-focused guide for healthy habits and everyday well-being.',
    tint: 'green',
  },
];

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const Reveal: React.FC<RevealProps> = ({ children, className = '', delay = 0 }) => {
  const [visible, setVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -36px 0px' }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      className={
        'transform-gpu transition-all duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none ' +
        (visible ? 'translate-y-0 opacity-100 ' : 'translate-y-7 opacity-0 ') +
        className
      }
      style={{ transitionDelay: delay + 'ms' }}
    >
      {children}
    </div>
  );
};

const Logo: React.FC = () => (
  <span className="flex items-center gap-2.5">
    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
      <BrainCircuit size={19} strokeWidth={2.2} />
    </span>
    <span className="text-[17px] font-bold tracking-tight text-white">
      MindMatrix<span className="text-orange-400">.ai</span>
    </span>
  </span>
);

const ProductPreview: React.FC = () => (
  <div className="relative mx-auto w-full max-w-[590px]">
    <div className="absolute -inset-8 rounded-[3rem] bg-orange-500/10 blur-3xl" />
    <div className="absolute -right-7 top-10 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
    <div className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#151210] shadow-[0_28px_100px_rgba(0,0,0,0.55)]">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
            <BrainCircuit size={15} />
          </span>
          <span className="text-xs font-semibold text-stone-100">MindMatrix.ai</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-stone-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          AI companion
        </div>
      </div>

      <div className="grid min-h-[350px] grid-cols-[112px_1fr] sm:grid-cols-[150px_1fr]">
        <aside className="border-r border-white/[0.07] bg-black/20 p-3 sm:p-4">
          <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.17em] text-stone-600">Companions</p>
          {[
            ['AN', 'Ananya', 'bg-orange-500/20 text-orange-300'],
            ['RA', 'Rahul', 'bg-teal-500/20 text-teal-300'],
            ['AA', 'Aarav', 'bg-rose-500/20 text-rose-300'],
            ['RI', 'Riya', 'bg-blue-500/20 text-blue-300'],
          ].map((persona, index) => (
            <div
              key={persona[1]}
              className={
                'mb-2 flex items-center gap-2 rounded-xl px-2 py-2 ' +
                (index === 0 ? 'border border-orange-500/20 bg-orange-500/10' : 'opacity-60')
              }
            >
              <span className={'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ' + persona[2]}>
                {persona[0]}
              </span>
              <span className="truncate text-[9px] font-medium text-stone-300">{persona[1]}</span>
            </div>
          ))}
          <div className="mt-5 border-t border-white/[0.07] pt-4">
            <p className="text-[9px] leading-4 text-stone-600">More ways to reflect, learn and grow.</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col p-3 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[9px] uppercase tracking-[0.16em] text-stone-600">Your conversation</p>
              <p className="mt-1 text-xs font-semibold text-white sm:text-sm">Ananya · Empathetic Friend</p>
            </div>
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-[9px] text-stone-500">Gemini AI</span>
          </div>

          <div className="mb-3 flex items-start gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-300">
              <Heart size={13} />
            </span>
            <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.045] px-3 py-2.5">
              <p className="text-[10px] leading-5 text-stone-300 sm:text-xs">Hey, I’m here to listen. What has been on your mind today?</p>
            </div>
          </div>

          <div className="mb-4 flex justify-end">
            <div className="max-w-[78%] rounded-2xl rounded-tr-md bg-orange-500 px-3 py-2.5">
              <p className="text-[10px] leading-5 text-white sm:text-xs">I have a lot going on with my studies.</p>
            </div>
          </div>

          <div className="mb-5 flex items-start gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-orange-300">
              <Sparkles size={13} />
            </span>
            <div className="max-w-[88%] rounded-2xl rounded-tl-md border border-white/[0.07] bg-white/[0.045] px-3 py-2.5">
              <p className="text-[10px] leading-5 text-stone-300 sm:text-xs">That sounds like a lot to carry. We can take it one step at a time.</p>
            </div>
          </div>

          <div className="mt-auto rounded-xl border border-white/10 bg-black/30 p-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[10px] text-stone-600">Write a message…</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500 text-white">
                <ArrowRight size={13} />
              </span>
            </div>
          </div>
          <p className="mt-2 text-center text-[8px] tracking-wide text-stone-700">ILLUSTRATIVE PRODUCT PREVIEW</p>
        </div>
      </div>
    </div>

    <div className="absolute -left-4 top-20 hidden rounded-2xl border border-white/10 bg-[#211b17]/95 p-3 shadow-2xl backdrop-blur-xl sm:block lg:-left-12">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-orange-300">
          <Activity size={16} />
        </span>
        <div>
          <p className="text-[9px] text-stone-500">Check-in</p>
          <p className="text-xs font-semibold text-white">Mood reflection</p>
        </div>
      </div>
    </div>

    <div className="absolute -bottom-5 -right-3 hidden rounded-2xl border border-white/10 bg-[#211b17]/95 p-3 shadow-2xl backdrop-blur-xl sm:block lg:-right-8">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300">
          <Waves size={16} />
        </span>
        <div>
          <p className="text-[9px] text-stone-500">Input options</p>
          <p className="text-xs font-semibold text-white">Text & voice</p>
        </div>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setMobileMenuOpen(false);

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0c0a09] font-sans text-stone-200 selection:bg-orange-500/30 selection:text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-48 -top-48 h-[520px] w-[520px] rounded-full bg-orange-600/[0.09] blur-[130px]" />
        <div className="absolute -right-48 top-[25%] h-[500px] w-[500px] rounded-full bg-violet-700/[0.07] blur-[140px]" />
        <div className="absolute -bottom-64 left-[25%] h-[480px] w-[480px] rounded-full bg-orange-900/[0.08] blur-[140px]" />
      </div>

      <header className={'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ' + (scrolled ? 'border-white/[0.07] bg-[#0c0a09]/85 py-3 shadow-2xl shadow-black/20 backdrop-blur-2xl' : 'border-transparent bg-transparent py-5')}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" aria-label="MindMatrix.ai home" onClick={closeMenu} className="relative z-10">
            <Logo />
          </a>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            {NAV_ITEMS.map((item) => (
              <a key={item.href} href={item.href} className="text-xs font-semibold text-stone-400 transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button onClick={onStart} className="rounded-full px-4 py-2.5 text-xs font-semibold text-stone-300 transition-colors hover:text-white">
              Log in
            </button>
            <button onClick={onStart} className="group inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/15 transition-all hover:-translate-y-0.5 hover:bg-orange-400 active:translate-y-0">
              Start chatting <ArrowUpRight size={14} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-stone-200 md:hidden"
          >
            {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="absolute inset-x-0 top-full border-b border-white/10 bg-[#100d0b]/98 px-5 pb-5 pt-3 shadow-2xl backdrop-blur-2xl md:hidden">
            <nav className="flex flex-col" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => (
                <a key={item.href} href={item.href} onClick={closeMenu} className="rounded-xl px-3 py-3 text-sm font-medium text-stone-300 transition-colors hover:bg-white/[0.05] hover:text-white">
                  {item.label}
                </a>
              ))}
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-4">
                <button onClick={() => { closeMenu(); onStart(); }} className="rounded-full border border-white/15 px-4 py-3 text-sm font-semibold text-stone-200">
                  Log in
                </button>
                <button onClick={() => { closeMenu(); onStart(); }} className="rounded-full bg-orange-500 px-4 py-3 text-sm font-bold text-white">
                  Start chatting
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="relative z-10">
        <section id="home" className="relative scroll-mt-24 px-5 pb-24 pt-32 sm:px-8 sm:pb-32 sm:pt-40 lg:pb-36 lg:pt-44">
          <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12">
            <div className="relative z-10 max-w-2xl">
              <Reveal>
                <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-400/[0.07] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-orange-300 sm:text-[11px]">
                  <Sparkles size={13} />
                  A more thoughtful kind of AI companion
                </div>
              </Reveal>

              <Reveal delay={90}>
                <h1 className="max-w-3xl text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.055em] text-white sm:text-6xl lg:text-[4.55rem]">
                  Your mind deserves
                  <span className="mt-1 block bg-gradient-to-r from-orange-300 via-orange-400 to-rose-400 bg-clip-text pb-2 text-transparent">
                    a smarter companion.
                  </span>
                </h1>
              </Reveal>

              <Reveal delay={160}>
                <p className="mt-7 max-w-xl text-sm leading-7 text-stone-400 sm:text-base sm:leading-8">
                  An AI-powered space to explore your emotions, find perspective and build a healthier relationship with your well-being — one conversation at a time.
                </p>
              </Reveal>

              <Reveal delay={230}>
                <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                  <button onClick={onStart} className="group inline-flex items-center justify-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 hover:bg-orange-400 active:translate-y-0">
                    Start your journey
                    <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                  </button>
                  <button onClick={scrollToFeatures} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.025] px-7 py-4 text-sm font-semibold text-stone-300 transition-all hover:border-white/30 hover:bg-white/[0.06] hover:text-white">
                    Explore features <ChevronRight size={16} />
                  </button>
                </div>
              </Reveal>

              <Reveal delay={300}>
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6 text-[11px] font-medium text-stone-500">
                  <span className="inline-flex items-center gap-2"><MessageCircle size={14} className="text-orange-400" /> AI conversations</span>
                  <span className="inline-flex items-center gap-2"><Mic size={14} className="text-orange-400" /> Text & voice check-ins</span>
                  <span className="inline-flex items-center gap-2"><Languages size={14} className="text-orange-400" /> English · Hindi · Marathi</span>
                </div>
              </Reveal>
            </div>

            <Reveal delay={180} className="relative px-1 py-4 sm:px-5 lg:px-0">
              <ProductPreview />
            </Reveal>
          </div>

          <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(90%,1100px)] -translate-x-1/2 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </section>

        <section id="product" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <Reveal>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">The experience</p>
              <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                More than a chat.
                <span className="block text-stone-500">A space to check in with yourself.</span>
              </h2>
              <p className="mt-6 max-w-lg text-sm leading-7 text-stone-400 sm:text-base">
                Move between guided check-ins, conversational AI companions and a personal history of saved reflections — all within one connected experience.
              </p>
              <button onClick={onStart} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-orange-300 transition-colors hover:text-orange-200">
                Explore MindMatrix.ai <ArrowUpRight size={16} />
              </button>
            </Reveal>

            <Reveal delay={120}>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#201812] via-[#171311] to-[#12100f] p-5 shadow-2xl sm:p-8">
                <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
                <div className="relative grid gap-4 sm:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white">A moment for you</span>
                      <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[9px] text-orange-300">Check-in</span>
                    </div>
                    <p className="mt-8 text-sm leading-6 text-stone-400">How are you feeling today?</p>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        ['😊', 'Good'],
                        ['😐', 'Okay'],
                        ['😟', 'Low'],
                      ].map((item) => (
                        <div key={item[1]} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-2 py-3 text-center">
                          <span className="block text-xl">{item[0]}</span>
                          <span className="mt-1 block text-[10px] text-stone-400">{item[1]}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-[10px] text-stone-600">Write a little about your day…</p>
                      <div className="mt-4 flex justify-end">
                        <span className="rounded-lg bg-orange-500 px-3 py-1.5 text-[9px] font-bold text-white">Continue</span>
                      </div>
                    </div>
                    <p className="mt-3 text-center text-[8px] tracking-wide text-stone-700">ILLUSTRATIVE PRODUCT PREVIEW</p>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/15 text-violet-300"><Waves size={16} /></span>
                        <div>
                          <p className="text-xs font-semibold text-white">Voice check-in</p>
                          <p className="text-[9px] text-stone-600">Speak naturally</p>
                        </div>
                      </div>
                      <div className="mt-6 flex h-10 items-center justify-center gap-1">
                        {[12, 22, 15, 30, 18, 34, 16, 27, 11, 22, 31, 15, 24, 12, 19, 29, 14].map((height, index) => (
                          <span key={index} className="w-1 rounded-full bg-gradient-to-t from-orange-500/40 to-orange-300" style={{ height: height + 'px' }} />
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 rounded-2xl border border-white/10 bg-black/25 p-5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white">Your reflections</span>
                        <Activity size={15} className="text-orange-300" />
                      </div>
                      <div className="mt-5 flex items-end gap-2">
                        {[30, 45, 36, 58, 43, 68, 52].map((height, index) => (
                          <div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-orange-600/40 to-orange-300/80" style={{ height: height + 'px' }} />
                        ))}
                      </div>
                      <p className="mt-3 text-[9px] leading-4 text-stone-600">A visual history of saved check-ins. Your own entries populate this view.</p>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="features" className="scroll-mt-24 border-y border-white/[0.06] bg-white/[0.018] px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Thoughtfully designed features</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Tools for a more mindful everyday.</h2>
              <p className="mt-5 text-sm leading-7 text-stone-400 sm:text-base">
                A connected set of AI-powered experiences to help you reflect, communicate and explore helpful next steps.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                const accentClasses: Record<string, string> = {
                  orange: 'bg-orange-500/10 text-orange-300 ring-orange-400/15',
                  violet: 'bg-violet-500/10 text-violet-300 ring-violet-400/15',
                  teal: 'bg-teal-500/10 text-teal-300 ring-teal-400/15',
                  amber: 'bg-amber-500/10 text-amber-300 ring-amber-400/15',
                  rose: 'bg-rose-500/10 text-rose-300 ring-rose-400/15',
                  blue: 'bg-sky-500/10 text-sky-300 ring-sky-400/15',
                };
                return (
                  <Reveal key={feature.number} delay={index * 55}>
                    <article className="group h-full rounded-[1.6rem] border border-white/[0.08] bg-[#151210]/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-orange-400/25 hover:bg-[#1a1512] sm:p-7">
                      <div className="mb-8 flex items-center justify-between">
                        <span className={'flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ' + accentClasses[feature.accent]}>
                          <Icon size={20} />
                        </span>
                        <span className="text-[10px] font-semibold tracking-[0.16em] text-stone-700">{feature.number}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-6 text-stone-500">{feature.description}</p>
                      <div className="mt-6 h-px w-10 bg-orange-500/50 transition-all duration-300 group-hover:w-16" />
                    </article>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr]">
              <Reveal>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">A simple flow</p>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">Small moments.<span className="block text-stone-500">More room to reflect.</span></h2>
                <p className="mt-6 max-w-md text-sm leading-7 text-stone-400 sm:text-base">
                  Start with what you are comfortable sharing. MindMatrix.ai turns your check-in into an opportunity for reflection and a practical next step.
                </p>
              </Reveal>

              <div className="grid gap-3 sm:grid-cols-2">
                {STEPS.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <Reveal key={step.number} delay={index * 70}>
                      <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 transition-colors hover:border-orange-400/20 hover:bg-white/[0.04]">
                        <div className="mb-7 flex items-center justify-between">
                          <span className="text-xs font-bold tracking-[0.16em] text-orange-400">{step.number}</span>
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-300"><Icon size={17} /></span>
                        </div>
                        <h3 className="text-base font-semibold text-white">{step.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-stone-500">{step.description}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="personas" className="scroll-mt-24 border-y border-white/[0.06] bg-[#100d0b] px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-7xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Meet your companions</p>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">Different perspectives. One place.</h2>
              <p className="mt-5 text-sm leading-7 text-stone-400 sm:text-base">
                Explore the support personas currently available in MindMatrix.ai, each designed with a distinct conversational role.
              </p>
            </Reveal>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PERSONAS.map((persona, index) => {
                const tintClasses: Record<string, string> = {
                  orange: 'bg-orange-500/15 text-orange-300 ring-orange-400/15',
                  teal: 'bg-teal-500/15 text-teal-300 ring-teal-400/15',
                  rose: 'bg-rose-500/15 text-rose-300 ring-rose-400/15',
                  blue: 'bg-sky-500/15 text-sky-300 ring-sky-400/15',
                  amber: 'bg-amber-500/15 text-amber-300 ring-amber-400/15',
                  violet: 'bg-violet-500/15 text-violet-300 ring-violet-400/15',
                  green: 'bg-emerald-500/15 text-emerald-300 ring-emerald-400/15',
                };
                return (
                  <Reveal key={persona.name} delay={index * 45}>
                    <article className="group h-full rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.045]">
                      <div className="flex items-start justify-between gap-3">
                        <span className={'flex h-12 w-12 items-center justify-center rounded-2xl text-xs font-bold ring-1 ' + tintClasses[persona.tint]}>{persona.initials}</span>
                        <span className="rounded-full border border-white/[0.08] px-2.5 py-1 text-[9px] text-stone-500">{persona.category}</span>
                      </div>
                      <h3 className="mt-5 text-base font-semibold text-white">{persona.name}</h3>
                      <p className="mt-1 text-xs font-semibold text-orange-300">{persona.role}</p>
                      <p className="mt-3 text-xs leading-5 text-stone-500">{persona.description}</p>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            <Reveal delay={120}>
              <div className="mt-9 text-center">
                <button onClick={onStart} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-6 py-3 text-xs font-bold text-stone-200 transition-all hover:border-orange-400/40 hover:bg-orange-500/5 hover:text-orange-200">
                  Explore AI companions <ArrowUpRight size={14} />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="responsible-ai" className="scroll-mt-24 px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-5xl">
            <Reveal>
              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1d1713] via-[#171311] to-[#12100f] p-7 sm:p-11">
                <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-orange-500/[0.08] blur-3xl" />
                <div className="relative grid gap-9 md:grid-cols-[1fr_auto] md:items-start">
                  <div>
                    <span className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-300"><ShieldCheck size={21} /></span>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Built with responsibility in mind</p>
                    <h2 className="max-w-xl text-2xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">Technology with empathy. AI with responsibility.</h2>
                    <p className="mt-5 max-w-2xl text-sm leading-7 text-stone-400">
                      MindMatrix.ai is designed as a supportive space for reflection. AI-generated responses can be incomplete or incorrect, and mood or stress estimates are not clinical assessments.
                    </p>
                  </div>
                  <div className="flex h-14 w-14 items-center justify-center rounded-full border border-orange-400/20 bg-orange-500/[0.07] text-orange-300">
                    <Heart size={24} />
                  </div>
                </div>

                <div className="relative mt-8 grid gap-3 border-t border-white/[0.08] pt-7 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Check size={15} className="mt-0.5 shrink-0 text-orange-300" />
                    <p className="text-xs leading-5 text-stone-400">Saved check-in and chat history is stored in browser LocalStorage in the current implementation.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check size={15} className="mt-0.5 shrink-0 text-orange-300" />
                    <p className="text-xs leading-5 text-stone-400">Location-based resource discovery uses device location only when browser permission is granted.</p>
                  </div>
                </div>

                <p className="relative mt-7 rounded-xl border border-orange-300/15 bg-orange-400/[0.05] p-4 text-xs leading-6 text-stone-300">
                  MindMatrix.ai is not a medical diagnostic tool and does not replace qualified mental-health professionals. If you are in crisis or may be in immediate danger, contact local emergency services or a trusted professional.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="px-5 pb-24 sm:px-8 sm:pb-32">
          <Reveal>
            <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-orange-300/15 bg-[#1a120e] px-6 py-16 text-center sm:px-12 sm:py-20">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.16),transparent_58%)]" />
              <div className="relative mx-auto max-w-2xl">
                <span className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20"><Moon size={21} /></span>
                <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-orange-300">Begin with one conversation</p>
                <h2 className="text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">Make a little space for yourself.</h2>
                <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-stone-400 sm:text-base">
                  Check in, explore a new perspective and take your next step at your own pace.
                </p>
                <button onClick={onStart} className="group mt-9 inline-flex items-center gap-3 rounded-full bg-orange-500 px-7 py-4 text-sm font-bold text-white shadow-xl shadow-orange-500/20 transition-all hover:-translate-y-1 hover:bg-orange-400">
                  Start chatting <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" />
                </button>
                <p className="mt-5 text-[10px] text-stone-600">A supportive AI experience. Not a substitute for professional care.</p>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.07] bg-[#090807] px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <a href="#home" aria-label="MindMatrix.ai home"><Logo /></a>
            <p className="mt-3 max-w-sm text-xs leading-6 text-stone-600">An AI-powered companion for emotional reflection, conversations and everyday well-being.</p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-stone-500">
            <a href="#features" className="transition-colors hover:text-white">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-white">How it works</a>
            <a href="#personas" className="transition-colors hover:text-white">AI personas</a>
            <a href="#responsible-ai" className="transition-colors hover:text-white">Responsible AI</a>
            <a href="https://github.com/ishant-rathore/MindMatrix.ai" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-white">GitHub <ArrowUpRight size={12} /></a>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-2 border-t border-white/[0.06] pt-6 text-[10px] text-stone-700 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} MindMatrix.ai. All rights reserved.</span>
          <span>AI-generated information may be inaccurate. Not for diagnosis or emergency support.</span>
        </div>
      </footer>
    </div>
  );
};
