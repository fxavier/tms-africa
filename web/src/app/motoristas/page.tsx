"use client";

import Link from "next/link";
import { RefreshCw, SlidersHorizontal, UserPlus, Users, CalendarX, Route, ShieldCheck, MoreVertical } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function DriversPage() {
  const drivers = useApiResource(() => api.drivers.list({ size: 100 }), []);
  const rows = drivers.data?.content ?? [];
  const active = rows.filter((driver) => driver.status === "ATIVO").length;
  const expiring = rows.filter((driver) => {
    if (!driver.licenseExpiryDate) return false;
    const expiry = new Date(driver.licenseExpiryDate).getTime();
    return expiry < Date.now() + 30 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <AppShell>
      <PageHeader
        title="Motoristas"
        subtitle="Gerir motoristas, documentação, disponibilidade e associação operacional"
        actions={<Button asChild><Link href="/motoristas/novo"><UserPlus className="h-4 w-4" /> Novo motorista</Link></Button>}
      />

      {drivers.error && <div className="mb-6"><ErrorState message={drivers.error} unauthorized={drivers.unauthorized} /></div>}
      {drivers.loading && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de Motoristas" value={String(drivers.data?.totalElements ?? 0)} hint="Backend" icon={Users} variant="secondary" />
        <StatCard label="Ativos" value={String(active)} hint="Disponíveis para alocação" icon={Route} variant="info" />
        <StatCard label="Cartas a Expirar" value={String(expiring)} hint="Próximos 30 dias" icon={CalendarX} variant="warning" />
        <StatCard label="Taxa de Disponibilidade" value={rows.length ? `${Math.round((active / rows.length) * 100)}%` : "0%"} hint="Motoristas ativos" icon={ShieldCheck} variant="success" />
      </section>

      <Card className="mt-7 overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-[1fr_280px_160px_44px] md:items-end">
          <label className="space-y-2 text-sm font-semibold text-slate-500">Pesquisar Motorista<Input placeholder="Nome, telefone ou nº da carta..." /></label>
          <label className="space-y-2 text-sm font-semibold text-slate-500">Categoria da Carta<Select options={[{ label: "Todas as categorias", value: "all" }, { label: "C", value: "c" }, { label: "C + E", value: "ce" }]} /></label>
          <Button variant="outline"><SlidersHorizontal className="h-4 w-4" /> Mais Filtros</Button>
          <Button variant="ghost" size="icon"><RefreshCw className="h-5 w-5" /></Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome Completo</TableHead><TableHead>Telefone</TableHead><TableHead>Nº da Carta</TableHead><TableHead>Categoria</TableHead><TableHead>Validade</TableHead><TableHead>Estado</TableHead><TableHead>Disponibilidade</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((driver) => (
              <TableRow key={driver.id}>
                <TableCell><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-xs font-bold">{driver.fullName.split(" ").map(x => x[0]).join("").slice(0,2)}</span><div><b>{driver.fullName}</b><p className="text-xs text-slate-500">ID: {driver.id}</p></div></div></TableCell>
                <TableCell>{driver.phone}</TableCell>
                <TableCell className="text-slate-500">{driver.licenseNumber}</TableCell>
                <TableCell><StatusBadge variant="secondary">{driver.licenseCategory}</StatusBadge></TableCell>
                <TableCell>{new Date(driver.licenseExpiryDate).toLocaleDateString("pt-PT")}</TableCell>
                <TableCell><StatusBadge variant={statusVariant(driver.status)}>{humanizeEnum(driver.status)}</StatusBadge></TableCell>
                <TableCell><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-green-600" /> {driver.activityLocation}</span></TableCell>
                <TableCell><MoreVertical className="h-5 w-5 text-slate-500" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination total={`${drivers.data?.totalElements ?? 0}`} />
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card><CardHeader><CardTitle>Atividade Recente</CardTitle></CardHeader><CardContent className="space-y-4"><div className="border-l-4 border-blue-600 pl-4"><b>Novo motorista Ana Pereira</b> adicionado à frota.<p className="text-sm text-slate-500">Há 45 minutos • por Admin</p></div><div className="border-l-4 border-orange-500 pl-4">Carta de condução de <b>Miguel Antunes</b> expira em breve.<p className="text-sm text-slate-500">Há 3 horas • Alerta de Sistema</p></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Sugestões de Otimização</CardTitle></CardHeader><CardContent><p className="leading-7 text-slate-500">Baseado na escala da próxima semana, recomendamos rever a disponibilidade de 4 motoristas para a rota internacional Sul.</p><Button variant="outline" className="mt-6 w-full">Rever Escala de Serviço</Button></CardContent></Card>
      </section>
    </AppShell>
  );
}
