# Plano de Testes — TMS (Transport Management System)

---

## 1. Estratégia de Testes

O TMS segue a pirâmide de testes: base larga de testes unitários, camada intermédia de testes de integração, e topo com testes E2E nos fluxos críticos.

### 1.1 Ferramentas por Camada

| Camada | Ferramenta | Âmbito |
|--------|-----------|--------|
| Unitários (backend) | JUnit 5, Mockito, AssertJ | Serviços, lógica de negócio |
| Integração (backend) | Spring Boot Test, Testcontainers, MockMvc | Endpoints REST, base de dados real |
| Property-based (backend) | jqwik | Propriedades de correção formais |
| E2E Web | Playwright | Fluxos críticos no browser |
| E2E Mobile | Flutter integration tests | Fluxos críticos na app |

### 1.2 Cobertura Mínima Esperada

| Camada | Cobertura mínima |
|--------|-----------------|
| Camada de serviço | 80% de linhas |
| Geral (projeto) | 70% de linhas |

---

## 2. Testes Unitários por Módulo

### 2.1 Módulo `shared`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `GlobalExceptionHandler` — `ResourceNotFoundException` | Retorna HTTP 404 com código `RESOURCE_NOT_FOUND` |
| `GlobalExceptionHandler` — `BusinessException` | Retorna HTTP 422 com código de negócio |
| `GlobalExceptionHandler` — `AllocationException` | Retorna HTTP 422 com lista de bloqueios |
| `GlobalExceptionHandler` — `MethodArgumentNotValidException` | Retorna HTTP 400 com detalhes de validação |
| `GlobalExceptionHandler` — `Exception` genérica | Retorna HTTP 500 com correlationId |
| `CodeGenerator` | Gera códigos únicos no formato `ACT-{ANO}-{SEQ:04d}` |

### 2.2 Módulo `user`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `createUser()` com username duplicado | Lança `BusinessException(USERNAME_ALREADY_EXISTS)` |
| `createUser()` com email duplicado | Lança `BusinessException(EMAIL_ALREADY_EXISTS)` |
| `updateUser()` — ADMIN tenta atribuir role SUPERUSER | Lança `BusinessException(SUPERUSER_ROLE_FORBIDDEN)` |
| `setUserEnabled(false)` para o próprio utilizador | Lança `BusinessException(SELF_DISABLE_FORBIDDEN)` |
| `forcePasswordReset()` | Chama `executeActionsEmail` com ação `UPDATE_PASSWORD` |

### 2.3 Módulo `vehicle`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `createVehicle()` com matrícula duplicada | Lança `BusinessException(PLATE_ALREADY_EXISTS)` |
| `deleteVehicle()` | Define `deletedAt` e `deletedBy` (soft delete) |
| `updateStatus()` para ABATIDA | Impede alocações futuras |
| `ChecklistService.submitChecklist()` — item crítico em AVARIA | Regista falha crítica; `hasCriticalFailures()` retorna `true` |
| `ChecklistService.submitChecklist()` — sem falhas críticas | `hasCriticalFailures()` retorna `false` |
| `VehicleDocumentService.addDocument()` — ficheiro > 10 MB | Lança `BusinessException(FILE_TOO_LARGE)` |

### 2.4 Módulo `driver`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `createDriver()` com `idNumber` duplicado | Lança `BusinessException(ID_NUMBER_ALREADY_EXISTS)` |
| `createDriver()` com `licenseNumber` duplicado | Lança `BusinessException(LICENSE_NUMBER_ALREADY_EXISTS)` |
| `getAvailability()` — RH retorna indisponível | Retorna `DriverAvailabilityDto` com `available=false` |
| `getAvailability()` — `RhIntegrationException` sem justificação | Retorna fallback com mensagem de indisponibilidade |

