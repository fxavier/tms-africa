"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { AlertCircle, Calendar, CheckCircle2, FileText, FolderOpen, Plus, Save, Trash2, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { AccessoryType, VehicleDocumentType } from "@/lib/contracts";

type Option<T extends string = string> = { label: string; value: T };

type VehicleDocumentForm = {
  id: string;
  documentType: VehicleDocumentType;
  documentNumber: string;
  issuingEntity: string;
  issueDate: string;
  expiryDate: string;
  notes: string;
  file: File | null;
};

const defaultVehicleDocumentOptions: Option<VehicleDocumentType>[] = [
  { label: "Livrete", value: "LIVRETE" },
  { label: "Inspeção periódica", value: "INSPECAO_PERIODICA" },
  { label: "Seguro", value: "SEGURO" },
  { label: "Licença de circulação", value: "LICENCA_CIRCULACAO" },
  { label: "Manifesto de carga", value: "MANIFESTO_CARGA" },
  { label: "Taxa rádio", value: "TAXA_RADIO" },
];

const defaultAccessoryOptions: Option<AccessoryType>[] = [
  { label: "Macaco", value: "MACACO" },
  { label: "Roda sobressalente", value: "RODA_SOBRESSALENTE" },
  { label: "Triângulo", value: "TRIANGULO" },
  { label: "Extintor", value: "EXTINTOR" },
  { label: "Kit de primeiros socorros", value: "KIT_PRIMEIROS_SOCORROS" },
  { label: "Colete refletor", value: "COLETE_REFLETOR" },
];

function newDocument(documentType: VehicleDocumentType = "LIVRETE"): VehicleDocumentForm {
  return {
    id: crypto.randomUUID(),
    documentType,
    documentNumber: "",
    issuingEntity: "",
    issueDate: "",
    expiryDate: "",
    notes: "",
    file: null,
  };
}

function showDatePicker(input: HTMLInputElement | null) {
  input?.focus();
  input?.showPicker?.();
}

