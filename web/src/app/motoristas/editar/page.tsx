"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Calendar, ChevronLeft, Save, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { DriverResponseDto, DriverStatus } from "@/lib/contracts";

type DriverEditForm = {
  fullName: string;
  phone: string;
  address: string;
  licenseCategory: string;
  licenseIssueDate: string;
  licenseExpiryDate: string;
  activityLocation: string;
  status: DriverStatus;
  notes: string;
};

const emptyForm: DriverEditForm = {
  fullName: "",
  phone: "",
  address: "",
  licenseCategory: "",
  licenseIssueDate: "",
  licenseExpiryDate: "",
  activityLocation: "",
  status: "ATIVO",
  notes: "",
};

const statusOptions = [
  { label: "Ativo", value: "ATIVO" },
  { label: "Inativo", value: "INATIVO" },
  { label: "Suspenso", value: "SUSPENSO" },
];

export default function EditDriverPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = searchParams.get("id");
  const [driver, setDriver] = useState<DriverResponseDto | null>(null);
  const [form, setForm] = useState<DriverEditForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDriver() {
      if (!driverId) {
        setError("Identificador do motorista em falta.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await api.drivers.get(driverId);
        if (cancelled) return;
        setDriver(data);
        setForm({
          fullName: data.fullName ?? "",
          phone: data.phone ?? "",
          address: data.address ?? "",
          licenseCategory: data.licenseCategory ?? "",
          licenseIssueDate: data.licenseIssueDate ?? "",
          licenseExpiryDate: data.licenseExpiryDate ?? "",
          activityLocation: data.activityLocation ?? "",
          status: data.status ?? "ATIVO",
          notes: data.notes ?? "",
        });
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar o motorista.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDriver();

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  function updateField(field: keyof DriverEditForm, value: string) {
    setForm((current) => ({ ...current, [field]: field === "status" ? value as DriverStatus : value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!driverId) return;
    setSaving(true);
    setError(null);

    try {
      await api.drivers.update(driverId, {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        licenseCategory: form.licenseCategory.trim(),
        licenseIssueDate: form.licenseIssueDate,
        licenseExpiryDate: form.licenseExpiryDate,
        activityLocation: form.activityLocation.trim(),
        status: form.status,
        notes: form.notes.trim() || undefined,
      });
      router.push(`/motoristas/detalhe?id=${driverId}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar o motorista.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Motoristas &nbsp;&gt;&nbsp; <span className="text-slate-950">Editar Motorista</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Editar Motorista</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">{driver ? `${driver.fullName} · ${driver.licenseNumber}` : "Atualize os dados cadastrais do motorista."}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href={driverId ? `/motoristas/detalhe?id=${driverId}` : "/motoristas"}><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <Button type="submit" form="driver-edit-form" disabled={saving || loading}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar"}</Button>
        </div>
      </div>

      {loading && <div className="mb-6"><LoadingState /></div>}
      {error && (
        <div className="mb-6">
          <ErrorState message={error} />
        </div>
      )}

      {!loading && driver && (
        <form id="driver-edit-form" onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-7">
          <Card>
            <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><UserRound className="h-5 w-5" /> Dados Cadastrais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-900">Nome completo <span className="text-red-500">*</span><Input required value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Telefone <span className="text-red-500">*</span><Input required value={form.phone} onChange={(event) => updateField("phone", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Estado <span className="text-red-500">*</span><Select required value={form.status} onChange={(event) => updateField("status", event.target.value)} options={statusOptions} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Morada <span className="text-red-500">*</span><Input required value={form.address} onChange={(event) => updateField("address", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Local de atividade <span className="text-red-500">*</span><Input required value={form.activityLocation} onChange={(event) => updateField("activityLocation", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Nº de identificação<Input value={driver.idNumber} disabled /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Nº da carta<Input value={driver.licenseNumber} disabled /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Categoria da carta <span className="text-red-500">*</span><Input required value={form.licenseCategory} onChange={(event) => updateField("licenseCategory", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">
                Data de emissão <span className="text-red-500">*</span>
                <div className="relative">
                  <Input required type="date" value={form.licenseIssueDate} onChange={(event) => updateField("licenseIssueDate", event.target.value)} className="pr-10" />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">
                Data de validade <span className="text-red-500">*</span>
                <div className="relative">
                  <Input required type="date" value={form.licenseExpiryDate} onChange={(event) => updateField("licenseExpiryDate", event.target.value)} className="pr-10" />
                  <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                </div>
              </label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-3">
                Notas
                <textarea
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700">
            <div className="flex gap-3"><AlertCircle className="h-5 w-5" /><p className="text-sm leading-6">O número de identificação e o número da carta ficam bloqueados neste formulário para preservar o registo original.</p></div>
          </div>
        </form>
      )}
    </AppShell>
  );
}
