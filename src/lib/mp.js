import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Sem MP_ACCESS_TOKEN o checkout roda em "modo dev":
// o pedido é aprovado na hora, sem passar pelo Mercado Pago.
export const mpEnabled = !!process.env.MP_ACCESS_TOKEN;

function client() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

export function preferences() {
  return new Preference(client());
}

export function payments() {
  return new Payment(client());
}

export const COMMISSION_PERCENT = Number(process.env.COMMISSION_PERCENT || 20);