export default function NewVehiclePage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<VehicleDocumentForm[]>([
    newDocument("LIVRETE"),
    newDocument("INSPECAO_PERIODICA"),
  ]);
  const [vehicleDocumentOptions, setVehicleDocumentOptions] = useState<Option<VehicleDocumentType>[]>(defaultVehicleDocumentOptions);
  const [accessoryOptions, setAccessoryOptions] = useState<Option<AccessoryType>[]>(defaultAccessoryOptions);
  const [accessories, setAccessories] = useState<Set<AccessoryType>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCatalogs() {
      try {
        const [documentTypes, accessoryTypes] = await Promise.all([
          api.catalogItems.list("VEHICLE_DOCUMENT"),
          api.catalogItems.list("ACCESSORY"),
        ]);
        if (cancelled) return;
        const activeDocumentOptions = documentTypes.filter((item) => item.active).map((item) => ({ label: item.name, value: item.code }));
        const activeAccessoryOptions = accessoryTypes.filter((item) => item.active).map((item) => ({ label: item.name, value: item.code }));
        if (activeDocumentOptions.length > 0) setVehicleDocumentOptions(activeDocumentOptions);
        if (activeAccessoryOptions.length > 0) setAccessoryOptions(activeAccessoryOptions);
      } catch {
        if (!cancelled) setError("Nao foi possivel carregar os tipos configurados. Foram usados os valores padrao.");
      }
    }

    void loadCatalogs();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateDocument = (id: string, patch: Partial<VehicleDocumentForm>) => {
    setDocuments((current) => current.map((doc) => (doc.id === id ? { ...doc, ...patch } : doc)));
  };

  const removeDocument = (id: string) => {
    setDocuments((current) => (current.length === 1 ? current : current.filter((doc) => doc.id !== id)));
  };

  const toggleAccessory = (value: AccessoryType) => {
    setAccessories((current) => {
      const next = new Set(current);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const plate = String(form.get("plate") ?? "").trim();
    const brand = String(form.get("brand") ?? "").trim();
    const model = String(form.get("model") ?? "").trim();
    const vehicleType = String(form.get("vehicleType") ?? "").trim();
    const capacity = Number(form.get("capacity") ?? 0);
    const activityLocation = String(form.get("activityLocation") ?? "").trim();
    const activityStartDate = String(form.get("activityStartDate") ?? "");
    const notes = String(form.get("notes") ?? "").trim();

    try {
      const vehicle = await api.vehicles.create({
        plate,
        brand,
        model,
        vehicleType,
        capacity,
        activityLocation,
        activityStartDate,
        notes: notes || undefined,
        accessories: Array.from(accessories).map((accessoryType) => ({ accessoryType, status: "PRESENTE" })),
      });

      for (const document of documents) {
        const hasMetadata = document.documentNumber || document.expiryDate || document.issuingEntity || document.file;
        if (!hasMetadata) continue;
        const uploaded = document.file ? await api.files.upload(document.file) : null;
        await api.vehicles.documents.create(vehicle.id, {
          documentType: document.documentType,
          documentNumber: document.documentNumber || undefined,
          issuingEntity: document.issuingEntity || undefined,
          issueDate: document.issueDate || undefined,
          expiryDate: document.expiryDate || undefined,
          notes: document.notes || undefined,
          status: "VALIDO",
          fileId: uploaded?.fileId,
        });
      }

      setSuccess("Viatura e documentos guardados com sucesso.");
      router.push("/viaturas");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar a viatura e os documentos.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <div className="mb-3 text-sm font-medium text-slate-500">Viaturas &nbsp;&gt;&nbsp; <span className="text-slate-950">Nova Viatura</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">Registo de Nova Viatura</h1>
          <p className="mt-2 max-w-3xl text-lg text-slate-500">Complete os dados técnicos e a documentação obrigatória para integrar a unidade na frota ativa.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href="/viaturas">Cancelar</Link></Button>
          <Button type="submit" form="vehicle-form" disabled={saving}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar Viatura"}</Button>
        </div>
      </div>

      {success && (
        <div className="mb-6 rounded-xl bg-green-600 px-6 py-4 text-white shadow-panel">
          <div className="flex items-start gap-3"><CheckCircle2 className="h-5 w-5" /><div><b>Viatura Criada</b><p className="text-sm text-green-100">{success}</p></div></div>
        </div>
      )}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">
          <div className="flex items-start gap-3"><AlertCircle className="h-5 w-5" /><div><b>Erro ao guardar</b><p className="text-sm">{error}</p></div></div>
        </div>
      )}

      <form id="vehicle-form" onSubmit={handleSubmit} className="mx-auto max-w-5xl space-y-7">
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Dados Cadastrais</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            <label className="space-y-2 text-sm font-semibold text-slate-900">Matrícula <span className="text-red-500">*</span><Input name="plate" required placeholder="AA-00-BB" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Marca <span className="text-red-500">*</span><Input name="brand" required placeholder="Mercedes-Benz" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Modelo <span className="text-red-500">*</span><Input name="model" required placeholder="Sprinter" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo de Viatura <span className="text-red-500">*</span><Input name="vehicleType" required placeholder="FURGAO" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Capacidade de Carga (kg) <span className="text-red-500">*</span><Input name="capacity" required type="number" min={1} placeholder="24000" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Centro Logístico / Local <span className="text-red-500">*</span><Input name="activityLocation" required placeholder="Maputo" /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">
              Data de início <span className="text-red-500">*</span>
              <Input name="activityStartDate" required type="date" className="block" />
            </label>
            <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2">
              Notas
              <Input name="notes" placeholder="Observações internas" className="block" />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between border-b border-slate-200">
            <CardTitle className="flex items-center gap-2"><FolderOpen className="h-5 w-5" /> Documentação da Frota</CardTitle>
            <Button type="button" variant="link" onClick={() => setDocuments((current) => [...current, newDocument(vehicleDocumentOptions[0]?.value ?? "SEGURO")])}><Plus className="h-4 w-4" /> Adicionar Documento</Button>
          </CardHeader>
          <CardContent className="space-y-5 p-6">
            {documents.map((doc) => (
              <div key={doc.id} className="grid gap-4 rounded-xl border border-dashed border-slate-300 p-4 md:grid-cols-[170px_150px_150px_140px_1fr_32px]">
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Tipo de Documento<Select value={doc.documentType} onChange={(event) => updateDocument(doc.id, { documentType: event.target.value as VehicleDocumentType })} options={vehicleDocumentOptions} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Nº / Apólice<Input value={doc.documentNumber} onChange={(event) => updateDocument(doc.id, { documentNumber: event.target.value })} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">Entidade Emissora<Input value={doc.issuingEntity} onChange={(event) => updateDocument(doc.id, { issuingEntity: event.target.value })} /></label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  Data Validade
                  <div className="relative">
                    <Input
                      id={`vehicle-document-expiry-${doc.id}`}
                      type="date"
                      value={doc.expiryDate}
                      onClick={(event) => showDatePicker(event.currentTarget)}
                      onChange={(event) => updateDocument(doc.id, { expiryDate: event.target.value })}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
                      onClick={() => showDatePicker(document.getElementById(`vehicle-document-expiry-${doc.id}`) as HTMLInputElement | null)}
                      aria-label="Abrir calendário da data de validade"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  </div>
                </label>
                <label className="space-y-2 text-xs font-black uppercase tracking-wide text-slate-500">
                  Ficheiro (PDF/JPG/PNG)
                  <Input type="file" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png" onChange={(event) => updateDocument(doc.id, { file: event.target.files?.[0] ?? null })} />
                  {doc.file && <span className="block truncate text-[11px] font-semibold normal-case tracking-normal text-blue-600"><Upload className="mr-1 inline h-3 w-3" />{doc.file.name}</span>}
                </label>
                <button type="button" className="self-end text-slate-500" onClick={() => removeDocument(doc.id)} aria-label="Remover documento"><Trash2 className="h-5 w-5" /></button>
              </div>
            ))}
            <div className="grid min-h-[150px] place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
              <div><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-slate-200"><Plus className="h-5 w-5" /></div><b className="mt-4 block">Pretende adicionar mais documentos?</b><p className="text-sm text-slate-500">Pode anexar DUA, certificados, licenças e apólices.</p><Button type="button" variant="outline" className="mt-4" onClick={() => setDocuments((current) => [...current, newDocument(vehicleDocumentOptions[0]?.value ?? "SEGURO")])}>Anexar Novo Documento</Button></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle>Acessórios</CardTitle></CardHeader>
          <CardContent className="grid gap-5 p-6 md:grid-cols-3">
            {accessoryOptions.map((item) => (
              <label key={item.value} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={accessories.has(item.value)} onChange={() => toggleAccessory(item.value)} className="h-4 w-4 rounded border-slate-300" />{item.label}</label>
            ))}
          </CardContent>
        </Card>

        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 text-blue-700"><b>Aviso de Conformidade:</b><p className="mt-2 text-sm leading-6">Após guardar a viatura, o sistema valida as datas de validade dos documentos inseridos.</p></div>
      </form>
    </AppShell>
  );
}
