# Decisoes de Arquitetura - TMS (Transport Management System)

Este documento regista as principais decisoes de arquitetura tomadas durante o design e desenvolvimento do TMS, seguindo o formato ADR (Architecture Decision Record).

---

## ADR-001 - Monolito Modular com Spring Modulith em vez de Microservicos

**Estado:** Aceite

**Contexto:**
O TMS e um sistema interno com uma equipa de desenvolvimento pequena, volume operacional moderado (dezenas de utilizadores concorrentes) e requisitos de auditabilidade e consistencia transacional fortes. A alternativa de microservicos introduziria complexidade operacional significativa (service discovery, distributed tracing, sagas) sem beneficios proporcionais.

**Decisao:**
Usar Spring Modulith para construir um monolito modular com fronteiras de modulo bem definidas. Cada modulo (`vehicle`, `driver`, `activity`, `alert`, `audit`, `hr`, `user`, `security`, `integration`, `shared`) tem o seu proprio pacote, expoe apenas interfaces publicas, e comunica com outros modulos via chamadas diretas de servico (sincrono) ou eventos Spring Modulith (assincrono).

**Consequencias:**
- Operacoes simplificadas: um unico processo JVM, um unico deployment
- Fronteiras de modulo verificadas em tempo de compilacao pelo Spring Modulith
- Mais dificil de escalar modulos individualmente no futuro
- Migracao para microservicos possivel no futuro, pois as fronteiras ja estao definidas

---

## ADR-002 - Keycloak como Servidor de Identidade e Autorizacao

**Estado:** Aceite

**Contexto:**
O TMS precisa de autenticacao segura (OIDC), autorizacao baseada em roles (RBAC), gestao de utilizadores, politicas de password, brute force protection e suporte a multiplos clientes (web e mobile). Implementar tudo isto de raiz seria custoso e propenso a erros de seguranca.

**Decisao:**
Usar Keycloak como servidor de identidade externo. O TMS valida tokens JWT via JWKS endpoint do Keycloak. As roles sao definidas no realm `tms` e mapeadas para `GrantedAuthority` no Spring Security. A gestao de utilizadores e feita via Keycloak Admin API a partir do modulo `user`.

**Consequencias:**
- Dependencia externa de infraestrutura (Keycloak deve estar disponivel)
- Reduz drasticamente o codigo de autenticacao no TMS
- SSO disponivel gratuitamente para futuras aplicacoes no mesmo realm
- Politicas de password, brute force protection e auditoria de login geridas pelo Keycloak

---

## ADR-003 - PostgreSQL como Base de Dados Principal

**Estado:** Aceite

**Contexto:**
O TMS tem dados relacionais com integridade referencial forte, necessidade de pesquisa textual por matricula (trigram), armazenamento de JSON para valores de auditoria (JSONB), e requisitos ACID para operacoes de alocacao concorrente.

**Decisao:**
Usar PostgreSQL 16 com Flyway para migracoes versionadas. Usar extensao `pg_trgm` para pesquisa parcial de matriculas. Usar tipo `JSONB` para os campos `previous_values` e `new_values` da tabela `audit_logs`. Usar `TIMESTAMPTZ` para todos os timestamps.

**Consequencias:**
- Forte consistencia e suporte ACID
- JSONB permite consultas eficientes sobre dados de auditoria
- Pesquisa trigram elimina a necessidade de Elasticsearch para pesquisa por matricula
- Flyway garante migracoes reproduziveis e versionadas

---

## ADR-004 - Soft Delete em vez de Hard Delete

**Estado:** Aceite

**Contexto:**
O TMS tem requisitos fortes de auditabilidade e rastreabilidade. Eliminar registos fisicamente quebraria referencias historicas e impediria a reconstrucao do historico operacional.

**Decisao:**
Todas as entidades principais (`vehicles`, `drivers`, `activities`, `vehicle_documents`, `driver_documents`, `employees`) tem colunas `deleted_at TIMESTAMPTZ` e `deleted_by VARCHAR(100)`. A anotacao `@SQLRestriction("deleted_at IS NULL")` filtra automaticamente os registos eliminados em todas as queries JPA.

**Consequencias:**
- Dados preservados para auditoria e historico
- Integridade referencial mantida (FKs nao quebram)
- Queries precisam do filtro `deleted_at IS NULL` (gerido automaticamente pelo `@SQLRestriction`)
- Volume de dados cresce ao longo do tempo (mitigado por politica de retencao)

---

## ADR-005 - Auditoria via AOP e Spring Modulith Events

**Estado:** Aceite

**Contexto:**
A auditoria e uma preocupacao transversal que deve ser registada em todas as operacoes de escrita sobre entidades criticas, sem poluir a logica de negocio de cada servico. Os registos de auditoria devem ser imutaveis.

**Decisao:**
Usar a anotacao `@Auditable` em metodos de servico de escrita. O `AuditAspect` (Spring AOP) interceta esses metodos, captura o estado anterior e posterior, e publica um `AuditEvent` via `ApplicationEventPublisher`. O `AuditService` consome o evento de forma assincrona via `@ApplicationModuleListener` e persiste o `AuditLog`. A entidade `AuditLog` e imutavel (sem setters, sem `@LastModifiedDate`, sem `deleted_at`).

**Consequencias:**
- Logica de auditoria completamente desacoplada da logica de negocio
- Assincrono: nao bloqueia a transacao principal
- Testavel independentemente
- Ligeiro atraso na persistencia do registo de auditoria (aceitavel)

