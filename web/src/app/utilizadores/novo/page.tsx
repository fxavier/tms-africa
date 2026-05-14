import Link from "next/link";
import { AlertTriangle, Check, ChevronLeft, KeyRound, LockKeyhole, Save, ShieldCheck, UserPlus, Users } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/tms/PageHeader";
import { FormField } from "@/components/tms/FormField";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

const roles = [
  { name: "SUPERUSER", desc: "Acesso total à plataforma e configurações críticas", checked: false, sensitive: true },
  { name: "ADMIN", desc: "Gestão operacional completa, utilizadores e auditoria", checked: true, sensitive: true },
  { name: "GESTOR_FROTA", desc: "Viaturas, motoristas, atividades e manutenção", checked: true, sensitive: false },
  { name: "OPERADOR", desc: "Criação e acompanhamento de atividades", checked: false, sensitive: false },
  { name: "TECNICO_MANUTENCAO", desc: "Gestão técnica de manutenções e checklists", checked: false, sensitive: false },
  { name: "AUDITOR", desc: "Consulta de histórico, auditoria e rastreabilidade", checked: false, sensitive: false },
];

const permissions = [
  ["Viaturas", "Consultar", "Criar", "Editar", "Alterar estado"],
  ["Motoristas", "Consultar", "Criar", "Editar", "Suspender"],
  ["Atividades", "Consultar", "Criar", "Alocar", "Cancelar"],
  ["Manutenções", "Consultar", "Registar", "Editar", "Aprovar"],
  ["Auditoria", "Consultar", "Exportar", "—", "—"],
  ["Configurações", "Consultar", "Editar", "—", "—"],
];

export default function NewUserPage() {
  return (
    <AppShell>
      <PageHeader
        title="Novo Utilizador"
        subtitle="Crie o acesso, atribua roles e confirme permissões efetivas do utilizador."
        actions={<><Button variant="outline" asChild><Link href="/utilizadores"><ChevronLeft className="h-4 w-4" /> Voltar</Link></Button><Button><Save className="h-4 w-4" /> Guardar utilizador</Button></>}
      />

      <section className="grid gap-8 xl:grid-cols-[1fr_390px]">
        <div className="space-y-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><UserPlus className="h-5 w-5" /> Dados de acesso</CardTitle></CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <FormField label="Nome" required value="Carlos" />
              <FormField label="Apelido" required value="Mendes" />
              <FormField label="Username" required value="carlos.mendes" />
              <FormField label="Email" required type="email" value="cmendes@logitrack.pt" />
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Estado</span><Select options={[{ label: "Ativo", value: "active" }, { label: "Inativo", value: "inactive" }]} /></label>
              <label className="space-y-2 text-sm font-semibold text-slate-900"><span>Obrigar reset de palavra-passe</span><Select options={[{ label: "Sim, no primeiro acesso", value: "yes" }, { label: "Não", value: "no" }]} /></label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-3"><ShieldCheck className="h-5 w-5" /> Roles atribuídas</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              {roles.map((role) => (
                <label key={role.name} className={role.checked ? "rounded-2xl border border-blue-300 bg-blue-50 p-5" : "rounded-2xl border border-slate-200 p-5"}>
                  <div className="flex items-start gap-4">
                    <input type="checkbox" defaultChecked={role.checked} className="mt-1 h-5 w-5 rounded border-slate-300" />
                    <div><div className="flex flex-wrap items-center gap-2"><b>{role.name}</b>{role.sensitive && <StatusBadge variant="warning">Sensível</StatusBadge>}</div><p className="mt-1 text-sm leading-6 text-slate-500">{role.desc}</p></div>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader><CardTitle className="flex items-center gap-3"><KeyRound className="h-5 w-5" /> Permissões efetivas</CardTitle></CardHeader>
            <div className="overflow-x-auto p-6 pt-0">
              <table className="w-full min-w-[720px] text-sm">
                <thead><tr className="bg-slate-100 text-left text-xs font-black uppercase tracking-widest text-slate-500"><th className="rounded-l-xl px-4 py-4">Módulo</th><th>Permissão 1</th><th>Permissão 2</th><th>Permissão 3</th><th className="rounded-r-xl">Permissão 4</th></tr></thead>
                <tbody>{permissions.map((row) => <tr key={row[0]} className="border-b border-slate-100"><td className="px-4 py-4 font-black">{row[0]}</td>{row.slice(1).map((value) => <td key={value} className="py-4"><span className={value === "—" ? "text-slate-300" : "inline-flex items-center gap-2 font-semibold text-green-700"}>{value !== "—" && <Check className="h-4 w-4" />}{value}</span></td>)}</tr>)}</tbody>
              </table>
            </div>
          </Card>
        </div>

        <aside className="space-y-6">
          <Card className="bg-slate-950 text-white"><CardContent className="p-6"><h3 className="text-xl font-black">Pré-visualização do perfil</h3><div className="mt-6 flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 text-xl font-black">CM</span><div><b className="text-lg">Carlos Mendes</b><p className="text-sm text-slate-300">cmendes@logitrack.pt</p><p className="mt-2"><StatusBadge variant="success">ATIVO</StatusBadge></p></div></div></CardContent></Card>
          <Card className="border-orange-200 bg-orange-50"><CardContent className="p-5"><h3 className="flex items-center gap-2 font-black text-orange-700"><AlertTriangle className="h-5 w-5" /> Role sensível</h3><p className="mt-2 text-sm leading-6 text-slate-700">A role SUPERUSER só pode ser atribuída por um superutilizador. Todas as alterações ficam registadas em auditoria.</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><LockKeyhole className="h-5 w-5" /> Segurança</CardTitle></CardHeader><CardContent className="space-y-4 text-sm"><SecurityLine text="2FA obrigatório no primeiro login" /><SecurityLine text="Sessões externas auditadas" /><SecurityLine text="Reset de password forçado" /><SecurityLine text="Acesso condicionado por role" /></CardContent></Card>
          <Card><CardHeader><CardTitle className="flex items-center gap-3"><Users className="h-5 w-5" /> Grupos de acesso</CardTitle></CardHeader><CardContent className="space-y-3"><Input defaultValue="Operações" /><Input defaultValue="Gestão de Frota" /><Input defaultValue="Administração" /></CardContent></Card>
        </aside>
      </section>
    </AppShell>
  );
}

function SecurityLine({ text }: { text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-green-100 text-green-700">✓</span><b>{text}</b></div>;
}
