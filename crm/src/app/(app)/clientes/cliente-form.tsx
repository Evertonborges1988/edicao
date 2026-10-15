"use client";

import { useActionState } from "react";
import type { FormState } from "./actions";

type Cliente = { id?: string; nome?: string; whatsapp?: string | null; observacoes?: string | null; proxima_visita?: string | null };

export function ClienteForm({
  action,
  cliente,
  label,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  cliente?: Cliente;
  label: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {cliente?.id && <input type="hidden" name="id" value={cliente.id} />}
      <div>
        <label className="label" htmlFor="nome">Nome</label>
        <input id="nome" name="nome" defaultValue={cliente?.nome} className="input" required />
      </div>
      <div>
        <label className="label" htmlFor="whatsapp">WhatsApp (com DDD)</label>
        <input id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={cliente?.whatsapp ?? ""} placeholder="11999998888" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="proxima_visita">Próxima visita prevista</label>
        <input id="proxima_visita" name="proxima_visita" type="date" defaultValue={cliente?.proxima_visita ?? ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="observacoes">Observações</label>
        <textarea id="observacoes" name="observacoes" rows={4} defaultValue={cliente?.observacoes ?? ""} className="input" placeholder="Alergias, preferências, fórmula de cor..." />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      {state?.ok && <p role="status" className="text-sm text-green-700">Salvo!</p>}
      <button className="btn" disabled={pending}>{pending ? "Salvando..." : label}</button>
    </form>
  );
}
