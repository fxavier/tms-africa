import Link from "next/link";
import { AlertTriangle, BellRing, CheckSquare, ChevronLeft, FilePlus2, Save, Settings2, ShieldCheck, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { FormField } from "@/components/tms/FormField";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const templateItems = [
  ["Pneus", "Crítico", "Exterior"],
  ["Travões", "Crítico", "Mecânica"],
  ["Luzes", "Crítico", "Exterior"],
  ["Extintor", "Crítico", "Segurança"],
  ["Triângulo", "Crítico", "Acessório"],
];

export default function NewSettingsPage() {
  return (
    <AppShell>
      <PageHeader
        title="Registo de Configurações"
        subtitle="Crie ou atualize parâmetros operacionais, alertas, manutenção e templates de checklist."
        actions={<><Button variant="outline" asChild><Link href="/configuracoes"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button><Save className="h-4 w-4" /> Guardar configurações</Button></>}
      />

      <section className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><BellRing className="h-5 w-5" /> Períodos de alerta operacional</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de evento</span><Select options={[{ label: "Inspeção Periódica (IPO)", value: "ipo" }, { label: "Renovação de Seguro", value: "insurance" }, { label: "Manutenção Preventiva", value: "maintenance" }]} /></label>
              <FormField label="Aviso (dias)" value="30" />
              <FormField label="Crítico (dias)" value="7" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Destinatários</span><Select options={[{ label: "Gestor de Frota + Operações", value: "fleet_ops" }, { label: "Financeiro", value: "finance" }, { label: "Técnico", value: "technical" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Canal de notificação</span><Select options={[{ label: "Sistema + Email", value: "system_email" }, { label: "Sistema", value: "system" }, { label: "Email", value: "email" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Estado</span><Select options={[{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }]} /></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><CheckSquare className="h-5 w-5" /> Template de checklist</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 md:grid-cols-3">
                <FormField label="Nome do template" required value="Inspeção Pré-Viagem (Pesados)" />
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de viatura</span><Select options={[{ label: "Pesado", value: "heavy" }, { label: "Furgão", value: "van" }, { label: "Ligeiro", value: "light" }]} /></label>
                <FormField label="Revisão" value="04" />
              </div>
              <div className="space-y-4">
                {templateItems.map(([name, severity, group]) => (
                  <div key={name} className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_160px_auto] md:items-center">
                    <Input defaultValue={name} />
                    <Select options={[{ label: severity, value: severity }, { label: "Normal", value: "normal" }]} />
                    <Input defaultValue={group} />
                    <Button variant="ghost" size="icon" className="text-red-600">×</Button>
                  </div>
                ))}
                <button className="flex h-16 w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 font-semibold text-slate-500"><FilePlus2 className="h-5 w-5" /> Adicionar item ao template</button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Wrench className="h-5 w-5" /> Parâmetros de manutenção</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <FormField label="Km para manutenção preventiva" value="150000" />
              <FormField label="Aviso antes da manutenção (km)" value="5000" />
              <FormField label="Aviso temporal (dias)" value="30" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Bloquear alocação?</span><Select options={[{ label: "Sim, se crítico", value: "critical" }, { label: "Não", value: "no" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Exigir aprovação técnica?</span><Select options={[{ label: "Sim", value: "yes" }, { label: "Não", value: "no" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Escalar alertas?</span><Select options={[{ label: "Após 24h", value: "24h" }, { label: "Após 48h", value: "48h" }]} /></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Settings2 className="h-5 w-5" /> Preferências gerais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Fuso horário</span><Select options={[{ label: "(UTC+00:00) Lisboa", value: "Europe/Lisbon" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Unidade de medida</span><Select options={[{ label: "Quilómetros (km)", value: "km" }, { label: "Milhas (mi)", value: "mi" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Relatórios semanais</span><Select options={[{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }]} /></label>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo da configuração</h3><div className="mt-6 space-y-4"><Row label="Alertas" value="1 regra" /><Row label="Template" value="5 itens" /><Row label="Itens críticos" value="5" /><Row label="Estado" value="Ativo" /></div></CardContent></Card>
          <Card className="border-orange-200 bg-orange-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-orange-700"><AlertTriangle className="h-5 w-5" /> Impacto operacional</h3><p className="mt-2 text-sm leading-6 text-slate-700">Alterar regras de alerta, checklists ou manutenção pode bloquear alocações futuras e gerar novos alertas.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Controlo</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Control text="Alteração registada em auditoria" /><Control text="Aplicação imediata após guardar" /><Control text="Sincroniza com app dos motoristas" /><Control text="Versão do template incrementada" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Etiquetas</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2"><StatusBadge variant="danger">CRÍTICO</StatusBadge><StatusBadge variant="secondary">EXTERIOR</StatusBadge><StatusBadge variant="secondary">MECÂNICA</StatusBadge><StatusBadge variant="info">PRÉ-VIAGEM</StatusBadge></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between border-b border-white/10 pb-3"><span className="text-slate-300">{label}</span><b>{value}</b></div>;
}

function Control({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">✓</span><b>{text}</b></div>;
}
