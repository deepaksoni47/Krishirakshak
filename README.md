# KrishiRakshak AI — Climate-Adaptive Multi-Agent Farming Advisor

KrishiRakshak AI is an advanced, production-ready agricultural advisory system designed to support **United Nations Sustainable Development Goal 2 (Zero Hunger)** by protecting crop yields, reducing risk exposure, recommending weather-aware treatments, and suggesting government support programs.

---

## 🌾 Project Overview & SDG 2 Alignment

Agriculture is facing unprecedented volatility from climate shifts and localized crop disease outbreaks. Smallholder farmers often lack the combined pathology diagnosis, meteorological foresight, and financial scheme access needed to adapt.

KrishiRakshak AI coordinates a dedicated multi-agent ecosystem to solve this problem:
1. **UN SDG 2 (Zero Hunger)**: By diagnosing crop diseases early and offering targeted treatments, it directly prevents crop yield failure and supports food security.
2. **Climate-Adaptive Interventions**: Integrating real-time weather analytics keeps spraying decisions safe and schedules effective.
3. **Financial Inclusion**: RAG-powered government scheme matching ensures farmers access available support, insurance, and interest subsidies during critical agricultural stress.

---

## 🛠 Tech Stack

### Backend
- **FastAPI**: Fast, asynchronous, OpenAPI-compliant Python web framework.
- **LangGraph**: Multi-agent state containers and conditional routing orchestration.
- **LangChain & LangChain Community**: Integration layers for AI nodes and TF-IDF RAG components.
- **FAISS (Local Cosine Store)**: High-performance vector database used to index and search 11 complex government scheme documents.
- **Scikit-Learn**: Vector representation extraction (TF-IDF) enabling 100% offline, localized search.
- **Pydantic**: JSON request-response serialization schemas.

### Frontend
- **Next.js 15 (React 19)**: React framework with App Router, utilizing typescript.
- **TailwindCSS**: Premium responsive glassmorphic interfaces.
- **Lucide Icons**: High-fidelity iconography representing farming parameters.

---

## 📐 Architecture Diagrams

### 🧑‍🌾 Farmer View (Intuitive Crop Assistance Flow)
```
[ Farmer Input Form ] ➔ [ Crop Image Check ] ➔ [ Local Weather Lookup ] ➔ [ Risk Assessment ] ➔ [ Action Recommendations ] ➔ [ Government Support ]
```

### 💻 Developer View (LangGraph Multi-Agent DAG Topology)
```
                                 [ Supervisor Agent (Router) ]
                                         /            \
                                        v              v
                           [ Disease Agent ]     [ Advisory Agent ]
                                  |                     |
                                  v                     |
                         [ Weather Agent ]              |
                                  |                     |
                                  v                     |
                      [ Risk Assessment Agent ]         |
                             /          \               |
                            v            v              |
            [ Emergency Agent ]       [ Monitoring Agent ]
                            \            /              |
                             v          v               |
                           [ Treatment Agent ]          |
                                  |                     |
                                  v                     |
                        [ Scheme Advisor Agent ]        |
                                  \                    /
                                   v                  v
                                        [ END ]
```

---

## 🤖 Multi-Agent Node Architecture

1. **Supervisor Agent**: Parses user queries, maps coordinates, and routes requests to the correct subsystem.
2. **Disease Agent**: Uses visual inputs to diagnose plant pathology vectors and list visible leaf symptoms.
3. **Advisory Agent**: Handles conversational general gardening, sowing timelines, and general queries.
4. **Weather Agent**: Gathers local humidity, rain probability, and temperature metrics.
5. **Risk Assessment Agent**: Computes a unified 0-100 seasonal risk index by evaluating disease threat and weather anomalies.
6. **Emergency Agent**: Instantly triggered when crop risk score is $\ge 70$, generating critical warnings.
7. **Monitoring Agent**: Handles low-medium risk states, delivering standard crop protection directives.
8. **Treatment Agent**: Creates cost-aware treatment logs, chemical recipes, and action timelines.
9. **Scheme Advisor Agent**: Utilizes TF-IDF FAISS RAG to query 11 distinct scheme documents and present personalized insurance and credit subsidies.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup
1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # Linux/macOS:
   source .venv/bin/activate
   ```
3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environmental variables in `.env`:
   ```env
   GEMINI_API_KEY="your_api_key"
   OPENWEATHER_API_KEY="your_api_key"
   ```
5. Launch the FastAPI server:
   ```bash
   uvicorn backend.main:app --reload --port 8000
   ```

### Frontend Setup
1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
4. Access the web interface at `http://localhost:3000`.
5. Access the administrative developer debug view at `http://localhost:3000/debug` (development mode only).

---

## 🚀 Deployment Instructions

### Frontend (Vercel)
1. Import your repository into **Vercel**.
2. Configure build settings:
   - Framework Preset: `Next.js`
   - Root Directory: `frontend`
3. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL` pointing to your deployed backend URL.
4. Click **Deploy**.

### Backend (Render)
1. Create a new **Web Service** on Render.
2. Link your Git repository.
3. Configure build settings:
   - Runtime: `Python`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `OPENWEATHER_API_KEY`
5. Click **Deploy**.

---

## 🔮 Future Scope
- **Offline Edge Inference**: Deploy lightweight quantized classification networks on-device for areas with zero connectivity.
- **Multilingual Voice Queries**: Support regional languages through automated speech-to-text translators for pre-literate farmers.
- **Market Intelligence Integration**: Connect treatment recovery estimates directly with market price indices to optimize harvest profits.
