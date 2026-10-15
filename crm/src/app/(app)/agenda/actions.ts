"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { paraInstante } from "./data";

export type FormState = { error?: string } | undefined;

const schema = z.object({
  client_id: z.string().uuid().optional().or(z.literal("")),
  novo_nome: z.string().trim().optional(),
  novo_whatsapp: z.string().trim().optional(),
  servico: z.string().trim().min(2, "Informe o serviço"),
  dia: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Hora inválida"),
  duracao_min: z.coerce.number().int().min(5, "Duração inválida").max(720),
  valor: z.string().optional(),
});

export async function criarAtendimento(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = schema.safeParse(Object.fromEntries(fd));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const f = parsed.data;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let clientId = f.client_id || "";
  if (!clientId) {
    if (!f.novo_nome) return { error: "Escolha um cliente ou informe o nome do novo" };
    const { data, error } = await supabase
      .from("clients")
      .insert({ user_id: user.id, nome: f.novo_nome, whatsapp: f.novo_whatsapp?.replace(/\D/g, "") || null })
      .select("id")
      .single();
    if (error) return { error: "Não foi possível salvar o cliente" };
    clientId = data.id;
  }

  const valor = f.valor ? Number(f.valor.replace(",", ".")) : null;
  if (valor !== null && Number.isNaN(valor)) return { error: "Valor inválido" };

  const { error } = await supabase.from("appointments").insert({
    user_id: user.id,
    client_id: clientId,
    servico: f.servico,
    inicio: paraInstante(f.dia, f.hora),
    duracao_min: f.duracao_min,
    valor,
  });
  if (error) return { error: "Não foi possível salvar o atendimento" };

  revalidatePath("/agenda");
  redirect(`/agenda?d=${f.dia}`);
}

export async function mudarStatus(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const status = z.enum(["agendado", "concluido", "cancelado", "faltou"]).parse(fd.get("status"));
  const supabase = await createClient();
  await supabase.from("appointments").update({ status }).eq("id", id);
  revalidatePath("/agenda");
}

export async function excluirAtendimento(fd: FormData) {
  const id = z.string().uuid().parse(fd.get("id"));
  const supabase = await createClient();
  await supabase.from("appointments").delete().eq("id", id);
  revalidatePath("/agenda");
}
