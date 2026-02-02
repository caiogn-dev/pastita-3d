# 🔥 PLANO DE GUERRA - Refatoração Arquitetural Pastita

> "Entendido. Vou parar de criar puxadinhos e começar a fundir esses modelos."

## 📊 Resumo da Análise

| Problema | Severidade | Status |
|----------|------------|--------|
| Duplicação Store ↔ CompanyProfile | 🔴 CRÍTICA | Não resolvida |
| Silos de mensageria | 🔴 CRÍTICA | Não resolvida |
| Webhooks espalhados | 🟠 ALTA | Não resolvida |
| APIs duplicadas (frontend) | 🟠 ALTA | Não resolvida |
| Relação frágil Store↔WhatsApp | 🔴 CRÍTICA | Não resolvida |

---

## 🎯 FASE 1: Unificação Store ↔ CompanyProfile (CRÍTICO)

**Objetivo:** Eliminar duplicação de dados e estabelecer Store como única fonte de verdade.

### Tasks:

1. **Criar relação direta Store ↔ CompanyProfile**
   - [ ] Adicionar `ForeignKey(Store)` em CompanyProfile
   - [ ] Criar migration para popular o campo
   - [ ] Adicionar `related_name='automation_profile'` em Store

2. **Eliminar campos duplicados**
   - [ ] Remover `company_name` (usar `store.name`)
   - [ ] Remover `description` (usar `store.description`)
   - [ ] Remover `business_hours` (usar `store.operating_hours`)
   - [ ] Remover `business_type` (usar `store.store_type`)
   - [ ] Criar `@property` para backward compatibility

3. **Fortalecer relação Store ↔ WhatsAppAccount**
   - [ ] Adicionar `whatsapp_account = ForeignKey(WhatsAppAccount)` em Store
   - [ ] Remover lógica de busca por string/external_id
   - [ ] Atualizar `StoreIntegration` para usar FK quando possível

4. **Atualizar código dependente**
   - [ ] Refatorar `StoreOrder._trigger_status_whatsapp_notification()`
   - [ ] Atualizar `AutomationService` para usar `store.automation_profile`
   - [ ] Corrigir fallback `CompanyProfile.objects.first()`

5. **Testes e validação**
   - [ ] Criar tests de integração
   - [ ] Verificar integridade de dados

---

## 🎯 FASE 2: Criação do App Messaging Central (CRÍTICO)

**Objetivo:** Criar um dispatcher unificado para todos os canais de comunicação.

### Tasks:

1. **Criar estrutura do app `messaging`**
   - [ ] `apps/messaging/` - novo app Django
   - [ ] `models.py` - Message, MessageTemplate, MessageLog
   - [ ] `dispatcher.py` - MessageDispatcher central
   - [ ] `providers/` - WhatsAppProvider, InstagramProvider, EmailProvider

2. **Modelos do messaging**
   - [ ] `Message` - mensagem genérica (channel, recipient, content, status)
   - [ ] `MessageTemplate` - templates unificados
   - [ ] `MessageLog` - logs centralizados de envio

3. **Dispatcher central**
   ```python
   class MessageDispatcher:
       def send(self, message: Message) -> Result
       def schedule(self, message: Message, when: datetime) -> Result
       def get_provider(self, channel: str) -> Provider
   ```

4. **Providers**
   - [ ] `WhatsAppProvider` - wrapper para WhatsAppAPIService
   - [ ] `InstagramProvider` - wrapper para InstagramAPI
   - [ ] `EmailProvider` - wrapper para Resend

5. **Migração gradual**
   - [ ] Criar adapter em `whatsapp` para usar dispatcher
   - [ ] Criar adapter em `automation` para usar dispatcher
   - [ ] Criar adapter em `campaigns` para usar dispatcher
   - [ ] Criar adapter em `marketing` para usar dispatcher

6. **Regras globais**
   - [ ] Implementar "não enviar após 22h"
   - [ ] Implementar rate limiting global
   - [ ] Implementar blacklist de números

---

## 🎯 FASE 3: Unificação de Webhooks (ALTA)

**Objetivo:** Centralizar todos os webhooks em um único entrypoint.

### Tasks:

1. **Criar app `webhooks` dedicado**
   - [ ] `apps/webhooks/` - novo app Django
   - [ ] `urls.py` - roteamento central `/webhooks/v1/`
   - [ ] `views.py` - WebhookReceiverView
   - [ ] `handlers/` - handlers específicos

