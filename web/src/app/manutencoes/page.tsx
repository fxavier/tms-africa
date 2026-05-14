import Link from "next/link";
import { CalendarDays, Euro, Eye, Plus, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const maintenances = [
  ["AA-12-BB", "Preventiva", "12/10/2024", "142.600 km", "Bosch Car Service", "420,00 €", "150.000 km", "João Pinho", "warning"],
  ["BE-88-TT", "Corretiva", "20/09/2024", "88.100 km", "Oficina Central", "1.250,00 €", "N/A", "Miguel Silva", "danger"],
  ["92-XL-04", "Preventiva", "15/09/2024", "245.300 km", "Volvo Trucks", "980,00 €", "260.000 km", "Ana Vieira", "success"],
] as const;

export default function MaintenancePage() {
  return (
    <AppShell>
      <PageHeader title="Manutenções" subtitle="Registar e acompanhar manutenções preventivas e corretivas das viaturas." actions={<Button asChild><Link href="/manutencoes/nova"><Plus className="h-4 w-4" /> Registar manutenção</Link></Button>} />
      <section className="grid gap-6 md:grid-cols-3"><StatCard label="Pendentes" value="6" hint="2 críticas" icon={Wrench} variant="warning" /><StatCard label="Custo Mensal" value="8.420 €" hint="+12% vs mês anterior" icon={Euro} variant="info" /><StatCard label="Próximas Revisões" value="14" hint="30 dias" icon={CalendarDays} variant="secondary" /></section>
      <Card className="mt-8 overflow-hidden">
        <div className="grid gap-4 border-b border-slate-200 p-5 md:grid-cols-4"><Input placeholder="Pesquisar viatura..." /><Select options={[{ label: "Todos os Tipos", value: "all" }]} /><Select options={[{ label: "Todos os Fornecedores", value: "all" }]} /><Button>Filtrar</Button></div>
        <Table><TableHeader><TableRow><TableHead>Viatura</TableHead><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Quilometragem</TableHead><TableHead>Fornecedor</TableHead><TableHead>Custo</TableHead><TableHead>Próxima</TableHead><TableHead>Responsável</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{maintenances.map((row) => <TableRow key={row[0]}>{row.slice(0,8).map((cell, index) => <TableCell key={`${row[0]}-${index}`}>{index === 1 ? <StatusBadge variant={row[8] as any}>{cell}</StatusBadge> : cell}</TableCell>)}<TableCell><Button asChild variant="ghost" size="icon"><Link href="/manutencoes/detalhe"><Eye className="h-5 w-5" /></Link></Button></TableCell></TableRow>)}</TableBody></Table>
        <Pagination total="32" />
      </Card>
    </AppShell>
  );
}
