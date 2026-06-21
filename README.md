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
> **The solution**: A coordinated swarm of 9 specialized AI agents that works together to diagnose, advise, and protect — in seconds.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 🔬 **AI Crop Disease Diagnosis** | Upload a photo — Gemini 2.5 Flash Vision identifies the disease, confidence score, and severity |
| 🌦️ **Real-Time Weather Risk** | Live OpenWeatherMap data feeds into a unified 0–100 risk index |
| 🚨 **Emergency Alerts** | Automatic critical warnings when risk score ≥ 70 |
| 💊 **Treatment Plans** | Cost-aware chemical recipes, action timelines, and recovery estimates |
| 🏛️ **Government Scheme Matching** | TF-IDF FAISS RAG across 11 scheme documents (PMFBY, KCC, PM-KISAN, and more) |
| 🗺️ **Location-Aware** | Tailored advice based on farmer's district/state |
| ⚡ **Sub-5s Response** | Parallel agent execution via LangGraph DAG |

---

## 🏗️ Architecture

### Farmer Flow
```
Farmer Input (crop + image + location)
        ↓
   Supervisor Agent  ──────────────────────► Advisory Agent (general queries)
        ↓ (disease route)                            ↓
   Disease Agent (Gemini Vision)                    END
        ↓
   Weather Agent (OpenWeatherMap)
        ↓
   Risk Assessment Agent (0–100 score)
        ↓                ↓
  [score ≥ 70]      [score < 70]
  Emergency Agent   Monitoring Agent
        ↓                ↓
        └────────────────┘
               ↓
        Treatment Agent
               ↓
      Scheme Advisor Agent (RAG)
               ↓
             END
```

### The 9 Agents

| # | Agent | Role |
|---|---|---|
| 1 | **Supervisor** | Parses query, detects intent, routes to correct pipeline |
| 2 | **Disease Agent** | Gemini Vision analysis — disease name, confidence, symptoms |
| 3 | **Advisory Agent** | Handles general farming Q&A (sowing, fertilizer, seasons) |
| 4 | **Weather Agent** | Fetches humidity, temperature, rain probability |
| 5 | **Risk Assessment** | Computes composite risk score from disease + weather signals |
| 6 | **Emergency Agent** | Critical warnings and emergency actions (risk ≥ 70) |
| 7 | **Monitoring Agent** | Standard protection directives (risk < 70) |
| 8 | **Treatment Agent** | Chemical treatments, organic alternatives, action timeline, cost |
| 9 | **Scheme Advisor** | RAG-powered match against 11 Indian government schemes |

### Government Schemes Indexed (RAG)

`PMFBY` · `PM-KISAN` · `KCC` · `PMKSY` · `PKVY` · `RKVY` · `NFSM` · `AIF` · `FPO` · `Fertilizer Subsidy` · `Soil Health Card`

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async REST API, OpenAPI docs auto-generated |
| **LangGraph** | Multi-agent state machine with conditional DAG routing |
| **LangChain** | AI integration layer for all agent nodes |
| **Google Gemini 2.5 Flash** | Vision model for crop disease diagnosis |
| **FAISS + Scikit-Learn (TF-IDF)** | Offline vector search for government scheme RAG |
| **OpenWeatherMap API** | Real-time weather data |
| **Pydantic v2** | Type-safe request/response schemas |
| **python-dotenv** | Environment configuration |

### Frontend
| Technology | Purpose |
|---|---|
| **Next.js 16 + React 19** | App Router, TypeScript, SSR |
| **TailwindCSS v4** | Utility-first responsive styling |
| **shadcn/ui** | Accessible component primitives |
| **Lucide React** | Icon system |

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
Debug view (dev only): **http://localhost:3000/debug**

---

## ☁️ Deployment (Free)

Deploy the entire stack for **$0/month** using Render + Vercel.

```
Vercel (Next.js) ──HTTPS──► Render.com (FastAPI) ──► Gemini + OpenWeatherMap
```

### Backend → Render.com

