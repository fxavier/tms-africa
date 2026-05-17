"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, Check, ChevronLeft, ClipboardCheck, Truck, X } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import type { ChecklistInspectionDto, ChecklistTemplateDto, VehicleResponseDto } from "@/lib/contracts";

export default function ChecklistDetailPage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId");
  const checklistId = searchParams.get("id");
  const [vehicle, setVehicle] = useState<VehicleResponseDto | null>(null);
  const [checklist, setChecklist] = useState<ChecklistInspectionDto | null>(null);
  const [template, setTemplate] = useState<ChecklistTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChecklist() {
      if (!vehicleId || !checklistId) {
        setError("Identificador da checklist em falta.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [vehicleData, checklistData, templates] = await Promise.all([
          api.vehicles.get(vehicleId),
          api.vehicles.checklists.get(vehicleId, checklistId),
          api.checklistTemplates.list(),
        ]);
        if (cancelled) return;
        setVehicle(vehicleData);
        setChecklist(checklistData);
        setTemplate(templates.find((item) => item.id === checklistData.templateId) ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar a checklist.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadChecklist();

    return () => {
      cancelled = true;
    };
  }, [vehicleId, checklistId]);

  if (loading) return <AppShell><LoadingState label="A carregar checklist..." /></AppShell>;
  if (error || !vehicle || !checklist) return <AppShell><ErrorState message={error ?? "Checklist nao encontrada."} /></AppShell>;

  const failures = checklist.items.filter((item) => item.status !== "OK").length;
  const criticalFailures = checklist.items.filter((item) => item.critical && item.status !== "OK").length;

  return (
    <AppShell>
      <PageHeader
        title="Detalhes da Checklist"
        subtitle={`${vehicle.plate} · ${template?.name ?? "Template"} · ${checklist.performedAt ? new Date(checklist.performedAt).toLocaleString("pt-PT") : "-"}`}
        actions={<Button variant="outline" asChild><Link href="/checklists"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>}
      />

      <section className="grid gap-6 md:grid-cols-3">
        <Card><CardContent className="p-6"><Truck className="mb-5 h-10 w-10 rounded-xl bg-slate-100 p-2" /><p className="text-sm font-bold uppercase tracking-widest text-slate-500">Viatura</p><div className="mt-2 text-2xl font-black">{vehicle.plate}</div><p className="text-sm text-slate-500">{vehicle.brand} {vehicle.model}</p></CardContent></Card>
        <Card><CardContent className="p-6"><ClipboardCheck className="mb-5 h-10 w-10 rounded-xl bg-blue-100 p-2 text-blue-600" /><p className="text-sm font-bold uppercase tracking-widest text-slate-500">Resultado</p><div className="mt-2"><StatusBadge variant={checklist.criticalFailures ? "danger" : "success"}>{checklist.criticalFailures ? "Falha crítica" : "Aprovado"}</StatusBadge></div><p className="mt-2 text-sm text-slate-500">{failures} falha(s)</p></CardContent></Card>
        <Card><CardContent className="p-6"><AlertTriangle className="mb-5 h-10 w-10 rounded-xl bg-orange-100 p-2 text-orange-600" /><p className="text-sm font-bold uppercase tracking-widest text-slate-500">Críticas</p><div className="mt-2 text-2xl font-black">{criticalFailures}</div><p className="text-sm text-slate-500">Itens críticos com falha</p></CardContent></Card>
      </section>

      <Card className="mt-8 overflow-hidden">
        <CardHeader><CardTitle>Itens verificados</CardTitle></CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Item</TableHead><TableHead>Crítico</TableHead><TableHead>Estado</TableHead><TableHead>Notas</TableHead></TableRow></TableHeader>
          <TableBody>
            {checklist.items.map((item) => (
              <TableRow key={`${item.templateItemId ?? item.itemName}`}>
                <TableCell className="font-semibold">{item.itemName}</TableCell>
                <TableCell>{item.critical ? "Sim" : "Não"}</TableCell>
                <TableCell><StatusBadge variant={item.status === "OK" ? "success" : item.status === "AVARIA" ? "warning" : "danger"}>{statusIcon(item.status)} {item.status}</StatusBadge></TableCell>
                <TableCell>{item.notes ?? "-"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
        <CardContent><p className="text-sm leading-7 text-slate-600">{checklist.notes ?? "Sem observações."}</p></CardContent>
      </Card>
    </AppShell>
  );
}

function statusIcon(status: string) {
  if (status === "OK") return <Check className="inline h-3 w-3" />;
  if (status === "AVARIA") return <AlertTriangle className="inline h-3 w-3" />;
  return <X className="inline h-3 w-3" />;
}
