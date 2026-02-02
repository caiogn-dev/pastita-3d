# ⚡ PASTITA - Cheat Sheet Rápido

## 🚀 Iniciar Tudo em 5 Minutos

```bash
# Terminal 1: PASTITA-3D (Frontend Loja)
cd pastita-3d
npm install
echo 'NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1' > .env.local
npm run dev
# → http://localhost:3000

# Terminal 2: PASTITA-DASH (Frontend Admin)
cd pastita-dash
npm install
echo 'VITE_API_URL=http://localhost:8000/api/v1' > .env.local
npm run dev
# → http://localhost:12001

# Terminal 3: SERVER-MAIN (Backend API)
cd server-main
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
# → http://localhost:8000

# Terminal 4: Celery Worker
cd server-main
source venv/bin/activate
celery -A config worker -l info

# Terminal 5: Celery Beat
cd server-main
source venv/bin/activate
celery -A config beat -l info
```

---

## 📁 Arquivos Mais Importantes

| Arquivo | O quê | Modificar quando |
|---------|-------|------------------|
| `tom.yml` | Configuração MCP Codex | Mudança estrutural |
| `pastita-3d/src/context/AuthContext.jsx` | Auth logic | Bug de autenticação |
| `pastita-3d/src/context/CartContext.jsx` | Cart state | Erro no carrinho |
| `pastita-dash/src/stores/authStore.ts` | Dashboard auth | Admin login |
| `server-main/config/settings/base.py` | Django config | Novos apps/settings |
| `server-main/config/urls.py` | Rotas backend | Novo endpoint |
| `server-main/apps/ecommerce/views.py` | Produto endpoints | CRUD de produtos |
| `server-main/apps/orders/models.py` | Modelo Order | Estrutura pedido |
| `server-main/apps/payments/views.py` | Webhook Mercado Pago | Integração pagamento |
| `server-main/apps/whatsapp/views.py` | Webhook WhatsApp | Integração WhatsApp |

---

## 🔗 URLs Importantes

### Frontend
| Projeto | URL | Para | User |
|---------|-----|------|------|
| PASTITA-3D | http://localhost:3000 | Loja | Customer |
| PASTITA-3D | http://localhost:3000/cardapio | Catálogo | Todos |
| PASTITA-3D | http://localhost:3000/login | Login | Anônimo |
| PASTITA-3D | http://localhost:3000/checkout | Compra | Autenticado |
| PASTITA-3D | http://localhost:3000/perfil | Meu perfil | Autenticado |
| PASTITA-DASH | http://localhost:12001 | Dashboard | Admin |

### Backend (API)
| Endpoint | Método | Descrição | Auth |
|----------|--------|-----------|------|
| `/api/v1/auth/login/` | POST | Fazer login | ❌ |
| `/api/v1/auth/register/` | POST | Criar conta | ❌ |
| `/api/v1/stores/{store_slug}/catalog/` | GET | Catálogo público da loja | ❌ |
| `/api/v1/stores/{store_slug}/cart/` | GET | Meu carrinho (slug obrigatório) | ✅ |
| `/api/v1/stores/{store_slug}/checkout/` | POST | Criar checkout de entrega | ✅ |
| `/api/v1/orders/` | GET | Meus pedidos | ✅ |
| `/api/v1/users/profile/` | GET | Meu perfil | ✅ |
| `/api/docs/` | GET | Swagger docs | ❌ |
| `/admin/` | GET | Django admin | ✅ Admin |

---

## 🎯 Fluxos Rápidos

### Cliente Comprar
```
1. Acessa /cardapio
2. Clica "Adicionar ao Carrinho"
3. LoginModal aparece → faz login
4. Produto adicionado
5. Clica "Finalizar Compra"
6. Seleciona endereço
7. Paga via Mercado Pago (QR code)
8. Recebe confirmação email + WhatsApp
9. Vê pedido em /perfil
```

### Admin Gerenciar Pedido
```
1. Acessa PASTITA-DASH
2. Login admin
3. Dashboard mostra pedidos novos
4. Clica em pedido
5. Muda status para "Preparando"
6. Cliente recebe notificação WhatsApp
7. Muda status para "Pronto"
8. Entregador pega
9. Muda para "Entregue"
10. Sistema pede avaliação
```

