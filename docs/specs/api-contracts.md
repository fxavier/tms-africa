# Contratos de API — TMS (Transport Management System)

**Versão:** 1.0
**Base URL:** `/api/v1`
**Formato:** JSON
**Autenticação:** Bearer Token (JWT emitido pelo Keycloak)

---

## 1. Convenções Gerais

### 1.1 Cabeçalhos Obrigatórios

| Cabeçalho | Valor | Obrigatório |
|-----------|-------|-------------|
| `Content-Type` | `application/json` | Sim (em POST/PUT/PATCH) |
| `Authorization` | `Bearer {access_token}` | Sim (após Fase 6b) |
| `Accept` | `application/json` | Recomendado |

### 1.2 Envelope de Resposta

**Sucesso:**
```json
{
  "data": { ... },
  "error": null
}
```

**Erro:**
```json
{
  "data": null,
  "error": {
    "code": "PLATE_ALREADY_EXISTS",
    "message": "A matrícula AA-00-BB já existe no sistema.",
    "details": []
  }
}
```

### 1.3 Paginação

Todas as listagens retornam:
```json
{
  "data": {
    "content": [ ... ],
    "page": 0,
    "size": 20,
    "totalElements": 150,
    "totalPages": 8
  },
  "error": null
}
```

Parâmetros de query: `page` (default 0), `size` (default 20, min 10, max 100), `sort` (ex: `createdAt,desc`).

### 1.4 Códigos HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK — leitura ou atualização bem-sucedida |
| 201 | Created — recurso criado com sucesso |
| 204 | No Content — operação sem corpo de resposta |
| 400 | Bad Request — validação de input falhou |
| 401 | Unauthorized — token ausente ou inválido |
| 403 | Forbidden — token válido mas sem permissão |
| 404 | Not Found — recurso não encontrado |
| 422 | Unprocessable Entity — regra de negócio violada |
| 500 | Internal Server Error — erro inesperado (inclui correlationId) |

### 1.5 Fluxos de Autenticação Keycloak

| Fluxo | Endpoint Keycloak | Uso |
|-------|-------------------|-----|
| Login web | `GET /realms/tms/protocol/openid-connect/auth` | Authorization Code Flow |
| Login mobile | `GET /realms/tms/protocol/openid-connect/auth` (+ PKCE) | Authorization Code + PKCE |
| Troca de código | `POST /realms/tms/protocol/openid-connect/token` | Obter access_token + refresh_token |
| Renovar token | `POST /realms/tms/protocol/openid-connect/token` (grant_type=refresh_token) | Renovação silenciosa |
| Logout | `GET /realms/tms/protocol/openid-connect/logout` | Invalidar sessão + token revocation |
| Reset password | `POST /realms/tms/login-actions/reset-credentials` | Self-service via email |

---

## 2. Módulo User — Gestão de Utilizadores

