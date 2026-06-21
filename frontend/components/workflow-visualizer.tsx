'use client';

import React, { useEffect, useState } from 'react';
import { 
  Bot, 
  ShieldAlert, 
  CloudSun, 
  Activity, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  Sprout,
  HelpCircle,
  CloudLightning,
  AlertTriangle,
  TrendingUp,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowVisualizerProps {
  workflow: string[];
  currentStepIndex: number; // -1: idle, 0..3: executing step, 4: all completed
  isRunning: boolean;
}

interface StepDetails {
  name: string;
  role: string;
  icon: React.ComponentType<any>;
  description: string;
}

const AGENT_DETAILS: Record<string, StepDetails> = {
  'Supervisor Agent': {
    name: 'Supervisor Agent',
    role: 'Orchestrator & Router',
    icon: Bot,
    description: 'Deconstructs user queries and coordinates specialist agricultural sub-agents.',
  },
  'Disease Agent': {
    name: 'Disease Agent',
    role: 'Plant Pathologist AI',
    icon: ShieldAlert,
    description: 'Analyzes visual symptoms and query text to detect crop health anomalies.',
  },
  'Advisory Agent': {
    name: 'Advisory Agent',
    role: 'General Farming Advisor',
    icon: Sprout,
    description: 'Provides general agricultural advising, optimal sowing guidelines, and planting windows.',
  },
  'Weather Agent': {
    name: 'Weather Agent',
    role: 'Meteorology Intel',
    icon: CloudSun,
    description: 'Retrieves localized historical, current, and forecasted climate variables.',
  },
  'Risk Agent': {
    name: 'Risk Agent',
    role: 'Agronomic Assessor',
    icon: Activity,
    description: 'Aggregates outputs to calculate risk indices and draft optimal mitigations.',
  },
  'Clarification Agent': {
    name: 'Clarification Agent',
    role: 'Ambiguity Resolver',
    icon: HelpCircle,
    description: 'Intercepts the workflow on low-confidence assessments to request clearer or supplementary images.',
  },
  'Rain Alert Agent': {
    name: 'Rain Alert Agent',
    role: 'Climate Warning System',
    icon: CloudLightning,
    description: 'Generates specialized weather warnings and advice to protect chemical application and scheduling.',
  },
  'Risk Assessment Agent': {
    name: 'Risk Assessment Agent',
    role: 'Crop Risk Modeler',
    icon: TrendingUp,
    description: 'Aggregates disease diagnostics and weather observations to calculate overall crop health threat indices.',
  },
  'Emergency Agent': {
    name: 'Emergency Agent',
    role: 'Crisis Response AI',
    icon: AlertTriangle,
    description: 'Generates urgent protective warnings and priority actions for high-risk crop conditions.',
  },
  'Monitoring Agent': {
    name: 'Monitoring Agent',
    role: 'Maintenance AI',
    icon: Sprout,
    description: 'Formulates continuous observation schedules and standard agronomic crop safeguards.',
  },
  'Treatment Agent': {
    name: 'Treatment Agent',
    role: 'Intervention Planner',
    icon: TrendingUp,
    description: 'Generates weather-aware treatment plans, cost estimates, and prioritised action timelines.',
  },
  'Scheme Advisor Agent': {
    name: 'Scheme Advisor Agent',
    role: 'RAG Scheme Advisor',
    icon: Building2,
    description: 'Retrieves relevant government schemes via RAG and generates personalised subsidy recommendations.',
  },
};

export default function WorkflowVisualizer({ 
  workflow = ['Supervisor Agent', 'Disease Agent', 'Weather Agent', 'Risk Agent'], 
  currentStepIndex,
  isRunning 
}: WorkflowVisualizerProps) {
  return (
    <div className="w-full py-6 px-4 bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 shadow-lg">
      <div className="flex flex-col gap-1 mb-6">
        <h3 className="text-lg font-semibold tracking-tight font-heading text-primary">
          Agent Execution Pipeline
        </h3>
        <p className="text-xs text-muted-foreground">
          Visualizing the climate-adaptive multi-agent reasoning chain.
        </p>
      </div>

      {/* Steps List */}
      <div className={cn(
        "grid grid-cols-1 gap-6 relative",
        workflow.length === 2 ? "md:grid-cols-2 max-w-2xl mx-auto" : 
        workflow.length === 3 ? "md:grid-cols-3 max-w-4xl mx-auto" : 
        workflow.length === 5 ? "md:grid-cols-5" : 
        workflow.length === 6 ? "md:grid-cols-6" : "md:grid-cols-4"
      )}>
        {workflow.map((agentName, index) => {
          const details = AGENT_DETAILS[agentName] || {
            name: agentName,
            role: 'Sub-agent',
            icon: Bot,
            description: 'Specialist agent working on agricultural metrics.',
          };
          const Icon = details.icon;

          const isCompleted = currentStepIndex > index;
          const isActive = currentStepIndex === index && isRunning;
          const isPending = currentStepIndex < index;

          return (
            <div key={agentName} className="relative flex flex-col items-center">
              {/* Connector line for large screens */}
              {index < workflow.length - 1 && (
                <div 
                  className={cn(
                    "hidden md:block absolute top-7 left-[calc(50%+24px)] w-[calc(100%-48px)] h-[2px] transition-all duration-500",
                    isCompleted ? "bg-primary" : "bg-border/60"
                  )}
                >
                  {/* Glowing moving dot along connector line if next step is active */}
                  {isActive && (
                    <div className="absolute top-[-3px] left-0 w-2 h-2 rounded-full bg-primary animate-[ping_1.5s_infinite] shadow-[0_0_8px_var(--color-primary)]" />
                  )}
                </div>
              )}

              {/* Node Circle */}
              <div 
                className={cn(
                  "relative z-10 w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  isActive && "bg-primary/10 border-primary shadow-[0_0_15px_rgba(74,222,128,0.2)] animate-pulse",
                  isCompleted && "bg-primary border-primary text-primary-foreground",
                  isPending && "bg-muted/30 border-border/60 text-muted-foreground"
                )}
              >
                {isActive ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}

                {/* Sub-dot indicator */}
                {isActive && (
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary"></span>
                  </span>
                )}
              </div>

              {/* Text content */}
              <div className="text-center mt-3 flex flex-col items-center max-w-[200px]">
                <h4 
                  className={cn(
                    "text-sm font-semibold tracking-tight transition-colors duration-250",
                    isActive && "text-primary",
                    isCompleted && "text-foreground",
                    isPending && "text-muted-foreground"
                  )}
                >
                  {details.name}
                </h4>
                <span className="text-[10px] text-muted-foreground/80 font-medium">
                  {details.role}
                </span>
                <p className="text-[11px] text-muted-foreground/60 mt-1 line-clamp-2 md:line-clamp-3">
                  {details.description}
                </p>
              </div>

              {/* Arrow indicator for mobile layouts */}
              {index < workflow.length - 1 && (
                <div className="md:hidden my-3 text-border/60">
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
