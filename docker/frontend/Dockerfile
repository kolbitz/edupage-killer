FROM node:22-alpine

WORKDIR /app

RUN npm install -g corepack@latest && corepack enable && corepack prepare pnpm@9.0.0 --activate

COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
ENV VITE_DEMO_MODE true

COPY . .

EXPOSE 5173

CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]