### 2.5 Módulo `activity`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `AllocationValidationService` — viatura EM_MANUTENCAO | Bloqueio `VEHICLE_IN_MAINTENANCE` |
| `AllocationValidationService` — viatura ABATIDA | Bloqueio `VEHICLE_DECOMMISSIONED` |
| `AllocationValidationService` — documento de viatura expirado | Bloqueio `VEHICLE_DOCUMENT_EXPIRED` |
| `AllocationValidationService` — checklist com falha crítica | Bloqueio `CHECKLIST_CRITICAL_FAILURE` |
| `AllocationValidationService` — motorista INATIVO | Bloqueio `DRIVER_INACTIVE` |
| `AllocationValidationService` — motorista SUSPENSO | Bloqueio `DRIVER_SUSPENDED` |
| `AllocationValidationService` — carta de condução expirada | Bloqueio `DRIVER_LICENSE_EXPIRED` |
| `AllocationValidationService` — RH indisponível sem justificação | Bloqueio `DRIVER_RH_UNAVAILABLE` |
| `AllocationValidationService` — `RhIntegrationException` sem justificação | Bloqueio `RH_SYSTEM_UNAVAILABLE` |
| `AllocationValidationService` — `RhIntegrationException` com justificação | Sem bloqueio; justificação registada |
| `AllocationValidationService` — conflito de viatura | Bloqueio `VEHICLE_ALLOCATION_CONFLICT` |
| `AllocationValidationService` — conflito de motorista | Bloqueio `DRIVER_ALLOCATION_CONFLICT` |
| `AllocationValidationService` — alocação válida | `allocated=true`, lista de bloqueios vazia |
| `ActivityStatus.validateTransition()` — PLANEADA → EM_CURSO | Transição válida; `actualStart` definido |
| `ActivityStatus.validateTransition()` — EM_CURSO → CONCLUIDA | Transição válida; `actualEnd` definido |
| `ActivityStatus.validateTransition()` — CONCLUIDA → EM_CURSO | Lança `BusinessException(INVALID_STATUS_TRANSITION)` |
| `ActivityStatus.validateTransition()` — CANCELADA → PLANEADA | Lança `BusinessException(INVALID_STATUS_TRANSITION)` |
| `ActivityCodeGenerator` | Gera código único `ACT-{ANO}-{SEQ:04d}` dentro de transação |

### 2.6 Módulo `alert`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `checkDocumentExpiry()` — documento expira em 20 dias (período 30 dias) | Cria alerta com severidade AVISO |
| `checkDocumentExpiry()` — documento expira em 5 dias (período crítico 7 dias) | Cria alerta com severidade CRITICO |
| `checkDocumentExpiry()` — `expiryDate < today` | Atualiza status do documento para EXPIRADO; cria alerta CRITICO |
| `createAlertIfNotExists()` — alerta já existe não resolvido | Não cria duplicado |
| `createAlertIfNotExists()` — alerta existente com severidade menor | Atualiza severidade para a maior |
| `checkMaintenanceDue()` — `nextMaintenanceDate` já passou | Cria alerta `MAINTENANCE_OVERDUE` com severidade CRITICO |
| `resolveObsoleteAlerts()` — documento renovado | Resolve alerta automaticamente |

### 2.7 Módulo `audit`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `AuditLog` — tentativa de modificação | Sem setters; entidade imutável |
| `AuditAspect` — método `@Auditable` UPDATE | Captura `previousValues` e `newValues` corretamente |
| `AuditService` — consome `AuditEvent` | Persiste `AuditLog` com todos os campos |

### 2.8 Módulo `hr`

| Caso de teste | Comportamento esperado |
|---------------|----------------------|
| `createFunction()` com código duplicado | Lança `BusinessException(FUNCTION_CODE_ALREADY_EXISTS)` |
| `createEmployee()` com `employeeNumber` duplicado | Lança `BusinessException(EMPLOYEE_NUMBER_ALREADY_EXISTS)` |
| `createEmployee()` com função inexistente | Lança `ResourceNotFoundException` |
| `registerPayment()` com período duplicado | Lança `BusinessException(SALARY_PAYMENT_DUPLICATE_PERIOD)` |
| `getPaymentStatus()` — funcionário com pagamento no período | Retorna `PAID` |
| `getPaymentStatus()` — funcionário ativo sem pagamento no período | Retorna `UNPAID` |
| `cancelPayment()` | Muda status para `CANCELLED` |

---

## 3. Testes de Integração por Módulo

Todos os testes de integração usam **Testcontainers** com PostgreSQL real.

### 3.1 Módulo `user`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `POST /api/v1/users` | ADMIN cria utilizador | HTTP 201, utilizador criado no Keycloak |
| `POST /api/v1/users` | Username duplicado | HTTP 422, código `USERNAME_ALREADY_EXISTS` |
| `PATCH /api/v1/users/{id}/disable` | Desativar utilizador | HTTP 200, sessões invalidadas no Keycloak |
| `GET /api/v1/users/me` | Utilizador autenticado | HTTP 200, perfil correto |

### 3.2 Módulo `vehicle`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `POST /api/v1/vehicles` | Dados válidos | HTTP 201, viatura criada |
| `POST /api/v1/vehicles` | Matrícula duplicada | HTTP 422, código `PLATE_ALREADY_EXISTS` |
| `GET /api/v1/vehicles/search?q=AA` | Pesquisa parcial | HTTP 200, resultados paginados |
| `GET /api/v1/vehicles/{id}/consolidated` | Vista consolidada | HTTP 200, estrutura completa com documentos, acessórios, manutenções |
| `POST /api/v1/vehicles` | Operação de escrita | Registo de auditoria criado com `operation=CRIACAO` |
| `PUT /api/v1/vehicles/{id}` | Atualização | Registo de auditoria com `previousValues` e `newValues` |
| `POST /api/v1/files` | Ficheiro PDF válido | HTTP 201, ficheiro armazenado |
| `POST /api/v1/files` | Ficheiro > 10 MB | HTTP 400, código `FILE_TOO_LARGE` |

