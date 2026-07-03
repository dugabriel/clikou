import { Suspense } from "react";
import FormLogin from "@/components/FormLogin";

export const metadata = { title: "Entrar — Clikou" };

export default function Login() {
  return (
    <Suspense>
      <FormLogin />
    </Suspense>
  );
}
