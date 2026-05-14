import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import type { StatusVariant } from "@/types/status";

export function StatusBadge({ children, variant = "secondary" }: { children: ReactNode; variant?: StatusVariant }) {
  return <Badge variant={variant}>{children}</Badge>;
}
