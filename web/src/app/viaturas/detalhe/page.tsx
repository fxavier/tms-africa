import Link from "next/link";
import { Calendar, Download, Eye, FileText, MapPin, MoreVertical, Pencil, Plus, ShieldCheck, Truck, Upload, Wrench } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { StatusBadge } from "@/components/tms/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const docs = [
  { type: "Seguro de Responsabilidade Civil", number: "AP-827364112", entity: "Fidelidade Seguros", date: "15 Jan 2025", status: "VÁLIDO", variant: "success" as const },
  { type: "Inspeção Periódica (IPO)", number: "IPO-2024-998", entity: "Centro Inspeção Sul", date: "12 Out 2024", status: "EXPIRA EM BREVE", variant: "warning" as const },
  { type: "Livrete Eletrónico", number: "REG-982-BB", entity: "IMT - Portal", date: "N/A", status: "VÁLIDO", variant: "success" as const },
];

const accessories = [
  ["Macaco Hidráulico", "Verificado há 5 dias", "success"],
  ["Extintor (6kg)", "Validade: Set 2025", "success"],
  ["Triângulo Sinal.", "Ausente ou Danificado", "danger"],
  ["Coletes Reflet.", "2 Unidades (OK)", "success"],
] as const;

export default function VehicleDetailPage() {
  return (
    <AppShell>
      <div className="mb-4 text-sm font-medium text-slate-500">Viaturas &nbsp;&gt;&nbsp; <span className="text-slate-950">Detalhes da Viatura</span></div>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black tracking-tight text-slate-950">AA-12-BB</h1>
            <StatusBadge variant="success">Disponível</StatusBadge>
          </div>
          <p className="mt-3 flex items-center gap-2 text-lg text-slate-500"><MapPin className="h-5 w-5" /> Terminal de Carga Alverca, Lisboa</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Pencil className="h-4 w-4" /> Editar Viatura</Button>
          <Button asChild><Link href="/atividades/nova"><Plus className="h-4 w-4" /> Novo Serviço</Link></Button>
        </div>
      </div>

      <section className="grid gap-6 md:grid-cols-3">
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><ShieldCheck className="h-10 w-10 rounded-xl bg-slate-100 p-2" /><span className="text-xs font-bold uppercase text-slate-500">Estado operacional</span></div><div className="mt-8 text-3xl font-black">94%</div><p className="text-sm text-slate-500">Eficiência de frota no mês corrente</p><div className="mt-4 h-1.5 rounded-full bg-slate-100"><div className="h-full w-[94%] rounded-full bg-slate-950" /></div></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><FileText className="h-10 w-10 rounded-xl bg-orange-100 p-2 text-orange-600" /><span className="text-xs font-bold uppercase text-slate-500">Documentos a expirar</span></div><div className="mt-8 text-3xl font-black text-orange-600">02</div><p className="text-sm text-slate-500">Seguro de Carga e IPO vencem em 15 dias</p><Link href="#docs" className="mt-4 block text-sm font-bold underline">Ver documentos</Link></CardContent></Card>
        <Card><CardContent className="p-6"><div className="flex items-start justify-between"><Calendar className="h-10 w-10 rounded-xl bg-blue-100 p-2 text-blue-600" /><span className="text-xs font-bold uppercase text-slate-500">Próxima manutenção</span></div><div className="mt-8 text-3xl font-black">2.450 km</div><p className="text-sm text-slate-500">Estimada para 12 de Outubro de 2024</p><StatusBadge variant="secondary">Tipo: Preventiva</StatusBadge></CardContent></Card>
      </section>

      <Card className="mt-8 overflow-hidden">
        <div className="flex gap-8 border-b border-slate-200 px-6 text-sm font-medium text-slate-500">
          {["Resumo", "Documentos", "Acessórios", "Manutenções", "Checklists", "Histórico"].map((tab, index) => (
            <div key={tab} className={index === 0 ? "border-b-2 border-slate-950 py-5 text-slate-950" : "py-5"}>{tab}</div>
          ))}
        </div>
        <CardContent className="p-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_430px]">
            <section>
              <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Dados Cadastrais</h3>
              <div className="mt-6 grid gap-6 md:grid-cols-2">
                {["Marca / Modelo|Volvo FH 500 Globetrotter", "Ano de Registo|2023", "Número de Quadro|VIN92837492837461", "Combustível|Diesel / AdBlue", "Quilometragem Atual|142.600 KM", "Categoria|Pesado de Mercadorias"].map((item) => {
                  const [label, value] = item.split("|");
                  return <div key={label}><div className="text-xs font-black uppercase tracking-widest text-slate-500">{label}</div><div className="mt-1 font-semibold">{value}</div></div>;
                })}
              </div>
            </section>
            <section>
              <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Atribuição Atual</h3>
              <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-100 p-5">
                <div className="flex items-center gap-4"><Avatar name="Ricardo Fernandes" /><div><b>Ricardo Fernandes</b><p className="text-sm text-slate-500">Motorista Principal • Há 8 meses</p></div></div>
                <MoreVertical className="h-5 w-5" />
              </div>
              <div className="mt-6 rounded-2xl bg-slate-950 p-5 text-white"><div className="text-xs font-bold uppercase text-slate-500">Última Atividade</div><b>Rota: Lisboa - Porto (A1)</b><p className="text-sm text-slate-400">Concluído em 22 de Setembro • 08:45</p></div>
            </section>
          </div>

          <section id="docs" className="mt-12">
            <div className="mb-5 flex items-center justify-between"><h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Documentação de Frota</h3><Button variant="link"><Upload className="h-4 w-4" /> Carregar Novo</Button></div>
            <Table>
              <TableHeader><TableRow><TableHead>Tipo de Documento</TableHead><TableHead>Número/Apólice</TableHead><TableHead>Entidade</TableHead><TableHead>Data Expiração</TableHead><TableHead>Estado</TableHead><TableHead>Ações</TableHead></TableRow></TableHeader>
              <TableBody>{docs.map((doc) => <TableRow key={doc.number}><TableCell>{doc.type}</TableCell><TableCell className="text-slate-500">{doc.number}</TableCell><TableCell className="text-slate-500">{doc.entity}</TableCell><TableCell className={doc.variant === "warning" ? "font-bold text-red-600" : ""}>{doc.date}</TableCell><TableCell><StatusBadge variant={doc.variant}>{doc.status}</StatusBadge></TableCell><TableCell><div className="flex gap-3"><Eye className="h-5 w-5" /><Download className="h-5 w-5" /></div></TableCell></TableRow>)}</TableBody>
            </Table>
          </section>

          <section className="mt-10">
            <h3 className="border-l-4 border-slate-950 pl-3 text-lg font-black">Checklist de Acessórios Obrigatórios</h3>
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              {accessories.map(([title, subtitle, variant]) => (
                <div key={title} className="rounded-xl border border-slate-200 p-4"><div className="flex items-center gap-3"><StatusBadge variant={variant as any}>{variant === "danger" ? "!" : "✓"}</StatusBadge><div><b className="text-sm">{title}</b><p className="text-xs text-slate-500">{subtitle}</p></div></div></div>
              ))}
            </div>
          </section>
        </CardContent>
      </Card>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="overflow-hidden"><CardHeader className="flex-row items-center justify-between"><CardTitle>Última Localização GPS</CardTitle><span className="text-sm text-slate-500">Atualizado há 2 minutos</span></CardHeader><div className="relative h-[270px] fake-map"><div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-xl bg-white p-4 shadow-soft"><div><b>Armazém Central Alverca</b><p className="text-sm text-slate-500">Estrada Nacional 10, Alverca do Ribatejo</p></div><Button size="sm">Abrir no Google Maps</Button></div></div></Card>
        <Card><CardHeader><CardTitle>Notas Internas</CardTitle></CardHeader><CardContent className="space-y-4"><div className="rounded-xl bg-slate-50 p-4 text-sm"><b>20 Set 2024 • Admin</b><p className="mt-2 text-slate-600">Viatura reservada para a rota internacional de Outubro.</p></div><div className="rounded-xl bg-slate-50 p-4 text-sm"><b>15 Set 2024 • Manutenção</b><p className="mt-2 text-slate-600">Substituição da lâmpada do farol esquerdo efetuada.</p></div></CardContent></Card>
      </section>
    </AppShell>
  );
}
