"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Calendar, Download, FileText, IdCard, MapPin, Pencil, Phone, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorState, LoadingState } from "@/components/tms/ApiFeedback";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { api, ApiClientError } from "@/lib/api";
import type { DriverAvailabilityDto, DriverDocumentDto, DriverResponseDto } from "@/lib/contracts";
import { humanizeEnum, statusVariant } from "@/types/status";

export default function DriverDetailPage() {
  const searchParams = useSearchParams();
  const driverId = searchParams.get("id");
  const [driver, setDriver] = useState<DriverResponseDto | null>(null);
  const [documents, setDocuments] = useState<DriverDocumentDto[]>([]);
  const [availability, setAvailability] = useState<DriverAvailabilityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDriver() {
      if (!driverId) {
        setError("Identificador do motorista em falta.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const [driverData, documentData, availabilityData] = await Promise.all([
          api.drivers.get(driverId),
          api.drivers.documents.list(driverId),
          api.drivers.availability(driverId).catch(() => null),
        ]);
        if (cancelled) return;
        setDriver(driverData);
        setDocuments(documentData);
        setAvailability(availabilityData);
      } catch (err) {
        if (!cancelled) setError(err instanceof ApiClientError ? err.message : "Nao foi possivel carregar os detalhes do motorista.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadDriver();

    return () => {
      cancelled = true;
    };
  }, [driverId]);

  const expiringDocuments = useMemo(() => {
    const now = new Date();
    const inThirtyDays = new Date(now);
    inThirtyDays.setDate(now.getDate() + 30);
    return documents.filter((doc) => {
      if (!doc.expiryDate) return false;
      const expiry = new Date(`${doc.expiryDate}T00:00:00`);
      return expiry >= now && expiry <= inThirtyDays;
    }).length;
  }, [documents]);

  if (loading) {
    return <AppShell><LoadingState label="A carregar detalhes do motorista..." /></AppShell>;
  }

  if (error || !driver) {
    return <AppShell><ErrorState message={error ?? "Motorista nao encontrado."} /></AppShell>;
  }

  return (
    <AppShell>
      <div className="mb-4 text-sm font-medium text-slate-500">Motoristas &nbsp;&gt;&nbsp; <span className="text-slate-950">Detalhes do Motorista</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{driver.fullName}</h1>
            <StatusBadge variant={statusVariant(driver.status)}>{humanizeEnum(driver.status)}</StatusBadge>
          </div>
          <p className="mt-3 flex items-center gap-2 text-lg text-slate-500"><MapPin className="h-5 w-5" /> {driver.activityLocation}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild><Link href="/motoristas">Voltar</Link></Button>
          <Button asChild><Link href={`/motoristas/editar?id=${driver.id}`}><Pencil className="h-4 w-4" /> Editar Motorista</Link></Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><Phone className="h-10 w-10 rounded-xl bg-slate-100 p-2" /><span className="text-xs font-bold uppercase text-slate-500">Contacto</span></div><div className="mt-8 text-xl font-black">{driver.phone}</div><p className="text-sm text-slate-500">{driver.address}</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><IdCard className="h-10 w-10 rounded-xl bg-blue-100 p-2 text-blue-600" /><span className="text-xs font-bold uppercase text-slate-500">Carta</span></div><div className="mt-8 text-2xl font-black">{driver.licenseNumber}</div><p className="text-sm text-slate-500">Categoria {driver.licenseCategory}</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><Calendar className="h-10 w-10 rounded-xl bg-orange-100 p-2 text-orange-600" /><span className="text-xs font-bold uppercase text-slate-500">Validade</span></div><div className="mt-8 text-2xl font-black">{formatDate(driver.licenseExpiryDate)}</div><p className="text-sm text-slate-500">{expiringDocuments} documento(s) a expirar</p></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><ShieldCheck className="h-10 w-10 rounded-xl bg-green-100 p-2 text-green-700" /><span className="text-xs font-bold uppercase text-slate-500">Disponibilidade</span></div><div className="mt-8 text-2xl font-black">{availability?.available === false ? "Indisponivel" : "Disponivel"}</div><p className="text-sm text-slate-500">{availability?.reason ?? `${availability?.absences.length ?? 0} ausencia(s) registada(s)`}</p></CardContent></Card>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_420px]">
        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle>Dados do Motorista</CardTitle></CardHeader>
          <CardContent className="grid gap-6 p-6 md:grid-cols-2">
            <Detail label="Nome completo" value={driver.fullName} />
            <Detail label="Telefone" value={driver.phone} />
            <Detail label="Morada" value={driver.address} />
            <Detail label="Nº de identificação" value={driver.idNumber} />
            <Detail label="Local de atividade" value={driver.activityLocation} />
            <Detail label="Estado" value={humanizeEnum(driver.status)} />
            <Detail label="Notas" value={driver.notes ?? "-"} wide />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-200"><CardTitle>Carta de Condução</CardTitle></CardHeader>
          <CardContent className="grid gap-6 p-6">
            <Detail label="Número da carta" value={driver.licenseNumber} />
            <Detail label="Categoria" value={driver.licenseCategory} />
            <Detail label="Data de emissão" value={formatDate(driver.licenseIssueDate)} />
            <Detail label="Data de validade" value={formatDate(driver.licenseExpiryDate)} />
          </CardContent>
        </Card>
      </section>

      <Card className="mt-8 overflow-hidden">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-200">
          <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> Documentos do Motorista</CardTitle>
          <Button variant="outline" asChild><Link href="/motoristas/novo">Adicionar Documento</Link></Button>
        </CardHeader>
        <Table>
          <TableHeader><TableRow><TableHead>Tipo</TableHead><TableHead>Número</TableHead><TableHead>Entidade</TableHead><TableHead>Categoria</TableHead><TableHead>Validade</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Ações</TableHead></TableRow></TableHeader>
          <TableBody>
            {documents.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-slate-500">Sem documentos registados.</TableCell></TableRow>
            ) : documents.map((doc) => (
              <TableRow key={doc.id ?? `${doc.documentType}-${doc.documentNumber}`}>
                <TableCell>{humanizeEnum(doc.documentType)}</TableCell>
                <TableCell className="text-slate-500">{doc.documentNumber ?? "-"}</TableCell>
                <TableCell className="text-slate-500">{doc.issuingEntity ?? "-"}</TableCell>
                <TableCell className="text-slate-500">{doc.category ?? "-"}</TableCell>
                <TableCell>{doc.expiryDate ? formatDate(doc.expiryDate) : "-"}</TableCell>
                <TableCell><StatusBadge variant={statusVariant(doc.status)}>{humanizeEnum(doc.status)}</StatusBadge></TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    {doc.fileId ? (
                      <Button type="button" variant="ghost" size="icon" onClick={() => void api.files.download(doc.fileId!, doc.documentNumber ?? doc.documentType)} aria-label="Descarregar documento">
                        <Download className="h-4 w-4" />
                      </Button>
                    ) : (
                      <span className="text-sm text-slate-400">-</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AppShell>
  );
}

function Detail({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return <div className={wide ? "md:col-span-2" : undefined}><div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-semibold text-slate-950">{value}</div></div>;
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("pt-PT");
}