> Roles necessárias (após Fase 6b): `ADMIN`, `SUPERUSER`

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/users` | ADMIN, SUPERUSER | Criar utilizador |
| `GET` | `/api/v1/users` | ADMIN, SUPERUSER | Listar utilizadores |
| `GET` | `/api/v1/users/{id}` | ADMIN, SUPERUSER | Detalhe de utilizador |
| `PUT` | `/api/v1/users/{id}` | ADMIN, SUPERUSER | Atualizar utilizador |
| `PATCH` | `/api/v1/users/{id}/enable` | ADMIN, SUPERUSER | Ativar utilizador |
| `PATCH` | `/api/v1/users/{id}/disable` | ADMIN, SUPERUSER | Desativar utilizador |
| `POST` | `/api/v1/users/{id}/reset-password` | ADMIN, SUPERUSER | Forçar reset de password |
| `GET` | `/api/v1/users/me` | Qualquer autenticado | Perfil do utilizador atual |

### POST /api/v1/users

**Request:**
```json
{
  "username": "joao.silva",
  "email": "joao.silva@empresa.pt",
  "firstName": "João",
  "lastName": "Silva",
  "roles": ["GESTOR_FROTA"],
  "enabled": true
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "username": "joao.silva",
    "email": "joao.silva@empresa.pt",
    "firstName": "João",
    "lastName": "Silva",
    "roles": ["GESTOR_FROTA"],
    "enabled": true,
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "error": null
}
```

**Erros:** `USERNAME_ALREADY_EXISTS` (422), `EMAIL_ALREADY_EXISTS` (422), `SUPERUSER_ROLE_FORBIDDEN` (422)

---

## 3. Módulo Vehicle — Viaturas

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/vehicles` | ADMIN, GESTOR_FROTA | Criar viatura |
| `GET` | `/api/v1/vehicles` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Listar viaturas |
| `GET` | `/api/v1/vehicles/search?q={q}` | Todos | Pesquisa parcial por matrícula |
| `GET` | `/api/v1/vehicles/{id}` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Detalhe de viatura |
| `GET` | `/api/v1/vehicles/{id}/consolidated` | ADMIN, GESTOR_FROTA, AUDITOR | Vista consolidada |
| `PUT` | `/api/v1/vehicles/{id}` | ADMIN, GESTOR_FROTA | Atualizar viatura |
| `PATCH` | `/api/v1/vehicles/{id}/status` | ADMIN, GESTOR_FROTA | Alterar estado operacional |
| `DELETE` | `/api/v1/vehicles/{id}` | ADMIN | Eliminação lógica |
| `GET` | `/api/v1/vehicles/{id}/documents` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Listar documentos |
| `POST` | `/api/v1/vehicles/{id}/documents` | ADMIN, GESTOR_FROTA | Adicionar documento |
| `PUT` | `/api/v1/vehicles/{id}/documents/{docId}` | ADMIN, GESTOR_FROTA | Atualizar documento |
| `DELETE` | `/api/v1/vehicles/{id}/documents/{docId}` | ADMIN, GESTOR_FROTA | Remover documento |
| `GET` | `/api/v1/vehicles/{id}/maintenance` | ADMIN, GESTOR_FROTA, TECNICO_MANUTENCAO, AUDITOR | Listar manutenções |
| `POST` | `/api/v1/vehicles/{id}/maintenance` | ADMIN, GESTOR_FROTA, TECNICO_MANUTENCAO | Registar manutenção |
| `GET` | `/api/v1/vehicles/{id}/checklists` | ADMIN, GESTOR_FROTA, MOTORISTA, AUDITOR | Listar checklists |
| `POST` | `/api/v1/vehicles/{id}/checklists` | ADMIN, GESTOR_FROTA, MOTORISTA, TECNICO_MANUTENCAO | Submeter checklist |
| `GET` | `/api/v1/checklist-templates` | ADMIN, GESTOR_FROTA | Listar templates |
| `POST` | `/api/v1/checklist-templates` | ADMIN, GESTOR_FROTA | Criar template |
| `PUT` | `/api/v1/checklist-templates/{id}` | ADMIN, GESTOR_FROTA | Atualizar template |
| `POST` | `/api/v1/files` | ADMIN, GESTOR_FROTA, TECNICO_MANUTENCAO | Upload de ficheiro |
| `GET` | `/api/v1/files/{id}` | Todos autenticados | Download de ficheiro |

### POST /api/v1/vehicles

**Request:**
```json
{
  "plate": "AA-00-BB",
  "brand": "Mercedes",
  "model": "Sprinter",
  "vehicleType": "FURGAO",
  "capacity": 1000,
  "activityLocation": "Lisboa",
  "activityStartDate": "2024-01-01",
  "notes": "Observações opcionais"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "plate": "AA-00-BB",
    "brand": "Mercedes",
    "model": "Sprinter",
    "vehicleType": "FURGAO",
    "capacity": 1000,
    "activityLocation": "Lisboa",
    "status": "DISPONIVEL",
    "createdAt": "2025-01-15T10:00:00Z"
  },
  "error": null
}
```

**Erros:** `PLATE_ALREADY_EXISTS` (422)

### PATCH /api/v1/vehicles/{id}/status

**Request:**
```json
{ "status": "EM_MANUTENCAO" }
```

**Valores válidos:** `DISPONIVEL`, `INDISPONIVEL`, `EM_MANUTENCAO`, `ABATIDA`

---

