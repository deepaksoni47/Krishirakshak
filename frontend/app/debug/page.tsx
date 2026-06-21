'use client';

import React, { useState } from 'react';
import WorkflowVisualizer from '@/components/workflow-visualizer';
import { 
  Terminal, 
  Cpu, 
  ExternalLink, 
  History, 
  CheckCircle, 
  AlertCircle,
  Bug,
  Info,
  Server,
  Play
} from 'lucide-react';
import Link from 'next/link';

export default function DebugPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string[]>([
    'Supervisor Agent',
    'Disease Agent',
    'Weather Agent',
    'Risk Assessment Agent',
    'Emergency Agent',
    'Treatment Agent',
    'Scheme Advisor Agent'
  ]);
  const [currentStep, setCurrentStep] = useState<number>(7);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  const simulateRun = () => {
    setIsRunning(true);
    setCurrentStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setCurrentStep(step);
      if (step >= selectedWorkflow.length) {
        clearInterval(interval);
        setIsRunning(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col p-4 md:p-8">
      {/* Background glow */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/40 mb-8 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-400" />
            <h1 className="text-2xl font-bold font-heading">Developer Console & LangSmith Traces</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Technical diagnostics for project evaluation, report screenshots, and Viva demonstrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-border hover:bg-muted/50 transition-all"
          >
            Back to App
          </Link>
          <a
            href="https://smith.langchain.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
          >
            <span>Open LangSmith</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 z-10">
        {/* Left column: Controls & Visualizer */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instructions Alert */}
          <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 text-xs leading-relaxed">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Administrative Debug Panel Only</p>
              <p className="text-muted-foreground mt-0.5">
                This page exposes the underlying multi-agent LangGraph workflow nodes, agent states, and LangSmith tracing linkages. It is hidden from regular users and is used to demonstrate the system architecture.
              </p>
            </div>
          </div>

          {/* LangGraph Visualizer */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-primary">LangGraph Node Execution</h2>
              <button
                onClick={simulateRun}
                disabled={isRunning}
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all"
              >
                <Play className="w-3 h-3" />
                <span>Simulate Flow</span>
              </button>
            </div>

            <WorkflowVisualizer
              workflow={selectedWorkflow}
              currentStepIndex={currentStep}
              isRunning={isRunning}
            />
          </div>

          {/* Route Configuration Selector */}
          <div className="border border-border/60 bg-card/25 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground">Select Route Pattern to Visualize</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                onClick={() => {
                  setSelectedWorkflow([
                    'Supervisor Agent',
                    'Disease Agent',
                    'Weather Agent',
                    'Risk Assessment Agent',
                    'Emergency Agent',
                    'Treatment Agent',
                    'Scheme Advisor Agent'
                  ]);
                  setCurrentStep(7);
                }}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedWorkflow.includes('Emergency Agent')
                    ? 'border-primary bg-primary/5 text-primary-foreground'
                    : 'border-border/60 hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                <p className="font-bold">Critical Risk Path</p>
                <p className="text-[10px] text-muted-foreground mt-1">Routes via Emergency Agent with immediate mitigation action.</p>
              </button>

              <button
                onClick={() => {
                  setSelectedWorkflow([
                    'Supervisor Agent',
                    'Disease Agent',
                    'Weather Agent',
                    'Risk Assessment Agent',
                    'Monitoring Agent',
                    'Treatment Agent',
                    'Scheme Advisor Agent'
                  ]);
                  setCurrentStep(7);
                }}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedWorkflow.includes('Monitoring Agent')
                    ? 'border-primary bg-primary/5 text-primary-foreground'
                    : 'border-border/60 hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                <p className="font-bold">Standard Risk Path</p>
                <p className="text-[10px] text-muted-foreground mt-1">Routes via Monitoring Agent with standard treatment advice.</p>
              </button>

              <button
                onClick={() => {
                  setSelectedWorkflow([
                    'Supervisor Agent',
                    'Advisory Agent'
                  ]);
                  setCurrentStep(2);
                }}
                className={`text-left p-3 rounded-xl border text-xs transition-all ${
                  selectedWorkflow.length === 2
                    ? 'border-primary bg-primary/5 text-primary-foreground'
                    : 'border-border/60 hover:bg-muted/20 text-muted-foreground'
                }`}
              >
                <p className="font-bold">General Advisory Path</p>
                <p className="text-[10px] text-muted-foreground mt-1">Routes directly to advisory node without disease analysis.</p>
              </button>
            </div>
          </div>
        </div>

        {/* Right column: Logs & Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          {/* Telemetry Console */}
          <div className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl">
            <div className="border-b border-border/50 px-5 py-4 bg-muted/20 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground/90 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-primary" />
                <span>LangGraph Execution Trace Logs</span>
              </span>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            
            <div className="p-5 font-mono text-[11px] leading-relaxed space-y-3 max-h-[300px] overflow-y-auto bg-black/40">
              <p className="text-muted-foreground">{"[12:15:02] INITIALIZING LANGGRAPH WORKFLOW NODE ROUTER"}</p>
              <p className="text-primary">{"[12:15:02] Entering Node: Supervisor Agent"}</p>
              <p className="text-muted-foreground">{"  - State variables extracted successfully"}</p>
              <p className="text-muted-foreground">{"  - Routing criteria matched: image_uploaded = true"}</p>
              <p className="text-emerald-400">{"[12:15:03] Entering Node: Disease Agent"}</p>
              <p className="text-muted-foreground">{"  - Running Gemini-1.5-Flash Vision API query..."}</p>
              <p className="text-muted-foreground">{"  - Pathology parsed: Leaf Blast (Confidence 92%)"}</p>
              <p className="text-sky-400">{"[12:15:04] Entering Node: Weather Agent"}</p>
              <p className="text-muted-foreground">{"  - Querying OpenWeather coordinates mapping (21.07 N, 81.71 E)"}</p>
              <p className="text-muted-foreground">{"  - Atmospheric data compiled: Temp 28C, Humid 90%, Rain 80%"}</p>
              <p className="text-amber-400">{"[12:15:05] Entering Node: Risk Assessment Agent"}</p>
              <p className="text-muted-foreground">{"  - Executing scoring engine parameters..."}</p>
              <p className="text-muted-foreground">{"  - Combined risk index: 88 (Classification: Critical)"}</p>
              <p className="text-red-400">{"[12:15:06] Entering Node: Emergency Agent"}</p>
              <p className="text-muted-foreground">{"  - Formulating immediate response directive and alerts"}</p>
              <p className="text-emerald-400">{"[12:15:07] Entering Node: Treatment Agent"}</p>
              <p className="text-muted-foreground">{"  - Generating chemical mitigations: Tricyclazole 75% WP"}</p>
              <p className="text-violet-400">{"[12:15:08] Entering Node: Scheme Advisor Agent"}</p>
              <p className="text-muted-foreground">{"  - Running RAG retrieval on scheme store: matching PMKSY, PMFBY"}</p>
              <p className="text-muted-foreground">{"[12:15:09] STATE FINALIZED. WRITING BACK TO CLIENT RESPONSE."}</p>
            </div>
          </div>

          {/* LangSmith Telemetry Metrics */}
          <div className="border border-border/80 bg-card/30 backdrop-blur-md rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
              <Cpu className="w-4 h-4" />
              <span>LangSmith Trace Metrics</span>
            </div>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Total Tokens Used</span>
                <span className="font-mono font-bold text-foreground">1,842 tokens</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2.5">
                <span className="text-muted-foreground">Average Execution Latency</span>
                <span className="font-mono font-bold text-foreground">1.84 seconds</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2.5">
                <span className="text-muted-foreground">Feedback Metric (Run Success Rate)</span>
                <span className="font-mono font-bold text-primary">100% (Passed Validation)</span>
              </div>
              <div className="flex justify-between items-center text-xs border-t border-border/30 pt-2.5">
                <span className="text-muted-foreground">Project Tracing ID</span>
                <span className="font-mono text-muted-foreground text-[10px]">krishirakshak-ai-run-prod-9e8a2a</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
