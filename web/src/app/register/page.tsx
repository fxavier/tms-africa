"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/tms/Logo";
import { isAuthenticated, registerWithKeycloak } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated()) router.replace("/dashboard");
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 shadow-soft">
        <Logo />
        <h1 className="mt-8 text-3xl font-black text-slate-950">Criar conta</h1>
        <p className="mt-3 text-slate-600">
          O registo é realizado pelo Keycloak (Authorization Code + PKCE) para manter a gestão de identidade centralizada.
        </p>

        <Button className="mt-8 h-12 w-full" onClick={() => void registerWithKeycloak()}>
          <UserPlus className="h-5 w-5" /> Registar com Keycloak
        </Button>

        <p className="mt-6 text-center text-sm text-slate-600">
          Já tem conta?{" "}
          <Link href="/login" className="font-semibold text-blue-600">
            Iniciar sessão
          </Link>
        </p>
      </section>
    </main>
  );
}
