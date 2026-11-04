# Stage 1: Build Angular SSR
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration production

# Stage 2: Servidor Node (SSR + proxy de /api al backend)
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/vitrina ./dist/vitrina

ENV NODE_ENV=production
ENV PORT=4000

EXPOSE 4000

CMD ["node", "dist/vitrina/server/server.mjs"]
