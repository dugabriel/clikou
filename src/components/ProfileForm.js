"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CopyLinkButton from "@/components/CopyLinkButton";
import { XIcon } from "@/components/Icons";
import { field, label, primaryButton, secondaryButton } from "@/components/ui";

export default function ProfileForm({ profile, pro, limits, collections: initialCollections }) {
  const router = useRouter();
  const [slug, setSlug] = useState(profile.username);
  const [collections, setCollections] = useState(initialCollections);
  const [coverKey, setCoverKey] = useState(profile.coverKey || "");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  // Aviso de limite do plano, mostrado junto da grade de fotos (o `error`
  // aparece lá em cima, no formulário de perfil — longe do upload).
  const [photoNotice, setPhotoNotice] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [creating, setCreating] = useState(false);

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
        brandColor: form.get("brandColor") || "",
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

  // Sobe fotos para uma coleção (collectionId null = coleção padrão, criada
  // no servidor na primeira foto do grátis).
  async function uploadPhotos(collectionId, files) {
    // Corta a seleção ao espaço que resta no plano antes de enviar — senão o
    // usuário seleciona 300, cada arquivo viaja inteiro e o servidor rejeita
    // um a um depois do limite.
    const current = collectionId
      ? collections.find((c) => c._id === collectionId)
      : collections[0];
    const used = current?.photos.length || 0;
    const room = Math.max(0, limits.photosPerCollection - used);
    if (files.length > room) {
      setPhotoNotice(
        room === 0
          ? `Esta coleção já tem as ${limits.photosPerCollection} fotos do seu plano. Remova alguma para trocar${pro ? "" : ", ou assine o Pro para ter mais espaço"}.`
          : `Seu plano permite ${limits.photosPerCollection} fotos por coleção: cabem mais ${room}, então só as ${room} primeiras das ${files.length} selecionadas serão enviadas.`
      );
      files = files.slice(0, room);
      if (files.length === 0) return;
    } else {
      setPhotoNotice("");
    }
    setUploadingId(collectionId || "default");
    for (const file of files) {
      const form = new FormData();
      form.append("file", file);
      if (collectionId) form.append("collectionId", collectionId);
      const res = await fetch("/api/profile/collections", {
        method: "POST",
        body: form,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erro no upload.");
        break;
      }
      setCollections((cols) => {
        const exists = cols.some((c) => c._id === data.collectionId);
        if (!exists) {
          return [...cols, { _id: data.collectionId, name: "", photos: [data.key] }];
        }
        return cols.map((c) =>
          c._id === data.collectionId
            ? { ...c, photos: [...c.photos, data.key] }
            : c
        );
      });
    }
    setUploadingId(null);
  }

  async function removePhoto(collectionId, key) {
    setCollections((cols) =>
      cols.map((c) =>
        c._id === collectionId
          ? { ...c, photos: c.photos.filter((k) => k !== key) }
          : c
      )
    );
    await fetch("/api/profile/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId, key }),
    });
  }

  async function uploadCover(file) {
    setUploadingCover(true);
    setError("");
    const form = new FormData();
    form.append("file", file);
    const res = await fetch("/api/profile/cover", { method: "POST", body: form });
    const data = await res.json();
    setUploadingCover(false);
    if (!res.ok) {
      setError(data.error || "Erro ao enviar a capa.");
      return;
    }
    setCoverKey(data.key);
  }

  async function removeCover() {
    setCoverKey("");
    await fetch("/api/profile/cover", { method: "DELETE" });
  }

  async function createCollection() {
    setCreating(true);
    setError("");
    const res = await fetch("/api/profile/collections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create", name: "Nova coleção" }),
    });
    const data = await res.json();
    setCreating(false);
    if (!res.ok) {
      setError(data.error || "Erro ao criar coleção.");
      return;
    }
    setCollections((cols) => [
      ...cols,
      { _id: data.collectionId, name: "Nova coleção", photos: [] },
    ]);
  }

  async function renameCollection(collectionId, name) {
    setCollections((cols) =>
      cols.map((c) => (c._id === collectionId ? { ...c, name } : c))
    );
    await fetch("/api/profile/collections", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "rename", collectionId, name }),
    });
  }

  async function deleteCollection(collectionId) {
    setCollections((cols) => cols.filter((c) => c._id !== collectionId));
    await fetch("/api/profile/collections", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ collectionId }),
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

        {pro && (
          <div className="mt-8 border-t border-zinc-800 pt-6">
            <h3 className="font-display flex items-center gap-2 text-xl font-bold tracking-tight">
              Personalização
              <span className="rounded-full bg-yellow-400/15 px-2.5 py-0.5 text-xs font-semibold text-yellow-400">
                Pro
              </span>
            </h3>
            <p className="mt-1 text-sm text-zinc-400">
              Deixe a página com a sua cara — cor de destaque e imagem de capa.
            </p>

            <div className="mt-4">
              <label className={label}>Cor de destaque</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="brandColor"
                  defaultValue={profile.brandColor || "#facc15"}
                  className="h-11 w-16 cursor-pointer rounded-lg border border-white/10 bg-transparent"
                />
                <span className="text-sm text-zinc-500">
                  Usada nos botões e detalhes do seu perfil público.
                </span>
              </div>
            </div>

            <div className="mt-4">
              <label className={label}>Imagem de capa</label>
              {coverKey ? (
                <div className="group relative overflow-hidden rounded-xl border border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={`/api/${coverKey}`}
                    alt="Capa do perfil"
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={removeCover}
                    title="Remover capa"
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-zinc-300 opacity-100 transition hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
                  >
                    <XIcon size={14} />
                  </button>
                </div>
              ) : (
                <label
                  className={`flex h-32 cursor-pointer items-center justify-center rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-500 transition hover:border-yellow-400 hover:text-yellow-400 ${
                    uploadingCover ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  {uploadingCover ? "Enviando…" : "+ Enviar capa"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files[0];
                      e.target.value = "";
                      if (f) uploadCover(f);
                    }}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        )}

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
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-display text-2xl font-bold tracking-tight">
            Portfólio
          </h2>
          {pro ? (
            <span className="rounded-full bg-yellow-400/15 px-3 py-1 text-xs font-semibold text-yellow-400">
              Pro
            </span>
          ) : null}
        </div>

        {photoNotice && (
          <p className="mt-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3 text-sm text-zinc-300">
            {photoNotice}
          </p>
        )}

        {pro ? (
          <ProCollections
            collections={collections}
            limits={limits}
            uploadingId={uploadingId}
            creating={creating}
            onUpload={uploadPhotos}
            onRemovePhoto={removePhoto}
            onCreate={createCollection}
            onRename={renameCollection}
            onDelete={deleteCollection}
          />
        ) : (
          <FreeGallery
            collections={collections}
            limits={limits}
            uploadingId={uploadingId}
            onUpload={uploadPhotos}
            onRemovePhoto={removePhoto}
          />
        )}
      </div>
    </div>
  );
}

// Grátis: uma grade só, sem nomes, limitada às N fotos do plano.
function FreeGallery({ collections, limits, uploadingId, onUpload, onRemovePhoto }) {
  const gallery = collections[0] || null;
  const photos = gallery?.photos || [];
  const collectionId = gallery?._id || null;
  const uploading = uploadingId !== null;

  return (
    <>
      <p className="mt-1 text-sm text-zinc-400">
        Até {limits.photosPerCollection} fotos do seu melhor trabalho — aparecem
        na sua página pública (sem marca d&apos;água, não estão à venda).
      </p>

      <PhotoGrid
        photos={photos}
        max={limits.photosPerCollection}
        uploading={uploading}
        onUpload={(files) => onUpload(collectionId, files)}
        onRemove={(key) => onRemovePhoto(collectionId, key)}
      />

      <div className="mt-6 rounded-2xl border border-yellow-400/30 bg-yellow-400/5 p-5">
        <p className="font-semibold text-yellow-400">
          Organize por tipo de projeto com o Pro
        </p>
        <p className="mt-1 text-sm text-zinc-300">
          Crie coleções separadas (Casamentos, Corridas, Ensaios…) e mostre
          muito mais fotos — além de vender sem comissão.
        </p>
        <Link
          href="/dashboard/plan"
          className="mt-3 inline-block rounded-full bg-yellow-400 px-5 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-yellow-300"
        >
          Ver o Pro
        </Link>
      </div>
    </>
  );
}

// Pro: várias coleções nomeadas, cada uma com sua grade.
function ProCollections({
  collections,
  limits,
  uploadingId,
  creating,
  onUpload,
  onRemovePhoto,
  onCreate,
  onRename,
  onDelete,
}) {
  return (
    <>
      <p className="mt-1 text-sm text-zinc-400">
        Organize seu trabalho em coleções por tipo de projeto. Até{" "}
        {limits.collections} coleções, {limits.photosPerCollection} fotos cada.
      </p>

      <div className="mt-4 space-y-6">
        {collections.map((c) => (
          <div
            key={c._id}
            className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <div className="flex items-center gap-2">
              <input
                defaultValue={c.name}
                placeholder="Nome da coleção"
                maxLength={40}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v !== c.name) onRename(c._id, v);
                }}
                className={`${field} font-semibold`}
              />
              <button
                type="button"
                onClick={() => onDelete(c._id)}
                title="Excluir coleção"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-700 text-zinc-400 transition hover:border-red-500 hover:text-red-400"
              >
                <XIcon size={15} />
              </button>
            </div>

            <PhotoGrid
              photos={c.photos}
              max={limits.photosPerCollection}
              uploading={uploadingId === c._id}
              onUpload={(files) => onUpload(c._id, files)}
              onRemove={(key) => onRemovePhoto(c._id, key)}
            />
          </div>
        ))}
      </div>

      {collections.length < limits.collections && (
        <button
          type="button"
          onClick={onCreate}
          disabled={creating}
          className={`${secondaryButton} mt-4 w-full justify-center py-3 text-sm`}
        >
          {creating ? "Criando…" : "+ Nova coleção"}
        </button>
      )}
    </>
  );
}

// Grade de miniaturas reutilizável, com botão de upload quando há espaço.
function PhotoGrid({ photos, max, uploading, onUpload, onRemove }) {
  return (
    <div className="mt-4 grid grid-cols-3 gap-3">
      {photos.map((key) => (
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
            type="button"
            onClick={() => onRemove(key)}
            title="Remover"
            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-zinc-300 opacity-100 transition hover:text-white sm:opacity-0 sm:group-hover:opacity-100"
          >
            <XIcon size={14} />
          </button>
        </div>
      ))}

      {photos.length < max && (
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
            onChange={(e) => {
              const files = [...e.target.files];
              e.target.value = "";
              onUpload(files);
            }}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
}
