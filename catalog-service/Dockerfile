FROM node:22-bookworm-slim AS build
WORKDIR /app/catalog-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY catalog-service/package*.json ./
RUN npm ci

COPY catalog-service/tsconfig.json ./
COPY catalog-service/nest-cli.json ./
COPY catalog-service/src ./src
COPY catalog-service/prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS production
WORKDIR /app/catalog-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/catalog-service/package*.json ./
COPY --from=build /app/catalog-service/node_modules ./node_modules
COPY --from=build /app/catalog-service/dist ./dist
COPY --from=build /app/catalog-service/prisma ./prisma
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 50052
CMD ["node", "dist/main"]
