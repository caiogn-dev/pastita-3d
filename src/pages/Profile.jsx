import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import * as storeApi from '../services/storeApi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Profile.css';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' }, { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' }, { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' }, { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' }, { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

const STATUS_CONFIG = {
  pending: { label: 'Pendente', color: '#f59e0b', bg: '#fef3c7', icon: '⏳' },
  confirmed: { label: 'Confirmado', color: '#3b82f6', bg: '#dbeafe', icon: '✓' },
  preparing: { label: 'Preparando', color: '#8b5cf6', bg: '#ede9fe', icon: '👨‍🍳' },
  ready: { label: 'Pronto', color: '#10b981', bg: '#d1fae5', icon: '✅' },
  delivering: { label: 'Em entrega', color: '#06b6d4', bg: '#cffafe', icon: '🚗' },
  delivered: { label: 'Entregue', color: '#22c55e', bg: '#dcfce7', icon: '📦' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: '#fee2e2', icon: '✕' },
  paid: { label: 'Pago', color: '#22c55e', bg: '#dcfce7', icon: '💰' },
};

const PAYMENT_STATUS_CONFIG = {
  pending: { label: 'Aguardando pagamento', color: '#f59e0b', icon: '⏳' },
  paid: { label: 'Pago', color: '#22c55e', icon: '✓' },
  failed: { label: 'Falhou', color: '#ef4444', icon: '✕' },
  refunded: { label: 'Reembolsado', color: '#6b7280', icon: '↩' },
};

const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

const formatMoney = (value) => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
};

const buildFormData = (profile) => ({
  first_name: profile?.first_name || '',
  last_name: profile?.last_name || '',
  email: profile?.email || '',
  phone: profile?.phone ? formatPhone(profile.phone) : '',
  cpf: profile?.cpf ? formatCPF(profile.cpf) : '',
  address: profile?.address || '',
  city: profile?.city || '',
  state: profile?.state || '',
  zip_code: profile?.zip_code ? formatCEP(profile.zip_code) : ''
});

