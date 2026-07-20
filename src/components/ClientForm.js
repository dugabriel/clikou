"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const input =
  "w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 outline-none focus:border-yellow-400";

// Formulário de cadastro/edição de cliente. Sem `client` cria (POST); com
// `client` edita (PATCH). Usado pela lista de clientes nos dois modos.
export default function ClientForm({ client, onDone }) {
  const router = useRouter();
  const [name, setName] = useState(client?.name || "");
  const [email, setEmail] = useState(client?.email || "");
  const [phone, setPhone] = useState(client?.phone || "");
  const [instagram, setInstagram] = useState(client?.instagram || "");
  const [street, setStreet] = useState(client?.street || "");
  const [neighborhood, setNeighborhood] = useState(client?.neighborhood || "");
  const [city, setCity] = useState(client?.city || "");
  const [state, setState] = useState(client?.state || "");
  const [zip, setZip] = useState(client?.zip || "");
  const [notes, setNotes] = useState(client?.notes || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    const res = await fetch(
      client ? `/api/clients/${client.id}` : "/api/clients",
      {
        method: client ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          instagram,
          street,
          neighborhood,
          city,
          state,
          zip,
          notes,
        }),
      }
    );
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Não foi possível salvar o cliente.");
      return;
    }
    onDone?.();
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Nome *</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Ana Duarte"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ana@email.com"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Telefone</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-0000"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Instagram</label>
          <input
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="@ana.duarte"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">
            Rua e número
          </label>
          <input
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Rua das Flores, 123"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Bairro</label>
          <input
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            placeholder="Centro"
            className={input}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">Cidade</label>
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="São Paulo"
            className={input}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm text-zinc-400">UF</label>
            <input
              value={state}
              onChange={(e) => setState(e.target.value.toUpperCase())}
              placeholder="SP"
              maxLength={2}
              className={input}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-zinc-400">CEP</label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
              placeholder="01000-000"
              className={input}
            />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm text-zinc-400">Anotações</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Ex.: indicada pela Maria, prefere WhatsApp"
            className={input}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          disabled={saving || !name.trim()}
          className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300 disabled:opacity-50"
        >
          {saving
            ? "Salvando…"
            : client
              ? "Salvar cliente"
              : "Cadastrar cliente"}
        </button>
        {onDone && (
          <button
            type="button"
            onClick={onDone}
            className="text-sm text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
        )}
        {error && <span className="text-sm text-red-400">{error}</span>}
      </div>
    </form>
  );
}

// Botão "+ Novo cliente" que expande o formulário de cadastro.
export function NewClientButton() {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-yellow-400 px-5 py-2.5 font-semibold text-zinc-950 hover:bg-yellow-300"
      >
        + Novo cliente
      </button>
    );
  }

  return (
    <div className="w-full rounded-xl border border-dashed border-zinc-700 bg-zinc-900/50 p-6">
      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        Novo cliente
      </p>
      <ClientForm onDone={() => setOpen(false)} />
    </div>
  );
}

// Linha da lista: dados do cliente + editar (expande o form) + excluir.
export function ClientRow({ client, galleryCount }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (
      !confirm(
        `Excluir ${client.name}? As galerias vinculadas não serão apagadas — só perdem o vínculo com este cliente.`
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
      return;
    }
    const data = await res.json().catch(() => ({}));
    setDeleting(false);
    setError(data.error || "Não foi possível excluir o cliente.");
  }

  const contact = [client.email, client.phone].filter(Boolean).join(" · ");
  const place = [client.city, client.state].filter(Boolean).join("/");

  return (
    <div className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">
            {client.name}
            {client.instagram && (
              <a
                href={`https://instagram.com/${client.instagram}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 text-xs text-zinc-500 hover:text-yellow-400"
              >
                @{client.instagram}
              </a>
            )}
          </p>
          <p className="truncate text-zinc-500">
            {contact || "Sem contato"}
            {place && ` · ${place}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`/dashboard/galleries?cliente=${client.id}`}
            className="text-zinc-400 hover:text-yellow-400"
          >
            {galleryCount === 1 ? "1 galeria" : `${galleryCount} galerias`}
          </a>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="rounded-full border border-zinc-700 px-4 py-1.5 font-medium transition hover:border-zinc-500"
          >
            {editing ? "Fechar" : "Editar"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={deleting}
            className="text-red-400/80 transition hover:text-red-400 disabled:opacity-50"
          >
            {deleting ? "Excluindo…" : "Excluir"}
          </button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      {editing && (
        <div className="mt-2 rounded-xl border border-zinc-800 bg-zinc-950/50 p-4">
          <ClientForm client={client} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}
