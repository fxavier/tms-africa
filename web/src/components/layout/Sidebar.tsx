"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HelpCircle, LogOut, PlusCircle, Truck } from "lucide-react";
import { cn } from "@/lib/utils";
import { navItems } from "@/config/navigation";
import { logoutFromKeycloak } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();
  let lastGroup: string | undefined;

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div className="flex h-28 items-center gap-3 px-7">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-950 text-white shadow-soft">
          <Truck className="h-6 w-6" />
        </div>
        <div>
          <div className="text-lg font-black tracking-tight text-slate-950">LogiTrack Pro</div>
          <div className="mt-1 text-sm font-medium text-slate-500">Gestão TMS</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-4 py-4">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href.split("/").slice(0, 2).join("/")));
          const showGroup = item.group && item.group !== lastGroup;
          if (item.group) lastGroup = item.group;
          const Icon = item.icon;

          return (
            <div key={item.href}>
              {showGroup && <div className="mb-2 mt-6 px-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{item.group}</div>}
              <Link
                href={item.href}
                className={cn(
                  "relative flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950",
                  active && "nav-item-active before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-full before:bg-slate-950",
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </div>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-200 p-4">
        <Button asChild className="w-full">
          <Link href="/atividades/nova">
            <PlusCircle className="h-4 w-4" /> Novo Serviço
          </Link>
        </Button>
        <Link href="#" className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
          <HelpCircle className="h-5 w-5" /> Suporte
        </Link>
        <button type="button" onClick={() => void logoutFromKeycloak()} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600">
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </div>
    </aside>
  );
}
