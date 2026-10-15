import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { diaExtenso, hojeISO, horaBR, isDia, limitesDoDia, somarDias } from "./data";
import { excluirAtendimento, mudarStatus } from "./actions";

const COR: Record<string, string> = {
  agendado: "bg-pink-100 text-pink-800",
  concluido: "bg-green-100 text-green-800",
  cancelado: "bg-gray-200 text-gray-600",
  faltou: "bg-red-100 text-red-700",
};

export default async function AgendaPage({ searchParams }: { searchParams: Promise<{ d?: string }> }) {
  const { d } = await searchParams;
  const dia = isDia(d) ? d : hojeISO();
  const { de, ate } = limitesDoDia(dia);

  const supabase = await createClient();
  const { data: itens } = await supabase
    .from("appointments")
    .select("id, servico, inicio, duracao_min, valor, status, clients(nome, whatsapp)")
    .gte("inicio", de)
    .lte("inicio", ate)
    .order("inicio");

  return (
    <main className="px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/agenda?d=${somarDias(dia, -1)}`} className="rounded-lg bg-white px-3 py-2 shadow-sm" aria-label="Dia anterior">‹</Link>
        <div className="text-center">
          <p className="font-semibold capitalize">{diaExtenso(dia)}</p>
          {dia !== hojeISO() && <Link href="/agenda" className="text-xs text-brand">Voltar para hoje</Link>}
        </div>
        <Link href={`/agenda?d=${somarDias(dia, 1)}`} className="rounded-lg bg-white px-3 py-2 shadow-sm" aria-label="Próximo dia">›</Link>
      </div>

      {!itens?.length && <p className="py-12 text-center text-gray-500">Nenhum atendimento neste dia.</p>}

      <ul className="space-y-3">
        {itens?.map((a) => {
          const cliente = Array.isArray(a.clients) ? a.clients[0] : a.clients;
          return (
            <li key={a.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-lg font-bold">{horaBR(a.inicio)} <span className="text-sm font-normal text-gray-500">· {a.duracao_min} min</span></p>
                  <p className="font-medium">{cliente?.nome}</p>
                  <p className="text-sm text-gray-600">{a.servico}{a.valor != null && ` · R$ ${Number(a.valor).toFixed(2).replace(".", ",")}`}</p>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${COR[a.status]}`}>{a.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                {a.status === "agendado" && (
                  <>
                    <Acao id={a.id} status="concluido" label="Concluir" />
                    <Acao id={a.id} status="faltou" label="Faltou" />
                    <Acao id={a.id} status="cancelado" label="Cancelar" />
                  </>
                )}
                {a.status !== "agendado" && <Acao id={a.id} status="agendado" label="Reabrir" />}
                <form action={excluirAtendimento}>
                  <input type="hidden" name="id" value={a.id} />
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600">Excluir</button>
                </form>
              </div>
            </li>
          );
        })}
      </ul>

      <Link href={`/agenda/novo?d=${dia}`} className="fixed bottom-20 right-4 rounded-full bg-brand px-5 py-4 font-semibold text-white shadow-lg">
        + Atendimento
      </Link>
    </main>
  );
}

function Acao({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={mudarStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-lg border border-gray-300 px-3 py-1.5">{label}</button>
    </form>
  );
}
