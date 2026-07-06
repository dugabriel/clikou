"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CopyLinkButton from "@/components/CopyLinkButton";
import { XIcon } from "@/components/Icons";
import { field, label, primaryButton, secondaryButton } from "@/components/ui";

export default function ProfileForm({ profile }) {
  const router = useRouter();
  const [slug, setSlug] = useState(profile.username);
  const [portfolio, setPortfolio] = useState(profile.portfolio);
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setOk(false);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        bio: form.get("bio"),
        city: form.get("city"),
        website: form.get("website"),
        instagram: form.get("instagram"),
        whatsapp: form.get("whatsapp"),
        seller: {
          cpf: form.get("cpf"),
          birthDate: form.get("birthDate"),
          phone: form.get("phone"),
          address: {
            cep: form.get("cep"),
            street: form.get("street"),
            number: form.get("number"),
            complement: form.get("complement"),
            district: form.get("district"),
            city: form.get("addressCity"),
            state: form.get("addressState"),
          },
        },
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "Erro ao salvar.");
      return;
    }
    setSlug(data.username);
    setOk(true);
    router.refresh();
  }

  async function uploadPhotos(e) {
    const files = [...e.target.files];
    e.target.value = "";
    setUploading(true);
    setError("");
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/profile/portfolio", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no upload.");
        break;
      }
      setPortfolio((current) => [...current, data.key]);
    }
    setUploading(false);
  }

  async function removePhoto(key) {
    setPortfolio((current) => current.filter((k) => k !== key));
    await fetch("/api/profile/portfolio", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <form onSubmit={save} className="space-y-4">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Sobre mim
        </h2>
        <p className="-mt-2 text-sm text-zinc-400">
          Sua vitrine na clikou — perfeita para colocar na bio do Instagram.
        </p>

        <div>
          <label className={label}>Nome de usuário (define seu link)</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">clikou/f/</span>
            <input
              name="username"
              defaultValue={profile.username}
              placeholder="seunome"
              className={field}
            />
          </div>
        </div>

        <div>
          <label className={label}>Sobre você</label>
          <textarea
            name="bio"
            rows={4}
            defaultValue={profile.bio}
            placeholder="Conte quem você é, o que fotografa, seus equipamentos…"
            className={field}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={label}>Cidade</label>
            <input
              name="city"
              defaultValue={profile.city}
              placeholder="Sua cidade"
              className={field}
            />
          </div>
          <div>
            <label className={label}>Site</label>
            <input
              name="website"
              defaultValue={profile.website}
              placeholder="seusite.com"
              className={field}
            />
          </div>
          <div>
            <label className={label}>Instagram</label>
            <input
              name="instagram"
              defaultValue={profile.instagram}
              placeholder="sem o @"
              className={field}
            />
          </div>
          <div>
            <label className={label}>WhatsApp</label>
            <input
              name="whatsapp"
              defaultValue={profile.whatsapp}
              placeholder="DDD + número"
              className={field}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-zinc-800 pt-6">
          <h3 className="font-display text-xl font-bold tracking-tight">
            Dados para venda
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            Exigidos para publicar eventos e sacar — identificam você como
            vendedor, como pede a lei. Não aparecem no seu perfil público.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className={label}>CPF</label>
              <input
                name="cpf"
                defaultValue={profile.cpf}
                placeholder="000.000.000-00"
                inputMode="numeric"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Data de nascimento</label>
              <input
                name="birthDate"
                type="date"
                defaultValue={profile.birthDate}
                className={field}
              />
            </div>
            <div>
              <label className={label}>Telefone</label>
              <input
                name="phone"
                defaultValue={profile.phone}
                placeholder="DDD + número"
                inputMode="numeric"
                className={field}
              />
            </div>
            <div>
              <label className={label}>CEP</label>
              <input
                name="cep"
                defaultValue={profile.address.cep}
                placeholder="00000-000"
                inputMode="numeric"
                className={field}
              />
            </div>
            <div className="col-span-2">
              <label className={label}>Endereço (rua/avenida)</label>
              <input
                name="street"
                defaultValue={profile.address.street}
                placeholder="Rua das Fotos"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Número</label>
              <input
                name="number"
                defaultValue={profile.address.number}
                placeholder="123"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Complemento (opcional)</label>
              <input
                name="complement"
                defaultValue={profile.address.complement}
                placeholder="Apto 42"
                className={field}
              />
            </div>
            <div>
              <label className={label}>Bairro</label>
              <input
                name="district"
                defaultValue={profile.address.district}
                placeholder="Centro"
                className={field}
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <label className={label}>Cidade</label>
                <input
                  name="addressCity"
                  defaultValue={profile.address.city}
                  placeholder="Sua cidade"
                  className={field}
                />
              </div>
              <div>
                <label className={label}>UF</label>
                <input
                  name="addressState"
                  defaultValue={profile.address.state}
                  placeholder="SP"
                  maxLength={2}
                  className={field}
                />
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}
        {ok && <p className="text-sm text-emerald-400">Perfil salvo!</p>}

        <div className="flex flex-wrap items-center gap-3">
          <button disabled={saving} className={primaryButton}>
            {saving ? "Salvando…" : "Salvar perfil"}
          </button>
          {slug && (
            <>
              <a
                href={`/f/${slug}`}
                target="_blank"
                className={`${secondaryButton} px-5 py-2.5 text-sm`}
              >
                Ver minha página
              </a>
              <CopyLinkButton path={`/f/${slug}`} label="Copiar link do perfil" />
            </>
          )}
        </div>
      </form>

      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Portfólio
        </h2>
        <p className="mt-1 text-sm text-zinc-400">
          Até 8 fotos do seu melhor trabalho — aparecem na sua página pública
          (sem marca d&apos;água, não estão à venda).
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {portfolio.map((key) => (
            <div
              key={key}
              className="group relative overflow-hidden rounded-xl border border-zinc-800"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/${key}`}
                alt="Foto do portfólio"
                className="aspect-square w-full object-cover"
              />
              <button
                onClick={() => removePhoto(key)}
                title="Remover"
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-zinc-300 opacity-0 transition hover:text-white group-hover:opacity-100"
              >
                <XIcon size={14} />
              </button>
            </div>
          ))}

          {portfolio.length < 8 && (
            <label
              className={`flex aspect-square cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500 transition hover:border-yellow-400 hover:text-yellow-400 ${
                uploading ? "pointer-events-none opacity-50" : ""
              }`}
            >
              {uploading ? "Enviando…" : "+ Adicionar"}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={uploadPhotos}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
