# 🔗 Complete API Endpoints Reference

## Base URL
```
http://localhost:8000/api/
```

---

## 👤 User Management Endpoints

### 1. Register New User
```
POST /users/register/
Content-Type: application/json

{
  "username": "joao123",
  "email": "joao@example.com",
  "password": "secure_password",
  "first_name": "João",
  "last_name": "Silva"
}

Response: 201 Created
{
  "id": "uuid",
  "username": "joao123",
  "email": "joao@example.com",
  ...
}
```

### 2. Get Current User Profile
```
GET /users/profile/
Authorization: Token YOUR_TOKEN

Response: 200 OK
{
  "id": "uuid",
  "username": "joao123",
  "email": "joao@example.com",
  "first_name": "João",
  "last_name": "Silva",
  "phone": "+5511987654321",
  "cpf": "12345678901",
  "date_of_birth": "1990-01-15",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01234-567",
  "country": "Brazil",
  "created_at": "2026-01-02T10:00:00Z",
  "updated_at": "2026-01-02T10:00:00Z"
}
```

### 3. Update User Profile
```
PUT /users/profile/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "phone": "+5511987654321",
  "cpf": "12345678901",
  "date_of_birth": "1990-01-15",
  "address": "Rua Principal, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01234-567"
}

Response: 200 OK
```

---

## 📦 Product Endpoints

### 1. List All Products (Paginated)
```
GET /products/
Query Parameters:
  - page=1 (pagination)
  - category=electronics (filter)
  - search=notebook (search)
  - ordering=price (or -price for descending)

Response: 200 OK
{
  "count": 100,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "name": "Notebook Dell",
      "description": "Powerful laptop",
      "price": "2999.99",
      "stock_quantity": 10,
      "image": "/media/products/notebook.jpg",
      "category": "electronics",
      "sku": "DELL-001",
      "is_active": true,
      "created_at": "2026-01-02T10:00:00Z"
    }
  ]
}
```

### 2. Get Product Details
```
GET /products/{product-uuid}/

Response: 200 OK
{
  "id": "uuid",
  "name": "Notebook Dell",
  "description": "Powerful laptop for work and gaming",
  "price": "2999.99",
  "stock_quantity": 10,
  "image": "/media/products/notebook.jpg",
  "category": "electronics",
  "sku": "DELL-001",
  "is_active": true,
  "created_at": "2026-01-02T10:00:00Z",
  "updated_at": "2026-01-02T10:00:00Z"
}
```

### 3. Search Products
```
GET /products/search/?q=notebook&category=electronics

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Notebook Dell",
    "price": "2999.99",
    ...
  }
]
```

### 4. Get All Categories
```
GET /products/categories/

Response: 200 OK
{
  "categories": ["electronics", "accessories", "software", ...]
}
```

---

## 🛒 Shopping Cart Endpoints

### 1. Get User's Cart
```
GET /cart/list/
Authorization: Token YOUR_TOKEN

Response: 200 OK
{
  "id": "uuid",
  "user": "uuid",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Notebook Dell",
        "price": "2999.99",
        "image": "/media/products/notebook.jpg"
      },
      "quantity": 1,
      "subtotal": "2999.99",
      "created_at": "2026-01-02T10:00:00Z"
    }
  ],
  "total": "2999.99",
  "item_count": 1,
  "created_at": "2026-01-02T10:00:00Z"
}
```

### 2. Add Item to Cart
```
POST /cart/add_item/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "product_id": "product-uuid",
  "quantity": 2
}

Response: 201 Created
{
  "id": "uuid",
  "product": { ... },
  "quantity": 2,
  "subtotal": "5999.98"
}
```

### 3. Update Item Quantity
```
POST /cart/update_item/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "product_id": "product-uuid",
  "quantity": 3
}

Response: 200 OK
{
  "id": "uuid",
  "quantity": 3,
  "subtotal": "8999.97"
}
```

### 4. Remove Item from Cart
```
POST /cart/remove_item/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "product_id": "product-uuid"
}

Response: 200 OK
{
  "message": "Item removed from cart"
}
```

