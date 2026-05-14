# TMS Enterprise Design System

> **Project:** Portal de Gestão Logística (TMS — Transport Management System)
> **ID:** `15094001487442902742`
> **Device:** Desktop
> **Language:** Portuguese (Portugal)

---

## Colors

### Core Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#0F172A` | Buttons, active states, links, headers |
| `primary-hover` | `#1E293B` | Button hover states |
| `primary_container` | `#131b2e` | Container backgrounds for primary emphasis |
| `on-primary` | `#ffffff` | Text on primary backgrounds |
| `on-primary-container` | `#7c839b` | Text on primary container |
| `secondary` | `#505f76` | Secondary buttons, less emphasis |
| `secondary_container` | `#d0e1fb` | Secondary container backgrounds |
| `on-secondary` | `#ffffff` | Text on secondary backgrounds |
| `on-secondary-container` | `#54647a` | Text on secondary container |
| `background` | `#F8FAFC` | Page background (slate gray) |
| `surface` | `#FFFFFF` | Cards, modals, drawers, surfaces |
| `border` | `#E2E8F0` | Borders, dividers, outlines |
| `text-primary` | `#0F172A` | Primary body text |
| `text-secondary` | `#64748B` | Secondary/muted text, subtitles |
| `muted` | `#F1F5F9` | Table headers, inactive tabs, muted fills |
| `success` | `#16A34A` | Positive states (active, valid, concluded) |
| `warning` | `#D97706` | Warning states (in maintenance, suspended) |
| `danger` | `#DC2626` | Destructive actions, error states |
| `info` | `#2563EB` | Informational states (planned, info alerts) |
| `error` | `#ba1a1a` | Error text |
| `error_container` | `#ffdad6` | Error container background |
| `on-error` | `#ffffff` | Text on error background |
| `on-error-container` | `#93000a` | Text on error container |
| `tertiary` | `#000000` | Pure black accent |
| `outline` | `#76777d` | Low-emphasis outlines |
| `outline_variant` | `#c6c6cd` | Subtle outlines |

### Semantic Color Mapping

| Context | Token |
|---|---|
| Primary action | `primary` |
| Success/Active | `success` |
| Warning/Attention | `warning` |
| Danger/Error | `danger` |
| Info | `info` |
| Neutral/Inactive | `text-secondary` |

### Elevation & Surface Layers

| Level | Token | Usage |
|---|---|---|
| 0 — Background | `background` (`#F8FAFC`) | Page backdrop |
| 1 — Cards | `surface` (`#FFFFFF`) + `border` + subtle shadow | KPI cards, panels |
| 2 — Modals/Drawers | `surface` with elevated shadow | Dialogs, drawers |
| 3 — Toasts/Popovers | `surface` with sharp borders | Floating overlays |

### Status Badge Colors

| State | Color |
|---|---|
| **DISPONÍVEL / ATIVO / CONCLUÍDA / VÁLIDO** | Green (`success`) |
| **INDISPONÍVEL / INATIVO / CANCELADA / EXPIRADO** | Gray (`text-secondary`) |
| **EM_MANUTENÇÃO / SUSPENSA / SUSPENSO** | Amber (`warning`) |
| **ABATIDA / CANCELADA** | Red (`danger`) |
| **PLANEADA / INFO** | Blue (`info`) |

---

## Typography

### Font Stack

| Role | Font Family |
|---|---|
| **Headlines / Page Titles** | IBM Plex Sans |
| **Body / Subtitles / Labels** | Inter |
| **KPIs / Numeric Values** | IBM Plex Sans |
| **Table Headers** | Inter |

### Type Scale

| Token | Font | Size | Weight | Line Height | Letter Spacing |
|---|---|---|---|---|---|
| `page-title` | IBM Plex Sans | 32px | 700 (Bold) | 1.2 | — |
| `subtitle` | Inter | 16px | 400 (Regular) | 1.5 | — |
| `kpi-value` | IBM Plex Sans | 24px | 600 (Semibold) | 1.0 | — |
| `table-header` | Inter | 13px | 600 (Semibold) | 1.5 | 0.02em |
| `body-base` | Inter | 14px | 400 (Regular) | 1.6 | — |
| `label-medium` | Inter | 13px | 500 (Medium) | 1.4 | — |

### Typography Hierarchy

```
Page Title (32px / Bold / IBM Plex Sans)
  Subtitle (16px / Regular / Inter / #64748B)

  KPI Value (24px / Semibold / IBM Plex Sans)
    KPI Label (13px / Medium / Inter)

    Section Heading (16px / Semibold / IBM Plex Sans)
      Body Text (14px / Regular / Inter)
      Table Header (13px / Semibold / Inter / uppercase)
      Table Cell (13-14px / Regular / Inter)
```