## 4. Módulo Driver — Motoristas

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/drivers` | ADMIN, GESTOR_FROTA | Criar motorista |
| `GET` | `/api/v1/drivers` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Listar motoristas |
| `GET` | `/api/v1/drivers/{id}` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Detalhe de motorista |
| `PUT` | `/api/v1/drivers/{id}` | ADMIN, GESTOR_FROTA | Atualizar motorista |
| `PATCH` | `/api/v1/drivers/{id}/status` | ADMIN, GESTOR_FROTA | Alterar estado |
| `DELETE` | `/api/v1/drivers/{id}` | ADMIN | Eliminação lógica |
| `GET` | `/api/v1/drivers/{id}/availability` | ADMIN, GESTOR_FROTA, OPERADOR | Consultar disponibilidade |
| `GET` | `/api/v1/drivers/{id}/documents` | ADMIN, GESTOR_FROTA, AUDITOR | Listar documentos |
| `POST` | `/api/v1/drivers/{id}/documents` | ADMIN, GESTOR_FROTA | Adicionar documento |
| `PUT` | `/api/v1/drivers/{id}/documents/{docId}` | ADMIN, GESTOR_FROTA | Atualizar documento |
| `POST` | `/api/v1/integration/rh/availability` | RH_INTEGRADOR | Webhook de disponibilidade RH |

### POST /api/v1/drivers

**Request:**
```json
{
  "fullName": "Manuel Costa",
  "phone": "+351912345678",
  "address": "Rua das Flores, 10, Lisboa",
  "idNumber": "12345678",
  "licenseNumber": "L-987654",
  "licenseCategory": "C",
  "licenseIssueDate": "2015-06-01",
  "licenseExpiryDate": "2025-06-01",
  "activityLocation": "Lisboa",
  "employeeId": "uuid-opcional"
}
```

**Erros:** `ID_NUMBER_ALREADY_EXISTS` (422), `LICENSE_NUMBER_ALREADY_EXISTS` (422), `EMPLOYEE_NOT_FOUND` (404)

---

## 5. Módulo Activity — Atividades

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/activities` | ADMIN, GESTOR_FROTA, OPERADOR | Criar atividade |
| `GET` | `/api/v1/activities` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Listar atividades |
| `GET` | `/api/v1/activities/{id}` | ADMIN, GESTOR_FROTA, OPERADOR, MOTORISTA*, AUDITOR | Detalhe de atividade |
| `PUT` | `/api/v1/activities/{id}` | ADMIN, GESTOR_FROTA | Atualizar atividade |
| `DELETE` | `/api/v1/activities/{id}` | ADMIN, GESTOR_FROTA | Eliminação lógica |
| `POST` | `/api/v1/activities/{id}/allocate` | ADMIN, GESTOR_FROTA, OPERADOR | Alocar viatura e motorista |
| `PATCH` | `/api/v1/activities/{id}/status` | ADMIN, GESTOR_FROTA, OPERADOR, MOTORISTA | Transição de estado |
| `GET` | `/api/v1/activities/{id}/events` | ADMIN, GESTOR_FROTA, AUDITOR | Histórico de eventos |

*MOTORISTA apenas vê as suas próprias atividades.

### POST /api/v1/activities

**Request:**
```json
{
  "title": "Entrega Lisboa-Porto",
  "activityType": "ENTREGA",
  "location": "Porto",
  "plannedStart": "2025-02-01T08:00:00Z",
  "plannedEnd": "2025-02-01T18:00:00Z",
  "priority": "NORMAL",
  "description": "Entrega de mercadoria"
}
```

**Response 201:**
```json
{
  "data": {
    "id": "uuid",
    "code": "ACT-2025-0001",
    "title": "Entrega Lisboa-Porto",
    "status": "PLANEADA",
    "priority": "NORMAL",
    "plannedStart": "2025-02-01T08:00:00Z",
    "plannedEnd": "2025-02-01T18:00:00Z"
  },
  "error": null
}
```

### POST /api/v1/activities/{id}/allocate

**Request:**
```json
{
  "vehicleId": "uuid",
  "driverId": "uuid",
  "rhOverrideJustification": "Justificação opcional se RH indisponível"
}
```

**Response 200 (alocação bem-sucedida):**
```json
{
  "data": { "allocated": true, "blockers": [] },
  "error": null
}
```

**Response 422 (alocação bloqueada):**
```json
{
  "data": null,
  "error": {
    "code": "ALLOCATION_BLOCKED",
    "message": "A alocação foi bloqueada por 2 motivo(s).",
    "details": [
      "VEHICLE_IN_MAINTENANCE: A viatura está em manutenção.",
      "DRIVER_LICENSE_EXPIRED: A carta de condução expirou em 2024-12-31."
    ]
  }
}
```

### PATCH /api/v1/activities/{id}/status

**Request:**
```json
{
  "newStatus": "EM_CURSO",
  "notes": "Atividade iniciada pelo motorista"
}
```

