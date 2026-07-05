# clikou 📸

Marketplace de fotos de eventos: fotógrafos publicam as fotos dos eventos que
cobriram, clientes compram e baixam em alta resolução sem marca d'água. A
plataforma fica com uma comissão de cada venda e o fotógrafo saca o saldo via
Pix.

**Stack:** Next.js (monolito JS, App Router) · MongoDB (Mongoose) · Google
Cloud Storage · Mercado Pago · Cloud Run.

## Como funciona o dinheiro

1. Cliente compra fotos → paga via Mercado Pago (Pix/cartão).
2. O webhook confirma o pagamento → o pedido vira `paid`, o download é
   liberado e a parte do fotógrafo (preço − comissão) é creditada na carteira
   (`User.balanceCents`).
3. O fotógrafo solicita saque via Pix no painel (mínimo R$ 20). O saque fica
   `pending` — você paga manualmente pelo seu banco e marca como pago no
   painel admin (`/admin/withdrawals`); recusar devolve o valor à carteira.
4. Comissão configurável via `COMMISSION_PERCENT` (padrão 20%), com taxa
   individual por fotógrafo ajustável em `/admin/photographers`.

O painel admin (`/admin`) mostra vendas e faturamento; o acesso é liberado
para os e-mails listados em `ADMIN_EMAILS` (separados por vírgula).

Todos os valores são armazenados em **centavos** (inteiros).

## Rodando local

```bash
cp .env.example .env.local   # ajuste se quiser
npm install
npm run dev
```

Precisa de um MongoDB rodando (ex.: `docker run -d -p 27017:27017 mongo:7`).

**Modo dev sem credenciais:** sem `GCS_BUCKET`, as fotos vão para
`.data/uploads/`; sem `MP_ACCESS_TOKEN`, o checkout aprova a compra na hora
(sem cobrar); sem `MAILERSEND_TOKEN`, o cadastro por senha entra sem
confirmação de e-mail — dá pra testar o fluxo inteiro localmente sem
configurar nada.

## Configurando produção

### MongoDB Atlas
Crie um cluster grátis em https://cloud.mongodb.com e coloque a connection
string em `MONGODB_URI`.

### Google Cloud Storage
```bash
gcloud storage buckets create gs://clikou-fotos --location=southamerica-east1 \
  --uniform-bucket-level-access
```
Defina `GCS_BUCKET=clikou-fotos`. No Cloud Run a autenticação é automática
pela service account (dê a ela o papel `roles/storage.objectAdmin` no bucket).
O bucket fica privado: previews são servidos pela API e downloads usam URL
assinada de 15 minutos.

### MailerSend (confirmação de conta e e-mails transacionais)
O cadastro por senha tem confirmação de senha, captcha anti-spam e ativação
por link enviado no e-mail (contas Google já entram confirmadas). Com o token
configurado, o clikou também avisa por e-mail: compra confirmada (cliente) e
saque pago/recusado (fotógrafo).
1. Crie uma conta em https://www.mailersend.com, verifique o domínio
   (`clicou.online`) e gere um token de API (começa com `mlsn.`).
2. Defina `MAILERSEND_TOKEN` e `EMAIL_FROM` (remetente no domínio verificado).

Sem o token, a conta ativa direto e nenhum e-mail é enviado (modo dev).

### Mercado Pago
1. Crie uma aplicação em https://www.mercadopago.com.br/developers
2. Copie o **Access Token de produção** para `MP_ACCESS_TOKEN`
   (use o de teste + contas de teste para homologar).
3. O webhook é registrado automaticamente por pedido via `notification_url`
   (`APP_URL/api/webhooks/mercadopago`) — por isso `APP_URL` precisa ser a URL
   pública. Para testar webhook localmente, use um túnel
   (ex.: `cloudflared tunnel --url http://localhost:3000`).

### Split automático (opcional)
Com `MP_CLIENT_ID` e `MP_CLIENT_SECRET` da aplicação (tipo marketplace,
redirect URI `APP_URL/api/mp/callback`), o fotógrafo conecta a própria conta
Mercado Pago em **Dashboard → Sacar** e cada venda cai direto nela, já com a
comissão da plataforma retida no gateway (`marketplace_fee`) — sem carteira
nem saque. Compras com fotos de mais de um fotógrafo (ou de fotógrafo não
conectado) continuam no fluxo de carteira + saque Pix.

### Deploy no Cloud Run
```bash
gcloud run deploy clikou \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars "MONGODB_URI=...,AUTH_SECRET=...,APP_URL=https://SEU-DOMINIO,GCS_BUCKET=clikou-fotos,MP_ACCESS_TOKEN=...,COMMISSION_PERCENT=20,ADMIN_EMAILS=voce@exemplo.com,MAILERSEND_TOKEN=mlsn....,EMAIL_FROM=nao-responda@clicou.online"
```
Depois aponte o domínio `clicou.online` no mapeamento de domínios do Cloud
Run e atualize `APP_URL`.

> Dica: para segredos, prefira `--set-secrets` com o Secret Manager em vez de
> `--set-env-vars`.

## Estrutura

```
src/
  models/        User, Event, Photo, Order, Withdrawal (Mongoose)
  lib/           db, auth (JWT em cookie), storage (GCS ou disco local),
                 watermark (sharp), mp (Mercado Pago), orders, currency
  app/
    api/         auth, events, photos (upload/preview/download),
                 checkout, webhooks/mercadopago, withdrawals
    events/      vitrine pública + galeria de compra
    dashboard/   área do fotógrafo (eventos, upload, saque)
    admin/       painel admin (vendas, saques, taxa por fotógrafo)
    my-purchases/  downloads do cliente
```

## Próximos passos sugeridos

- [x] Painel admin (aprovar saques, ver vendas, taxa por fotógrafo)
- [x] Reconhecimento facial ("ache minhas fotos com uma selfie")
- [x] E-mail transacional (compra confirmada, saque pago/recusado)
- [x] Split automático no gateway (conta MP conectada via OAuth +
      `marketplace_fee`; carteira segue como fallback)
- [x] Página pública de perfil do fotógrafo + contratação (como na Banlek)
