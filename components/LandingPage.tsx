
import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BrainCircuit, 
  ShieldCheck, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  MessageSquare,
  GraduationCap,
  Briefcase,
  Coffee,
  Quote
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

// --- DATA CONSTANTS ---

const PERSONAS_SLIDES = [
  {
    id: 'ananya',
    name: "Ananya",
    role: "Empathetic Friend",
    desc: "A warm, non-judgmental friend who listens to your worries and validates your feelings.",
    quote: "I'm here to listen. Tell me what's on your mind.",
    avatar: "https://randomuser.me/api/portraits/women/33.jpg",
    color: "bg-orange-500",
    gradient: "from-orange-600/30 to-stone-900"
  },
  {
    id: 'aarav',
    name: "Aarav",
    role: "Goal Motivator",
    desc: "High-energy coach to help you crush study goals and beat procrastination.",
    quote: "Obstacles are just opportunities in disguise. Let's go!",
    avatar: "https://randomuser.me/api/portraits/men/22.jpg",
    color: "bg-red-500",
    gradient: "from-red-600/30 to-stone-900"
  },
  {
    id: 'dadaji',
    name: "Dadaji",
    role: "Wise Grandfather",
    desc: "Ancient wisdom and patience to soothe anxiety and provide long-term perspective.",
    quote: "Patience, my child. The storm will pass.",
    avatar: "https://randomuser.me/api/portraits/men/90.jpg",
    color: "bg-amber-500",
    gradient: "from-amber-600/30 to-stone-900"
  },
  {
    id: 'dr_anjali',
    name: "Dr. Anjali",
    role: "Health Guide",
    desc: "Professional guidance on physical well-being, hygiene, and healthy habits.",
    quote: "Health is your true wealth. Let's take care of it.",
    avatar: "https://randomuser.me/api/portraits/women/52.jpg",
    color: "bg-emerald-500", // Green instead of blue
    gradient: "from-emerald-600/30 to-stone-900"
  }
];

const FEATURES = [
  {
    icon: <BrainCircuit size={24} />,
    title: "AI Mood Analysis",
    desc: "Advanced sentiment detection understands your emotional state from text or voice inputs instantly.",
    color: "text-orange-400",
    bg: "bg-orange-900/30"
  },
  {
    icon: <Users size={24} />,
    title: "Diverse Personas",
    desc: "Choose from over 15 unique AI companions, from supportive friends to strict productivity coaches.",
    color: "text-amber-400",
    bg: "bg-amber-900/30"
  },
  {
    icon: <ShieldCheck size={24} />,
    title: "Private & Secure",
    desc: "Your conversations are processed with strict privacy standards. You are safe here.",
    color: "text-rose-400",
    bg: "bg-rose-900/30"
  }
];

const USE_CASES = [
  {
    title: "Exam Stress",
    icon: <GraduationCap size={24} className="text-orange-400" />,
    desc: "Overwhelmed by syllabus? Talk to 'Prof. Rao' to break it down into manageable chunks.",
    gradient: "from-orange-900/30 to-stone-900"
  },
  {
    title: "Work Burnout",
    icon: <Briefcase size={24} className="text-amber-400" />,
    desc: "Feeling drained? 'Mr. Calm' provides instant relaxation techniques and perspective.",
    gradient: "from-amber-900/30 to-stone-900"
  },
  {
    title: "Loneliness",
    icon: <Coffee size={24} className="text-rose-400" />,
    desc: "Need a friend? 'Ananya' is always there to chat about your day, big or small.",
    gradient: "from-rose-900/30 to-stone-900"
  }
];

const TESTIMONIALS = [
  {
    name: "Priya S.",
    role: "Student",
    text: "I was having a panic attack before finals. The 'Dadaji' persona calmed me down in minutes. It felt so real.",
    avatar: "https://randomuser.me/api/portraits/women/44.jpg"
  },
  {
    name: "Rahul K.",
    role: "Software Engineer",
    text: "The career mentor 'Vikrant' helped me prep for my interviews. It's like having a coach in my pocket.",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
  },
  {
    name: "Sarah M.",
    role: "Artist",
    text: "I love the privacy. I can share things I'm afraid to tell real people. It's a safe space.",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg"
  }
];

