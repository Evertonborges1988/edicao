import Link from "next/link";
import { ClienteForm } from "../cliente-form";
import { criarCliente } from "../actions";

export default function NovoClientePage() {
  return (
    <main className="px-4 py-4">
      <Link href="/clientes" className="text-sm text-brand">‹ Voltar</Link>
      <h1 className="mb-4 mt-2 text-2xl font-bold">Novo cliente</h1>
      <ClienteForm action={criarCliente} label="Salvar" />
    </main>
  );
}
