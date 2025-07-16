# Multi-stage Dockerfile para produção otimizada
FROM node:22-slim AS builder

# Instalar dependências necessárias em uma camada
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Definir diretório de trabalho
WORKDIR /app

# Copiar apenas package files primeiro para aproveitar cache do Docker
COPY package*.json ./

# Instalar apenas dependências de produção primeiro (cache layer)
RUN npm ci --only=production --silent && \
    cp -R node_modules prod_node_modules

# Instalar todas as dependências para build
RUN npm ci --silent

# Copiar configuração TypeScript
COPY tsconfig*.json ./

# Copiar código fonte
COPY src/ ./src/

# Build da aplicação
RUN npm run build

# Restaurar apenas dependências de produção
RUN rm -rf node_modules && \
    mv prod_node_modules node_modules

# Estágio final - produção (imagem mínima)
FROM node:22-slim AS production

# Criar usuário não-root em uma única camada
RUN groupadd -g 1001 nodejs && \
    useradd -r -u 1001 -g nodejs nestjs && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
    dumb-init \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos compilados e dependências em uma única camada
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Criar diretórios e definir permissões
RUN mkdir -p /app/logs /app/tmp && \
    chown -R nestjs:nodejs /app

# Mudar para usuário não-root
USER nestjs

# Definir variáveis de ambiente
ENV NODE_ENV=production \
    PORT=3000 \
    NODE_OPTIONS="--max-old-space-size=512"

# Expor porta
EXPOSE 3000

# Health check otimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando para executar a aplicação
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/main.js"]