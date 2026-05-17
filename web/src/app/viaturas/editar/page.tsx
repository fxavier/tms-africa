"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Calendar, ChevronLeft, Save, Truck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { api, ApiClientError } from "@/lib/api";
import type { VehicleResponseDto } from "@/lib/contracts";

type VehicleEditForm = {
  brand: string;
  model: string;
  vehicleType: string;
  capacity: string;
  activityLocation: string;
  activityStartDate: string;
  notes: string;
};

const emptyForm: VehicleEditForm = {
  brand: "",
  model: "",
  vehicleType: "",
  capacity: "",
  activityLocation: "",
  activityStartDate: "",
  notes: "",
};

export default function EditVehiclePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id");
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [form, setForm] = useState<VehicleEditForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      if (!vehicleId) {
        setError("Identificador da viatura em falta.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await api.vehicles.get(vehicleId);
        if (cancelled) return;
        setVehicle(data);
        setForm({
          brand: data.brand ?? "",
          model: data.model ?? "",
          vehicleType: data.vehicleType ?? "",
          capacity: String(data.capacity ?? ""),
          activityLocation: data.activityLocation ?? "",
          activityStartDate: data.activityStartDate ?? "",
          notes: data.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar a viatura.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  function updateField(field: keyof VehicleEditForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!vehicleId) return;
    setSaving(true);
    setError(null);

    try {
      await api.vehicles.update(vehicleId, {
        brand: form.brand.trim(),
        model: form.model.trim(),
        vehicleType: form.vehicleType.trim(),
        capacity: Number(form.capacity),
        activityLocation: form.activityLocation.trim(),
        activityStartDate: form.activityStartDate,
        notes: form.notes.trim() || undefined,
      });
      router.push(`/viaturas/detalhe?id=${vehicleId}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar a viatura.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Viaturas &nbsp;&gt;&nbsp; <span className="text-slate-950">Editar Viatura</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Editar Viatura</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">{vehicle ? `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}` : "Atualize os dados cadastrais da unidade."}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href={vehicleId ? `/viaturas/detalhe?id=${vehicleId}` : "/viaturas"}><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <Button type="submit" form="vehicle-edit-form" disabled={saving || loading}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar"}</Button>
        </div>
      </div>

      {loading && <div className="mb-6"><LoadingState /></div>}
      {error && (
        <div className="mb-6">
          <ErrorState message={error} />
        </div>
      )}

      {!loading && vehicle && (
        <form id="vehicle-edit-form" onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-7">
          <Card>
            <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><Truck className="h-5 w-5" /> Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-900">Matrícula<Input value={vehicle.plate} disabled /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Marca <span className="text-red-500">*</span><Input required value={form.brand} onChange={(event) => updateField("brand", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Modelo <span className="text-red-500">*</span><Input required value={form.model} onChange={(event) => updateField("model", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo de Viatura <span className="text-red-500">*</span><Input required value={form.vehicleType} onChange={(event) => updateField("vehicleType", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Capacidade de Carga (kg) <span className="text-red-500">*</span><Input required type="number" min={1} value={form.capacity} onChange={(event) => updateField("capacity", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Centro Logístico / Local <span className="text-red-500">*</span><Input required value={form.activityLocation} onChange={(event) => updateField("activityLocation", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">
                Data de início <span className="text-red-500">*</span>
                <div className="relative">
                  <Input required type="date" value={form.activityStartDate} onChange={(event) => updateField("activityStartDate", event.target.value)} className="pr-10" />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">
                Notas
                <Input value={form.notes} onChange={(event) => updateField("notes", event.target.value)} />
              </label>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
            <div className="flex gap-3"><AlertCircle className="h-5 w-5" /><p className="text-sm leading-6">A matrícula e os acessórios não são alterados neste formulário.</p></div>
          </div>
        </form>
      )}
    </AppShell>
  );
}
