/**
 * Pastita API Service
 * Handles all API calls to the Pastita backend endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const PASTITA_API = `${API_BASE_URL}/pastita`;

/**
 * Helper function for API requests
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${PASTITA_API}${endpoint}`;
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Erro na requisição' }));
    throw new Error(error.detail || error.message || 'Erro na requisição');
  }

  return response.json();
}

// =============================================================================
// CATALOG / PRODUCTS
// =============================================================================

/**
 * Get full catalog (all products organized by category)
 */
export async function getCatalogo() {
  return apiRequest('/catalogo/');
}

/**
 * Get all products
 */
export async function getProdutos(params = {}) {
  const searchParams = new URLSearchParams(params);
  return apiRequest(`/produtos/?${searchParams}`);
}

/**
 * Get single product by ID
 */
export async function getProduto(id) {
  return apiRequest(`/produtos/${id}/`);
}

/**
 * Get all molhos (sauces)
 */
export async function getMolhos(params = {}) {
  const searchParams = new URLSearchParams(params);
  return apiRequest(`/molhos/?${searchParams}`);
}

/**
 * Get all carnes (meats)
 */
export async function getCarnes(params = {}) {
  const searchParams = new URLSearchParams(params);
  return apiRequest(`/carnes/?${searchParams}`);
}

/**
 * Get all rondellis (pastas)
 */
export async function getRondellis(params = {}) {
  const searchParams = new URLSearchParams(params);
  return apiRequest(`/rondellis/?${searchParams}`);
}

/**
 * Get classic rondellis only
 */
export async function getRondellisClassicos() {
  return apiRequest('/rondellis/classicos/');
}

/**
 * Get gourmet rondellis only
 */
export async function getRondellisGourmet() {
  return apiRequest('/rondellis/gourmet/');
}

/**
 * Get all combos
 */
export async function getCombos(params = {}) {
  const searchParams = new URLSearchParams(params);
  return apiRequest(`/combos/?${searchParams}`);
}

/**
 * Get featured combos
 */
export async function getCombosDestaques() {
  return apiRequest('/combos/destaques/');
}

/**
 * Get single combo by ID
 */
export async function getCombo(id) {
  return apiRequest(`/combos/${id}/`);
}

// =============================================================================
// CART
// =============================================================================

/**
 * Get current user's cart
 */
export async function getCarrinho() {
  return apiRequest('/carrinho/');
}

/**
 * Add product to cart
 */
export async function adicionarProdutoAoCarrinho(produtoId, quantidade = 1) {
  return apiRequest('/carrinho/adicionar_produto/', {
    method: 'POST',
    body: JSON.stringify({ produto_id: produtoId, quantidade }),
  });
}

/**
 * Add combo to cart
 */
export async function adicionarComboAoCarrinho(comboId, quantidade = 1) {
  return apiRequest('/carrinho/adicionar_combo/', {
    method: 'POST',
    body: JSON.stringify({ combo_id: comboId, quantidade }),
  });
}

/**
 * Update product quantity in cart
 */
export async function atualizarProdutoNoCarrinho(itemId, quantidade) {
  return apiRequest(`/carrinho/atualizar-produto/${itemId}/`, {
    method: 'POST',
    body: JSON.stringify({ quantidade }),
  });
}

/**
 * Update combo quantity in cart
 */
export async function atualizarComboNoCarrinho(itemId, quantidade) {
  return apiRequest(`/carrinho/atualizar-combo/${itemId}/`, {
    method: 'POST',
    body: JSON.stringify({ quantidade }),
  });
}

/**
 * Remove product from cart
 */
export async function removerProdutoDoCarrinho(itemId) {
  return apiRequest(`/carrinho/remover-produto/${itemId}/`, {
    method: 'DELETE',
  });
}

/**
 * Remove combo from cart
 */
export async function removerComboDoCarrinho(itemId) {
  return apiRequest(`/carrinho/remover-combo/${itemId}/`, {
    method: 'DELETE',
  });
}

/**
 * Clear entire cart
 */
export async function limparCarrinho() {
  return apiRequest('/carrinho/limpar/', {
    method: 'DELETE',
  });
}

// =============================================================================
// ORDERS
// =============================================================================

/**
 * Get user's orders
 */
export async function getPedidos() {
  return apiRequest('/pedidos/');
}

/**
 * Get single order by ID
 */
export async function getPedido(id) {
  return apiRequest(`/pedidos/${id}/`);
}

/**
 * Get order status
 */
export async function getStatusPedido(id) {
  return apiRequest(`/pedidos/${id}/status/`);
}

/**
 * Get WhatsApp confirmation URL for order
 */
export async function getWhatsAppConfirmacao(id) {
  return apiRequest(`/pedidos/${id}/whatsapp/`);
}

// =============================================================================
// CHECKOUT / PAYMENT
// =============================================================================

/**
 * Create checkout and get Mercado Pago payment URL
 */
export async function criarCheckout(data = {}) {
  return apiRequest('/checkout/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// AUTH
// =============================================================================

/**
 * Register new user
 */
export async function registrarUsuario(data) {
  return apiRequest('/auth/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Get user profile
 */
export async function getProfile() {
  return apiRequest('/auth/profile/');
}

/**
 * Update user profile
 */
export async function updateProfile(data) {
  return apiRequest('/auth/profile/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// =============================================================================
// EXPORT DEFAULT
// =============================================================================

const pastitaApi = {
  // Catalog
  getCatalogo,
  getProdutos,
  getProduto,
  getMolhos,
  getCarnes,
  getRondellis,
  getRondellisClassicos,
  getRondellisGourmet,
  getCombos,
  getCombosDestaques,
  getCombo,
  
  // Cart
  getCarrinho,
  adicionarProdutoAoCarrinho,
  adicionarComboAoCarrinho,
  atualizarProdutoNoCarrinho,
  atualizarComboNoCarrinho,
  removerProdutoDoCarrinho,
  removerComboDoCarrinho,
  limparCarrinho,
  
  // Orders
  getPedidos,
  getPedido,
  getStatusPedido,
  getWhatsAppConfirmacao,
  
  // Checkout
  criarCheckout,
  
  // Auth
  registrarUsuario,
  getProfile,
  updateProfile,
};

export default pastitaApi;