### 3.3 Módulo `driver`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `POST /api/v1/drivers` | Dados válidos | HTTP 201, motorista criado |
| `GET /api/v1/drivers/{id}/availability` | RH disponível | HTTP 200, `available=true` |
| `GET /api/v1/drivers/{id}/availability` | RH indisponível | HTTP 200, `available=false` com razão |
| `POST /api/v1/integration/rh/availability` | Sem token RH_INTEGRADOR | HTTP 403 (após Fase 6b) |

### 3.4 Módulo `activity`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `POST /api/v1/activities` | Criação | HTTP 201, código `ACT-{ANO}-{SEQ}` único |
| `POST /api/v1/activities/{id}/allocate` | Viatura em manutenção | HTTP 422, bloqueio `VEHICLE_IN_MAINTENANCE` |
| `POST /api/v1/activities/{id}/allocate` | Documento expirado | HTTP 422, bloqueio `VEHICLE_DOCUMENT_EXPIRED` |
| `POST /api/v1/activities/{id}/allocate` | Alocação válida | HTTP 200, `allocated=true` |
| `PATCH /api/v1/activities/{id}/status` | Transição inválida | HTTP 422, código `INVALID_STATUS_TRANSITION` |
| `PATCH /api/v1/activities/{id}/status` | PLANEADA → EM_CURSO com checklist crítica em falha | HTTP 422, código `CHECKLIST_CRITICAL_FAILURE` |

### 3.5 Módulo `alert`

| Cenário | Resultado esperado |
|---------|-------------------|
| Job diário corre | Alertas gerados para documentos a expirar |
| Mesmo alerta gerado duas vezes | Apenas um alerta não resolvido (deduplicação) |
| Documento renovado | Alerta resolvido automaticamente |
| Configuração de dias alterada | Período de alerta respeitado |

### 3.6 Módulo `audit`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `GET /api/v1/audit` | Filtro `entityType=VEHICLE` | Apenas registos de viaturas |
| `GET /api/v1/audit` | Filtro por período | Registos dentro do intervalo |
| `POST /api/v1/audit` | Tentativa de escrita | HTTP 405 ou 404 (endpoint não existe) |
| `DELETE /api/v1/audit/{id}` | Tentativa de eliminação | HTTP 405 ou 404 (endpoint não existe) |

### 3.7 Módulo `hr`

| Endpoint | Cenário | Resultado esperado |
|----------|---------|-------------------|
| `POST /api/v1/hr/employees` | Dados válidos | HTTP 201, funcionário criado |
| `POST /api/v1/hr/employees` | `employeeNumber` duplicado | HTTP 422 |
| `POST /api/v1/hr/salary-payments` | Período duplicado | HTTP 422, código `SALARY_PAYMENT_DUPLICATE_PERIOD` |
| `GET /api/v1/hr/salary-payments/status?year=2025&month=1&status=PAID` | Consulta | HTTP 200, lista de funcionários pagos |
| `GET /api/v1/hr/salary-payments/status?year=2025&month=1&status=UNPAID` | Consulta | HTTP 200, lista de funcionários não pagos |

---

## 4. Testes de Segurança (Fase 6b)

| Cenário | Resultado esperado |
|---------|-------------------|
| Pedido sem JWT | HTTP 401 |
| JWT válido mas role insuficiente | HTTP 403 |
| MOTORISTA acede a `GET /api/v1/vehicles` | HTTP 403 |
| MOTORISTA acede à sua própria atividade | HTTP 200 |
| MOTORISTA acede a atividade de outro motorista | HTTP 403 |
| ADMIN tenta atribuir role SUPERUSER | HTTP 422, código `SUPERUSER_ROLE_FORBIDDEN` |
| Rate limiting — > 60 req/min por IP | HTTP 429 |
| Registo de auditoria após Fase 6b | `performed_by` contém utilizador real do JWT (não `"system"`) |
| Tentativa de acesso não autorizado | Registo de auditoria criado com evento de acesso negado |

---

## 5. Testes E2E Web (Playwright)

