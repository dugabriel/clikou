import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

// Sem MP_ACCESS_TOKEN o checkout roda em "modo dev":
// o pedido é aprovado na hora, sem passar pelo Mercado Pago.
export const mpAtivo = !!process.env.MP_ACCESS_TOKEN;

function cliente() {
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
}

export function preferencias() {
  return new Preference(cliente());
}

export function pagamentos() {
  return new Payment(cliente());
}

export const COMISSAO_PORCENTO = Number(process.env.COMISSAO_PORCENTO || 20);
