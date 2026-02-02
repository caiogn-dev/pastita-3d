# 📋 ANÁLISE COMPLETA: TODOs, PLACEHOLDERS, MOCKS E CÓDIGO NÃO IMPLEMENTADO

> **Data da análise:** 30/01/2026  
> **Projetos analisados:** `server`, `pastita-3d`, `pastita-dash`

---

## 📁 ÍNDICE

1. [Resumo Executivo](#resumo-executivo)
2. [Server (Backend Python/Django)](#server-backend-pythondjango)
3. [Pastita-3D (Frontend React)](#pastita-3d-frontend-react)
4. [Pastita-Dash (Dashboard React)](#pastita-dash-dashboard-react)
5. [Recomendações Prioritárias](#recomendações-prioritárias)

---

## RESUMO EXECUTIVO

| Métrica | Server | Pastita-3D | Pastita-Dash | Total |
|---------|--------|------------|--------------|-------|
| TODOs | 5 | 0 | 1 | **6** |
| FIXMEs | 0 | 0 | 0 | **0** |
| Placeholders de integração | 0 | 1 | 1 | **2** |
| Dados mockados/fake | 2 | 2 | 8+ | **12+** |
| Console.logs de debug | 0 | ~59 | ~50+ | **~109** |
| Stubs/funções vazias | ~25 | 0 | 4 | **~29** |
| Tratamento silencioso de erros | ~20 | 0 | 8+ | **~28** |

---

## SERVER (BACKEND PYTHON/DJANGO)

### 🔴 1. TODOs PENDENTES

| Arquivo | Linha | Conteúdo | Prioridade |
|---------|-------|----------|------------|
| `apps/whatsapp/consumers.py` | 227 | `# TODO: Add more granular permission checks if needed` | Média |
| `apps/instagram/webhooks/handlers.py` | 177 | `# TODO: Process postback` | **Alta** |
| `apps/instagram/webhooks/handlers.py` | 183 | `# TODO: Process referral` | **Alta** |
| `apps/instagram/webhooks/handlers.py` | 216 | `# TODO: Process comment` | **Alta** |
| `apps/instagram/webhooks/handlers.py` | 221 | `# TODO: Process mention` | **Alta** |

**Análise:** O módulo de Instagram tem 4 funcionalidades de webhook não implementadas (postback, referral, comment, mention). Esses são eventos importantes para automações de marketing.

---

### 🟡 2. MÉTODOS ABSTRATOS (`pass` - ESPERADO)

| Arquivo | Linhas | Contexto |
|---------|--------|----------|
| `domain/entities/social_message.py` | 198, 220, 231, 242, 260, 276, 287, 297, 304, 314 | Métodos abstratos da classe base `SocialMessage` |

**Status:** ✅ **Esperado** - São métodos abstratos que devem ser implementados pelas subclasses (WhatsAppMessage, InstagramMessage, etc.).

---

### 🟠 3. TRATAMENTO SILENCIOSO DE ERROS (`pass` em except)

| Arquivo | Linhas | Contexto |
|---------|--------|----------|
| `apps/core/export_views.py` | 142, 149, 229, 236, 314, 321, 390, 397, 466, 473 | `pass` em `except ValueError` - Parsing de datas |
| `apps/core/auth_views.py` | 152 | `pass` em bloco except |
| `apps/core/consumers.py` | 197 | `pass` em bloco `else` |
| `apps/whatsapp/tasks.py` | 300 | `pass` em bloco except |
| `apps/whatsapp/tasks/__init__.py` | 152 | `pass` em tratamento de exceção |
| `apps/whatsapp/services/webhook_service.py` | 579 | `pass` (contexto não identificado) |
| `apps/langflow/services/langflow_service.py` | 109, 118 | `pass` em blocos except |
| `apps/langflow/api/views.py` | 74 | `pass` em bloco `except Exception` |
| `apps/marketing/api/views.py` | 334, 516, 791, 813, 883 | `pass` em tratamentos de erro |
| `apps/stores/services/store_service.py` | 203 | `pass` em bloco except |
| `apps/stores/apps.py` | 10 | `pass` em método `ready` |
| `apps/stores/consumers.py` | 73, 87 | `pass` em blocos de tratamento |
| `apps/stores/api/export_views.py` | 51 | `pass` em bloco except |

**Análise:** ⚠️ **Problema potencial** - Muitos erros estão sendo silenciados sem logging. Isso pode dificultar debugging em produção.

---

### 🔵 4. PLACEHOLDERS E DADOS MOCKADOS

| Arquivo | Linha | Conteúdo | Status |
|---------|-------|----------|--------|
| `apps/automation/api/views.py` | 266 | `'pix_code': '00020126580014br.gov.bcb.pix...'` | 🔴 **Código PIX mockado** - Deve ser substituído por integração real |
| `apps/marketing/api/views.py` | 745 | `'example': 'https://...'` | 🟡 URL placeholder |

---

### 🟢 5. MOCKS EM TESTES

| Arquivo | Linhas | Descrição |
|---------|--------|-----------|
| `tests/test_store_maps_api.py` | 6-101 | Uso extensivo de `unittest.mock.patch` e mocks para `maps_service` |

**Status:** ✅ **Normal** - Uso adequado de mocks em testes unitários.

---

## PASTITA-3D (FRONTEND REACT)

### 🔴 1. PLACEHOLDERS DE INTEGRAÇÃO

| Arquivo | Linha | Conteúdo | Prioridade |
|---------|-------|----------|------------|
| `src/services/logger.js` | 37-40 | Código Sentry comentado - placeholder para integração | Média |

```javascript
// Sentry integration placeholder
// if (typeof window !== 'undefined' && window.Sentry) {
//   window.Sentry.captureException(error, { extra: context });
// }
```

---

### 🟡 2. IDs TEMPORÁRIOS/FAKE

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/context/CartContext.jsx` | 77 | `cart_item_id: \`temp_${product.id}\`` |
| `src/context/CartContext.jsx` | 86 | `cart_item_id: \`temp_combo_${combo.id}\`` |
| `src/context/CartContext.jsx` | 220, 237, 262, 288 | Verificação `!item.cart_item_id.startsWith('temp_')` |

**Análise:** IDs temporários são criados para itens do carrinho antes de sincronizar com o backend. Padrão `temp_*` usado para distinguir itens locais dos persistidos. ✅ **Comportamento esperado**.

---

### 🟠 3. PLACEHOLDERS DE UI

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/components/checkout/OrderConfirmation.jsx` | 37 | `<div className={styles.itemPlaceholder}>🍝</div>` |

**Análise:** Placeholder de emoji para imagem do produto no checkout. 🟡 Deve ser substituído por imagem real do produto.

---

### 🟢 4. ALERTS NATIVOS (substituir por toasts)

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/context/CartContext.jsx` | 167 | `alert('Erro ao adicionar ao carrinho.');` |
| `src/context/CartContext.jsx` | 206 | `alert('Erro ao adicionar combo ao carrinho.');` |

**Análise:** Uso de `alert()` nativo do JavaScript - deve ser substituído por sistema de notificação/toast da aplicação.

---

### 🔵 5. CONSOLE.LOGS DE DEBUGGING (~59 ocorrências)

| Arquivo | Quantidade | Observação |
|---------|------------|------------|
| `src/components/checkout/hooks/useGeolocation.js` | 14 | Debug de geolocalização |
| `src/components/checkout/DeliveryMapSimple.jsx` | 20 | Debug de mapa |
| `src/components/checkout/hooks/useDelivery.js` | 2 | Debug de entrega |
| `src/services/hereMapService.js` | 1 | Debug de serviço |
| `src/services/logger.js` | 4 | Esperado - serviço de log |
| `src/components/checkout/PaymentStep.jsx` | 1 | Debug de pagamento |
| `src/context/CartContext.jsx` | 8 | Debug de carrinho |
| `src/context/StoreContext.jsx` | 1 | Debug de store |
| `src/pages/PaymentSuccess.jsx` | 1 | Debug de sucesso |
| `src/pages/PaymentPending.jsx` | 1 | Debug de pendente |
| `src/pages/Profile.jsx` | 7 | Debug de perfil |

---

### 🟣 6. FUNÇÕES COM RETORNOS DE FALLBACK

Estas funções retornam `null`, `{}` ou `[]` em casos de erro (comportamento esperado, mas documentado):

| Arquivo | Função/Contexto | Retorno |
|---------|-----------------|---------|
| `src/utils/routeCache.js` | getCachedRoute | `{}` / `null` |
| `src/services/hereMapService.js` | Várias funções | `[]` / `null` |
| `src/services/hereRoutingService.js` | calculateRoute | `[]` |
| `src/services/storeApi.js` | getStoreSlug | `null` |
| `src/context/CartContext.jsx` | getCachedCart | `null` |
| `src/context/StoreContext.jsx` | fetchCatalog | `null` |
| `src/context/AuthContext.jsx` | Várias funções | `null` |
| `src/pages/CheckoutPage.jsx` | calculateInstallments | `[]` |
| `src/pages/PaymentPending.jsx` | Render condicional | `null` |
| `src/pages/PaymentSuccess.jsx` | Render condicional | `null` |
| `src/pages/Profile.jsx` | Render condicional | `null` |
| `src/pages/pedido/status.jsx` | Render condicional | `null` |
| `src/components/CartSidebar.jsx` | Render condicional | `null` |
| `src/components/LoginModal.jsx` | Render condicional | `null` |
| `src/components/StockBadge.jsx` | Render condicional | `null` |
| `src/components/InteractiveMap.jsx` | Várias funções | `null` |
| `src/components/Toast.jsx` | Render condicional | `null` |
| `src/components/checkout/AddressConfirmation.jsx` | Render condicional | `null` |
| `src/components/checkout/LocationModal.jsx` | Render condicional | `null` |
| `src/components/ui/Modal.jsx` | Render condicional | `null` |
| `src/components/ui/PixPayment.jsx` | Render condicional | `null` |

---

### 🟤 7. ESLINT DISABLE

| Arquivo | Linha | Contexto |
|---------|-------|----------|
| `src/components/InteractiveMap.jsx` | 269 | `// eslint-disable-next-line react-hooks/exhaustive-deps` |

---

## PASTITA-DASH (DASHBOARD REACT)

### 🔴 1. TODOs PENDENTES

| Arquivo | Linha | Conteúdo | Prioridade |
|---------|-------|----------|------------|
| `src/components/chat/ChatWindow.tsx` | 56 | `unreadCount: 0, // TODO: Calculate from messages` | Média |

---

### 🟡 2. STUBS/FUNÇÕES VAZIAS

| Arquivo | Linhas | Conteúdo |
|---------|--------|----------|
| `src/hooks/useWebSocket.ts` | 11-34 | Stub hooks for backwards compatibility |
| `src/hooks/useWebSocket.ts` | 12-18 | `useNotificationWebSocket()` - stub que apenas retorna `subscribe` e `isConnected` |
| `src/hooks/useWebSocket.ts` | 20-26 | `useDashboardWebSocket()` - stub que apenas retorna `subscribe` e `isConnected` |
| `src/hooks/useWebSocket.ts` | 28-34 | `useChatWebSocket()` - stub com `sendMessage: useCallback(() => {}, [])` |
| `src/services/index.ts` | 17 | `// Note: WebSocket service stubs have been removed` |
| `src/services/websocket.ts` | 4-6 | `// NOTE: The old WebSocket service stubs have been removed.` |

---

### 🟠 3. PLACEHOLDERS DE INTEGRAÇÃO

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/services/logger.ts` | 47-51 | Sentry integration placeholder - código comentado |

```typescript
// Sentry integration placeholder
// if (typeof window !== 'undefined' && (window as any).Sentry) {
//   (window as any).Sentry.captureException(error, { extra: context });
// }
```

---

### 🔵 4. DADOS MOCKADOS/FAKE/SAMPLE

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/services/marketingService.ts` | 1138 | `// Fallback: do client-side replacement with sample data` |
| `src/services/marketingService.ts` | 1140 | `customer_name: 'Cliente Exemplo'` |
| `src/services/marketingService.ts` | 1141 | `name: 'Cliente Exemplo'` |
| `src/services/marketingService.ts` | 1143 | `email: 'cliente@exemplo.com'` |
| `src/services/marketingService.ts` | 1178 | `email: 'cliente@exemplo.com'` (fallback) |
| `src/services/marketingService.ts` | 1179 | `name: 'Cliente Exemplo'` (fallback) |
| `src/services/marketingService.ts` | 1084-1120 | Dados de exemplo para variáveis de templates |

**Variáveis de exemplo encontradas:**
- `customer_name: 'João Silva'`
- `email: 'joao@email.com'`
- `coupon_code: 'DESCONTO10'`
- `product_name: 'Produto Exemplo'`
- `order_total: 'R$ 99,90'`
- `delivery_address: 'Rua Exemplo, 123'`
- `phone: '(11) 98765-4321'`

---

### 🟢 5. PLACEHOLDERS DE INPUT (exemplo.com)

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/pages/automation/ReportsPage.tsx` | 597 | `placeholder="email@exemplo.com"` |
| `src/pages/automation/ReportsPage.tsx` | 716 | `placeholder="email1@exemplo.com, email2@exemplo.com"` |
| `src/pages/marketing/SubscribersPage.tsx` | 469 | `placeholder="email@exemplo.com"` |
| `src/pages/products/ProductsPageNew.tsx` | 1005 | `placeholder="https://exemplo.com/imagem.jpg"` |

---

### 🟣 6. FUNÇÕES DE EXEMPLO/CÁLCULO

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/pages/stores/StoreSettingsPage.tsx` | 200 | `calculateExampleFee` - função de exemplo para cálculo de taxa |
| `src/pages/stores/StoreSettingsPage.tsx` | 427-431 | Exemplo de cálculo de taxa de entrega |

---

### 🟤 7. RETORNOS DE FALLBACK VAZIOS

| Arquivo | Linha | Conteúdo |
|---------|-------|----------|
| `src/services/marketingService.ts` | 534 | `return [];` (fallback em getCampaigns) |
| `src/services/marketingService.ts` | 825 | `return [];` (fallback em getSubscribers) |
| `src/services/marketingService.ts` | 939 | `return [];` (fallback em getAutomations) |
| `src/services/marketingService.ts` | 948 | `return null;` (fallback em getAutomation) |
| `src/services/marketingService.ts` | 1002 | `return [];` (fallback em getTemplates) |
| `src/services/logger.ts` | 162 | `return [];` (getStoredErrors erro) |
| `src/services/logger.ts` | 165 | `return [];` (getStoredErrors fora do window) |
| `src/services/delivery.ts` | 179, 182 | `return null;` |

---

### ⚫ 8. CONSOLE.LOGS DE DEBUGGING

| Arquivo | Quantidade | Observação |
|---------|------------|------------|
| `src/context/WebSocketContext.tsx` | ~20 | Debug de WebSocket |
| `src/hooks/useWhatsAppWS.ts` | ~15 | Debug de WhatsApp |
| `src/hooks/useOrdersWebSocket.ts` | ~10 | Debug de pedidos |
| `src/hooks/useNotificationSound.ts` | ~5 | Debug de som |

---

## RECOMENDAÇÕES PRIORITÁRIAS

### 🔴 ALTA PRIORIDADE

1. **Server: Implementar webhooks do Instagram**
   - Arquivo: `apps/instagram/webhooks/handlers.py`
   - Linhas: 177, 183, 216, 221
   - Ação: Implementar processamento de postback, referral, comment e mention

2. **Server: Substituir código PIX mockado**
   - Arquivo: `apps/automation/api/views.py`
   - Linha: 266
   - Ação: Integrar com API real de geração de PIX (ex: Mercado Pago, Stripe)

3. **Todos os projetos: Implementar integração com Sentry**
   - Arquivos: `src/services/logger.js`, `src/services/logger.ts`
   - Ação: Descomentar e configurar integração com Sentry para tracking de erros

---

### 🟡 MÉDIA PRIORIDADE

4. **Pastita-3D: Substituir alerts nativos**
   - Arquivo: `src/context/CartContext.jsx`
   - Linhas: 167, 206
   - Ação: Usar sistema de toast/notificação da aplicação

5. **Pastita-3D: Substituir placeholder de emoji**
   - Arquivo: `src/components/checkout/OrderConfirmation.jsx`
   - Linha: 37
   - Ação: Usar imagem real do produto

6. **Server: Adicionar logging em tratamentos silenciosos**
   - Arquivos: `apps/core/export_views.py`, `apps/marketing/api/views.py`
   - Ação: Substituir `pass` por logging apropriado (`logger.error`, `logger.warning`)

---

### 🟢 BAIXA PRIORIDADE

7. **Todos os projetos: Limpar console.logs**
   - Remover logs de debugging antes de deploy para produção
   - Manter apenas em serviços de log dedicados

8. **Pastita-Dash: Revisar stubs de WebSocket**
   - Arquivo: `src/hooks/useWebSocket.ts`
   - Avaliar se ainda são necessários ou podem ser removidos

9. **Pastita-Dash: Remover dados de exemplo hardcoded**
   - Arquivo: `src/services/marketingService.ts`
   - Substituir por dados dinâmicos ou remover fallbacks

---

## ARQUIVOS CRÍTICOS PARA REVISÃO

### Server (Backend)
```
apps/instagram/webhooks/handlers.py          # 4 TODOs pendentes
apps/automation/api/views.py                  # PIX mockado
apps/core/export_views.py                     # Erros silenciados
apps/marketing/api/views.py                   # Erros silenciados
```

### Pastita-3D (Frontend)
```
src/services/logger.js                        # Sentry não implementado
src/context/CartContext.jsx                   # Alerts nativos + temp IDs
src/components/checkout/OrderConfirmation.jsx # Placeholder emoji
```

### Pastita-Dash (Dashboard)
```
src/services/logger.ts                        # Sentry não implementado
src/services/marketingService.ts              # Dados mockados
src/hooks/useWebSocket.ts                     # Stubs
src/components/chat/ChatWindow.tsx            # TODO pendente
```

---

## CONCLUSÃO

A análise identificou **6 TODOs**, **~29 stubs/funções vazias**, **12+ dados mockados**, **~109 console.logs** e **~28 tratamentos silenciosos de erro** entre os três projetos.

**Principais problemas:**
1. Funcionalidades de Instagram não implementadas (4 TODOs)
2. Código PIX mockado que precisa de integração real
3. Sentry não implementado em ambos os frontends
4. Múltiplos tratamentos de erro silenciados no backend
5. Dados de exemplo hardcoded no serviço de marketing

**Próximos passos recomendados:**
1. Implementar webhooks do Instagram (postback, referral, comment, mention)
2. Integrar geração real de códigos PIX
3. Configurar Sentry em ambos os frontends
4. Revisar todos os `pass` em blocos except e adicionar logging
5. Remover console.logs de debugging antes do deploy

---

*Documento gerado automaticamente em 30/01/2026*
