import React from 'react';
import DemoSection from '@/components/demo';
import { 
  ShieldAlert, 
  CloudSun, 
  Activity, 
  HandHelping, 
  Sprout, 
  ArrowRight, 
  Cpu, 
  Network,
  Globe
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-emerald-950/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/75 backdrop-blur-md">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)]">
              <Sprout className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-heading font-extrabold text-base tracking-tight text-foreground">
                KrishiRakshak <span className="text-primary font-bold">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[9px] font-semibold text-muted-foreground uppercase tracking-widest bg-muted/65 px-1.5 py-0.5 rounded ml-2 border border-border/50">
                Crop Assistant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="#features-section" 
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Helps
            </Link>
            <Link 
              href="#demo-section" 
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              Check My Crop
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          {/* SDG Aligned Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-6 tracking-wide animate-fade-in">
            <Globe className="w-3.5 h-3.5" />
            <span>UN SDG 2 (Zero Hunger) Aligned</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight font-heading leading-tight max-w-4xl text-foreground">
            KrishiRakshak <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(74,222,128,0.15)]">AI</span>
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-muted-foreground max-w-3xl mt-4 leading-normal">
            Smart Farming Guidance for Healthier Crops and Better Decisions
          </h2>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground/80 max-w-3xl mt-6 leading-relaxed">
            Upload a crop photo and receive disease analysis, weather insights, treatment recommendations, and government support information.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 mt-10 justify-center w-full max-w-md">
            <a 
              href="#demo-section" 
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Check My Crop</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 max-w-2xl w-full mt-16 md:mt-24 border-t border-border/40 pt-8 text-center">
            <div>
              <p className="text-xl md:text-2xl font-extrabold text-foreground font-heading">SDG 2</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 uppercase font-medium tracking-wide">Target Objective</p>
            </div>
            <div className="border-x border-border/40">
              <p className="text-xl md:text-2xl font-extrabold text-primary font-heading flex items-center justify-center gap-1">
                <Network className="w-4 h-4" />
                <span>Unified</span>
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 uppercase font-medium tracking-wide">Analysis Engine</p>
            </div>
            <div>
              <p className="text-xl md:text-2xl font-extrabold text-foreground font-heading flex items-center justify-center gap-1">
                <Cpu className="w-4 h-4" />
                <span>Instant</span>
              </p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5 uppercase font-medium tracking-wide">Response Time</p>
            </div>
          </div>
        </section>

        {/* 2. Features Section */}
        <section id="features-section" className="py-16 md:py-24 border-y border-border/30 bg-muted/10 relative">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="flex flex-col items-center text-center mb-16">
              <span className="px-3 py-1 text-[10px] font-semibold text-primary bg-primary/10 rounded-full border border-primary/20 mb-3 tracking-widest uppercase">
                Advisory Center
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading text-foreground">
                Helping You Protect and Nourish Your Crops
              </h2>
              <p className="text-muted-foreground max-w-2xl text-sm md:text-base mt-2">
                We combine weather updates, crop image checks, and regional programs to give you clear, actionable advice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="group border border-border/60 hover:border-primary/40 bg-card/20 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground font-heading mb-2">Crop Health Analysis</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Scans photos of your leaves to spot plant diseases early and recommends safe organic and chemical treatment methods.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group border border-border/60 hover:border-primary/40 bg-card/20 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <CloudSun className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground font-heading mb-2">Weather Outlook</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Monitors rainfall probability, temperature, and local humidity to help you decide the best times to water or apply treatments.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group border border-border/60 hover:border-primary/40 bg-card/20 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <Activity className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground font-heading mb-2">Crop Risk Analysis</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Checks combined threat levels from weather patterns and spreading pests to warn you of upcoming risks before they happen.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group border border-border/60 hover:border-primary/40 bg-card/20 backdrop-blur-sm rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-primary border border-primary/20 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
                  <HandHelping className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground font-heading mb-2">Government Support</h3>
                <p className="text-xs text-muted-foreground/80 leading-relaxed">
                  Finds government schemes, insurance plans, and subsidies that you can apply for to cover treatment costs and secure loans.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Demo Section */}
        <section className="relative">
          <DemoSection />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-foreground">
              KrishiRakshak <span className="text-primary font-bold">AI</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} KrishiRakshak AI. Built in support of United Nations SDG 2 (Zero Hunger).
          </p>
          <div className="text-[10px] text-muted-foreground">
            Trusted Farming Assistant
          </div>
        </div>
      </footer>
    </div>
  );
}

