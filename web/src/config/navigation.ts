import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CarFront,
  CheckSquare,
  Gauge,
  ListTodo,
  Settings,
  ShieldCheck,
  Truck,
  UserCog,
  Users,
  Wrench,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  group?: string;
}

export const navItems: NavItem[] = [
  { label: "Painel", href: "/dashboard", icon: Gauge },
  { label: "Viaturas", href: "/viaturas", icon: Truck },
  { label: "Motoristas", href: "/motoristas", icon: UserCog },
  { label: "Atividades", href: "/atividades", icon: ListTodo, group: "Operações" },
  { label: "Manutenções", href: "/manutencoes", icon: Wrench },
  { label: "Checklists", href: "/checklists", icon: CheckSquare },
  { label: "Alertas", href: "/alertas", icon: AlertTriangle },
  { label: "Auditoria", href: "/auditoria", icon: ShieldCheck },
  { label: "Utilizadores", href: "/utilizadores", icon: Users, group: "Administração" },
  { label: "Recursos Humanos", href: "/recursos-humanos", icon: CarFront },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
