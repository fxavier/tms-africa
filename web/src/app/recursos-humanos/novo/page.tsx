import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, ChevronLeft, CreditCard, FileText, IdCard, Save, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { FormField } from "@/components/tms/FormField";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";

export default function NewEmployeePage() {
  return (
    <AppShell>
      <PageHeader
        title="Novo Colaborador"
        subtitle="Registe dados profissionais, função, vínculo e informação salarial do colaborador."
        actions={<><Button variant="outline" asChild><Link href="/recursos-humanos"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button><Save className="h-4 w-4" /> Guardar colaborador</Button></>}
      />

      <section className="grid gap-8 xl:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><UserPlus className="h-5 w-5" /> Dados pessoais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <FormField label="Nome completo" required value="Ana Cristina Vieira" />
              <FormField label="Nº de funcionário" required value="EMP-2024-0142" />
              <FormField label="Telefone" required value="+351 912 345 678" />
              <FormField label="Email profissional" type="email" value="ana.vieira@logitrack.pt" />
              <FormField label="Nº de identificação" value="12345678 9 ZZ4" />
              <FormField label="NIF" value="245 987 321" />
              <FormField label="Morada" value="Rua da Logística, 24, Lisboa" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Estado</span><Select options={[{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }]} /></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><BriefcaseBusiness className="h-5 w-5" /> Dados profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Função <span className="text-red-500">*</span></span><Select options={[{ label: "Administrativo", value: "administrativo" }, { label: "Motorista Pesados", value: "motorista" }, { label: "Mecânico", value: "mecanico" }, { label: "Gestor de Tráfego", value: "gestor" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Departamento</span><Select options={[{ label: "Operações", value: "operacoes" }, { label: "Manutenção", value: "manutencao" }, { label: "Administração", value: "admin" }]} /></label>
              <FormField label="Data de admissão" type="date" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de vínculo</span><Select options={[{ label: "Contrato sem termo", value: "permanent" }, { label: "Contrato a termo", value: "fixed" }, { label: "Prestador de serviço", value: "contractor" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Associar a motorista?</span><Select options={[{ label: "Não", value: "no" }, { label: "Sim, criar motorista", value: "create-driver" }, { label: "Sim, associar motorista existente", value: "link-driver" }]} /></label>
              <FormField label="Base operacional" value="Terminal Logístico de Alverca" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><CreditCard className="h-5 w-5" /> Informação salarial</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-3">
              <FormField label="Salário base" required value="1.450,00" />
              <FormField label="Subsídio de alimentação" value="9,60" />
              <FormField label="IBAN" value="PT50 0000 0000 0000 0000 0000 0" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Periodicidade</span><Select options={[{ label: "Mensal", value: "monthly" }, { label: "Quinzenal", value: "biweekly" }]} /></label>
              <FormField label="Próximo processamento" type="date" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Retenção</span><Select options={[{ label: "Tabela geral", value: "default" }, { label: "Isento", value: "exempt" }]} /></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><FileText className="h-5 w-5" /> Documentação</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {["Documento de identificação", "Contrato de trabalho", "Comprovativo IBAN", "Ficha de aptidão médica"].map((doc) => <div key={doc} className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5"><b>{doc}</b><p className="mt-2 text-sm text-slate-500">PDF/JPG/PNG até 5MB</p><Button variant="outline" className="mt-4 w-full">Carregar ficheiro</Button></div>)}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Resumo do colaborador</h3><div className="mt-6 flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-xl font-black">AV</span><div><b className="text-lg">Ana Vieira</b><p className="text-sm text-slate-300">Administrativo</p><p className="mt-2"><StatusBadge variant="success">ATIVO</StatusBadge></p></div></div></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><CalendarDays className="h-5 w-5" /> Estado do processo</CardTitle></CardHeader><CardContent className="space-y-3 text-sm"><Step label="Dados pessoais preenchidos" done /><Step label="Função selecionada" done /><Step label="Salário configurado" done /><Step label="Documentos pendentes" /></CardContent></Card>
          <Card className="border-blue-200 bg-blue-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-blue-700"><IdCard className="h-5 w-5" /> Nota de privacidade</h3><p className="mt-2 text-sm leading-6 text-slate-700">Dados pessoais e salariais devem ter acesso restrito e auditado. Exporte apenas quando necessário.</p></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function Step({ label, done }: { label: string; done?: boolean }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className={done ? "grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700" : "grid h-7 w-7 place-items-center rounded-full bg-orange-100 text-orange-700"}>{done ? "✓" : "!"}</span><b>{label}</b></div>;
}
