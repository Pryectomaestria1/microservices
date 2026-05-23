FROM node:22-bookworm-slim AS build
WORKDIR /app/enrollment-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY enrollment-service/package*.json ./
RUN npm ci

COPY enrollment-service/tsconfig.json ./
COPY enrollment-service/nest-cli.json ./
COPY enrollment-service/src ./src
COPY enrollment-service/prisma ./prisma
RUN npx prisma generate
RUN npm run build

FROM node:22-bookworm-slim AS production
WORKDIR /app/enrollment-service

RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/enrollment-service/package*.json ./
COPY --from=build /app/enrollment-service/node_modules ./node_modules
COPY --from=build /app/enrollment-service/dist ./dist
COPY --from=build /app/enrollment-service/prisma ./prisma
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 50054
CMD ["node", "dist/main"]
