FROM node:22-alpine AS build
WORKDIR /app/media-service

COPY media-service/package*.json ./
RUN npm ci

COPY media-service/tsconfig.json ./
COPY media-service/nest-cli.json ./
COPY media-service/src ./src
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app/media-service

COPY --from=build /app/media-service/package*.json ./
COPY --from=build /app/media-service/node_modules ./node_modules
COPY --from=build /app/media-service/dist ./dist
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 50053
CMD ["node", "dist/main"]