---

## ADR-006 - Modulo de Seguranca Implementado por Ultimo

**Estado:** Aceite

**Contexto:**
Durante o desenvolvimento, ter o modulo de seguranca ativo (validacao JWT obrigatoria) obriga a configurar Keycloak, obter tokens e injetar cabecalhos em cada pedido de teste. Isto atrasa significativamente o desenvolvimento e teste dos modulos de negocio.

**Decisao:**
Durante as Fases 1-6, o modulo `security` corre em modo permissivo (`permitAll()` em todos os endpoints, `SecurityUtils` com stub). Apos todos os modulos de negocio estarem completos e testados (Fase 6b), implementa-se o modulo de seguranca real (JWT, RBAC, rate limiting). A Fase 6c refatora todos os controllers para adicionar `@PreAuthorize` com as roles corretas.

**Consequencias:**
- Desenvolvimento mais rapido nas fases iniciais
- Todos os modulos de negocio sao testados sem dependencia de Keycloak
- A seguranca e adicionada numa fase dedicada e focada
- Risco de esquecer endpoints mitigado pela tarefa de refatorizacao explicita (46c)
- Os registos de auditoria durante o desenvolvimento usam `"system"` como utilizador (substituido na Fase 6b)

---

## ADR-007 - Modulo RH Interno em vez de Integracao Externa

**Estado:** Aceite

**Contexto:**
A versao inicial do design previa integracao com um sistema de RH externo para verificar disponibilidade de motoristas. Esta dependencia externa era fragil, introduzia latencia e complexidade de cache, e o contrato de API do sistema externo era instavel.

**Decisao:**
Substituir a integracao externa por um modulo `hr` interno simples, que gere funcionarios, funcoes e pagamentos salariais. Os motoristas podem ser associados a funcionarios internos. A validacao de disponibilidade passa a verificar o estado do funcionario interno em vez de consultar um sistema externo.

**Consequencias:**
- Sem dependencia externa para validacao de alocacao
- Modulo RH simples: nao implementa payroll completo, calculo de impostos, INSS, IRPS, ferias ou assiduidade
- Validacao de alocacao mais rapida e fiavel
- Dados de RH ficam no TMS (duplicacao intencional e limitada)

---

## ADR-008 - Object Storage para Ficheiros Anexos

**Estado:** Aceite

**Contexto:**
Documentos de viaturas e motoristas (PDFs, imagens) precisam de ser armazenados. Guardar ficheiros como `BYTEA` no PostgreSQL causaria crescimento descontrolado da base de dados, degradacao de performance em backups e queries lentas.

**Decisao:**
Armazenar ficheiros em object storage compativel com S3 (AWS S3 em producao, adaptador local em desenvolvimento). A tabela `files` guarda apenas metadados (nome original, storage key, content type, tamanho). A interface `FileStoragePort` abstrai o adaptador concreto, selecionado via `@ConditionalOnProperty`.

**Consequencias:**
- Base de dados leve e rapida
- Ficheiros com backup independente da base de dados
- Necessidade de gerir credenciais e acesso ao object storage
- Adaptador local facilita desenvolvimento sem S3

---

## ADR-009 - UUID como Chave Primaria

**Estado:** Aceite

**Contexto:**
As PKs precisam de ser geradas pela aplicacao (nao pelo banco), seguras para expor na API (sem revelar sequencias), e compativeis com geracao distribuida futura.

**Decisao:**
Usar UUID v4 gerado pela aplicacao (`gen_random_uuid()` como default na base de dados). Todas as PKs sao do tipo `UUID`.

**Consequencias:**
- IDs opacos e seguros para expor na API
- Sem contencao em sequencias de base de dados
- Indices ligeiramente maiores que `BIGINT` (aceitavel para o volume esperado)
- Nao ha ordenacao natural por ID (usar `created_at` para ordenacao cronologica)

---

## ADR-010 - API Versionada desde o Inicio (`/api/v1/`)

**Estado:** Aceite

**Contexto:**
A aplicacao movel Flutter pode ter versoes em producao que nao sao atualizadas imediatamente. Mudancas breaking na API sem versionamento forcaria atualizacoes imediatas da app, o que nao e controlavel.

**Decisao:**
Todos os endpoints da API tem o prefixo `/api/v1/` desde o primeiro dia. Versoes futuras usarao `/api/v2/` sem remover `/api/v1/` imediatamente.

**Consequencias:**
- Compatibilidade garantida com versoes antigas da app movel
- Overhead minimo (apenas um prefixo de path)
- Necessidade de manter versoes antigas por um periodo de transicao

---

## ADR-011 - Pessimistic Locking para Detecao de Conflitos de Alocacao

**Estado:** Aceite

**Contexto:**
Dois operadores podem tentar alocar a mesma viatura ou motorista a atividades diferentes em simultaneo. Sem locking, ambas as alocacoes poderiam ser aceites, criando um conflito.

**Decisao:**
As queries de detecao de conflito de alocacao (`findConflictingActivitiesForVehicle` e `findConflictingActivitiesForDriver`) usam `@Lock(LockModeType.PESSIMISTIC_WRITE)`. Isto garante que apenas uma transacao pode verificar e alocar um recurso de cada vez.

**Consequencias:**
- Conflitos de alocacao concorrente sao impossiveis
- Ligeiro impacto de performance em alocacoes simultaneas (aceitavel dado o volume esperado)
- Transacoes de alocacao sao mais longas (devem ser mantidas curtas)