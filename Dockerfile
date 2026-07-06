# Base Debian (glibc), não Alpine: o build musl do sharp vem com resvg
# sem suporte a texto, e a marca d'água (SVG <text>) sai vazia.
FROM node:22-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
# Fontes para o texto da marca d'água renderizar no sharp
RUN apt-get update \
  && apt-get install -y --no-install-recommends fontconfig fonts-dejavu-core \
  && rm -rf /var/lib/apt/lists/*
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
# O tracer do standalone perde o .so do libvips; sem ele o sharp cai no
# fallback WASM (sem fontes → marca d'água sem texto). Copia os pacotes
# nativos completos por cima.
COPY --from=deps /app/node_modules/@img/sharp-libvips-linux-x64 ./node_modules/@img/sharp-libvips-linux-x64
COPY --from=deps /app/node_modules/@img/sharp-linux-x64 ./node_modules/@img/sharp-linux-x64

# Cloud Run injeta a PORT (padrão 8080)
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080
CMD ["node", "server.js"]
