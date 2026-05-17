"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { BellRing, CheckSquare, Cloud, Edit, FileText, PackageCheck, Plus, RefreshCw, Route, Save, Settings, SlidersHorizontal, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { api, ApiClientError } from "@/lib/api";
import { useApiResource } from "@/hooks/useApiResource";
import { humanizeEnum } from "@/types/status";
import type { CatalogCategory, CatalogItemDto, ChecklistTemplateDto, ChecklistTemplateItemDto } from "@/lib/contracts";

const catalogCategories: { label: string; value: CatalogCategory; icon: typeof FileText }[] = [
  { label: "Documentos de viatura", value: "VEHICLE_DOCUMENT", icon: FileText },
  { label: "Documentos de motorista", value: "DRIVER_DOCUMENT", icon: FileText },
  { label: "Acessórios", value: "ACCESSORY", icon: PackageCheck },
  { label: "Tipos de atividade", value: "ACTIVITY_TYPE", icon: Route },
];

type CatalogForm = {
  category: CatalogCategory;
  code: string;
  name: string;
  description: string;
  sortOrder: string;
};

const emptyCatalogForm: CatalogForm = {
  category: "VEHICLE_DOCUMENT",
  code: "",
  name: "",
  description: "",
  sortOrder: "0",
};

export default function SettingsPage() {
  const alertConfigurations = useApiResource(() => api.alertConfigurations.list(), []);
  const alertRows = alertConfigurations.data ?? [];

  return (
    <AppShell>
      <PageHeader
        title="Configurações do Sistema"
        subtitle="Gerencie parâmetros operacionais, checklists e preferências globais do TMS."
        actions={<><Button variant="outline">Descartar</Button><Button>Guardar Alterações</Button></>}
      />

      {alertConfigurations.error && <div className="mb-6"><ErrorState message={alertConfigurations.error} unauthorized={alertConfigurations.unauthorized} /></div>}
      {alertConfigurations.loading && <div className="mb-6"><LoadingState /></div>}

      <CatalogManagement />

      <section className="grid gap-8 xl:grid-cols-[1fr_470px]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <div className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100"><BellRing className="h-5 w-5" /></span><div><CardTitle>Períodos de Alerta Operacional</CardTitle><p className="text-sm text-slate-500">Definição de limiares temporais para notificações de manutenção e documentos.</p></div></div>
              <Button asChild variant="ghost" size="icon"><Link href="/configuracoes/novo"><Plus className="h-5 w-5" /></Link></Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-[1fr_120px_120px_120px] rounded-xl bg-slate-100 px-5 py-4 text-sm font-black text-slate-500"><span>Tipo de Evento</span><span>Aviso (Dias)</span><span>Crítico (Dias)</span><span>Destinatários</span></div>
              {alertRows.map((config) => (
                <div key={config.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center border-b border-slate-200 px-5 py-5">
                  <b className="text-lg">{humanizeEnum(config.alertType)} <span className="text-sm text-slate-500">({config.entityType})</span></b><Input className="w-20" defaultValue={config.daysBeforeWarning ?? 0} /><Input className="w-20 text-red-600" defaultValue={config.daysBeforeCritical ?? 0} /><div className="flex -space-x-2"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-100 text-xs font-bold text-slate-700 ring-2 ring-white">{config.active ? "ON" : "OFF"}</span></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><SlidersHorizontal className="h-5 w-5" /> Preferências Gerais da Plataforma</CardTitle></CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-2">
                <div className="space-y-5">
                  <div className="flex items-center gap-4"><span className="w-32 font-semibold">Fuso Horário</span><span className="rounded-xl bg-slate-100 px-4 py-3">(UTC+00:00) Lisboa</span></div>
                  <div className="flex items-center gap-4"><span className="w-32 font-semibold">Unidade de Medida</span><div className="rounded-xl bg-slate-100 p-1"><button className="rounded-lg bg-white px-5 py-3 font-bold shadow-sm">Quilómetros (km)</button><button className="px-5 py-3 text-slate-500">Milhas (mi)</button></div></div>
                </div>
                <div className="space-y-5 border-l border-slate-200 pl-8">
                  <Toggle label="Modo Escuro Automático" enabled />
                  <Toggle label="Relatórios Semanais (Email)" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <ChecklistTemplateManagement />
      </section>

      <footer className="mt-10 flex flex-wrap items-center gap-8 border-t border-slate-200 pt-6 text-sm text-slate-500"><span>Última alteração: Hoje às 09:42 por João Silva</span><span>Versão do Sistema: 2.4.0-Enterprise</span><a className="ml-auto underline">Termos de Utilização</a><a className="underline">Política de Privacidade</a></footer>
    </AppShell>
  );
}

type ChecklistTemplateForm = {
  vehicleType: string;
  name: string;
  active: boolean;
  items: ChecklistTemplateItemDto[];
};

const emptyTemplateForm: ChecklistTemplateForm = {
  vehicleType: "GERAL",
  name: "",
  active: true,
  items: [
    { itemName: "Pneus", critical: true, displayOrder: 10 },
    { itemName: "Travões", critical: true, displayOrder: 20 },
  ],
};

function ChecklistTemplateManagement() {
  const [templates, setTemplates] = useState<ChecklistTemplateDto[]>([]);
  const [form, setForm] = useState<ChecklistTemplateForm>(emptyTemplateForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function loadTemplates() {
    setLoading(true);
    setError(null);
    try {
      setTemplates(await api.checklistTemplates.list());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar templates de checklist.");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyTemplateForm);
    setMessage(null);
    setError(null);
  }

  function startEdit(template: ChecklistTemplateDto) {
    setEditingId(template.id ?? null);
    setForm({
      vehicleType: template.vehicleType ?? "GERAL",
      name: template.name,
      active: template.active,
      items: template.items.length > 0 ? template.items.map((item, index) => ({
        itemName: item.itemName,
        critical: item.critical,
        displayOrder: item.displayOrder ?? (index + 1) * 10,
      })) : [],
    });
    setMessage(null);
    setError(null);
  }

  function addItem() {
    setForm((current) => ({
      ...current,
      items: [...current.items, { itemName: "", critical: false, displayOrder: (current.items.length + 1) * 10 }],
    }));
  }

  function updateItem(index: number, patch: Partial<ChecklistTemplateItemDto>) {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item),
    }));
  }

  function removeItem(index: number) {
    setForm((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    const payload: ChecklistTemplateDto = {
      vehicleType: form.vehicleType.trim() || "GERAL",
      name: form.name.trim(),
      active: form.active,
      items: form.items
        .filter((item) => item.itemName.trim())
        .map((item, index) => ({
          itemName: item.itemName.trim(),
          critical: item.critical,
          displayOrder: item.displayOrder ?? (index + 1) * 10,
        })),
    };

    try {
      if (editingId) {
        await api.checklistTemplates.update(editingId, payload);
        setMessage("Template atualizado.");
      } else {
        await api.checklistTemplates.create(payload);
        setMessage("Template criado.");
      }
      setEditingId(null);
      setForm(emptyTemplateForm);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar o template.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleTemplate(template: ChecklistTemplateDto) {
    if (!template.id) return;
    setError(null);
    setMessage(null);
    try {
      await api.checklistTemplates.update(template.id, { ...template, active: !template.active });
      setMessage(template.active ? "Template desativado." : "Template ativado.");
      await loadTemplates();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel alterar o estado do template.");
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-3"><CheckSquare className="h-5 w-5" /> Gestão de Templates de Checklist</CardTitle>
        <Button type="button" variant="ghost" size="icon" onClick={() => void loadTemplates()} disabled={loading}><RefreshCw className="h-5 w-5" /></Button>
      </CardHeader>
      <CardContent className="space-y-5 p-6">
        {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
        {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>}

        <div className="space-y-4">
          {loading ? (
            <div className="text-sm text-slate-500">A carregar templates...</div>
          ) : templates.length === 0 ? (
            <div className="rounded-xl border border-slate-200 p-4 text-sm text-slate-500">Sem templates configurados.</div>
          ) : templates.map((template) => (
            <div key={template.id ?? template.name} className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-green-100 text-green-600"><CheckSquare className="h-6 w-6" /></div>
              <div className="flex-1"><b>{template.name}</b><p className="text-sm text-slate-500">{template.items.length} itens de verificação</p><div className="mt-3 flex flex-wrap gap-2"><StatusBadge variant={template.active ? "success" : "secondary"}>{template.active ? "Ativo" : "Inativo"}</StatusBadge>{template.vehicleType && <StatusBadge variant="secondary">{template.vehicleType}</StatusBadge>}</div></div>
              <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(template)} aria-label="Editar template"><Edit className="h-4 w-4" /></Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => void toggleTemplate(template)} aria-label={template.active ? "Desativar template" : "Ativar template"}>
                {template.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-slate-500" />}
              </Button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-black">{editingId ? "Editar template" : "Novo template"}</h3>
            {editingId && <Button type="button" variant="outline" size="sm" onClick={startCreate}>Novo</Button>}
          </div>
          <label className="space-y-2 text-sm font-semibold text-slate-900">Nome<Input required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Inspeção Pré-Viagem" /></label>
          <label className="space-y-2 text-sm font-semibold text-slate-900">Tipo de viatura<Input required value={form.vehicleType} onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))} placeholder="GERAL, Pesado, Ligeiro..." /></label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-900"><input type="checkbox" checked={form.active} onChange={(event) => setForm((current) => ({ ...current, active: event.target.checked }))} /> Template ativo</label>

          <div className="space-y-3">
            <div className="flex items-center justify-between"><b className="text-sm">Itens</b><Button type="button" variant="outline" size="sm" onClick={addItem}><Plus className="h-4 w-4" /> Item</Button></div>
            {form.items.map((item, index) => (
              <div key={`${item.itemName}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 md:grid-cols-[1fr_82px_90px_40px] md:items-center">
                <Input required value={item.itemName} placeholder="Nome do item" onChange={(event) => updateItem(index, { itemName: event.target.value })} />
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600"><input type="checkbox" checked={item.critical} onChange={(event) => updateItem(index, { critical: event.target.checked })} /> Crítico</label>
                <Input type="number" value={item.displayOrder ?? 0} onChange={(event) => updateItem(index, { displayOrder: Number(event.target.value) })} />
                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(index)} aria-label="Remover item"><Trash2 className="h-4 w-4 text-red-600" /></Button>
              </div>
            ))}
          </div>

          <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar template"}</Button>
        </form>
      </CardContent>
      <div className="flex items-center gap-3 border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-500"><Cloud className="h-5 w-5" /> Templates ativos aparecem no formulário de nova checklist.</div>
    </Card>
  );
}

function CatalogManagement() {
  const [items, setItems] = useState<CatalogItemDto[]>([]);
  const [activeCategory, setActiveCategory] = useState<CatalogCategory>("VEHICLE_DOCUMENT");
  const [form, setForm] = useState<CatalogForm>(emptyCatalogForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const visibleItems = useMemo(
    () => items.filter((item) => item.category === activeCategory).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
    [items, activeCategory],
  );

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    setError(null);
    try {
      setItems(await api.catalogItems.list());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar tipos configurados.");
    } finally {
      setLoading(false);
    }
  }

  function startCreate(category: CatalogCategory) {
    setEditingId(null);
    setForm({ ...emptyCatalogForm, category });
    setActiveCategory(category);
    setMessage(null);
  }

  function startEdit(item: CatalogItemDto) {
    setEditingId(item.id);
    setActiveCategory(item.category);
    setForm({
      category: item.category,
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      sortOrder: String(item.sortOrder),
    });
    setMessage(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      sortOrder: Number(form.sortOrder || 0),
      active: true,
    };

    try {
      if (editingId) {
        await api.catalogItems.update(editingId, payload);
        setMessage("Tipo atualizado.");
      } else {
        await api.catalogItems.create({
          category: form.category,
          code: normalizeCode(form.code),
          ...payload,
        });
        setMessage("Tipo criado.");
      }
      setForm({ ...emptyCatalogForm, category: form.category });
      setEditingId(null);
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel guardar o tipo.");
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(item: CatalogItemDto) {
    setError(null);
    setMessage(null);
    try {
      if (item.active) {
        await api.catalogItems.deactivate(item.id);
        setMessage("Tipo desativado.");
      } else {
        await api.catalogItems.activate(item.id);
        setMessage("Tipo ativado.");
      }
      await loadItems();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Nao foi possivel alterar o estado.");
    }
  }

  return (
    <section className="mb-8 grid gap-6 xl:grid-cols-[1fr_380px]">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3"><Settings className="h-5 w-5" /> Tipos operacionais</CardTitle>
            <p className="mt-1 text-sm text-slate-500">Catálogos usados nos formulários de viaturas, motoristas e atividades.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => void loadItems()} disabled={loading}><RefreshCw className="h-4 w-4" /> Atualizar</Button>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2">
            {catalogCategories.map((category) => {
              const Icon = category.icon;
              const count = items.filter((item) => item.category === category.value).length;
              return (
                <Button
                  key={category.value}
                  type="button"
                  variant={activeCategory === category.value ? "default" : "outline"}
                  onClick={() => startCreate(category.value)}
                >
                  <Icon className="h-4 w-4" /> {category.label} <span className="rounded bg-white/15 px-2 py-0.5 text-xs">{count}</span>
                </Button>
              );
            })}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</div>}
          {message && <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">{message}</div>}

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="grid grid-cols-[120px_1fr_100px_120px] bg-slate-100 px-4 py-3 text-xs font-black uppercase tracking-wide text-slate-500">
              <span>Código</span><span>Nome</span><span>Estado</span><span>Ações</span>
            </div>
            {loading ? (
              <div className="p-5 text-sm text-slate-500">A carregar tipos...</div>
            ) : visibleItems.length === 0 ? (
              <div className="p-5 text-sm text-slate-500">Sem tipos configurados nesta categoria.</div>
            ) : (
              visibleItems.map((item) => (
                <div key={item.id} className="grid grid-cols-[120px_1fr_100px_120px] items-center border-t border-slate-200 px-4 py-4 text-sm">
                  <code className="truncate rounded bg-slate-100 px-2 py-1 text-xs font-bold">{item.code}</code>
                  <div>
                    <button type="button" className="font-bold text-slate-950 hover:underline" onClick={() => startEdit(item)}>{item.name}</button>
                    {item.description && <p className="mt-1 text-xs text-slate-500">{item.description}</p>}
                    {item.systemDefault && <p className="mt-1 text-[11px] font-bold uppercase text-slate-400">Base do sistema</p>}
                  </div>
                  <StatusBadge variant={item.active ? "success" : "secondary"}>{item.active ? "Ativo" : "Inativo"}</StatusBadge>
                  <div className="flex gap-2">
                    <Button type="button" variant="ghost" size="icon" onClick={() => startEdit(item)} aria-label="Editar tipo"><Edit className="h-4 w-4" /></Button>
                    <Button type="button" variant="ghost" size="icon" onClick={() => void toggleActive(item)} aria-label={item.active ? "Desativar tipo" : "Ativar tipo"}>
                      {item.active ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5 text-slate-500" />}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{editingId ? "Editar tipo" : "Novo tipo"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="space-y-2 text-sm font-semibold text-slate-900">Categoria<Select value={form.category} disabled={Boolean(editingId)} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value as CatalogCategory }))} options={catalogCategories.map((item) => ({ label: item.label, value: item.value }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Código<Input value={form.code} disabled={Boolean(editingId)} required placeholder="EX: CARTAO_TACOGRAFO" onChange={(event) => setForm((current) => ({ ...current, code: normalizeCode(event.target.value) }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Nome<Input value={form.name} required placeholder="Nome visível no formulário" onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Descrição<Input value={form.description} placeholder="Uso interno opcional" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <label className="space-y-2 text-sm font-semibold text-slate-900">Ordem<Input value={form.sortOrder} type="number" onChange={(event) => setForm((current) => ({ ...current, sortOrder: event.target.value }))} /></label>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={saving}><Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar"}</Button>
              {editingId && <Button type="button" variant="outline" onClick={() => startCreate(form.category)}>Cancelar</Button>}
            </div>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_");
}

function Toggle({ label, enabled = false }: { label: string; enabled?: boolean }) {
  return <div className="flex items-center justify-between"><span className="font-semibold">{label}</span><span className={enabled ? "flex h-7 w-12 items-center rounded-full bg-slate-950 p-1" : "flex h-7 w-12 items-center rounded-full bg-slate-300 p-1 justify-end"}><span className="h-5 w-5 rounded-full bg-white" /></span></div>;
}
