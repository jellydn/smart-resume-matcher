FROM node:24-alpine AS base
RUN apk add --no-cache python3 make g++ && corepack enable && corepack prepare pnpm@10.34.5 --activate

FROM base AS development-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS production-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
    cd node_modules/.pnpm/better-sqlite3@*/node_modules/better-sqlite3 && \
    npx node-gyp rebuild
FROM base AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN pnpm run build
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/data
COPY package.json pnpm-lock.yaml ./
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
EXPOSE 3000
CMD ["pnpm", "run", "start"]