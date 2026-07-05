import { Suspense } from "react";
import SignupForm from "@/components/SignupForm";

export const metadata = { title: "Criar conta — Clikou" };

export default function Signup() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
