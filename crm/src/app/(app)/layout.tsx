import Link from "next/link";
import { sair } from "../auth-actions";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pb-20">
      <header className="flex items-center justify-between bg-brand px-4 py-3 text-white">
        <span className="font-bold">Agenda Bela</span>
        <form action={sair}><button className="text-sm underline">Sair</button></form>
      </header>
      {children}
      <nav className="fixed inset-x-0 bottom-0 mx-auto flex max-w-md border-t bg-white text-center text-sm">
        <Link href="/agenda" className="flex-1 py-3 font-semibold text-brand">Agenda</Link>
        <span className="flex-1 py-3 text-gray-400">Clientes (em breve)</span>
      </nav>
    </div>
  );
}
