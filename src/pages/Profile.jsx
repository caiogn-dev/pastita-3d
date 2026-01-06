import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' }, { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapa' }, { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' }, { value: 'CE', label: 'Ceara' },
  { value: 'DF', label: 'Distrito Federal' }, { value: 'ES', label: 'Espirito Santo' },
  { value: 'GO', label: 'Goias' }, { value: 'MA', label: 'Maranhao' },
  { value: 'MT', label: 'Mato Grosso' }, { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' }, { value: 'PA', label: 'Para' },
  { value: 'PB', label: 'Paraiba' }, { value: 'PR', label: 'Parana' },
  { value: 'PE', label: 'Pernambuco' }, { value: 'PI', label: 'Piaui' },
  { value: 'RJ', label: 'Rio de Janeiro' }, { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' }, { value: 'RO', label: 'Rondonia' },
  { value: 'RR', label: 'Roraima' }, { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'Sao Paulo' }, { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' }
];

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

const Profile = () => {
  const { profile, updateProfile } = useAuth();
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
        const response = await api.get('/orders/history/');
        setOrders(response.data?.recent_orders || []);
        setOrderStats(response.data?.statistics || { total_orders: 0, total_spent: 0 });
        setOrdersLoaded(true);
      } catch {
        setOrdersError('Nao foi possivel carregar seus pedidos.');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [activeTab, ordersLoaded]);

  const formattedAddress = useMemo(() => {
    if (!profile) return 'Nao informado';
    const parts = [
      profile.address,
      profile.city,
      profile.state,
      profile.zip_code ? formatCEP(profile.zip_code) : null
    ]
      .filter(Boolean);
    return parts.length ? parts.join(', ') : 'Nao informado';
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
      setSaveSuccess('Perfil atualizado com sucesso.');
      setIsEditing(false);
    } catch {
      setSaveError('Nao foi possivel atualizar o perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

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
                        : 'Nao informado'}
                    </span>
                  </div>
                  <div>
                    <span className="profile-label">E-mail</span>
                    <span className="profile-value">{profile?.email || 'Nao informado'}</span>
                  </div>
                  <div>
                    <span className="profile-label">Telefone</span>
                    <span className="profile-value">
                      {profile?.phone ? formatPhone(profile.phone) : 'Nao informado'}
                    </span>
                  </div>
                  <div>
                    <span className="profile-label">CPF</span>
                    <span className="profile-value">
                      {profile?.cpf ? formatCPF(profile.cpf) : 'Nao informado'}
                    </span>
                  </div>
                  <div className="profile-info-full">
                    <span className="profile-label">Endereco</span>
                    <span className="profile-value">{formattedAddress}</span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-primary profile-edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Editar informacoes
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
                  <label className="form-label">Endereco</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Rua, numero, bairro"
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
                <span className="profile-value">R$ {(orderStats.total_spent || 0).toFixed(2)}</span>
              </div>
            </div>

            {ordersLoading && (
              <div className="profile-loading">Carregando pedidos...</div>
            )}

            {ordersError && (
              <div className="profile-alert">{ordersError}</div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="profile-empty">Voce ainda nao realizou pedidos.</div>
            )}

            {!ordersLoading && orders.length > 0 && (
              <div className="orders-list">
                {orders.map((order) => {
                  const itemCount = (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0);
                  const createdAt = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('pt-BR')
                    : '';
                  return (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <div>
                          <span className="order-number">{order.order_number}</span>
                          {createdAt && <span className="order-date">{createdAt}</span>}
                        </div>
                        <span className="order-status">{order.status}</span>
                      </div>
                      <div className="order-body">
                        <div className="order-detail">
                          <span>Itens</span>
                          <strong>{itemCount}</strong>
                        </div>
                        <div className="order-detail">
                          <span>Total</span>
                          <strong>R$ {Number(order.total_amount || 0).toFixed(2)}</strong>
                        </div>
                        <div className="order-detail order-address">
                          <span>Entrega</span>
                          <strong>
                            {order.shipping_address || 'Endereco nao informado'}
                          </strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
