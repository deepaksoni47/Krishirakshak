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
  BadgeInfo
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
  
  // App execution states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(-1); // -1: idle, 0..3: active step, complete: workflow_path.length
  const [backendResponse, setBackendResponse] = useState<AnalyzeResponse | null>(null);
  
  // Phase 7: Scheme modal state
  const [selectedScheme, setSelectedScheme] = useState<SchemeRecommendation | null>(null);

  // Drag and drop states
  const [dragActive, setDragActive] = useState(false);

  // Mock upload handler (Phase 1 visual helper)
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

  // Submit and orchestrate mock agent steps
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName.trim() || !query.trim()) {
      setError('Please fill in both the crop name and your query.');
      return;
    }

    setLoading(true);
    setError(null);
    setBackendResponse(null);
    setActiveStep(0); // Start at Supervisor Agent

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    try {
      // 1. Fetch backend endpoint using FormData (multipart/form-data)
      const formData = new FormData();
      formData.append('crop_name', cropName);
      formData.append('query', query);
      formData.append('image_uploaded', String(imageUploaded));
      formData.append('location', location);
      
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

      // 2. Perform sequential animation of agent execution pipeline dynamically
      setActiveStep(0); // Start at Supervisor Agent

      for (let i = 1; i < data.workflow_path.length; i++) {
        await new Promise(r => setTimeout(r, 1000));
        setActiveStep(i);
      }

      // Finalize UI rendering
      await new Promise(r => setTimeout(r, 1200));
      
      setActiveStep(data.workflow_path.length); // All steps completed
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to the backend server. Please check if your FastAPI server is running.');
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
    setBackendResponse(null);
    setActiveStep(-1);
    setError(null);
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Input Form Card */}
        <Card className="lg:col-span-5 border-border/80 bg-card/30 backdrop-blur-md shadow-xl">
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

        {/* Right Side: Agent Output / State Dashboard */}
        <div className="lg:col-span-7 flex flex-col gap-6 w-full">
          {/* Analysis Journey Checklist */}
          {(activeStep >= 0 || backendResponse) && (
            <div className="w-full py-6 px-6 bg-card/40 backdrop-blur-md rounded-2xl border border-border/80 shadow-lg space-y-4">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold tracking-tight font-heading text-primary">
                  How We Analyzed Your Crop
                </h3>
                <p className="text-xs text-muted-foreground">
                  Step-by-step progress of your crop health assessment.
                </p>
              </div>

              <div className="space-y-3">
                {/* Step 1: Examined Crop Image */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    activeStep > 1 || (backendResponse && activeStep === backendResponse.workflow_path.length)
                      ? "bg-primary text-primary-foreground"
                      : activeStep === 1 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : activeStep === 0 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : "bg-muted/40 text-muted-foreground border border-border/50"
                  )}>
                    {activeStep > 1 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "✓" : "1"}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    activeStep >= 1 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {imageUploaded ? "Examined Crop Image" : "Analyzed Crop Problem Statement"}
                  </span>
                </div>

                {/* Step 2: Checked Local Weather */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    activeStep > 2 || (backendResponse && activeStep === backendResponse.workflow_path.length)
                      ? "bg-primary text-primary-foreground"
                      : activeStep === 2 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : "bg-muted/40 text-muted-foreground border border-border/50"
                  )}>
                    {activeStep > 2 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "✓" : "2"}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    activeStep >= 2 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Checked Local Weather
                  </span>
                </div>

                {/* Step 3: Evaluated Disease Risk */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    activeStep > 3 || (backendResponse && activeStep === backendResponse.workflow_path.length)
                      ? "bg-primary text-primary-foreground"
                      : activeStep === 3 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : "bg-muted/40 text-muted-foreground border border-border/50"
                  )}>
                    {activeStep > 3 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "✓" : "3"}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    activeStep >= 3 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Evaluated Disease Risk
                  </span>
                </div>

                {/* Step 4: Prepared Treatment Advice */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    activeStep > 4 || (backendResponse && activeStep === backendResponse.workflow_path.length)
                      ? "bg-primary text-primary-foreground"
                      : activeStep === 4 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : "bg-muted/40 text-muted-foreground border border-border/50"
                  )}>
                    {activeStep > 4 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "✓" : "4"}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    activeStep >= 4 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Prepared Treatment Advice
                  </span>
                </div>

                {/* Step 5: Found Government Support Options */}
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                    activeStep > 5 || (backendResponse && activeStep === backendResponse.workflow_path.length)
                      ? "bg-primary text-primary-foreground"
                      : activeStep === 5 && loading
                      ? "bg-primary/20 text-primary border border-primary animate-pulse"
                      : "bg-muted/40 text-muted-foreground border border-border/50"
                  )}>
                    {activeStep > 5 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "✓" : "5"}
                  </div>
                  <span className={cn(
                    "text-xs font-medium",
                    activeStep >= 5 || (backendResponse && activeStep === backendResponse.workflow_path.length) ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Found Government Support Options
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Results Summary Box */}
          <Card className="border-border/80 bg-card/30 backdrop-blur-md flex-1 shadow-xl min-h-[350px] flex flex-col">
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
                  {backendResponse?.workflow_path.includes("Clarification Agent") ? (
                    /* 1. Clarification Request / Low Confidence Path */
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-500">
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold">Additional Input Required</h4>
                          <p className="text-xs text-foreground/80 leading-relaxed">
                            {backendResponse.message}
                          </p>
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl border border-border/80 bg-background/40 space-y-3">
                        <h5 className="text-xs font-bold text-foreground">Why did this happen?</h5>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          We examined your inputs, but we could not identify the crop issues with high enough accuracy. Please try uploading a clearer, closer photo of the leaves under good lighting so we can provide correct advice.
                        </p>
                      </div>
                    </div>
                  ) : backendResponse?.disease_name ? (
                    /* 2. Success Disease Diagnosis Path */
                    <div className="space-y-6">
                      {/* Diagnosis Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-primary/5 rounded-xl border border-primary/20 p-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide">Disease Detected</span>
                          <h4 className="text-lg font-bold text-foreground font-heading">{backendResponse.disease_name}</h4>
                        </div>
                        
                        {/* Risk Badge based on confidence */}
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
                        {/* Metrics: Crop & Severity */}
                        <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-3">
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
                          
                          {/* Confidence Progress Bar */}
                          <div className="w-full bg-muted/60 h-2 rounded-full overflow-hidden mt-1">
                            <div 
                              className="bg-primary h-full transition-all duration-1000" 
                              style={{ width: `${backendResponse.confidence || 0}%` }}
                            />
                          </div>
                        </div>

                        {/* Symptoms List */}
                        <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-3">
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
                        <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-4">
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
                            {/* Temperature */}
                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40">
                              <Thermometer className="w-4 h-4 text-orange-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Temperature</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.temperature}°C</strong>
                              </div>
                            </div>

                            {/* Humidity */}
                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40">
                              <Droplets className="w-4 h-4 text-sky-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Humidity</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.humidity}%</strong>
                              </div>
                            </div>

                            {/* Rain Probability */}
                            <div className="flex items-center gap-2.5 bg-background/20 rounded-lg p-2.5 border border-border/40 col-span-2 sm:col-span-1">
                              <CloudRain className="w-4 h-4 text-blue-400 shrink-0" />
                              <div className="space-y-0.5">
                                <span className="text-[10px] text-muted-foreground block font-medium">Rain Chance</span>
                                <strong className="text-sm font-bold text-foreground">{backendResponse.rain_probability}%</strong>
                              </div>
                            </div>
                          </div>

                          {/* Weather Alert / Advice Banner */}
                          {backendResponse.alert && (
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 animate-[pulse_3s_infinite]">
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

                      {/* Risk Assessment Dashboard Card */}
                      {backendResponse.risk_score !== undefined && backendResponse.risk_score !== null && (
                        <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-4">
                          <div className="flex items-center justify-between border-b border-border/30 pb-2">
                            <div className="flex items-center gap-2 text-xs font-bold text-rose-400">
                              <Activity className="w-4 h-4" />
                              <span>Crop Risk Analysis</span>
                            </div>
                            {backendResponse.risk_level && (
                              <span className={cn(
                                "px-2.5 py-0.5 text-[10px] font-bold border rounded-full uppercase tracking-wider",
                                backendResponse.risk_level === 'Critical' && "bg-rose-500/10 border-rose-500/20 text-rose-500",
                                backendResponse.risk_level === 'High' && "bg-orange-500/10 border-orange-500/20 text-orange-500",
                                backendResponse.risk_level === 'Medium' && "bg-yellow-500/10 border-yellow-500/20 text-yellow-500",
                                backendResponse.risk_level === 'Low' && "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                              )}>
                                {backendResponse.risk_level === 'Critical' ? 'Immediate Attention Needed' : backendResponse.risk_level === 'High' ? 'High Risk' : backendResponse.risk_level === 'Medium' ? 'Moderate Risk' : 'Low Risk'}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Score & Meter */}
                            <div className="md:col-span-5 flex flex-col justify-center space-y-2 border-b md:border-b-0 md:border-r border-border/30 pb-4 md:pb-0 md:pr-4">
                              <div className="flex justify-between items-end">
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Current Risk</span>
                                <span className={cn(
                                  "text-2xl font-bold font-heading",
                                  backendResponse.risk_level === 'Critical' && "text-rose-500",
                                  backendResponse.risk_level === 'High' && "text-orange-500",
                                  backendResponse.risk_level === 'Medium' && "text-yellow-500",
                                  backendResponse.risk_level === 'Low' && "text-emerald-500"
                                )}>
                                  {backendResponse.risk_level === 'Critical' ? 'Immediate Attention' : backendResponse.risk_level === 'High' ? 'High' : backendResponse.risk_level === 'Medium' ? 'Moderate' : 'Low'}
                                </span>
                              </div>
                              
                              {/* Risk Meter Progress Bar */}
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
                              
                              <div className="flex justify-between text-[9px] text-muted-foreground/60 font-semibold uppercase tracking-wider">
                                <span>Low</span>
                                <span>Moderate</span>
                                <span>High</span>
                                <span>Immediate</span>
                              </div>
                            </div>

                            {/* Risk Factors */}
                            <div className="md:col-span-7 space-y-2">
                              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Reason</span>
                              <ul className="space-y-1.5">
                                {backendResponse.risk_factors?.map((factor, idx) => (
                                  <li key={idx} className="text-xs text-foreground/80 flex items-start gap-2 leading-relaxed">
                                    <span className={cn(
                                      "w-1.5 h-1.5 rounded-full mt-1.5 shrink-0",
                                      backendResponse.risk_level === 'Critical' && "bg-rose-500",
                                      backendResponse.risk_level === 'High' && "bg-orange-500",
                                      backendResponse.risk_level === 'Medium' && "bg-yellow-500",
                                      backendResponse.risk_level === 'Low' && "bg-emerald-500"
                                    )} />
                                    <span>{factor}</span>
                                  </li>
                                )) || <li className="text-xs text-muted-foreground">Conditions look stable.</li>}
                              </ul>
                            </div>
                          </div>

                          {/* Emergency Alert Banner */}
                          {backendResponse.warning && (
                            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-500 animate-[shake_4s_infinite]">
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

                      {/* ── Phase 6: Treatment & Intervention Card ── */}
                      {backendResponse.treatment_plan && (
                        <div className="border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 via-background/40 to-background/40 rounded-xl p-4 space-y-5">
                          {/* Card Header */}
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
                                <Zap className="w-2.5 h-2.5 inline mr-0.5" />
                                {backendResponse.intervention_priority}
                              </span>
                            )}
                          </div>

                          {/* Treatment Description */}
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

                          {/* Cost + Recovery Metrics Row */}
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
                                <p className="text-[10px] text-muted-foreground font-medium">Estimated Recovery Time</p>
                                <p className="text-sm font-bold text-foreground">{backendResponse.expected_recovery_days} days</p>
                              </div>
                            </div>
                          </div>

                          {/* Recommended Actions */}
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
                                    <span className={action.includes('⚠️') ? 'text-amber-300 font-semibold' : ''}>
                                      {action.replace('⚠️ ', '')}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Action Timeline */}
                          {backendResponse.action_timeline && backendResponse.action_timeline.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5 font-heading">
                                <Clock className="w-3 h-3 text-sky-400" />
                                Timeline of Action Steps
                              </p>
                              <div className="space-y-3">
                                {backendResponse.action_timeline.map((entry, ti) => (
                                  <div key={ti} className="flex items-start gap-3">
                                    {/* Timeline stem */}
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

                      {/* Fallback: legacy recommendation text */}
                      {!backendResponse.treatment_plan && backendResponse.recommendation && (
                        <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500">
                            <Lightbulb className="w-4 h-4" />
                            <span>Recommended Actions</span>
                          </div>
                          <p className="text-xs text-foreground/90 leading-relaxed font-medium bg-emerald-500/5 p-3 rounded-lg border border-emerald-500/10">
                            {backendResponse.recommendation}
                          </p>
                        </div>
                      )}

                      {/* ── Phase 7: Government Scheme Advisor Card ── */}
                      {backendResponse.scheme_recommendations && backendResponse.scheme_recommendations.length > 0 && (
                        <div className="border border-violet-500/30 bg-gradient-to-br from-violet-950/30 via-background/40 to-background/40 rounded-xl p-4 space-y-4">
                          {/* Card Header */}
                          <div className="flex items-center justify-between border-b border-violet-500/20 pb-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-violet-400 font-heading">
                              <Building2 className="w-4 h-4" />
                              <span>Government Support</span>
                            </div>
                            {backendResponse.financial_support_score !== undefined && (
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-muted-foreground font-medium">Financial Support Score</div>
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
                            Based on your situation, you may qualify for the following financial assistance and insurance programs:
                            <span className="text-violet-400 font-medium"> Click any program to see details.</span>
                          </p>

                          {/* Scheme Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {backendResponse.scheme_recommendations.map((scheme, idx) => (
                              <button
                                key={scheme.scheme_id}
                                id={`scheme-card-${scheme.scheme_id}`}
                                onClick={() => setSelectedScheme(scheme)}
                                className="text-left border border-violet-500/20 hover:border-violet-500/50 bg-background/50 hover:bg-violet-500/5 rounded-xl p-3 space-y-1.5 transition-all duration-200 group"
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
                    /* 3. General Advisory Path */
                    <div className="space-y-4">
                      <div className="bg-primary/5 rounded-xl border border-primary/20 p-4 space-y-2">
                        <h4 className="text-sm font-bold text-primary flex items-center gap-2 font-heading">
                          <Sparkles className="w-4 h-4" />
                          <span>Crop Care Advice</span>
                        </h4>
                      </div>
                      <div className="border border-border/80 bg-background/40 rounded-xl p-4 space-y-2">
                        <p className="text-xs text-foreground/80 italic leading-relaxed">
                          &quot;{backendResponse?.result?.message || 'General farming advice placeholder'}&quot;
                        </p>
                      </div>
                    </div>
                  )}

                  {/* ── Phase 7: Scheme Detail Modal ── */}
                  {selectedScheme && (
                    <div
                      id="scheme-detail-modal"
                      className="fixed inset-0 z-50 flex items-center justify-center p-4"
                      onClick={() => setSelectedScheme(null)}
                    >
                      {/* Backdrop */}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                      {/* Modal */}
                      <div
                        className="relative z-10 w-full max-w-md bg-background border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-500/10 overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Modal Header */}
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
                              id="close-scheme-modal"
                              onClick={() => setSelectedScheme(null)}
                              className="w-7 h-7 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center shrink-0 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
                          {/* Why Recommended */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-violet-400 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                              <Zap className="w-3 h-3" /> Why Recommended
                            </p>
                            <p className="text-xs text-foreground/90 leading-relaxed bg-violet-500/5 border border-violet-500/10 rounded-lg p-3">
                              {selectedScheme.reason}
                            </p>
                          </div>

                          {/* Application Tip */}
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 font-heading">
                              <BookOpen className="w-3 h-3" /> How to Apply
                            </p>
                            <p className="text-xs text-foreground/85 leading-relaxed bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                              {selectedScheme.application_tip}
                            </p>
                          </div>

                          {/* Scheme ID badge */}
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-muted-foreground">Scheme Reference ID</span>
                            <span className="px-2 py-0.5 text-[10px] font-mono font-bold border border-border/50 bg-muted/30 rounded-md text-foreground/60">
                              {selectedScheme.scheme_id}
                            </span>
                          </div>
                        </div>

                        {/* Modal Footer */}
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
