# SwatchX Fleet Expense Tracker - Project Instructions

## Purpose of the App
- Fleet owner manages two companies: Swatch and SWS
- Track expenses for each company separately
- After login: select company → fill/view/edit/delete expense forms
- Both companies use same trucks, trailers, business units, and fuel stations

## Tech Stack
### Frontend
- React (Vite), Mantine (UI library), React Router, @mantine/form
- Functional components with hooks only
- All UI uses Mantine components; no raw HTML or inline styles
- Consistent styling via Mantine props (padding, spacing, shadow, radius, responsive)

### Backend
- FastAPI, SQLite, SQLAlchemy ORM, Pydantic schemas
- JWT authentication, bcrypt password hashing
- RESTful API with proper HTTP methods and status codes
- Modular routers (auth, expenses, management)

## User Flow
1. Login/signup
2. Homepage: select company (Swatch or SWS)
3. Dashboard for selected company
4. Navigate to expense forms, tables, or management pages

## Expense Categories & Fields
Each company has same categories:

- **Truck** – date, business unit (dropdown), truck number (dropdown), repair description, cost (USD)
- **Trailer** – date, business unit (dropdown), trailer number (dropdown), repair description, cost (USD)
- **DMV** – date, description, cost (USD)
- **Parts** – date, description, cost (USD)
- **Phone Tracker** – date, description, cost (USD)
- **Other Expenses** – date, description, cost (USD)
- **Toll** – date, cost (USD)
- **Office Supplies** – date, description, cost (USD)
- **Fuel (Diesel)** – date, fuel station (dropdown), gallons, cost (USD)
- **DEF** – date, cost (USD)

## Management Data
Owner can create/edit/delete:
- Trucks
- Trailers
- Business units
- Fuel stations

## Pages Structure
- `/home` → company selection
- `/dashboard` → company dashboard with summary cards, recent expenses, quick links
- `/forms/:category` → add expense for selected category
- `/tables/:category` → view/edit/delete expenses per category
- `/management/:type` → manage trucks, trailers, business units, fuel stations

## Table Features
- Edit/delete expenses
- Filter by keyword and date range
- Sort columns ascending/descending
- Show total cost in USD

## Implementation Requirements
- Modular, clean code
- Mantine components for all UI
- Responsive layouts, no inline CSS
- Follow existing folder structure (pages, components, hooks)
- Store selected company in frontend state
- Commit each step to Git with descriptive messages
