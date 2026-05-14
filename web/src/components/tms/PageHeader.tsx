import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        {eyebrow && <div className="mb-2 text-sm font-semibold text-slate-500">{eyebrow}</div>}
        <h1 className="text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-3xl text-base text-slate-500 md:text-lg">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-3">{actions}</div>}
    </div>
  );
}
