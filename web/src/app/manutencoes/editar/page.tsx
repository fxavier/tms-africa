"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ChevronLeft, Save, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { MaintenanceRecordDto, MaintenanceType, VehicleResponseDto } from "@/lib/contracts";

type MaintenanceForm = {
  maintenanceType: MaintenanceType;
  performedAt: string;
  mileageAtService: string;
  description: string;
  supplier: string;
  totalCost: string;
  partsReplaced: string;
  nextMaintenanceDate: string;
  nextMaintenanceMileage: string;
  responsibleUser: string;
};

const emptyForm: MaintenanceForm = {
  maintenanceType: "PREVENTIVA",
  performedAt: "",
  mileageAtService: "",
  description: "",
  supplier: "",
  totalCost: "",
  partsReplaced: "",
  nextMaintenanceDate: "",
  nextMaintenanceMileage: "",
  responsibleUser: "",
};

export default function EditMaintenancePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const maintenanceId = searchParams.get("id");
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [form, setForm] = useState<MaintenanceForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const [vehicleData, maintenance] = await Promise.all([
          api.vehicles.get(vehicleId),
          api.vehicles.maintenance.get(vehicleId, maintenanceId),
        ]);
        if (cancelled) return;
        setVehicle(vehicleData);
        setForm({
          maintenanceType: maintenance.maintenanceType ?? "PREVENTIVA",
          performedAt: maintenance.performedAt ?? "",
          mileageAtService: String(maintenance.mileageAtService ?? ""),
          description: maintenance.description ?? "",
          supplier: maintenance.supplier ?? "",
          totalCost: String(maintenance.totalCost ?? ""),
          partsReplaced: maintenance.partsReplaced ?? "",
          nextMaintenanceDate: maintenance.nextMaintenanceDate ?? "",
          nextMaintenanceMileage: String(maintenance.nextMaintenanceMileage ?? ""),
          responsibleUser: maintenance.responsibleUser ?? "",
        });
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

  function updateField(field: keyof MaintenanceForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "maintenanceType" ? value as MaintenanceType : value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vehicleId || !maintenanceId) return;
    setSaving(true);
    setError(null);

    const payload: MaintenanceRecordDto = {
      id: maintenanceId,
      maintenanceType: form.maintenanceType,
      performedAt: form.performedAt,
      mileageAtService: numberOrUndefined(form.mileageAtService),
      description: form.description.trim(),
      supplier: form.supplier.trim() || undefined,
      totalCost: numberOrUndefined(form.totalCost),
      partsReplaced: form.partsReplaced.trim() || undefined,
      nextMaintenanceDate: form.nextMaintenanceDate || undefined,
      nextMaintenanceMileage: numberOrUndefined(form.nextMaintenanceMileage),
      responsibleUser: form.responsibleUser.trim(),
    };

    try {
      await api.vehicles.maintenance.update(vehicleId, maintenanceId, payload);
      router.push(`/manutencoes/detalhe?vehicleId=${vehicleId}&id=${maintenanceId}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar a manutenção.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Manutenções &nbsp;&gt;&nbsp; <span className="text-slate-950">Editar Manutenção</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Editar Manutenção</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">{vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : "Atualize o registo de manutenção."}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href={vehicleId && maintenanceId ? `/manutencoes/detalhe?vehicleId=${vehicleId}&id=${maintenanceId}` : "/manutencoes"}><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <Button type="submit" form="maintenance-edit-form" disabled={saving || loading}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar"}</Button>
        </div>
      </div>

      {loading && <div className="mb-6"><LoadingState /></div>}
      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      {!loading && vehicle && (
        <form id="maintenance-edit-form" onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-7">
          <Card>
            <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><Wrench className="h-5 w-5" /> Dados da Manutenção</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo <span className="text-red-500">*</span><Select required value={form.maintenanceType} onChange={(event) => updateField("maintenanceType", event.target.value)} options={[{ label: "Preventiva", value: "PREVENTIVA" }, { label: "Corretiva", value: "CORRETIVA" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Data <span className="text-red-500">*</span><Input required type="date" value={form.performedAt} onChange={(event) => updateField("performedAt", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Quilometragem<Input type="number" value={form.mileageAtService} onChange={(event) => updateField("mileageAtService", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Fornecedor<Input value={form.supplier} onChange={(event) => updateField("supplier", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Custo<Input type="number" step="0.01" value={form.totalCost} onChange={(event) => updateField("totalCost", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Responsável <span className="text-red-500">*</span><Input required value={form.responsibleUser} onChange={(event) => updateField("responsibleUser", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Próxima data<Input type="date" value={form.nextMaintenanceDate} onChange={(event) => updateField("nextMaintenanceDate", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Próxima quilometragem<Input type="number" value={form.nextMaintenanceMileage} onChange={(event) => updateField("nextMaintenanceMileage", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Peças substituídas<Input value={form.partsReplaced} onChange={(event) => updateField("partsReplaced", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Descrição <span className="text-red-500">*</span><textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
            </CardContent>
          </Card>
        </form>
      )}
    </AppShell>
  );
}

function numberOrUndefined(value: string) {
  if (!value) return undefined;
  return Number(value);
}
