import Link from "next/link";
import { AuthForm } from "../auth-form";
import { entrar } from "../auth-actions";

export default function LoginPage() {
  return (
    <main className="px-6 py-16">
      <h1 className="mb-1 text-3xl font-bold text-brand">Agenda Bela</h1>
      <p className="mb-8 text-gray-600">Entre para ver sua agenda.</p>
      <AuthForm action={entrar} submitLabel="Entrar" />
      <p className="mt-6 text-center text-sm text-gray-600">
        Ainda não tem conta? <Link href="/cadastro" className="font-semibold text-brand">Cadastre-se</Link>
      </p>
    </main>
  );
}
