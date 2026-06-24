FROM node:20.16.0-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile

FROM node:20.16.0-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM node:20.16.0-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY package.json yarn.lock .yarnrc ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.js ./next.config.js

EXPOSE 3000

CMD ["yarn", "start"]
