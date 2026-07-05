'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle, 
  CardFooter 
} from '@/components/ui/card';
import { 
  Upload, 
  Sprout, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CornerDownRight, 
  Check, 
  ArrowRight,
  TrendingUp,
  CloudLightning,
  AlertTriangle,
  Lightbulb,
  Loader2,
  MapPin,
  CloudSun,
  Thermometer,
  Droplets,
  CloudRain,
  Activity,
  Stethoscope,
  Clock,
  IndianRupee,
  CalendarDays,
  Zap,
  ChevronRight,
  Building2,
  X,
  ScrollText,
  BookOpen,
  BadgeInfo,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import WorkflowVisualizer from './workflow-visualizer';
import { AnalyzeResponse, SchemeRecommendation } from '@/types';

export default function DemoSection() {
  // Form states
  const [cropName, setCropName] = useState('');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('Dhamtari, Chhattisgarh');
  const [imageFile, setImageFile] = useState<{ name: string; size: string; preview: string; rawFile?: File } | null>(null);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [caseId, setCaseId] = useState('');
  
  // App execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1); // -1: idle, 0..N: executing
  const [backendResponse, setBackendResponse] = useState<AnalyzeResponse | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState('');
  const [copiedCaseId, setCopiedCaseId] = useState(false);
  
  // Scheme modal state
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecommendation | null>(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Quick Demo Presets
  const applyPreset = (presetType: 'new' | 'clarify' | 'followup') => {
    resetForm();
    if (presetType === 'new') {
      setCropName('Rice');
      setQuery('vegetative stage. no, not sprayed. Cairo, Egypt. brown spots on leaves.');
      setLocation('Cairo, Egypt');
      setImageUploaded(true);
      setImageFile({
        name: 'rice_leaf_spots.png',
        size: '1.2 MB',
        preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });
    } else if (presetType === 'clarify') {
      setCropName('Rice');
      setQuery('yellowing leaves. photo is blurry and taken from far away.');
      setLocation('Dhamtari, Chhattisgarh');
      setImageUploaded(true);
      setImageFile({
        name: 'blurry_rice_leaf.jpg',
        size: '2.4 MB',
        preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });
    } else if (presetType === 'followup') {
      setCropName('Rice');
      setQuery('vegetative stage. yes, sprayed recommended fungicide. Cairo, Egypt. symptoms are disappearing.');
      setLocation('Cairo, Egypt');
      setImageUploaded(true);
      setImageFile({
        name: 'rice_leaf_recovery.png',
        size: '1.1 MB',
        preview: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });
      // Set placeholder or instruction to enter Case ID
      setCaseId('case_xxxxxxxx');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setImageFile({
        name: file.name,
        size: `${sizeMB} MB`,
        preview: URL.createObjectURL(file),
        rawFile: file
      });
      setImageUploaded(true);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setImageFile({
        name: file.name,
        size: `${sizeMB} MB`,
        preview: URL.createObjectURL(file),
        rawFile: file
      });
      setImageUploaded(true);
    }
  };

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Submit new run
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || !query.trim()) {
      setError('Please fill in both the crop name and your query.');
      return;
    }

    setLoading(true);
    setError(null);
    setBackendResponse(null);
    setActiveStep(0); 

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const currentReqId = generateUUID();
    setRequestId(currentReqId);

    try {
      const formData = new FormData();
      formData.append('crop_name', cropName);
      formData.append('query', query);
      formData.append('image_uploaded', String(imageUploaded));
      formData.append('location', location);
      formData.append('request_id', currentReqId);
      
      if (caseId.trim() && caseId !== 'case_xxxxxxxx') {
        formData.append('case_id', caseId.trim());
      }
      if (imageUploaded && imageFile?.rawFile) {
        formData.append('image', imageFile.rawFile);
      }

      const res = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned code ${res.status}: ${res.statusText}`);
      }

      const data: AnalyzeResponse = await res.json();
      setBackendResponse(data);

      if (data.status !== 'needs_clarification') {
        setRequestId(null);
      }

      // Step stepping animation
      setActiveStep(0);
      for (let i = 1; i < data.workflow_path.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        setActiveStep(i);
      }
      await new Promise(r => setTimeout(r, 1000));
      setActiveStep(data.workflow_path.length); 
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to backend.');
      setActiveStep(-1);
    } finally {
      setLoading(false);
    }
  };

  // Resume clarification run
  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationAnswer.trim()) return;

    setLoading(true);
    setError(null);
    setActiveStep(0);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      const formData = new FormData();
      formData.append('crop_name', cropName);
      formData.append('query', clarificationAnswer);
      formData.append('image_uploaded', String(imageUploaded));
      formData.append('location', location);
      
      if (requestId) {
        formData.append('request_id', requestId);
      }
      if (caseId.trim() && caseId !== 'case_xxxxxxxx') {
        formData.append('case_id', caseId.trim());
      } else if (backendResponse?.case_id) {
        formData.append('case_id', backendResponse.case_id);
      }
      
      if (imageUploaded && imageFile?.rawFile) {
        formData.append('image', imageFile.rawFile);
      }

      const res = await fetch(`${apiUrl}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned code ${res.status}: ${res.statusText}`);
      }

      const data: AnalyzeResponse = await res.json();
      setBackendResponse(data);
      setClarificationAnswer('');

      if (data.status !== 'needs_clarification') {
        setRequestId(null);
      }

      setActiveStep(0);
      for (let i = 1; i < data.workflow_path.length; i++) {
        await new Promise(r => setTimeout(r, 800));
        setActiveStep(i);
      }
      await new Promise(r => setTimeout(r, 1000));
      setActiveStep(data.workflow_path.length);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to submit clarification details.');
      setActiveStep(-1);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCropName('');
    setQuery('');
    setLocation('Dhamtari, Chhattisgarh');
    setImageFile(null);
    setImageUploaded(false);
    setCaseId('');
    setBackendResponse(null);
    setActiveStep(-1);
    setError(null);
    setRequestId(null);
    setClarificationAnswer('');
  };

  return (
    <div id="demo-section" className="w-full max-w-7xl mx-auto py-12 px-4 md:px-8">
      <div className="flex flex-col items-center text-center mb-12">
        <span className="px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full border border-primary/20 mb-3 tracking-wide uppercase">
          Check My Crop
        </span>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-heading mb-4 text-foreground">
          Get Instant Farming Advice
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm md:text-base leading-relaxed">
          Provide your crop details and photo to get immediate agricultural advice, weather intelligence, and available government scheme suggestions.
        </p>
      </div>

      <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto">
        {/* Input Form Card */}
        <Card className="w-full border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl rounded-2xl">
          <CardHeader className="border-b border-border/50 pb-5">
            <CardTitle className="font-heading text-lg font-bold flex items-center gap-2">
              <Sprout className="w-5 h-5 text-primary" />
              <span>About Your Crop</span>
            </CardTitle>
            <CardDescription className="text-xs">
              Provide information about your crop to receive personalized recommendations.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5 pt-6">
              
              {/* Presets block */}
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Demo Quick Presets</span>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset('new')}
                    className="text-[10px] h-7 border-border hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all font-semibold"
                  >
                    1. New Case
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset('clarify')}
                    className="text-[10px] h-7 border-border hover:bg-amber-500/5 hover:text-amber-500 hover:border-amber-500/30 transition-all font-semibold"
                  >
                    2. Clarify
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset('followup')}
                    className="text-[10px] h-7 border-border hover:bg-sky-500/5 hover:text-sky-500 hover:border-sky-500/30 transition-all font-semibold"
                  >
                    3. Follow-up
                  </Button>
                </div>
              </div>

              {/* Case ID / Follow-up check */}
              <div className="space-y-1.5 bg-primary/5 rounded-xl p-3.5 border border-primary/10">
                <div className="flex justify-between items-center">
                  <Label htmlFor="case-id" className="text-xs font-bold text-foreground">
                    Follow-up ID / Case ID
                  </Label>
                  <span className="text-[9px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 uppercase tracking-wider">
                    Optional
                  </span>
                </div>
                <Input
                  id="case-id"
                  type="text"
                  placeholder="Paste Case ID here (e.g. case_xxxxxxxx)"
                  value={caseId}
                  onChange={(e) => setCaseId(e.target.value)}
                  disabled={loading}
                  className="bg-background/60 border-border/80 text-xs focus-visible:ring-primary focus-visible:border-primary/80"
                />
                <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                  Enter an existing Case ID to assess crop progression, apply treatments, and track monitoring trends.
                </p>
              </div>

              {/* Crop Name */}
              <div className="space-y-2">
                <Label htmlFor="crop-name" className="text-xs font-semibold text-foreground/90">
                  Crop Name <span className="text-primary font-bold">*</span>
                </Label>
                <Input
                  id="crop-name"
                  type="text"
                  placeholder="Example: Rice, Wheat, Maize"
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-border/80 focus-visible:ring-primary focus-visible:border-primary/80"
                  required
                />
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs font-semibold text-foreground/90">
                  Location (State, District) <span className="text-primary font-bold">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    type="text"
                    placeholder="Example: Dhamtari, Chhattisgarh"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={loading}
                    className="bg-background/50 border-border/80 pl-9 focus-visible:ring-primary focus-visible:border-primary/80"
                    required
                  />
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                </div>
              </div>

              {/* Problem Description */}
              <div className="space-y-2">
                <Label htmlFor="query" className="text-xs font-semibold text-foreground/90">
                  Problem Description <span className="text-primary font-bold">*</span>
                </Label>
                <Textarea
                  id="query"
                  placeholder="Describe what you are seeing in your crop."
                  rows={4}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  disabled={loading}
                  className="bg-background/50 border-border/80 resize-none focus-visible:ring-primary focus-visible:border-primary/80"
                  required
                />
              </div>

              {/* Drag & Drop Image Placeholder */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground/90 flex justify-between">
                  <span>Upload a Crop Photo</span>
                  <span className="text-[10px] text-muted-foreground font-normal italic">Optional</span>
                </Label>

                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={cn(
                    "relative border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer min-h-[140px]",
                    dragActive ? "border-primary bg-primary/5" : "border-border/80 bg-background/25 hover:bg-background/50",
                    imageFile && "border-solid border-primary/40 bg-primary/5"
                  )}
                >
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={loading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />

                  {imageFile ? (
                    <div className="flex flex-col items-center text-center space-y-2 p-1">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-primary/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={imageFile.preview} 
                          alt="Crop Preview" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="max-w-[220px]">
                        <p className="text-xs font-semibold truncate text-foreground/90">{imageFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{imageFile.size}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setImageFile(null);
                          setImageUploaded(false);
                        }}
                        className="text-[10px] text-destructive hover:underline font-semibold relative z-30"
                      >
                        Remove Image
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-2 pointer-events-none">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground/95">Drag & drop files or click to upload</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">Supports PNG, JPG, JPEG (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Checkbox: Crop Image Uploaded */}
              <div className="flex items-center space-x-2.5 bg-background/30 rounded-xl p-3.5 border border-border/50">
                <input
                  id="image-uploaded"
                  type="checkbox"
                  checked={imageUploaded}
                  onChange={(e) => setImageUploaded(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 accent-primary rounded border-border text-primary bg-background focus:ring-primary cursor-pointer"
                />
                <div className="grid gap-1 leading-none">
                  <Label 
                    htmlFor="image-uploaded" 
                    className="text-xs font-semibold text-foreground/90 cursor-pointer select-none"
                  >
                    I am uploading a photo of the crop symptoms
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Check this box if you have attached a photo of the crop issues.
                  </p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/50 pt-4 flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground hover:shadow-lg hover:shadow-primary/15 transition-all duration-300 py-6"
              >
                {loading ? 'Analyzing Crop...' : 'Analyze My Crop'}
                {!loading && <Sparkles className="w-4 h-4 ml-2" />}
              </Button>

              {error && (
                <div className="flex items-start gap-2 text-xs p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive-foreground w-full animate-shake">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-destructive" />
                  <p className="leading-tight">We could not analyze the crop right now. Please try again in a few moments.</p>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>

        {/* Agent Output / State Dashboard */}
        <div className="w-full flex flex-col gap-6">
          
          {/* Dynamic Workflow visualizer component */}
          {(activeStep >= 0 || backendResponse) && (
            <WorkflowVisualizer
              workflow={
                backendResponse?.workflow_path || [
                  'Supervisor Agent',
                  'Planner Agent',
                  'Disease Agent',
                  'Weather Agent',
                  'Risk Assessment Agent',
                  'Treatment Agent',
                  'Scheme Advisor Agent',
                  'Critic Agent',
                  'Monitoring Agent'
                ]
              }
              currentStepIndex={activeStep}
              isRunning={loading}
            />
          )}

          {/* Case Memory / Monitoring Overview Card */}
          {backendResponse && !backendResponse.workflow_path.includes("Clarification Agent") && (
            <Card className="border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl rounded-2xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest font-heading">Case Record</span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-muted border border-border rounded text-foreground font-semibold flex items-center gap-1">
                      {backendResponse.case_id}
                      <button
                        type="button"
                        onClick={() => {
                          if (backendResponse.case_id) {
                            navigator.clipboard.writeText(backendResponse.case_id);
                            setCopiedCaseId(true);
                            setTimeout(() => setCopiedCaseId(false), 2000);
                          }
                        }}
                        className="hover:text-primary transition-colors ml-0.5"
                        title="Copy Case ID"
                      >
                        {copiedCaseId ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        )}
                      </button>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-foreground leading-snug">
                    {cropName} Case History
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider",
                    backendResponse.escalation_required 
                      ? "bg-red-500/10 border-red-500/20 text-red-500 animate-[pulse_2s_infinite]" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                  )}>
                    {backendResponse.escalation_required ? 'Escalated Status' : 'Monitoring Active'}
                  </span>

                  <span className="px-2.5 py-0.5 text-[10px] font-bold border border-border/80 bg-background/50 rounded-full uppercase tracking-wider text-muted-foreground">
                    {backendResponse.is_follow_up ? 'Follow-up Mode' : 'Baseline Run'}
                  </span>
                </div>
              </div>

              {backendResponse.is_follow_up && (
                <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-5 flex flex-col justify-center space-y-1.5">
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Recovery trend progress</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "px-3 py-1 text-xs font-bold border rounded-xl uppercase tracking-wider",
                        backendResponse.progress_assessment === 'improved' && "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
                        backendResponse.progress_assessment === 'worsened' && "bg-red-500/15 border-red-500/30 text-red-500 animate-pulse",
                        backendResponse.progress_assessment === 'unchanged' && "bg-yellow-500/15 border-yellow-500/30 text-yellow-500",
                        backendResponse.progress_assessment === 'unknown' && "bg-muted border border-border/80 text-muted-foreground"
                      )}>
                        {backendResponse.progress_assessment}
                      </span>
                    </div>
                  </div>

                  <div className="md:col-span-7 space-y-2">
                    <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                      <span>Threat Index comparison</span>
                      <span>{backendResponse.previous_risk_score}% → {backendResponse.current_risk_score}%</span>
                    </div>
                    <div className="relative w-full h-3 bg-muted border border-border/50 rounded-full overflow-hidden flex">
                      <div 
                        className="bg-muted-foreground/30 h-full border-r border-background" 
                        style={{ width: `${backendResponse.previous_risk_score || 0}%` }}
                      />
                      <div 
                        className={cn(
                          "h-full transition-all duration-1000",
                          (backendResponse.current_risk_score ?? 0) < (backendResponse.previous_risk_score ?? 0)
                            ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                            : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.4)]"
                        )}
                        style={{ width: `${backendResponse.current_risk_score || 0}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground italic">
                      Risk changed from {backendResponse.previous_risk_score}% to {backendResponse.current_risk_score}%.
                    </p>
                  </div>
                </div>
              )}
            </Card>
          )}

          {/* Results Summary Box */}
          <Card className="border-white/20 dark:border-white/10 bg-white/40 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl rounded-2xl min-h-[350px] flex flex-col">
            <CardHeader className="border-b border-border/50">
              <CardTitle className="font-heading text-lg font-bold flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  <span>Crop Health & Action Report</span>
                </span>
                {backendResponse && (
                  <span className="px-2 py-0.5 text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                    Report Prepared
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-xs">
                Your personalized crop guidance, weather updates, and support resources.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col justify-center p-6">
              {!loading && !backendResponse ? (
                /* Idle Placeholder State */
                <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
                  <div className="w-16 h-16 rounded-full border border-border/60 bg-muted/20 flex items-center justify-center text-muted-foreground">
                    <Sprout className="w-8 h-8 opacity-40 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-foreground/90">Awaiting Farm Details</h4>
                    <p className="text-xs text-muted-foreground max-w-sm mt-1 mx-auto">
                      Fill out the form on the left to receive immediate, personalized crop assistance.
                    </p>
                  </div>
                </div>
              ) : loading ? (
                /* Loading State with Progress Steps */
                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-semibold text-foreground">
                      {activeStep === 0 && 'Analyzing crop problem...'}
                      {activeStep === 1 && (imageUploaded ? 'Analyzing crop image...' : 'Examining crop details...')}
                      {activeStep === 2 && 'Checking weather conditions...'}
                      {activeStep === 3 && 'Assessing crop risk...'}
                      {activeStep === 4 && 'Preparing recommendations...'}
                      {activeStep === 5 && 'Finding government support options...'}
                    </span>
                  </div>

                  <div className="space-y-2 bg-background/60 rounded-xl p-4 border border-border/50 font-mono text-[11px] leading-relaxed text-muted-foreground overflow-hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">[ASSISTANT]</span>
                      <span>Running agronomic diagnostics checks...</span>
                    </div>
                    {activeStep >= 1 && (
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-500 font-bold">[STEP 1]</span>
                        <span className="text-foreground">Evaluating leaves and disease markers...</span>
                      </div>
                    )}
                    {activeStep >= 2 && (
                      <div className="flex items-center gap-2">
                        <span className="text-blue-500 font-bold">[STEP 2]</span>
                        <span className="text-foreground">Fetching local weather records...</span>
                      </div>
                    )}
                    {activeStep >= 3 && (
                      <div className="flex items-center gap-2">
                        <span className="text-amber-500 font-bold">[STEP 3]</span>
                        <span className="text-foreground font-semibold">Calculating combined weather-crop risk index...</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Completed Results view */
                <div className="space-y-6 py-2 animate-[fadeIn_0.5s_ease-out]">
                  
                  {backendResponse?.status === 'needs_clarification' && backendResponse.questions && backendResponse.questions.length > 0 ? (
                    /* Clarification Request / Low Confidence Path */
                    <div className="space-y-5 animate-[fadeIn_0.4s_ease-out]">
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold font-heading">More Information Needed</h4>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {backendResponse.message || "To provide accurate advice, the AI needs a few more details about your crop."}
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleClarificationSubmit} className="space-y-4">
                        <div className="bg-background/40 border border-border/80 rounded-xl p-4 space-y-3">
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider font-heading">Please Answer:</p>
                          <ul className="space-y-2">
                            {backendResponse.questions.map((question, idx) => (
                              <li key={idx} className="text-xs text-foreground/90 font-semibold flex items-start gap-2">
                                <span className="text-amber-500 font-bold">•</span>
                                <span>{question}</span>
                              </li>
                            ))}
                          </ul>
                          
                          <div className="pt-2">
                            <Label htmlFor="clarification-answer" className="text-xs font-semibold text-foreground/90 block mb-1.5">
                              Your Answer / Additional Details <span className="text-primary font-bold">*</span>
                            </Label>
                            <Textarea
                              id="clarification-answer"
                              placeholder="Write your answers or describe the missing details..."
                              rows={3}
                              value={clarificationAnswer}
                              onChange={(e) => setClarificationAnswer(e.target.value)}
                              disabled={loading}
                              className="bg-background/50 border-border/80 focus-visible:ring-primary focus-visible:border-primary/80 resize-none text-xs"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={loading || !clarificationAnswer.trim()}
                            className="flex-1 font-semibold text-xs py-5 bg-amber-500 hover:bg-amber-600 text-white shadow-md transition-all duration-300"
                          >
                            {loading ? 'Resuming Analysis...' : 'Submit Answers'}
                            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                          </Button>
                          <Button
                            type="button"
                            onClick={resetForm}
                            variant="outline"
                            className="text-xs py-5 border-border hover:bg-muted/50"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  ) : backendResponse?.disease_name ? (
                    /* Success Disease Diagnosis Path */
                    <div className="space-y-6">
                      
                      {/* Cautious Alert banner (Phase 9 Critic downgrades) */}
                      {backendResponse.critic_status === 'downgraded' && (
                        <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold font-heading">Cautious Advisory Active</h4>
                            <p className="text-xs text-foreground/85 leading-relaxed">
                              {backendResponse.cautious_recommendation || "System safety review requested cautious mitigations due to local environment limits."}
                            </p>
                            {backendResponse.critic_issues && backendResponse.critic_issues.length > 0 && (
                              <p className="text-[10px] text-foreground/70 italic mt-1">
                                Notice: {backendResponse.critic_issues.map((i: any) => i.message).join('; ')}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Diagnosis Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 rounded-xl border border-primary/20 p-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Disease Detected</span>
                          <h4 className="text-lg font-bold text-foreground font-heading">{backendResponse.disease_name}</h4>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {(() => {
                            const conf = backendResponse.confidence || 0;
                            let badgeLabel = 'Low Risk';
                            let badgeClass = 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500';
                            if (conf > 40 && conf <= 70) {
                              badgeLabel = 'Moderate Risk';
                              badgeClass = 'bg-amber-500/10 border-amber-500/20 text-amber-500';
                            } else if (conf > 70) {
                              badgeLabel = 'High Risk';
                              badgeClass = 'bg-orange-500/10 border-orange-500/20 text-orange-500';
                            }
                            return (
                              <span className={cn("px-3 py-1 text-xs font-semibold rounded-full border tracking-wide uppercase", badgeClass)}>
                                {badgeLabel}
                              </span>
                            );
                          })()}
                        </div>
                      </div>

                      {/* Diagnostic Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary">
                            <Sprout className="w-4 h-4" />
                            <span>Crop Profile</span>
                          </div>
                          <div className="space-y-2.5 text-xs text-muted-foreground">
                            <div className="flex justify-between border-b border-border/30 pb-1.5">
                              <span>Observed Crop:</span>
                              <strong className="text-foreground">{cropName}</strong>
                            </div>
                            <div className="flex justify-between border-b border-border/30 pb-1.5">
                              <span>Severity:</span>
                              <strong className="text-foreground">{backendResponse.severity || 'Medium'}</strong>
                            </div>
                            <div className="flex justify-between pb-0.5">
                              <span>Detection Accuracy:</span>
                              <strong className="text-foreground">{backendResponse.confidence}%</strong>
                            </div>
                          </div>
                          
                          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden mt-1">
                            <div 
                              className="bg-primary h-full transition-all duration-1000" 
                              style={{ width: `${backendResponse.confidence || 0}%` }}
                            />
                          </div>
                        </div>

                        <div className="border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-amber-500">
                            <AlertTriangle className="w-4 h-4" />
                            <span>Visible Symptoms</span>
                          </div>
                          <ul className="space-y-1.5">
                            {backendResponse.symptoms?.map((symptom, idx) => (
                              <li key={idx} className="text-xs text-foreground/80 flex items-start gap-1.5 leading-snug">
                                <span className="text-amber-500 font-bold mt-0.5">•</span>
                                <span>{symptom}</span>
                              </li>
                            )) || <li className="text-xs text-muted-foreground">No symptoms identified.</li>}
                          </ul>
                        </div>
                      </div>

                      {/* Weather Outlook Card */}
                      {backendResponse.temperature !== undefined && backendResponse.temperature !== null && (
                        <div className="border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                              <CloudSun className="w-4 h-4" />
                              <span>Local Weather Outlook</span>
                            </div>
                            {backendResponse.weather_risk && (
                              <span className={cn(
                                "px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider",
                                backendResponse.weather_risk === 'High' && "bg-rose-500/10 border-rose-500/20 text-rose-500",
                                backendResponse.weather_risk === 'Medium' && "bg-amber-500/10 border-amber-500/20 text-amber-500",
                                backendResponse.weather_risk === 'Low' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              )}>
                                {backendResponse.weather_risk === 'High' ? 'High Risk Conditions' : backendResponse.weather_risk === 'Medium' ? 'Moderate Conditions' : 'Low Risk Conditions'}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40">
                              <Thermometer className="w-4 h-4 text-orange-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Temperature</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.temperature}°C</strong>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40">
                              <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Humidity</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.humidity}%</strong>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40 col-span-2 sm:col-span-1">
                              <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Rain Chance</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.rain_probability}%</strong>
                              </div>
                            </div>
                          </div>

                          {backendResponse.alert && (
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
                              <CloudLightning className="w-5 h-5 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold uppercase tracking-wider font-heading">Weather Alert</h5>
                                <p className="text-xs text-foreground/90 font-semibold leading-relaxed">
                                  {backendResponse.alert}
                                </p>
                                {backendResponse.alert_advice && (
                                  <p className="text-xs text-foreground/80 leading-relaxed font-medium mt-1 pl-2.5 border-l-2 border-rose-500/30">
                                    Advice: {backendResponse.alert_advice}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Explainable Risk Assessment Card */}
                      {backendResponse.risk_score !== undefined && backendResponse.risk_score !== null && (
                        <div className="border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                              <Activity className="w-4 h-4" />
                              <span>Explainable Risk Assessment</span>
                            </div>
                            {backendResponse.risk_level && (
                              <span className={cn(
                                "px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider",
                                backendResponse.risk_level === 'Critical' && "bg-rose-500/10 border-rose-500/20 text-rose-500",
                                backendResponse.risk_level === 'High' && "bg-orange-500/10 border-orange-500/20 text-orange-500",
                                backendResponse.risk_level === 'Medium' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
                                backendResponse.risk_level === 'Low' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              )}>
                                {backendResponse.risk_level} Risk Level
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Score & Meter */}
                            <div className="md:col-span-4 flex flex-col justify-center space-y-2 border-b md:border-b-0 md:border-r border-border/30 pb-4 md:pb-0 md:pr-4">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Threat Score</span>
                                <span className="text-xl font-bold text-foreground">
                                  {backendResponse.risk_score}%
                                </span>
                              </div>
                              
                              <div className="w-full bg-muted/60 h-3 rounded-full overflow-hidden relative">
                                <div 
                                  className={cn(
                                    "h-full transition-all duration-1000",
                                    backendResponse.risk_level === 'Critical' && "bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]",
                                    backendResponse.risk_level === 'High' && "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]",
                                    backendResponse.risk_level === 'Medium' && "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
                                    backendResponse.risk_level === 'Low' && "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                  )}
                                  style={{ width: `${backendResponse.risk_score}%` }}
                                />
                              </div>
                              
                              <div className="flex justify-between text-[8px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                                <span>Low</span>
                                <span>Med</span>
                                <span>High</span>
                                <span>Crit</span>
                              </div>

                              {backendResponse.risk_confidence !== undefined && (
                                <div className="pt-2 border-t border-border/30 mt-1">
                                  <div className="flex justify-between text-[10px] text-muted-foreground">
                                    <span>Engine Confidence:</span>
                                    <strong className="text-foreground">{Math.round(backendResponse.risk_confidence * 100)}%</strong>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Risk Summary */}
                            <div className="md:col-span-8 space-y-2">
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Reasoning Summary</span>
                              <p className="text-xs text-foreground/85 leading-relaxed">
                                {backendResponse.risk_reasoning_summary || (backendResponse.risk_factors && backendResponse.risk_factors[0]) || "Risk level estimated from localized pathology markers and meteorological data."}
                              </p>
                              {backendResponse.top_risk_drivers && backendResponse.top_risk_drivers.length > 0 && (
                                <div className="pt-1.5 flex flex-wrap gap-1.5">
                                  {backendResponse.top_risk_drivers.map((driver, idx) => (
                                    <span key={idx} className="px-2 py-0.5 text-[9px] font-semibold bg-rose-500/10 border border-rose-500/25 text-rose-400 rounded-md animate-fade-in">
                                      {driver}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Risk Factor Breakdown Table */}
                          {backendResponse.risk_factor_breakdown && backendResponse.risk_factor_breakdown.length > 0 && (
                            <div className="border border-border/50 bg-background/50 rounded-xl overflow-hidden mt-3">
                              <div className="grid grid-cols-12 bg-muted/40 py-2 px-3 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/30">
                                <div className="col-span-4">Risk Factor</div>
                                <div className="col-span-3 text-center">Value</div>
                                <div className="col-span-2 text-center">Weight</div>
                                <div className="col-span-3 text-right">Contribution</div>
                              </div>
                              <div className="divide-y divide-border/30">
                                {backendResponse.risk_factor_breakdown.map((factor: any, idx: number) => (
                                  <div key={idx} className="grid grid-cols-12 py-2.5 px-3 text-xs items-center">
                                    <div className="col-span-4 font-semibold text-foreground">{factor.name}</div>
                                    <div className="col-span-3 text-center text-muted-foreground truncate" title={factor.raw_value}>{factor.raw_value || 'None'}</div>
                                    <div className="col-span-2 text-center text-muted-foreground">{(factor.weight * 100).toFixed(0)}%</div>
                                    <div className="col-span-3 text-right font-bold text-foreground">+{factor.contribution_score}%</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {backendResponse.warning && (
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500">
                              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <h5 className="text-xs font-bold uppercase tracking-wider font-heading">Immediate Attention Needed</h5>
                                <p className="text-xs text-foreground/90 font-semibold leading-relaxed">
                                  {backendResponse.warning}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Treatment & Intervention Card */}
                      {backendResponse.treatment_plan && (
                        <div className="border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 dark:from-emerald-950/20 dark:to-transparent backdrop-blur-md rounded-2xl p-4 space-y-5">
                          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                              <Stethoscope className="w-4 h-4" />
                              <span>Treatment Recommendations</span>
                            </div>
                            {backendResponse.intervention_priority && (
                              <span className={cn(
                                "px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider",
                                backendResponse.intervention_priority.includes('Immediate') && "bg-rose-500/10 border-rose-500/20 text-rose-400",
                                backendResponse.intervention_priority.includes('24 Hours') && "bg-orange-500/10 border-orange-500/20 text-orange-400",
                                backendResponse.intervention_priority.includes('Week') && "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
                                backendResponse.intervention_priority.includes('Routine') && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                              )}>
                                <Zap className="w-2.5 h-2.5 inline mr-0.5 animate-pulse" />
                                {backendResponse.intervention_priority}
                              </span>
                            )}
                          </div>

                          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg p-3.5 space-y-1.5">
                            <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest font-heading">Action Plan</p>
                            <p className="text-xs text-foreground/90 leading-relaxed font-medium">
                              {backendResponse.treatment_plan.treatment}
                            </p>
                            {backendResponse.treatment_plan.chemical && (
                              <div className="mt-2 flex items-start gap-2 text-[11px] text-muted-foreground">
                                <span className="text-emerald-500 font-bold shrink-0">⚗</span>
                                <span className="leading-relaxed font-mono">{backendResponse.treatment_plan.chemical}</span>
                              </div>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div className="flex items-center gap-3 bg-background/40 border border-border/50 rounded-xl p-3">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                                <IndianRupee className="w-4 h-4 text-emerald-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground font-medium">Estimated Cost</p>
                                <p className="text-sm font-bold text-foreground">₹{backendResponse.estimated_cost?.toLocaleString('en-IN')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 bg-background/40 border border-border/50 rounded-xl p-3">
                              <div className="w-8 h-8 rounded-full bg-sky-500/10 flex items-center justify-center shrink-0">
                                <CalendarDays className="w-4 h-4 text-sky-400" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-[10px] text-muted-foreground font-medium">Estimated Recovery</p>
                                <p className="text-sm font-bold text-foreground">{backendResponse.expected_recovery_days} days</p>
                              </div>
                            </div>
                          </div>

                          {backendResponse.recommended_actions && backendResponse.recommended_actions.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5 font-heading">
                                <Lightbulb className="w-3 h-3 text-amber-400" />
                                Recommended Actions
                              </p>
                              <ul className="space-y-2">
                                {backendResponse.recommended_actions.map((action, idx) => (
                                  <li key={idx} className="flex items-start gap-2.5 text-xs text-foreground/85 leading-relaxed">
                                    <span className={cn(
                                      "w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5",
                                      action.includes('⚠️') 
                                        ? "bg-amber-500/15 text-amber-400" 
                                        : "bg-emerald-500/10 text-emerald-400"
                                    )}>
                                      ✓
                                    </span>
                                    <span className={action.includes('⚠️') ? 'text-amber-300 font-semibold animate-pulse' : ''}>
                                      {action.replace('⚠️ ', '')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {backendResponse.action_timeline && backendResponse.action_timeline.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5 font-heading">
                                <Clock className="w-3 h-3 text-sky-400" />
                                Timeline of Action Steps
                              </p>
                              <div className="space-y-3">
                                {backendResponse.action_timeline.map((entry, ti) => (
                                  <div key={ti} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center shrink-0">
                                      <div className={cn(
                                        "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border shrink-0",
                                        ti === 0 && "bg-emerald-500/20 border-emerald-500/40 text-emerald-400",
                                        ti === 1 && "bg-sky-500/20 border-sky-500/40 text-sky-400",
                                        ti >= 2 && "bg-violet-500/20 border-violet-500/40 text-violet-400"
                                      )}>
                                        {ti + 1}
                                      </div>
                                      {ti < (backendResponse.action_timeline?.length ?? 0) - 1 && (
                                        <div className="w-px h-full min-h-[16px] bg-border/40 mt-1" />
                                      )}
                                    </div>
                                    <div className="pb-3 flex-1">
                                      <p className={cn(
                                        "text-xs font-bold mb-1.5",
                                        ti === 0 && "text-emerald-400",
                                        ti === 1 && "text-sky-400",
                                        ti >= 2 && "text-violet-400"
                                      )}>
                                        {entry.period}
                                      </p>
                                      <ul className="space-y-1">
                                        {entry.tasks.map((task, tki) => (
                                          <li key={tki} className="flex items-start gap-1.5 text-[11px] text-foreground/75 leading-relaxed">
                                            <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-muted-foreground/50" />
                                            <span>{task}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {!backendResponse.treatment_plan && backendResponse.recommendation && (
                        <div className="border border-white/10 dark:border-white/5 bg-white/10 dark:bg-black/10 backdrop-blur-md rounded-2xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                            <Lightbulb className="w-4 h-4" />
                            <span>Recommended Actions</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-medium bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                            {backendResponse.recommendation}
                          </p>
                        </div>
                      )}

                      {/* Government Scheme Card */}
                      {backendResponse.scheme_recommendations && backendResponse.scheme_recommendations.length > 0 && (
                        <div className="border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-purple-500/5 dark:from-violet-950/20 dark:to-transparent backdrop-blur-md rounded-2xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 font-heading">
                              <Building2 className="w-4 h-4" />
                              <span>Government Support Advisor</span>
                            </div>
                            {backendResponse.financial_support_score !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-muted-foreground font-medium">Financial Score</div>
                                <div className="relative w-16 h-2 rounded-full bg-muted/50 overflow-hidden">
                                  <div
                                    className={cn(
                                      "absolute inset-y-0 left-0 rounded-full transition-all",
                                      backendResponse.financial_support_score >= 70 ? "bg-rose-500" :
                                      backendResponse.financial_support_score >= 40 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${backendResponse.financial_support_score}%` }}
                                  />
                                </div>
                                <span className={cn(
                                  "text-xs font-bold",
                                  backendResponse.financial_support_score >= 70 ? "text-rose-400" :
                                  backendResponse.financial_support_score >= 40 ? "text-amber-400" : "text-emerald-400"
                                )}>
                                  {backendResponse.financial_support_score}/100
                                </span>
                              </div>
                            )}
                          </div>

                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            Based on your crop context, you may qualify for local program subsidies or state support:
                            <span className="text-violet-400 font-medium"> Click program to view requirements.</span>
                          </p>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {backendResponse.scheme_recommendations.map((scheme) => (
                              <button
                                key={scheme.scheme_id}
                                type="button"
                                id={`scheme-card-${scheme.scheme_id}`}
                                onClick={() => setSelectedScheme(scheme)}
                                className="text-left border border-violet-500/20 hover:border-violet-500/50 bg-background/50 hover:bg-violet-500/5 rounded-xl p-3 space-y-1.5 transition-all duration-250 group"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1 min-w-0">
                                    <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center shrink-0 mt-0.5">
                                      <ScrollText className="w-3 h-3 text-violet-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-bold text-foreground group-hover:text-violet-300 transition-colors truncate font-heading">
                                        {scheme.name.split('(')[0].trim()}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">{scheme.type}</p>
                                    </div>
                                  </div>
                                  <BadgeInfo className="w-3 h-3 text-violet-500/60 group-hover:text-violet-400 shrink-0 mt-1 transition-colors" />
                                </div>
                                <p className="text-[11px] text-foreground/70 leading-relaxed line-clamp-2 pl-8">
                                  {scheme.reason.split('.')[0]}.
                                </p>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    /* General Advisory Path */
                    <div className="space-y-4">
                      <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
                        <h4 className="text-sm font-bold text-primary flex items-center gap-2 font-heading">
                          <Sparkles className="w-4 h-4" />
                          <span>Crop Care Advice</span>
                        </h4>
                      </div>
                      <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-2">
                        <p className="text-xs text-foreground/80 italic leading-relaxed">
                          &quot;{backendResponse?.result?.message || backendResponse?.message || 'General farming advice placeholder'}&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Scheme Detail Modal */}
                  {selectedScheme && (
                    <div
                      id="scheme-detail-modal"
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      onClick={() => setSelectedScheme(null)}
                    >
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                      <div
                        className="relative z-10 w-full max-w-md bg-background border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="bg-gradient-to-r from-violet-950/60 to-background p-5 border-b border-violet-500/20">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center shrink-0">
                                <Building2 className="w-4 h-4 text-violet-400" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-foreground leading-tight font-heading">{selectedScheme.name}</h3>
                                <p className="text-[10px] text-violet-400 font-medium mt-0.5">{selectedScheme.type}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              id="close-scheme-modal"
                              onClick={() => setSelectedScheme(null)}
                              className="w-7 h-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center shrink-0 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                              <Zap className="w-3 h-3" /> Why Recommended
                            </p>
                            <p className="text-xs text-foreground/90 leading-relaxed bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">
                              {selectedScheme.reason}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                              <BookOpen className="w-3 h-3" /> How to Apply
                            </p>
                            <p className="text-xs text-foreground/85 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                              {selectedScheme.application_tip}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-muted-foreground">Scheme Reference ID</span>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold border border-border/50 bg-muted/30 rounded-md text-foreground/60">
                              {selectedScheme.scheme_id}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-border/50 p-4 flex items-center justify-between bg-muted/20">
                          <p className="text-[10px] text-muted-foreground leading-tight max-w-[200px]">
                            Please visit your nearest local agricultural office or official portal to apply.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedScheme(null)}
                            className="text-xs h-7 border-violet-500/30 hover:bg-violet-500/10 hover:text-violet-300"
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </CardContent>

            {backendResponse && (
              <CardFooter className="border-t border-border/50 pt-4 flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground">
                  Ready to test another crop?
                </p>
                <Button 
                  onClick={resetForm}
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-8 border-border hover:bg-muted/50"
                >
                  Reset Analysis
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
