# SabHal 🏥

An AI-powered healthcare platform that connects patients, doctors, and nurses through a unified digital system — reducing fragmented records, delayed diagnoses, and coordination gaps in healthcare.

---

## What it does

- Patients input symptoms; these are summarised into key insights for doctors
- AI suggests possible diagnoses, recommended tests, and treatment options
- Cases are prioritised by urgency (Critical → High → Moderate)
- All medical staff share a single, unified patient record in real time
- Doctors retain final decision authority — AI outputs are always labelled as suggestions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| Auth | JWT + RBAC |
| AI/ML | scikit-learn / HuggingFace |
| Deployment | Render / Railway (backend), Vercel (frontend) |

---

## Project Structure

```
/
├── backend/
│   ├── venv/          # Python virtual environment (not tracked)
│   ├── main.py        # FastAPI entry point
│   └── ...
├── frontend/
│   ├── src/
│   └── ...
├── .env               # Environment variables (not tracked)
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- Supabase account

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the root (see `.env.example`):

```
SUPABASE_URL=(https://mhcsftjvevsdvkpoanct.supabase.co)
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oY3NmdGp2ZXZzZHZrcG9hbmN0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2NTQyNSwiZXhwIjoyMDkzNzQxNDI1fQ.RrkcliD6M1nquN2OaVjZenHOw-zVeKJjT136osQDS-o
GROQ_API_KEY=AIzaSyAO6x3zv7MHMFg8vXHEszQrxOZ8c5mfFjE
```

---

## Database Tables

| Table | Description |
|---|---|
| `users` | Patients, doctors, and nurses |
| `visits` | Patient visit records with symptoms and AI summary |
| `medical_history` | Per-patient conditions and treatment status |
| `assignments` | Doctor assigned to each patient |

---



## Current Limitations (MVP)

- No real EHR integration
- Manual data entry by patient
- Limited training dataset for AI model
- No offline mode


