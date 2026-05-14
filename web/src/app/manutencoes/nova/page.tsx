import Link from "next/link";
import { AlertTriangle, CalendarDays, ChevronLeft, ClipboardCheck, FilePlus2, Save, Truck, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { FormField } from "@/components/tms/FormField";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default function NewMaintenancePage() {
  return (
    <AppShell>
      <PageHeader
        title="Registar Manutenção"
        subtitle="Registe manutenções preventivas ou corretivas, custos, fornecedor e próxima intervenção."
        actions={<><Button variant="outline" asChild><Link href="/manutencoes"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button><Save className="h-4 w-4" /> Guardar manutenção</Button></>}
      />

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Identificação da manutenção</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Viatura <span className="text-red-500">*</span></span><Select options={[{ label: "AA-12-BB — Mercedes-Benz Sprinter 314", value: "AA-12-BB" }, { label: "55-VZ-90 — Scania R450", value: "55-VZ-90" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de manutenção <span className="text-red-500">*</span></span><Select options={[{ label: "Preventiva", value: "preventiva" }, { label: "Corretiva", value: "corretiva" }, { label: "Inspeção técnica", value: "inspecao" }]} /></label>
              <FormField label="Data da manutenção" type="date" required />
              <FormField label="Quilometragem atual" required value="142600" />
              <FormField label="Fornecedor / Oficina" required value="Bosch Car Service Lisboa" />
              <FormField label="Responsável interno" required value="João Pinho" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Wrench className="h-5 w-5" /> Serviços efetuados</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              {[
                ["Substituição de óleo e filtros", "Preventiva", "95,00 €"],
                ["Verificação de travões e pneus", "Segurança", "120,00 €"],
                ["Diagnóstico eletrónico", "Técnica", "45,00 €"],
              ].map(([name, type, value]) => (
                <div key={name} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_140px_auto] md:items-center">
                  <FormField label="Descrição" value={name} />
                  <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Categoria</span><Select options={[{ label: type, value: type }, { label: "Mecânica", value: "mecanica" }]} /></label>
                  <FormField label="Custo" value={value} />
                  <Button variant="ghost" size="icon" className="self-end text-red-600">×</Button>
                </div>
              ))}
              <button className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 font-semibold text-slate-500"><FilePlus2 className="h-5 w-5" /> Adicionar serviço</button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><CalendarDays className="h-5 w-5" /> Próxima manutenção</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <FormField label="Próxima data" type="date" value="2024-10-12" />
              <FormField label="Próxima quilometragem" value="150000" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Prioridade</span><Select options={[{ label: "Normal", value: "normal" }, { label: "Alta", value: "alta" }, { label: "Crítica", value: "critica" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-3"><span>Observações técnicas</span><textarea className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" defaultValue="Rever desgaste dos pneus antes da próxima rota internacional. Recomendada nova inspeção aos travões em 30 dias." /></label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo financeiro</h3><div className="mt-6 space-y-4"><SummaryLine label="Mão de obra" value="180,00 €" /><SummaryLine label="Peças" value="275,00 €" /><SummaryLine label="IVA estimado" value="104,65 €" /><div className="border-t border-white/20 pt-4"><SummaryLine label="Total" value="559,65 €" strong /></div></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><AlertTriangle className="h-5 w-5 text-orange-600" /> Impacto operacional</CardTitle></CardHeader><CardContent className="space-y-4 text-sm text-slate-600"><p>A viatura ficará indisponível durante a janela de manutenção configurada.</p><StatusBadge variant="warning">Bloqueia alocação</StatusBadge><p>Serviços planeados entre 08:00 e 12:00 não poderão usar esta viatura.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><ClipboardCheck className="h-5 w-5 text-green-600" /> Checklist pós-manutenção</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><CheckLine text="Revisão técnica concluída" /><CheckLine text="Documentos anexados" /><CheckLine text="Próxima manutenção definida" /><CheckLine text="Responsável técnico identificado" /></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className="flex items-center justify-between"><span className="text-slate-300">{label}</span><span className={strong ? "text-2xl font-black" : "font-bold"}>{value}</span></div>;
}

function CheckLine({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">✓</span><b>{text}</b></div>;
}
