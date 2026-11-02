FROM node:22.22.3-alpine AS build
WORKDIR /app
ENV NUXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:22.22.3-alpine
WORKDIR /app
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD wget -q -O /dev/null http://127.0.0.1:3000/login || exit 1
CMD ["node", ".output/server/index.mjs"]
