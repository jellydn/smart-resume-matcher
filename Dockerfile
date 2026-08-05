FROM node:24-alpine AS base
RUN corepack enable && corepack prepare pnpm@10.34.5 --activate

FROM base AS build-deps
RUN apk add --no-cache python3 make g++

FROM build-deps AS development-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM build-deps AS production-dependencies-env
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod --frozen-lockfile --ignore-scripts && \
    pnpm rebuild better-sqlite3

FROM build-deps AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN mkdir -p /app/data && chown -R node:node /app/data /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --from=production-dependencies-env --chown=node:node /app/node_modules /app/node_modules
COPY --from=build-env --chown=node:node /app/build /app/build
USER node
EXPOSE 3000
CMD ["pnpm", "run", "start"]
