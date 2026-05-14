# Implementacao Web Integrada ao Backend

## Objetivo

Este documento descreve a implementacao da camada web do TMS Africa e a forma como ela deve consumir o backend Spring Boot existente, sem dados mockados no frontend. A referencia principal da integracao e o backend real em `src/main/java/pt/xavier/tms`, com respostas no envelope `ApiResponse<T>` e listagens paginadas em `PagedResponse<T>`.

O frontend fica responsavel por:

- Autenticar o utilizador no Keycloak via Authorization Code + PKCE.
- Guardar o `access_token` no browser e envia-lo como `Authorization: Bearer <token>`.
- Consumir os endpoints reais `/api/v1/**`.
- Renderizar estados de carregamento, erro, sessao expirada e dados vazios.
- Remover dependencias de `src/data/mock.ts`.

## Estado Implementado

A implementacao web passa a ter estes pontos centrais:

- `web/src/lib/contracts.ts`: tipos TypeScript alinhados com os DTOs Java do backend.
- `web/src/lib/api.ts`: cliente HTTP unico, com tratamento de `ApiResponse<T>`, erros de negocio e token Bearer.
- `web/src/lib/auth.ts`: login Keycloak com PKCE, callback OAuth, armazenamento de tokens e logout.
- `web/src/hooks/useApiResource.ts`: hook client-side para carregar recursos autenticados.
- `web/src/components/tms/ApiFeedback.tsx`: estados visuais de loading, erro e login expirado.
- `web/src/config/navigation.ts`: navegacao estatica retirada do antigo ficheiro de mocks.
- `web/src/types/status.ts`: normalizacao de enums do backend para labels e variantes visuais.

O ficheiro `web/src/data/mock.ts` foi removido. As paginas principais que antes importavam mocks agora consultam o backend:

- `/dashboard`: viaturas, motoristas, atividades e alertas.
- `/viaturas`: `GET /api/v1/vehicles`.
- `/motoristas`: `GET /api/v1/drivers`.
- `/atividades`: `GET /api/v1/activities`, mais lookup de viaturas e motoristas.
- `/alertas`: `GET /api/v1/alerts`.
- `/auditoria`: `GET /api/v1/audit`.
- `/utilizadores`: `GET /api/v1/users/me`.
- `/recursos-humanos`: colaboradores e pagamentos salariais.
- `/configuracoes`: configuracoes de alerta e templates de checklist.

## Configuracao

Criar `web/.env.local` com:

```env
NEXT_PUBLIC_TMS_API_BASE_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:8081
NEXT_PUBLIC_KEYCLOAK_REALM=tms
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=tms-web
# Opcional em desenvolvimento local. Se omitido, usa a origem ativa do browser.
# NEXT_PUBLIC_KEYCLOAK_REDIRECT_URI=http://localhost:3000/auth/callback
```

O backend ja esta configurado para validar JWTs do realm `tms`:

```yaml
spring.security.oauth2.resourceserver.jwt.issuer-uri: http://localhost:8081/realms/tms
spring.security.oauth2.resourceserver.jwt.jwk-set-uri: http://localhost:8081/realms/tms/protocol/openid-connect/certs
```

O CORS do backend permite `http://localhost:*`, por isso o Next em `localhost:3000` consegue chamar o Spring Boot em `localhost:8080`.

## Keycloak

O frontend usa o fluxo recomendado para SPA:

1. `/login` gera `code_verifier`, `code_challenge` e `state`.
2. O browser e redirecionado para:
   `/realms/tms/protocol/openid-connect/auth`.
3. O Keycloak redireciona para `/auth/callback?code=...&state=...`.
4. O frontend troca o codigo no endpoint:
   `/realms/tms/protocol/openid-connect/token`.
5. O `access_token` e usado em todas as chamadas `fetch`.

No logout, o frontend nunca envia `refresh_token` por query string. O fluxo correto e:

1. Revogar o refresh token com `POST /realms/tms/protocol/openid-connect/revoke`.
2. Limpar `localStorage`/`sessionStorage`.
3. Redirecionar para `/protocol/openid-connect/logout` usando apenas `client_id` e `post_logout_redirect_uri`, sem tokens na URL.

Para criacao de conta, `/register` usa o endpoint Keycloak:
`/realms/tms/protocol/openid-connect/registrations`.
O realm precisa ter user registration permitido; caso contrario o Keycloak devolve erro antes de redirecionar para o frontend.

No Keycloak deve existir:

- Realm: `tms`.
- Client publico: `tms-web`.
- Standard Flow ligado.
- PKCE S256 obrigatorio ou permitido.
- Redirect URIs locais: `http://localhost:3000/auth/callback` e `http://localhost:3001/auth/callback`, ou `http://localhost:*/auth/callback` em desenvolvimento.
- Web origins locais: `http://localhost:3000` e `http://localhost:3001`, ou `http://localhost:*` em desenvolvimento.
- Roles de realm usadas pelo backend: `ADMIN`, `SUPERUSER`, `GESTOR_FROTA`, `OPERADOR`, `AUDITOR`, `GESTOR_RH`, `MOTORISTA`, `RH_INTEGRADOR`.

O backend converte `realm_access.roles` para authorities `ROLE_*`, portanto as roles devem estar no token JWT como roles de realm.

## Contratos Consumidos

O cliente `api.ts` cobre os controllers reais:

