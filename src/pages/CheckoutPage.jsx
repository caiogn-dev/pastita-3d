import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

// Brazilian CPF validation
const validateCPF = (cpf) => {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false;
  
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(cpf[i]) * (10 - i);
  let digit = (sum * 10 % 11) % 10;
  if (digit !== parseInt(cpf[9])) return false;
  
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(cpf[i]) * (11 - i);
  digit = (sum * 10 % 11) % 10;
  return digit === parseInt(cpf[10]);
};

// Format CPF as user types
const formatCPF = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

// Format phone as user types
const formatPhone = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

// Format CEP as user types
const formatCEP = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

// Brazilian states
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

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);

  // Load user profile and previous orders on mount
  useEffect(() => {
    const loadUserData = async () => {
      // Pre-fill from profile
      if (profile) {
        setFormData(prev => ({
          ...prev,
          name: profile.first_name && profile.last_name 
            ? `${profile.first_name} ${profile.last_name}`.trim() 
            : prev.name,
          email: profile.email || prev.email,
          phone: profile.phone ? formatPhone(profile.phone) : prev.phone,
          cpf: profile.cpf ? formatCPF(profile.cpf) : prev.cpf,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state,
          zip_code: profile.zip_code ? formatCEP(profile.zip_code) : prev.zip_code
        }));
      }

      // Fetch previous order addresses
      try {
        const response = await api.get('/orders/history/');
        if (response.data.recent_orders && response.data.recent_orders.length > 0) {
          const addresses = response.data.recent_orders
            .filter(order => order.shipping_address)
            .map(order => ({
              id: order.id,
              address: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state,
              zip_code: order.shipping_zip_code,
              label: `${order.shipping_address}, ${order.shipping_city} - ${order.shipping_state}`
            }))
            .filter((addr, index, self) => 
              index === self.findIndex(a => a.label === addr.label)
            )
            .slice(0, 3);
          
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setUseNewAddress(false);
          }
        }
      } catch (error) {
        console.log('No previous orders found');
      }
    };

    loadUserData();
  }, [profile]);

  // Handle form field changes with formatting
  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Apply formatting based on field
    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'zip_code') formattedValue = formatCEP(value);

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Fetch address from CEP (ViaCEP API)
  const fetchAddressFromCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
    if (cleanCEP.length !== 8) return;

    setLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro ? `${data.logradouro}, ${data.bairro}` : prev.address,
          city: data.localidade || prev.city,
          state: data.uf || prev.state
        }));
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    }
    setLoadingCEP(false);
  };

  // Handle CEP blur to auto-fill address
  const handleCEPBlur = () => {
    if (formData.zip_code.replace(/\D/g, '').length === 8) {
      fetchAddressFromCEP(formData.zip_code);
    }
  };

  // Select saved address
  const selectSavedAddress = (address) => {
    setFormData(prev => ({
      ...prev,
      address: address.address,
      city: address.city,
      state: address.state,
      zip_code: formatCEP(address.zip_code)
    }));
    setUseNewAddress(false);
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }
    
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido (mínimo 10 dígitos)';
    }
    
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
    else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
    if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
    if (!formData.state) newErrors.state = 'Estado é obrigatório';
    
    if (!formData.zip_code.trim()) newErrors.zip_code = 'CEP é obrigatório';
    else if (formData.zip_code.replace(/\D/g, '').length !== 8) {
      newErrors.zip_code = 'CEP inválido (8 dígitos)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Save address to profile if requested
      if (saveAddress) {
        await updateProfile({
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, ''),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code.replace(/\D/g, '')
        });
      }

      // Create checkout with all required fields
      const response = await api.post('/checkout/create_checkout/', {
        buyer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, ''),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zip_code.replace(/\D/g, '')
        }
      });

      // Clear local cart
      clearCart();

      // Redirect to Mercado Pago
      const paymentLink = response.data.init_point || response.data.sandbox_init_point;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Link de pagamento não recebido');
      }
      
    } catch (error) {
      console.error("Erro ao gerar pagamento:", error);
      
      // Handle validation errors from backend
      if (error.response?.data?.details) {
        const backendErrors = {};
        Object.entries(error.response.data.details).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
      } else {
        const errorMsg = error.response?.data?.error || "Erro ao processar pagamento. Tente novamente.";
        alert(errorMsg);
      }
      setLoading(false);
    }
  };

  if (cart.length === 0) return (
    <div style={{ padding: '100px 20px', textAlign: 'center', backgroundColor: 'var(--color-cream)', minHeight: '100vh' }}>
      <h2 style={{ color: 'var(--color-marsala)' }}>Seu carrinho está vazio</h2>
      <p style={{ color: '#666', marginTop: '10px' }}>Adicione produtos ao carrinho para continuar.</p>
      <Link to="/cardapio" className="btn-secondary" style={{ marginTop: '20px', display: 'inline-block' }}>
        Voltar ao Cardápio
      </Link>
    </div>
  );

  return (
    <div style={{ backgroundColor: 'var(--color-cream)', minHeight: '100vh', padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: '1000px' }}>
        
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <Link to="/cardapio" style={{ color: '#666', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            ← Voltar ao Cardápio
          </Link>
          <h1 style={{ color: 'var(--color-marsala)', marginTop: '15px', marginBottom: '5px' }}>Finalizar Pedido</h1>
          <p style={{ color: '#666', margin: 0 }}>Confirme seus dados para prosseguir com o pagamento</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
          
          {/* Form Section */}
          <div>
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' }}>
                <h3 style={{ color: 'var(--color-marsala)', marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>
                  📍 Endereços Salvos
                </h3>
                {savedAddresses.map((addr, index) => (
                  <label key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '12px', backgroundColor: !useNewAddress && formData.address === addr.address ? '#f0e6e6' : '#f9f9f9', borderRadius: '8px', marginBottom: '10px', cursor: 'pointer', border: !useNewAddress && formData.address === addr.address ? '2px solid var(--color-marsala)' : '2px solid transparent' }}>
                    <input 
                      type="radio" 
                      name="savedAddress" 
                      checked={!useNewAddress && formData.address === addr.address}
                      onChange={() => selectSavedAddress(addr)}
                      style={{ marginTop: '3px' }}
                    />
                    <span style={{ fontSize: '0.9rem', color: '#333' }}>{addr.label}</span>
                  </label>
                ))}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px', backgroundColor: useNewAddress ? '#f0e6e6' : '#f9f9f9', borderRadius: '8px', cursor: 'pointer', border: useNewAddress ? '2px solid var(--color-marsala)' : '2px solid transparent' }}>
                  <input 
                    type="radio" 
                    name="savedAddress" 
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#333' }}>Usar novo endereço</span>
                </label>
              </div>
            )}

            {/* Main Form */}
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #eee' }}>
              <h3 style={{ color: 'var(--color-marsala)', marginTop: 0, marginBottom: '25px' }}>Dados de Entrega</h3>
              
              <form onSubmit={handleSubmit}>
                {/* Personal Info */}
                <div style={{ display: 'grid', gap: '15px', marginBottom: '25px' }}>
                  <div>
                    <label style={labelStyle}>Nome Completo *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name}
                      onChange={handleChange} 
                      placeholder="Seu nome completo"
                      style={{ ...inputStyle, borderColor: errors.name ? '#dc2626' : '#ccc' }} 
                    />
                    {errors.name && <span style={errorStyle}>{errors.name}</span>}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={labelStyle}>E-mail *</label>
                      <input 
                        type="email" 
                        name="email" 
                        value={formData.email}
                        onChange={handleChange} 
                        placeholder="seu@email.com"
                        style={{ ...inputStyle, borderColor: errors.email ? '#dc2626' : '#ccc' }} 
                      />
                      {errors.email && <span style={errorStyle}>{errors.email}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Telefone *</label>
                      <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone}
                        onChange={handleChange} 
                        placeholder="(11) 99999-9999"
                        style={{ ...inputStyle, borderColor: errors.phone ? '#dc2626' : '#ccc' }} 
                      />
                      {errors.phone && <span style={errorStyle}>{errors.phone}</span>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>CPF *</label>
                    <input 
                      type="text" 
                      name="cpf" 
                      value={formData.cpf}
                      onChange={handleChange} 
                      placeholder="000.000.000-00"
                      style={{ ...inputStyle, borderColor: errors.cpf ? '#dc2626' : '#ccc' }} 
                    />
                    {errors.cpf && <span style={errorStyle}>{errors.cpf}</span>}
                  </div>
                </div>

                {/* Address Section */}
                <h4 style={{ color: '#333', marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  Endereço de Entrega
                </h4>
                
                <div style={{ display: 'grid', gap: '15px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px' }}>
                    <div>
                      <label style={labelStyle}>CEP *</label>
                      <div style={{ position: 'relative' }}>
                        <input 
                          type="text" 
                          name="zip_code" 
                          value={formData.zip_code}
                          onChange={handleChange}
                          onBlur={handleCEPBlur}
                          placeholder="00000-000"
                          style={{ ...inputStyle, borderColor: errors.zip_code ? '#dc2626' : '#ccc' }} 
                        />
                        {loadingCEP && (
                          <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.8rem', color: '#666' }}>
                            Buscando...
                          </span>
                        )}
                      </div>
                      {errors.zip_code && <span style={errorStyle}>{errors.zip_code}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Endereço (Rua, Número, Bairro) *</label>
                      <input 
                        type="text" 
                        name="address" 
                        value={formData.address}
                        onChange={handleChange} 
                        placeholder="Rua Exemplo, 123, Centro"
                        style={{ ...inputStyle, borderColor: errors.address ? '#dc2626' : '#ccc' }} 
                      />
                      {errors.address && <span style={errorStyle}>{errors.address}</span>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                    <div>
                      <label style={labelStyle}>Cidade *</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={formData.city}
                        onChange={handleChange} 
                        placeholder="São Paulo"
                        style={{ ...inputStyle, borderColor: errors.city ? '#dc2626' : '#ccc' }} 
                      />
                      {errors.city && <span style={errorStyle}>{errors.city}</span>}
                    </div>
                    <div>
                      <label style={labelStyle}>Estado *</label>
                      <select 
                        name="state" 
                        value={formData.state}
                        onChange={handleChange}
                        style={{ ...inputStyle, borderColor: errors.state ? '#dc2626' : '#ccc' }}
                      >
                        <option value="">Selecione</option>
                        {BRAZILIAN_STATES.map(state => (
                          <option key={state.value} value={state.value}>{state.label}</option>
                        ))}
                      </select>
                      {errors.state && <span style={errorStyle}>{errors.state}</span>}
                    </div>
                  </div>
                </div>

                {/* Save Address Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '20px', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={saveAddress}
                    onChange={(e) => setSaveAddress(e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontSize: '0.9rem', color: '#555' }}>Salvar endereço para próximas compras</span>
                </label>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={loading}
                  style={{ 
                    marginTop: '25px', 
                    width: '100%', 
                    fontSize: '1.1rem', 
                    padding: '16px',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'PROCESSANDO...' : '💳 PAGAR COM MERCADO PAGO'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '16px', border: '1px solid #eee', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', position: 'sticky', top: '20px' }}>
              <h3 style={{ marginTop: 0, marginBottom: '20px', color: 'var(--color-marsala)' }}>
                Resumo do Pedido
              </h3>
              
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '15px', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f5f5f5' }}>
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} 
                  />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 5px 0', fontSize: '0.95rem', color: '#333' }}>{item.name}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#666' }}>Qtd: {item.quantity}</p>
                  </div>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-marsala)' }}>
                    R$ {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
              
              <div style={{ borderTop: '2px dashed #eee', margin: '20px 0', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#666' }}>
                  <span>Frete</span>
                  <span style={{ color: '#16a34a' }}>Grátis</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--color-marsala)', paddingTop: '15px', borderTop: '2px solid var(--color-marsala)' }}>
                <span>Total</span>
                <span>R$ {cartTotal.toFixed(2)}</span>
              </div>

              {/* Security Badge */}
              <div style={{ marginTop: '25px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: '#16a34a' }}>
                  🔒 Pagamento seguro via Mercado Pago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const inputStyle = {
  width: '100%', 
  padding: '12px 15px', 
  borderRadius: '8px', 
  border: '1px solid #ccc', 
  fontSize: '1rem', 
  outline: 'none', 
  backgroundColor: '#fff',
  transition: 'border-color 0.2s'
};

const labelStyle = {
  display: 'block',
  marginBottom: '6px',
  fontSize: '0.9rem',
  fontWeight: '500',
  color: '#444'
};

const errorStyle = {
  display: 'block',
  marginTop: '4px',
  fontSize: '0.8rem',
  color: '#dc2626'
};

export default CheckoutPage;