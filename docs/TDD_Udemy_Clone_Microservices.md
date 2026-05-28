# Udemy Clone - Diseño Técnico

---

## Resumen ejecutivo

Este documento describe el contenido del backend en microservicios para el proyecto Udemy Clone.

- El flujo principal corre con `api-gateway` + 5 microservicios gRPC (`user`, `catalog`, `media`, `enrollment`, `sales`).
- Hay soporte de mensajería asíncrona con RabbitMQ para `course.purchased`.

---

## Alcance de esta TDD

### Incluye

- Arquitectura y contratos del path principal.
- Inventario de servicios reales presentes en el repo.
- Estado actual de persistencia, autenticación/autorización, storage y Docker Compose.
- Flujos implementados (síncronos y asíncronos) con límites explícitos.

---

## 1) Arquitectura

## Camino principal de ejecución

1. Frontend consume REST en `api-gateway`.
2. `api-gateway` valida JWT por JWKS (Auth0) y aplica guards.
3. `api-gateway` orquesta llamadas gRPC a servicios de dominio.
4. `sales-service` publica `course.purchased` en RabbitMQ.
5. `enrollment-service` consume eventos y también expone gRPC.

### Puertos gRPC del path principal (verificados)

| Servicio             | Puerto gRPC |
| -------------------- | ----------: |
| `user-service`       |     `50051` |
| `catalog-service`    |     `50052` |
| `media-service`      |     `50053` |
| `enrollment-service` |     `50054` |
| `sales-service`      |     `50055` |

---

## 2) Inventario de servicios

## 2.1 Runtime principal

| Servicio             | Transporte principal      | Rol                                                  | Persistencia real                                           |
| -------------------- | ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------- |
| `api-gateway`        | REST + cliente gRPC       | Entrada única HTTP, composición y orquestación       | N/A                                                         |
| `user-service`       | gRPC                      | Perfil/roles para demo y utilidades de usuario       | Archivos JSON (`upgraded_roles.json`, `user_profiles.json`) |
| `catalog-service`    | gRPC                      | Cursos, módulos, lecciones, recursos, ownership      | PostgreSQL (Prisma)                                         |
| `media-service`      | gRPC                      | Generación de URL prefirmada y confirmación de video | S3 compatible (MinIO/S3)                                    |
| `enrollment-service` | gRPC + RabbitMQ           | Inscripciones/progreso + consumo `course.purchased`  | PostgreSQL (Prisma)                                         |
| `sales-service`      | gRPC + RabbitMQ publisher | Simulación de checkout y emisión de eventos          | PostgreSQL (Prisma)                                         |

## 2.2 Servicios auxiliares / educativos (no path principal)

| Servicio                      | Transporte                               | Estado y uso esperado                                                                       |
| ----------------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------- |
| `review-grpc-service` | gRPC + REST                              | Demo híbrida. Usa puerto gRPC `50051` (conflicta con `user-service` si se ejecutan juntos). |

> Nota: Slice 1 cleanup removió 3 servicios demo sin uso (`course-service`, `review-service`, `db-service`). `review-grpc-service` queda deferido para un cleanup posterior de protos/legacy.

---

## 3) Persistencia y datos (estado actual)

## 3.1 PostgreSQL

- Docker Compose levanta **una sola instancia** PostgreSQL (`udemy-postgres`) con DB `udemy_db`.
- `catalog-service`, `enrollment-service` y `sales-service` usan Prisma con datasource PostgreSQL.
- Persiste roles y perfiles en archivos JSON locales:
  - `upgraded_roles.json`
  - `user_profiles.json`

## 3.3 Review stack

- Hay implementaciones paralelas para aprendizaje:
- `review-grpc-service`: expone gRPC/REST como demo aislada y queda deferido para revisión específica de cleanup/protos.
- Existe además un `schema.prisma` SQLite en `review-grpc-service` como parte de ese stack educativo deferido.

---

## 4) Autenticación y autorización

