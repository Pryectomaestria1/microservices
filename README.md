# Udemy Clone - Backend Microservicios 🚀

Este repositorio contiene la arquitectura de microservicios para el clon de Udemy, construida con NestJS, gRPC, RabbitMQ y PostgreSQL. También incluye los contratos de gRPC (`grpc-contracts`).

## 🏗 Estructura del Proyecto

El repositorio está organizado como un monorepo:
- **`api-gateway/`** (Puerto REST 3000): Puerta de enlace que actúa como puente REST → gRPC, maneja autenticación JWT (Auth0) y subida de archivos (portadas y videos de lecciones).
- **`grpc-contracts/`**: Definición de contratos protobuf (`.proto`) y código TypeScript autogenerado.
- **`user-service/`** (gRPC 50051): Servicio de autenticación y perfiles de usuario.
- **`catalog-service/`** (gRPC 50052): Gestión de cursos, módulos, lecciones y recursos (PostgreSQL con Prisma).
- **`media-service/`** (gRPC 50053): Subida de videos y assets a MinIO (compatible con AWS S3).
- **`enrollment-service/`** (gRPC 50054 + RabbitMQ): Inscripción de estudiantes y progreso de lecciones (PostgreSQL con Prisma).
- **`sales-service/`** (gRPC 50055): Transacciones de compras simuladas y emisor de eventos a RabbitMQ (PostgreSQL con Prisma).

## 🐳 Infraestructura (Docker)

El archivo `docker-compose.yml` en la raíz define e inicia la infraestructura base:
- **PostgreSQL** (Puerto 5433 externo): Base de datos relacional para catálogo, ventas e inscripciones.
- **MongoDB** (Puerto 27017): Base de datos para el servicio de reseñas.
- **RabbitMQ** (Puertos 5672, 15672): Message broker para sincronización de inscripciones asíncronas.
- **MinIO** (Puertos 9000, 9001): Almacenamiento S3 local compatible para videos.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Iniciar la Infraestructura Base
Asegúrate de tener Docker corriendo y ejecuta:
```bash
docker-compose up -d
```

### 2. Configurar Base de Datos y Generar Cliente de Prisma
Para cada microservicio con persistencia en PostgreSQL, debes instalar las dependencias e inicializar Prisma:

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

### 3. Ejecutar los Microservicios
En terminales separadas, inicia cada servicio:

```bash
# API Gateway
cd api-gateway
npm install
npm run start:dev

# User Service
cd ../user-service && npm install && npm run start:dev

# Catalog Service
cd ../catalog-service && npm run start:dev

# Media Service
cd ../media-service && npm install && npm run start:dev

# Enrollment Service
cd ../enrollment-service && npm run start:dev

# Sales Service
cd ../sales-service && npm run start:dev
```

### 4. Generar Tipos de gRPC (Opcional)
Si modificas algún archivo `.proto` dentro de `grpc-contracts/`, puedes regenerar los archivos TypeScript asociados ejecutando:
```bash
cd grpc-contracts
npm install
npm run generate
```

---

## 🗄️ Notas sobre el Almacenamiento (MinIO a AWS S3)

Actualmente, el sistema guarda las portadas de los cursos y los videos de las lecciones en la carpeta local `uploads/` del `api-gateway`. Sin embargo, el microservicio `media-service` está completamente estructurado para usar almacenamiento compatible con S3.

**Para migrar a AWS S3 real (Dificultad: 3/10):**
1. Cambia las credenciales en el archivo `.env` de `media-service` (AWS access keys, bucket, region).
2. Remueve la propiedad `endpoint` de la configuración de `S3Client` en `media-service/src/media.service.ts` para que se conecte directamente al cloud de AWS en lugar de localhost:9000.
3. Modifica los controladores en `api-gateway` para subir el stream a través del `media-service` usando sus métodos gRPC en lugar de escribir en el sistema de archivos local (`fs`).