| Modulo | Endpoints frontend |
| --- | --- |
| Viaturas | `GET/POST /vehicles`, `GET /vehicles/search`, `GET/PUT/PATCH/DELETE /vehicles/{id}`, `GET /vehicles/{id}/consolidated` |
| Documentos de viatura | `GET/POST /vehicles/{id}/documents`, `PUT/DELETE /vehicles/{id}/documents/{docId}` |
| Manutencoes | `GET/POST /vehicles/{id}/maintenance` |
| Checklists | `GET/POST /vehicles/{id}/checklists`, `GET/POST/PUT /checklist-templates` |
| Motoristas | `GET/POST /drivers`, `GET/PUT/PATCH/DELETE /drivers/{id}`, `GET /drivers/{id}/availability` |
| Documentos de motorista | `GET/POST /drivers/{id}/documents`, `PUT /drivers/{id}/documents/{docId}` |
| Atividades | `GET/POST /activities`, `GET/PUT/DELETE /activities/{id}`, `POST /activities/{id}/allocate`, `PATCH /activities/{id}/status`, `GET /activities/{id}/events` |
| Alertas | `GET /alerts`, `GET /alerts/{id}`, `PATCH /alerts/{id}/resolve` |
| Configuracoes de alerta | `GET /alert-configurations`, `PUT /alert-configurations/{id}` |
| Auditoria | `GET /audit`, `GET /audit/{id}` |
| RH | colaboradores, funcoes, pagamentos e estado de pagamentos em `/hr/**` |
| Utilizadores | `POST /users`, `PATCH /users/{id}/disable`, `GET /users/me` |
| Ficheiros | `POST /files`, `GET /files/{id}` |

Todas as chamadas JSON usam:

```http
Accept: application/json
Content-Type: application/json
Authorization: Bearer <access_token>
```

Uploads usam `FormData` e nao definem manualmente `Content-Type`.

## Lacunas Reais do Backend

O frontend anterior tinha uma pagina de listagem completa de utilizadores. O backend real em `UserController` atualmente expoe apenas:

- `POST /api/v1/users`
- `PATCH /api/v1/users/{id}/disable`
- `GET /api/v1/users/me`

Assim, `/utilizadores` foi ajustado para consumir o contrato existente (`/users/me`) em vez de manter uma tabela mockada. Para voltar a ter administracao completa de utilizadores no frontend, o backend precisa expor listagem, detalhe, atualizacao, enable e reset de password, ou disponibilizar um endpoint seguro que encapsule o Keycloak Admin API.

## Regras de Implementacao de Paginas

1. Paginas autenticadas devem ser componentes client-side quando dependerem do token do browser.
2. Cada pagina deve chamar `api.<modulo>.<acao>()`, nunca `fetch` direto.
3. Cada listagem deve usar `PagedResponse<T>` e respeitar `page` e `size`.
4. Estados de erro devem mostrar a mensagem do backend (`error.message`) quando existir.
5. `401` deve orientar o utilizador de volta a `/login`.
6. Enums do backend devem ser renderizados com `humanizeEnum` e variantes visuais via `statusVariant`.

## Formularios

Os metodos de escrita ja existem em `api.ts`, mas os formularios das rotas `*/nova` e `*/novo` devem ser ligados aos contratos DTO antes de serem considerados completos:

- `/viaturas/nova` -> `api.vehicles.create(VehicleCreateDto)`
- `/motoristas/novo` -> `api.drivers.create(DriverCreateDto)`
- `/atividades/nova` -> `api.activities.create(ActivityCreateDto)` e `api.activities.allocate(...)`
- `/recursos-humanos/novo` -> `api.hr.employees.create(EmployeeCreateDto)`
- `/utilizadores/novo` -> `api.users.create(UserCreateDto)`
- `/configuracoes/novo` -> `api.checklistTemplates.create(...)`
- `/checklists/nova` -> `api.vehicles.checklists.submit(...)`
- `/manutencoes/nova` -> `api.vehicles.maintenance.create(...)`

Recomendacao: adicionar `react-hook-form` e `zod` para validar no frontend os mesmos campos obrigatorios dos DTOs Java.

## Execucao Local

Backend e infraestrutura:

```bash
docker compose up -d postgres keycloak
mvn spring-boot:run
```

O `docker-compose.yml` importa `infra/keycloak/tms-realm.json` em ambientes novos. Se o realm `tms` ja existir no volume/container atual, o Keycloak nao substitui automaticamente a configuracao existente; nesse caso criar/ajustar o client `tms-web` manualmente ou recriar o container/volume de Keycloak.

Frontend:

```bash
cd web
npm install
npm run dev
```

URLs:

- Frontend: `http://localhost:3000/login`
- Backend: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui.html`
- Keycloak: `http://localhost:8081`

## Validacao

Validacoes executadas nesta alteracao:

```bash
cd web && npm run build
mvn -DskipTests compile
```

`npm run build` passa. `mvn -DskipTests compile` passa.

`mvn test` foi executado, mas falha em problemas existentes fora da alteracao web:

- Testcontainers nao encontrou Docker disponivel.
- `VehicleServiceTest.updateStatusToAbatidaShouldPersistNewStatus` falha com `NullPointerException`.
- Testes de seguranca falham por beans duplicados de `RateLimitConfig`.
- O teste Modulith reporta dependencias entre modulos sobre tipos nao expostos.

Esses pontos devem ser tratados no backend para a suite completa ficar verde.
