"use client";

import Link from "next/link";
import { BellRing, CheckSquare, Cloud, Edit, Plus, Settings, SlidersHorizontal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum } from "@/types/status";

export default function SettingsPage() {
  const alertConfigurations = useApiResource(() => api.alertConfigurations.list(), []);
  const checklistTemplates = useApiResource(() => api.checklistTemplates.list(), []);
  const alertRows = alertConfigurations.data ?? [];
  const templateRows = checklistTemplates.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Configurações do Sistema"
        subtitle="Gerencie parâmetros operacionais, checklists e preferências globais do TMS."
        actions={<><Button variant="outline">Descartar</Button><Button>Guardar Alterações</Button></>}
      />

      {(alertConfigurations.error || checklistTemplates.error) && <div className="mb-6"><ErrorState message={alertConfigurations.error ?? checklistTemplates.error ?? ""} unauthorized={alertConfigurations.unauthorized || checklistTemplates.unauthorized} /></div>}
      {(alertConfigurations.loading || checklistTemplates.loading) && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-8 xl:grid-cols-[1fr_470px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100"><BellRing className="h-5 w-5" /></span><div><CardTitle>Períodos de Alerta Operacional</CardTitle><p className="text-sm text-slate-500">Definição de limiares temporais para notificações de manutenção e documentos.</p></div></div>
              <Button asChild variant="ghost" size="icon"><Link href="/configuracoes/novo"><Plus className="h-5 w-5" /></Link></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_120px_120px_120px] rounded-xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-500"><span>Tipo de Evento</span><span>Aviso (Dias)</span><span>Crítico (Dias)</span><span>Destinatários</span></div>
              {alertRows.map((config) => (
                <div key={config.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center border-b border-slate-200 px-5 py-5">
                  <b className="text-lg">{humanizeEnum(config.alertType)} <span className="text-sm text-slate-500">({config.entityType})</span></b><Input className="w-20" defaultValue={config.daysBeforeWarning ?? 0} /><Input className="w-20 text-red-600" defaultValue={config.daysBeforeCritical ?? 0} /><div className="flex -space-x-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-slate-700 ring-2 ring-white">{config.active ? "ON" : "OFF"}</span></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><SlidersHorizontal className="h-5 w-5" /> Preferências Gerais da Plataforma</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-5">
                  <div className="flex items-center gap-4"><span className="w-32 font-semibold">Fuso Horário</span><span className="rounded-xl bg-slate-100 px-4 py-3">(UTC+00:00) Lisboa</span></div>
                  <div className="flex items-center gap-4"><span className="w-32 font-semibold">Unidade de Medida</span><div className="rounded-xl bg-slate-100 p-1"><button className="rounded-lg bg-white px-5 py-3 font-bold shadow-sm">Quilómetros (km)</button><button className="px-5 py-3 text-slate-500">Milhas (mi)</button></div></div>
                </div>
                <div className="space-y-5 border-l border-slate-200 pl-8">
                  <Toggle label="Modo Escuro Automático" enabled />
                  <Toggle label="Relatórios Semanais (Email)" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <CardHeader className="flex-row items-center justify-between"><CardTitle className="flex items-center gap-3"><CheckSquare className="h-5 w-5" /> Gestão de Templates de Checklist</CardTitle><Settings className="h-6 w-6" /></CardHeader>
          <div className="border-y border-slate-200 p-6"><Input placeholder="Filtrar templates..." /></div>
          <CardContent className="space-y-4 p-6">
            {templateRows.map((template) => (
              <div key={template.id ?? template.name} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green-600"><CheckSquare className="h-6 w-6" /></div>
                <div className="flex-1"><b>{template.name}</b><p className="text-sm text-slate-500">{template.items.length} itens de verificação</p><div className="mt-3 flex flex-wrap gap-2"><StatusBadge variant={template.active ? "success" : "secondary"}>{template.active ? "Ativo" : "Inativo"}</StatusBadge>{template.vehicleType && <StatusBadge variant="secondary">{template.vehicleType}</StatusBadge>}</div></div>
                <Edit className="h-5 w-5 text-slate-500" />
              </div>
            ))}
            <Button asChild variant="outline" className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 text-slate-500"><Link href="/configuracoes/novo"><Plus className="h-5 w-5" /> Criar Novo Template</Link></Button>
          </CardContent>
          <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-500"><Cloud className="h-5 w-5" /> Todos os templates estão sincronizados com a aplicação móvel dos motoristas.</div>
        </Card>
      </section>

      <footer className="mt-10 flex flex-wrap items-center gap-8 border-t border-slate-200 pt-6 text-sm text-slate-500"><span>Última alteração: Hoje às 09:42 por João Silva</span><span>Versão do Sistema: 2.4.0-Enterprise</span><a className="ml-auto underline">Termos de Utilização</a><a className="underline">Política de Privacidade</a></footer>
    </AppShell>
  );
}

function Toggle({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return <div className="flex items-center justify-between"><span className="font-semibold">{label}</span><span className={enabled ? "flex h-7 w-12 items-center rounded-full bg-slate-950 p-1" : "flex h-7 w-12 items-center rounded-full bg-slate-300 p-1 justify-end"}><span className="h-5 w-5 rounded-full bg-white" /></span></div>;
}
