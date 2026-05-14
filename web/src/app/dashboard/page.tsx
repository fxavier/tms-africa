"use client";

import Link from "next/link";
import { Download, Map as MapIcon, MoreVertical, Plus, Route, Siren, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function DashboardPage() {
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const drivers = useApiResource(() => api.drivers.list({ size: 100 }), []);
  const activities = useApiResource(() => api.activities.list({ size: 10 }), []);
  const alerts = useApiResource(() => api.alerts.list({ resolved: false, size: 10 }), []);

  const vehicleRows = vehicles.data?.content ?? [];
  const driverRows = drivers.data?.content ?? [];
  const activityRows = activities.data?.content ?? [];
  const alertRows = alerts.data?.content ?? [];
  const vehicleById = new Map(vehicleRows.map((vehicle) => [vehicle.id, vehicle]));
  const driverById = new Map(driverRows.map((driver) => [driver.id, driver]));
  const activeAlerts = alertRows.filter((alert) => !alert.resolved);
  const criticalAlerts = activeAlerts.filter((alert) => alert.severity === "CRITICO");

  const kpis = [
    { label: "Alertas Críticos", value: String(criticalAlerts.length), hint: "Ativos", variant: "danger" as const, icon: Siren },
    { label: "Atividades", value: String(activities.data?.totalElements ?? 0), hint: "Total", variant: "info" as const, icon: Route },
    { label: "Indisponíveis", value: String(vehicleRows.filter((vehicle) => vehicle.status !== "DISPONIVEL").length), hint: "", variant: "secondary" as const, icon: Truck },
    { label: "Manutenção", value: String(vehicleRows.filter((vehicle) => vehicle.status === "EM_MANUTENCAO").length), hint: "", variant: "warning" as const, icon: Truck },
    { label: "Motoristas Disp.", value: String(driverRows.filter((driver) => driver.status === "ATIVO").length), hint: "", variant: "success" as const, icon: Truck },
    { label: "Doc. a Expirar", value: String(activeAlerts.filter((alert) => alert.alertType.includes("DOCUMENT")).length), hint: "", variant: "info" as const, icon: Siren },
  ];

  const firstError = vehicles.error ?? drivers.error ?? activities.error ?? alerts.error;
  const unauthorized = vehicles.unauthorized || drivers.unauthorized || activities.unauthorized || alerts.unauthorized;

  return (
    <AppShell>
      <PageHeader
        title="Painel Principal"
        subtitle="Resumo operacional em tempo real • 24 Outubro 2023"
        actions={
          <>
            <Button variant="outline"><Download className="h-4 w-4" /> Exportar Relatório</Button>
            <Button asChild><Link href="/atividades/nova"><Plus className="h-4 w-4" /> Nova Atividade</Link></Button>
          </>
        }
      />

      {firstError && <div className="mb-6"><ErrorState message={firstError} unauthorized={unauthorized} /></div>}
      {(vehicles.loading || drivers.loading || activities.loading || alerts.loading) && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-5 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => <StatCard key={kpi.label} {...kpi} />)}
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_330px]">
        <div className="space-y-8">
          <Card>
            <CardHeader className="flex-row items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Route className="h-5 w-5" />
                <CardTitle>Atividades em curso</CardTitle>
              </div>
              <Link href="/atividades/nova" className="text-sm font-bold text-slate-950">Ver todas</Link>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>Origem / Destino</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activityRows.map((activity) => {
                  const vehicle = activity.vehicleId ? vehicleById.get(activity.vehicleId) : undefined;
                  const driver = activity.driverId ? driverById.get(activity.driverId) : undefined;
                  return (
                  <TableRow key={activity.id}>
                    <TableCell className="font-black">{vehicle?.plate ?? "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3"><Avatar name={driver?.fullName ?? "NA"} className="h-7 w-7" />{driver?.fullName ?? "-"}</div>
                    </TableCell>
                    <TableCell className="text-slate-600">{activity.location}</TableCell>
                    <TableCell><StatusBadge variant={statusVariant(activity.status)}>{humanizeEnum(activity.status)}</StatusBadge></TableCell>
                    <TableCell><MoreVertical className="h-5 w-5 text-slate-500" /></TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>

          <Card className="h-[300px]">
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Resumo Operacional Semanal</CardTitle>
              <div className="flex items-center gap-5 text-sm text-slate-500">
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-950" /> Concluídas</span>
                <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-500" /> Previstas</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-10 grid h-40 grid-cols-5 items-end gap-8 px-10">
                {[68, 82, 54, 76, 91].map((height, index) => (
                  <div key={index} className="flex flex-col items-center gap-3">
                    <div className="flex h-32 w-full items-end gap-2">
                      <div style={{ height: `${height}%` }} className="w-full rounded-t-xl bg-slate-950" />
                      <div style={{ height: `${Math.max(35, height - 22)}%` }} className="w-full rounded-t-xl bg-slate-300" />
                    </div>
                    <span className="text-xs font-bold text-slate-500">{["SEG", "TER", "QUA", "QUI", "SEX"][index]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card className="bg-slate-950 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white"><Siren className="h-5 w-5" /> Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                ["Nova Atividade", "/atividades/nova", Plus],
                ["Registar Viatura", "/viaturas/nova", Truck],
                ["Mapa de Frota", "/viaturas", MapIcon],
              ].map(([label, href, Icon]) => {
                const IconComponent = Icon as typeof Plus;
                return (
                  <Button key={String(label)} asChild variant="outline" className="h-12 w-full justify-between border-slate-600 bg-slate-800 text-white hover:bg-slate-700">
                    <Link href={String(href)}>{String(label)} <IconComponent className="h-5 w-5" /></Link>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between"><span className="flex items-center gap-2"><Siren className="h-5 w-5 text-red-600" /> Alertas Ativos</span><StatusBadge variant="danger">Urgente</StatusBadge></CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-red-600">Críticos ({criticalAlerts.length})</h4>
                {criticalAlerts.slice(0, 2).map((alert) => (
                  <div key={alert.id} className="mb-3 rounded-xl border-l-4 border-red-600 bg-red-50 p-4">
                    <div className="flex justify-between text-sm"><b>{alert.title}</b><span className="text-slate-500">{new Date(alert.createdAt).toLocaleDateString("pt-PT")}</span></div>
                    <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                    <button className="mt-3 text-xs font-black uppercase text-red-600">Intervir agora</button>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="mb-3 text-sm font-black uppercase tracking-widest text-orange-600">Avisos ({activeAlerts.filter((alert) => alert.severity === "AVISO").length})</h4>
                {activeAlerts.filter((alert) => alert.severity === "AVISO").slice(0, 2).map((alert) => (
                  <div key={alert.id} className="mb-3 rounded-xl border-l-4 border-orange-500 bg-orange-50 p-4">
                    <b className="text-sm">{alert.title}</b>
                    <p className="mt-2 text-sm text-slate-600">{alert.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </aside>
      </section>
    </AppShell>
  );
}
