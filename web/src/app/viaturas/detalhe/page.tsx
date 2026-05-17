"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, Eye, FileText, MapPin, Pencil, Plus, ShieldCheck, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import type { VehicleConsolidatedDto } from "@/lib/contracts";
import { humanizeEnum, statusVariant } from "@/types/status";

type DetailTab = "resumo" | "documentos" | "acessorios" | "manutencoes" | "checklists";

const detailTabs: { id: DetailTab; label: string }[] = [
  { id: "resumo", label: "Resumo" },
  { id: "documentos", label: "Documentos" },
  { id: "acessorios", label: "Acessórios" },
  { id: "manutencoes", label: "Manutenções" },
  { id: "checklists", label: "Checklists" },
];

export default function VehicleDetailPage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("id");
  const [data, setData] = useState<VehicleConsolidatedDto | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("resumo");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicle() {
      if (!vehicleId) {
        setError("Identificador da viatura em falta.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await api.vehicles.consolidated(vehicleId);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar os detalhes da viatura.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadVehicle();

    return () => {
      cancelled = true;
    };
  }, [vehicleId]);

  const expiringDocuments = useMemo(() => {
    const now = new Date();
    const inThirtyDays = new Date(now);
    inThirtyDays.setDate(now.getDate() + 30);
    return data?.documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(`${doc.expiryDate}T00:00:00`);
      return expiry >= now && expiry <= inThirtyDays;
    }).length ?? 0;
  }, [data]);

  if (loading) {
    return <AppShell><LoadingState label="A carregar detalhes da viatura..." /></AppShell>;
  }

  if (error || !data) {
    return <AppShell><ErrorState message={error ?? "Viatura nao encontrada."} /></AppShell>;
  }

  const { vehicle, documents, accessories, maintenanceRecords, activeActivities } = data;
  const latestMaintenance = maintenanceRecords[0];

  return (
    <AppShell>
      <div className="mb-4 text-sm font-medium text-slate-500">Viaturas &nbsp;&gt;&nbsp; <span className="text-slate-950">Detalhes da Viatura</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-950">{vehicle.plate}</h1>
            <StatusBadge variant={statusVariant(vehicle.status)}>{humanizeEnum(vehicle.status)}</StatusBadge>
          </div>
          <p className="mt-3 flex items-center gap-2 text-lg text-slate-500"><MapPin className="h-5 w-5" /> {vehicle.activityLocation}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href={`/viaturas/editar?id=${vehicle.id}`}><Pencil className="h-4 w-4" /> Editar Viatura</Link></Button>
          <Button asChild><Link href="/atividades/nova"><Plus className="h-4 w-4" /> Novo Serviço</Link></Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><ShieldCheck className="h-10 w-10 rounded-xl bg-slate-100 p-2" /><span className="text-xs font-bold uppercase text-slate-500">Estado operacional</span></div><div className="mt-8 text-3xl font-black">{humanizeEnum(vehicle.status)}</div><p className="text-sm text-slate-500">{activeActivities.length} atividade(s) ativa(s)</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><FileText className="h-10 w-10 rounded-xl bg-orange-100 p-2 text-orange-600" /><span className="text-xs font-bold uppercase text-slate-500">Documentos a expirar</span></div><div className="mt-8 text-3xl font-black text-orange-600">{String(expiringDocuments).padStart(2, "0")}</div><p className="text-sm text-slate-500">{documents.length} documento(s) registado(s)</p><Link href="#docs" className="mt-4 block text-sm font-bold underline">Ver documentos</Link></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><Calendar className="h-10 w-10 rounded-xl bg-blue-100 p-2 text-blue-600" /><span className="text-xs font-bold uppercase text-slate-500">Próxima manutenção</span></div><div className="mt-8 text-3xl font-black">{latestMaintenance?.nextMaintenanceDate ? formatDate(latestMaintenance.nextMaintenanceDate) : "-"}</div><p className="text-sm text-slate-500">{latestMaintenance?.nextMaintenanceMileage ? `${latestMaintenance.nextMaintenanceMileage} km` : "Sem manutenção futura registada"}</p><StatusBadge variant="secondary">Registos: {maintenanceRecords.length}</StatusBadge></CardContent></Card>
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="flex gap-3 overflow-x-auto border-b border-slate-200 px-6 text-sm font-medium text-slate-500">
          {detailTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "border-b-2 border-slate-950 py-5 text-slate-950" : "py-5 hover:text-slate-950"}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CardContent className="p-6">
          {activeTab === "resumo" && (
            <div className="grid gap-10 lg:grid-cols-[1fr_430px]">
              <section>
                <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Dados Cadastrais</h3>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <Detail label="Marca / Modelo" value={`${vehicle.brand} ${vehicle.model}`} />
                  <Detail label="Tipo" value={vehicle.vehicleType} />
                  <Detail label="Capacidade" value={`${vehicle.capacity} kg`} />
                  <Detail label="Data de início" value={formatDate(vehicle.activityStartDate)} />
                  <Detail label="Localização" value={vehicle.activityLocation} />
                  <Detail label="Notas" value={vehicle.notes ?? "-"} />
                </div>
              </section>
              <section>
                <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Operação Atual</h3>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-100 p-5">
                  <b>{vehicle.currentDriverId ? "Motorista atribuído" : "Sem motorista atribuído"}</b>
                  <p className="mt-2 text-sm text-slate-500">{vehicle.currentDriverId ?? "Nenhuma atribuição ativa encontrada para esta viatura."}</p>
                </div>
                <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><div className="text-xs font-bold uppercase text-slate-500">Atividades Ativas</div><b>{activeActivities.length}</b><p className="text-sm text-slate-400">{activeActivities[0]?.title ?? "Sem atividade ativa."}</p></div>
              </section>
            </div>
          )}

          {activeTab === "documentos" && (
            <section id="docs">
              <div className="mb-5 flex items-center justify-between"><h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Documentação de Frota</h3><Button variant="link"><Upload className="h-4 w-4" /> Carregar Novo</Button></div>
              <Table>
                <TableHeader><TableRow><TableHead>Tipo de Documento</TableHead><TableHead>Número/Apólice</TableHead><TableHead>Entidade</TableHead><TableHead>Data Expiração</TableHead><TableHead>Estado</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
                <TableBody>
                  {documents.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-slate-500">Sem documentos registados.</TableCell></TableRow>
                  ) : documents.map((doc) => (
                    <TableRow key={doc.id ?? `${doc.documentType}-${doc.documentNumber}`}>
                      <TableCell>{humanizeEnum(doc.documentType)}</TableCell>
                      <TableCell className="text-slate-500">{doc.documentNumber ?? "-"}</TableCell>
                      <TableCell className="text-slate-500">{doc.issuingEntity ?? "-"}</TableCell>
                      <TableCell>{doc.expiryDate ? formatDate(doc.expiryDate) : "-"}</TableCell>
                      <TableCell><StatusBadge variant={statusVariant(doc.status)}>{humanizeEnum(doc.status)}</StatusBadge></TableCell>
                      <TableCell><div className="flex gap-3"><Eye className="h-5 w-5" />{doc.fileId && <button type="button" onClick={() => void api.files.download(doc.fileId!, doc.documentNumber ?? doc.documentType)} aria-label="Descarregar documento"><Download className="h-5 w-5" /></button>}</div></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          {activeTab === "acessorios" && (
            <section>
              <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Checklist de Acessórios Obrigatórios</h3>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {accessories.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">Sem acessórios registados.</div>
                ) : accessories.map((accessory) => (
                  <div key={accessory.id} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><StatusBadge variant={statusVariant(accessory.status)}>{humanizeEnum(accessory.status)}</StatusBadge><div><b className="text-sm">{humanizeEnum(accessory.accessoryType)}</b><p className="text-xs text-slate-500">{accessory.notes ?? "Sem notas"}</p></div></div></div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "manutencoes" && (
            <section>
              <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Manutenções</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Data</TableHead><TableHead>Km</TableHead><TableHead>Fornecedor</TableHead><TableHead>Custo</TableHead><TableHead>Próxima</TableHead></TableRow></TableHeader>
                <TableBody>
                  {maintenanceRecords.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-slate-500">Sem manutenções registadas.</TableCell></TableRow>
                  ) : maintenanceRecords.map((item) => (
                    <TableRow key={item.id ?? item.performedAt}>
                      <TableCell>{humanizeEnum(item.maintenanceType)}</TableCell>
                      <TableCell>{formatDate(item.performedAt)}</TableCell>
                      <TableCell>{item.mileageAtService ? `${item.mileageAtService} km` : "-"}</TableCell>
                      <TableCell>{item.supplier ?? "-"}</TableCell>
                      <TableCell>{item.totalCost ?? "-"}</TableCell>
                      <TableCell>{item.nextMaintenanceDate ? formatDate(item.nextMaintenanceDate) : item.nextMaintenanceMileage ? `${item.nextMaintenanceMileage} km` : "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}

          {activeTab === "checklists" && (
            <section>
              <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Checklists</h3>
              <Table>
                <TableHeader><TableRow><TableHead>Data</TableHead><TableHead>Executado por</TableHead><TableHead>Resultado</TableHead><TableHead>Notas</TableHead></TableRow></TableHeader>
                <TableBody>
                  {data.checklists.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-slate-500">Sem checklists registadas.</TableCell></TableRow>
                  ) : data.checklists.map((checklist) => (
                    <TableRow key={checklist.id ?? checklist.performedAt}>
                      <TableCell>{checklist.performedAt ? new Date(checklist.performedAt).toLocaleString("pt-PT") : "-"}</TableCell>
                      <TableCell>{checklist.performedBy ?? "-"}</TableCell>
                      <TableCell><StatusBadge variant={checklist.criticalFailures ? "danger" : "success"}>{checklist.criticalFailures ? "Com falhas críticas" : "Sem falhas críticas"}</StatusBadge></TableCell>
                      <TableCell>{checklist.notes ?? `${checklist.items.length} item(ns)`}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </section>
          )}
        </CardContent>
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden"><CardHeader className="flex-row items-center justify-between"><CardTitle>Última Localização GPS</CardTitle><span className="text-sm text-slate-500">Local cadastrado</span></CardHeader><div className="relative h-[270px] fake-map"><div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-soft"><div><b>{vehicle.activityLocation}</b><p className="text-sm text-slate-500">Local operacional atual da viatura</p></div><Button size="sm">Abrir no Google Maps</Button></div></div></Card>
        <Card><CardHeader><CardTitle>Manutenções</CardTitle></CardHeader><CardContent className="space-y-4">{maintenanceRecords.length === 0 ? <p className="text-sm text-slate-500">Sem manutenções registadas.</p> : maintenanceRecords.slice(0, 3).map((item) => <div key={item.id ?? item.performedAt} className="rounded-xl bg-slate-50 p-4 text-sm"><b>{formatDate(item.performedAt)} · {humanizeEnum(item.maintenanceType)}</b><p className="mt-2 text-slate-600">{item.description ?? item.supplier ?? "-"}</p></div>)}</CardContent></Card>
      </section>
    </AppShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-semibold">{value}</div></div>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-PT");
}
