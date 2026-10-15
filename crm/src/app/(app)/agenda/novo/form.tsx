"use client";

import { useActionState, useState } from "react";
import { criarAtendimento } from "../actions";

export function NovoForm({ clientes, diaInicial }: { clientes: { id: string; nome: string }[]; diaInicial: string }) {
  const [state, action, pending] = useActionState(criarAtendimento, undefined);
  const [clientId, setClientId] = useState("");

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="label" htmlFor="client_id">Cliente</label>
        <select id="client_id" name="client_id" className="input" value={clientId} onChange={(e) => setClientId(e.target.value)}>
          <option value="">+ Novo cliente</option>
          {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>
      </div>

      {!clientId && (
        <div className="space-y-4 rounded-xl bg-brand-soft p-3">
          <div>
            <label className="label" htmlFor="novo_nome">Nome do cliente</label>
            <input id="novo_nome" name="novo_nome" className="input" autoComplete="off" />
          </div>
          <div>
            <label className="label" htmlFor="novo_whatsapp">WhatsApp (com DDD)</label>
            <input id="novo_whatsapp" name="novo_whatsapp" inputMode="tel" placeholder="11999998888" className="input" />
          </div>
        </div>
      )}

      <div>
        <label className="label" htmlFor="servico">Serviço</label>
        <input id="servico" name="servico" className="input" placeholder="Corte, escova, limpeza de pele..." required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="dia">Dia</label>
          <input id="dia" name="dia" type="date" defaultValue={diaInicial} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="hora">Hora</label>
          <input id="hora" name="hora" type="time" className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="duracao_min">Duração (min)</label>
          <input id="duracao_min" name="duracao_min" type="number" inputMode="numeric" defaultValue={60} className="input" required />
        </div>
        <div>
          <label className="label" htmlFor="valor">Valor (R$)</label>
          <input id="valor" name="valor" inputMode="decimal" className="input" />
        </div>
      </div>

      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Salvando..." : "Salvar"}</button>
    </form>
  );
}