---

## Spacing

### Layout Constants

| Token | Value | Usage |
|---|---|---|
| `sidebar-width` | 260px | Expanded sidebar width |
| `sidebar-collapsed` | 72px | Collapsed sidebar (icons only) |
| `topbar-height` | 64px | Top navigation bar height |
| `container-max` | 1440px | Max content width |
| `gutter` | 1.5rem | Horizontal padding in content area |
| `card-padding` | 1.25rem | Internal card padding |
| `section-gap` | 2rem | Vertical gap between sections |

### Spacing Scale

Based on a custom scale derived from the design tokens:

| Token | rem | px | Usage |
|---|---|---|---|
| `spacing-1` | 0.25rem | 4px | Tight gaps, icon spacing |
| `spacing-2` | 0.5rem | 8px | Element inner spacing |
| `spacing-3` | 0.75rem | 12px | Badge padding, small gaps |
| `spacing-4` | 1rem | 16px | Standard element spacing |
| `spacing-5` | 1.25rem | 20px | Card padding |
| `spacing-6` | 1.5rem | 24px | Gutter, section inner spacing |
| `spacing-8` | 2rem | 32px | Section gaps |
| `spacing-12` | 3rem | 48px | Large section spacing |

### Border Radius

| Token | Value |
|---|---|
| `sm` | 0.25rem (4px) |
| `DEFAULT` | 0.5rem (8px) |
| `md` | 0.75rem (12px) |
| `lg` | 1rem (16px) |
| `xl` | 1.5rem (24px) |
| `full` | 9999px (pills) |

---

## Layout Rules

### App Shell (Base Layout)

```
┌──────────────────────────────────────────────────────────────┐
│ Topbar (64px): global search | alerts | user avatar + menu    │
├───────────────┬──────────────────────────────────────────────┤
│ Sidebar       │ Content Area                                 │
│ (260px /      │  max-width: 1440px                           │
│  72px         │  padding: 0 gutter                           │
│  collapsed)   │                                              │
│               │  ┌─ Breadcrumb ──────────────────────────┐   │
│               │  │   Painel > Viaturas                   │   │
│               │  ├─ PageHeader ──────────────────────────┤   │
│               │  │   Title + Subtitle + Actions           │   │
│               │  ├─ Content ─────────────────────────────┤   │
│               │  │   KPI Cards / Filters / Table / Form   │   │
│               │  └────────────────────────────────────────┘   │
└───────────────┴──────────────────────────────────────────────┘
```

### Sidebar

- **Position:** Fixed left
- **Width:** 260px expanded, 72px collapsed
- **Background:** `surface` (`#FFFFFF`) with right border
- **Items:** Icon + label, active state with primary highlight + left accent bar
- **Collapsible:** Toggle button, collapses to icon-only
- **Navigation items:** Painel, Viaturas, Motoristas, Atividades, Manutenções, Checklists, Alertas, Auditoria, Utilizadores, Recursos Humanos, Configurações

### Topbar

- **Position:** Fixed top
- **Height:** 64px
- **Contents:**
  - Global search with placeholder: "Pesquisar por matrícula, motorista ou atividade..."
  - Notification bell with critical alert counter
  - User info (name + role)
  - Avatar with initials
  - User dropdown: Perfil, Configurações, Terminar sessão
- **Background:** `surface` (`#FFFFFF`) with bottom border

### Content Area

- **Padding left:** 260px (or 72px when sidebar collapsed)
- **Padding top:** 64px
- **Max width:** 1440px
- **Internal padding:** `gutter` (1.5rem) horizontal

### Grid

- 12-column grid within content area
- KPI cards: 3 or 4 per row
- Form fields: 2-column layout within sections
- Filter bars: horizontal layout with wrap

### Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| >= 1280px | Full layout, expanded sidebar |
| 1024px – 1279px | Sidebar auto-collapses to icons, tables get horizontal scroll |
| < 1024px | Minimum supported width |

### Form Layout

- Fields grouped into logical sections with headings
- 2-column grid for fields within sections
- Single column for narrow or dependent fields
- Buttons (Guardar / Cancelar) fixed at bottom
- Inline validation errors below each field

---

## Reusable Components

### PageHeader

Used at the top of every page.

```
┌───────────────────────────────────────────────────────┐
│ Page Title (32px Bold)              [Action Button]   │
│ Subtitle (16px Regular / #64748B)   [Secondary]       │
│ Breadcrumb: Painel > Section                          │
└───────────────────────────────────────────────────────┘
```

**Props:** `title`, `subtitle`, `breadcrumb?`, `actions[]`

---

### KPI Card

```
┌───────────────────┐
│                   │
│     24            │  ← kpi-value (24px Semibold)
│   Alertas         │  ← label-medium (13px Medium / #64748B)
│   críticos        │
│                   │
└───────────────────┘
```

