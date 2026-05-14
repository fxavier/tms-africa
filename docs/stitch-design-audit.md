# Stitch Design Audit — Portal de Gestão Logística

## Project
- **Stitch Project:** Portal de Gestão Logística (`15094001487442902742`)
- **Stitch Branding:** "LogiTrack Pro TMS" (not just "TMS")
- **Frontend:** `/frontend` (Next.js 15 + App Router)

## Screen-to-Route Mapping

| Stitch Screen ID | Title | Next.js Route | Refactor Status |
|---|---|---|---|
| `ec6f596f...` | Iniciar Sessão - TMS | `/login` | DONE |
| `f2b1a82c...` | Painel Principal - TMS | `/dashboard` | DONE |
| `aa26fb9b...` | Gestão de Viaturas - TMS | `/vehicles` | NEEDS REFACTOR |
| `8b9f96bb...` | Detalhe da Viatura - AA-12-BB | `/vehicles/[id]` | NEEDS REFACTOR |
| `1a1a84f3...` | Nova Viatura - Cadastro com Documentação | `/vehicles/new` | NEEDS REFACTOR |
| `a7ab073e...` | Gestão de Motoristas - TMS | `/drivers` | DONE |
| `e8b0669e...` | Novo Motorista - Cadastro com Documentação | `/drivers/new` | NEEDS REFACTOR |
| `99815ce5...` | Nova Atividade / Validação de Alocação | `/activities/new` | MINOR |
| `00b065ee...` | Centro de Alertas - TMS | `/alerts` | DONE |
| `6c9e620c...` | Gestão de Utilizadores - TMS | `/users` | NEEDS REFACTOR |
| `682e2ad1...` | Configurações de Sistema - TMS | `/settings` | NEEDS REFACTOR |
| `583b5edf...` | Auditoria de Sistema - TMS | `/audit` | NEEDS REFACTOR |
| `c5320902...` | Recursos Humanos - TMS | `/hr` | NEEDS REFACTOR |

## Global Visual Differences

### Sidebar
- **Stitch:** Nav items grouped into "Operações" (Painel, Viaturas, Motoristas, Atividades, Manutenções, Checklists) and "Administração" (Alertas, Auditoria, Utilizadores, Recursos Humanos, Configurações). "Suporte" and "Sair" at bottom.
- **Current:** Flat list without groupings.

### Topbar
- **Stitch:** Search input, "Suporte Técnico Online" (or "Suporte Técnico"), HelpCircle, notifications, user avatar + name + role.
- **Current:** Has search, Suporte Técnico (needs verified).

### KPI / Metric Cards
- **Stitch:** Trend indicator badges (+2 hoje, +5.2%), subtitle text, colored icon backgrounds.
- **Current:** Has trend prop (mostly OK).

### DataTable
- **Stitch:** Uppercase column headers with tracking, 3-dot "more_vert" action menu, pagination with page numbers, avatar initials in first column.
- **Current:** Needs pagination verified, 3-dot menu.

### StatusBadge Labels
- **Stitch:** Human-readable: "Ativo", "Inativo", "Pendente", "Pago", "Disponível", "Em Manutenção", "Em Rota", "Crítico", "Aviso", "Info".
- **Current:** Already mapped.

### Form Pages
- **Stitch:** Two-column layouts, document upload sections, info/warning banners, file upload with cloud_upload icon.
- **Current:** Single column layout, no document upload section.

## Per-Page Differences

### Vehicles List
- **Stitch:** 4 KPI cards, filter chips (Todos os Estados / Disponível / Em Manutenção / Em Rota), table with 📍 prefix on Local, pagination. "Seguro de Frota" info card at bottom.
- **Current:** Has KPIs and filter chips. Needs 📍 icon on local column, needs bottom info card, needs pagination verified.

### Vehicle Detail
- **Stitch:** Left column with 5 summary cards (Estado Operacional 94%, Documentos a Expirar 02, Próxima Manutenção 2.450km, Última Localização GPS, Notas Internas). Right column with tabs. Driver assignment section in Resumo tab.
- **Current:** Has left sidebar and tabs. Verify subtitle prop works with ReactNode.

### New Vehicle
- **Stitch:** Two main sections: "Dados Cadastrais" (left form column) and "Documentação da Frota" (right column with document upload rows). Warning banner at bottom. Success modal on save.
- **Current:** Single section form. Needs complete redesign.

### New Driver
- **Stitch:** Photo upload, "Dados Pessoais e Profissionais" form, "Documentos do Motorista" with multiple upload rows. "Resumo de Validação" card showing progress. Save draft/finalize buttons.
- **Current:** Simple form. Needs complete redesign.

### Users List
- **Stitch:** 4 KPI cards, filter dropdowns (Roles, States), table with avatar+name+location+username/email columns, role badge, status badge, last access with IP. "Política de Segurança" and "Auditoria de Logins" info cards at bottom.
- **Current:** Different columns. Needs KPIs, filters, info cards.

### Settings
- **Stitch:** Three sections: "Períodos de Alerta Operacional" (table with aviso/critical/recipients columns + add button), "Preferências Gerais da Plataforma" (timezone, units, dark mode, weekly reports toggles), "Gestão de Templates de Checklist" (card-based template list with search, create button). Footer with version info.
- **Current:** Simple flat tables. Needs complete redesign.

### Audit
- **Stitch:** 2 KPI cards, filter (Entidade dropdown, Período dropdown), table with DATA/HORA, UTILIZADOR (avatar), ENTIDADE (icon+name), OPERAÇÃO (colored badge), ID ENTIDADE, IP ADDRESS columns. Info cards at bottom about security. "Detalhes da Transação" drawer.
- **Current:** Simple table. Needs KPIs, filters, info cards.

### HR
- **Stitch:** 4 KPI cards, 3 tabs (Colaboradores, Funções, Pagamentos Salariais), payment table with avatar+name+role, month/year, value, estado badge, data processamento, actions. Filter dropdowns and action buttons.
- **Current:** Has tabs. Needs KPIs, pagination, proper table columns.

## Refactor Plan

### Phase 1: Layout & Shared
1. Sidebar nav groupings
2. Topbar polish  
3. Verify all shared components

### Phase 2: Pages
4. Vehicles list
5. Vehicle detail
6. New Vehicle form
7. New Driver form
8. Users list
9. Settings
10. Audit
11. HR

### Phase 3: Verification
12. Run TypeScript typecheck
13. Fix any errors
