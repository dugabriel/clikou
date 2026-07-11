import PageSpinner from "@/components/PageSpinner";

// Fallback das páginas do admin, mantendo o chrome do admin no lugar.
export default function Loading() {
  return <PageSpinner className="min-h-[40vh]" />;
}