### Automação WhatsApp
```
1. Cliente envia mensagem no WhatsApp
2. Server recebe webhook
3. Langflow analisa mensagem
4. Gera resposta automática
5. Envia resposta via WhatsApp
6. Conversa registrada no dashboard
```

---

## 🐛 Debugging Rápido

### Frontend não carrega
```bash
# Verificar porta 3000
lsof -i :3000  # Mac/Linux
netstat -ano | findstr :3000  # Windows

# Matar processo
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows

# Limpar cache Next.js
rm -rf .next
npm run dev
```

### Erro de API (backend)
```bash
# Ver logs
tail -f server-main/logs/django.log

# Testar endpoint direto
curl http://localhost:8000/api/v1/products/

# Banco de dados vazio?
python manage.py migrate
python manage.py createsuperuser
```

### Token expirado
```javascript
// Frontend - renovar token automaticamente
// Já implementado em src/services/api.js
// Interceptor refaz request com novo token
```

---

## 📊 Estrutura de Dados Essencial

### User (Usuário)
```python
{
  "id": 1,
  "email": "cliente@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "is_active": true,
  "date_joined": "2026-01-11",
  "profile": {
    "phone": "11999999999",
    "address": "Rua X, 123",
    "city": "São Paulo",
    "state": "SP",
    "zip": "01310-100"
  }
}
```

### Product (Produto)
```python
{
  "id": 1,
  "name": "Penne Artesanal",
  "slug": "penne-artesanal",
  "description": "Massa fresca...",
  "price": "25.90",
  "cost": "12.00",
  "stock_quantity": 150,
  "category": {"id": 1, "name": "Massas"},
  "image": "https://...",
  "is_active": true,
  "is_featured": true,
  "created_at": "2026-01-01"
}
```

### Order (Pedido)
```python
{
  "id": 1,
  "user": {"id": 1, "email": "cliente@example.com"},
  "status": "confirmed",  # pending, confirmed, preparing, ready, delivered
  "items": [
    {"product": {...}, "quantity": 2, "price": "25.90"}
  ],
  "total_amount": "51.80",
  "shipping_cost": "15.00",
  "delivery_address": "Rua X, 123",
  "created_at": "2026-01-11T10:00:00Z",
  "delivery_date": "2026-01-13",
  "payment": {
    "status": "confirmed",
    "method": "pix"
  }
}
```

### Payment (Pagamento)
```python
{
  "id": 1,
  "order": 1,
  "amount": "66.80",
  "status": "confirmed",  # pending, confirmed, failed, refunded
  "method": "pix",  # pix, boleto, card
  "external_id": "MERCADO_PAGO_ID",
  "created_at": "2026-01-11T10:00:00Z",
  "processed_at": "2026-01-11T10:05:00Z"
}
```

### Message (Mensagem WhatsApp)
```python
{
  "id": 1,
  "conversation": 1,
  "sender": "5511999999999",
  "recipient": "+55 11 9999-9999",
  "text": "Olá! Qual é o status do meu pedido?",
  "status": "delivered",  # sent, delivered, read, failed
  "is_automated": false,
  "sent_at": "2026-01-11T10:00:00Z"
}
```

---

## 🛠️ Comandos Mais Usados

### Desenvolvimento
```bash
# Frontend
npm install                  # Instalar deps
npm run dev                 # Dev server
npm run build               # Build produção
npm run lint                # Checar código

# Backend
python manage.py runserver                # Dev server
python manage.py migrate                  # Aplicar migrations
python manage.py makemigrations           # Criar migrations
python manage.py createsuperuser          # Criar admin
python manage.py shell                    # Django REPL
python manage.py test                     # Rodas testes
pytest                                    # Testes pytest

# Celery
celery -A config worker -l info          # Worker
celery -A config beat -l info            # Scheduler
celery -A config events                   # Monitor tasks
```

### Banco de Dados
```bash
# PostgreSQL
psql -U postgres -d pastita              # Conectar
pg_dump pastita > backup.sql             # Backup
psql pastita < backup.sql                # Restaurar

# Redis
redis-cli                                # CLI Redis
redis-cli FLUSHALL                       # Limpar dados
redis-cli INFO                           # Ver info
```

