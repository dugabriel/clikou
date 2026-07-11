"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/lib/analytics";

// O cadastro via Google acontece todo no servidor (auth/google/route.js), que
// não tem como disparar gtag. O callback marca o redirect com ?signup=google
// quando cria um usuário novo; este componente (montado no layout) vê a
// marca, conta o sign_up e limpa a URL.
export default function SignupPing() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.get("signup") !== "google") return;
    trackEvent("sign_up", { method: "google" });
    const rest = new URLSearchParams(params);
    rest.delete("signup");
    const qs = rest.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`, {
      scroll: false,
    });
  }, [params, router]);

  return null;
}
