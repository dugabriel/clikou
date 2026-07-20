import mongoose from "mongoose";
import Client from "@/models/Client";
import { accentInsensitiveExactRegex } from "@/lib/search";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// Sanitiza os campos do cadastro de cliente (POST e PATCH usam a mesma
// régua). Retorna { fields } ou { error } com mensagem pronta pra resposta.
// No PATCH, só os campos presentes no body entram em `fields`.
export function sanitizeClientInput(body, { partial = false } = {}) {
  const fields = {};

  if (!partial || "name" in body) {
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) return { error: "Informe o nome do cliente." };
    if (name.length > 120) return { error: "Nome do cliente muito longo." };
    fields.name = name;
  }

  if (!partial || "email" in body) {
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email && !EMAIL_RE.test(email)) return { error: "E-mail inválido." };
    fields.email = email;
  }

  const text = (key, max) => {
    if (partial && !(key in body)) return;
    const value = typeof body[key] === "string" ? body[key].trim() : "";
    fields[key] = value.slice(0, max);
  };
  text("phone", 40);
  text("street", 160);
  text("neighborhood", 80);
  text("city", 80);
  text("zip", 16);
  text("notes", 2000);

  if (!partial || "instagram" in body) {
    const instagram =
      typeof body.instagram === "string" ? body.instagram.trim() : "";
    // Aceita com ou sem "@" e até URL colada; guarda só o usuário.
    fields.instagram = instagram
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/^@/, "")
      .replace(/\/.*$/, "")
      .slice(0, 60);
  }

  if (!partial || "state" in body) {
    const state = typeof body.state === "string" ? body.state.trim() : "";
    fields.state = state.toUpperCase().slice(0, 2);
  }

  return { fields };
}

// Cliente do fotógrafo pelo id — null se o id for inválido ou de outro dono.
// Usado pelas rotas de galeria ao vincular via clientId.
export async function ownedClientById(photographerId, clientId) {
  if (!mongoose.isValidObjectId(clientId)) return null;
  return Client.findOne({ _id: clientId, photographer: photographerId })
    .select("name email")
    .lean();
}

// Outro cliente do mesmo fotógrafo com esse nome (ignorando acentos/caixa)?
export async function findDuplicateClient(photographerId, name, excludeId) {
  const filter = {
    photographer: photographerId,
    name: accentInsensitiveExactRegex(name),
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Client.findOne(filter).select("_id").lean();
}
