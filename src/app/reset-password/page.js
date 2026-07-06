import { Suspense } from "react";
import ResetPasswordForm from "@/components/ResetPasswordForm";

export const metadata = { title: "Criar nova senha — Clikou" };

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
