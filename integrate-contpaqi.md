# Integración con Base de Datos ContPAQi en MS SQL Server

## Prompt

```
ayudame a hacer las consultas a la base de datos de ms sql server de contpaqi,
aun no modifiques nada, explicame como se hará, y que partes del codigo se
modificarán, la app debe de verificar si existe el id de nota que ingresó el
usuario, si no existe notificar al cliente mediante frontend, si existe, verificar
 si esta facturada, el server contpaqi junto con la base de datos esta alojado de
manera local en el edificio de la empresa, debemos, por el momento para accesar de
 manera externa tengo configurado zerotier en un mesh. sera posible hacer pruebas
asi, o de una vez configurarmos un tunel con cloudflare, que es la solucion que
tenemos pensada para hacer las consultas a la db.
```

## Response

● Déjame explicarte cómo se implementará la integración con la base de datos de
ContPAQi en MS SQL Server.

Arquitectura de la Solución

1. Conexión a la Base de Datos

Necesitarás agregar un driver de MS SQL Server al backend:

- Librería recomendada: mssql (Tedious driver)
- Ubicación: backend/config/contpaqiDatabase.js (nuevo archivo)

2. Archivos que se Modificarán/Crearán

Backend:

Nuevos:

- backend/config/contpaqiDatabase.js - Configuración de conexión a SQL Server
- backend/models/ContpaqiNote.js - Modelo para consultas de notas
- backend/services/contpaqiService.js - Lógica de negocio para validación

Modificados:

- backend/controllers/invoiceController.js - Agregar validación antes de generar
  factura
- backend/.env - Agregar credenciales de SQL Server
- backend/package.json - Agregar dependencia mssql

Frontend:

Modificados:

- frontend/src/pages/InvoiceGenerator.jsx - Mejorar manejo de errores de
  validación
- Posiblemente frontend/src/components/ui/ - Componentes para mostrar estado de
  validación

3. Variables de Entorno Necesarias

### ContPAQi SQL Server

CONTPAQI_DB_SERVER=<IP_ZEROTIER o tunel_cloudflare>
CONTPAQI_DB_PORT=1433
CONTPAQI_DB_DATABASE=<nombre_db_contpaqi>
CONTPAQI_DB_USER=<usuario_sql>
CONTPAQI_DB_PASSWORD=<password_sql>
CONTPAQI_DB_ENCRYPT=true
CONTPAQI_DB_TRUST_CERT=true

4. Flujo de Validación

Usuario ingresa ID de nota
↓
Frontend → POST /invoices/validate-note
↓
Backend valida contra SQL Server ContPAQi: 1. ¿Existe la nota? → NO → Error 404 "Nota no encontrada" 2. ¿Está facturada? → SÍ → Error 400 "Nota ya facturada" 3. ¿Es válida? → SÍ → Return 200 con datos de la nota
↓
Frontend muestra resultado
↓
Usuario genera factura (si validación exitosa)

5. Consultas SQL Necesarias

Necesito saber el esquema de tu base de datos ContPAQi, pero típicamente sería
algo como:

-- Verificar existencia
SELECT \* FROM Notas WHERE ID = @noteId

-- Verificar si está facturada
SELECT Facturada, FolioFiscal FROM Notas WHERE ID = @noteId

Sobre la Conexión (ZeroTier vs Cloudflare Tunnel)

ZeroTier (Actual)

✅ Pros:

- Ya está configurado
- Puedes hacer pruebas inmediatamente
- Menor latencia en la red mesh
- No requiere configuración adicional

❌ Contras:

- Requiere que el servidor backend también esté en la red ZeroTier
- Más complejo para escalar
- Dependencia de cliente ZeroTier

Cloudflare Tunnel (Recomendado para Producción)

✅ Pros:

- Más seguro (sin puertos expuestos)
- Fácil de escalar
- No requiere cliente en el servidor backend
- Mejor para producción

❌ Contras:

- Requiere configuración inicial
- Posible latencia adicional

Mi Recomendación

Para desarrollo/pruebas inmediatas:

1. Usa ZeroTier
2. Asegúrate que tu servidor backend tenga acceso a la red ZeroTier
3. Usa la IP de ZeroTier en CONTPAQI_DB_SERVER

Para producción:

1. Configura Cloudflare Tunnel apuntando al SQL Server
2. Actualiza CONTPAQI_DB_SERVER con el endpoint del tunnel

Estructura del código: Hazlo agnóstico - el código solo necesita la cadena de
conexión, no le importa si es ZeroTier o Cloudflare Tunnel.

Información que Necesito

Para proceder necesito saber:

1. Nombre de las tablas en ContPAQi donde están las notas
2. Nombres de columnas: ID de nota, campo que indica si está facturada, folio
   fiscal, etc.
3. ¿Tu servidor backend estará en la red ZeroTier? O accederás externamente
4. Credenciales de prueba (cuando estés listo para implementar)

¿Quieres que proceda con ZeroTier para hacer pruebas ahora, o prefieres
configurar el Cloudflare Tunnel primero?
