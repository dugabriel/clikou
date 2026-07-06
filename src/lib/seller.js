// Cadastro de vendedor: para vender fotos, o fotógrafo precisa completar
// os dados de identificação legal (nome já vem da conta): CPF válido,
// data de nascimento (18+), telefone e endereço completo.

export function isValidCpf(raw) {
  const cpf = String(raw || "").replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(cpf[i]) * (len + 1 - i);
    if (((sum * 10) % 11) % 10 !== Number(cpf[len])) return false;
  }
  return true;
}

export function isAdult(birthDate) {
  if (!birthDate) return false;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return false;
  const adult = new Date(d);
  adult.setFullYear(adult.getFullYear() + 18);
  return adult <= new Date();
}

export function isSellerProfileComplete(user) {
  const a = user?.address || {};
  return (
    isValidCpf(user?.cpf) &&
    isAdult(user?.birthDate) &&
    !!user?.phone &&
    !!(a.cep && a.street && a.number && a.city && a.state)
  );
}

export const SELLER_PROFILE_MESSAGE =
  "Para vender na clikou, complete seu cadastro de vendedor (CPF, data de nascimento, telefone e endereço) em Meu perfil.";
