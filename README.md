# SwatchX

A full-stack web application built with React (Vite) and FastAPI.

## Tech Stack

### Frontend
- React (Vite)
- Mantine UI Library
- React Router
- TypeScript

### Backend  
- FastAPI (Python 3.11+)
- SQLAlchemy ORM
- SQLite Database
- Pydantic Schemas
- JWT Authentication
- Passlib with bcrypt

## Project Structure
```
SwatchX/
├── frontend/          # React + Vite + Mantine frontend
├── backend/           # FastAPI backend
└── README.md
```

## Getting Started

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
