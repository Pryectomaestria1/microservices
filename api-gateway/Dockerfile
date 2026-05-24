FROM node:22-alpine AS build
WORKDIR /app/api-gateway

COPY api-gateway/package*.json ./
RUN npm ci

COPY api-gateway/tsconfig.json ./
COPY api-gateway/nest-cli.json ./
COPY api-gateway/src ./src
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app/api-gateway

COPY --from=build /app/api-gateway/package*.json ./
COPY --from=build /app/api-gateway/node_modules ./node_modules
COPY --from=build /app/api-gateway/dist ./dist
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 3000
CMD ["node", "dist/main"]