### Docker
```bash
docker-compose up -d                     # Subir
docker-compose down                      # Parar
docker-compose logs -f                   # Ver logs
docker-compose exec web python manage.py migrate  # Migrations
docker-compose build                     # Rebuild
```

---

## 🔑 Variáveis de Ambiente Essenciais

### PASTITA-3D (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY=your-key
NEXT_PUBLIC_AUTH_COOKIE_NAME=auth_token
```

### PASTITA-DASH (.env.local)
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
VITE_ENV=development
```

### SERVER-MAIN (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
MERCADO_PAGO_ACCESS_TOKEN=your-token
WHATSAPP_BUSINESS_ACCOUNT_ID=your-id
LANGFLOW_API_URL=http://localhost:7860
RESEND_API_KEY=your-key
AWS_S3_BUCKET_NAME=your-bucket
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:12001
```

---

## 🧪 Testes Rápidos

```bash
# Frontend - linting
cd pastita-3d && npm run lint
cd pastita-dash && npm run lint

# Backend - testes
cd server-main
python manage.py test
pytest
pytest -v  # verbose
pytest --cov  # cobertura

# Testar endpoint específico
curl -X GET http://localhost:8000/api/v1/products/

# Com autenticação
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/v1/orders/
```

---

## 📚 Documentação

| Documento | Propósito | Ler quando |
|-----------|-----------|-----------|
| `tom.yml` | Config MCP | Sempre (especialmente ao usar Claude) |
| `PASTITA_GUIA_COMPLETO.md` | Documentação completa | Aprender estrutura |
| `PASTITA_MAPA_NAVEGACAO.md` | Navegação rápida | Procurar arquivo específico |
| `PASTITA_ARQUITETURA.md` | Diagrama técnico | Entender fluxos |
| `API_ENDPOINTS.md` | Endpoints da API | Integração com backend |

---

## 🎓 Padrões de Código

### React Hook
```jsx
const MyComponent = () => {
  const [state, setState] = useState(null);
  
  useEffect(() => {
    // Logic
  }, []);
  
  return <div>{state}</div>;
};
```

### Django Viewset
```python
class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter]
    filterset_fields = ['category', 'is_active']
    search_fields = ['name', 'description']
```

### Django Model
```python
class Product(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock_quantity = models.PositiveIntegerField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
```

### Celery Task
```python
@shared_task
def send_order_confirmation(order_id):
    order = Order.objects.get(id=order_id)
    # Logic to send email
    return f"Email sent for order {order_id}"
```

---

## 💡 Dicas Pro

1. **Sempre usar `.env.example`** para documentar vars de env
2. **Commits atômicos** - um feature por commit
3. **Branch naming**: `feature/`, `fix/`, `docs/`
4. **Code review** antes de merge no main
5. **Testes antes de deploy** - nunca pular!
6. **Logs úteis** - debug depois é mais fácil
7. **Docker para consistency** - local = produção
8. **Backup regular** - especialmente antes de migrations
9. **Documentation-driven development** - doc primeiro
10. **Keep it simple** - KISS principle sempre vale

---

## ❌ Erros Comuns

| Erro | Causa | Solução |
|------|-------|---------|
| Port 3000 already in use | Outra instância rodando | `kill -9 $(lsof -t -i:3000)` |
| CORS error | Frontend/backend URLs não match | Checar `CORS_ALLOWED_ORIGINS` |
| Token expired | JWT expirou | Usar refresh token (automático) |
| Migration conflict | Múltiplas migrations criadas | Delete e recriar |
| "No module named" | Deps não instalado | `pip install -r requirements.txt` |
| Database locked | Outro processo acessando | Restart Django |
| Celery task not working | Worker não rodando | `celery -A config worker` |
| API 500 error | Bug no backend | Ver logs: `tail -f logs/django.log` |

---

## 🚢 Deploy Checklist

- [ ] Testes passando
- [ ] Linter passando
- [ ] Build sem errors
- [ ] Environment variables configuradas
- [ ] Database migrations aplicadas
- [ ] Static files coletados
- [ ] Backups feitos
- [ ] Logs configurados
- [ ] Monitoring ativo
- [ ] Cache limpo
- [ ] CDN atualizado

---

**Última atualização**: 11 de janeiro de 2026  
**Imprima este arquivo!** 🖨️
