// Fuso fixo de Brasília (sem horário de verão desde 2019)
export const TZ = "America/Sao_Paulo";
const OFFSET = "-03:00";

export const hojeISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: TZ });

export function isDia(v: string | undefined): v is string {
  return !!v && /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v));
}

export function limitesDoDia(dia: string) {
  return { de: `${dia}T00:00:00${OFFSET}`, ate: `${dia}T23:59:59.999${OFFSET}` };
}

export function somarDias(dia: string, n: number) {
  const d = new Date(`${dia}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export const paraInstante = (dia: string, hora: string) => `${dia}T${hora}:00${OFFSET}`;

export const horaBR = (iso: string) =>
  new Date(iso).toLocaleTimeString("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });

export const diaExtenso = (dia: string) =>
  new Date(`${dia}T12:00:00Z`).toLocaleDateString("pt-BR", {
    timeZone: "UTC", weekday: "long", day: "numeric", month: "long",
  });
