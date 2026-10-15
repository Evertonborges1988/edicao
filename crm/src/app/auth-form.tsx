"use client";

import { useActionState } from "react";
import type { FormState } from "./auth-actions";

export function AuthForm({
  action,
  submitLabel,
  withName,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  submitLabel: string;
  withName?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className="space-y-4">
      {withName && (
        <div>
          <label className="label" htmlFor="nome">Seu nome</label>
          <input id="nome" name="nome" className="input" autoComplete="name" required />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" className="input" autoComplete="email" required />
      </div>
      <div>
        <label className="label" htmlFor="senha">Senha</label>
        <input id="senha" name="senha" type="password" className="input" autoComplete={withName ? "new-password" : "current-password"} required />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-600">{state.error}</p>}
      <button className="btn" disabled={pending}>{pending ? "Aguarde..." : submitLabel}</button>
    </form>
  );
}
