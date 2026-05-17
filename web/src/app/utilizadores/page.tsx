"use client";

import Link from "next/link";
import { useState } from "react";
import { Ban, Filter, Plus, ShieldCheck, UserRoundCog, Users, Zap, Clock3 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { Pagination } from "@/components/tms/Pagination";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import { useApiResource } from "@/hooks/useApiResource";

const roleOptions = [
  { label: "Todas as Roles", value: "all" },
  { label: "SUPERUSER", value: "SUPERUSER" },
  { label: "ADMIN", value: "ADMIN" },
  { label: "GESTOR_FROTA", value: "GESTOR_FROTA" },
  { label: "OPERADOR", value: "OPERADOR" },
  { label: "TECNICO_MANUTENCAO", value: "TECNICO_MANUTENCAO" },
  { label: "AUDITOR", value: "AUDITOR" },
];

export default function UsersPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [actionError, setActionError] = useState<string | null>(null);

  const usersResource = useApiResource(async () => {
    const [users, me] = await Promise.all([api.users.list(), api.users.me()]);
    setStoredUser(me);
    return { users, me };
  }, [refreshKey]);

  const users = usersResource.data?.users ?? [];
  const currentUserId = usersResource.data?.me.id;
  const filteredUsers = users.filter((user) => {
    const roleMatch = roleFilter === "all" || user.roles.includes(roleFilter);
    const statusMatch = statusFilter === "all" || String(user.enabled) === statusFilter;
    return roleMatch && statusMatch;
  });

  async function disableUser(userId: string) {
    setActionError(null);
    try {
      await api.users.disable(userId);
      setRefreshKey((key) => key + 1);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Erro ao desativar utilizador.");
    }
  }

  return (
    <AppShell>
      <PageHeader
        title="Gestão de Utilizadores"
        subtitle="Controle acessos, permissões e perfis de segurança da plataforma."
        actions={<Button asChild><Link href="/utilizadores/novo"><Plus className="h-4 w-4" /> Novo Utilizador</Link></Button>}
      />

      {(usersResource.error || actionError) && <div className="mb-6"><ErrorState message={actionError ?? usersResource.error ?? ""} unauthorized={usersResource.unauthorized} /></div>}
      {usersResource.loading && <div className="mb-6"><LoadingState /></div>}

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilizadores" value={String(users.length)} hint="/users" icon={Users} variant="info" />
        <StatCard label="Sessão Keycloak" value={usersResource.data?.me ? "Ativa" : "-"} hint="Bearer JWT" icon={Clock3} variant="info" />
        <StatCard label="Administradores" value={String(users.filter((user) => user.roles.includes("ADMIN") || user.roles.includes("SUPERUSER")).length)} hint="Roles críticas" icon={UserRoundCog} variant="warning" />
        <StatCard label="Ativos" value={String(users.filter((user) => user.enabled).length)} hint="Backend" icon={Zap} variant="success" />
      </section>

      <Card className="mt-7 overflow-hidden">
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 p-6">
          <Select className="max-w-[220px]" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} options={roleOptions} />
          <Select
            className="max-w-[180px]"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[{ label: "Todos Estados", value: "all" }, { label: "Ativos", value: "true" }, { label: "Inativos", value: "false" }]}
          />
          <Button variant="ghost" className="ml-auto" onClick={() => { setRoleFilter("all"); setStatusFilter("all"); }}>
            <Filter className="h-4 w-4" /> Limpar Filtros
          </Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Username / Email</TableHead><TableHead>Roles</TableHead><TableHead>Estado</TableHead><TableHead>Criado em</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell><Avatar name={`${user.firstName} ${user.lastName}`.trim() || user.username} subtitle="Keycloak" /></TableCell>
                <TableCell><b>{user.username}</b><p className="text-sm text-slate-500">{user.email}</p></TableCell>
                <TableCell><div className="flex flex-wrap gap-2">{user.roles.map((role) => <StatusBadge key={role} variant="secondary">{role}</StatusBadge>)}</div></TableCell>
                <TableCell><StatusBadge variant={user.enabled ? "success" : "danger"}>{user.enabled ? "Ativo" : "Inativo"}</StatusBadge></TableCell>
                <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString("pt-PT") : "-"}<p className="text-sm text-slate-500">ID: {user.id}</p></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" disabled={!user.enabled || user.id === currentUserId} onClick={() => disableUser(user.id)}>
                    <Ban className="h-4 w-4" /> Desativar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination total={`${filteredUsers.length} utilizadores`} />
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="bg-red-50/40">
          <CardHeader><CardTitle className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"><ShieldCheck /></span>Política de Segurança</CardTitle></CardHeader>
          <CardContent><p className="leading-7 text-slate-500">As alterações de acesso são feitas através do backend e ficam condicionadas às roles ADMIN ou SUPERUSER.</p></CardContent>
        </Card>
        <Card className="bg-red-50/40">
          <CardHeader><CardTitle>Auditoria de Logins</CardTitle></CardHeader>
          <CardContent><p className="leading-7 text-slate-500">A consulta desta página usa dados reais de Keycloak através de <b className="text-blue-600">/api/v1/users</b>.</p></CardContent>
        </Card>
      </section>
    </AppShell>
  );
}

function Avatar({ name, subtitle }: { name: string; subtitle: string }) {
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold">{initials}</span><div><b>{name}</b><p className="text-sm text-slate-500">{subtitle}</p></div></div>;
}
