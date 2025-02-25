FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:23-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
RUN npm install --production --legacy-peer-deps

COPY --from=builder /app/dist ./dist

CMD ["node", "dist/main.js"]
