import Link from "next/link";
import { CheckSquare, ClipboardCheck, MoreVertical, Plus, XCircle } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const rows = [
  ["AA-12-BB", "ACT-2024-001", "Inspeção Pré-Viagem", "João Silva", "24/05/2024", "APROVADO", "0", "success"],
  ["BE-88-TT", "ACT-2024-002", "Pneus e Travões", "Miguel Antunes", "24/05/2024", "FALHA CRÍTICA", "2", "danger"],
  ["92-XL-04", "ACT-2024-003", "Higienização", "Ana Ferreira", "23/05/2024", "APROVADO", "0", "success"],
] as const;

export default function ChecklistsPage() {
  return (
    <AppShell>
      <PageHeader title="Checklists" subtitle="Submeter e consultar checklists operacionais das viaturas e atividades." actions={<Button asChild><Link href="/checklists/nova"><Plus className="h-4 w-4" /> Nova checklist</Link></Button>} />
      <section className="grid gap-6 md:grid-cols-3"><StatCard label="Submetidas Hoje" value="18" hint="+5" icon={CheckSquare} variant="success" /><StatCard label="Pendentes" value="7" hint="A aguardar" icon={ClipboardCheck} variant="warning" /><StatCard label="Falhas Críticas" value="2" hint="Bloqueiam atividade" icon={XCircle} variant="danger" /></section>
      <Card className="mt-8 overflow-hidden"><Table><TableHeader><TableRow><TableHead>Viatura</TableHead><TableHead>Atividade</TableHead><TableHead>Template</TableHead><TableHead>Submetido por</TableHead><TableHead>Data</TableHead><TableHead>Resultado</TableHead><TableHead>Falhas</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader><TableBody>{rows.map(row => <TableRow key={row[1]}><TableCell>{row[0]}</TableCell><TableCell>{row[1]}</TableCell><TableCell>{row[2]}</TableCell><TableCell>{row[3]}</TableCell><TableCell>{row[4]}</TableCell><TableCell><StatusBadge variant={row[7] as any}>{row[5]}</StatusBadge></TableCell><TableCell>{row[6]}</TableCell><TableCell><MoreVertical className="h-5 w-5" /></TableCell></TableRow>)}</TableBody></Table><Pagination total="58" /></Card>
      <Card className="mt-8"><CardHeader><CardTitle>Itens Críticos do Template</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-4">{["Pneus", "Travões", "Luzes", "Extintor", "Triângulo", "Roda sobressalente", "Macaco", "Colete refletor"].map(item => <div key={item} className="rounded-xl border border-slate-200 p-4"><b>{item}</b><p className="mt-2 text-sm text-slate-500">OK / AVARIA / FALTA</p></div>)}</CardContent></Card>
    </AppShell>
  );
}
