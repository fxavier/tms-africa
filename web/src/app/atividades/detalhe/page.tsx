"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CalendarClock, ChevronLeft, MapPin, Pencil, Route, Truck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api, ApiClientError } from "@/lib/api";
import type { ActivityResponseDto, DriverResponseDto, VehicleResponseDto } from "@/lib/contracts";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function ActivityDetailPage() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const [activity, setActivity] = useState<ActivityResponseDto | null>(null);
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [driver, setDriver] = useState<DriverResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadActivity() {
      if (!activityId) {
        setError("Identificador da atividade em falta.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.activities.get(activityId);
        const [vehicleData, driverData] = await Promise.all([
          data.vehicleId ? api.vehicles.get(data.vehicleId).catch(() => null) : Promise.resolve(null),
          data.driverId ? api.drivers.get(data.driverId).catch(() => null) : Promise.resolve(null),
        ]);
        if (cancelled) return;
        setActivity(data);
        setVehicle(vehicleData);
        setDriver(driverData);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar a atividade.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadActivity();

    return () => {
      cancelled = true;
    };
  }, [activityId]);

  if (loading) return <AppShell><LoadingState label="A carregar detalhes da atividade..." /></AppShell>;
  if (error || !activity) return <AppShell><ErrorState message={error ?? "Atividade nao encontrada."} /></AppShell>;

  return (
    <AppShell>
      <div className="mb-4 text-sm font-medium text-slate-500">Atividades &nbsp;&gt;&nbsp; <span className="text-slate-950">Detalhes da Atividade</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{activity.code}</h1>
            <StatusBadge variant={statusVariant(activity.status)}>{humanizeEnum(activity.status)}</StatusBadge>
            <StatusBadge variant={statusVariant(activity.priority)}>{humanizeEnum(activity.priority)}</StatusBadge>
          </div>
          <p className="mt-3 text-lg text-slate-500">{activity.title}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href="/atividades"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <Button asChild><Link href={`/atividades/editar?id=${activity.id}`}><Pencil className="h-4 w-4" /> Editar</Link></Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <Card><CardContent className="p-6"><CalendarClock className="h-10 w-10 rounded-xl bg-blue-100 p-2 text-blue-600" /><div className="mt-6 text-xl font-black">{formatDateTime(activity.plannedStart)}</div><p className="text-sm text-slate-500">Início previsto</p></CardContent></Card>
        <Card><CardContent className="p-6"><Route className="h-10 w-10 rounded-xl bg-slate-100 p-2" /><div className="mt-6 text-xl font-black">{formatDateTime(activity.plannedEnd)}</div><p className="text-sm text-slate-500">Fim previsto</p></CardContent></Card>
        <Card><CardContent className="p-6"><MapPin className="h-10 w-10 rounded-xl bg-green-100 p-2 text-green-700" /><div className="mt-6 text-xl font-black">{humanizeEnum(activity.activityType)}</div><p className="text-sm text-slate-500">{activity.location}</p></CardContent></Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Viatura atribuída</CardTitle></CardHeader>
          <CardContent className="p-6">
            <b>{vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : "Sem viatura atribuída"}</b>
            <p className="mt-2 text-sm text-slate-500">{vehicle ? `${vehicle.vehicleType} · ${vehicle.capacity} kg · ${vehicle.activityLocation}` : "A atividade ainda não tem viatura alocada."}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> Motorista atribuído</CardTitle></CardHeader>
          <CardContent className="p-6">
            <b>{driver?.fullName ?? "Sem motorista atribuído"}</b>
            <p className="mt-2 text-sm text-slate-500">{driver ? `Carta ${driver.licenseNumber} · Categoria ${driver.licenseCategory} · ${driver.activityLocation}` : "A atividade ainda não tem motorista alocado."}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="mt-8">
        <CardHeader className="border-b border-slate-200"><CardTitle>Descrição e notas</CardTitle></CardHeader>
        <CardContent className="grid gap-6 p-6 md:grid-cols-2">
          <Detail label="Descrição" value={activity.description ?? "-"} />
          <Detail label="Notas" value={activity.notes ?? "-"} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-semibold text-slate-950">{value}</div></div>;
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-PT");
}
