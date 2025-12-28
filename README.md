# Global Mobility Intelligence Platform

AI-powered immigration pathway analysis using multi-agent collaboration with RAG grounding.

## 🚀 Overview

This platform uses CrewAI agents to analyze user profiles and recommend optimal immigration pathways across 10+ countries. Each agent specializes in a specific task, collaborating through an orchestration layer to provide comprehensive, cited recommendations.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js 14)                    │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│   │ Profile Form │  │ Path Stepper │  │ Agent Reasoning View │  │
│   └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Backend (FastAPI + CrewAI)                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    Orchestrator Layer                      │  │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │  │
│  │  │   Crew.py   │ │  Workflows  │ │  Handoff Manager    │  │  │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      Agent Layer                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │   Profile    │  │    Path      │  │      Risk       │  │  │
│  │  │   Analyst    │→ │  Generator   │→ │    Assessor     │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │                                              │             │  │
│  │                           ┌──────────────────┘             │  │
│  │                           ▼                                │  │
│  │                  ┌─────────────────┐                       │  │
│  │                  │ Recommendation  │                       │  │
│  │                  │  Synthesizer    │                       │  │
│  │                  └─────────────────┘                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                      RAG Layer                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │  Embeddings  │  │ Vector Store │  │    Retriever    │  │  │
│  │  │   (OpenAI)   │  │  (Pinecone)  │  │                 │  │  │
│  │  └──────────────┘  └──────────────┘  └─────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## 🤖 AI Agents

1. **Profile Analyst** - Evaluates education, experience, language, financial readiness
2. **Path Generator** - Creates 2-3 mobility routes including stepping stones
3. **Risk Assessor** - Identifies blockers, calculates approval probability
4. **Recommendation Synthesizer** - Ranks paths, creates action plan with citations

## 📁 Project Structure

```
VISA-HACKTHAON/
├── backend/
│   ├── src/
│   │   ├── agents/           # CrewAI agent definitions
│   │   │   ├── profile_analyst/
│   │   │   ├── path_generator/
│   │   │   ├── risk_assessor/
│   │   │   └── recommendation_synthesizer/
│   │   ├── orchestrator/     # Agent coordination
│   │   ├── rag/              # RAG components
│   │   ├── schemas/          # Pydantic models
│   │   ├── services/         # Business logic
│   │   ├── api/              # FastAPI routes
│   │   └── core/             # Config, constants
│   ├── data/                 # Mock data for RAG
│   │   ├── countries/        # Country JSON files
│   │   └── policies/         # Policy documents
│   ├── main.py
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/              # Next.js App Router
    │   ├── components/
    │   │   ├── ui/           # shadcn components
    │   │   ├── forms/        # Profile form
    │   │   ├── analysis/     # Agent reasoning view
    │   │   ├── results/      # Results display
    │   │   └── visualization/# Path stepper, gauges
    │   └── lib/
    │       ├── api/          # API client
    │       └── store/        # Zustand state
    ├── package.json
    └── tailwind.config.ts
```

## 🛠️ Tech Stack

### Backend
- **Python 3.11+**
- **FastAPI** - Async API framework
- **CrewAI** - Multi-agent orchestration
- **LangChain** - LLM integration
- **OpenAI GPT-4** - Language model
- **Pinecone** - Vector database for RAG

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Framer Motion** - Animations
- **Zustand** - State management

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenAI API key
- Pinecone API key (optional for demo)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Set environment variables
copy .env.example .env
# Edit .env with your API keys

# Run the server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Visit http://localhost:3000 to use the application.

## 🔑 Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX_NAME=mobility-intelligence
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Supported Countries

| Country | Visa Types |
|---------|-----------|
| 🇨🇦 Canada | Express Entry, PNP, Work Permit, Study |
| 🇩🇪 Germany | EU Blue Card, Skilled Worker, Job Seeker |
| 🇺🇸 USA | H-1B, L-1, O-1, F-1 |
| 🇬🇧 UK | Skilled Worker, Global Talent, HPI |
| 🇦🇺 Australia | Skilled 189/190, 482, Student |
| 🇸🇬 Singapore | EP, S Pass, Tech.Pass |
| 🇳🇱 Netherlands | Kennismigrant, EU Blue Card |
| 🇦🇪 UAE | Employment, Golden Visa, Green Visa |
| 🇵🇹 Portugal | Tech Visa, D7, Digital Nomad |
| 🇯🇵 Japan | HSP, Engineer/Specialist |

## 🎯 Features

- **Multi-Agent Reasoning** - 4 specialized agents collaborate
- **RAG-Grounded** - Responses cite official policy documents
- **Stepping Stone Paths** - Strategic multi-country routes
- **Risk Assessment** - Approval probability calculation
- **Action Plans** - Prioritized next steps
- **Beautiful UI** - Premium animations and visualizations

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/analysis/analyze` | Full analysis (requires OpenAI) |
| POST | `/api/v1/analysis/demo` | Demo with mock response |
| GET | `/api/v1/countries` | List all countries |
| GET | `/api/v1/countries/{code}` | Country details |
| GET | `/api/v1/health` | Health check |

## 🏆 Hackathon Notes

This project was built for a 2-day hackathon. Key decisions:
- Mock data instead of real-time scraping
- Demo endpoint for testing without API costs
- Simulated agent progress animation
- Focus on UX and visualization

## 📄 License

MIT License - Built for educational purposes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

Built with ❤️ for the Global Mobility Hackathon 2024