### 5. Clear Entire Cart
```
POST /cart/clear/
Authorization: Token YOUR_TOKEN

Response: 200 OK
{
  "message": "Cart cleared"
}
```

---

## 📋 Order Endpoints

### 1. List User's Orders
```
GET /orders/
Authorization: Token YOUR_TOKEN
Query Parameters:
  - page=1 (pagination)
  - ordering=-created_at (most recent first)

Response: 200 OK
{
  "count": 5,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "uuid",
      "order_number": "ORD-ABC123",
      "total_amount": "2999.99",
      "status": "completed",
      "shipping_address": "Rua Principal, 123",
      "shipping_city": "São Paulo",
      "shipping_state": "SP",
      "shipping_zip_code": "01234-567",
      "shipping_country": "Brazil",
      "created_at": "2026-01-02T10:00:00Z"
    }
  ]
}
```

### 2. Get Order Details
```
GET /orders/{order-uuid}/
Authorization: Token YOUR_TOKEN

Response: 200 OK
{
  "id": "uuid",
  "order_number": "ORD-ABC123",
  "user": "uuid",
  "total_amount": "2999.99",
  "status": "completed",
  "shipping_address": "Rua Principal, 123",
  "shipping_city": "São Paulo",
  "shipping_state": "SP",
  "shipping_zip_code": "01234-567",
  "shipping_country": "Brazil",
  "items": [
    {
      "id": "uuid",
      "product": {
        "id": "uuid",
        "name": "Notebook Dell",
        "price": "2999.99"
      },
      "quantity": 1,
      "price": "2999.99"
    }
  ],
  "created_at": "2026-01-02T10:00:00Z"
}
```

### 3. Get Order Items
```
GET /orders/{order-uuid}/items/
Authorization: Token YOUR_TOKEN

Response: 200 OK
[
  {
    "id": "uuid",
    "product": {
      "id": "uuid",
      "name": "Notebook Dell",
      "price": "2999.99"
    },
    "quantity": 1,
    "price": "2999.99",
    "subtotal": "2999.99"
  }
]
```

### 4. Update Order Status (Admin Only)
```
PATCH /orders/{order-uuid}/update_status/
Authorization: Token YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}

Valid statuses: pending, processing, shipped, delivered, cancelled

Response: 200 OK
{
  "id": "uuid",
  "order_number": "ORD-ABC123",
  "status": "shipped",
  ...
}
```

---

## 💳 Checkout Endpoints

### 1. Create Checkout (from Cart)
```
POST /checkout/create_checkout/
Authorization: Token YOUR_TOKEN
Content-Type: application/json

{
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "customer_phone": "+5511987654321",
  "billing_address": "Rua Principal, 123",
  "billing_city": "São Paulo",
  "billing_state": "SP",
  "billing_zip_code": "01234-567",
  "billing_country": "Brazil",
  "payment_method": "credit_card"
}

Valid payment methods: credit_card, debit_card, pix, bank_transfer

Response: 201 Created
{
  "id": "uuid",
  "session_token": "unique-secure-token",
  "payment_link": "https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=123",
  "total_amount": "2999.99",
  "payment_status": "pending",
  "payment_method": "credit_card",
  "order": {
    "id": "uuid",
    "order_number": "ORD-XYZ789",
    "status": "pending",
    "total_amount": "2999.99"
  },
  "customer_name": "João Silva",
  "customer_email": "joao@example.com",
  "created_at": "2026-01-02T10:00:00Z",
  "expires_at": "2026-02-01T10:00:00Z"
}
```

### 2. Get Checkout Details
```
GET /checkout/details/?token=unique-secure-token

Response: 200 OK
{
  "id": "uuid",
  "session_token": "unique-secure-token",
  "payment_status": "completed",
  "mercado_pago_payment_id": "MP-123456",
  "payment_link": "https://...",
  "total_amount": "2999.99",
  "order": {
    "id": "uuid",
    "order_number": "ORD-XYZ789"
  },
  "completed_at": "2026-01-02T10:30:00Z"
}
```

### 3. List User's Checkouts
```
GET /checkout/list/
Authorization: Token YOUR_TOKEN

Response: 200 OK
{
  "count": 3,
  "results": [
    {
      "id": "uuid",
      "session_token": "token",
      "payment_status": "completed",
      "total_amount": "2999.99",
      "created_at": "2026-01-02T10:00:00Z"
    }
  ]
}
```

