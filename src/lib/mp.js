import {
  MercadoPagoConfig,
  Preference,
  Payment,
  OAuth,
  PreApproval,
} from "mercadopago";
import User from "@/models/User";

// Sem MP_ACCESS_TOKEN o checkout roda em "modo dev":
// o pedido é aprovado na hora, sem passar pelo Mercado Pago.
export const mpEnabled = !!process.env.MP_ACCESS_TOKEN;

// Split automático: exige as credenciais OAuth da aplicação marketplace
// (https://www.mercadopago.com.br/developers/panel/app). Sem elas, as vendas
// caem no fluxo de carteira + saque manual.
export const splitEnabled =
  mpEnabled && !!process.env.MP_CLIENT_ID && !!process.env.MP_CLIENT_SECRET;

function client() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

export function preferences() {
  return new Preference(client());
}

export function payments() {
  return new Payment(client());
}

export function oauth() {
  return new OAuth(client());
}

// Assinaturas recorrentes (Clikou Pro): usam um app do Mercado Pago próprio
// para assinaturas, com token separado do checkout/split. Cai no MP_ACCESS_TOKEN
// se o dedicado não estiver definido. A mensalidade entra na conta da clikou.
export function subscriptionAccessToken() {
  return process.env.MP_SUBSCRIPTION_ACCESS_TOKEN || process.env.MP_ACCESS_TOKEN;
}

export function preApprovals() {
  return new PreApproval(
    new MercadoPagoConfig({ accessToken: subscriptionAccessToken() })
  );
}

// Clientes autenticados como o fotógrafo (token obtido via OAuth).
export function sellerPreferences(accessToken) {
  return new Preference(new MercadoPagoConfig({ accessToken }));
}

export function sellerPayments(accessToken) {
  return new Payment(new MercadoPagoConfig({ accessToken }));
}

// Fotógrafo com conta MP conectada e token válido (renova se está para
// vencer). Retorna null se não conectou ou se a renovação falhou — nesse
// caso o chamador cai no fluxo de carteira.
export async function getConnectedSeller(userId) {
  const user = await User.findById(userId).select(
    "mpAccessToken mpRefreshToken mpTokenExpiresAt commissionPercent plan planCurrentPeriodEnd"
  );
  if (!user?.mpAccessToken) return null;

  const expiresSoon =
    user.mpTokenExpiresAt &&
    user.mpTokenExpiresAt.getTime() < Date.now() + 60 * 60 * 1000;
  if (expiresSoon) {
    try {
      const t = await oauth().refresh({
        body: {
          client_id: process.env.MP_CLIENT_ID,
          client_secret: process.env.MP_CLIENT_SECRET,
          refresh_token: user.mpRefreshToken,
        },
      });
      user.mpAccessToken = t.access_token;
      user.mpRefreshToken = t.refresh_token;
      user.mpTokenExpiresAt = new Date(Date.now() + t.expires_in * 1000);
      await user.save();
    } catch (e) {
      console.error("MP OAuth refresh:", e.message);
      return null;
    }
  }
  return user;
}

export const COMMISSION_PERCENT = Number(process.env.COMMISSION_PERCENT || 20);
