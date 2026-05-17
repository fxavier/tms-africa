"use client";

import Link from "next/link";
import { Download, Eye, Filter, MapPin, Pencil, Plus, ShieldCheck, Truck, Wrench, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function VehiclesPage() {
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const rows = vehicles.data?.content ?? [];
  const available = rows.filter((vehicle) => vehicle.status === "DISPONIVEL").length;
  const maintenance = rows.filter((vehicle) => vehicle.status === "EM_MANUTENCAO").length;
  const unavailable = rows.filter((vehicle) => vehicle.status === "INDISPONIVEL" || vehicle.status === "ABATIDA").length;

  return (
    <AppShell>
      <PageHeader
        title="Viaturas"
        subtitle="Gerir cadastro, documentação, estado operacional e histórico das viaturas"
        actions={<Button asChild><Link href="/viaturas/nova"><Plus className="h-4 w-4" /> Nova Viatura</Link></Button>}
      />

      {vehicles.error && <div className="mb-6"><ErrorState message={vehicles.error} unauthorized={vehicles.unauthorized} /></div>}
      {vehicles.loading && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total de Viaturas" value={String(vehicles.data?.totalElements ?? 0)} hint="Backend" icon={Truck} variant="secondary" />
        <StatCard label="Disponíveis" value={String(available)} hint="Frota ativa" icon={ShieldCheck} variant="success" />
        <StatCard label="Em Manutenção" value={String(maintenance)} hint="Hoje" icon={Wrench} variant="warning" />
        <StatCard label="Indisponíveis" value={String(unavailable)} hint="Requer ação" icon={XCircle} variant="danger" />
      </section>

      <Card className="mt-7 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-200 p-5 md:flex-row md:items-center">
          <Input placeholder="Matrícula (ex: AA-00-BB)" className="max-w-sm" />
          <Select className="max-w-sm" options={[{ label: "Todos os Estados", value: "all" }, { label: "Disponível", value: "available" }, { label: "Em manutenção", value: "maintenance" }]} />
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="icon"><Filter className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Download className="h-4 w-4" /></Button>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Marca/Modelo</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Capacidade</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Local</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((vehicle) => (
              <TableRow key={vehicle.id}>
                <TableCell className="font-black"><Link href={`/viaturas/detalhe?id=${vehicle.id}`}>{vehicle.plate}</Link></TableCell>
                <TableCell>{vehicle.brand} {vehicle.model}</TableCell>
                <TableCell className="text-slate-500">{vehicle.vehicleType}</TableCell>
                <TableCell>{vehicle.capacity} kg</TableCell>
                <TableCell><StatusBadge variant={statusVariant(vehicle.status)}>{humanizeEnum(vehicle.status)}</StatusBadge></TableCell>
                <TableCell><span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-blue-600" /> {vehicle.activityLocation}</span></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="ghost" size="icon" aria-label={`Ver detalhes da viatura ${vehicle.plate}`}>
                      <Link href={`/viaturas/detalhe?id=${vehicle.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" aria-label={`Editar viatura ${vehicle.plate}`}>
                      <Link href={`/viaturas/editar?id=${vehicle.id}`}><Pencil className="h-4 w-4" /></Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination total={`${vehicles.data?.totalElements ?? 0}`} />
      </Card>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]">
        <Card className="overflow-hidden">
          <div className="relative h-[315px] bg-slate-900">
            <div className="absolute inset-0 opacity-80 bg-[radial-gradient(circle_at_48%_45%,rgba(14,165,233,.8),transparent_8%),radial-gradient(circle_at_20%_70%,rgba(14,165,233,.65),transparent_5%),linear-gradient(135deg,#0f172a,#082f49)]" />
            <div className="absolute inset-0 bg-[repeating-linear-gradient(30deg,rgba(125,211,252,.24),rgba(125,211,252,.24)_1px,transparent_1px,transparent_38px)]" />
            <div className="absolute left-5 top-5 rounded-xl bg-white px-4 py-3 text-lg font-bold shadow-soft">Localização em Tempo Real (GPS)</div>
          </div>
        </Card>
        <Card className="bg-slate-950 text-white">
          <CardContent className="p-7">
            <h3 className="text-2xl font-black">Seguro de Frota</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">Existem 3 apólices com renovação pendente nos próximos 15 dias.</p>
            <div className="mt-8 space-y-3">
              {["AA-12-BB • Allianz Seguros", "55-VZ-90 • Fidelidade"].map((item) => (
                <div key={item} className="rounded-xl bg-slate-800 px-4 py-3 font-semibold">🛡️ {item}</div>
              ))}
            </div>
            <Button variant="outline" className="mt-8 w-full bg-white text-slate-950 hover:bg-slate-100">Rever Apólices</Button>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
