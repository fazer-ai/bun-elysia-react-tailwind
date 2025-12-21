FROM oven/bun:1-alpine AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev /temp/prod
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# NOTE: Set a dummy DATABASE_URL for Prisma code generation
ENV DATABASE_URL="postgres://postgres:postgres@localhost:5432/postgres"
RUN bun prisma generate

FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /usr/src/app/src/ src
COPY --from=prerelease /usr/src/app/tsconfig.json tsconfig.json
COPY --from=prerelease /usr/src/app/package.json package.json
COPY --from=prerelease /usr/src/app/scripts scripts
COPY --from=prerelease /usr/src/app/prisma prisma
COPY --from=prerelease /usr/src/app/prisma.config.ts prisma.config.ts
COPY --from=prerelease /usr/src/app/public public
COPY --from=prerelease /usr/src/app/generated generated

RUN mkdir -p /usr/src/app/logs && chown -R bun:bun /usr/src/app/logs

EXPOSE 3000

# TODO: Improved build following ElysiaJS recommendations
# https://elysiajs.com/patterns/deploy
