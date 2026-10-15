"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; ok?: boolean } | undefined;

const schema = z.object({
  nome: z.string().trim().min(2, "Informe o nome"),
  whatsapp: z.string().optional(),
  observacoes: z.string().trim().optional(),
  proxima_visita: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

function campos(fd: FormData) {
  const p = schema.safeParse(Object.fromEntries(fd));
  if (!p.success) return { error: p.error.issues[0].message } as const;
  const d = p.data;
  const whatsapp = d.whatsapp?.replace(/\D/g, "") || null;
  if (whatsapp && (whatsapp.length < 10 || whatsapp.length > 13)) return { error: "WhatsApp inválido (use DDD + número)" } as const;
  return {
    values: { nome: d.nome, whatsapp, observacoes: d.observacoes || null, proxima_visita: d.proxima_visita || null },
  } as const;
}

export async function criarCliente(_: FormState, fd: FormData): Promise<FormState> {
  const c = campos(fd);
  if ("error" in c) return { error: c.error };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data, error } = await supabase.from("clients").insert({ ...c.values, user_id: user.id }).select("id").single();
  if (error) return { error: "Não foi possível salvar o cliente" };
  revalidatePath("/clientes");
  redirect(`/clientes/${data.id}`);
}

export async function salvarCliente(_: FormState, fd: FormData): Promise<FormState> {
  const id = z.string().uuid().safeParse(fd.get("id"));
  if (!id.success) return { error: "Cliente inválido" };
  const c = campos(fd);
  if ("error" in c) return { error: c.error };
  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(c.values).eq("id", id.data);
  if (error) return { error: "Não foi possível salvar" };
  revalidatePath(`/clientes/${id.data}`);
  revalidatePath("/clientes");
  return { ok: true };
}

export async function excluirCliente(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const supabase = await createClient();
  await supabase.from("clients").delete().eq("id", id);
  revalidatePath("/clientes");
  redirect("/clientes");
}
