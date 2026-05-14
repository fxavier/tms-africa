"use client";

import Link from "next/link";
import { Download, Filter, MoreVertical, Plus, ShieldCheck, UserRoundCog, Users, Zap, Clock3 } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { PageHeader } from "@/components/tms/PageHeader";
import { StatCard } from "@/components/tms/StatCard";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Pagination } from "@/components/tms/Pagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import { useApiResource } from "@/hooks/useApiResource";

export default function UsersPage() {
  const currentUser = useApiResource(async () => {
    const user = await api.users.me();
    setStoredUser(user);
    return user;
  }, []);
  const user = currentUser.data;

  return (
    <AppShell>
      <PageHeader
        title="Gestão de Utilizadores"
        subtitle="Controle acessos, permissões e perfis de segurança da plataforma."
        actions={<Button asChild><Link href="/utilizadores/novo"><Plus className="h-4 w-4" /> Novo Utilizador</Link></Button>}
      />
      {currentUser.error && <div className="mb-6"><ErrorState message={currentUser.error} unauthorized={currentUser.unauthorized} /></div>}
      {currentUser.loading && <div className="mb-6"><LoadingState /></div>}
      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilizador Atual" value={user ? "1" : "0"} hint="/users/me" icon={Users} variant="info" />
        <StatCard label="Sessão Keycloak" value={user ? "Ativa" : "-"} hint="Bearer JWT" icon={Clock3} variant="info" />
        <StatCard label="Roles" value={String(user?.roles?.length ?? 0)} hint="realm_access" icon={UserRoundCog} variant="warning" />
        <StatCard label="Estado" value={user?.enabled ? "Ativo" : "-"} hint="Backend" icon={Zap} variant="success" />
      </section>

      <Card className="mt-7 overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-200 p-6">
          <Select className="max-w-[180px]" options={[{ label: "Todas as Roles", value: "all" }]} />
          <Select className="max-w-[180px]" options={[{ label: "Todos Estados", value: "all" }]} />
          <Button variant="ghost" className="ml-auto"><Filter className="h-4 w-4" /> Mais Filtros</Button>
          <Button variant="ghost"><Download className="h-4 w-4" /> Exportar</Button>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead>Nome</TableHead><TableHead>Username / Email</TableHead><TableHead>Role</TableHead><TableHead>Estado</TableHead><TableHead>Último Acesso</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
          <TableBody>{user && <TableRow key={user.email}><TableCell><div className="flex items-center gap-4"><span className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-sm font-bold">{`${user.firstName} ${user.lastName}`.split(" ").map(x => x[0]).join("").slice(0,2)}</span><div><b>{user.firstName} {user.lastName}</b><p className="text-sm text-slate-500">Keycloak</p></div></div></TableCell><TableCell><b>{user.username}</b><p className="text-sm text-slate-500">{user.email}</p></TableCell><TableCell><StatusBadge variant="secondary">{user.roles.join(", ")}</StatusBadge></TableCell><TableCell><StatusBadge variant={user.enabled ? "success" : "danger"}>• {user.enabled ? "ATIVO" : "INATIVO"}</StatusBadge></TableCell><TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleString("pt-PT") : "-"}<p className="text-sm text-slate-500">ID: {user.id}</p></TableCell><TableCell><MoreVertical className="h-5 w-5 text-slate-500" /></TableCell></TableRow>}</TableBody>
        </Table>
        <Pagination total={user ? "1" : "0"} />
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card className="bg-red-50/40"><CardHeader><CardTitle className="flex items-center gap-4"><span className="grid h-12 w-12 place-items-center rounded-xl bg-blue-100 text-blue-600"><ShieldCheck /></span>Política de Segurança</CardTitle></CardHeader><CardContent><p className="leading-7 text-slate-500">Todos os utilizadores devem possuir autenticação de dois fatores ativa para acessos externos. As palavras-passe expiram a cada 90 dias conforme a norma ISO/IEC 27001.</p></CardContent></Card>
        <Card className="bg-red-50/40"><CardHeader><CardTitle>Auditoria de Logins</CardTitle></CardHeader><CardContent><p className="leading-7 text-slate-500">O sistema mantém um registo completo de todas as alterações de perfil e tentativas de login. <b className="text-blue-600">Ver histórico completo.</b></p></CardContent></Card>
      </section>
    </AppShell>
  );
}
