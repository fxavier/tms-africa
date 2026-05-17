"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Camera, FilePlus, FolderOpen, Info, MapPin, Save, Trash2, Upload, UserPlus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { api, ApiClientError } from "@/lib/api";
import type { DriverDocumentType } from "@/lib/contracts";

type Option<T extends string = string> = { label: string; value: T };

type DriverDocumentForm = {
  id: string;
  documentType: DriverDocumentType;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingEntity: string;
  category: string;
  notes: string;
  file: File | null;
};

const defaultDriverDocumentOptions: Option<DriverDocumentType>[] = [
  { label: "Carta de condução", value: "CARTA_CONDUCAO" },
  { label: "Bilhete de identidade", value: "BILHETE_IDENTIDADE" },
  { label: "Outro", value: "OUTRO" },
];

function newDocument(documentType: DriverDocumentType = "CARTA_CONDUCAO"): DriverDocumentForm {
  return {
    id: crypto.randomUUID(),
    documentType,
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingEntity: "",
    category: "",
    notes: "",
    file: null,
  };
}

export default function NewDriverPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DriverDocumentForm[]>([
    newDocument("CARTA_CONDUCAO"),
    newDocument("BILHETE_IDENTIDADE"),
  ]);
  const [driverDocumentOptions, setDriverDocumentOptions] = useState<Option<DriverDocumentType>[]>(defaultDriverDocumentOptions);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDocumentTypes() {
      try {
        const documentTypes = await api.catalogItems.list("DRIVER_DOCUMENT");
        if (cancelled) return;
        const activeOptions = documentTypes.filter((item) => item.active).map((item) => ({ label: item.name, value: item.code }));
        if (activeOptions.length > 0) setDriverDocumentOptions(activeOptions);
      } catch {
        if (!cancelled) setError("Nao foi possivel carregar os tipos configurados. Foram usados os valores padrao.");
      }
    }

    void loadDocumentTypes();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateDocument = (id: string, patch: Partial<DriverDocumentForm>) => {
    setDocuments((current) => current.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)));
  };

  const removeDocument = (id: string) => {
    setDocuments((current) => (current.length === 1 ? current : current.filter((doc) => doc.id !== id)));
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const fullName = String(form.get("fullName") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const address = String(form.get("address") ?? "").trim();
    const idNumber = String(form.get("idNumber") ?? "").trim();
    const licenseNumber = String(form.get("licenseNumber") ?? "").trim();
    const licenseCategory = String(form.get("licenseCategory") ?? "").trim();
    const licenseIssueDate = String(form.get("licenseIssueDate") ?? "");
    const licenseExpiryDate = String(form.get("licenseExpiryDate") ?? "");
    const activityLocation = String(form.get("activityLocation") ?? "").trim();
    const notes = String(form.get("notes") ?? "").trim();

    try {
      const driver = await api.drivers.create({
        fullName,
        phone,
        address,
        idNumber,
        licenseNumber,
        licenseCategory,
        licenseIssueDate,
        licenseExpiryDate,
        activityLocation,
        status: "ATIVO",
        notes: notes || undefined,
      });

      for (const document of documents) {
        const hasMetadata = document.documentNumber || document.expiryDate || document.issuingEntity || document.file;
        if (!hasMetadata) continue;
        const uploaded = document.file ? await api.files.upload(document.file) : null;
        await api.drivers.documents.create(driver.id, {
          documentType: document.documentType,
          documentNumber: document.documentNumber || undefined,
          issueDate: document.issueDate || undefined,
          expiryDate: document.expiryDate || undefined,
          issuingEntity: document.issuingEntity || undefined,
          category: document.category || undefined,
          notes: document.notes || undefined,
          status: "VALIDO",
          fileId: uploaded?.fileId,
        });
      }

      router.push("/motoristas");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar o motorista e os documentos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Motoristas &nbsp;&gt;&nbsp; <span className="text-slate-950">Novo Registo</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Registar Novo Motorista</h1><p className="mt-2 text-lg text-slate-500">Insira os dados cadastrais e documentação obrigatória do colaborador.</p></div>
        <div className="flex gap-3"><Button variant="outline" asChild><Link href="/motoristas">Cancelar</Link></Button><Button type="submit" form="driver-form" disabled={saving}><Save className="h-4 w-4" /> {saving ? "A gravar..." : "Gravar Registo"}</Button></div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          <div className="flex items-start gap-3"><AlertCircle className="h-5 w-5" /><div><b>Erro ao guardar</b><p className="text-sm">{error}</p></div></div>
        </div>
      )}

      <form id="driver-form" onSubmit={handleSubmit}>
        <div className="grid gap-7 xl:grid-cols-[330px_1fr]">
          <Card>
            <CardContent className="p-6">
              <div className="relative mx-auto grid h-36 w-36 place-items-center rounded-full border-2 border-dashed border-slate-300 bg-slate-50 text-center text-slate-400">
                <div><UserPlus className="mx-auto h-10 w-10" /><span className="text-xs font-bold uppercase">Foto Perfil</span></div>
                <button type="button" className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-white"><Camera className="h-5 w-5" /></button>
              </div>
              <div className="mt-8"><b>Estado do Registo</b><div className="mt-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"><StatusBadge variant="success">Ativo / Em Preenchimento</StatusBadge></div></div>
              <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-5"><b className="text-sm uppercase">Nota Operacional</b><p className="mt-3 text-sm leading-6 text-slate-700">O motorista só poderá ser alocado a rotas após a validação de todos os documentos profissionais.</p></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><UserPlus className="h-5 w-5" /> Dados Pessoais e Profissionais</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Nome Completo <span className="text-red-500">*</span><Input name="fullName" required placeholder="Ex: Joao Miguel Silva" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Telefone <span className="text-red-500">*</span><Input name="phone" required placeholder="+258 84 000 0000" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Nº Identificação <span className="text-red-500">*</span><Input name="idNumber" required placeholder="BI-123456" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Nº da Carta <span className="text-red-500">*</span><Input name="licenseNumber" required placeholder="LIC-12345678" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Categoria <span className="text-red-500">*</span><Input name="licenseCategory" required placeholder="C+E" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Emissão da Carta <span className="text-red-500">*</span><Input name="licenseIssueDate" required type="date" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900">Validade da Carta <span className="text-red-500">*</span><Input name="licenseExpiryDate" required type="date" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Morada <span className="text-red-500">*</span><Input name="address" required placeholder="Morada completa" /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Localização / Base Operacional <span className="text-red-500">*</span><div className="flex gap-3"><Input name="activityLocation" required placeholder="Ex: Terminal Logístico de Maputo" /><Button type="button" variant="outline" size="icon"><MapPin className="h-5 w-5" /></Button></div></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">Notas<Input name="notes" placeholder="Observações internas" /></label>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-7">
          <CardHeader className="flex-row items-center justify-between border-b border-slate-200"><CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Documentos do Motorista</CardTitle><Button type="button" variant="link" onClick={() => setDocuments((current) => [...current, newDocument(driverDocumentOptions[0]?.value ?? "OUTRO")])}><FilePlus className="h-4 w-4" /> Adicionar Documento</Button></CardHeader>
          <CardContent className="space-y-4 p-6">
            {documents.map((doc) => (
              <div key={doc.id} className="grid gap-4 rounded-xl border border-slate-200 p-4 md:grid-cols-[200px_1fr_160px_220px_44px] md:items-end">
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Tipo de Documento<Select value={doc.documentType} onChange={(event) => updateDocument(doc.id, { documentType: event.target.value as DriverDocumentType })} options={driverDocumentOptions} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Número / ID<Input value={doc.documentNumber} onChange={(event) => updateDocument(doc.id, { documentNumber: event.target.value })} placeholder="Nº Documento" /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Data Validade<Input type="date" value={doc.expiryDate} onChange={(event) => updateDocument(doc.id, { expiryDate: event.target.value })} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  Ficheiro (PDF/IMG)
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => updateDocument(doc.id, { file: event.target.files?.[0] ?? null })} />
                  {doc.file && <span className="block truncate text-[11px] font-semibold normal-case tracking-normal text-blue-600"><Upload className="mr-1 inline h-3 w-3" />{doc.file.name}</span>}
                </label>
                <button type="button" className="text-red-600" onClick={() => removeDocument(doc.id)} aria-label="Remover documento"><Trash2 className="h-5 w-5" /></button>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500 md:col-span-2">Entidade Emissora<Input value={doc.issuingEntity} onChange={(event) => updateDocument(doc.id, { issuingEntity: event.target.value })} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Categoria<Input value={doc.category} onChange={(event) => updateDocument(doc.id, { category: event.target.value })} placeholder="C+E" /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500 md:col-span-2">Notas<Input value={doc.notes} onChange={(event) => updateDocument(doc.id, { notes: event.target.value })} /></label>
              </div>
            ))}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-800"><div className="flex gap-3"><Info className="h-5 w-5" /><div><b>Requisitos de Ficheiro</b><p className="text-sm leading-6">Os documentos devem ser submetidos em formato PDF ou imagem JPG/PNG. O tamanho máximo é definido no backend.</p></div></div></div>
          </CardContent>
        </Card>

        <div className="sticky bottom-6 mt-8 flex items-center justify-between rounded-2xl bg-slate-950 p-5 text-white shadow-panel">
          <div className="flex items-center gap-4"><div className="grid h-12 w-12 place-items-center rounded-full bg-slate-800"><FilePlus className="h-5 w-5" /></div><div><b className="text-lg">Resumo de Validação</b><p className="text-sm text-slate-300">{documents.length} documentos configurados.</p></div></div>
          <Button type="submit" className="bg-blue-100 text-slate-950 hover:bg-blue-200" disabled={saving}>{saving ? "A finalizar..." : "Finalizar Registo"}</Button>
        </div>
      </form>
    </AppShell>
  );
}
