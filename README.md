# SISCOM Facturas

Portal de facturación automática que se integra con ContPAQi y Facturama.

## Stack Tecnológico

- **Frontend:** React + Tailwind CSS v4 + Vite
- **Backend:** Node.js + Express
- **Base de Datos:** SQLite
- **Todo en JavaScript puro** 🚀

## Desarrollo

### Instalación inicial

```bash
npm run install:all
```

### Desarrollo

```bash
npm run dev
```

### URLs de desarrollo

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## Estructura del Proyecto

```
siscom-facturas/
├── frontend/          # React app
├── backend/           # Express API
├── docs/             # Documentación
└── scripts/          # Scripts de utilidad
```

## Endpoints API

- `POST /auth/login` - Autenticación
- `POST /auth/register` - Registro de usuario
- `GET /invoices` - Lista de facturas
- `POST /invoices/validate-note` - Validar nota ContPAQi
- `POST /invoices/generate` - Generar factura

## Páginas Frontend

- `/login` - Autenticación
- `/onboarding` - Configuración inicial
- `/dashboard` - Panel principal
