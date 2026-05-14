"use client";

import { usePathname } from "next/navigation";
import { Bell, HelpCircle, LogOut, Search } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { getStoredUser, logoutFromKeycloak } from "@/lib/auth";

const context: Record<string, { placeholder: string; user: string; role: string }> = {
  "/dashboard": { placeholder: "Pesquisar viaturas, motoristas ou rotas...", user: "João Silva", role: "Gestor de Frota" },
  "/viaturas": { placeholder: "Pesquisar em Viaturas...", user: "João Oliveira", role: "Gestor de Frota" },
  "/motoristas": { placeholder: "Procurar motoristas, documentos...", user: "Admin LogiTrack", role: "Gestor de Frota" },
  "/atividades": { placeholder: "Pesquisar por atividade, viatura ou motorista...", user: "Admin LogiTrack", role: "Administrador" },
  "/alertas": { placeholder: "Procurar alertas por viatura ou motorista...", user: "João Oliveira", role: "Gestor de Operações" },
  "/auditoria": { placeholder: "Pesquisar em logs de auditoria...", user: "Admin Central", role: "Gestor de Sistema" },
  "/utilizadores": { placeholder: "Pesquisar utilizadores, funções ou acessos...", user: "Carlos Mendes", role: "Administrador" },
  "/recursos-humanos": { placeholder: "Pesquisar em Recursos Humanos...", user: "André Santos", role: "Gestor de RH" },
  "/configuracoes": { placeholder: "Pesquisar configurações...", user: "Administrador", role: "admin@logitrack.pt" },
};

export function Topbar() {
  const pathname = usePathname();
  const key = Object.keys(context).find((item) => pathname.startsWith(item)) ?? "/dashboard";
  const settings = context[key];
  const user = getStoredUser();
  const displayName = user ? [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username : settings.user;
  const displayRole = user?.roles?.[0] ?? settings.role;

  return (
    <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur lg:ml-[260px]">
      <div className="relative w-full max-w-[520px]">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
        <input
          className="h-11 w-full rounded-xl border border-transparent bg-slate-100 px-12 text-sm outline-none transition placeholder:text-slate-500 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
          placeholder={settings.placeholder}
        />
      </div>
      <div className="ml-6 flex items-center gap-5">
        <div className="hidden items-center gap-2 text-sm font-medium text-slate-600 md:flex">
          <HelpCircle className="h-5 w-5" /> Suporte Técnico
        </div>
        <div className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white">
          <Bell className="h-5 w-5 text-slate-700" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500" />
        </div>
        <div className="hidden h-9 w-px bg-slate-200 md:block" />
        <button
          className="hidden items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:flex"
          onClick={() => void logoutFromKeycloak()}
          type="button"
        >
          <LogOut className="h-4 w-4" /> Sair
        </button>
        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <div className="text-sm font-bold text-slate-950">{displayName}</div>
            <div className="text-xs font-medium text-slate-500">{displayRole}</div>
          </div>
          <Avatar name={displayName} />
        </div>
      </div>
    </header>
  );
}