---

## 🔔 Webhook Endpoints

### 1. Mercado Pago Payment Webhook
```
POST /webhooks/mercado_pago/
Content-Type: application/json

{
  "topic": "payment",
  "id": "123456789",
  "action": "payment.created",
  "data": {
    "id": "123456789"
  }
}

Response: 200 OK
{
  "message": "Webhook processed successfully"
}
```

**No authentication required** - Mercado Pago will post directly

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "details": "Specific error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Invalid token."
}
```

### 403 Forbidden
```json
{
  "detail": "Permission denied."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## 🔐 Authentication

All endpoints requiring authentication use:
```
Authorization: Token YOUR_TOKEN_HERE
```

### Get Token (Development)
Login via: `http://localhost:8000/api-auth/login/`

Or use:
```bash
curl -X POST http://localhost:8000/api-auth/ \
  -H "Content-Type: application/json" \
  -d '{"username":"user","password":"pass"}'
```

---

## 🧪 Testing with cURL

### List Products
```bash
curl http://localhost:8000/api/products/
```

### Add to Cart
```bash
curl -X POST http://localhost:8000/api/cart/add_item/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"product_id":"uuid","quantity":1}'
```

### Create Checkout
```bash
curl -X POST http://localhost:8000/api/checkout/create_checkout/ \
  -H "Authorization: Token YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name":"João Silva",
    "customer_email":"joao@example.com",
    "customer_phone":"+5511987654321",
    "billing_address":"Rua Principal, 123",
    "billing_city":"São Paulo",
    "billing_state":"SP",
    "billing_zip_code":"01234-567",
    "payment_method":"credit_card"
  }'
```

---

## 📱 Pagination

List endpoints return paginated results:

```json
{
  "count": 100,
  "next": "http://localhost:8000/api/products/?page=2",
  "previous": null,
  "results": [...]
}
```

### Pagination Parameters
```
?page=1                 # Page number
?page=2&page_size=50    # Custom page size
```

---

## 🔍 Filtering & Search

### By Category
```
GET /products/?category=electronics
```

### By Status
```
GET /orders/?status=completed
```

### Search
```
GET /products/search/?q=notebook
```

### Ordering
```
GET /products/?ordering=price          # Ascending
GET /products/?ordering=-price         # Descending
GET /orders/?ordering=-created_at      # Most recent first
```

---

## 💾 Response Codes

| Code | Status | Meaning |
|------|--------|---------|
| 200 | OK | Request successful |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid data |
| 401 | Unauthorized | Auth required |
| 403 | Forbidden | Permission denied |
| 404 | Not Found | Resource not found |
| 500 | Server Error | Server issue |

---

## 🔄 Payment Status Flow

```
pending → processing → completed
  ↓
  └→ failed
  └→ cancelled
  └→ refunded
```

---

## 📋 Order Status Flow

```
pending → processing → shipped → delivered
  ↓
  └→ cancelled
```

---

## 🛠️ Common Patterns

### Get User's Cart and Total
```
GET /cart/list/
Authorization: Token YOUR_TOKEN

Returns: Cart with items, total, and item_count
```

### Create Order from Cart
```
1. POST /checkout/create_checkout/ (creates order + checkout)
2. Cart is automatically cleared
3. Returns payment_link for user redirect
```

### Track Order Status
```
GET /orders/{order-id}/
Authorization: Token YOUR_TOKEN

Check 'status' field for current state
```

---

## 🚀 Rate Limiting

No rate limiting configured (development).
In production, consider adding rate limiting per IP/token.

---

## 📞 API Status

Check API status:
```
GET http://localhost:8000/api/
```

Returns list of all available endpoints.

---

## 🔗 Related Documentation

- See `README.md` for setup
- See `API_DOCUMENTATION.md` for detailed info
- See `FRONTEND_INTEGRATION.md` for frontend usage

---

**Last Updated**: January 2, 2026
**API Version**: 1.0.0
**Django Version**: 6.0
**DRF Version**: 3.16.1
