# 🏥 Sabhal — AI Healthcare App

> Hackathon-ready AI healthcare platform powered by Gemini AI, Supabase, React, and FastAPI.

---

## 🗂 Project Structure

```
sabhal/
├── frontend/          # React + Vite + Tailwind
├── backend/           # FastAPI + Gemini AI
└── supabase/          # SQL schema
```

---

## ⚡ Quick Start

### 1. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Copy your **Project URL** and **anon key** from Settings → API

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Create .env from example
cp .env.example .env
# Edit .env and add your keys:
#   GEMINI_API_KEY=...
#   SUPABASE_URL=...
#   SUPABASE_SERVICE_KEY=...  ← use the service_role key

# Run the server
python main.py
# → Running at http://localhost:8000
```

**Get your Gemini API key:** [aistudio.google.com](https://aistudio.google.com/app/apikey)

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env from example
cp .env.example .env
# Edit .env and add:
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_ANON_KEY=...  ← use the anon key
#   VITE_API_URL=http://localhost:8000

# Run the dev server
npm run dev
# → Running at http://localhost:5173
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `GEMINI_API_KEY` | Google Gemini API key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase **service_role** secret key |
| `PORT` | Server port (default: 8000) |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase **anon** public key |
| `VITE_API_URL` | Backend URL (default: http://localhost:8000) |

---

## 🧭 Pages

| Page | Route | Description |
|---|---|---|
| Auth | `/` | Login / Register with role selection |
| Patient Dashboard | `/` (patient role) | Submit symptoms, get AI analysis |
| Doctor Dashboard | `/` (doctor role) | Review all cases by urgency |

---

## 🤖 AI Flow

```
Patient fills form
      ↓
Frontend → POST /api/analyze → FastAPI
      ↓
FastAPI builds prompt → Gemini 1.5 Flash
      ↓
Gemini returns: Summary + Urgency (HIGH/MEDIUM/LOW) + Recommendations
      ↓
Patient reviews → Submits case → Saved to Supabase
      ↓
Doctor sees case card with urgency badge → Updates status
```

---

## 🎨 Design System

- **Font:** Syne (headings) + DM Sans (body)
- **Theme:** Blue/Cyan (`cyan-500`, `sky-500`)
- **Cards:** Glassmorphism — `bg-white/5 backdrop-blur-md border border-white/10`
- **Dark mode:** Default (toggle available)

---

## 📦 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | FastAPI, Python 3.11+ |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| AI | Google Gemini 1.5 Flash |

---