**Transições válidas:**
- `PLANEADA` → `EM_CURSO`, `CANCELADA`
- `EM_CURSO` → `SUSPENSA`, `CONCLUIDA`, `CANCELADA`
- `SUSPENSA` → `EM_CURSO`, `CANCELADA`

**Erros:** `INVALID_STATUS_TRANSITION` (422), `CHECKLIST_CRITICAL_FAILURE` (422)

---

## 6. Módulo Alert — Alertas

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/alerts` | ADMIN, GESTOR_FROTA, OPERADOR, AUDITOR | Listar alertas |
| `GET` | `/api/v1/alerts/{id}` | ADMIN, GESTOR_FROTA, AUDITOR | Detalhe de alerta |
| `PATCH` | `/api/v1/alerts/{id}/resolve` | ADMIN, GESTOR_FROTA | Resolver alerta manualmente |
| `GET` | `/api/v1/alert-configurations` | ADMIN, GESTOR_FROTA | Listar configurações |
| `PUT` | `/api/v1/alert-configurations/{id}` | ADMIN, GESTOR_FROTA | Atualizar configuração |

**Filtros de GET /api/v1/alerts:** `resolved` (boolean), `severity` (INFO/AVISO/CRITICO), `entityType` (string), `page`, `size`

**Response de alerta:**
```json
{
  "data": {
    "id": "uuid",
    "alertType": "DOCUMENT_EXPIRING",
    "severity": "AVISO",
    "entityType": "VEHICLE",
    "entityId": "uuid",
    "title": "Seguro a expirar",
    "message": "O seguro da viatura AA-00-BB expira em 15 dias.",
    "isResolved": false,
    "createdAt": "2025-01-01T06:00:00Z"
  },
  "error": null
}
```

---

## 7. Módulo Audit — Auditoria

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `GET` | `/api/v1/audit` | ADMIN, AUDITOR | Consultar registos de auditoria |
| `GET` | `/api/v1/audit/{id}` | ADMIN, AUDITOR | Detalhe de registo |

> Não existem endpoints de escrita (`POST`, `PUT`, `PATCH`, `DELETE`) — os registos são imutáveis.

**Filtros de GET /api/v1/audit:** `entityType`, `entityId`, `operation` (CRIACAO/ATUALIZACAO/ELIMINACAO), `performedBy`, `from` (date), `to` (date), `page`, `size`

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "entityType": "VEHICLE",
    "entityId": "uuid",
    "operation": "ATUALIZACAO",
    "performedBy": "joao.silva",
    "performedAt": "2025-01-15T10:30:00Z",
    "ipAddress": "192.168.1.10",
    "previousValues": { "status": "DISPONIVEL" },
    "newValues": { "status": "EM_MANUTENCAO" }
  },
  "error": null
}
```

---

## 8. Módulo HR — Recursos Humanos

### Endpoints

| Método | Path | Roles | Descrição |
|--------|------|-------|-----------|
| `POST` | `/api/v1/hr/functions` | ADMIN, GESTOR_RH | Criar função |
| `GET` | `/api/v1/hr/functions` | ADMIN, GESTOR_RH, GESTOR_FROTA, AUDITOR | Listar funções |
| `GET` | `/api/v1/hr/functions/{id}` | ADMIN, GESTOR_RH, GESTOR_FROTA, AUDITOR | Detalhe de função |
| `PUT` | `/api/v1/hr/functions/{id}` | ADMIN, GESTOR_RH | Atualizar função |
| `PATCH` | `/api/v1/hr/functions/{id}/activate` | ADMIN, GESTOR_RH | Ativar função |
| `PATCH` | `/api/v1/hr/functions/{id}/deactivate` | ADMIN, GESTOR_RH | Desativar função |
| `POST` | `/api/v1/hr/employees` | ADMIN, GESTOR_RH | Criar funcionário |
| `GET` | `/api/v1/hr/employees` | ADMIN, GESTOR_RH, GESTOR_FROTA, AUDITOR | Listar funcionários |
| `GET` | `/api/v1/hr/employees/{id}` | ADMIN, GESTOR_RH, GESTOR_FROTA, AUDITOR | Detalhe de funcionário |
| `PUT` | `/api/v1/hr/employees/{id}` | ADMIN, GESTOR_RH | Atualizar funcionário |
| `PATCH` | `/api/v1/hr/employees/{id}/status` | ADMIN, GESTOR_RH | Alterar estado |
| `DELETE` | `/api/v1/hr/employees/{id}` | ADMIN | Eliminação lógica |
| `POST` | `/api/v1/hr/salary-payments` | ADMIN, GESTOR_RH | Registar pagamento |
| `GET` | `/api/v1/hr/salary-payments` | ADMIN, GESTOR_RH, AUDITOR | Listar pagamentos |
| `GET` | `/api/v1/hr/salary-payments/{id}` | ADMIN, GESTOR_RH, AUDITOR | Detalhe de pagamento |
| `PATCH` | `/api/v1/hr/salary-payments/{id}/cancel` | ADMIN, GESTOR_RH | Cancelar pagamento |
| `GET` | `/api/v1/hr/salary-payments/status` | ADMIN, GESTOR_RH, AUDITOR | Estado de pagamentos por período |

