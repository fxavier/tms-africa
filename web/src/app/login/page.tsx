"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, DoorOpen, Info, Lock, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/tms/Logo";
import { isAuthenticated, loginWithKeycloak } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  return (
    <div className="grid min-h-screen bg-white lg:grid-cols-[53%_47%]">
      <section className="flex flex-col px-8 py-8 md:px-20 lg:px-36">
        <Logo />

        <div className="mt-20 max-w-[520px]">
          <h1 className="text-4xl font-black tracking-[0.12em] text-slate-950">TMS</h1>
          <p className="mt-4 text-xl font-medium text-slate-500">Gestão de Transportes e Logística</p>
          <p className="mt-8 max-w-[420px] text-base leading-7 text-slate-500">
            Controlo operacional, conformidade documental e rastreabilidade numa única plataforma.
          </p>

          <form
            className="mt-14 space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              void loginWithKeycloak();
            }}
          >
            <label className="block text-sm font-semibold text-slate-900">
              Utilizador
              <Input className="mt-2 h-14 text-base" placeholder="ex: manuel.silva@logitrack.pt" />
            </label>
            <label className="block text-sm font-semibold text-slate-900">
              <span className="flex items-center justify-between">
                Palavra-passe
                <Link href="#" className="text-sm font-semibold text-blue-600">Esqueci-me da password</Link>
              </span>
              <Input className="mt-2 h-14 text-base" type="password" placeholder="********" />
            </label>
            <Button type="submit" className="h-14 w-full text-base">
              <DoorOpen className="h-5 w-5" /> Iniciar sessão
            </Button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Ainda não tem conta?{" "}
            <Link href="/register" className="font-semibold text-blue-600">
              Criar conta
            </Link>
          </p>

          <div className="my-10 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-sm font-bold uppercase tracking-[0.25em] text-slate-500">Ou aceda via SSO</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <Button variant="outline" className="h-14 w-full text-base" onClick={() => void loginWithKeycloak()}>
            <Info className="h-5 w-5" /> Iniciar sessão com Keycloak
          </Button>
        </div>

        <footer className="mt-auto flex gap-10 pt-12 text-sm font-medium text-slate-500">
          <span>© 2024 LogiTrack Pro</span>
          <Link href="#">Termos de Serviço</Link>
          <Link href="#">Privacidade</Link>
        </footer>
      </section>

      <section className="hidden items-center justify-center overflow-hidden bg-slate-950 p-10 text-white lg:flex bg-logistics-grid">
        <div className="relative w-full max-w-[720px]">
          <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full border border-slate-700/60" />
          <div className="relative rounded-3xl border border-slate-700 bg-slate-900/70 p-8 shadow-2xl backdrop-blur">
            <div className="h-[300px] overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
              <div className="relative h-full bg-[radial-gradient(circle_at_50%_20%,rgba(148,163,184,.32),transparent_38%),linear-gradient(115deg,#020617,#0f172a_60%,#111827)]">
                <div className="absolute bottom-0 left-0 right-0 h-36 bg-gradient-to-t from-slate-950 to-transparent" />
                <div className="absolute left-1/2 top-12 h-52 w-80 -translate-x-1/2 rounded-t-full border-x border-t border-slate-600/40" />
                <div className="absolute inset-x-16 bottom-20 grid grid-cols-6 gap-5">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="h-24 rounded-t-lg bg-slate-700/40 shadow-[0_0_35px_rgba(148,163,184,.22)]" />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute bottom-14 left-16 right-16 flex items-center justify-between rounded-2xl border border-slate-600 bg-slate-800/90 p-7 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-green-500/20 text-green-400">
                  <BarChart3 className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-300">Eficiência Operacional</div>
                  <div className="text-2xl font-black">+24% este mês</div>
                </div>
              </div>
              <div className="h-14 w-px bg-slate-600" />
              <div>
                <div className="text-sm font-semibold text-slate-300">Carga em Trânsito</div>
                <div className="text-2xl font-black">1.240 ton</div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-slate-300">
            <Truck className="h-5 w-5" /> Plataforma operacional segura com autenticação centralizada
            <Lock className="h-4 w-4" />
          </div>
        </div>
      </section>
    </div>
  );
}
