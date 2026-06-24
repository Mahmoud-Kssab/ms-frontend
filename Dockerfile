FROM node:20.16.0-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile

FROM node:20.16.0-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:3002
ARG NEXT_PUBLIC_SOCKET_URL=http://127.0.0.1:3002

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

FROM node:20.16.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
