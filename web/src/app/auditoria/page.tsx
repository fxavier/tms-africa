"use client";

import { RefreshCw, Download, Filter, ShieldCheck, RotateCcw, LockKeyhole, MoreVertical } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { statusVariant } from "@/types/status";

export default function AuditPage() {
  const auditLogs = useApiResource(() => api.audit.list({ size: 100 }), []);
  const rows = auditLogs.data?.content ?? [];

  return (
    <AppShell>
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <main>
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div><h1 className="text-3xl font-black tracking-tight text-slate-950">Auditoria do Sistema</h1><p className="mt-2 text-lg text-slate-500">Registo cronológico detalhado de todas as operações e alterações de dados no TMS.</p></div>
            <div className="flex gap-3"><Button variant="outline"><Download className="h-4 w-4" /> Exportar CSV</Button><Button><RefreshCw className="h-4 w-4" /> Atualizar</Button></div>
          </div>

          {auditLogs.error && <div className="mb-6"><ErrorState message={auditLogs.error} unauthorized={auditLogs.unauthorized} /></div>}
          {auditLogs.loading && <div className="mb-6"><LoadingState /></div>}

          <section className="mb-7 grid gap-5 lg:grid-cols-[220px_220px_1fr]">
            <Card><CardContent className="p-6"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Total Logs</div><div className="mt-6 text-3xl font-black">{auditLogs.data?.totalElements ?? 0}</div><p className="mt-2 text-sm font-bold text-green-600">Backend</p></CardContent></Card>
            <Card><CardContent className="p-6"><div className="text-xs font-black uppercase tracking-widest text-slate-500">Eliminações</div><div className="mt-6 text-3xl font-black">{rows.filter((row) => row.operation === "ELIMINACAO").length}</div><p className="mt-2 text-sm font-bold text-red-600">Requer atenção</p></CardContent></Card>
            <Card><CardContent className="p-6"><div className="mb-4 flex items-center gap-3"><Filter className="h-5 w-5" /><b>Filtros de Consulta</b><button className="ml-auto text-sm font-semibold">Limpar tudo</button></div><div className="grid gap-4 md:grid-cols-2"><label className="space-y-2 text-xs font-bold uppercase text-slate-500">Entidade<Select options={[{ label: "Todas as Entidades", value: "all" }]} /></label><label className="space-y-2 text-xs font-bold uppercase text-slate-500">Período<Select options={[{ label: "Últimas 24 Horas", value: "24h" }]} /></label></div></CardContent></Card>
          </section>

          <Card className="overflow-hidden">
            <div className="grid grid-cols-[140px_180px_160px_200px_140px_1fr] bg-slate-100 px-6 py-5 text-xs font-black uppercase tracking-wider text-slate-500"><span>Data/Hora</span><span>Utilizador</span><span>Entidade</span><span>Operação</span><span>ID Entidade</span><span>IP Address</span></div>
            {rows.map((log) => (
              <div key={log.id} className="grid grid-cols-[140px_180px_160px_200px_140px_1fr] items-center border-b border-slate-200 px-6 py-5 text-sm">
                <div><b>{new Date(log.occurredAt).toLocaleDateString("pt-PT")}</b><p className="text-xs text-slate-500">{new Date(log.occurredAt).toLocaleTimeString("pt-PT")}</p></div>
                <div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-xs font-bold">{log.performedBy.slice(0, 2).toUpperCase()}</span>{log.performedBy}</div>
                <span>{log.entityType}</span>
                <StatusBadge variant={statusVariant(log.operation)}>{log.operation}</StatusBadge>
                <span className="text-slate-500">{log.entityId}</span>
                <span className="text-slate-500">{log.ipAddress ?? "-"}</span>
              </div>
            ))}
            <Pagination total={`${auditLogs.data?.totalElements ?? 0}`} />
          </Card>

          <section className="mt-8 grid gap-5 md:grid-cols-3">
            <InfoCard icon={ShieldCheck} title="Segurança de Dados" text="Todos os logs são assinados digitalmente e imutáveis." />
            <InfoCard icon={RotateCcw} title="Rastreabilidade" text="O sistema regista alterações de antes e depois." />
            <InfoCard icon={LockKeyhole} title="Conformidade RGPD" text="Os dados sensíveis são mascarados nos logs públicos." />
          </section>
        </main>

        <aside className="hidden border-l border-slate-200 bg-white p-7 xl:block">
          <div className="flex items-center justify-between"><h2 className="text-xl font-bold">Detalhes da Transação</h2><MoreVertical className="h-5 w-5" /></div>
          <div className="mt-10 rounded-2xl border border-slate-200 p-5"><b>Selecione uma linha</b><p className="mt-2 text-sm leading-6 text-slate-500">Os valores anteriores e novos serão apresentados neste painel lateral para comparação auditável.</p></div>
        </aside>
      </div>
    </AppShell>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof ShieldCheck; title: string; text: string }) {
  return <div className="flex gap-4"><Icon className="h-6 w-6 text-blue-600" /><div><b className="text-sm uppercase tracking-wide">{title}</b><p className="mt-2 text-sm text-slate-500">{text}</p></div></div>;
}
