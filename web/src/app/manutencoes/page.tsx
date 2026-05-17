"use client";

import Link from "next/link";
import { CalendarDays, Euro, Eye, Pencil, Plus, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Pagination } from "@/components/tms/Pagination";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import type { MaintenanceRecordDto, VehicleResponseDto } from "@/lib/contracts";
import { humanizeEnum, statusVariant } from "@/types/status";

type MaintenanceRow = MaintenanceRecordDto & {
  vehicle: VehicleResponseDto;
};

export default function MaintenancePage() {
  const [rows, setRows] = useState<MaintenanceRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMaintenances() {
      setLoading(true);
      setError(null);
      try {
        const vehicles = await api.vehicles.list({ size: 100 });
        const maintenancePages = await Promise.all(
          vehicles.content.map(async (vehicle) => {
            const result = await api.vehicles.maintenance.list(vehicle.id, { size: 100 }).catch(() => null);
            return (result?.content ?? []).map((maintenance) => ({ ...maintenance, vehicle }));
          }),
        );
        if (!cancelled) setRows(maintenancePages.flat().sort((a, b) => new Date(b.performedAt).getTime() - new Date(a.performedAt).getTime()));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar manutenções.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMaintenances();

    return () => {
      cancelled = true;
    };
  }, []);

  const totalCost = useMemo(() => rows.reduce((sum, row) => sum + Number(row.totalCost ?? 0), 0), [rows]);
  const upcoming = rows.filter((row) => isWithinDays(row.nextMaintenanceDate, 30)).length;
  const overdue = rows.filter((row) => row.nextMaintenanceDate && new Date(`${row.nextMaintenanceDate}T00:00:00`).getTime() < startOfToday()).length;

  return (
    <AppShell>
      <PageHeader title="Manutenções" subtitle="Registar e acompanhar manutenções preventivas e corretivas das viaturas." actions={<Button asChild><Link href="/manutencoes/nova"><Plus className="h-4 w-4" /> Registar manutenção</Link></Button>} />

      {error && <div className="mb-6"><ErrorState message={error} /></div>}
      {loading && <div className="mb-6"><LoadingState label="A carregar manutenções..." /></div>}

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Registos" value={String(rows.length)} hint={`${overdue} vencidas`} icon={Wrench} variant={overdue ? "danger" : "secondary"} />
        <StatCard label="Custo Total" value={formatCurrency(totalCost)} hint="Registos carregados" icon={Euro} variant="info" />
        <StatCard label="Próximas Revisões" value={String(upcoming)} hint="30 dias" icon={CalendarDays} variant="warning" />
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4"><Input placeholder="Pesquisar viatura..." /><Select options={[{ label: "Todos os Tipos", value: "all" }, { label: "Preventiva", value: "PREVENTIVA" }, { label: "Corretiva", value: "CORRETIVA" }]} /><Select options={[{ label: "Todos os Fornecedores", value: "all" }]} /><Button>Filtrar</Button></div>
        <Table>
          <TableHeader><TableRow><TableHead>Viatura</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Quilometragem</TableHead><TableHead>Fornecedor</TableHead><TableHead>Custo</TableHead><TableHead>Próxima</TableHead><TableHead>Responsável</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-slate-500">Sem manutenções registadas.</TableCell></TableRow>
            ) : rows.map((row) => (
              <TableRow key={`${row.vehicle.id}-${row.id}`}>
                <TableCell><div><b>{row.vehicle.plate}</b><p className="text-xs text-slate-500">{row.vehicle.brand} {row.vehicle.model}</p></div></TableCell>
                <TableCell><StatusBadge variant={statusVariant(row.maintenanceType)}>{humanizeEnum(row.maintenanceType)}</StatusBadge></TableCell>
                <TableCell>{formatDate(row.performedAt)}</TableCell>
                <TableCell>{row.mileageAtService ? `${row.mileageAtService.toLocaleString("pt-PT")} km` : "-"}</TableCell>
                <TableCell className="text-slate-500">{row.supplier ?? "-"}</TableCell>
                <TableCell>{formatCurrency(Number(row.totalCost ?? 0))}</TableCell>
                <TableCell>{nextMaintenanceLabel(row)}</TableCell>
                <TableCell>{row.responsibleUser ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" aria-label={`Ver manutenção da viatura ${row.vehicle.plate}`}>
                      <Link href={`/manutencoes/detalhe?vehicleId=${row.vehicle.id}&id=${row.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label={`Editar manutenção da viatura ${row.vehicle.plate}`}>
                      <Link href={`/manutencoes/editar?vehicleId=${row.vehicle.id}&id=${row.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination total={`${rows.length}`} />
      </Card>
    </AppShell>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-PT");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "MZN" }).format(value);
}

function nextMaintenanceLabel(row: MaintenanceRecordDto) {
  if (row.nextMaintenanceDate) return formatDate(row.nextMaintenanceDate);
  if (row.nextMaintenanceMileage) return `${row.nextMaintenanceMileage.toLocaleString("pt-PT")} km`;
  return "-";
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
}

function isWithinDays(value: string | undefined, days: number) {
  if (!value) return false;
  const target = new Date(`${value}T00:00:00`).getTime();
  const today = startOfToday();
  return target >= today && target <= today + days * 24 * 60 * 60 * 1000;
}
