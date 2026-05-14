import Link from "next/link";
import { AlertTriangle, Camera, Check, ChevronLeft, ClipboardCheck, FileText, Save, Truck, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const items = [
  { name: "Pneus", critical: true, status: "OK", note: "Pressão validada" },
  { name: "Travões", critical: true, status: "OK", note: "Sem ruído anormal" },
  { name: "Luzes", critical: true, status: "OK", note: "Médios, máximos e piscas OK" },
  { name: "Extintor", critical: true, status: "OK", note: "Dentro da validade" },
  { name: "Triângulo de sinalização", critical: true, status: "FALTA", note: "Ausente na mala" },
  { name: "Roda sobressalente", critical: false, status: "OK", note: "Presente" },
  { name: "Macaco", critical: false, status: "OK", note: "Operacional" },
  { name: "Colete refletor", critical: true, status: "OK", note: "2 unidades" },
];

export default function NewChecklistPage() {
  return (
    <AppShell>
      <PageHeader
        title="Registar Checklist"
        subtitle="Submeta a inspeção operacional da viatura antes da atividade ou após manutenção."
        actions={<><Button variant="outline" asChild><Link href="/checklists"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button><Save className="h-4 w-4" /> Submeter checklist</Button></>}
      />

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5" /> Dados da checklist</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Template <span className="text-red-500">*</span></span><Select options={[{ label: "Inspeção Pré-Viagem (Pesados)", value: "pre-trip-heavy" }, { label: "Verificação de Pneus e Travões", value: "tires" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Viatura <span className="text-red-500">*</span></span><Select options={[{ label: "AA-12-BB — Mercedes-Benz Sprinter", value: "AA-12-BB" }, { label: "55-VZ-90 — Scania R450", value: "55-VZ-90" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Atividade associada</span><Select options={[{ label: "ACT-2024-0019 — Lisboa → Madrid", value: "ACT-2024-0019" }, { label: "Sem atividade", value: "none" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Submetido por</span><Input defaultValue="Ricardo Silva" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Data / hora</span><Input type="datetime-local" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Local</span><Input defaultValue="Lisboa - Terminal 1" /></label>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="border-b border-slate-200"><CardTitle>Itens de verificação</CardTitle></CardHeader>
            <CardContent className="space-y-4 p-6">
              {items.map((item) => <ChecklistItem key={item.name} {...item} />)}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><FileText className="h-5 w-5" /> Observações e evidências</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <textarea className="min-h-32 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" defaultValue="Triângulo de sinalização ausente. É necessário repor antes de iniciar nova atividade internacional." />
              <button className="flex h-20 w-full items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 font-semibold text-slate-500"><Camera className="h-5 w-5" /> Anexar fotografia ou PDF</button>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo de validação</h3><div className="mt-6 grid grid-cols-2 gap-4"><Metric label="Itens" value="8" /><Metric label="OK" value="7" /><Metric label="Falhas" value="1" /><Metric label="Críticas" value="1" /></div></CardContent></Card>
          <Card className="border-red-200 bg-red-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-red-700"><AlertTriangle className="h-5 w-5" /> Falha crítica encontrada</h3><p className="mt-2 text-sm leading-6 text-slate-700">Esta falha crítica pode bloquear o início da atividade. Resolva ou justifique antes de confirmar a alocação.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Contexto operacional</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><Row label="Viatura" value="AA-12-BB" /><Row label="Motorista" value="Ricardo Silva" /><Row label="Atividade" value="ACT-2024-0019" /><Row label="Destino" value="Madrid" /></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function ChecklistItem({ name, critical, status, note }: { name: string; critical: boolean; status: string; note: string }) {
  const failed = status === "FALTA" || status === "AVARIA";
  return (
    <div className={failed ? "rounded-2xl border border-red-200 bg-red-50 p-5" : "rounded-2xl border border-slate-200 bg-white p-5"}>
      <div className="grid gap-4 lg:grid-cols-[1fr_220px_1fr] lg:items-center">
        <div><div className="flex items-center gap-3"><b className="text-lg">{name}</b>{critical && <StatusBadge variant="danger">Crítico</StatusBadge>}</div><p className="mt-1 text-sm text-slate-500">{note}</p></div>
        <div className="grid grid-cols-3 rounded-xl bg-slate-100 p-1 text-center text-xs font-black">
          <button className={status === "OK" ? "rounded-lg bg-white px-3 py-2 text-green-700 shadow-sm" : "px-3 py-2 text-slate-500"}><Check className="mx-auto h-4 w-4" /> OK</button>
          <button className={status === "AVARIA" ? "rounded-lg bg-white px-3 py-2 text-orange-700 shadow-sm" : "px-3 py-2 text-slate-500"}><AlertTriangle className="mx-auto h-4 w-4" /> Avaria</button>
          <button className={status === "FALTA" ? "rounded-lg bg-white px-3 py-2 text-red-700 shadow-sm" : "px-3 py-2 text-slate-500"}><X className="mx-auto h-4 w-4" /> Falta</button>
        </div>
        <Input placeholder="Nota do item..." defaultValue={note} />
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-white/10 p-4"><p className="text-sm text-slate-300">{label}</p><b className="text-2xl">{value}</b></div>;
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-slate-100 pb-3"><span className="text-slate-500">{label}</span><b>{value}</b></div>;
}
