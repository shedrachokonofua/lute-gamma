FROM node:lts-buster-slim AS base
ARG workspace
ENV WORKSPACE=${workspace}
RUN npm install -g pnpm turbo

FROM base as builder
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=${WORKSPACE} --docker

FROM base AS installer
WORKDIR /app
COPY .npmrc .npmrc
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
RUN npx pnpm install
COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npx turbo run build --filter=${WORKSPACE}

FROM base as runner
WORKDIR /app
COPY --from=installer /app .
CMD npx turbo run start --filter=${WORKSPACE}