// Order Detail Modal Component
const OrderDetailModal = ({ order, onClose, onReorder }) => {
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  
  useEffect(() => {
    const fetchDetails = async () => {
      if (!order?.id) return;
      setLoading(true);
      try {
        const details = await storeApi.getOrder(order.id);
        setOrderDetails(details);
      } catch (err) {
        console.error('Error fetching order details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [order?.id]);

  if (!order) return null;

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;
  const items = orderDetails?.items || order.items || [];
  const createdAt = order.created_at ? new Date(order.created_at) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Fechar">×</button>
        
        <div className="order-modal-header">
          <div>
            <h2>Pedido {order.order_number}</h2>
            {createdAt && (
              <p className="order-modal-date">
                {createdAt.toLocaleDateString('pt-BR', { 
                  day: '2-digit', month: 'long', year: 'numeric', 
                  hour: '2-digit', minute: '2-digit' 
                })}
              </p>
            )}
          </div>
          <div 
            className="order-status-badge"
            style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
          >
            <span>{statusConfig.icon}</span>
            <span>{statusConfig.label}</span>
          </div>
        </div>

        {loading ? (
          <div className="order-modal-loading">
            <div className="spinner"></div>
            <p>Carregando detalhes...</p>
          </div>
        ) : (
          <>
            {/* Payment Status */}
            <div className="order-modal-section">
              <h3>💳 Pagamento</h3>
              <div className="order-payment-info">
                <div className="payment-status" style={{ color: paymentConfig.color }}>
                  <span>{paymentConfig.icon}</span>
                  <span>{paymentConfig.label}</span>
                </div>
                {order.payment_status === 'pending' && orderDetails?.payment_link && (
                  <a 
                    href={orderDetails.payment_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-payment-link"
                  >
                    Pagar agora →
                  </a>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="order-modal-section">
              <h3>🛒 Itens do pedido</h3>
              <div className="order-items-list">
                {items.length > 0 ? items.map((item, idx) => (
                  <div key={item.id || idx} className="order-item-row">
                    <div className="order-item-info">
                      <span className="order-item-qty">{item.quantity}x</span>
                      <span className="order-item-name">{item.product_name}</span>
                      {item.variant_name && (
                        <span className="order-item-variant">({item.variant_name})</span>
                      )}
                    </div>
                    <span className="order-item-price">
                      R$ {formatMoney(item.subtotal || (item.unit_price * item.quantity))}
                    </span>
                  </div>
                )) : (
                  <p className="order-items-empty">Nenhum item encontrado</p>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-modal-section order-summary">
              <div className="order-summary-row">
                <span>Subtotal</span>
                <span>R$ {formatMoney(orderDetails?.subtotal || order.subtotal || 0)}</span>
              </div>
              {(orderDetails?.delivery_fee || order.delivery_fee) > 0 && (
                <div className="order-summary-row">
                  <span>Entrega</span>
                  <span>R$ {formatMoney(orderDetails?.delivery_fee || order.delivery_fee)}</span>
                </div>
              )}
              {(orderDetails?.discount || order.discount) > 0 && (
                <div className="order-summary-row discount">
                  <span>Desconto</span>
                  <span>-R$ {formatMoney(orderDetails?.discount || order.discount)}</span>
                </div>
              )}
              <div className="order-summary-row total">
                <span>Total</span>
                <span>R$ {formatMoney(orderDetails?.total || order.total || order.total_amount || 0)}</span>
              </div>
            </div>

            {/* Delivery Info */}
            {(orderDetails?.delivery_method === 'delivery' || order.delivery_method === 'delivery') && (
              <div className="order-modal-section">
                <h3>📍 Entrega</h3>
                <p className="order-delivery-address">
                  {orderDetails?.delivery_address?.label || 
                   orderDetails?.delivery_address?.street ||
                   order.shipping_address || 
                   'Endereço não informado'}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="order-modal-actions">
              <button className="btn-secondary" onClick={onClose}>
                Fechar
              </button>
              <button className="btn-primary" onClick={() => onReorder(order)}>
                🔄 Pedir novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { profile, updateProfile } = useAuth();
  const { addItem } = useCart();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => buildFormData(profile));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [ordersLoaded, setOrdersLoaded] = useState(false);
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ total_orders: 0, total_spent: 0 });
  
  // Modal state
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    setFormData(buildFormData(profile));
  }, [profile]);

  useEffect(() => {
    if (activeTab !== 'orders' || ordersLoaded) {
      return;
    }

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError('');
      try {
        const data = await storeApi.getUserOrders();
        const ordersList = data.results || data.recent_orders || data || [];
        const ordersArray = Array.isArray(ordersList) ? ordersList : [];
        setOrders(ordersArray);
        
        // Calculate stats
        const totalSpent = ordersArray.reduce((sum, o) => sum + (o.total || o.total_amount || 0), 0);
        setOrderStats({ 
          total_orders: ordersArray.length, 
          total_spent: totalSpent 
        });
        setOrdersLoaded(true);
      } catch {
        setOrdersError('Não foi possível carregar seus pedidos.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, ordersLoaded]);

  const formattedAddress = useMemo(() => {
    if (!profile) return 'Não informado';
    const parts = [
      profile.address,
      profile.city,
      profile.state,
      profile.zip_code ? formatCEP(profile.zip_code) : null
    ].filter(Boolean);
    return parts.length ? parts.join(', ') : 'Não informado';
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let formattedValue = value;

    if (name === 'phone') formattedValue = formatPhone(value);
    if (name === 'cpf') formattedValue = formatCPF(value);
    if (name === 'zip_code') formattedValue = formatCEP(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleCancel = () => {
    setFormData(buildFormData(profile));
    setIsEditing(false);
    setSaveError('');
    setSaveSuccess('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      await updateProfile({
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.replace(/\D/g, ''),
        cpf: formData.cpf.replace(/\D/g, ''),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        zip_code: formData.zip_code.replace(/\D/g, '')
      });
      setSaveSuccess('Perfil atualizado com sucesso!');
      setIsEditing(false);
    } catch {
      setSaveError('Não foi possível atualizar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleReorder = useCallback(async (order) => {
    try {
      // Fetch full order details if needed
      const details = await storeApi.getOrder(order.id);
      const items = details?.items || [];
      
      // Add items to cart
      for (const item of items) {
        // We need product data to add to cart - redirect to menu for now
        // In a full implementation, we'd fetch product details and add directly
      }
      
      // Navigate to menu with a message
      navigate('/cardapio');
    } catch (err) {
      console.error('Error reordering:', err);
      navigate('/cardapio');
    }
  }, [navigate]);

  return (
    <div className="profile-page">
      <Navbar />

      <div className="profile-container">
        <div className="profile-header">
          <h1>Minha conta</h1>
          <p>Gerencie seus dados e acompanhe seus pedidos.</p>
        </div>

        <div className="profile-tabs" role="tablist" aria-label="Perfil e pedidos">
          <button
            type="button"
            className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
            role="tab"
            aria-selected={activeTab === 'profile'}
          >
            Perfil
          </button>
          <button
            type="button"
            className={`profile-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
            role="tab"
            aria-selected={activeTab === 'orders'}
          >
            Pedidos
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-card">
            {!isEditing ? (
              <>
                <div className="profile-info-grid">
                  <div>
                    <span className="profile-label">Nome</span>
                    <span className="profile-value">
                      {profile?.first_name || profile?.last_name
                        ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                        : 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="profile-label">E-mail</span>
                    <span className="profile-value">{profile?.email || 'Não informado'}</span>
                  </div>
                  <div>
                    <span className="profile-label">Telefone</span>
                    <span className="profile-value">
                      {profile?.phone ? formatPhone(profile.phone) : 'Não informado'}
                    </span>
                  </div>
                  <div>
                    <span className="profile-label">CPF</span>
                    <span className="profile-value">
                      {profile?.cpf ? formatCPF(profile.cpf) : 'Não informado'}
                    </span>
                  </div>
                  <div className="profile-info-full">
                    <span className="profile-label">Endereço</span>
                    <span className="profile-value">{formattedAddress}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Editar informações
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Nome</label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Nome"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Sobrenome</label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Sobrenome"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Telefone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">CPF</label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">Endereço</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Rua, número, bairro"
                  />
                </div>

                <div className="form-grid-2">
                  <div className="form-field">
                    <label className="form-label">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Cidade"
                    />
                  </div>
                  <div className="form-field">
                    <label className="form-label">Estado</label>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="">Selecione</option>
                      {BRAZILIAN_STATES.map((state) => (
                        <option key={state.value} value={state.value}>{state.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-field">
                  <label className="form-label">CEP</label>
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="00000-000"
                  />
                </div>

                {saveError && <div className="profile-alert">{saveError}</div>}
                {saveSuccess && <div className="profile-alert profile-alert-success">{saveSuccess}</div>}

                <div className="profile-actions">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={saving}
                  >
                    {saving ? 'Salvando...' : 'Salvar'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="profile-card">
            <div className="orders-summary">
              <div>
                <span className="profile-label">Total de pedidos</span>
                <span className="profile-value">{orderStats.total_orders || 0}</span>
              </div>
              <div>
                <span className="profile-label">Total gasto</span>
                <span className="profile-value">R$ {formatMoney(orderStats.total_spent)}</span>
              </div>
            </div>

            {ordersLoading && (
              <div className="profile-loading">Carregando pedidos...</div>
            )}

            {ordersError && (
              <div className="profile-alert">{ordersError}</div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="profile-empty">Você ainda não realizou pedidos.</div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="orders-list">
                {orders.map((order) => {
                  const itemCount = order.items_count || (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                  const createdAt = order.created_at ? new Date(order.created_at) : null;
                  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  const paymentConfig = PAYMENT_STATUS_CONFIG[order.payment_status] || PAYMENT_STATUS_CONFIG.pending;
                  
                  return (
                    <div 
                      key={order.id} 
                      className="order-card"
                      onClick={() => setSelectedOrder(order)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === 'Enter' && setSelectedOrder(order)}
                    >
                      <div className="order-header">
                        <div className="order-header-left">
                          <span className="order-number">{order.order_number}</span>
                          {createdAt && (
                            <span className="order-date">
                              {createdAt.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <div 
                          className="order-status-pill"
                          style={{ backgroundColor: statusConfig.bg, color: statusConfig.color }}
                        >
                          {statusConfig.icon} {statusConfig.label}
                        </div>
                      </div>
                      
                      <div className="order-body">
                        <div className="order-info-row">
                          <div className="order-detail">
                            <span className="order-detail-label">Itens</span>
                            <span className="order-detail-value">{itemCount}</span>
                          </div>
                          <div className="order-detail">
                            <span className="order-detail-label">Total</span>
                            <span className="order-detail-value order-total">
                              R$ {formatMoney(order.total || order.total_amount)}
                            </span>
                          </div>
                          <div className="order-detail">
                            <span className="order-detail-label">Pagamento</span>
                            <span 
                              className="order-detail-value"
                              style={{ color: paymentConfig.color }}
                            >
                              {paymentConfig.icon} {paymentConfig.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="order-footer">
                        <span className="order-view-details">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onReorder={handleReorder}
        />
      )}
    </div>
  );
};

export default Profile;
