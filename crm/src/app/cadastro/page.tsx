import Link from "next/link";
import { AuthForm } from "../auth-form";
import { criarConta } from "../auth-actions";

export default function CadastroPage() {
  return (
    <main className="px-6 py-16">
      <h1 className="mb-1 text-3xl font-bold text-brand">Criar conta</h1>
      <p className="mb-8 text-gray-600">Leva menos de um minuto.</p>
      <AuthForm action={criarConta} submitLabel="Criar conta" withName />
      <p className="mt-6 text-center text-sm text-gray-600">
        Já tem conta? <Link href="/login" className="font-semibold text-brand">Entrar</Link>
      </p>
    </main>
  );
}
