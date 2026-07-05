<div align="center">
 
# 🌾 KrishiRakshak AI
 
### Climate-Adaptive Multi-Agent Farming Advisor
 
*Protecting India's crops, one AI diagnosis at a time.*
 
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![LangGraph](https://img.shields.io/badge/LangGraph-Multi--Agent-blue?style=flat-square)](https://github.com/langchain-ai/langgraph)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?style=flat-square&logo=google&logoColor=white)](https://aistudio.google.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
 
[Live Demo](#) · [API Docs](#api-reference) · [Deployment Guide](#-deployment-free)
 
</div>
 
---
 
## 🎯 What is KrishiRakshak?
 
KrishiRakshak ("Crop Protector" in Hindi) is a production-grade AI system that gives smallholder farmers access to expert-level crop diagnostics, real-time weather risk analysis, personalized treatment plans, and government scheme recommendations — all in one place.
 
It directly supports **UN Sustainable Development Goal 2 (Zero Hunger)** by preventing yield failure through early disease detection and climate-aware interventions.
 
> **The problem**: Smallholder farmers face crop disease, weather volatility, and financial stress simultaneously — but expert agronomists, meteorologists, and scheme officers are rarely accessible in rural India.
>
> **The solution**: A coordinated swarm of specialized AI agents built on **LangGraph** that works statefully to diagnose, advise, protect, and track crop recovery over time.
 
---
 
## ✨ Key Features
 
| Feature | Description |
|---|---|
| 🔬 **AI Crop Disease Diagnosis** | Upload a photo — Gemini 2.5 Flash Vision identifies the disease, confidence score, and symptoms |
| 🧠 **Stateful Case Memory & SQL Tracking** | SQLite + SQLAlchemy database tracks baseline cases and follow-up checks to assess recovery trends |
| 🌦️ **Real-Time Weather Risk** | Live OpenWeatherMap data feeds into a unified 0–100 risk index |
| ⚖️ **Explainable Risk Engine** | Breaks down threat indices into clear factor weight categories and identifies top risk drivers |
| 💬 **Clarification Loop** | Pauses workflow execution to gather missing farmer information and statefully resumes |
| 🛡️ **Critic & Safety Auditor** | Reviews final recommendations and automatically downgrades flags to cautious advice under high uncertainty |
| 🏛️ **Government Scheme Matching** | TF-IDF FAISS RAG across 11 scheme documents (PMFBY, KCC, PM-KISAN, and more) |
| 🪄 **Liquid Glassmorphism UI** | Modern Next.js layout featuring ibelick-grid styling, stacked reports, and responsive mobile toggles |
 
---
 
## 🏗️ Architecture
 
### Dynamic Planner & Critic Pipeline
```
Farmer Input (crop + location + query)
        ↓
  [Planner Node] ◄═════════════╗ (Bounded Replan)
        ↓ (Selects Agents to run)
  [Disease Agent]
        ↓
  [Weather Agent]
        ↓
  [Risk Engine]
        ↓
  [Clarification Check] ──► (Pause & prompt for missing details)
        ↓
  [Treatment Agent]
        ↓
  [Scheme Advisor]
        ↓
  [Critic Node] ═══════════════╝ (Downgrades or requests replan if unsafe)
        ↓
  [Monitoring Agent] (Analyzes history and transitions status)
        ↓
 Farmer Response
```
 
### The Specialized Agents
 
| # | Agent | Role |
|---|---|---|
| 1 | **Planner** | Dynamic brain: evaluates user inputs and schedules agent execution paths |
| 2 | **Disease** | Gemini Vision analysis — disease name, confidence, symptoms |
| 3 | **Advisory** | General farming Q&A (sowing, fertilizer, seasons) |
| 4 | **Weather** | Fetches humidity, temperature, rain probability |
| 5 | **Explainable Risk** | Computes factor weights (Disease, Weather, Environment) and drivers |
| 6 | **Emergency** | Critical warnings and emergency actions (risk ≥ 70) |
| 7 | **Monitoring** | Historical database checks to calculate crop recovery progress |
| 8 | **Treatment** | Chemical treatments, organic alternatives, action timeline, cost |
| 9 | **Scheme Advisor** | RAG-powered match against 11 Indian government schemes |
| 10| **Critic & Safety** | Validates the integrity and safety of all generated guidelines |
 
---
 
## 🛠️ Tech Stack
 
### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async REST API, OpenAPI docs auto-generated |
| **LangGraph** | Multi-agent state machine with dynamic DAG routing |
| **SQLAlchemy + SQLite** | Stateful persistence tracking case histories and snapshots |
| **Google Gemini 2.5 Flash** | Vision model for crop disease diagnosis |
| **FAISS + Scikit-Learn (TF-IDF)** | Similarity search for government scheme RAG |
| **OpenWeatherMap API** | Real-time weather details |
| **Pydantic v2** | Type-safe schemas and unified `FarmerCase` state validation |
 
### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16 + React 19** | App Router, Client-side session continuation, TypeScript |
| **TailwindCSS v4** | Frosted glassmorphism themes & responsive grids |
| **ibelick/bg** | Ambient grid layouts and radial top masks |
| **lucide-react** | SVG icon system |
 
---
 
## 🚀 Local Development
 
### Prerequisites
 
- **Python** 3.10+
- **Node.js** 18+ and npm
- **Gemini API Key** — [Get free key →](https://aistudio.google.com/app/apikey)
- **OpenWeatherMap API Key** — [Get free key →](https://openweathermap.org/api)
 
### 1. Clone & Configure
 
```bash
git clone https://github.com/YOUR_USERNAME/krishirakshak.git
cd krishirakshak
 
# Copy env template and fill in your keys
cp .env.example .env
```
 
Edit `.env`:
```env
GEMINI_API_KEY=your_gemini_api_key_here
OPENWEATHER_API_KEY=your_openweather_api_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```
 
### 2. Start the Backend
 
```bash
# From project root — create virtual environment
python -m venv backend/.venv
 
# Activate it
# Windows:
backend\.venv\Scripts\activate
# Linux/macOS:
source backend/.venv/bin/activate
 
# Install dependencies
pip install -r backend/requirements.txt
 
# Run the FastAPI server
uvicorn backend.main:app --reload --port 8000
```
 
Backend is live at: **http://localhost:8000**
Interactive API docs: **http://localhost:8000/docs**
 
### 3. Start the Frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
Frontend is live at: **http://localhost:3000**
 
---
 
## 📡 API Reference
 
### `POST /analyze`
 
Submit a crop analysis request to the multi-agent pipeline.
 
**Form fields:**
 
| Field | Type | Required | Description |
|---|---|---|---|
| `crop_name` | `string` | ✅ | Name of the crop (e.g. `"Rice"`, `"Tomato"`) |
| `query` | `string` | ✅ | Farmer's question or symptom description |
| `image_uploaded` | `boolean` | ✅ | Whether an image is attached |
| `location` | `string` | ❌ | Farmer's location (default: `"Dhamtari, Chhattisgarh"`) |
| `case_id` | `string` | ❌ | Optional past Case ID to trigger follow-up monitoring check |
| `request_id` | `string` | ❌ | Optional request UUID to resume a paused clarification loop |
| `image` | `file` | ❌ | Crop photo (PNG/JPG, max 5MB) |
 
---
 
## 📄 License
 
MIT © KrishiRakshak Team
 
---
 
<div align="center">
  <sub>Built with ❤️ to support India's 140 million smallholder farmers</sub>
</div>
