import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CalendarClock, Check, ChevronLeft, FileCheck2, Route, Save, Truck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { FormField } from "@/components/tms/FormField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

const validations = [
  { title: "Viatura disponível", detail: "Sem serviços agendados para este período", state: "success" as const },
  { title: "Documentos da viatura válidos", detail: "IPO e seguro dentro da validade", state: "success" as const },
  { title: "Seguro próximo da renovação", detail: "Expira em 12 dias; renovação recomendada", state: "warning" as const },
  { title: "Motorista ativo", detail: "Contrato e disponibilidade operacional válidos", state: "success" as const },
  { title: "Carta de condução válida", detail: "Categorias C + E verificadas", state: "success" as const },
  { title: "Certificação CAM próxima", detail: "Próxima formação recomendada em 30 dias", state: "warning" as const },
];

export default function NewActivityPage() {
  return (
    <AppShell>
      <PageHeader
        title="Novo Serviço"
        subtitle="Transport Management System"
        actions={<Button variant="outline" asChild><Link href="/atividades"><ChevronLeft className="h-4 w-4" /> Voltar à listagem</Link></Button>}
      />

      <Card className="mb-8 p-6">
        <div className="grid grid-cols-5 items-start gap-0 text-center text-sm font-semibold text-slate-500">
          {["Definição", "Rota & Carga", "Alocação", "Validação", "Conclusão"].map((step, index) => (
            <div key={step} className="relative">
              {index < 4 && <div className="absolute left-1/2 top-5 h-1 w-full bg-slate-200" />}
              <div className="relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-slate-950 text-white shadow-soft">{index < 3 ? <Check className="h-5 w-5" /> : index + 1}</div>
              <div className={index === 3 ? "mt-2 font-black text-slate-950" : "mt-2"}>{step}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="mb-8 overflow-hidden bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Resumo da atividade</p>
            <h2 className="text-3xl font-black">Lisboa (Terminal 1) → Madrid (Hub Norte)</h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-4 py-2"><CalendarClock className="mr-2 inline h-4 w-4" />24 Mai, 2024 - 08:00</span>
              <span className="rounded-full bg-white/10 px-4 py-2"><Truck className="mr-2 inline h-4 w-4" />Carga Geral (12t)</span>
              <span className="rounded-full bg-white/10 px-4 py-2"><Route className="mr-2 inline h-4 w-4" />624 km</span>
            </div>
          </div>
          <div className="grid min-w-[250px] grid-cols-2 rounded-2xl border border-white/20 bg-white/10 p-5 text-center">
            <div><p className="text-sm text-slate-300">Estimativa</p><b className="text-2xl">6h 15min</b></div>
            <div className="border-l border-white/20"><p className="text-sm text-slate-300">Distância</p><b className="text-2xl">624 km</b></div>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-8 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-3"><Route className="h-5 w-5" /> Dados da atividade</CardTitle></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <FormField label="Título" required value="Transporte Lisboa - Madrid" />
            <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de atividade <span className="text-red-500">*</span></span><Select options={[{ label: "Carga Geral", value: "general" }, { label: "Entrega Operacional", value: "delivery" }, { label: "Recolha de Equipamento", value: "pickup" }]} /></label>
            <FormField label="Origem" required value="Lisboa - Terminal 1" />
            <FormField label="Destino" required value="Madrid - Hub Norte" />
            <FormField label="Início previsto" required type="datetime-local" />
            <FormField label="Fim previsto" required type="datetime-local" />
            <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Prioridade</span><Select options={[{ label: "Alta", value: "high" }, { label: "Normal", value: "normal" }, { label: "Crítica", value: "critical" }]} /></label>
            <FormField label="Peso / Volume" value="12t / 42 m³" />
            <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2"><span>Descrição / Notas</span><textarea className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" defaultValue="Carga geral com entrega prioritária e confirmação documental no destino." /></label>
          </CardContent>
        </Card>

        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Viatura selecionada</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><b className="text-lg">Scania R450 • 22-RT-99</b><p className="mt-1 text-sm text-slate-500">Pesado articulado • 24.000 kg • Terminal Lisboa</p></div>
              <ValidationItem title="Viatura disponível" detail="Sem serviços agendados para este período" variant="success" icon={Check} />
              <ValidationItem title="Seguro válido" detail="Expira em 12 dias" variant="warning" icon={AlertTriangle} />
              <ValidationItem title="Inspeção (IPO)" detail="Válida até 15 de Setembro de 2024" variant="success" icon={Check} />
              <Button variant="outline" className="w-full">Alterar viatura</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><UserRound className="h-5 w-5" /> Motorista selecionado</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5"><b className="text-lg">Ricardo Silva</b><p className="mt-1 text-sm text-slate-500">ID: 44921 • Categorias C + E • Lisboa</p></div>
              <ValidationItem title="Motorista disponível" detail="Descanso regulamentar de 11h cumprido" variant="success" icon={Check} />
              <ValidationItem title="Carta de condução válida" detail="Categorias verificadas e ativas" variant="success" icon={Check} />
              <ValidationItem title="Certificação CAM" detail="Próxima formação recomendada em 30 dias" variant="warning" icon={AlertTriangle} />
              <Button variant="outline" className="w-full">Alterar motorista</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="mt-8 border-blue-300 bg-blue-50/70">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-3 text-xl font-black"><FileCheck2 className="h-6 w-6 text-blue-600" /> Validação de alocação</h3>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {validations.map((item) => (
              <div key={item.title} className="rounded-xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className={item.state === "success" ? "grid h-9 w-9 place-items-center rounded-full bg-green-100 text-green-700" : "grid h-9 w-9 place-items-center rounded-full bg-orange-100 text-orange-700"}>{item.state === "success" ? <Check className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}</span>
                  <div><b>{item.title}</b><p className="text-sm text-slate-500">{item.detail}</p></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 mt-8 border-t border-slate-200 bg-slate-50/95 py-5 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" asChild><Link href="/atividades"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
          <div className="flex gap-4"><Button variant="outline"><Save className="h-4 w-4" /> Guardar rascunho</Button><Button><Check className="h-4 w-4" /> Criar atividade</Button></div>
        </div>
      </div>
    </AppShell>
  );
}

function ValidationItem({ title, detail, variant, icon: Icon }: { title: string; detail: string; variant: "success" | "warning" | "danger"; icon: LucideIcon }) {
  const styles = variant === "success" ? "border-green-200 bg-green-50 text-green-700" : variant === "warning" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`flex items-center gap-4 rounded-xl border p-4 ${styles}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-current/10"><Icon className="h-5 w-5" /></span><div><b>{title}</b><p className="text-sm text-slate-600">{detail}</p></div></div>;
}
