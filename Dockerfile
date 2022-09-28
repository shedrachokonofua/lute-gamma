FROM node:lts-alpine AS base
RUN npm install -g pnpm

FROM base AS install

WORKDIR /app
RUN pnpm add turbo
COPY . .
ARG workspace
RUN npx turbo prune --scope=${workspace} --docker

FROM base AS prebuild
WORKDIR /app
COPY .npmrc .npmrc
COPY .gitignore .gitignore
COPY --from=install /app/out/json/ .
COPY --from=install /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=install /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN npx pnpm install
COPY --from=install /app/out/full/ .
COPY turbo.json turbo.json

FROM base as build
WORKDIR /app
COPY --from=prebuild /app .
ARG workspace
RUN npx turbo run build --filter=${workspace}

FROM base as run
RUN addgroup --system --gid 1001 app
RUN adduser --system --uid 1001 lute
USER lute
COPY --from=build /app .
ARG workspace
WORKDIR /apps/${workspace}/build/
CMD node index.js