| Fluxo | Passos | Resultado esperado |
|-------|--------|-------------------|
| Login | Aceder à app → redirecionar para Keycloak → autenticar → voltar à app | Dashboard visível com token válido |
| Criar viatura | Navegar para Viaturas → Nova Viatura → preencher formulário → submeter | Viatura aparece na listagem |
| Pesquisa por matrícula | Digitar 3+ caracteres no campo de pesquisa | Sugestões aparecem em tempo real |
| Criar atividade e alocar | Criar atividade → alocar viatura e motorista → confirmar | Atividade com estado PLANEADA e recursos alocados |
| Alocar viatura em manutenção | Tentar alocar viatura com estado EM_MANUTENCAO | Mensagem de bloqueio clara com motivo |
| Transição de estado | Atividade PLANEADA → clicar EM_CURSO → confirmar | Estado atualizado, evento registado |
| Interface MOTORISTA | Login como MOTORISTA → navegar para Viaturas | Redirecionamento para 403 ou menu simplificado |
| Logout | Clicar Logout | Redirecionamento para página de login, sessão invalidada |

---

## 6. Testes E2E Mobile (Flutter)

| Fluxo | Resultado esperado |
|-------|-------------------|
| Login via Keycloak OIDC | Token obtido, app navega para ecrã de atividades |
| Listar atividades atribuídas | Lista de atividades do motorista autenticado |
| Submeter checklist — item crítico em AVARIA | Aviso apresentado antes de submeter |
| Submeter checklist — sem falhas | Checklist submetida com sucesso, toast de confirmação |
| Atualizar estado de atividade | Estado atualizado, lista refrescada |
| Pesquisa de viatura por matrícula | Resultados a partir de 3 caracteres |
| Logout | Sessão invalidada no Keycloak, app volta ao ecrã de login |
| Sem conectividade | Mensagem de erro clara, app não crasha |

---

## 7. Propriedades de Correção (Property-Based Testing com jqwik)

### 7.1 `ActivityStatus` — Transições

**Propriedade:** Para qualquer sequência válida de transições de estado, o estado final é sempre um estado válido do enum `ActivityStatus`.

```java
@Property
void validTransitionSequenceAlwaysEndsInValidState(
    @ForAll("validTransitionSequences") List<ActivityStatus> sequence) {
    // Verificar que cada transição na sequência é permitida
    // e que o estado final pertence ao enum
}
```

### 7.2 `ActivityCodeGenerator` — Unicidade

**Propriedade:** Para qualquer ano e contagem, os códigos gerados são únicos e correspondem ao formato `ACT-{ANO}-{SEQ:04d}`.

```java
@Property
void generatedCodesAreUniqueAndMatchFormat(
    @ForAll @IntRange(min = 2020, max = 2099) int year,
    @ForAll @IntRange(min = 1, max = 9999) int count) {
    // Gerar `count` códigos para o `year`
    // Verificar que todos são únicos
    // Verificar que todos correspondem ao padrão ACT-{year}-\d{4}
}
```

### 7.3 `AllocationValidationService` — Consistência

**Propriedade:** Se existir pelo menos um bloqueio, `allocated` é sempre `false`. Se não existir nenhum bloqueio, `allocated` é sempre `true`.

```java
@Property
void allocationResultIsConsistentWithBlockers(
    @ForAll AllocationScenario scenario) {
    AllocationResultDto result = service.validate(scenario);
    assertThat(result.isAllocated()).isEqualTo(result.getBlockers().isEmpty());
}
```

### 7.4 `AlertService` — Deduplicação

**Propriedade:** Para qualquer número de chamadas a `createAlertIfNotExists` com o mesmo `alertType` e `entityId`, existe sempre no máximo um alerta não resolvido para essa combinação.

```java
@Property
void atMostOneUnresolvedAlertPerTypeAndEntity(
    @ForAll AlertType alertType,
    @ForAll UUID entityId,
    @ForAll @IntRange(min = 1, max = 10) int callCount) {
    // Chamar createAlertIfNotExists `callCount` vezes
    // Verificar que existe exatamente 1 alerta não resolvido
}
```

---

## 8. Ambientes de Teste

| Ambiente | Configuração | Uso |
|----------|-------------|-----|
| Local | Docker Compose (PostgreSQL + Keycloak), `application-dev.yml` | Desenvolvimento diário |
| Testes unitários | JUnit 5 + Mockito (sem base de dados) | CI rápido |
| Testes de integração | Testcontainers (PostgreSQL real, Keycloak mock/WireMock) | CI completo |
| Staging | Ambiente completo com Keycloak real | Validação pré-produção |

### 8.1 Configuração Testcontainers

```java
@SpringBootTest
@Testcontainers
class VehicleControllerIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16")
        .withDatabaseName("tms_test")
        .withUsername("tms_test")
        .withPassword("tms_test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}
```
