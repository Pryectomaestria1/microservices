FROM node:22-bookworm-slim AS build
WORKDIR /app/sales-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY sales-service/package*.json ./
RUN npm ci

COPY sales-service/tsconfig.json ./
COPY sales-service/nest-cli.json ./
COPY sales-service/src ./src
COPY sales-service/prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS production
WORKDIR /app/sales-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/sales-service/package*.json ./
COPY --from=build /app/sales-service/node_modules ./node_modules
COPY --from=build /app/sales-service/dist ./dist
COPY --from=build /app/sales-service/prisma ./prisma
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 50055
CMD ["node", "dist/main"]