1. Sign up at [render.com](https://render.com) with GitHub
2. **New → Web Service** → connect your repository
3. Use these settings:

   | Setting | Value |
   |---|---|
   | Runtime | `Python 3` |
   | Build Command | `pip install -r backend/requirements.txt` |
   | Start Command | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
   | Instance Type | `Free` |

4. Add environment variables in the Render dashboard:
   - `GEMINI_API_KEY`
   - `OPENWEATHER_API_KEY`

5. Copy your backend URL: `https://krishirakshak-backend.onrender.com`

> **Note**: Render free tier sleeps after 15 min of inactivity. Use [UptimeRobot](https://uptimerobot.com) (free) to ping it every 5 min to keep it awake.

### Frontend → Vercel

1. Sign up at [vercel.com](https://vercel.com) with GitHub
2. **Add New → Project** → import your repository
3. Set **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://krishirakshak-backend.onrender.com`
5. Click **Deploy**

Your app is live in ~2 minutes. 🎉

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
| `image` | `file` | ❌ | Crop photo (PNG/JPG, max 5MB) |

**Example response:**
```json
{
  "route": "disease",
  "workflow_path": ["Supervisor", "Disease Agent", "Weather Agent", "Risk Assessment Agent", "Emergency Agent", "Treatment Agent", "Scheme Advisor Agent"],
  "disease_name": "Late Blight",
  "confidence": 91,
  "severity": "High",
  "symptoms": ["dark water-soaked spots", "white fuzzy growth on leaf undersides"],
  "recommendation": "Apply chlorothalonil immediately",
  "temperature": 28.4,
  "humidity": 82.0,
  "rain_probability": 0.7,
  "risk_score": 84,
  "risk_level": "High",
  "alert": "⚠️ Critical Risk",
  "treatment_plan": { ... },
  "eligible_schemes": ["PMFBY", "KCC"],
  "scheme_recommendations": [ ... ]
}
```

### `GET /`

Health check. Returns `{"message": "KrishiRakshak AI Backend Running"}`.

---

## 📁 Project Structure

```
krishirakshak/
├── backend/
│   ├── agents/              # 9 specialized LangGraph agent nodes
│   │   ├── supervisor.py
│   │   ├── disease_agent.py
│   │   ├── weather_agent.py
│   │   ├── risk_assessment_agent.py
│   │   ├── emergency_agent.py
│   │   ├── monitoring_agent.py
│   │   ├── treatment_agent.py
│   │   ├── scheme_advisor_agent.py
│   │   └── advisory_agent.py
│   ├── graph/
│   │   ├── state.py         # Shared AgentState TypedDict
│   │   └── workflow.py      # LangGraph DAG definition & compilation
│   ├── tools/
│   │   ├── gemini_vision.py # Gemini 2.5 Flash image analysis
│   │   └── weather_service.py
│   ├── rag/
│   │   ├── loader.py        # Scheme document loader
│   │   ├── vectorstore.py   # FAISS TF-IDF index builder
│   │   └── retriever.py     # Similarity search
│   ├── data/
│   │   ├── schemes/         # 11 government scheme .txt documents
│   │   └── treatments.json  # Disease treatment database
│   ├── schemas/
│   │   └── request.py       # Pydantic request/response models
│   ├── vectorstore/
│   │   └── schemes_store.pkl # Pre-built FAISS index
│   ├── main.py              # FastAPI app entry point
│   └── requirements.txt
├── frontend/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # UI components
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── Procfile                 # Render.com start command
├── render.yaml              # Render IaC config
├── .env.example             # Environment variable template
└── README.md
```

---

## 🔮 Roadmap

- [ ] **Multilingual Support** — Voice queries in Hindi, Telugu, Tamil for pre-literate farmers
- [ ] **Offline Edge Inference** — Quantized on-device models for zero-connectivity areas
- [ ] **Market Intelligence** — Connect treatment timelines with mandi price indices
- [ ] **WhatsApp Integration** — Reach farmers on the platform they already use
- [ ] **Historical Yield Tracking** — Season-over-season comparison and trend analysis

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

---

## 📄 License

MIT © KrishiRakshak Team

---

<div align="center">
  <sub>Built with ❤️ to support India's 140 million smallholder farmers</sub>
</div>
