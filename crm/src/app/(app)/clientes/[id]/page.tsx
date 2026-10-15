import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { ClienteForm } from "../cliente-form";
import { excluirCliente, salvarCliente } from "../actions";
import { TZ } from "../../agenda/data";

export default async function ClientePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const supabase = await createClient();
  const [{ data: cliente }, { data: historico }] = await Promise.all([
    supabase.from("clients").select("id, nome, whatsapp, observacoes, proxima_visita").eq("id", id).maybeSingle(),
    supabase.from("appointments").select("id, servico, inicio, valor, status").eq("client_id", id).order("inicio", { ascending: false }),
  ]);
  if (!cliente) notFound();

  const concluidos = historico?.filter((a) => a.status === "concluido") ?? [];
  const total = concluidos.reduce((s, a) => s + Number(a.valor ?? 0), 0);

  return (
    <main className="space-y-6 px-4 py-4">
      <div>
        <Link href="/clientes" className="text-sm text-brand">‹ Clientes</Link>
        <h1 className="mt-2 text-2xl font-bold">{cliente.nome}</h1>
        <p className="text-sm text-gray-600">
          {concluidos.length} atendimento(s) concluído(s) · R$ {total.toFixed(2).replace(".", ",")}
        </p>
        {cliente.whatsapp && (
          <a href={`https://wa.me/55${cliente.whatsapp.replace(/^55/, "")}`} className="mt-2 inline-block rounded-lg border border-green-600 px-3 py-1.5 text-sm text-green-700">
            Abrir WhatsApp
          </a>
        )}
      </div>

      <section>
        <h2 className="mb-2 font-semibold">Histórico</h2>
        {!historico?.length && <p className="text-sm text-gray-500">Nenhum atendimento ainda.</p>}
        <ul className="space-y-2">
          {historico?.map((a) => (
            <li key={a.id} className="flex justify-between rounded-xl bg-white p-3 text-sm shadow-sm">
              <span>
                <span className="font-medium">{a.servico}</span>
                <br />
                <span className="text-gray-500">
                  {new Date(a.inicio).toLocaleString("pt-BR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" })}
                </span>
              </span>
              <span className="text-right text-gray-600">
                {a.status}
                {a.valor != null && <><br />R$ {Number(a.valor).toFixed(2).replace(".", ",")}</>}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Dados</h2>
        <ClienteForm action={salvarCliente} cliente={cliente} label="Salvar alterações" />
      </section>

      <form action={excluirCliente}>
        <input type="hidden" name="id" value={cliente.id} />
        <button className="w-full rounded-xl border border-red-200 py-3 text-red-600">Excluir cliente e histórico</button>
      </form>
    </main>
  );
}
