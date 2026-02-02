# Planejamento de Correcoes Prioritarias

## Objetivo
Endurecer seguranca/configuracao e remover chaves expostas, com mudancas de baixo risco e impacto imediato.

## P0 (critico)
- [x] Remover chaves HERE hardcoded de exemplos/documentacao e do backend (usar env ou vazio).
- [x] Endurecer settings de producao (SECRET_KEY e ALLOWED_HOSTS obrigatorios; evitar CORS allow-all em producao).
- [x] Bloquear webhooks do Instagram sem assinatura quando nao houver segredo em producao.

## P1 (alto)
- [x] Evitar logar fragmentos de token em autenticacao WebSocket (reducao de vazamento em logs).

## Observacoes
- Itens fora do escopo imediato (ex: migracao de auth para httpOnly cookie, calculo de unread, etc.) serao tratados em uma proxima rodada.