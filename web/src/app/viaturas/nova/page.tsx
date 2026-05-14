import Link from "next/link";
import { CheckCircle2, FileText, FolderOpen, Plus, Save, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/tms/FormField";

export default function NewVehiclePage() {
  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Viaturas &nbsp;&gt;&nbsp; <span className="text-slate-950">Nova Viatura</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Registo de Nova Viatura</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">Complete os dados técnicos e a documentação obrigatória para integrar a unidade na frota ativa.</p>
        </div>
        <div className="flex gap-3"><Button variant="outline" asChild><Link href="/viaturas">Cancelar</Link></Button><Button><Save className="h-4 w-4" /> Guardar Viatura</Button></div>
      </div>

      <div className="fixed right-8 top-24 z-30 hidden rounded-xl bg-green-600 px-6 py-4 text-white shadow-panel xl:block">
        <div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5" /><div><b>Viatura Criada</b><p className="text-sm text-green-100">Os dados foram submetidos com sucesso.</p></div></div>
      </div>

      <div className="mx-auto max-w-5xl space-y-7">
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Dados Cadastrais</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            <FormField label="Matrícula" required placeholder="AAA-000-MP" />
            <label className="space-y-2 text-sm font-semibold text-slate-900">Marca <span className="text-red-500">*</span><Select options={[{ label: "Selecionar Marca", value: "" }, { label: "Mercedes-Benz", value: "mercedes" }, { label: "Scania", value: "scania" }]} /></label>
            <FormField label="Modelo" required placeholder="Ex: R450 Streamline" />
            <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo de Viatura<Select options={[{ label: "Pesado Articulado", value: "heavy" }, { label: "Furgão", value: "van" }, { label: "Ligeiro", value: "light" }]} /></label>
            <FormField label="Capacidade de Carga (kg)" placeholder="24000" />
            <FormField label="Centro Logístico / Local" placeholder="Lisboa - Terminal Sul" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between border-b border-slate-200"><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Documentação da Frota</CardTitle><Button variant="link"><Plus className="h-4 w-4" /> Adicionar Documento</Button></CardHeader>
          <CardContent className="space-y-5 p-6">
            {["Livrete", "Inspeção"].map((doc, index) => (
              <div key={doc} className="grid gap-4 rounded-xl border border-dashed border-slate-300 p-4 md:grid-cols-[150px_160px_160px_150px_1fr_32px]">
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Tipo de Documento<Select options={[{ label: doc, value: doc }, { label: "Seguro", value: "insurance" }]} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Nº / Apólice<Input defaultValue={index === 0 ? "882736412" : "IPO-2024-X1"} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Entidade Emissora<Input defaultValue={index === 0 ? "Fidelidade" : "Controlauto"} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Data Validade<Input type="date" /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Ficheiro (PDF/JPG)<Button variant="outline" className="h-11 w-full"><Upload className="h-4 w-4" /> Upload ficheiro</Button></label>
                <button className="self-end text-slate-500"><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
            <div className="grid min-h-[170px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-200"><Plus className="h-5 w-5" /></div><b className="mt-4 block">Pretende adicionar mais documentos?</b><p className="text-sm text-slate-500">Pode anexar DUA, Certificados ATP, Licenças de Transporte, entre outros.</p><Button variant="outline" className="mt-4">Anexar Novo Documento</Button></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle>Acessórios</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            {["Macaco", "Roda sobressalente", "Triângulo", "Extintor", "Kit de primeiros socorros", "Colete refletor"].map((item) => (
              <label key={item} className="flex items-center gap-3 text-sm"><input type="checkbox" className="h-4 w-4 rounded border-slate-300" />{item}</label>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700"><b>Aviso de Conformidade:</b><p className="mt-2 text-sm leading-6">Após guardar a viatura, o sistema irá validar automaticamente as datas de validade dos documentos inseridos. Viaturas com documentos expirados serão marcadas como “Não Operacionais”.</p></div>
      </div>
    </AppShell>
  );
}
