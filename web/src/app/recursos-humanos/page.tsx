"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, BriefcaseBusiness, Plus, Power, ReceiptText, RefreshCw, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Pagination } from "@/components/tms/Pagination";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import type { EmployeeFunctionCreateDto, EmployeeResponseDto, PaymentMethod, PaymentStatusFilter, SalaryPaymentCreateDto } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

type HrTab = "employees" | "functions" | "payments";

const money = (value?: number, currency = "MZN") =>
  new Intl.NumberFormat("pt-PT", { style: "currency", currency }).format(Number(value ?? 0));

const now = new Date();
const today = now.toISOString().slice(0, 10);

const emptyPaymentForm: SalaryPaymentCreateDto = {
  employeeId: "",
  periodYear: now.getFullYear(),
  periodMonth: now.getMonth() + 1,
  grossAmount: 0,
  netAmount: 0,
  paidAmount: 0,
  currency: "MZN",
  paymentDate: today,
  paymentMethod: "BANK_TRANSFER",
  reference: "",
  notes: "",
};

export default function HrPage() {
  const [tab, setTab] = useState<HrTab>("employees");
  const [refreshKey, setRefreshKey] = useState(0);
  const [functionForm, setFunctionForm] = useState<EmployeeFunctionCreateDto>({ code: "", name: "", description: "" });
  const [periodYear, setPeriodYear] = useState(now.getFullYear());
  const [periodMonth, setPeriodMonth] = useState(now.getMonth() + 1);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusFilter>("ALL");
  const [paymentForm, setPaymentForm] = useState<SalaryPaymentCreateDto>(emptyPaymentForm);
  const [savingFunction, setSavingFunction] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const employees = useApiResource(() => api.hr.employees.list({ size: 100 }), [refreshKey]);
  const functions = useApiResource(() => api.hr.functions.list({ size: 100 }), [refreshKey]);
  const payments = useApiResource(() => api.hr.salaryPayments.list({ year: periodYear, month: periodMonth, size: 100 }), [refreshKey, periodYear, periodMonth]);
  const paymentStatusRows = useApiResource(
    () => api.hr.salaryPayments.status({ year: periodYear, month: periodMonth, status: paymentStatus, size: 100 }),
    [refreshKey, periodYear, periodMonth, paymentStatus],
  );

  const employeeRows = employees.data?.content ?? [];
  const activeEmployeeRows = employeeRows.filter((employee) => employee.status === "ACTIVE");
  const functionRows = functions.data?.content ?? [];
  const paymentRows = payments.data?.content ?? [];
  const salaryStatusRows = paymentStatusRows.data?.content ?? [];
  const employeeById = new Map(employeeRows.map((employee) => [employee.id, employee]));
  const totalPaid = paymentRows.reduce((sum, payment) => sum + Number(payment.paidAmount ?? 0), 0);
  const apiError = employees.error ?? functions.error ?? payments.error ?? paymentStatusRows.error;
  const loading = employees.loading || functions.loading || payments.loading || paymentStatusRows.loading;

  async function submitFunction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSavingFunction(true);
    try {
      await api.hr.functions.create({
        code: functionForm.code.trim(),
        name: functionForm.name.trim(),
        description: functionForm.description?.trim() || undefined,
      });
      setFunctionForm({ code: "", name: "", description: "" });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao criar função.");
    } finally {
      setSavingFunction(false);
    }
  }

  async function toggleFunction(id: string, active: boolean) {
    setActionError(null);
    try {
      if (active) await api.hr.functions.deactivate(id);
      else await api.hr.functions.activate(id);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao alterar função.");
    }
  }

  async function updateEmployeeStatus(id: string, active: boolean) {
    setActionError(null);
    try {
      await api.hr.employees.updateStatus(id, active ? "INACTIVE" : "ACTIVE");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao alterar colaborador.");
    }
  }

  async function submitPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActionError(null);
    setSavingPayment(true);
    try {
      await api.hr.salaryPayments.create({
        ...paymentForm,
        periodYear,
        periodMonth,
        grossAmount: Number(paymentForm.grossAmount),
        netAmount: Number(paymentForm.netAmount),
        paidAmount: Number(paymentForm.paidAmount),
        currency: optional(paymentForm.currency) ?? "MZN",
        reference: optional(paymentForm.reference),
        notes: optional(paymentForm.notes),
      });
      setPaymentForm({ ...emptyPaymentForm, periodYear, periodMonth, paymentDate: today });
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao registar pagamento salarial.");
    } finally {
      setSavingPayment(false);
    }
  }

  async function cancelPayment(id: string) {
    setActionError(null);
    try {
      await api.hr.salaryPayments.cancel(id, "Pagamento cancelado pelo utilizador");
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao cancelar pagamento salarial.");
    }
  }

  function selectEmployee(employeeId: string) {
    const employee = employeeById.get(employeeId);
    const salary = Number(employee?.baseSalary ?? 0);
    setPaymentForm((form) => ({
      ...form,
      employeeId,
      grossAmount: salary,
      netAmount: salary,
      paidAmount: salary,
      currency: employee?.currency ?? form.currency ?? "MZN",
    }));
  }

  function startPaymentForEmployee(employee: EmployeeResponseDto) {
    setTab("payments");
    selectEmployee(employee.id);
  }

  return (
    <AppShell>
      <PageHeader
        title="Recursos Humanos"
        subtitle="Faça a gestão dos seus colaboradores, funções e processamento salarial."
        actions={
          <Button asChild>
            <Link href="/recursos-humanos/novo">
              <Plus className="h-4 w-4" /> Novo Colaborador
            </Link>
          </Button>
        }
      />

      {(apiError || actionError) && (
        <div className="mb-6">
          <ErrorState message={actionError ?? apiError ?? ""} unauthorized={employees.unauthorized || functions.unauthorized || payments.unauthorized || paymentStatusRows.unauthorized} />
        </div>
      )}
      {loading && (
        <div className="mb-6">
          <LoadingState />
        </div>
      )}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Colaboradores Ativos" value={String(employeeRows.filter((employee) => employee.status === "ACTIVE").length)} hint="Backend" icon={Users} variant="info" />
        <StatCard label="Funções Ativas" value={String(functionRows.filter((item) => item.active).length)} hint="Cargos cadastrados" icon={BriefcaseBusiness} variant="success" />
        <StatCard label="Total Pagamentos" value={money(totalPaid)} hint="Lista atual" icon={ReceiptText} variant="info" />
        <StatCard label="Pagamentos Cancelados" value={String(paymentRows.filter((payment) => payment.status === "CANCELLED").length)} hint="Ação necessária" icon={AlertTriangle} variant="danger" />
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="flex flex-wrap gap-3 border-b border-slate-200 px-6 py-4">
          <TabButton active={tab === "employees"} onClick={() => setTab("employees")}>Colaboradores</TabButton>
          <TabButton active={tab === "functions"} onClick={() => setTab("functions")}>Funções</TabButton>
          <TabButton active={tab === "payments"} onClick={() => setTab("payments")}>Pagamentos Salariais</TabButton>
          <Button className="ml-auto" variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
            <RefreshCw className="h-4 w-4" /> Atualizar
          </Button>
        </div>

        {tab === "employees" && (
          <>
            <Table>
              <TableHeader>
                <TableRow><TableHead>Colaborador</TableHead><TableHead>Número</TableHead><TableHead>Função</TableHead><TableHead>Contacto</TableHead><TableHead>Salário</TableHead><TableHead>Estado</TableHead><TableHead>Ações</TableHead></TableRow>
              </TableHeader>
              <TableBody>
                {employeeRows.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell><Avatar name={employee.fullName} subtitle={employee.email ?? employee.idNumber ?? "-"} /></TableCell>
                    <TableCell className="font-semibold">{employee.employeeNumber}</TableCell>
                    <TableCell>{employee.functionName ?? "-"}</TableCell>
                    <TableCell>{employee.phone ?? "-"}</TableCell>
                    <TableCell>{employee.baseSalary ? money(employee.baseSalary, employee.currency ?? "MZN") : "-"}</TableCell>
                    <TableCell><StatusBadge variant={statusVariant(employee.status)}>{humanizeEnum(employee.status)}</StatusBadge></TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => updateEmployeeStatus(employee.id, employee.status === "ACTIVE")}>
                        <Power className="h-4 w-4" /> {employee.status === "ACTIVE" ? "Desativar" : "Ativar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination total={`${employees.data?.totalElements ?? 0} colaboradores`} />
          </>
        )}

        {tab === "functions" && (
          <div className="grid gap-6 p-6 xl:grid-cols-[360px_1fr]">
            <Card className="border-slate-200 shadow-none">
              <CardHeader><CardTitle className="text-base">Nova função</CardTitle></CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={submitFunction}>
                  <Field label="Código" required><Input value={functionForm.code} onChange={(event) => setFunctionForm((form) => ({ ...form, code: event.target.value }))} placeholder="MEC" /></Field>
                  <Field label="Nome" required><Input value={functionForm.name} onChange={(event) => setFunctionForm((form) => ({ ...form, name: event.target.value }))} placeholder="Mecânico" /></Field>
                  <Field label="Descrição"><Input value={functionForm.description ?? ""} onChange={(event) => setFunctionForm((form) => ({ ...form, description: event.target.value }))} placeholder="Responsabilidades principais" /></Field>
                  <Button className="w-full" disabled={savingFunction || !functionForm.code.trim() || !functionForm.name.trim()} type="submit">
                    <Plus className="h-4 w-4" /> Guardar função
                  </Button>
                </form>
              </CardContent>
            </Card>
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <Table>
                <TableHeader><TableRow><TableHead>Código</TableHead><TableHead>Nome</TableHead><TableHead>Descrição</TableHead><TableHead>Estado</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {functionRows.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-black">{item.code}</TableCell>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.description ?? "-"}</TableCell>
                      <TableCell><StatusBadge variant={item.active ? "success" : "secondary"}>{item.active ? "Ativa" : "Inativa"}</StatusBadge></TableCell>
                      <TableCell><Button variant="ghost" size="sm" onClick={() => toggleFunction(item.id, item.active)}>{item.active ? "Desativar" : "Ativar"}</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {tab === "payments" && (
          <div className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-[160px_160px_190px_1fr]">
              <Field label="Ano">
                <Input min="2020" max="2100" type="number" value={periodYear} onChange={(event) => setPeriodYear(Number(event.target.value))} />
              </Field>
              <Field label="Mês">
                <Select value={String(periodMonth)} onChange={(event) => setPeriodMonth(Number(event.target.value))} options={monthOptions()} />
              </Field>
              <Field label="Estado">
                <Select value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value as PaymentStatusFilter)} options={[
                  { label: "Todos", value: "ALL" },
                  { label: "Pagos", value: "PAID" },
                  { label: "Por pagar", value: "UNPAID" },
                ]} />
              </Field>
              <div className="flex items-end justify-end">
                <Button variant="outline" onClick={() => setRefreshKey((key) => key + 1)}>
                  <RefreshCw className="h-4 w-4" /> Atualizar período
                </Button>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
              <Card className="border-slate-200 shadow-none">
                <CardHeader><CardTitle className="text-base">Registar pagamento salarial</CardTitle></CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={submitPayment}>
                    <Field label="Colaborador" required>
                      <Select value={paymentForm.employeeId} onChange={(event) => selectEmployee(event.target.value)} options={[
                        { label: "Selecionar colaborador", value: "" },
                        ...activeEmployeeRows.map((employee) => ({ label: `${employee.fullName} · ${employee.employeeNumber}`, value: employee.id })),
                      ]} />
                    </Field>
                    <div className="grid gap-4 md:grid-cols-3">
                      <Field label="Bruto" required><Input min="0" step="0.01" type="number" value={paymentForm.grossAmount || ""} onChange={(event) => updatePayment("grossAmount", Number(event.target.value))} /></Field>
                      <Field label="Líquido" required><Input min="0" step="0.01" type="number" value={paymentForm.netAmount || ""} onChange={(event) => updatePayment("netAmount", Number(event.target.value))} /></Field>
                      <Field label="Pago" required><Input min="0" step="0.01" type="number" value={paymentForm.paidAmount || ""} onChange={(event) => updatePayment("paidAmount", Number(event.target.value))} /></Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Data de pagamento" required><Input required type="date" value={paymentForm.paymentDate} onChange={(event) => updatePayment("paymentDate", event.target.value)} /></Field>
                      <Field label="Método" required>
                        <Select value={paymentForm.paymentMethod} onChange={(event) => updatePayment("paymentMethod", event.target.value as PaymentMethod)} options={[
                          { label: "Transferência bancária", value: "BANK_TRANSFER" },
                          { label: "Dinheiro", value: "CASH" },
                          { label: "Mobile Money", value: "MOBILE_MONEY" },
                          { label: "Outro", value: "OTHER" },
                        ]} />
                      </Field>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label="Moeda"><Input value={paymentForm.currency ?? "MZN"} onChange={(event) => updatePayment("currency", event.target.value.toUpperCase())} /></Field>
                      <Field label="Referência"><Input value={paymentForm.reference ?? ""} onChange={(event) => updatePayment("reference", event.target.value)} placeholder="TRF-2026-05-001" /></Field>
                    </div>
                    <Field label="Notas"><Input value={paymentForm.notes ?? ""} onChange={(event) => updatePayment("notes", event.target.value)} /></Field>
                    <Button className="w-full" disabled={savingPayment || !paymentForm.employeeId || !paymentForm.grossAmount || !paymentForm.netAmount || !paymentForm.paidAmount} type="submit">
                      <ReceiptText className="h-4 w-4" /> {savingPayment ? "A registar..." : "Registar pagamento"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <Table>
                  <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Período</TableHead><TableHead>Estado</TableHead><TableHead>Valor pago</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {salaryStatusRows.map((row) => {
                      const employee = employeeById.get(row.employeeId);
                      return (
                        <TableRow key={row.employeeId}>
                          <TableCell><Avatar name={row.fullName} subtitle={row.functionName ?? row.employeeNumber} /></TableCell>
                          <TableCell>{row.periodMonth}/{row.periodYear}</TableCell>
                          <TableCell><StatusBadge variant={row.paymentStatus === "PAID" ? "success" : "warning"}>{row.paymentStatus === "PAID" ? "Pago" : "Por pagar"}</StatusBadge></TableCell>
                          <TableCell>{row.paidAmount ? money(row.paidAmount) : "-"}</TableCell>
                          <TableCell>
                            {row.paymentStatus === "UNPAID" && employee && (
                              <Button variant="ghost" size="sm" onClick={() => startPaymentForEmployee(employee)}>
                                Pagar
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 px-5 py-4">
                <h3 className="font-black text-slate-950">Pagamentos lançados no período</h3>
              </div>
            <Table>
              <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Mês / Ano</TableHead><TableHead>Valor</TableHead><TableHead>Método</TableHead><TableHead>Estado</TableHead><TableHead>Data</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>
                {paymentRows.map((payment) => {
                  const employee = employeeById.get(payment.employeeId);
                  const name = employee?.fullName ?? payment.employeeId;
                  return (
                    <TableRow key={payment.id}>
                      <TableCell><Avatar name={name} subtitle={employee?.functionName ?? payment.employeeId} /></TableCell>
                      <TableCell>{payment.periodMonth}/{payment.periodYear}</TableCell>
                      <TableCell className="text-lg font-black">{money(payment.paidAmount, payment.currency ?? "MZN")}</TableCell>
                      <TableCell>{humanizeEnum(payment.paymentMethod)}</TableCell>
                      <TableCell><StatusBadge variant={statusVariant(payment.status)}>{humanizeEnum(payment.status)}</StatusBadge></TableCell>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString("pt-PT")}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" disabled={payment.status === "CANCELLED"} onClick={() => cancelPayment(payment.id)}>
                          Cancelar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            <Pagination total={`${payments.data?.totalElements ?? 0} pagamentos`} />
            </div>
          </div>
        )}
      </Card>
    </AppShell>
  );

  function updatePayment<K extends keyof SalaryPaymentCreateDto>(key: K, value: SalaryPaymentCreateDto[K]) {
    setPaymentForm((form) => ({ ...form, [key]: value }));
  }
}

function TabButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white" : "rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100"}
    >
      {children}
    </button>
  );
}

function Avatar({ name, subtitle }: { name: string; subtitle: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold">{initials}</span><div><b>{name}</b><p className="text-sm text-slate-500">{subtitle}</p></div></div>;
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="space-y-2 text-sm font-semibold text-slate-900"><span>{label} {required && <span className="text-red-500">*</span>}</span>{children}</label>;
}

function optional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function monthOptions() {
  return Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    return { label: new Date(2026, index, 1).toLocaleDateString("pt-PT", { month: "long" }), value: String(month) };
  });
}
