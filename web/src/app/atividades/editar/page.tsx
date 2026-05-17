"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CalendarClock, ChevronLeft, Save } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { ActivityPriority, ActivityResponseDto } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";

type ActivityEditForm = {
  title: string;
  activityType: string;
  location: string;
  plannedStart: string;
  plannedEnd: string;
  priority: ActivityPriority;
  description: string;
  notes: string;
};

const emptyForm: ActivityEditForm = {
  title: "",
  activityType: "",
  location: "",
  plannedStart: "",
  plannedEnd: "",
  priority: "MEDIA",
  description: "",
  notes: "",
};

export default function EditActivityPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("id");
  const activityTypes = useApiResource(() => api.catalogItems.list("ACTIVITY_TYPE"), []);
  const [activity, setActivity] = useState<ActivityResponseDto | null>(null);
  const [form, setForm] = useState<ActivityEditForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        if (cancelled) return;
        setActivity(data);
        setForm({
          title: data.title ?? "",
          activityType: data.activityType ?? "",
          location: data.location ?? "",
          plannedStart: toDatetimeLocal(data.plannedStart),
          plannedEnd: toDatetimeLocal(data.plannedEnd),
          priority: data.priority ?? "MEDIA",
          description: data.description ?? "",
          notes: data.notes ?? "",
        });
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

  function updateField(field: keyof ActivityEditForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "priority" ? value as ActivityPriority : value }));
  }

  const activityTypeOptions = [
    ...(form.activityType && !(activityTypes.data ?? []).some((item) => item.code === form.activityType) ? [{ label: form.activityType, value: form.activityType }] : []),
    ...(activityTypes.data ?? []).filter((item) => item.active || item.code === form.activityType).map((item) => ({ label: item.name, value: item.code })),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activityId) return;
    setSaving(true);
    setError(null);

    try {
      await api.activities.update(activityId, {
        title: form.title.trim(),
        activityType: form.activityType.trim(),
        location: form.location.trim(),
        plannedStart: new Date(form.plannedStart).toISOString(),
        plannedEnd: new Date(form.plannedEnd).toISOString(),
        priority: form.priority,
        description: form.description.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      router.push(`/atividades/detalhe?id=${activityId}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar a atividade.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Atividades &nbsp;&gt;&nbsp; <span className="text-slate-950">Editar Atividade</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Editar Atividade</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">{activity ? `${activity.code} · ${activity.title}` : "Atualize os dados da atividade."}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href={activityId ? `/atividades/detalhe?id=${activityId}` : "/atividades"}><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <Button type="submit" form="activity-edit-form" disabled={saving || loading || activityTypes.loading}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar"}</Button>
        </div>
      </div>

      {loading && <div className="mb-6"><LoadingState /></div>}
      {activityTypes.loading && <div className="mb-6"><LoadingState label="A carregar tipos de atividade..." /></div>}
      {error && <div className="mb-6"><ErrorState message={error} /></div>}
      {activityTypes.error && <div className="mb-6"><ErrorState message={activityTypes.error} unauthorized={activityTypes.unauthorized} /></div>}

      {!loading && activity && (
        <form id="activity-edit-form" onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-7">
          <Card>
            <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><CalendarClock className="h-5 w-5" /> Dados da Atividade</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900">Título <span className="text-red-500">*</span><Input required value={form.title} onChange={(event) => updateField("title", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo <span className="text-red-500">*</span><Select required value={form.activityType} onChange={(event) => updateField("activityType", event.target.value)} options={activityTypeOptions} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Rota / Local <span className="text-red-500">*</span><Input required value={form.location} onChange={(event) => updateField("location", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Início previsto <span className="text-red-500">*</span><Input required type="datetime-local" value={form.plannedStart} onChange={(event) => updateField("plannedStart", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Fim previsto <span className="text-red-500">*</span><Input required type="datetime-local" value={form.plannedEnd} onChange={(event) => updateField("plannedEnd", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Prioridade<Select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} options={[{ label: "Baixa", value: "BAIXA" }, { label: "Normal", value: "MEDIA" }, { label: "Alta", value: "ALTA" }, { label: "Crítica", value: "CRITICA" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Descrição<Input value={form.description} onChange={(event) => updateField("description", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Notas<textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" /></label>
            </CardContent>
          </Card>
        </form>
      )}
    </AppShell>
  );
}

function toDatetimeLocal(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}
