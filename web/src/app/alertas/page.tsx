"use client";

import { AlertTriangle, Check, Eye, Filter, Info, Plus, Siren } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { api } from "@/lib/api";
import type { AlertResponseDto, AlertSeverity } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function AlertsPage() {
  const alerts = useApiResource(() => api.alerts.list({ resolved: false, size: 100 }), []);
  const rows = alerts.data?.content ?? [];
  const critical = rows.filter((alert) => alert.severity === "CRITICO");
  const warning = rows.filter((alert) => alert.severity === "AVISO");
  const info = rows.filter((alert) => alert.severity === "INFO");

  return (
    <AppShell>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">Gestão de Alertas</h1>
        <Input className="max-w-lg" placeholder="Procurar alertas por viatura ou motorista..." />
      </div>

      {alerts.error && <div className="mb-6"><ErrorState message={alerts.error} unauthorized={alerts.unauthorized} /></div>}
      {alerts.loading && <div className="mb-6"><LoadingState /></div>}

      <div className="mb-8 grid gap-4 lg:grid-cols-[460px_1fr] lg:items-end">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-bold uppercase text-slate-500">Severidade<Select options={[{ label: "Todas as Severidades", value: "all" }]} /></label>
          <label className="space-y-2 text-sm font-bold uppercase text-slate-500">Período<Select options={[{ label: "Últimas 24 Horas", value: "24h" }]} /></label>
          <Button className="sm:col-span-1"><Filter className="h-4 w-4" /> Aplicar Filtros</Button>
        </div>
        <div className="flex justify-end gap-5">
          <SummaryAlert count={String(critical.length)} label="Críticos" variant="danger" icon={Siren} />
          <SummaryAlert count={String(warning.length)} label="Avisos" variant="warning" icon={AlertTriangle} />
          <SummaryAlert count={String(info.length)} label="Info" variant="info" icon={Info} />
        </div>
      </div>

      <section className="grid gap-7 xl:grid-cols-3">
        <AlertColumn title="Críticos" count={String(critical.length)} severity="CRITICO" variant="danger" items={critical} />
        <AlertColumn title="Avisos" count={String(warning.length)} severity="AVISO" variant="warning" items={warning} />
        <AlertColumn title="Informação" count={String(info.length)} severity="INFO" variant="info" items={info} />
      </section>

      <Card className="mt-10 overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 p-6"><h2 className="text-2xl font-bold">Registo Recente de Alertas</h2><Button variant="link">Ver Histórico Completo</Button></div>
        <div className="grid grid-cols-[180px_180px_1fr_250px_180px_80px] bg-slate-100 px-6 py-4 text-xs font-black uppercase tracking-wider text-slate-500"><span>Data/Hora</span><span>Severidade</span><span>Tipo</span><span>Entidade</span><span>Estado</span><span>Ações</span></div>
        {rows.slice(0, 5).map((alert) => (
          <div key={alert.id} className="grid grid-cols-[180px_180px_1fr_250px_180px_80px] border-b border-slate-200 px-6 py-5">
            <span>{new Date(alert.createdAt).toLocaleString("pt-PT")}</span>
            <StatusBadge variant={statusVariant(alert.severity)}>{humanizeEnum(alert.severity)}</StatusBadge>
            <span>{humanizeEnum(alert.alertType)}</span>
            <span>{alert.entityType} / {alert.entityId}</span>
            <span className="font-bold text-orange-600">• {alert.resolved ? "Resolvido" : "Pendente"}</span>
            <Eye className="h-5 w-5" />
          </div>
        ))}
      </Card>
      <button className="fixed bottom-8 right-8 grid h-16 w-16 place-items-center rounded-full bg-slate-950 text-white shadow-panel"><Plus className="h-7 w-7" /></button>
    </AppShell>
  );
}

function SummaryAlert({ count, label, variant, icon: Icon }: { count: string; label: string; variant: "danger" | "warning" | "info"; icon: typeof AlertTriangle }) {
  const styles = { danger: "border-red-200 bg-red-50 text-red-700", warning: "border-orange-200 bg-orange-50 text-orange-700", info: "border-blue-200 bg-blue-50 text-blue-700" }[variant];
  return <div className={`flex items-center gap-4 rounded-2xl border px-6 py-4 ${styles}`}><Icon className="h-8 w-8" /><div><b className="block text-2xl">{count}</b><span className="text-xs font-black uppercase">{label}</span></div></div>;
}

function AlertColumn({ title, count, variant, items }: { title: string; count: string; severity: AlertSeverity; variant: "danger" | "warning" | "info"; items: AlertResponseDto[] }) {
  const color = { danger: "red", warning: "orange", info: "blue" }[variant];
  const textClass = variant === "danger" ? "text-red-600" : variant === "warning" ? "text-orange-600" : "text-blue-600";
  return (
    <div>
      <div className={`mb-5 flex items-center justify-between border-b-2 pb-3 ${variant === "danger" ? "border-red-600" : variant === "warning" ? "border-orange-500" : "border-blue-600"}`}>
        <h2 className={`flex items-center gap-3 text-2xl font-semibold ${textClass}`}>{variant === "danger" ? <Siren /> : variant === "warning" ? <AlertTriangle /> : <Info />} {title}</h2>
        <StatusBadge variant={variant}>{count}</StatusBadge>
      </div>
      <div className="space-y-6">
        {items.map((item) => (
          <Card key={item.id} className={variant === "danger" ? "border-l-4 border-l-red-600" : variant === "warning" ? "border-l-4 border-l-orange-500" : "border-l-4 border-l-blue-600"}>
            <CardContent className="p-6">
              <div className="flex justify-between"><h3 className="text-xl font-black">{item.title}</h3><span className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString("pt-PT")}</span></div>
              <p className="mt-4 leading-7 text-slate-600">{item.message}</p>
              <div className="mt-5 flex flex-wrap gap-2"><StatusBadge variant="secondary">{item.entityType}</StatusBadge><StatusBadge variant="secondary">{item.entityId}</StatusBadge></div>
              <div className="mt-6 flex gap-3"><Button className={variant === "danger" ? "flex-1 bg-red-600 hover:bg-red-700" : variant === "warning" ? "flex-1 bg-orange-600 hover:bg-orange-700" : "flex-1 bg-white text-blue-600 ring-1 ring-blue-600 hover:bg-blue-50"}>{variant === "info" ? "Ver Detalhe" : "Resolver"}</Button><Button variant="outline" size="icon">{variant === "info" ? <Check /> : <Eye />}</Button></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
