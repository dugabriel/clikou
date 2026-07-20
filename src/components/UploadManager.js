"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { XIcon } from "@/components/Icons";

// Gerenciador global de upload, estilo Google Drive: as fotos entram numa
// fila que roda em segundo plano (3 por vez, para não afogar o celular nem o
// servidor) e um cartão flutuante mostra o progresso. Como o provider vive no
// layout, navegar entre telas do site não interrompe o envio — só fechar ou
// recarregar a aba (daí o aviso de beforeunload).
const CONCURRENCY = 3;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = [1000, 4000];
const REFRESH_INTERVAL_MS = 4000;

const UploadContext = createContext(null);

export function useUploader() {
  return useContext(UploadContext);
}

export default function UploadProvider({ children }) {
  const router = useRouter();
  // A fila mora no ref (fonte da verdade, lida pelos callbacks assíncronos
  // sem closure velha); o state é só o espelho que o cartão renderiza.
  const itemsRef = useRef([]);
  const [items, setItems] = useState([]);
  const [minimized, setMinimized] = useState(false);
  // Fotos puladas no último enfileiramento por já estarem enviadas.
  const [skipped, setSkipped] = useState(0);
  const controllersRef = useRef(new Map());
  const timersRef = useRef(new Set());
  const lastRefreshRef = useRef(0);
  // Extração de rostos é pesada — roda um arquivo por vez (corrente de
  // promises), enquanto a rede segue com os uploads em paralelo.
  const extractChainRef = useRef(Promise.resolve(null));

  function sync() {
    setItems(itemsRef.current);
  }

  function patch(id, changes) {
    itemsRef.current = itemsRef.current.map((i) =>
      i.id === id ? { ...i, ...changes } : i
    );
    sync();
  }

  // O grid de fotos da galeria é renderizado no servidor; um refresh de vez
  // em quando (e um no fim) faz as fotos irem aparecendo durante o envio.
  function refreshSoon(force) {
    const now = Date.now();
    if (!force && now - lastRefreshRef.current < REFRESH_INTERVAL_MS) return;
    lastRefreshRef.current = now;
    router.refresh();
  }

  // Ocupa os slots livres com os próximos da fila. Chamada em todo evento
  // que muda a fila: enfileirar, término de upload, timer de retry.
  function pump() {
    const list = itemsRef.current;
    const uploading = list.filter((i) => i.status === "uploading").length;
    const toStart = list
      .filter((i) => i.status === "pending")
      .slice(0, Math.max(0, CONCURRENCY - uploading));
    if (toStart.length === 0) {
      const busy = list.some(
        (i) => i.status === "uploading" || i.status === "waiting"
      );
      if (list.length > 0 && !busy) refreshSoon(true);
      return;
    }
    const ids = new Set(toStart.map((i) => i.id));
    itemsRef.current = list.map((i) =>
      ids.has(i.id) ? { ...i, status: "uploading" } : i
    );
    sync();
    toStart.forEach(uploadOne);
  }

  // Descritores de rosto para o "ache-se por selfie" da galeria. Falhou a
  // análise? A foto sobe do mesmo jeito, só não entra na busca.
  function extractFaces(item) {
    const run = async () => {
      try {
        const { extractDescriptors } = await import("@/lib/face");
        const faces = await extractDescriptors(item.file);
        return faces.length > 0 ? JSON.stringify(faces.slice(0, 30)) : null;
      } catch {
        return null;
      }
    };
    const p = extractChainRef.current.then(run, run);
    extractChainRef.current = p.catch(() => null);
    return p;
  }

  async function uploadOne(item) {
    const controller = new AbortController();
    controllersRef.current.set(item.id, controller);
    let outcome;
    try {
      const form = new FormData();
      form.append("file", item.file, item.name);
      for (const [key, value] of Object.entries(item.fields || {})) {
        form.append(key, value);
      }
      if (item.indexFaces) {
        const facesJson = await extractFaces(item);
        if (facesJson) form.append("faces", facesJson);
      }
      const res = await fetch(item.endpoint, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (res.ok) {
        outcome = { status: "done" };
      } else {
        const data = await res.json().catch(() => ({}));
        // 4xx (moderação, arquivo inválido) não adianta repetir; 5xx sim.
        outcome = {
          status: res.status >= 500 ? "retry" : "error",
          error: data.error || `Erro ${res.status}`,
        };
      }
    } catch (err) {
      outcome =
        err.name === "AbortError"
          ? { status: "cancelled" }
          : { status: "retry", error: "Falha de rede" };
    }
    controllersRef.current.delete(item.id);

    if (outcome.status === "cancelled") return;

    if (outcome.status === "retry" && item.attempts + 1 < MAX_ATTEMPTS) {
      // Enquanto espera o retry, o slot fica livre para o próximo da fila.
      patch(item.id, { status: "waiting" });
      const delay = RETRY_DELAY_MS[item.attempts] || 4000;
      const timer = setTimeout(() => {
        timersRef.current.delete(timer);
        patch(item.id, { status: "pending", attempts: item.attempts + 1 });
        pump();
      }, delay);
      timersRef.current.add(timer);
      pump();
      return;
    }

    if (outcome.status === "done") {
      patch(item.id, { status: "done", file: null }); // solta o File da memória
      refreshSoon(false);
    } else {
      patch(item.id, { status: "error", error: outcome.error });
    }
    pump();
  }

  // endpoint: rota POST multipart que recebe um "file" por requisição;
  // fields: campos extras do FormData (ex.: preço no upload de evento).
  // existing: [{name, size}] já no servidor — reenvio do mesmo arquivo
  // (nome + tamanho) é pulado, para retomar um envio interrompido sem
  // duplicar nada.
  function enqueue({
    endpoint,
    files,
    label,
    fields,
    indexFaces = false,
    existing = [],
  }) {
    // Compara pelo nome SEM extensão + tamanho: HEIC convertido no servidor
    // é salvo como .jpg, mas o arquivo re-selecionado ainda chama .heic.
    const baseKey = (name, size) =>
      `${String(name).replace(/\.[^.]+$/, "").toLowerCase()}::${size}`;
    const baseName = (name) =>
      String(name).replace(/\.[^.]+$/, "").toLowerCase();

    const known = new Set();
    const knownNames = new Set(); // legado: registro sem tamanho salvo
    for (const e of existing) {
      if (e.size) known.add(baseKey(e.name, e.size));
      else if (e.name) knownNames.add(baseName(e.name));
    }
    // O que já subiu (ou está na fila) nesta sessão para o mesmo destino.
    for (const i of itemsRef.current) {
      if (i.endpoint === endpoint && i.status !== "error") {
        known.add(baseKey(i.name, i.size));
      }
    }

    const newItems = [];
    let skippedCount = 0;
    for (const file of [...files]) {
      const name = file.name || "foto.jpg";
      const key = baseKey(name, file.size);
      if (known.has(key) || knownNames.has(baseName(name))) {
        skippedCount++;
        continue;
      }
      known.add(key); // também deduplica dentro da própria seleção
      newItems.push({
        id: crypto.randomUUID(),
        endpoint,
        label,
        fields,
        indexFaces,
        file,
        name,
        size: file.size,
        status: "pending",
        attempts: 0,
        error: "",
      });
    }

    setSkipped(skippedCount);
    setMinimized(false);
    if (newItems.length === 0) return; // só puladas — o cartão avisa

    // Envio novo limpa o histórico concluído do cartão anterior.
    itemsRef.current = [
      ...itemsRef.current.filter(
        (i) => i.status !== "done" && i.status !== "error"
      ),
      ...newItems,
    ];
    sync();
    pump();
  }

  function retryFailed() {
    itemsRef.current = itemsRef.current.map((i) =>
      i.status === "error" && i.file
        ? { ...i, status: "pending", attempts: 0, error: "" }
        : i
    );
    sync();
    pump();
  }

  function cancelAll() {
    timersRef.current.forEach(clearTimeout);
    timersRef.current.clear();
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
    itemsRef.current = itemsRef.current.filter((i) => i.status === "done");
    sync();
    refreshSoon(true);
  }

  function dismiss() {
    itemsRef.current = [];
    setSkipped(0);
    sync();
  }

  const pendingCount = items.filter((i) => i.status === "pending").length;
  const uploadingCount = items.filter((i) => i.status === "uploading").length;
  const waitingCount = items.filter((i) => i.status === "waiting").length;
  const doneCount = items.filter((i) => i.status === "done").length;
  const failed = items.filter((i) => i.status === "error");
  const active = pendingCount + uploadingCount + waitingCount > 0;
  const total = items.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  // Sair do site (fechar/recarregar a aba) perde os arquivos da fila — a
  // navegação interna não passa por aqui e segue livre.
  useEffect(() => {
    if (!active) return;
    function warn(e) {
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [active]);

  return (
    <UploadContext.Provider value={{ enqueue, active }}>
      {children}

      {(total > 0 || skipped > 0) && (
        <div className="fixed bottom-4 right-4 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">
                {active
                  ? `Enviando ${Math.min(doneCount + 1, total)} de ${total}…`
                  : total === 0
                    ? "Nenhuma foto nova para enviar"
                    : failed.length > 0
                      ? `${doneCount} enviada${doneCount === 1 ? "" : "s"}, ${failed.length} com erro`
                      : `${doneCount} foto${doneCount === 1 ? "" : "s"} enviada${doneCount === 1 ? "" : "s"} ✓`}
              </p>
              {items[0]?.label && (
                <p className="truncate text-xs text-zinc-500">
                  {items[0].label}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setMinimized((m) => !m)}
              className="text-zinc-400 hover:text-white"
              aria-label={minimized ? "Expandir" : "Minimizar"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${minimized ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {!active && (
              <button
                type="button"
                onClick={dismiss}
                className="text-zinc-400 hover:text-white"
                aria-label="Fechar"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          {total > 0 && (
            <div className="h-1 bg-zinc-800">
              <div
                className={`h-full transition-all ${active ? "bg-yellow-400" : failed.length > 0 ? "bg-red-400" : "bg-emerald-400"}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          )}

          {!minimized && (
            <div className="px-4 py-3 text-sm">
              {skipped > 0 && (
                <p className="mb-1.5 text-zinc-400">
                  {skipped} foto{skipped === 1 ? "" : "s"} já enviada
                  {skipped === 1 ? "" : "s"} antes — pulada
                  {skipped === 1 ? "" : "s"} ✓
                </p>
              )}
              {active && (
                <>
                  <p className="text-zinc-400">
                    {uploadingCount} enviando · {pendingCount + waitingCount}{" "}
                    na fila · {doneCount} concluída{doneCount === 1 ? "" : "s"}
                  </p>
                  <p className="mt-1.5 text-xs text-zinc-500">
                    Pode continuar usando o site — só não feche esta aba.
                  </p>
                </>
              )}

              {failed.length > 0 && (
                <div className="mt-2 max-h-36 space-y-1 overflow-y-auto">
                  {failed.map((i) => (
                    <p
                      key={i.id}
                      className="break-words text-xs text-red-400"
                    >
                      {i.name}: {i.error}
                    </p>
                  ))}
                </div>
              )}

              {(active || failed.length > 0) && (
                <div className="mt-3 flex gap-3">
                  {failed.length > 0 && !active && (
                    <button
                      type="button"
                      onClick={retryFailed}
                      className="rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-zinc-950 hover:bg-yellow-300"
                    >
                      Tentar novamente ({failed.length})
                    </button>
                  )}
                  {active && (
                    <button
                      type="button"
                      onClick={cancelAll}
                      className="rounded-lg border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:border-zinc-500"
                    >
                      Cancelar envio
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </UploadContext.Provider>
  );
}