## 4.1 Validación de identidad

- `api-gateway` valida JWT con estrategia `jwks-rsa` + Passport.
- La validación de firma/issuer/audience se resuelve en gateway (stateless respecto al resto de servicios).

## 4.2 Modelo de autorización por ownership

- Endpoints sensibles usan `AuthGuard` + `OwnershipGuard`.
- `OwnershipGuard` llama a `catalogService.VerifyOwnership(...)` por gRPC.
- Se valida ownership por jerarquía de recurso (`courseId` / `moduleId` / `lessonId`).

---

## 5) Contratos gRPC relevantes

## 5.1 `catalog.proto` (estado actual)

`CatalogService` expone **13 RPCs**:

1. `CreateCourse`
2. `AddModuleToCourse`
3. `AddLessonToModule`
4. `UpdateLessonVideo`
5. `GetCoursesByIds`
6. `GetCourseInfo`
7. `ListCourses`
8. `GetCourseDetails`
9. `UpdateCourse`
10. `AddResourceToLesson`
11. `UpdateModule`
12. `UpdateLesson`
13. `VerifyOwnership`

Campos importantes incorporados en contrato actual:

- `coverImage` en `Course`/`CourseDetails`
- `position` en `Module`/`Lesson`
- `resources` en `Lesson`

## 5.2 `review.proto`

Existe contrato `grpc-contracts/review.proto` con `ReviewService`:

- `CreateReview`, `GetReview`, `UpdateReview`, `DeleteReview`, `ListCourseReviews`.

Es parte del ecosistema de servicios educativos/review, no del flujo principal de compras.

---

## 6) Storage de medios

## Implementado

- `media-service` puede generar URLs prefirmadas (`GeneratePresignedUrl`) y confirmar carga (`confirmVideoUpload`) con S3 compatible.
- MinIO está definido en Compose, junto con `minio-create-bucket` para inicializar `udemy-media`.

## Parcial / convivencia actual

- En `api-gateway` también hay endpoints que guardan archivos directo a `/uploads` local y luego actualizan catálogo con URL local.
- Por lo tanto, hoy conviven dos caminos:
  - camino prefirmado (capacidad implementada)
  - camino local por filesystem (flujo usado en endpoints actuales)

---

## 7) Docker Compose

Servicios definidos en `docker-compose.yml`:

- `postgres`
- `pgadmin`
- `rabbitmq`
- `minio`
- `minio-create-bucket`

---

## 8) Flujos verificados

## 8.1 Lectura/gestión de catálogo

- Frontend → REST en `api-gateway`.
- Gateway → gRPC `catalog-service`.
- Para enriquecer instructor, gateway hace batch `GetUsersByIds` en `user-service` (mitiga patrón N+1).

## 8.2 Checkout + inscripción (doble vía)

1. `POST /sales/checkout` en gateway.
2. Gateway llama `ProcessPayment` en `sales-service` (gRPC).
3. `sales-service` persiste transacción y publica `course.purchased` por RabbitMQ.
4. Gateway, además, inscribe en forma síncrona por gRPC (`EnrollStudent`) para cada curso.
5. `enrollment-service` también consume `course.purchased`.

**Control de duplicados:** `enrollment-service` usa `upsert` por (`userId`,`courseId`) para idempotencia.

---

## 9) Guía rápida de verificación para reviewers

1. Ver puertos gRPC en `api-gateway/src/app.module.ts`.
2. Ver JSON persistence de usuarios en `user-service/src/app.controller.ts`.
3. Ver dual path de checkout en `api-gateway/src/app.controller.ts` + emisión en `sales-service/src/sales.service.ts`.
4. Ver consumo RMQ + gRPC híbrido en `enrollment-service/src/main.ts`.
5. Ver ownership guard en `api-gateway/src/ownership.guard.ts` + `VerifyOwnership` en `grpc-contracts/catalog.proto`.
6. Ver media prefirmada en `media-service/src/media.service.ts` y uploads locales en gateway.
