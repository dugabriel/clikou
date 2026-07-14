---
name: verify
description: Verificação local do clikou de ponta a ponta neste WSL (mongo descartável, dev server em modo dev, Playwright sem sudo)
---

# Verificar o clikou localmente

O `.env.local` aponta para o Atlas de PRODUÇÃO — nunca usar. A receita abaixo
sobe tudo isolado (checkout MP e e-mail caem em modo dev; fotos vão para
`.data/uploads`).

## Subir o ambiente

1. Mongo descartável (instalar `mongodb-memory-server` no scratchpad):

   ```js
   // mongo.mjs — node mongo.mjs em background
   import { MongoMemoryServer } from "mongodb-memory-server";
   await MongoMemoryServer.create({ instance: { port: 27099, ip: "127.0.0.1" } });
   setInterval(() => {}, 1 << 30);
   ```

2. Dev server com env sobrescrita (env inline vence o `.env.local`):

   ```bash
   MONGODB_URI=mongodb://127.0.0.1:27099/db GCS_BUCKET= \
   GOOGLE_APPLICATION_CREDENTIALS= MP_ACCESS_TOKEN= MAILERSEND_TOKEN= \
   APP_URL=http://localhost:3199 npm run dev -- -p 3199
   ```

## Dirigir os fluxos

- Cadastro via API: `GET /api/captcha` → "Quanto é <extenso> + <n>?" (mapear
  por extenso 0–10); `POST /api/auth/signup` com `{name,email,password,captcha,captchaToken}`
  devolve o cookie `clikou_session` (sem MAILERSEND_TOKEN a sessão sai na hora).
- Perfil de vendedor/plano: mais rápido gravar direto no mongo (driver
  `mongodb`): `cpf: "52998224725"`, `birthDate`, `phone`, `address {cep,street,
  number,city,state}`; `plan: "pro"` para recursos Pro.
- Moderação de imagem sem credenciais cai em `blocked: false` (só loga erro).
- Marca d'água dá pra verificar por pixel: subir imagem branca e medir a
  luminância da faixa inferior do preview (sem marca ≈ 255; com marca < 200,
  por causa da barra preta do rodapé).

## Playwright (screenshots) sem sudo

- `chromium_headless_shell` já está em `~/.cache/ms-playwright/`; o binário
  fica em `chromium_headless_shell-*/chrome-headless-shell-linux64/`.
- As libs de sistema faltam e `--with-deps` exige sudo. Solução (refazer por
  sessão, o scratchpad é efêmero):

  ```bash
  apt-get download libnspr4 libnss3 libasound2t64 libatk1.0-0t64 \
    libatk-bridge2.0-0t64 libatspi2.0-0t64 libcups2t64 libxkbcommon0 \
    libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libcairo2 \
    libpango-1.0-0 libdrm2 libdbus-1-3
  for f in *.deb; do dpkg-deb -x "$f" .; done
  LD_LIBRARY_PATH=$PWD/usr/lib/x86_64-linux-gnu node script.mjs
  ```

- Login no browser: injetar o cookie `clikou_session` da API com
  `context.addCookies`.
- No dev server, `waitUntil: "networkidle"` estoura em página de dashboard
  (compilação sob demanda + requests contínuos) — usar `domcontentloaded` +
  `waitForSelector`. Screenshot logo após clique pode pegar transição CSS de
  150ms no meio (falso "não aplicou").
