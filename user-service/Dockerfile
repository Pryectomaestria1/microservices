FROM node:22-alpine AS build
WORKDIR /app/user-service

COPY user-service/package*.json ./
RUN npm ci

COPY user-service/tsconfig.json ./
COPY user-service/nest-cli.json ./
COPY user-service/src ./src
RUN npm run build

FROM node:22-alpine AS production
WORKDIR /app/user-service

COPY --from=build /app/user-service/package*.json ./
COPY --from=build /app/user-service/node_modules ./node_modules
COPY --from=build /app/user-service/dist ./dist
COPY grpc-contracts/*.proto /app/protos/

EXPOSE 50051
CMD ["node", "dist/main"]
