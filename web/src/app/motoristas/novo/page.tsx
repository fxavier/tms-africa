import Link from "next/link";
import { Camera, FilePlus, FolderOpen, Info, MapPin, Save, Trash2, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { FormField } from "@/components/tms/FormField";
import { StatusBadge } from "@/components/tms/StatusBadge";

export default function NewDriverPage() {
  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Motoristas &nbsp;&gt;&nbsp; <span className="text-slate-950">Novo Registo</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Registar Novo Motorista</h1><p className="mt-2 text-lg text-slate-500">Insira os dados cadastrais e documentação obrigatória do colaborador.</p></div>
        <div className="flex gap-3"><Button variant="outline" asChild><Link href="/motoristas">Cancelar</Link></Button><Button><Save className="h-4 w-4" /> Gravar Registo</Button></div>
      </div>

      <div className="grid gap-7 xl:grid-cols-[330px_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="mx-auto grid h-36 w-36 place-items-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-center text-slate-400">
              <div><UserPlus className="mx-auto h-10 w-10" /><span className="text-xs font-bold uppercase">Foto Perfil</span></div>
              <button className="absolute mt-24 ml-24 grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white"><Camera className="h-5 w-5" /></button>
            </div>
            <div className="mt-8"><b>Estado do Registo</b><div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"><StatusBadge variant="success">Ativo / Em Preenchimento</StatusBadge></div></div>
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5"><b className="text-sm uppercase">Nota Operacional</b><p className="mt-3 text-sm leading-6 text-slate-700">O motorista só poderá ser alocado a rotas após a validação de todos os documentos profissionais.</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Dados Pessoais e Profissionais</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 md:grid-cols-2">
            <div className="md:col-span-2"><FormField label="Nome Completo" required placeholder="Ex: João Miguel Silva" /></div>
            <FormField label="Telefone Contacto" required placeholder="+351 912 345 678" />
            <FormField label="E-mail Profissional" placeholder="motorista@empresa.pt" />
            <FormField label="Nº da Carta de Condução" required placeholder="Ex: PT-12345678" />
            <label className="space-y-2 text-sm font-semibold text-slate-900">Categorias <span className="text-red-500">*</span><Select options={[{ label: "Selecionar...", value: "" }, { label: "C", value: "c" }, { label: "C + E", value: "ce" }]} /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Localização / Base Operacional<div className="flex gap-3"><Input placeholder="Ex: Terminal Logístico de Alverca" /><Button variant="outline" size="icon"><MapPin className="h-5 w-5" /></Button></div></label>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-7">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-200"><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Documentos do Motorista</CardTitle><Button variant="link"><FilePlus className="h-4 w-4" /> Adicionar Documento</Button></CardHeader>
        <CardContent className="p-6">
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500 grid grid-cols-[220px_1fr_180px_220px_60px] gap-4"><span>Tipo de Documento</span><span>Número / ID</span><span>Data Validade</span><span>Ficheiro (PDF/IMG)</span><span>Ações</span></div>
          {[
            ["Carta de Condução", "", "", "Carregar ficheiro"],
            ["Certificação CAM", "CAM-9921-PT", "2026-10-15", "cam_validacao.pdf"],
          ].map(([type, number, date, file], index) => (
            <div key={type} className="grid grid-cols-[220px_1fr_180px_220px_60px] gap-4 border-b border-slate-200 py-4 items-center">
              <Select options={[{ label: type, value: type }]} />
              <Input placeholder="Nº Documento" defaultValue={number} />
              <Input type="date" defaultValue={date} />
              <Button variant="outline" className="justify-start">{index === 0 ? <FilePlus className="h-4 w-4" /> : <FilePlus className="h-4 w-4 text-blue-600" />} {file}</Button>
              <button className="text-red-600"><Trash2 className="h-5 w-5" /></button>
            </div>
          ))}
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800"><div className="flex gap-3"><Info className="h-5 w-5" /><div><b>Requisitos de Ficheiro</b><p className="text-sm leading-6">Os documentos devem ser submetidos em formato PDF ou imagem (JPG/PNG). O tamanho máximo por ficheiro é de 5MB.</p></div></div></div>
        </CardContent>
      </Card>

      <div className="sticky bottom-6 mt-8 flex items-center justify-between rounded-2xl bg-slate-950 p-5 text-white shadow-panel">
        <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800"><FilePlus className="h-5 w-5" /></div><div><b className="text-lg">Resumo de Validação</b><p className="text-sm text-slate-300">2 de 4 documentos obrigatórios já configurados.</p></div></div>
        <div className="flex gap-3"><Button variant="outline" className="bg-white text-slate-950">Gravar Rascunho</Button><Button className="bg-blue-100 text-slate-950 hover:bg-blue-200">Finalizar Registo</Button></div>
      </div>
    </AppShell>
  );
}
