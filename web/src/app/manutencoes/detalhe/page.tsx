import Link from "next/link";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CalendarDays, CheckCircle2, ChevronLeft, Download, Euro, FileText, MoreVertical, Printer, Truck, UserRound, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const parts = [
  ["Óleo motor 5W30", "2", "42,50 €", "85,00 €"],
  ["Filtro de óleo", "1", "18,00 €", "18,00 €"],
  ["Pastilhas de travão", "1", "172,00 €", "172,00 €"],
];

const timeline = [
  ["Registo criado", "24 Mai 2024, 08:12", "João Pinho"],
  ["Viatura marcada como indisponível", "24 Mai 2024, 08:15", "Sistema"],
  ["Serviços técnicos concluídos", "24 Mai 2024, 11:42", "Bosch Car Service"],
  ["Checklist pós-manutenção aprovada", "24 Mai 2024, 12:05", "João Pinho"],
];

export default function MaintenanceDetailPage() {
  return (
    <AppShell>
      <PageHeader
        title="Detalhes da Manutenção"
        subtitle="MNT-2024-0012 • Manutenção preventiva registada para a viatura AA-12-BB."
        actions={<><Button variant="outline" asChild><Link href="/manutencoes"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button variant="outline"><Printer className="h-4 w-4" /> Imprimir</Button><Button><Download className="h-4 w-4" /> Exportar PDF</Button></>}
      />

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <InfoCard icon={Truck} title="Viatura" value="AA-12-BB" detail="Mercedes-Benz Sprinter 314" />
        <InfoCard icon={Wrench} title="Tipo" value="Preventiva" detail="Revisão programada" />
        <InfoCard icon={Euro} title="Custo total" value="559,65 €" detail="IVA incluído" />
        <InfoCard icon={CalendarDays} title="Próxima manutenção" value="150.000 km" detail="12 Out 2024" />
      </section>

      <section className="mt-8 grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Resumo técnico</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Detail label="Estado" value={<StatusBadge variant="success">CONCLUÍDA</StatusBadge>} />
              <Detail label="Fornecedor" value="Bosch Car Service Lisboa" />
              <Detail label="Data de início" value="24 Mai 2024, 08:00" />
              <Detail label="Data de conclusão" value="24 Mai 2024, 12:05" />
              <Detail label="Quilometragem" value="142.600 km" />
              <Detail label="Responsável interno" value="João Pinho" />
              <div className="md:col-span-2 rounded-xl bg-slate-50 p-5"><b>Observações</b><p className="mt-2 leading-7 text-slate-600">Substituição de óleo, filtros e pastilhas de travão. Revisão técnica concluída sem falhas críticas. Recomendada nova inspeção visual aos pneus antes da próxima rota internacional.</p></div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader><CardTitle>Peças e serviços</CardTitle></CardHeader>
            <Table>
              <TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Quantidade</TableHead><TableHead>Preço unitário</TableHead><TableHead>Total</TableHead></TableRow></TableHeader>
              <TableBody>{parts.map((part) => <TableRow key={part[0]}><TableCell className="font-semibold">{part[0]}</TableCell><TableCell>{part[1]}</TableCell><TableCell>{part[2]}</TableCell><TableCell className="font-black">{part[3]}</TableCell></TableRow>)}</TableBody>
            </Table>
          </Card>

          <Card>
            <CardHeader><CardTitle>Anexos e documentação</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {["fatura_bosch_0012.pdf", "relatorio_tecnico.pdf", "checklist_pos_manutencao.pdf"].map((file) => <div key={file} className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span className="flex items-center gap-3 text-sm font-semibold"><FileText className="h-5 w-5 text-blue-600" /> {file}</span><MoreVertical className="h-5 w-5 text-slate-500" /></div>)}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-8">
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><UserRound className="h-5 w-5" /> Responsáveis</CardTitle></CardHeader><CardContent className="space-y-4"><Person name="João Pinho" role="Mecânico interno" /><Person name="Carlos Mendes" role="Gestor de Frota" /><Person name="Bosch Car Service" role="Fornecedor externo" /></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><CheckCircle2 className="h-5 w-5 text-green-600" /> Validação operacional</CardTitle></CardHeader><CardContent className="space-y-3"><Validation text="Viatura desbloqueada para alocação" variant="success" /><Validation text="Checklist pós-manutenção aprovada" variant="success" /><Validation text="Nova manutenção preventiva agendada" variant="success" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Histórico</CardTitle></CardHeader><CardContent className="space-y-5">{timeline.map(([title, date, user]) => <div key={title} className="border-l-2 border-slate-200 pl-4"><b>{title}</b><p className="text-sm text-slate-500">{date} • {user}</p></div>)}</CardContent></Card>
          <Card className="border-orange-200 bg-orange-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-orange-700"><AlertTriangle className="h-5 w-5" /> Atenção operacional</h3><p className="mt-2 text-sm leading-6 text-slate-600">Qualquer alteração ao registo deve ficar auditada e pode impactar a disponibilidade da viatura.</p></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function InfoCard({ icon: Icon, title, value, detail }: { icon: LucideIcon; title: string; value: string; detail: string }) {
  return <Card><CardContent className="p-6"><span className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5" /></span><p className="text-sm font-bold uppercase tracking-widest text-slate-500">{title}</p><div className="mt-2 text-3xl font-black">{value}</div><p className="mt-1 text-sm text-slate-500">{detail}</p></CardContent></Card>;
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return <div><p className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</p><div className="mt-2 text-base font-semibold text-slate-950">{value}</div></div>;
}

function Person({ name, role }: { name: string; role: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-xs font-black">{name.split(" ").map(part => part[0]).join("").slice(0, 2)}</span><div><b>{name}</b><p className="text-sm text-slate-500">{role}</p></div></div>;
}

function Validation({ text, variant }: { text: string; variant: "success" | "warning" }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={variant === "success" ? "grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700" : "grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-700"}>✓</span><b className="text-sm">{text}</b></div>;
}