// --- HELPER COMPONENT FOR SCROLL ANIMATIONS ---

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({ children, delay = 0, className = "" }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// --- MAIN COMPONENT ---

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  // Auto-play slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PERSONAS_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Scroll listener for navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % PERSONAS_SLIDES.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? PERSONAS_SLIDES.length - 1 : prev - 1));

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200 font-sans selection:bg-orange-500 selection:text-white overflow-x-hidden transition-colors duration-300">
      
      {/* Background Ambience - Magma Theme */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-orange-900/10 rounded-full blur-[120px] animate-pulse-slow"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-red-900/10 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '2s'}}></div>
         <div className="absolute top-[40%] left-[20%] w-[40%] h-[40%] bg-stone-900/50 rounded-full blur-[120px] animate-pulse-slow" style={{animationDelay: '4s'}}></div>
      </div>

      {/* Navbar */}
      <nav className={`w-full fixed top-0 z-50 transition-all duration-500 ${scrolled ? 'bg-stone-950/80 backdrop-blur-md border-b border-stone-800 py-3 shadow-sm' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
            <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg shadow-orange-500/20">
               <BrainCircuit size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-100 group-hover:text-orange-500 transition-colors font-heading">
              MindMatrix.ai
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-stone-400">
            <a href="#features" className="hover:text-orange-500 transition-colors cursor-pointer">Features</a>
            <a href="#use-cases" className="hover:text-orange-500 transition-colors cursor-pointer">Use Cases</a>
            <a href="#personas" className="hover:text-orange-500 transition-colors cursor-pointer">Personas</a>
            <div className="flex items-center gap-3 ml-4">
              <button onClick={onStart} className="px-6 py-2.5 rounded-full border-2 border-stone-700 hover:border-orange-500 hover:text-orange-400 transition-all text-sm font-bold bg-stone-900 text-stone-300">
                Login
              </button>
              <button 
                onClick={onStart} 
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-lg hover:shadow-orange-500/20 hover:-translate-y-0.5 active:scale-95 text-sm font-bold"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-40 pb-32 px-6 flex flex-col items-center text-center min-h-screen justify-center">
        <div className="w-full max-w-4xl mx-auto">
          
          <FadeIn delay={0}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 border border-stone-700 text-xs font-bold text-orange-400 mb-8 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse"></span>
              Powered by Gemini 2.5 Flash
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1] font-heading">
              Your warm AI companion for <br />
              <span className="bg-gradient-to-r from-orange-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Life, Study & Balance
              </span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={400}>
            <p className="text-stone-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
              An intelligent ecosystem of personas designed to support your mental well-being, 
              boost your productivity, and provide wisdom when you need it most.
            </p>
          </FadeIn>

          <FadeIn delay={600}>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2 group"
              >
                Start Chatting <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                className="px-8 py-4 bg-stone-900 border-2 border-stone-700 hover:border-stone-600 text-stone-300 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-sm"
              >
                Learn More
              </button>
            </div>
          </FadeIn>

          {/* Glass Stats Bar */}
          <FadeIn delay={800} className="mt-20">
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto">
               {[
                 { label: "Active Personas", value: "15+" },
                 { label: "Response Time", value: "< 1s" },
                 { label: "Privacy", value: "100%" }
               ].map((stat, i) => (
                 <div key={i} className="p-6 rounded-3xl bg-stone-800/60 border border-stone-700 backdrop-blur-md shadow-soft hover:shadow-soft-lg transition-all hover:-translate-y-1">
                   <div className="text-3xl font-extrabold text-white mb-1 font-heading">{stat.value}</div>
                   <div className="text-xs text-stone-400 uppercase tracking-wider font-bold">{stat.label}</div>
                 </div>
               ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
           <FadeIn>
             <div className="text-center mb-20">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">Why MindMatrix?</h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg">More than just a chatbot. A complete emotional support system built for real life.</p>
             </div>
           </FadeIn>
           
           <div className="grid md:grid-cols-3 gap-8">
             {FEATURES.map((feat, i) => (
               <FadeIn key={i} delay={i * 200}>
                 <div className="group p-8 rounded-[2.5rem] bg-stone-900 border border-stone-800 shadow-soft hover:shadow-xl transition-all duration-500 h-full hover:-translate-y-2">
                    <div className={`w-16 h-16 rounded-3xl ${feat.bg} ${feat.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 rotate-3 group-hover:rotate-6`}>
                      {feat.icon}
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 font-heading">{feat.title}</h3>
                    <p className="text-stone-400 leading-relaxed text-lg">{feat.desc}</p>
                 </div>
               </FadeIn>
             ))}
           </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section id="use-cases" className="py-32 relative z-10 bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
             <div className="md:w-1/3">
                <FadeIn>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight font-heading">
                    Real support for <br />
                    <span className="text-orange-400 underline decoration-4 decoration-orange-900 underline-offset-4">real problems.</span>
                  </h2>
                  <p className="text-stone-400 text-lg leading-relaxed mb-8">
                    Life gets complicated. Whether it's academic pressure, career choices, or just feeling low, we have a specialist persona ready to help.
                  </p>
                  <button onClick={onStart} className="text-stone-200 font-bold flex items-center gap-2 hover:gap-4 transition-all group">
                    Explore all scenarios <ArrowRight className="text-orange-400" />
                  </button>
                </FadeIn>
             </div>

             <div className="md:w-2/3 grid gap-6">
               {USE_CASES.map((useCase, i) => (
                 <FadeIn key={i} delay={i * 150}>
                    <div className={`flex items-center gap-6 p-6 rounded-3xl bg-stone-900 shadow-sm border border-stone-800 hover:shadow-md transition-all group cursor-default hover:scale-[1.02]`}>
                       <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${useCase.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                          {useCase.icon}
                       </div>
                       <div>
                          <h4 className="text-xl font-bold text-white mb-1 font-heading">{useCase.title}</h4>
                          <p className="text-stone-400 text-sm">{useCase.desc}</p>
                       </div>
                    </div>
                 </FadeIn>
               ))}
             </div>
          </div>
        </div>
      </section>

      {/* Persona Slider Section */}
      <section id="personas" className="py-24 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
           <FadeIn>
             <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">Meet Your Companions</h2>
                <p className="text-stone-400 max-w-2xl mx-auto text-lg">A diverse team of AI personalities ready to support you 24/7.</p>
             </div>
           </FadeIn>

           {/* Carousel Container */}
           <FadeIn delay={200}>
             <div className="relative w-full max-w-5xl mx-auto h-[500px] md:h-[450px]">
                {PERSONAS_SLIDES.map((persona, index) => {
                   // Calculate position for visual stacking
                   let position = 'opacity-0 translate-x-full scale-90 z-0';
                   if (index === currentSlide) position = 'opacity-100 translate-x-0 scale-100 z-20';
                   if (index === (currentSlide - 1 + PERSONAS_SLIDES.length) % PERSONAS_SLIDES.length) position = 'opacity-40 -translate-x-16 scale-90 z-10 blur-[2px]';
                   if (index === (currentSlide + 1) % PERSONAS_SLIDES.length) position = 'opacity-40 translate-x-16 scale-90 z-10 blur-[2px]';

                   return (
                     <div 
                        key={persona.id}
                        className={`absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center ${position}`}
                     >
                        {/* Glass Card Slide */}
                        <div className={`w-full max-w-4xl bg-gradient-to-br ${persona.gradient} border border-stone-700 p-8 md:p-12 rounded-[3rem] shadow-xl flex flex-col md:flex-row items-center gap-8 md:gap-16 bg-stone-900/90`}>
                           
                           {/* Avatar Side */}
                           <div className="relative flex-shrink-0 group cursor-pointer">
                              <div className={`absolute inset-0 ${persona.color} blur-[50px] opacity-20 rounded-full animate-pulse-slow`}></div>
                              <img 
                                src={persona.avatar} 
                                alt={persona.name} 
                                className="relative w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-8 border-stone-800 shadow-xl transition-transform duration-500 group-hover:scale-105 transform rotate-3"
                              />
                              <div className={`absolute bottom-6 right-6 ${persona.color} p-4 rounded-full text-white border-4 border-stone-800 shadow-lg`}>
                                 <MessageSquare size={24} fill="currentColor" />
                              </div>
                           </div>

                           {/* Content Side */}
                           <div className="text-center md:text-left flex-1">
                              <h3 className="text-4xl font-bold text-white mb-2 font-heading">{persona.name}</h3>
                              <div className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-black/20 mb-8 text-stone-300 border border-stone-700 shadow-sm`}>
                                 {persona.role}
                              </div>
                              
                              <p className="text-xl md:text-2xl text-stone-200 font-medium italic mb-8 leading-relaxed">"{persona.quote}"</p>
                              <p className="text-base text-stone-400 leading-relaxed border-t border-stone-700/50 pt-8 font-medium">
                                 {persona.desc}
                              </p>
                           </div>

                        </div>
                     </div>
                   );
                })}
             </div>
           </FadeIn>
           
           {/* Controls */}
           <FadeIn delay={400}>
             <div className="flex justify-center items-center gap-8 mt-12 z-30 relative">
                <button 
                  onClick={prevSlide}
                  className="p-4 rounded-full bg-stone-900 border border-stone-700 hover:border-orange-500 hover:text-orange-500 transition-all text-stone-500 hover:scale-110 active:scale-95 shadow-sm"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <div className="flex gap-4">
                  {PERSONAS_SLIDES.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-500 ${idx === currentSlide ? 'w-12 bg-orange-500' : 'w-2 bg-stone-700 hover:bg-stone-600'}`}
                    />
                  ))}
                </div>

                <button 
                  onClick={nextSlide}
                  className="p-4 rounded-full bg-stone-900 border border-stone-700 hover:border-orange-500 hover:text-orange-500 transition-all text-stone-500 hover:scale-110 active:scale-95 shadow-sm"
                >
                  <ChevronRight size={24} />
                </button>
             </div>
           </FadeIn>

        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-32 relative z-10 bg-stone-900">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-heading">Community Voices</h2>
              <p className="text-stone-400 max-w-2xl mx-auto text-lg">See how MindMatrix is helping people find balance.</p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t, i) => (
              <FadeIn key={i} delay={i * 200}>
                <div className="p-8 rounded-[2.5rem] bg-stone-800 border border-stone-700 relative hover:bg-stone-700/50 transition-colors h-full">
                  <Quote className="absolute top-8 right-8 text-stone-600" size={48} />
                  <div className="flex items-center gap-4 mb-6">
                    <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-stone-600 shadow-sm" />
                    <div>
                      <div className="font-bold text-stone-200 font-heading">{t.name}</div>
                      <div className="text-xs text-orange-400 uppercase tracking-wider font-bold">{t.role}</div>
                    </div>
                  </div>
                  <p className="text-stone-400 leading-relaxed relative z-10 font-medium">"{t.text}"</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6 relative z-10">
        <FadeIn>
          <div className="max-w-5xl mx-auto bg-gradient-to-r from-orange-600 to-rose-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
             {/* Deco glow */}
             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-3xl"></div>
             
             <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10 leading-tight font-heading">Ready to find your <br/><span className="text-orange-200">inner balance?</span></h2>
             <p className="text-orange-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10 font-medium">
               Start chatting with MindMatrix.ai today. It's free, private, and always available when you need it most.
             </p>
             <button 
                onClick={onStart}
                className="px-12 py-5 bg-white text-stone-900 hover:bg-stone-100 rounded-full font-bold text-lg transition-all hover:scale-105 active:scale-95 shadow-xl relative z-10"
              >
                Start Your Journey
              </button>
          </div>
        </FadeIn>
      </section>

      {/* Copyright */}
      <footer className="border-t border-stone-800 py-12 text-center text-stone-500 text-sm relative z-10 bg-stone-900">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <p>&copy; {new Date().getFullYear()} MindMatrix.ai. All rights reserved.</p>
            <div className="flex gap-8 font-medium">
              <a href="#" className="hover:text-orange-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-orange-400 transition-colors">Contact</a>
            </div>
         </div>
      </footer>

    </div>
  );
};
