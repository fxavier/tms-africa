"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarDays, ChevronLeft, Euro, Pencil, Truck, UserRound, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiClientError } from "@/lib/api";
import type { MaintenanceRecordDto, VehicleResponseDto } from "@/lib/contracts";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function MaintenanceDetailPage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const maintenanceId = searchParams.get("id");
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceRecordDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadMaintenance() {
      if (!vehicleId || !maintenanceId) {
        setError("Identificador da manutenção em falta.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [vehicleData, maintenanceData] = await Promise.all([
          api.vehicles.get(vehicleId),
          api.vehicles.maintenance.get(vehicleId, maintenanceId),
        ]);
        if (cancelled) return;
        setVehicle(vehicleData);
        setMaintenance(maintenanceData);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar a manutenção.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadMaintenance();

    return () => {
      cancelled = true;
    };
  }, [vehicleId, maintenanceId]);

  if (loading) return <AppShell><LoadingState label="A carregar manutenção..." /></AppShell>;
  if (error || !vehicle || !maintenance) return <AppShell><ErrorState message={error ?? "Manutenção nao encontrada."} /></AppShell>;

  return (
    <AppShell>
      <PageHeader
        title="Detalhes da Manutenção"
        subtitle={`${vehicle.plate} · ${humanizeEnum(maintenance.maintenanceType)} · ${formatDate(maintenance.performedAt)}`}
        actions={<><Button variant="outline" asChild><Link href="/manutencoes"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button asChild><Link href={`/manutencoes/editar?vehicleId=${vehicle.id}&id=${maintenance.id}`}><Pencil className="h-4 w-4" /> Editar</Link></Button></>}
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Truck} title="Viatura" value={vehicle.plate} detail={`${vehicle.brand} ${vehicle.model}`} />
        <InfoCard icon={Wrench} title="Tipo" value={humanizeEnum(maintenance.maintenanceType)} detail="Registo de manutenção" />
        <InfoCard icon={Euro} title="Custo total" value={formatCurrency(Number(maintenance.totalCost ?? 0))} detail={maintenance.supplier ?? "Sem fornecedor"} />
        <InfoCard icon={CalendarDays} title="Próxima manutenção" value={nextMaintenanceLabel(maintenance)} detail="Planeamento futuro" />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Resumo técnico</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Detail label="Estado" value={<StatusBadge variant={statusVariant(maintenance.maintenanceType)}>{humanizeEnum(maintenance.maintenanceType)}</StatusBadge>} />
              <Detail label="Fornecedor" value={maintenance.supplier ?? "-"} />
              <Detail label="Data" value={formatDate(maintenance.performedAt)} />
              <Detail label="Quilometragem" value={maintenance.mileageAtService ? `${maintenance.mileageAtService.toLocaleString("pt-PT")} km` : "-"} />
              <Detail label="Responsável interno" value={maintenance.responsibleUser ?? "-"} />
              <Detail label="Peças substituídas" value={maintenance.partsReplaced ?? "-"} />
              <div className="rounded-xl bg-slate-50 p-5 md:col-span-2"><b>Observações</b><p className="mt-2 leading-7 text-slate-600">{maintenance.description ?? "-"}</p></div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><UserRound className="h-5 w-5" /> Responsáveis</CardTitle></CardHeader><CardContent className="space-y-4"><Person name={maintenance.responsibleUser ?? "Responsável não definido"} role="Responsável interno" />{maintenance.supplier && <Person name={maintenance.supplier} role="Fornecedor / oficina" />}</CardContent></Card>
          <Card><CardHeader><CardTitle>Dados da viatura</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Detail label="Matrícula" value={vehicle.plate} /><Detail label="Marca / Modelo" value={`${vehicle.brand} ${vehicle.model}`} /><Detail label="Local" value={vehicle.activityLocation} /></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function InfoCard({ icon: Icon, title, value, detail }: { icon: typeof Truck; title: string; value: string; detail: string }) {
  return <Card><CardContent className="p-6"><span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span><p className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</p><div className="mt-2 text-3xl font-black">{value}</div><p className="mt-1 text-sm text-slate-500">{detail}</p></CardContent></Card>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p><div className="mt-2 text-base font-semibold text-slate-950">{value}</div></div>;
}

function Person({ name, role }: { name: string; role: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-black">{name.split(" ").map(part => part[0]).join("").slice(0, 2)}</span><div><b>{name}</b><p className="text-sm text-slate-500">{role}</p></div></div>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-PT");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}

function nextMaintenanceLabel(row: MaintenanceRecordDto) {
  if (row.nextMaintenanceDate) return formatDate(row.nextMaintenanceDate);
  if (row.nextMaintenanceMileage) return `${row.nextMaintenanceMileage.toLocaleString("pt-PT")} km`;
  return "-";
}
