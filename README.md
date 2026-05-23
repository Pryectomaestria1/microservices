# Udemy Clone - Backend Microservicios 🚀

Backend de un clon de Udemy construido con **NestJS**, **gRPC**, **RabbitMQ**, **PostgreSQL**, **Prisma** y **MinIO**. El repositorio ya soporta un flujo principal de ejecución local con **Docker Compose** para levantar la infraestructura y los microservicios activos con un solo comando.

## Quick start

### 1. Crear `.env`

```bash
cp .env.example .env
```

Completa al menos estas variables de Auth0:

```env
AUTH0_ISSUER_URL=https://tu-tenant.us.auth0.com/
AUTH0_AUDIENCE=https://api.udemyclone.local
```

### 2. Levantar el stack completo

```bash
docker compose up --build
```

### 3. Verificar que arrancó

```bash
curl http://localhost:3000/v1/health
curl http://localhost:3000/v1/courses
```

Resultados esperados:
- `/v1/health` → `{"status":"ok"}`
- `/v1/courses` → `[]` o lista de cursos

---

## 🏗 Estructura del proyecto

El repositorio está organizado como un monorepo:

| Carpeta | Puerto | Responsabilidad |
|---|---:|---|
| `api-gateway/` | 3000 | Puerta REST → gRPC, validación JWT con Auth0, uploads locales |
| `grpc-contracts/` | — | Contratos protobuf (`.proto`) |
| `user-service/` | 50051 | Validación de token, perfiles y elevación a instructor |
| `catalog-service/` | 50052 | Cursos, módulos, lecciones y recursos (Prisma + PostgreSQL) |
| `media-service/` | 50053 | Presigned URLs y flujo de medios (MinIO/S3 compatible) |
| `enrollment-service/` | 50054 | Inscripciones y progreso (Prisma + PostgreSQL + RabbitMQ) |
| `sales-service/` | 50055 | Checkout simulado y eventos de compra (Prisma + RabbitMQ) |

---

## 🐳 Stack Docker actual

`docker-compose.yml` levanta tanto infraestructura como servicios activos.

### Infraestructura
- **PostgreSQL** (`5433` externo)
- **RabbitMQ** (`5672`, `15672`)
- **MinIO** (`9000`, `9001`)
- **MongoDB** (`27017`) — hoy no es parte crítica del flujo principal validado
- **pgAdmin** (`5050`)
- **mongo-express** (`8082`)

### Servicios de aplicación
- `db-init` — bootstrap de Prisma
- `user-service`
- `catalog-service`
- `media-service`
- `enrollment-service`
- `sales-service`
- `api-gateway`

### Estrategia de base de datos

Los servicios Prisma comparten la misma base `udemy_db`, pero usan **schemas separados** para no pisarse entre sí:

- `catalog`
- `enrollment`
- `sales`

Esto se configura vía `DATABASE_URL` con `?schema=...`.

---

## 🔐 Variables importantes

Las variables base están documentadas en `.env.example`.

Las más importantes para el arranque local son:

| Variable | Uso |
|---|---|
| `AUTH0_ISSUER_URL` | Issuer base del tenant Auth0 |
| `AUTH0_AUDIENCE` | Audience/Identifier de la API en Auth0 |
| `CATALOG_DATABASE_URL` | URL Prisma para schema `catalog` |
| `ENROLLMENT_DATABASE_URL` | URL Prisma para schema `enrollment` |
| `SALES_DATABASE_URL` | URL Prisma para schema `sales` |
| `PUBLIC_URL` | URL pública usada para construir links de uploads |

---

## ✅ Smoke tests manuales

### Públicos

```bash
curl http://localhost:3000/v1/health
curl http://localhost:3000/v1/courses
```

### Autenticados

Con un `access_token` válido de Auth0:

```bash
curl -X POST http://localhost:3000/v1/users/become-instructor \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/v1/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Luis Demo",
    "avatarUrl": "https://example.com/avatar.png"
  }'

curl -X POST http://localhost:3000/v1/courses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Curso Docker Test",
    "description": "Probando stack dockerizado",
    "price": 19.99
  }'
```

### Flujo base de alumno

Con el mismo `access_token` y un curso ya creado:

```bash
export BASE_URL="http://localhost:3000/v1"
export USER_ID="auth0|TU_USER_ID"
export COURSE_ID="ID_DEL_CURSO"
```

#### 1. Simular checkout

```bash
curl -X POST "$BASE_URL/sales/checkout" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\": \"$USER_ID\",
    \"courseIds\": [\"$COURSE_ID\"],
    \"amount\": 19.99,
    \"cardNumber\": \"4242424242424242\",
    \"expiryDate\": \"12/30\",
    \"cvv\": \"123\",
    \"cardHolder\": \"Alumno Demo\"
  }"
```

Respuesta esperada:

```json
{"success":true,"message":"Pago exitoso e inscripciones confirmadas en lote."}
```

#### 2. Ver cursos inscritos

```bash
curl "$BASE_URL/enrollments/my-courses/$USER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

Respuesta esperada: el curso comprado debe aparecer dentro de `enrollments`.

---

## 🛠 Desarrollo manual sin Docker

Sigue siendo posible levantar servicios manualmente con `npm run start:dev`, pero ahora es el camino secundario.

### Bootstrap manual mínimo

```bash
# Catalog Service
cd catalog-service
npm install
npx prisma db push

# Enrollment Service
cd ../enrollment-service
npm install
npx prisma db push

# Sales Service
cd ../sales-service
npm install
npx prisma db push
```

Después puedes levantar cada servicio por separado si necesitás debugging fino.

---

## 📦 Regenerar contratos gRPC (opcional)

Si modificas archivos `.proto` dentro de `grpc-contracts/`:

```bash
cd grpc-contracts
npm install
npm run generate
```

---

## 🗄️ Notas sobre almacenamiento

Actualmente, las portadas de cursos y los videos de lecciones se guardan en `api-gateway/uploads/`. Al mismo tiempo, `media-service` ya está preparado para trabajar con almacenamiento compatible con S3 mediante MinIO.

### Para migrar a AWS S3 real
1. Cambiar credenciales/config del cliente S3.
2. Remover el `endpoint` local si apuntás a AWS real.
3. Mover el flujo de upload del `api-gateway` hacia `media-service` para evitar persistencia local en disco.
