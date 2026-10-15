import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function ClientesPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const supabase = await createClient();
  let query = supabase.from("clients").select("id, nome, whatsapp, proxima_visita").order("nome");
  const termo = q?.trim().replace(/[%,()]/g, "");
  if (termo) query = query.ilike("nome", `%${termo}%`);
  const { data: clientes } = await query;

  return (
    <main className="px-4 py-4">
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar cliente..." className="input" type="search" />
      </form>
      {!clientes?.length && <p className="py-12 text-center text-gray-500">{termo ? "Nenhum cliente encontrado." : "Você ainda não tem clientes."}</p>}
      <ul className="space-y-2">
        {clientes?.map((c) => (
          <li key={c.id}>
            <Link href={`/clientes/${c.id}`} className="block rounded-2xl bg-white p-4 shadow-sm">
              <p className="font-semibold">{c.nome}</p>
              <p className="text-sm text-gray-500">
                {c.whatsapp ?? "sem WhatsApp"}
                {c.proxima_visita && ` · volta em ${c.proxima_visita.split("-").reverse().join("/")}`}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      <Link href="/clientes/novo" className="fixed bottom-20 right-4 rounded-full bg-brand px-5 py-4 font-semibold text-white shadow-lg">
        + Cliente
      </Link>
    </main>
  );
}