**Props:** `value`, `label`, `icon?`, `trend?`, `color?`

---

### DataTable

Professional table with:

- **Search input** (left, above table)
- **Filter chips / dropdowns** (inline, above table)
- **Sortable columns** (click header to toggle)
- **Pagination** (bottom)
- **StatusBadge** in state columns
- **Action menu** (3-dot menu per row)
- **States:** Loading (skeleton), Empty, Error, Forbidden

**Columns:** Variable per entity, always include "Ações" as last column.

---

### StatusBadge

```
 ┌──────────────┐
 │  DISPONÍVEL  │  ← uppercase, small, colored bg + darker text
 └──────────────┘
```

**Props:** `status`, `variant` (success/warning/danger/info/neutral)

Semantic mappings:

| Entity | States |
|---|---|
| Viatura | DISPONÍVEL, INDISPONÍVEL, EM_MANUTENÇÃO, ABATIDA |
| Motorista | ATIVO, INATIVO, SUSPENSO |
| Atividade | PLANEADA, EM_CURSO, SUSPENSA, CONCLUÍDA, CANCELADA |
| Documento | VÁLIDO, EXPIRADO, PENDENTE_RENOVAÇÃO, CANCELADO |
| Alerta | INFO, AVISO, CRÍTICO |
| Utilizador | ATIVO, INATIVO |
| Prioridade | BAIXA, NORMAL, ALTA, CRÍTICA |

---

### ConfirmDialog

```
┌───────────────────────────────────────────────┐
│  ⚠ Tem a certeza que pretende continuar?      │
│                                               │
│  Esta ação pode afetar o histórico            │
│  operacional e não deve ser executada         │
│  sem validação.                               │
│                                               │
│         [Cancelar]    [Confirmar]             │
└───────────────────────────────────────────────┘
```

Used before: delete, cancel activity, conclude activity, deactivate user, ignore alert.

---

### Toast

**Position:** Top-right corner
**Duration:** 5 seconds
**Content:** Icon + message text
**Types:** Success (green), Error (red), Warning (amber), Info (blue)

**Messages:**
- Success: "Viatura criada com sucesso." / "Alterações guardadas com sucesso."
- Error: "Não foi possível guardar as alterações." / "Existem campos obrigatórios por preencher."

---

### Drawer

Slides in from the right. Used for quick-view details (vehicle, driver, audit entry) without losing page context.

**Width:** ~480px
**Background:** `surface` (`#FFFFFF`)
**Overlay:** Semi-transparent backdrop

---

### Tabs

Used on detail pages with multiple sections.

**Style:** Underline-style tabs, active tab gets primary color underline.

**Usage:**
- Viatura Detalhe: Resumo, Documentos, Acessórios, Manutenções, Checklists, Atividades, Histórico
- Motorista Detalhe: Resumo, Documentos, Atividades, Disponibilidade, Histórico
- RH: Funções, Colaboradores, Pagamentos Salariais

---

### Wizard / Stepper

Used for multi-step flows like creating an activity.

**Steps indicator:** Top progress tracker with numbered steps
**Navigation:** Fixed footer with [Voltar] / [Continuar] or [Confirmar]

**New Activity Wizard (5 steps):**
1. Dados da atividade
2. Seleção de viatura
3. Seleção de motorista
4. Validação de alocação (blocker check)
5. Confirmação

---

### Form

Standard form pattern:

```
┌─ Section Heading ─────────────────────────────────┐
│                                                    │
│  Label *        [Input field]     Label *  [Input] │
│  [error msg]                      [error msg]      │
│                                                    │
│  Label *        [Select]          Label    [Input] │
│                                                    │
└────────────────────────────────────────────────────┘

         [Cancelar]    [Guardar]
```

**Rules:**
- Labels above inputs
- Mandatory fields marked with red asterisk
- Inline validation (error below field)
- Fields grouped in sections with headings
- 2-column grid layout

### Loading State (Skeleton)

Use skeleton placeholders for:
- KPI cards (pulsing gray blocks)
- Table rows (5 pulsing rows)
- Detail sections
- Tab content

### Empty State

```
┌───────────────────────────────────────┐
│                                       │
│           📋 (icon)                   │
│                                       │
│   Sem resultados encontrados.         │
│   Tente ajustar os filtros de         │
│   pesquisa.                           │
│                                       │
└───────────────────────────────────────┘
```

### Error State

```
┌───────────────────────────────────────┐
│                                       │
│           ❌ (icon)                   │
│                                       │
│   Não foi possível carregar os        │
│   dados. Tente novamente ou           │
│   contacte o administrador do         │
│   sistema.                            │
│                                       │
│           [Tentar novamente]          │
└───────────────────────────────────────┘
```

