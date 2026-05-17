"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { AlertTriangle, Check, ChevronLeft, KeyRound, LockKeyhole, Save, ShieldCheck, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { api } from "@/lib/api";
import type { UserCreateDto } from "@/lib/contracts";

const roleDefinitions = [
  { name: "SUPERUSER", desc: "Acesso total à plataforma e configurações críticas", sensitive: true },
  { name: "ADMIN", desc: "Gestão operacional completa, utilizadores e auditoria", sensitive: true },
  { name: "GESTOR_FROTA", desc: "Viaturas, motoristas, atividades e manutenção", sensitive: false },
  { name: "OPERADOR", desc: "Criação e acompanhamento de atividades", sensitive: false },
  { name: "TECNICO_MANUTENCAO", desc: "Gestão técnica de manutenções e checklists", sensitive: false },
  { name: "AUDITOR", desc: "Consulta de histórico, auditoria e rastreabilidade", sensitive: false },
];

const permissions = [
  ["Viaturas", "Consultar", "Criar", "Editar", "Alterar estado"],
  ["Motoristas", "Consultar", "Criar", "Editar", "Suspender"],
  ["Atividades", "Consultar", "Criar", "Alocar", "Cancelar"],
  ["Manutenções", "Consultar", "Registar", "Editar", "Aprovar"],
  ["Auditoria", "Consultar", "Exportar", "-", "-"],
  ["Configurações", "Consultar", "Editar", "-", "-"],
];

const emptyForm: UserCreateDto = {
  username: "",
  email: "",
  firstName: "",
  lastName: "",
  roles: ["OPERADOR"],
  enabled: true,
};

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState<UserCreateDto>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const displayName = `${form.firstName} ${form.lastName}`.trim() || "Novo utilizador";
  const initials = useMemo(() => displayName.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase(), [displayName]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await api.users.create({
        username: form.username.trim(),
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        roles: form.roles,
        enabled: form.enabled,
      });
      router.push("/utilizadores");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Erro ao guardar utilizador.");
    } finally {
      setSaving(false);
    }
  }

  function toggleRole(role: string) {
    setForm((current) => {
      const roles = current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role];
      return { ...current, roles };
    });
  }

  return (
    <AppShell>
      <PageHeader
        title="Novo Utilizador"
        subtitle="Crie o acesso, atribua roles e confirme permissões efetivas do utilizador."
        actions={
          <>
            <Button variant="outline" asChild><Link href="/utilizadores"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button>
            <Button type="submit" form="user-form" disabled={saving || !form.username.trim() || !form.email.trim() || form.roles.length === 0}>
              <Save className="h-4 w-4" /> {saving ? "A guardar..." : "Guardar utilizador"}
            </Button>
          </>
        }
      />

      {error && <div className="mb-6"><ErrorState message={error} /></div>}

      <form id="user-form" onSubmit={handleSubmit} className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><UserPlus className="h-5 w-5" /> Dados de acesso</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <Field label="Nome" required><Input required value={form.firstName} onChange={(event) => update("firstName", event.target.value)} /></Field>
              <Field label="Apelido" required><Input required value={form.lastName} onChange={(event) => update("lastName", event.target.value)} /></Field>
              <Field label="Username" required><Input required value={form.username} onChange={(event) => update("username", event.target.value)} /></Field>
              <Field label="Email" required><Input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></Field>
              <Field label="Estado">
                <Select value={String(form.enabled)} onChange={(event) => update("enabled", event.target.value === "true")} options={[{ label: "Ativo", value: "true" }, { label: "Inativo", value: "false" }]} />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Roles atribuídas</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {roleDefinitions.map((role) => {
                const checked = form.roles.includes(role.name);
                return (
                  <label key={role.name} className={checked ? "rounded-xl border border-blue-300 bg-blue-50 p-5" : "rounded-xl border border-slate-200 p-5"}>
                    <div className="flex items-start gap-4">
                      <input type="checkbox" checked={checked} onChange={() => toggleRole(role.name)} className="mt-1 h-5 w-5 rounded border-slate-300" />
                      <div>
                        <div className="flex flex-wrap items-center gap-2"><b>{role.name}</b>{role.sensitive && <StatusBadge variant="warning">Sensível</StatusBadge>}</div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{role.desc}</p>
                      </div>
                    </div>
                  </label>
                );
              })}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader><CardTitle className="flex items-center gap-3"><KeyRound className="h-5 w-5" /> Permissões efetivas</CardTitle></CardHeader>
            <div className="overflow-x-auto p-6 pt-0">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="bg-slate-100 text-left text-xs font-black uppercase tracking-widest text-slate-500"><th className="rounded-l-xl px-4 py-4">Módulo</th><th>Permissão 1</th><th>Permissão 2</th><th>Permissão 3</th><th className="rounded-r-xl">Permissão 4</th></tr></thead>
                <tbody>{permissions.map((row) => <tr key={row[0]} className="border-b border-slate-100"><td className="px-4 py-4 font-black">{row[0]}</td>{row.slice(1).map((value) => <td key={`${row[0]}-${value}`} className="py-4"><span className={value === "-" ? "text-slate-300" : "inline-flex items-center gap-2 font-semibold text-green-700"}>{value !== "-" && <Check className="h-4 w-4" />}{value}</span></td>)}</tr>)}</tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-black">Pré-visualização do perfil</h3>
              <div className="mt-6 flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-xl font-black">{initials}</span>
                <div>
                  <b className="text-lg">{displayName}</b>
                  <p className="text-sm text-slate-300">{form.email || "email@dominio.com"}</p>
                  <p className="mt-2"><StatusBadge variant={form.enabled ? "success" : "danger"}>{form.enabled ? "Ativo" : "Inativo"}</StatusBadge></p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-200 bg-orange-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-orange-700"><AlertTriangle className="h-5 w-5" /> Role sensível</h3><p className="mt-2 text-sm leading-6 text-slate-700">A role SUPERUSER só pode ser atribuída por um superutilizador. O backend bloqueia essa atribuição quando o utilizador atual é apenas ADMIN.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><LockKeyhole className="h-5 w-5" /> Segurança</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><SecurityLine text="Criação feita em /api/v1/users" /><SecurityLine text="Roles validadas no backend" /><SecurityLine text="Acesso condicionado por role" /></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><Users className="h-5 w-5" /> Roles selecionadas</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">{form.roles.map((role) => <StatusBadge key={role} variant="secondary">{role}</StatusBadge>)}</CardContent></Card>
        </aside>
      </form>
    </AppShell>
  );

  function update<K extends keyof UserCreateDto>(key: K, value: UserCreateDto[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return <label className="space-y-2 text-sm font-semibold text-slate-900"><span>{label} {required && <span className="text-red-500">*</span>}</span>{children}</label>;
}

function SecurityLine({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">✓</span><b>{text}</b></div>;
}
