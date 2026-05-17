"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, Check, ChevronLeft, ClipboardCheck, FileText, Save, Truck, X } from "lucide-react";
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
import type { ChecklistInspectionItemDto, ChecklistItemStatus } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";

type ChecklistForm = {
  vehicleId: string;
  templateId: string;
  activityId: string;
  performedBy: string;
  performedAt: string;
  notes: string;
};

const emptyForm: ChecklistForm = {
  vehicleId: "",
  templateId: "",
  activityId: "",
  performedBy: "",
  performedAt: toDatetimeLocal(new Date().toISOString()),
  notes: "",
};

export default function NewChecklistPage() {
  const router = useRouter();
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const templates = useApiResource(() => api.checklistTemplates.list(), []);
  const activities = useApiResource(() => api.activities.list({ size: 100 }), []);
  const [form, setForm] = useState<ChecklistForm>(emptyForm);
  const [items, setItems] = useState<ChecklistInspectionItemDto[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedVehicle = vehicles.data?.content.find((vehicle) => vehicle.id === form.vehicleId);
  const selectedTemplate = templates.data?.find((template) => template.id === form.templateId);
  const vehicleOptions = [
    { label: "Selecionar viatura", value: "" },
    ...(vehicles.data?.content ?? []).map((vehicle) => ({ label: `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}`, value: vehicle.id })),
  ];
  const templateOptions = [
    { label: "Selecionar template", value: "" },
    ...(templates.data ?? []).filter((template) => template.active).map((template) => ({ label: `${template.name}${template.vehicleType ? ` - ${template.vehicleType}` : ""}`, value: template.id ?? "" })),
  ];
  const activityOptions = [
    { label: "Sem atividade", value: "" },
    ...(activities.data?.content ?? []).map((activity) => ({ label: `${activity.code} - ${activity.title}`, value: activity.id })),
  ];
  const metrics = useMemo(() => {
    const ok = items.filter((item) => item.status === "OK").length;
    const failures = items.filter((item) => item.status !== "OK").length;
    const critical = items.filter((item) => item.critical && item.status !== "OK").length;
    return { ok, failures, critical };
  }, [items]);

  function updateForm(field: keyof ChecklistForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    if (field === "templateId") {
      const template = templates.data?.find((item) => item.id === value);
      setItems((template?.items ?? []).map((item) => ({
        templateItemId: item.id,
        itemName: item.itemName,
        critical: item.critical,
        status: "OK",
        notes: "",
      })));
    }
  }

  function updateItem(index: number, patch: Partial<ChecklistInspectionItemDto>) {
    setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.vehicleId || !form.templateId || items.length === 0) {
      setError("Selecione a viatura e o template da checklist.");
      return;
    }
    setSaving(true);
    setError(null);

    try {
      const result = await api.vehicles.checklists.submit(form.vehicleId, {
        templateId: form.templateId,
        activityId: form.activityId || undefined,
        performedBy: form.performedBy.trim() || "Operador",
        performedAt: new Date(form.performedAt).toISOString(),
        notes: form.notes.trim() || undefined,
        items,
        criticalFailures: items.some((item) => item.critical && item.status !== "OK"),
      });
      router.push(`/checklists/detalhe?vehicleId=${form.vehicleId}&id=${result.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel submeter a checklist.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Registar Checklist"
        subtitle="Submeta a inspeção operacional da viatura antes da atividade ou após manutenção."
        actions={<><Button variant="outline" asChild><Link href="/checklists"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button type="submit" form="checklist-create-form" disabled={saving || vehicles.loading || templates.loading}><Save className="h-4 w-4" /> {saving ? "A submeter..." : "Submeter checklist"}</Button></>}
      />

      {(vehicles.loading || templates.loading || activities.loading) && <div className="mb-6"><LoadingState label="A carregar dados da checklist..." /></div>}
      {(vehicles.error || templates.error || activities.error) && <div className="mb-6"><ErrorState message={vehicles.error ?? templates.error ?? activities.error ?? ""} unauthorized={vehicles.unauthorized || templates.unauthorized || activities.unauthorized} /></div>}
      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      <form id="checklist-create-form" onSubmit={handleSubmit}>
        <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5" /> Dados da checklist</CardTitle></CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-3">
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Template <span className="text-red-500">*</span></span><Select required value={form.templateId} onChange={(event) => updateForm("templateId", event.target.value)} options={templateOptions} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Viatura <span className="text-red-500">*</span></span><Select required value={form.vehicleId} onChange={(event) => updateForm("vehicleId", event.target.value)} options={vehicleOptions} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Atividade associada</span><Select value={form.activityId} onChange={(event) => updateForm("activityId", event.target.value)} options={activityOptions} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Submetido por</span><Input value={form.performedBy} onChange={(event) => updateForm("performedBy", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Data / hora</span><Input type="datetime-local" value={form.performedAt} onChange={(event) => updateForm("performedAt", event.target.value)} /></label>
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Local</span><Input value={selectedVehicle?.activityLocation ?? ""} disabled /></label>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="border-b border-slate-200"><CardTitle>Itens de verificação</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6">
                {items.length === 0 ? <p className="text-sm text-slate-500">Selecione um template para carregar os itens.</p> : items.map((item, index) => <ChecklistItem key={`${item.templateItemId ?? item.itemName}-${index}`} item={item} onChange={(patch) => updateItem(index, patch)} />)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><FileText className="h-5 w-5" /> Observações</CardTitle></CardHeader>
              <CardContent>
                <textarea value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" />
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-6">
            <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo de validação</h3><div className="mt-6 grid grid-cols-2 gap-4"><Metric label="Itens" value={String(items.length)} /><Metric label="OK" value={String(metrics.ok)} /><Metric label="Falhas" value={String(metrics.failures)} /><Metric label="Críticas" value={String(metrics.critical)} /></div></CardContent></Card>
            {metrics.critical > 0 && <Card className="border-red-200 bg-red-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-red-700"><AlertTriangle className="h-5 w-5" /> Falha crítica encontrada</h3><p className="mt-2 text-sm leading-6 text-slate-700">Esta falha crítica pode bloquear o início da atividade.</p></CardContent></Card>}
            <Card><CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Contexto operacional</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Row label="Viatura" value={selectedVehicle?.plate ?? "-"} /><Row label="Template" value={selectedTemplate?.name ?? "-"} /><Row label="Atividade" value={form.activityId || "-"} /><Row label="Local" value={selectedVehicle?.activityLocation ?? "-"} /></CardContent></Card>
          </aside>
        </section>
      </form>
    </AppShell>
  );
}

function ChecklistItem({ item, onChange }: { item: ChecklistInspectionItemDto; onChange: (patch: Partial<ChecklistInspectionItemDto>) => void }) {
  const failed = item.status === "FALTA" || item.status === "AVARIA";
  return (
    <div className={failed ? "rounded-2xl border border-red-200 bg-red-50 p-5" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
        <div><div className="flex items-center gap-3"><b className="text-lg">{item.itemName}</b>{item.critical && <StatusBadge variant="danger">Crítico</StatusBadge>}</div><p className="mt-1 text-sm text-slate-500">{item.notes || "Sem notas"}</p></div>
        <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-center text-xs font-black">
          {(["OK", "AVARIA", "FALTA"] as ChecklistItemStatus[]).map((status) => (
            <button key={status} type="button" onClick={() => onChange({ status })} className={item.status === status ? statusClass(status) : "px-3 py-2 text-slate-500"}>
              {status === "OK" ? <Check className="mx-auto h-4 w-4" /> : status === "AVARIA" ? <AlertTriangle className="mx-auto h-4 w-4" /> : <X className="mx-auto h-4 w-4" />} {status === "AVARIA" ? "Avaria" : status === "FALTA" ? "Falta" : "OK"}
            </button>
          ))}
        </div>
        <Input placeholder="Nota do item..." value={item.notes ?? ""} onChange={(event) => onChange({ notes: event.target.value })} />
      </div>
    </div>
  );
}

function statusClass(status: ChecklistItemStatus) {
  if (status === "OK") return "rounded-lg bg-white px-3 py-2 text-green-700 shadow-sm";
  if (status === "AVARIA") return "rounded-lg bg-white px-3 py-2 text-orange-700 shadow-sm";
  return "rounded-lg bg-white px-3 py-2 text-red-700 shadow-sm";
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-4"><p className="text-sm text-slate-300">{label}</p><b className="text-2xl">{value}</b></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">{label}</span><b>{value}</b></div>;
}

function toDatetimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