---

## Screen-to-Component Mapping

Each Stitch screen maps to a route + component in the final Next.js implementation.

| Screen | Screen Title | Route | Key Components | Description |
|---|---|---|---|---|
| `ec6f596f76e44895b0eac705c4da52cf` | Iniciar Sessão - TMS | `/login` | Form, illustration panel | Split-screen login page with Keycloak auth button |
| `f2b1a82c2dcd47f3b6bb94a60e8a9534` | Painel Principal - TMS | `/dashboard` | KpiCard, DataTable, StatusBadge, AlertCard | Operational dashboard with KPIs, active alerts, ongoing activities, quick actions |
| `aa26fb9b4f8844e0a062a5afd30234c2` | Gestão de Viaturas - TMS | `/vehicles` | PageHeader, DataTable, StatusBadge, FilterBar | Vehicle listing with search, filters, pagination |
| `8b9f96bb131948679af929deed802f84` | Detalhe da Viatura - AA-12-BB | `/vehicles/:id` | PageHeader, StatusBadge, Tabs, KpiCard, DataTable, Drawer | Consolidated vehicle detail with tabs for docs, accessories, maintenance, checklists, activities, history |
| `1a1a84f362664e84b2c3b84613a8cefd` | Nova Viatura - Cadastro com Documentação | `/vehicles/new` | Form, Section, FileUpload | Vehicle creation form with document upload |
| `2ad9e9e3daa24184a639c2842576349a` | Nova Viatura - Cadastro Completo com Acessórios | `/vehicles/new` (extended) | Form, Section, AccessoryChecklist | Extended vehicle form with accessories section |
| `a7ab073eba364812867c849b89b9150d` | Gestão de Motoristas - TMS | `/drivers` | PageHeader, DataTable, StatusBadge, FilterBar | Driver listing with search, filters, pagination |
| `e8b0669e1ba84171a72cb907976e2b75` | Novo Motorista - Cadastro com Documentação | `/drivers/new` | Form, Section, FileUpload | Driver creation form with document upload |
| `f596cca0c5a047938e7698dca8e4eb2a` | Novo Motorista - Cadastro com Documentação Específica | `/drivers/new` (variant) | Form, Section, FileUpload | Driver creation variant with specific document types |
| `99815ce5ac674747bea6be3be2cd00c7` | Nova Atividade - Validação de Alocação | `/activities/new` | Wizard, Stepper, ValidationChecklist | Activity creation wizard step 4 — allocation validation with pass/warn/block indicators |
| `00b065ee03c14e6195d2329f03521885` | Centro de Alertas - TMS | `/alerts` | PageHeader, FilterBar, AlertCard, StatusBadge | Alerts center grouped by severity (critical, warning, info) |
| `6c9e620c6e8c4b23b229818d95fe454f` | Gestão de Utilizadores - TMS | `/users` | PageHeader, DataTable, StatusBadge, FilterBar | User management with role-based access control |
| `682e2ad168f54730ba299647b1eaccd0` | Configurações de Sistema - TMS | `/settings` | PageHeader, DataTable, Section, Form | System settings for alert periods, checklist templates, maintenance params |
| `583b5edf99904ea78ca5284879d9bcb1` | Auditoria de Sistema - TMS | `/audit` | PageHeader, DataTable, FilterBar, Drawer | Audit log with entity/operation filtering and side-by-side diff view |
| `c53209020fb34d2cb26bbe724644ef45` | Recursos Humanos - TMS | `/hr` | PageHeader, Tabs, DataTable, KpiCard | HR module with tabs: Funções, Colaboradores, Pagamentos Salariais |
| `10035817419080595243` | Design-Google-Stitch-TMS.md | — | — | Design brief document (not a UI screen) |

### Component Reuse Map

| Component | Used In |
|---|---|
| `PageHeader` | Every page |
| `DataTable` | Vehicles, Drivers, Activities, Alerts, Users, Audit, HR, Config |
| `StatusBadge` | Every table, detail headers, KPI cards |
| `KpiCard` | Dashboard, Vehicle Detail, Driver Detail, HR |
| `ConfirmDialog` | Delete, Cancel, Conclude, Deactivate flows |
| `Toast` | All create/update/delete operations |
| `Drawer` | Quick-detail views (Vehicle, Driver, Audit entry) |
| `Tabs` | Vehicle Detail, Driver Detail, HR |
| `Wizard` | New Activity flow |
| `Form` | Vehicle create/edit, Driver create/edit, User create/edit, HR forms |
| `FilterBar` | Every listing page |
| `Skeleton` | All loading states |
| `EmptyState` | All listing pages |
| `ErrorState` | All data-fetching pages |