**Filtros de GET /api/v1/hr/salary-payments/status:** `year`, `month`, `status` (PAID/UNPAID/ALL)

---

## 9. Códigos de Erro de Negócio

| Código | HTTP | Descrição |
|--------|------|-----------|
| `PLATE_ALREADY_EXISTS` | 422 | Matrícula já registada |
| `ID_NUMBER_ALREADY_EXISTS` | 422 | Número de BI já registado |
| `LICENSE_NUMBER_ALREADY_EXISTS` | 422 | Número de carta já registado |
| `USERNAME_ALREADY_EXISTS` | 422 | Username já existe no Keycloak |
| `EMAIL_ALREADY_EXISTS` | 422 | Email já existe no Keycloak |
| `SUPERUSER_ROLE_FORBIDDEN` | 422 | ADMIN não pode atribuir role SUPERUSER |
| `SELF_DISABLE_FORBIDDEN` | 422 | Utilizador não pode desativar a própria conta |
| `VEHICLE_IN_MAINTENANCE` | 422 | Viatura em manutenção — alocação bloqueada |
| `VEHICLE_UNAVAILABLE` | 422 | Viatura indisponível — alocação bloqueada |
| `VEHICLE_DECOMMISSIONED` | 422 | Viatura abatida — alocação bloqueada |
| `VEHICLE_DOCUMENT_EXPIRED` | 422 | Documento de viatura expirado |
| `CHECKLIST_CRITICAL_FAILURE` | 422 | Checklist com item crítico em falha |
| `DRIVER_INACTIVE` | 422 | Motorista inativo — alocação bloqueada |
| `DRIVER_SUSPENDED` | 422 | Motorista suspenso — alocação bloqueada |
| `DRIVER_LICENSE_EXPIRED` | 422 | Carta de condução expirada |
| `DRIVER_RH_UNAVAILABLE` | 422 | Motorista indisponível segundo RH |
| `RH_SYSTEM_UNAVAILABLE` | 422 | Sistema RH indisponível (sem justificação) |
| `VEHICLE_ALLOCATION_CONFLICT` | 422 | Viatura já alocada no mesmo período |
| `DRIVER_ALLOCATION_CONFLICT` | 422 | Motorista já alocado no mesmo período |
| `INVALID_STATUS_TRANSITION` | 422 | Transição de estado não permitida |
| `ALLOCATION_BLOCKED` | 422 | Alocação bloqueada (múltiplos motivos) |
| `EMPLOYEE_NOT_FOUND` | 404 | Funcionário não encontrado |
| `EMPLOYEE_INACTIVE` | 422 | Funcionário inativo |
| `EMPLOYEE_FUNCTION_NOT_ALLOWED_FOR_DRIVER` | 422 | Função do funcionário incompatível com motorista |
| `DRIVER_EMPLOYEE_NOT_LINKED` | 422 | Motorista sem funcionário associado |
| `SALARY_PAYMENT_DUPLICATE_PERIOD` | 422 | Pagamento já registado para este período |
| `FUNCTION_CODE_ALREADY_EXISTS` | 422 | Código de função já existe |
| `EMPLOYEE_NUMBER_ALREADY_EXISTS` | 422 | Número de funcionário já existe |
| `RESOURCE_NOT_FOUND` | 404 | Recurso não encontrado |
| `FILE_TOO_LARGE` | 400 | Ficheiro excede 10 MB |
| `INVALID_FILE_TYPE` | 400 | Tipo de ficheiro não suportado (apenas PDF, JPG, PNG) |
