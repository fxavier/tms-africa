"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { completeKeycloakLogin, setStoredUser } from "@/lib/auth";
import { api } from "@/lib/api";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (!code) {
      setError("Callback Keycloak sem codigo de autorizacao.");
      return;
    }

    completeKeycloakLogin(code, state)
      .then(async () => {
        const me = await api.users.me();
        setStoredUser(me);
        router.replace("/dashboard");
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Falha no login Keycloak."));
  }, [router]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-black text-slate-950">Autenticacao Keycloak</h1>
        <p className="mt-3 text-slate-500">{error ?? "A validar a sessao e a preparar o acesso ao TMS..."}</p>
      </div>
    </main>
  );
}
