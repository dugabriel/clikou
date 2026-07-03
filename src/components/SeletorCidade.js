"use client";

import { useEffect, useState } from "react";
import { campo, rotulo } from "@/components/ui";

export const UFS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// Estado + cidade padronizados (municípios oficiais do IBGE).
export default function SeletorCidade({ estadoInicial = "", cidadeInicial = "" }) {
  const [estado, setEstado] = useState(estadoInicial);
  const [cidades, setCidades] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    if (!estado) {
      setCidades([]);
      return;
    }
    let ativo = true;
    setCarregando(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((lista) => {
        if (ativo) setCidades(lista.map((m) => m.nome));
      })
      .catch(() => {})
      .finally(() => ativo && setCarregando(false));
    return () => {
      ativo = false;
    };
  }, [estado]);

  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <div>
        <label className={rotulo}>Estado *</label>
        <select
          name="estado"
          required
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className={campo}
        >
          <option value="">UF</option>
          {UFS.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={rotulo}>Cidade *</label>
        <input
          name="cidade"
          required
          list="lista-cidades-ibge"
          disabled={!estado}
          autoComplete="off"
          defaultValue={cidadeInicial}
          placeholder={
            !estado
              ? "Escolha o estado primeiro"
              : carregando
                ? "Carregando municípios…"
                : "Digite para buscar"
          }
          className={`${campo} disabled:opacity-50`}
        />
        <datalist id="lista-cidades-ibge">
          {cidades.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
