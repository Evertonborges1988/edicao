-- Data prevista da próxima visita (usada depois nos lembretes de WhatsApp)
alter table public.clients add column proxima_visita date;
