"use client";

import Link from "next/link";
import { CheckSquare, ClipboardCheck, Eye, Plus, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Pagination } from "@/components/tms/Pagination";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import type { ChecklistInspectionDto, ChecklistTemplateDto, VehicleResponseDto } from "@/lib/contracts";

type ChecklistRow = ChecklistInspectionDto & {
  vehicle: VehicleResponseDto;
};

export default function ChecklistsPage() {
  const [rows, setRows] = useState<ChecklistRow[]>([]);
  const [templates, setTemplates] = useState<ChecklistTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChecklists() {
      setLoading(true);
      setError(null);
      try {
        const [vehicles, templateRows] = await Promise.all([
          api.vehicles.list({ size: 100 }),
          api.checklistTemplates.list(),
        ]);
        const checklistPages = await Promise.all(
          vehicles.content.map(async (vehicle) => {
            const result = await api.vehicles.checklists.list(vehicle.id, { size: 100 }).catch(() => null);
            return (result?.content ?? []).map((checklist) => ({ ...checklist, vehicle }));
          }),
        );
        if (cancelled) return;
        setTemplates(templateRows);
        setRows(checklistPages.flat().sort((a, b) => new Date(b.performedAt ?? 0).getTime() - new Date(a.performedAt ?? 0).getTime()));
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar checklists.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadChecklists();

    return () => {
      cancelled = true;
    };
  }, []);

  const submittedToday = rows.filter((row) => isToday(row.performedAt)).length;
  const criticalFailures = rows.filter((row) => row.criticalFailures).length;
  const totalFailures = useMemo(() => rows.reduce((sum, row) => sum + row.items.filter((item) => item.status !== "OK").length, 0), [rows]);
  const templateById = new Map(templates.map((template) => [template.id, template]));
  const criticalTemplateItems = templates.flatMap((template) => template.items.filter((item) => item.critical).map((item) => item.itemName));

  return (
    <AppShell>
      <PageHeader title="Checklists" subtitle="Submeter e consultar checklists operacionais das viaturas e atividades." actions={<Button asChild><Link href="/checklists/nova"><Plus className="h-4 w-4" /> Nova checklist</Link></Button>} />

      {error && <div className="mb-6"><ErrorState message={error} /></div>}
      {loading && <div className="mb-6"><LoadingState label="A carregar checklists..." /></div>}

      <section className="grid gap-6 md:grid-cols-3">
        <StatCard label="Submetidas Hoje" value={String(submittedToday)} hint="Dados reais" icon={CheckSquare} variant="success" />
        <StatCard label="Falhas" value={String(totalFailures)} hint="Itens com avaria/falta" icon={ClipboardCheck} variant="warning" />
        <StatCard label="Falhas Críticas" value={String(criticalFailures)} hint="Bloqueiam atividade" icon={XCircle} variant="danger" />
      </section>

      <Card className="mt-8 overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Viatura</TableHead><TableHead>Atividade</TableHead><TableHead>Template</TableHead><TableHead>Submetido por</TableHead><TableHead>Data</TableHead><TableHead>Resultado</TableHead><TableHead>Falhas</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-slate-500">Sem checklists submetidas.</TableCell></TableRow>
            ) : rows.map((row) => {
              const failures = row.items.filter((item) => item.status !== "OK").length;
              const template = row.templateId ? templateById.get(row.templateId) : undefined;
              return (
                <TableRow key={`${row.vehicle.id}-${row.id ?? row.performedAt}`}>
                  <TableCell><div><b>{row.vehicle.plate}</b><p className="text-xs text-slate-500">{row.vehicle.brand} {row.vehicle.model}</p></div></TableCell>
                  <TableCell>{row.activityId ?? "-"}</TableCell>
                  <TableCell>{template?.name ?? row.templateId ?? "-"}</TableCell>
                  <TableCell>{row.performedBy ?? "-"}</TableCell>
                  <TableCell>{row.performedAt ? new Date(row.performedAt).toLocaleString("pt-PT") : "-"}</TableCell>
                  <TableCell><StatusBadge variant={row.criticalFailures ? "danger" : "success"}>{row.criticalFailures ? "Falha crítica" : "Aprovado"}</StatusBadge></TableCell>
                  <TableCell>{failures}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      {row.id ? (
                        <Button asChild variant="ghost" size="icon" aria-label={`Ver checklist da viatura ${row.vehicle.plate}`}>
                          <Link href={`/checklists/detalhe?vehicleId=${row.vehicle.id}&id=${row.id}`}><Eye className="h-4 w-4" /></Link>
                        </Button>
                      ) : "-"}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <Pagination total={`${rows.length}`} />
      </Card>

      <Card className="mt-8">
        <CardHeader><CardTitle>Itens Críticos dos Templates</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4">
          {criticalTemplateItems.length === 0 ? (
            <div className="text-sm text-slate-500">Sem itens críticos configurados.</div>
          ) : Array.from(new Set(criticalTemplateItems)).map((item) => <div key={item} className="rounded-xl border border-slate-200 p-4"><b>{item}</b><p className="mt-2 text-sm text-slate-500">OK / AVARIA / FALTA</p></div>)}
        </CardContent>
      </Card>
    </AppShell>
  );
}

function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate();
}
