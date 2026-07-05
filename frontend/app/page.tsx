'use client';

import React, { useState } from 'react';
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
  Globe,
  Menu,
  X
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background Snippet from bg.ibelick.com (Grid + Masked Glow) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* The Grid lines adapt to light mode (#f0f0f0) vs dark mode (#4f4f4f2e) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:6rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        
        {/* Soft radial glow centered at the top */}
        <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_500px_at_50%_0px,rgba(16,185,129,0.08),transparent)] dark:bg-[radial-gradient(circle_500px_at_50%_0px,rgba(16,185,129,0.15),transparent)]" />
      </div>

      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 dark:border-white/5 bg-white/40 dark:bg-white/[0.02] backdrop-blur-xl shadow-sm">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-white/10 dark:bg-white/5 border border-white/15 dark:border-white/10 flex items-center justify-center overflow-hidden shadow-md">
              <img src="/logo.png" alt="KrishiRakshak AI Logo" className="w-full h-full object-cover" />
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

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link 
              href="#features-section" 
              className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Helps
            </Link>
            <Link 
              href="#demo-section" 
              className="inline-flex items-center justify-center h-9 px-4 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/95 shadow-md shadow-primary/5 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5 transition-all duration-200"
            >
              Check My Crop
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl animate-fade-in absolute w-full left-0 py-4 px-6 flex flex-col gap-4 shadow-xl">
            <Link 
              href="#features-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/20"
            >
              How It Helps
            </Link>
            <Link 
              href="#demo-section" 
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-2"
            >
              Check My Crop
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-24 max-w-7xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
          {/* Hero Logo Element */}
          <div className="relative w-20 h-20 mb-6 rounded-2xl overflow-hidden shadow-2xl border border-white/25 dark:border-white/10 p-1 bg-white/10 dark:bg-white/[0.03] backdrop-blur-md animate-fade-in">
            <div className="w-full h-full rounded-xl overflow-hidden bg-background flex items-center justify-center">
              <img src="/logo.png" alt="KrishiRakshak AI Hero Logo" className="object-cover w-full h-full" />
            </div>
          </div>

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
        <section className="relative py-12">
          {/* Glassmorphic backdrop glow spots directly behind form & report */}
          <div className="absolute top-1/4 left-[15%] w-80 h-80 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 blur-[100px] pointer-events-none z-0" />
          <div className="absolute bottom-1/4 right-[15%] w-96 h-96 rounded-full bg-teal-500/10 dark:bg-teal-500/10 blur-[120px] pointer-events-none z-0" />
          
          <div className="relative z-10">
            <DemoSection />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiRakshak AI Logo" className="w-5.5 h-5.5 object-cover rounded" />
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

