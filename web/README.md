# LogiTrack Pro — TMS Frontend

Sistema web enterprise para **Transport Management System**, implementado com **Next.js App Router**, **TypeScript**, **TailwindCSS** e componentes no padrão **shadcn/ui**.

## O que está implementado

- Login com layout split e botão SSO Keycloak
- Layout autenticado com sidebar fixa, topbar, pesquisa global e perfil do utilizador
- Painel principal com KPIs, atividades, ações rápidas e alertas
- Gestão de viaturas: listagem, detalhe consolidado e registo de nova viatura
- Gestão de motoristas: listagem e registo de novo motorista
- Listagem de atividades e wizard completo de nova atividade com definição, rota/carga, alocação, validação e confirmação
- Gestão de alertas por severidade
- Auditoria do sistema com painel lateral de detalhes
- Gestão de utilizadores e registo de novo utilizador com roles e permissões efetivas
- Recursos Humanos com pagamentos salariais e registo de novo colaborador
- Configurações operacionais, registo de regras, manutenção e templates de checklist
- Manutenções com listagem, registo e detalhe completo
- Checklists com listagem e formulário de submissão com itens críticos
- Componentes reutilizáveis: `AppShell`, `Sidebar`, `Topbar`, `PageHeader`, `StatCard`, `StatusBadge`, `Pagination`, `FormField`, `Button`, `Card`, `Input`, `Select`, `Table`, `Badge`, `Avatar`

## Rotas principais

```txt
/login
/dashboard
/viaturas
/viaturas/detalhe
/viaturas/nova
/motoristas
/motoristas/novo
/atividades
/atividades/nova
/alertas
/auditoria
/utilizadores
/utilizadores/novo
/recursos-humanos
/recursos-humanos/novo
/configuracoes
/configuracoes/novo
/manutencoes
/manutencoes/nova
/manutencoes/detalhe
/checklists
/checklists/nova
```

## Como executar

```bash
npm install
npm run dev
```

Depois abra:

```txt
http://localhost:3000/login
```

## Estrutura

```txt
src/
  app/                 Rotas Next.js App Router
  components/
    layout/            Shell, sidebar e topbar
    tms/               Componentes de domínio visual do TMS
    ui/                Componentes base estilo shadcn/ui
  config/              Navegação e configuração estática
  hooks/               Hooks de integração com a API
  lib/                 Utilitários
```

## Próximos passos recomendados

1. Ligar os formulários de criação/edição aos métodos já disponíveis em `src/lib/api.ts`.
2. Adicionar `react-hook-form` e validação com `zod`.
3. Adicionar testes de componentes e fluxos críticos.
4. Implementar RBAC visual para esconder menus e ações por perfil.
