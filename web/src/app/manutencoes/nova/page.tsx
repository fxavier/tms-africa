"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, CalendarDays, ChevronLeft, ClipboardCheck, Save, Truck, Wrench } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { MaintenanceRecordDto, MaintenanceType } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";

type MaintenanceForm = {
  vehicleId: string;
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
  vehicleId: "",
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

export default function NewMaintenancePage() {
  const router = useRouter();
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const [form, setForm] = useState<MaintenanceForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const selectedVehicle = vehicles.data?.content.find((vehicle) => vehicle.id === form.vehicleId);
  const vehicleOptions = [
    { label: "Selecionar viatura", value: "" },
    ...(vehicles.data?.content ?? []).map((vehicle) => ({ label: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`, value: vehicle.id })),
  ];
  const totalCost = useMemo(() => Number(form.totalCost || 0), [form.totalCost]);

  function updateField(field: keyof MaintenanceForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "maintenanceType" ? value as MaintenanceType : value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.vehicleId) {
      setError("Selecione a viatura.");
      return;
    }
    setSaving(true);
    setError(null);

    const payload: MaintenanceRecordDto = {
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
      const result = await api.vehicles.maintenance.create(form.vehicleId, payload);
      router.push(`/manutencoes/detalhe?vehicleId=${form.vehicleId}&id=${result.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar a manutenção.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Registar Manutenção"
        subtitle="Registe manutenções preventivas ou corretivas, custos, fornecedor e próxima intervenção."
        actions={<><Button variant="outline" asChild><Link href="/manutencoes"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button type="submit" form="maintenance-create-form" disabled={saving || vehicles.loading}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar manutenção"}</Button></>}
      />

      {vehicles.loading && <div className="mb-6"><LoadingState label="A carregar viaturas..." /></div>}
      {vehicles.error && <div className="mb-6"><ErrorState message={vehicles.error} unauthorized={vehicles.unauthorized} /></div>}
      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      <form id="maintenance-create-form" onSubmit={handleSubmit}>
        <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Identificação da manutenção</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Viatura <span className="text-red-500">*</span></span><Select required value={form.vehicleId} onChange={(event) => updateField("vehicleId", event.target.value)} options={vehicleOptions} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de manutenção <span className="text-red-500">*</span></span><Select required value={form.maintenanceType} onChange={(event) => updateField("maintenanceType", event.target.value)} options={[{ label: "Preventiva", value: "PREVENTIVA" }, { label: "Corretiva", value: "CORRETIVA" }]} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Data da manutenção <span className="text-red-500">*</span><Input required type="date" value={form.performedAt} onChange={(event) => updateField("performedAt", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Quilometragem atual<Input type="number" value={form.mileageAtService} onChange={(event) => updateField("mileageAtService", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Fornecedor / Oficina<Input value={form.supplier} onChange={(event) => updateField("supplier", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Responsável interno <span className="text-red-500">*</span><Input required value={form.responsibleUser} onChange={(event) => updateField("responsibleUser", event.target.value)} /></label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><Wrench className="h-5 w-5" /> Serviços efetuados</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Descrição <span className="text-red-500">*</span><textarea required value={form.description} onChange={(event) => updateField("description", event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Custo total<Input type="number" step="0.01" value={form.totalCost} onChange={(event) => updateField("totalCost", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Peças substituídas<Input value={form.partsReplaced} onChange={(event) => updateField("partsReplaced", event.target.value)} /></label>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><CalendarDays className="h-5 w-5" /> Próxima manutenção</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <label className="space-y-2 text-sm font-semibold text-slate-900">Próxima data<Input type="date" value={form.nextMaintenanceDate} onChange={(event) => updateField("nextMaintenanceDate", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900">Próxima quilometragem<Input type="number" value={form.nextMaintenanceMileage} onChange={(event) => updateField("nextMaintenanceMileage", event.target.value)} /></label>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo financeiro</h3><div className="mt-6 space-y-4"><SummaryLine label="Total" value={formatCurrency(totalCost)} strong /></div></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-orange-600" /> Impacto operacional</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-slate-600"><p>{selectedVehicle ? `${selectedVehicle.plate} - ${selectedVehicle.brand} ${selectedVehicle.model}` : "Selecione uma viatura para associar a manutenção."}</p><StatusBadge variant="warning">Pode impactar alocação</StatusBadge></CardContent></Card>
            <Card><CardHeader><CardTitle className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-green-600" /> Checklist</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><CheckLine text="Viatura selecionada" done={Boolean(form.vehicleId)} /><CheckLine text="Descrição preenchida" done={Boolean(form.description.trim())} /><CheckLine text="Responsável identificado" done={Boolean(form.responsibleUser.trim())} /></CardContent></Card>
          </aside>
        </section>
      </form>
    </AppShell>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between"><span className="text-slate-300">{label}</span><span className={strong ? "text-2xl font-black" : "font-bold"}>{value}</span></div>;
}

function CheckLine({ text, done }: { text: string; done: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={done ? "grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700" : "grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-slate-500"}>✓</span><b>{text}</b></div>;
}

function numberOrUndefined(value: string) {
  if (!value) return undefined;
  return Number(value);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(value);
}
