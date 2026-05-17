"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CalendarClock, Check, ChevronLeft, ChevronRight, FileCheck2, Route, Save, Truck, UserRound } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api";
import type { ActivityPriority } from "@/lib/contracts";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum, statusVariant } from "@/types/status";

type ActivityStep = 0 | 1 | 2 | 3 | 4;

const steps: { label: string; title: string }[] = [
  { label: "Definição", title: "Definição da atividade" },
  { label: "Rota & Carga", title: "Rota e carga" },
  { label: "Alocação", title: "Alocação de recursos" },
  { label: "Validação", title: "Validação operacional" },
  { label: "Conclusão", title: "Conclusão" },
];

type ActivityForm = {
  title: string;
  activityType: string;
  origin: string;
  destination: string;
  plannedStart: string;
  plannedEnd: string;
  priority: ActivityPriority;
  cargo: string;
  notes: string;
  vehicleId: string;
  driverId: string;
  rhOverrideJustification: string;
};

const defaultForm: ActivityForm = {
  title: "Transporte Lisboa - Madrid",
  activityType: "CARGA_GERAL",
  origin: "Lisboa - Terminal 1",
  destination: "Madrid - Hub Norte",
  plannedStart: "",
  plannedEnd: "",
  priority: "MEDIA",
  cargo: "12t / 42 m3",
  notes: "Carga geral com entrega prioritária e confirmação documental no destino.",
  vehicleId: "",
  driverId: "",
  rhOverrideJustification: "",
};

