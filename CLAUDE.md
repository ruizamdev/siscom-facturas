# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SISCOM Facturas is an automated invoicing portal that integrates with ContPAQi and Facturama APIs. It's a full-stack JavaScript application with a React frontend and Express.js backend using SQLite for data persistence.

**Core Functionality:**

- User authentication and fiscal data management
- ContPAQi note validation
- Automated invoice generation via Facturama API
- PDF/XML invoice file management

## Development Commands

### Initial Setup

```bash
npm run install:all    # Install dependencies for all packages
```

### Development

```bash
npm run dev            # Start both frontend and backend in development mode
npm run dev:front      # Start only frontend (port 5173)
npm run dev:back       # Start only backend (port 3000)
```

### Frontend Specific

```bash
cd frontend
npm run dev            # Development server
npm run build          # Production build
npm run lint           # ESLint check
npm run preview        # Preview production build
```

### Backend Specific

```bash
cd backend
npm run dev            # Development with tsx watch (TypeScript execution)
npm start              # Production server
```

### Production

```bash
npm run build          # Build frontend for production
npm start              # Start production backend server
```

## Architecture

### Backend (Express.js + SQLite)

- **Entry point:** `backend/server.js` - Initializes database and starts server
- **App configuration:** `backend/app.js` - Express setup, middleware, routes
- **Database:** `backend/config/database.js` - SQLite with better-sqlite3
- **Routes:**
  - `backend/routes/auth.js` - Authentication endpoints
  - `backend/routes/invoices.js` - Invoice management endpoints
- **Models:** `backend/models/` - User and Invoice data models
- **Controllers:** `backend/controllers/` - Business logic for auth and invoices
- **Middleware:** `backend/middleware/` - Auth and error handling

**Key Dependencies:**

- `better-sqlite3` for database operations
- `argon2` for password hashing
- `jsonwebtoken` for JWT authentication
- `helmet` and `cors` for security

### Frontend (React + Tailwind CSS v4)

- **Entry point:** `frontend/src/main.jsx`
- **App component:** `frontend/src/App.jsx` - Router setup
- **Pages:** `frontend/src/pages/` - Login, Onboarding, Dashboard, InvoiceGenerator
- **Components:** `frontend/src/components/ui/` - Reusable UI components
- **Hooks:** `frontend/src/hooks/` - useAuth, useToast custom hooks
- **Services:** `frontend/src/services/api.js` - API client configuration

**Key Dependencies:**

- `react-router-dom` for routing
- `@tailwindcss/vite` for Tailwind CSS v4
- Vite for build tooling

### Database Schema

**Users table:**

- Authentication data (email, password)
- Fiscal information (RFC, razón social, domicilio fiscal)

**Invoices table:**

- Links to user and ContPAQi note ID
- Status tracking and file paths (PDF/XML)
- Folio fiscal and total amount

## API Endpoints

- `POST /auth/login` - User authentication, returns JWT
- `POST /auth/register` - User registration with fiscal data
- `GET /invoices` - List user's invoices
- `POST /invoices/validate-note` - Validate ContPAQi note ID
- `POST /invoices/generate` - Generate invoice via Facturama API
- `GET /invoices/download/:id` - Download invoice PDF/XML
- `GET /health` - Health check endpoint

## Development URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Key Configuration Files

- `frontend/vite.config.js` - Vite build configuration with React and Tailwind CSS v4
- `frontend/eslint.config.js` - ESLint configuration for React with hooks
- `backend/.env` - Environment variables (not committed to git)
- Database file: `backend/siscomFacturas.db` (SQLite, auto-created)

## Project Structure

```
siscom-facturas/
├── frontend/          # React application
│   ├── src/
│   │   ├── pages/     # Main application pages
│   │   ├── components/# Reusable UI components
│   │   ├── hooks/     # Custom React hooks
│   │   └── services/  # API and external services
├── backend/           # Express.js API
│   ├── routes/        # API route definitions
│   ├── controllers/   # Business logic
│   ├── models/        # Data models
│   ├── middleware/    # Express middleware
│   └── config/        # Database and app configuration
├── docs/             # Project documentation
└── scripts/          # Utility scripts
```

## Important Notes

- The project uses pure JavaScript (no TypeScript) across both frontend and backend
- Backend uses CommonJS modules, frontend uses ES modules
- SQLite database is file-based and auto-initializes on first run
- Environment variables in `backend/.env` are required for Facturama API integration
- The application follows a simple 3-page MVP structure: Login → Onboarding → Dashboard
