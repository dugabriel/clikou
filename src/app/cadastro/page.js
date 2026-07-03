import { Suspense } from "react";
import FormCadastro from "@/components/FormCadastro";

export const metadata = { title: "Criar conta — Clikou" };

export default function Cadastro() {
  return (
    <Suspense>
      <FormCadastro />
    </Suspense>
  );
}
