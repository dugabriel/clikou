"use client";

// Reabre o banner de consentimento (para o usuário revogar/alterar a escolha).
export default function ManageCookiesLink() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("clikou:open-consent"))}
      className="block text-left text-zinc-500 hover:text-yellow-400"
    >
      Cookies
    </button>
  );
}
