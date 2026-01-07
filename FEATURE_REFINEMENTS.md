# Pastita – Novas Features & Refinamentos (propostas)

1. **Checkout & Pagamentos**
   - Garantir exibição consistente de QR Code/valor no `/pendente`: normalizar resposta do MP, testes e2e PIX/boleto, fallback de cache e render sem login.
   - Fluxo de retirada: nunca salvar endereço da loja no perfil; validar criação do checkout pickup e bloquear campos/CSRF apropriados.

2. **Autenticação & Sessão**
   - Revisar bootstrap do token via cookie HttpOnly + header fallback; garantir que refresh/aba nova não derrube sessão (401 silencioso) em rotas de status.
   - Endpoints públicos: confirmar permissão `AllowAny` onde o status precisa carregar sem login (ex.: `/checkout/status/`).

3. **CSRF & Robustez**
   - Centralizar `fetchCsrfToken` na inicialização da app e ao trocar de aba/rota crítica; adicionar retry com backoff para 403 CSRF.

4. **Cache & Performance**
   - Revalidar TTL e invalidation de caches de perfil/carrinho/produtos; evitar múltiplos fetches na montagem e em navegação entre páginas.

5. **UX de Checkout**
   - Destacar modo entrega vs retirada (UI e resumo); bloquear salvar endereço na retirada; pré-visualizar endereço da loja (mapa) e link Maps.
   - Mensagens de erro de pagamento mais claras (PIX expirado, CSRF, 401), com botões de tentar novamente.

6. **Observabilidade**
   - Logar eventos-chave no frontend (checkout criado, status atualizado, falha de CSRF, 401) com contexto de order_number e shipping_method.
   - No backend, auditar webhooks/checkout status para facilitar suporte (id do pagamento, status anterior/atual, total).

7. **Documentação**
   - Atualizar README/Quickstart com rotas principais (checkout/status/public), dependências de cookie HttpOnly e passos para testar PIX/boleto em sandbox.

8. **SEO & Hidratação**
   - Revisar modais condicionais (promo, login) para evitar hydration mismatch; assegurar que componentes SSR tenham estado inicial estável.
