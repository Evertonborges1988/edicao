import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { hojeISO, isDia } from "../data";
import { NovoForm } from "./form";

export default async function NovoPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const supabase = await createClient();
  const { data: clientes } = await supabase.from("clients").select("id, nome").order("nome");

  return (
    <main className="px-4 py-4">
      <Link href="/agenda" className="text-sm text-brand">‹ Voltar</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Novo atendimento</h1>
      <NovoForm clientes={clientes ?? []} diaInicial={isDia(d) ? d : hojeISO()} />
    </main>
  );
}
