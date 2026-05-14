export type StatusVariant = "success" | "warning" | "danger" | "info" | "secondary" | "default";

const statusVariantMap: Record<string, StatusVariant> = {
  DISPONIVEL: "success",
  ATIVO: "success",
  ACTIVE: "success",
  PAID: "success",
  VALIDO: "success",
  CONCLUIDA: "success",
  OK: "success",
  EM_CURSO: "info",
  PLANEADA: "info",
  MEDIA: "info",
  INFO: "info",
  INDISPONIVEL: "secondary",
  INACTIVE: "secondary",
  CANCELADA: "secondary",
  CANCELLED: "secondary",
  BAIXA: "secondary",
  EM_MANUTENCAO: "warning",
  SUSPENSO: "warning",
  SUSPENDED: "warning",
  SUSPENSA: "warning",
  PENDENTE_RENOVACAO: "warning",
  AVISO: "warning",
  ALTA: "warning",
  EXPIRADO: "danger",
  ABATIDA: "danger",
  TERMINATED: "danger",
  CRITICO: "danger",
  CRITICA: "danger",
  AVARIA: "danger",
  FALTA: "danger",
};

export function statusVariant(status?: string | null): StatusVariant {
  if (!status) return "secondary";
  return statusVariantMap[status.toUpperCase()] ?? "secondary";
}

export function humanizeEnum(value?: string | null): string {
  if (!value) return "-";
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
