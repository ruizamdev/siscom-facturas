# SISCOM Facturas - MVP

## 🎯 LAS 3 PÁGINAS QUE SÍ IMPORTAN:

1. /login

Login simple (email + password)
Si es usuario nuevo → botón "Crear cuenta"
Si es primera vez logueado → redirect a /onboarding
Si ya tiene datos → redirect a /dashboard

2. /onboarding (solo primera vez)

Formulario de datos fiscales (RFC, razón social, domicilio fiscal)
"Guardar y continuar" → redirect a /dashboard
Página de "bienvenido, ya estás listo para facturar"

3. /dashboard

Lista de facturas generadas (tabla simple)
Botón gigante "CREAR NUEVA FACTURA"
Modal/sección para crear factura:

Input: ID de nota ContPAQi
Preview de datos
Botón "GENERAR FACTURA"
Link de descarga cuando esté lista

## 🚀 LOS 5 ENDPOINTS SAGRADOS:

POST /auth/login - Login y devuelve JWT
POST /auth/register - Registro + datos fiscales
GET /invoices - Lista facturas del usuario
POST /invoices/validate-note - Valida ID de nota ContPAQi
POST /invoices/generate - Genera factura + PDF/XML + Facturama

Bonus endpoint: 6. GET /invoices/download/:id - Descarga PDF/XML
SQLite con 2 tablas:

users (id, email, password, rfc, razon_social, domicilio)
invoices (id, user_id, note_id, status, pdf_path, xml_path, created_at)

## 🛠️ STACK TECNOLÓGICO:

- Frontend: React + Tailwind CSS + Vite
- Backend: Node.js + Express + SQLite
