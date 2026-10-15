"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string } | undefined;

const login = z.object({ email: z.string().email("E-mail inválido"), senha: z.string().min(1, "Informe a senha") });
const cadastro = z.object({
  nome: z.string().trim().min(2, "Informe seu nome"),
  email: z.string().email("E-mail inválido"),
  senha: z.string().min(8, "A senha precisa ter ao menos 8 caracteres"),
});

export async function entrar(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = login.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: parsed.data.email, password: parsed.data.senha });
  if (error) return { error: "E-mail ou senha incorretos" };
  redirect("/agenda");
}

export async function criarConta(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = cadastro.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.senha,
    options: { data: { nome: parsed.data.nome } },
  });
  if (error) return { error: error.message.includes("registered") ? "Este e-mail já tem conta" : "Não foi possível criar a conta" };
  // Sem sessão = confirmação de e-mail ligada no Supabase
  if (!data.session) return { error: "Conta criada! Confirme seu e-mail para entrar." };
  redirect("/agenda");
}

export async function sair() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
