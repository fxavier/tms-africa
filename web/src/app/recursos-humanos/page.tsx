"use client";

import Link from "next/link";
import { Download, FileText, Plus, ReceiptText, Users, AlertTriangle, ClipboardCheck, MoreVertical, Eye } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function HrPage() {
  const payments = useApiResource(() => api.hr.salaryPayments.list({ size: 100 }), []);
  const employees = useApiResource(() => api.hr.employees.list({ size: 100 }), []);
  const paymentRows = payments.data?.content ?? [];
  const employeeRows = employees.data?.content ?? [];
  const employeeById = new Map(employeeRows.map((employee) => [employee.id, employee]));
  const totalPaid = paymentRows.reduce((sum, payment) => sum + Number(payment.paidAmount ?? 0), 0);

  return (
    <AppShell>
      <PageHeader
        title="Recursos Humanos"
        subtitle="Faça a gestão dos seus colaboradores, funções e processamento salarial."
        actions={<Button asChild><Link href="/recursos-humanos/novo"><Plus className="h-4 w-4" /> Novo Colaborador</Link></Button>}
      />
      {(payments.error || employees.error) && <div className="mb-6"><ErrorState message={payments.error ?? employees.error ?? ""} unauthorized={payments.unauthorized || employees.unauthorized} /></div>}
      {(payments.loading || employees.loading) && <div className="mb-6"><LoadingState /></div>}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Colaboradores Ativos" value={String(employeeRows.filter((employee) => employee.status === "ACTIVE").length)} hint="Backend" icon={Users} variant="info" />
        <StatCard label="Total Pagamentos" value={new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(totalPaid)} hint="Lista atual" icon={ReceiptText} variant="info" />
        <StatCard label="Pagamentos Cancelados" value={String(paymentRows.filter((payment) => payment.status === "CANCELLED").length)} hint="Ação necessária" icon={AlertTriangle} variant="danger" />
        <StatCard label="Colaboradores" value={String(employees.data?.totalElements ?? 0)} hint="Cadastro RH" icon={ClipboardCheck} variant="warning" />
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="flex gap-10 border-b border-slate-200 px-7 text-xl text-slate-500"><span className="py-6">Colaboradores</span><span className="py-6">Funções</span><span className="border-b-2 border-slate-950 py-6 font-bold text-slate-950">Pagamentos Salariais</span></div>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-6">
          <Select className="max-w-[180px]" options={[{ label: "Todos os Meses", value: "all" }]} />
          <Select className="max-w-[180px]" options={[{ label: "Todos os Estados", value: "all" }]} />
          <Button className="ml-auto" variant="outline"><Download className="h-4 w-4" /> Exportar PDF</Button>
          <Button><FileText className="h-4 w-4" /> Processar Lote</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Colaborador</TableHead><TableHead>Mês / Ano</TableHead><TableHead>Valor</TableHead><TableHead>Estado</TableHead><TableHead>Data do Processamento</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>{paymentRows.map((payment) => {
            const employee = employeeById.get(payment.employeeId);
            const name = employee?.fullName ?? payment.employeeId;
            return <TableRow key={payment.id}><TableCell><div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-bold">{name.split(" ").map(x => x[0]).join("").slice(0,2)}</span><div><b>{name}</b><p className="text-sm text-slate-500">{employee?.functionName ?? "-"}</p></div></div></TableCell><TableCell>{payment.periodMonth}/{payment.periodYear}</TableCell><TableCell className="text-lg font-black">{new Intl.NumberFormat("pt-PT", { style: "currency", currency: payment.currency ?? "EUR" }).format(payment.paidAmount)}</TableCell><TableCell><StatusBadge variant={statusVariant(payment.status)}>{humanizeEnum(payment.status)}</StatusBadge></TableCell><TableCell>{new Date(payment.paymentDate).toLocaleDateString("pt-PT")}</TableCell><TableCell><div className="flex gap-4"><Eye className="h-5 w-5 text-slate-500" /><MoreVertical className="h-5 w-5 text-slate-500" /></div></TableCell></TableRow>;
          })}</TableBody>
        </Table>
        <Pagination total={`${payments.data?.totalElements ?? 0} pagamentos`} />
      </Card>
    </AppShell>
  );
}
