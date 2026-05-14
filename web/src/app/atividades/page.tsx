"use client";

import Link from "next/link";
import { CalendarClock, Filter, MapPin, MoreVertical, Plus, Route, Truck, UserCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function ActivitiesPage() {
  const activities = useApiResource(() => api.activities.list({ size: 100 }), []);
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const drivers = useApiResource(() => api.drivers.list({ size: 100 }), []);
  const rows = activities.data?.content ?? [];
  const vehicleById = new Map((vehicles.data?.content ?? []).map((vehicle) => [vehicle.id, vehicle]));
  const driverById = new Map((drivers.data?.content ?? []).map((driver) => [driver.id, driver]));

  return (
    <AppShell>
      <PageHeader
        title="Atividades"
        subtitle="Planear, alocar recursos e acompanhar atividades logísticas."
        actions={<Button asChild><Link href="/atividades/nova"><Plus className="h-4 w-4" /> Nova atividade</Link></Button>}
      />

      {(activities.error || vehicles.error || drivers.error) && (
        <div className="mb-6"><ErrorState message={activities.error ?? vehicles.error ?? drivers.error ?? ""} unauthorized={activities.unauthorized || vehicles.unauthorized || drivers.unauthorized} /></div>
      )}
      {(activities.loading || vehicles.loading || drivers.loading) && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Planeadas" value={String(rows.filter((row) => row.status === "PLANEADA").length)} hint="Próximos 7 dias" icon={CalendarClock} variant="info" />
        <StatCard label="Em curso" value={String(rows.filter((row) => row.status === "EM_CURSO").length)} hint="Monitorização ativa" icon={Route} variant="success" />
        <StatCard label="Viaturas alocadas" value={String(rows.filter((row) => row.vehicleId).length)} hint="Alocação backend" icon={Truck} variant="secondary" />
        <StatCard label="Motoristas alocados" value={String(rows.filter((row) => row.driverId).length)} hint="Sem conflitos críticos" icon={UserCheck} variant="success" />
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <Input placeholder="Pesquisar por código, rota ou motorista..." />
          <Select options={[{ label: "Todos os estados", value: "all" }, { label: "Planeada", value: "planned" }, { label: "Em curso", value: "running" }]} />
          <Select options={[{ label: "Todas prioridades", value: "all" }, { label: "Crítica", value: "critical" }, { label: "Alta", value: "high" }]} />
          <Select options={[{ label: "Este mês", value: "month" }, { label: "Hoje", value: "today" }]} />
          <Button variant="outline"><Filter className="h-4 w-4" /> Filtrar</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Código</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Prioridade</TableHead>
              <TableHead>Rota</TableHead>
              <TableHead>Início previsto</TableHead>
              <TableHead>Viatura</TableHead>
              <TableHead>Motorista</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const vehicle = row.vehicleId ? vehicleById.get(row.vehicleId) : undefined;
              const driver = row.driverId ? driverById.get(row.driverId) : undefined;
              return (
              <TableRow key={row.code}>
                <TableCell className="font-black">{row.code}</TableCell>
                <TableCell>{row.title}</TableCell>
                <TableCell className="text-slate-500">{row.activityType}</TableCell>
                <TableCell><StatusBadge variant={statusVariant(row.status)}>{humanizeEnum(row.status)}</StatusBadge></TableCell>
                <TableCell><StatusBadge variant={statusVariant(row.priority)}>{humanizeEnum(row.priority)}</StatusBadge></TableCell>
                <TableCell><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {row.location}</span></TableCell>
                <TableCell>{new Date(row.plannedStart).toLocaleString("pt-PT")}</TableCell>
                <TableCell>{vehicle?.plate ?? "-"}</TableCell>
                <TableCell>{driver?.fullName ?? "-"}</TableCell>
                <TableCell><MoreVertical className="h-5 w-5 text-slate-500" /></TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination total={`${activities.data?.totalElements ?? 0} atividades`} />
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <Card><CardHeader><CardTitle>Regras de alocação</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><p>Viatura, motorista, documentos, disponibilidade e conflitos de agenda são validados antes da confirmação.</p><StatusBadge variant="success">Validação automática ativa</StatusBadge></CardContent></Card>
        <Card><CardHeader><CardTitle>Bloqueios recentes</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><p>2 tentativas bloqueadas por documentos expirados e carta de condução fora de validade.</p><StatusBadge variant="danger">Requer ação</StatusBadge></CardContent></Card>
        <Card><CardHeader><CardTitle>Próximas partidas</CardTitle></CardHeader><CardContent className="space-y-3 text-sm text-slate-600"><p>4 atividades iniciam nas próximas 3 horas. Monitorize checklists pré-viagem.</p><StatusBadge variant="info">Operação planeada</StatusBadge></CardContent></Card>
      </section>
    </AppShell>
  );
}
