"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { BriefcaseBusiness, CalendarDays, ChevronLeft, CreditCard, IdCard, Save, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { EmployeeCreateDto, EmployeeStatus } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

const emptyForm: EmployeeCreateDto = {
  employeeNumber: "",
  fullName: "",
  phone: "",
  email: "",
  idNumber: "",
  functionId: "",
  status: "ACTIVE",
  hireDate: "",
  terminationDate: "",
  baseSalary: undefined,
  currency: "MZN",
  notes: "",
};

export default function NewEmployeePage() {
  const router = useRouter();
  const functions = useApiResource(() => api.hr.functions.list({ size: 100 }), []);
  const [form, setForm] = useState<EmployeeCreateDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeFunctions = (functions.data?.content ?? []).filter((item) => item.active);
  const selectedFunction = activeFunctions.find((item) => item.id === form.functionId);
  const initials = (form.fullName || "Novo Colaborador").split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.hr.employees.create({
        employeeNumber: form.employeeNumber.trim(),
        fullName: form.fullName.trim(),
        phone: optional(form.phone),
        email: optional(form.email),
        idNumber: optional(form.idNumber),
        functionId: optional(form.functionId),
        status: form.status,
        hireDate: optional(form.hireDate),
        terminationDate: optional(form.terminationDate),
        baseSalary: form.baseSalary === undefined || Number.isNaN(Number(form.baseSalary)) ? undefined : Number(form.baseSalary),
        currency: optional(form.currency) ?? "MZN",
        notes: optional(form.notes),
      });
      router.push("/recursos-humanos");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao guardar colaborador.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Novo Colaborador"
        subtitle="Registe dados profissionais, função, vínculo e informação salarial do colaborador."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/recursos-humanos"><ChevronLeft className="h-4 w-4" /> Voltar</Link>
            </Button>
            <Button type="submit" form="employee-form" disabled={saving || !form.employeeNumber.trim() || !form.fullName.trim()}>
              <Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar colaborador"}
            </Button>
          </>
        }
      />

      {(error || functions.error) && (
        <div className="mb-6">
          <ErrorState message={error ?? functions.error ?? ""} unauthorized={functions.unauthorized} />
        </div>
      )}
      {functions.loading && (
        <div className="mb-6">
          <LoadingState />
        </div>
      )}

      <form id="employee-form" onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><UserPlus className="h-5 w-5" /> Dados pessoais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Nome completo" required><Input required value={form.fullName} onChange={(event) => update("fullName", event.target.value)} /></Field>
              <Field label="Nº de funcionário" required><Input required value={form.employeeNumber} onChange={(event) => update("employeeNumber", event.target.value)} /></Field>
              <Field label="Telefone"><Input value={form.phone ?? ""} onChange={(event) => update("phone", event.target.value)} /></Field>
              <Field label="Email profissional"><Input type="email" value={form.email ?? ""} onChange={(event) => update("email", event.target.value)} /></Field>
              <Field label="Nº de identificação"><Input value={form.idNumber ?? ""} onChange={(event) => update("idNumber", event.target.value)} /></Field>
              <Field label="Estado">
                <Select value={form.status} onChange={(event) => update("status", event.target.value as EmployeeStatus)} options={[
                  { label: "Ativo", value: "ACTIVE" },
                  { label: "Inativo", value: "INACTIVE" },
                  { label: "Suspenso", value: "SUSPENDED" },
                  { label: "Terminado", value: "TERMINATED" },
                ]} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5" /> Dados profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Função">
                <Select value={form.functionId ?? ""} onChange={(event) => update("functionId", event.target.value)} options={[
                  { label: "Sem função", value: "" },
                  ...activeFunctions.map((item) => ({ label: item.name, value: item.id })),
                ]} />
              </Field>
              <Field label="Data de admissão"><Input type="date" value={form.hireDate ?? ""} onChange={(event) => update("hireDate", event.target.value)} /></Field>
              <Field label="Data de saída"><Input type="date" value={form.terminationDate ?? ""} onChange={(event) => update("terminationDate", event.target.value)} /></Field>
              <Field label="Moeda"><Input value={form.currency ?? "MZN"} onChange={(event) => update("currency", event.target.value.toUpperCase())} /></Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><CreditCard className="h-5 w-5" /> Informação salarial</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Salário base"><Input min="0" step="0.01" type="number" value={form.baseSalary ?? ""} onChange={(event) => update("baseSalary", event.target.value === "" ? undefined : Number(event.target.value))} /></Field>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">
                <span>Notas</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                  value={form.notes ?? ""}
                  onChange={(event) => update("notes", event.target.value)}
                />
              </label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-black">Resumo do colaborador</h3>
              <div className="mt-6 flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-xl font-black">{initials}</span>
                <div>
                  <b className="text-lg">{form.fullName || "Novo colaborador"}</b>
                  <p className="text-sm text-slate-300">{selectedFunction?.name ?? "Sem função"}</p>
                  <p className="mt-2"><StatusBadge variant={statusVariant(form.status)}>{humanizeEnum(form.status)}</StatusBadge></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><CalendarDays className="h-5 w-5" /> Estado do processo</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Step label="Dados obrigatórios preenchidos" done={Boolean(form.fullName.trim() && form.employeeNumber.trim())} />
              <Step label="Função selecionada" done={Boolean(form.functionId)} />
              <Step label="Salário configurado" done={Boolean(form.baseSalary)} />
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-5">
              <h3 className="flex items-center gap-2 font-black text-blue-700"><IdCard className="h-5 w-5" /> Dados reais do backend</h3>
              <p className="mt-2 text-sm leading-6 text-slate-700">Ao guardar, o colaborador é criado em <b>/api/v1/hr/employees</b> e fica disponível na listagem de RH.</p>
            </CardContent>
          </Card>
        </aside>
      </form>
    </AppShell>
  );

  function update<K extends keyof EmployeeCreateDto>(key: K, value: EmployeeCreateDto[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
}

function optional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="space-y-2 text-sm font-semibold text-slate-900"><span>{label} {required && <span className="text-red-500">*</span>}</span>{children}</label>;
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={done ? "grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700" : "grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-700"}>{done ? "✓" : "!"}</span><b>{label}</b></div>;
}
