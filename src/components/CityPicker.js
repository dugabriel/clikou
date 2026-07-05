"use client";

import { useEffect, useState } from "react";
import { field, label } from "@/components/ui";

export const STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

// Estado + cidade padronizados (municípios oficiais do IBGE).
export default function CityPicker({ initialState = "", initialCity = "" }) {
  const [state, setState] = useState(initialState);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) {
      setCities([]);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${state}/municipios?orderBy=nome`
    )
      .then((r) => r.json())
      .then((list) => {
        if (active) setCities(list.map((m) => m.nome));
      })
      .catch(() => {})
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [state]);

  return (
    <div className="grid grid-cols-[110px_1fr] gap-4">
      <div>
        <label className={label}>Estado *</label>
        <select
          name="state"
          required
          value={state}
          onChange={(e) => setState(e.target.value)}
          className={field}
        >
          <option value="">UF</option>
          {STATES.map((uf) => (
            <option key={uf} value={uf}>
              {uf}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Cidade *</label>
        <input
          name="city"
          required
          list="ibge-city-list"
          disabled={!state}
          autoComplete="off"
          defaultValue={initialCity}
          placeholder={
            !state
              ? "Escolha o estado primeiro"
              : loading
                ? "Carregando municípios…"
                : "Digite para buscar"
          }
          className={`${field} disabled:opacity-50`}
        />
        <datalist id="ibge-city-list">
          {cities.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
      </div>
    </div>
  );
}