2. **Handlers específicos**
   - [ ] `handlers/whatsapp.py` - migração de `apps.whatsapp.webhooks`
   - [ ] `handlers/instagram.py` - migração de `apps.instagram.webhooks`
   - [ ] `handlers/mercadopago.py` - migração de `apps.stores.webhooks`
   - [ ] `handlers/automation.py` - migração de `apps.automation.webhooks`

3. **Roteamento unificado**
   ```
   /webhooks/v1/whatsapp/
   /webhooks/v1/instagram/
   /webhooks/v1/payments/mercadopago/
   /webhooks/v1/automation/
   ```

4. **Verificação de signatures**
   - [ ] Centralizar validação de signatures
   - [ ] Middleware de segurança para webhooks

5. **Migração e backward compatibility**
   - [ ] Manter rotas antigas por 30 dias
   - [ ] Adicionar logs de deprecação
   - [ ] Atualizar configurações no Meta/MP

---

## 🎯 FASE 4: Limpeza de APIs Legadas (ALTA)

**Objetivo:** Consolidar serviços duplicados no frontend e remover código morto.

### Tasks:

1. **Backend - Limpeza de endpoints**
   - [ ] Remover caminhos `/stores/s/{slug}/` (legacy)
   - [ ] Consolidar webhooks de MP (remover duplicado)
   - [ ] Documentar endpoints deprecados

2. **Frontend (pastita-dash) - Consolidar APIs**
   - [ ] Migrar `useStore()` de `storeApi.ts` para `storesApi.ts`
   - [ ] Remover `storeApi.ts`
   - [ ] Remover `pastitaApi.ts` (já marcado como deprecated)
   - [ ] Atualizar todos os imports

3. **Verificação de dependências**
   - [ ] Buscar imports de `storeApi` no código
   - [ ] Buscar imports de `pastitaApi` no código
   - [ ] Atualizar `storesApi.ts` com funções faltantes

4. **Testes de integração**
   - [ ] Verificar todas as páginas do dashboard
   - [ ] Verificar fluxo de checkout

---

## 🎯 FASE 5: Correção de Permissões e Segurança (MÉDIA)

**Objetivo:** Garantir que todas as views validem propriedade da loja.

### Tasks:

1. **Auditoria de permissões**
   - [ ] Listar todas as views que usam `store_slug`
   - [ ] Verificar se validam `request.user == store.owner`
   - [ ] Verificar `IsStoreOwner` permission

2. **Criar/Atualizar permission classes**
   - [ ] `IsStoreOwner` - dono da loja
   - [ ] `IsStoreStaff` - staff da loja
   - [ ] `HasStoreAccess` - owner ou staff

3. **Aplicar permissões**
   - [ ] Atualizar views em `stores/api/`
   - [ ] Atualizar views em `whatsapp/api/`
   - [ ] Atualizar views em `automation/api/`

4. **Testes de segurança**
   - [ ] Teste: usuário A não acessa dados da loja do usuário B
   - [ ] Teste: staff não pode deletar loja

---

## 📅 Cronograma Sugerido

| Fase | Duração Estimada | Dependências |
|------|------------------|--------------|
| Fase 1 | 2-3 dias | - |
| Fase 2 | 4-5 dias | Fase 1 |
| Fase 3 | 2-3 dias | - |
| Fase 4 | 1-2 dias | - |
| Fase 5 | 2 dias | Fase 1, Fase 3 |

**Total: 11-15 dias**

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Quebra de produção | Média | Alto | Feature flags, rollback plan |
| Perda de dados | Baixa | Alto | Backup antes de migrations |
| Incompatibilidade frontend | Alta | Médio | Manter APIs antigas por 30 dias |
| Webhooks parados | Média | Alto | Testar em staging primeiro |

---

## ✅ Checklist de Conclusão

- [ ] Store é a única fonte de verdade
- [ ] CompanyProfile estende Store (OneToOne)
- [ ] MessageDispatcher centralizado funciona
- [ ] Webhooks unificados em `/webhooks/v1/`
- [ ] APIs legadas removidas do frontend
- [ ] Permissões de loja validadas em todas as views
- [ ] Testes passando
- [ ] Documentação atualizada

---

*Criado em: 2026-02-02*
*Próximo passo: Iniciar Fase 1*
