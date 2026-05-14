"use client";

import { useEffect, useState, type DependencyList } from "react";
import { ApiClientError } from "@/lib/api";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  unauthorized: boolean;
}

export function useApiResource<T>(loader: () => Promise<T>, deps: DependencyList = []) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: true,
    error: null,
    unauthorized: false,
  });

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setState((current) => ({ ...current, loading: true, error: null, unauthorized: false }));
      try {
        const data = await loader();
        if (!cancelled) setState({ data, loading: false, error: null, unauthorized: false });
      } catch (error) {
        const unauthorized = error instanceof ApiClientError && error.status === 401;
        const message = error instanceof Error ? error.message : "Erro inesperado ao consultar a API.";
        if (!cancelled) setState({ data: null, loading: false, error: message, unauthorized });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, deps);

  return state;
}