export default function NewActivityPage() {
  const router = useRouter();
  const vehicles = useApiResource(() => api.vehicles.list({ size: 100 }), []);
  const drivers = useApiResource(() => api.drivers.list({ size: 100 }), []);
  const activityTypes = useApiResource(() => api.catalogItems.list("ACTIVITY_TYPE"), []);
  const [activeStep, setActiveStep] = useState<ActivityStep>(0);
  const [form, setForm] = useState<ActivityForm>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allocationBlockers, setAllocationBlockers] = useState<string[]>([]);

  const routeLocation = useMemo(() => [form.origin.trim(), form.destination.trim()].filter(Boolean).join(" -> "), [form.origin, form.destination]);
  const vehicleRows = vehicles.data?.content ?? [];
  const driverRows = drivers.data?.content ?? [];
  const selectedVehicle = vehicleRows.find((vehicle) => vehicle.id === form.vehicleId);
  const selectedDriver = driverRows.find((driver) => driver.id === form.driverId);
  const vehicleOptions = [
    { label: "Selecionar viatura", value: "" },
    ...vehicleRows.map((vehicle) => ({ label: `${vehicle.plate} · ${vehicle.brand} ${vehicle.model}`, value: vehicle.id })),
  ];
  const driverOptions = [
    { label: "Selecionar motorista", value: "" },
    ...driverRows.map((driver) => ({ label: `${driver.fullName} · ${driver.licenseCategory}`, value: driver.id })),
  ];
  const activityTypeOptions = [
    { label: "Selecionar tipo", value: "" },
    ...(activityTypes.data ?? []).filter((item) => item.active).map((item) => ({ label: item.name, value: item.code })),
  ];
  const localBlockers = useMemo(() => {
    const blockers: string[] = [];
    if (selectedVehicle && selectedVehicle.status !== "DISPONIVEL") blockers.push(`A viatura está ${humanizeEnum(selectedVehicle.status).toLowerCase()}.`);
    if (selectedDriver && selectedDriver.status !== "ATIVO") blockers.push(`O motorista está ${humanizeEnum(selectedDriver.status).toLowerCase()}.`);
    return blockers;
  }, [selectedVehicle, selectedDriver]);

  function updateField(field: keyof ActivityForm, value: string) {
    setAllocationBlockers([]);
    setForm((current) => ({ ...current, [field]: field === "priority" ? value as ActivityPriority : value }));
  }

  function validateStep(step: ActivityStep) {
    if (step === 0 && (!form.title.trim() || !form.activityType.trim())) {
      setError("Preencha o titulo e o tipo de atividade para continuar.");
      return false;
    }
    if (step === 1) {
      if (!form.origin.trim() || !form.destination.trim() || !form.plannedStart || !form.plannedEnd) {
        setError("Preencha origem, destino, inicio previsto e fim previsto para continuar.");
        return false;
      }
      if (new Date(form.plannedEnd).getTime() <= new Date(form.plannedStart).getTime()) {
        setError("O fim previsto deve ser posterior ao inicio previsto.");
        return false;
      }
    }
    if (step === 2 && (!form.vehicleId || !form.driverId)) {
      setError("Selecione a viatura e o motorista para continuar.");
      return false;
    }
    if (step === 3 && localBlockers.length > 0) {
      setError("A alocação tem bloqueios locais. Corrija a viatura ou o motorista selecionado antes de continuar.");
      return false;
    }
    setError(null);
    return true;
  }

  function goNext() {
    if (!validateStep(activeStep)) return;
    setActiveStep((current) => Math.min(current + 1, steps.length - 1) as ActivityStep);
  }

  function goPrevious() {
    setError(null);
    setActiveStep((current) => Math.max(current - 1, 0) as ActivityStep);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (activeStep !== 4) {
      goNext();
      return;
    }

    for (const step of [0, 1, 2] as ActivityStep[]) {
      if (!validateStep(step)) {
        setActiveStep(step);
        return;
      }
    }

    setSaving(true);
    setError(null);
    setAllocationBlockers([]);

    let createdActivityId: string | null = null;
    try {
      const plannedStart = toIsoDateTime(form.plannedStart);
      const plannedEnd = toIsoDateTime(form.plannedEnd);
      const activity = await api.activities.create({
        title: form.title.trim(),
        activityType: form.activityType.trim(),
        location: routeLocation,
        plannedStart,
        plannedEnd,
        priority: form.priority,
        description: form.cargo.trim() || undefined,
        notes: form.notes.trim() || undefined,
      });
      createdActivityId = activity.id;
      await api.activities.allocate(activity.id, {
        vehicleId: form.vehicleId,
        driverId: form.driverId,
        plannedStart,
        plannedEnd,
        rhOverrideJustification: form.rhOverrideJustification.trim() || undefined,
      });
      router.push("/atividades");
    } catch (err) {
      if (createdActivityId) await api.activities.delete(createdActivityId).catch(() => null);
      if (err instanceof ApiClientError && err.code === "ALLOCATION_BLOCKED") {
        setAllocationBlockers(err.details.map((detail) => detail.message));
        setActiveStep(3);
        setError("A alocação foi bloqueada por validações operacionais. Veja os detalhes abaixo.");
      } else {
        setError(err instanceof ApiClientError ? err.message : "Nao foi possivel criar a atividade.");
      }
    } finally {
      setSaving(false);
    }
  }

  const validationCards = [
    {
      title: "Viatura atribuida",
      detail: selectedVehicle ? `${selectedVehicle.plate} · ${humanizeEnum(selectedVehicle.status)}` : "Seleção pendente",
      variant: selectedVehicle?.status === "DISPONIVEL" ? "success" as const : "warning" as const,
      icon: selectedVehicle?.status === "DISPONIVEL" ? Check : AlertTriangle,
    },
    {
      title: "Motorista atribuido",
      detail: selectedDriver ? `${selectedDriver.fullName} · ${humanizeEnum(selectedDriver.status)}` : "Seleção pendente",
      variant: selectedDriver?.status === "ATIVO" ? "success" as const : "warning" as const,
      icon: selectedDriver?.status === "ATIVO" ? Check : AlertTriangle,
    },
    {
      title: "Periodo planejado",
      detail: form.plannedStart && form.plannedEnd ? `${formatDateTimeLocal(form.plannedStart)} - ${formatDateTimeLocal(form.plannedEnd)}` : "Datas pendentes",
      variant: form.plannedStart && form.plannedEnd ? "success" as const : "warning" as const,
      icon: form.plannedStart && form.plannedEnd ? Check : AlertTriangle,
    },
    {
      title: "Validação final",
      detail: localBlockers.length > 0 ? "Existem bloqueios que devem ser corrigidos antes da conclusão." : "Conflitos de agenda, documentação e disponibilidade serão confirmados pelo backend ao concluir.",
      variant: localBlockers.length > 0 ? "danger" as const : "warning" as const,
      icon: localBlockers.length > 0 ? AlertTriangle : AlertTriangle,
    },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Novo Serviço"
        subtitle="Cadastro de atividade em 5 etapas"
        actions={<Button variant="outline" asChild><Link href="/atividades"><ChevronLeft className="h-4 w-4" /> Voltar à listagem</Link></Button>}
      />

      <Card className="mb-8 p-6">
        <div className="grid grid-cols-5 items-start gap-0 text-center text-sm font-semibold text-slate-500">
          {steps.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;
            return (
              <button key={step.label} type="button" onClick={() => index <= activeStep && setActiveStep(index as ActivityStep)} className="relative min-w-0" aria-current={current ? "step" : undefined}>
                {index < steps.length - 1 && <div className={completed ? "absolute left-1/2 top-5 h-1 w-full bg-slate-950" : "absolute left-1/2 top-5 h-1 w-full bg-slate-200"} />}
                <div className={current || completed ? "relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-slate-950 text-white shadow-soft" : "relative z-10 mx-auto grid h-11 w-11 place-items-center rounded-full border-4 border-white bg-white text-slate-500 shadow-soft ring-1 ring-slate-200"}>
                  {completed ? <Check className="h-5 w-5" /> : index + 1}
                </div>
                <div className={current ? "mt-2 truncate font-black text-slate-950" : "mt-2 truncate"}>{step.label}</div>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="mb-8 overflow-hidden bg-slate-950 text-white">
        <CardContent className="grid gap-6 p-7 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.3em] text-slate-400">{steps[activeStep].label}</p>
            <h2 className="text-3xl font-black">{steps[activeStep].title}</h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full bg-white/10 px-4 py-2"><CalendarClock className="mr-2 inline h-4 w-4" />{form.plannedStart ? new Date(form.plannedStart).toLocaleString("pt-PT") : "Data por definir"}</span>
              <span className="rounded-full bg-white/10 px-4 py-2"><Truck className="mr-2 inline h-4 w-4" />{selectedVehicle?.plate ?? "Viatura por atribuir"}</span>
              <span className="rounded-full bg-white/10 px-4 py-2"><UserRound className="mr-2 inline h-4 w-4" />{selectedDriver?.fullName ?? "Motorista por atribuir"}</span>
            </div>
          </div>
          <div className="grid min-w-[250px] grid-cols-2 rounded-2xl border border-white/20 bg-white/10 p-5 text-center">
            <div><p className="text-sm text-slate-300">Etapa</p><b className="text-2xl">{activeStep + 1}/5</b></div>
            <div className="border-l border-white/20"><p className="text-sm text-slate-300">Rota</p><b className="text-xl">{routeLocation ? "Definida" : "Pendente"}</b></div>
          </div>
        </CardContent>
      </Card>

      {error && <div className="mb-6"><ErrorState message={error} /></div>}
      {(vehicles.error || drivers.error || activityTypes.error) && <div className="mb-6"><ErrorState message={vehicles.error ?? drivers.error ?? activityTypes.error ?? ""} unauthorized={vehicles.unauthorized || drivers.unauthorized || activityTypes.unauthorized} /></div>}
      {(vehicles.loading || drivers.loading || activityTypes.loading) && <div className="mb-6"><LoadingState label="A carregar viaturas, motoristas e tipos de atividade..." /></div>}

      <form id="activity-create-form" onSubmit={handleSubmit}>
        {activeStep === 0 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Route className="h-5 w-5" /> Definição</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Título <span className="text-red-500">*</span></span><Input required value={form.title} onChange={(event) => updateField("title", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Tipo de atividade <span className="text-red-500">*</span></span><Select required value={form.activityType} onChange={(event) => updateField("activityType", event.target.value)} options={activityTypeOptions} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Prioridade</span><Select value={form.priority} onChange={(event) => updateField("priority", event.target.value)} options={[{ label: "Baixa", value: "BAIXA" }, { label: "Normal", value: "MEDIA" }, { label: "Alta", value: "ALTA" }, { label: "Crítica", value: "CRITICA" }]} /></label>
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Rota & Carga</CardTitle></CardHeader>
            <CardContent className="grid gap-5 p-6 md:grid-cols-2">
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Origem <span className="text-red-500">*</span></span><Input required value={form.origin} onChange={(event) => updateField("origin", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Destino <span className="text-red-500">*</span></span><Input required value={form.destination} onChange={(event) => updateField("destination", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Início previsto <span className="text-red-500">*</span></span><Input required type="datetime-local" value={form.plannedStart} onChange={(event) => updateField("plannedStart", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Fim previsto <span className="text-red-500">*</span></span><Input required type="datetime-local" value={form.plannedEnd} onChange={(event) => updateField("plannedEnd", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Peso / Volume</span><Input value={form.cargo} onChange={(event) => updateField("cargo", event.target.value)} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900 md:col-span-2"><span>Descrição / Notas</span><textarea className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} /></label>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <section className="grid gap-8 xl:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><Truck className="h-5 w-5" /> Atribuir Viatura</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6">
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Viatura <span className="text-red-500">*</span></span><Select required value={form.vehicleId} onChange={(event) => updateField("vehicleId", event.target.value)} options={vehicleOptions} /></label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><b className="text-lg">{selectedVehicle ? `${selectedVehicle.brand} ${selectedVehicle.model} · ${selectedVehicle.plate}` : "Nenhuma viatura selecionada"}</b><p className="mt-1 text-sm text-slate-500">{selectedVehicle ? `${selectedVehicle.vehicleType} · ${selectedVehicle.capacity} kg · ${selectedVehicle.activityLocation}` : "Escolha a viatura que será alocada à atividade."}</p></div>
                <ValidationItem title="Estado da viatura" detail={selectedVehicle ? humanizeEnum(selectedVehicle.status) : "Seleção pendente"} variant={selectedVehicle?.status === "DISPONIVEL" ? "success" : "warning"} icon={selectedVehicle?.status === "DISPONIVEL" ? Check : AlertTriangle} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="flex items-center gap-3"><UserRound className="h-5 w-5" /> Atribuir Motorista</CardTitle></CardHeader>
              <CardContent className="space-y-4 p-6">
                <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Motorista <span className="text-red-500">*</span></span><Select required value={form.driverId} onChange={(event) => updateField("driverId", event.target.value)} options={driverOptions} /></label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5"><b className="text-lg">{selectedDriver?.fullName ?? "Nenhum motorista selecionado"}</b><p className="mt-1 text-sm text-slate-500">{selectedDriver ? `Carta ${selectedDriver.licenseNumber} · Categoria ${selectedDriver.licenseCategory} · ${selectedDriver.activityLocation}` : "Escolha o motorista que será alocado à atividade."}</p></div>
                <ValidationItem title="Estado do motorista" detail={selectedDriver ? humanizeEnum(selectedDriver.status) : "Seleção pendente"} variant={selectedDriver?.status === "ATIVO" ? "success" : "warning"} icon={selectedDriver?.status === "ATIVO" ? Check : AlertTriangle} />
              </CardContent>
            </Card>
          </section>
        )}

        {activeStep === 3 && (
          <Card className="border-blue-300 bg-blue-50/70">
            <CardContent className="p-6">
              <h3 className="mb-4 flex items-center gap-3 text-xl font-black"><FileCheck2 className="h-6 w-6 text-blue-600" /> Validação</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {validationCards.map((item) => (
                  <ValidationItem key={item.title} title={item.title} detail={item.detail} variant={item.variant} icon={item.icon} />
                ))}
              </div>
              {localBlockers.length > 0 && (
                <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 text-red-700">
                  <b>Bloqueios locais</b>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                    {localBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}
                  </ul>
                </div>
              )}
              {allocationBlockers.length > 0 && (
                <div className="mt-6 rounded-xl border border-red-200 bg-white p-5 text-red-700">
                  <b>Bloqueios retornados pelo backend</b>
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                    {allocationBlockers.map((blocker) => <li key={blocker}>{allocationBlockerLabel(blocker)}</li>)}
                  </ul>
                </div>
              )}
              <label className="mt-6 block space-y-2 text-sm font-semibold text-slate-900">
                Justificação RH
                <textarea
                  value={form.rhOverrideJustification}
                  onChange={(event) => updateField("rhOverrideJustification", event.target.value)}
                  placeholder="Use apenas quando o bloqueio for indisponibilidade RH ou sistema RH indisponível."
                  className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
                />
              </label>
            </CardContent>
          </Card>
        )}

        {activeStep === 4 && (
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><Check className="h-5 w-5" /> Conclusão</CardTitle></CardHeader>
            <CardContent className="grid gap-6 p-6 md:grid-cols-2">
              <Summary label="Título" value={form.title} />
              <Summary label="Tipo / prioridade" value={`${humanizeEnum(form.activityType)} · ${humanizeEnum(form.priority)}`} />
              <Summary label="Rota" value={routeLocation || "-"} />
              <Summary label="Periodo" value={`${formatDateTimeLocal(form.plannedStart)} - ${formatDateTimeLocal(form.plannedEnd)}`} />
              <Summary label="Viatura" value={selectedVehicle ? `${selectedVehicle.plate} · ${selectedVehicle.brand} ${selectedVehicle.model}` : "-"} />
              <Summary label="Motorista" value={selectedDriver?.fullName ?? "-"} />
              <div className="md:col-span-2"><div className="mb-2 text-xs font-black uppercase tracking-widest text-slate-500">Estado da validação</div><div className="flex flex-wrap gap-2"><StatusBadge variant={statusVariant(selectedVehicle?.status)}>{selectedVehicle ? humanizeEnum(selectedVehicle.status) : "Viatura pendente"}</StatusBadge><StatusBadge variant={statusVariant(selectedDriver?.status)}>{selectedDriver ? humanizeEnum(selectedDriver.status) : "Motorista pendente"}</StatusBadge></div></div>
            </CardContent>
          </Card>
        )}

        <div className="sticky bottom-0 mt-8 border-t border-slate-200 bg-slate-50/95 py-5 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button type="button" variant="outline" asChild><Link href="/atividades"><ChevronLeft className="h-4 w-4" /> Sair</Link></Button>
            <div className="flex gap-3">
              <Button type="button" variant="outline" disabled={activeStep === 0 || saving} onClick={goPrevious}><ChevronLeft className="h-4 w-4" /> Anterior</Button>
              <Button type="button" variant="outline" disabled><Save className="h-4 w-4" /> Guardar rascunho</Button>
              {activeStep < 4 ? (
                <Button type="button" disabled={saving || vehicles.loading || drivers.loading || activityTypes.loading} onClick={goNext}>Próximo <ChevronRight className="h-4 w-4" /></Button>
              ) : (
                <Button type="submit" disabled={saving || vehicles.loading || drivers.loading || activityTypes.loading}><Check className="h-4 w-4" /> {saving ? "A criar..." : "Concluir e criar"}</Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </AppShell>
  );
}

function ValidationItem({ title, detail, variant, icon: Icon }: { title: string; detail: string; variant: "success" | "warning" | "danger"; icon: LucideIcon }) {
  const styles = variant === "success" ? "border-green-200 bg-green-50 text-green-700" : variant === "warning" ? "border-orange-200 bg-orange-50 text-orange-700" : "border-red-200 bg-red-50 text-red-700";
  return <div className={`flex items-center gap-4 rounded-xl border p-4 ${styles}`}><span className="grid h-9 w-9 place-items-center rounded-full bg-current/10"><Icon className="h-5 w-5" /></span><div><b>{title}</b><p className="text-sm text-slate-600">{detail}</p></div></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div><div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-semibold text-slate-950">{value}</div></div>;
}

function toIsoDateTime(value: string) {
  return new Date(value).toISOString();
}

function formatDateTimeLocal(value: string) {
  if (!value) return "-";
  return new Date(value).toLocaleString("pt-PT");
}

function allocationBlockerLabel(blocker: string) {
  if (blocker.startsWith("VEHICLE_DOCUMENT_EXPIRED")) return "Documento expirado da viatura.";
  if (blocker.startsWith("DRIVER_LICENSE_EXPIRED")) return "Carta de condução/documento do motorista expirado.";
  if (blocker.startsWith("VEHICLE_ALLOCATION_CONFLICT")) return `Conflito de agenda da viatura com a atividade ${blocker.split(":")[1] ?? ""}.`;
  if (blocker.startsWith("DRIVER_ALLOCATION_CONFLICT")) return `Conflito de agenda do motorista com a atividade ${blocker.split(":")[1] ?? ""}.`;

  const labels: Record<string, string> = {
    VEHICLE_IN_MAINTENANCE: "A viatura está em manutenção.",
    VEHICLE_UNAVAILABLE: "A viatura está indisponível.",
    VEHICLE_DECOMMISSIONED: "A viatura foi abatida.",
    CHECKLIST_CRITICAL_FAILURE: "A última checklist da viatura tem falhas críticas.",
    DRIVER_INACTIVE: "O motorista está inativo.",
    DRIVER_SUSPENDED: "O motorista está suspenso.",
    DRIVER_RH_UNAVAILABLE: "O RH indica que o motorista está indisponível. Pode usar a justificação RH se tiver autorização.",
    RH_SYSTEM_UNAVAILABLE: "O sistema RH está indisponível. Pode usar a justificação RH se tiver autorização.",
  };

  return labels[blocker] ?? humanizeEnum(blocker);
}
