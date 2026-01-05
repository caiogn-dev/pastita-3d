import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './CheckoutPage.css';

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

const formatCardNumber = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 19);
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const onlyDigits = (value) => value.replace(/\D/g, '');

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

const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const mpPublicKey = import.meta.env.VITE_MERCADO_PAGO_PUBLIC_KEY;
  
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
  
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardPaymentType, setCardPaymentType] = useState('credit_card');
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    installments: '1'
  });
  const [cashMethod, setCashMethod] = useState('bolbradesco');
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState('');
  const [mpReady, setMpReady] = useState(false);
  const [mpInstance, setMpInstance] = useState(null);

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [saveAddress, setSaveAddress] = useState(true);
  const isCardReady = paymentMethod !== 'card' || (mpReady && mpPublicKey);

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

  useEffect(() => {
    if (!mpPublicKey) {
      return;
    }

    if (window.MercadoPago) {
      const instance = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
      setMpInstance(instance);
      setMpReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = () => {
      if (window.MercadoPago) {
        const instance = new window.MercadoPago(mpPublicKey, { locale: 'pt-BR' });
        setMpInstance(instance);
        setMpReady(true);
      }
    };
    script.onerror = () => {
      setMpReady(false);
    };
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [mpPublicKey]);

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

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (name === 'expMonth') {
      formattedValue = onlyDigits(value).slice(0, 2);
    } else if (name === 'expYear') {
      formattedValue = onlyDigits(value).slice(0, 4);
    } else if (name === 'cvv') {
      formattedValue = onlyDigits(value).slice(0, 4);
    } else if (name === 'installments') {
      formattedValue = onlyDigits(value).slice(0, 2);
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
  };

  const buildCardPaymentData = async () => {
    if (!mpPublicKey) {
      throw new Error('Public key do Mercado Pago nÆo configurada');
    }
    if (!mpInstance || !mpReady) {
      throw new Error('SDK do Mercado Pago nÆo carregado');
    }

    const cardNumber = onlyDigits(cardData.number);
    const cardholderName = cardData.holder.trim();
    const expMonth = onlyDigits(cardData.expMonth);
    const expYearRaw = onlyDigits(cardData.expYear);
    const expYear = expYearRaw.length === 4 ? expYearRaw.slice(-2) : expYearRaw;
    const securityCode = onlyDigits(cardData.cvv);

    if (!cardNumber || cardNumber.length < 13) {
      throw new Error('N£mero do cartÆo inv lido');
    }
    if (!cardholderName) {
      throw new Error('Nome impresso no cartÆo ‚ obrigat¢rio');
    }
    if (!expMonth || !expYear) {
      throw new Error('Validade do cartÆo inv lida');
    }
    if (!securityCode) {
      throw new Error('C¢digo de seguran‡a inv lido');
    }

    const bin = cardNumber.slice(0, 6);
    const paymentMethodResponse = await mpInstance.getPaymentMethods({ bin });
    const paymentMethodId = paymentMethodResponse?.results?.[0]?.id;

    if (!paymentMethodId) {
      throw new Error('NÆo foi poss¡vel identificar a bandeira do cartÆo');
    }

    let issuerId;
    try {
      if (paymentMethod === 'card' && !mpPublicKey) {
        throw new Error('Public key do Mercado Pago nao configurada');
      }
      const issuerResponse = await mpInstance.getIssuers({ paymentMethodId, bin });
      issuerId = issuerResponse?.results?.[0]?.id;
    } catch (error) {
      issuerId = undefined;
    }

    const tokenResponse = await mpInstance.createCardToken({
      cardNumber,
      cardholderName,
      cardExpirationMonth: expMonth,
      cardExpirationYear: expYear,
      securityCode,
      identificationType: 'CPF',
      identificationNumber: onlyDigits(formData.cpf),
    });

    const tokenId = tokenResponse?.id || tokenResponse?.token;
    if (!tokenId) {
      throw new Error('NÆo foi poss¡vel gerar o token do cartÆo');
    }

    return {
      method: cardPaymentType,
      payment_method_id: paymentMethodId,
      token: tokenId,
      issuer_id: issuerId,
      installments: Number(cardData.installments) || 1
    };
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
    setPaymentError('');
    setPaymentResult(null);

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

      let paymentPayload = null;
      if (paymentMethod === 'pix') {
        paymentPayload = { method: 'pix' };
      } else if (paymentMethod === 'cash') {
        paymentPayload = { method: 'cash', payment_method_id: cashMethod };
      } else if (paymentMethod === 'card') {
        paymentPayload = await buildCardPaymentData();
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
        },
        payment: paymentPayload
      });

      // Clear local cart
      clearCart();

      const payment = response.data.payment;
      const orderNumber = response.data.order_number;

      if (payment) {
        try {
          sessionStorage.setItem(
            `mp_payment_${orderNumber}`,
            JSON.stringify({ ...payment, order_number: orderNumber })
          );
        } catch (storageError) {
          console.warn('Could not cache payment data', storageError);
        }

        const paymentTypeId = payment.payment_type_id;
        const paymentStatus = payment.status;
        const isPixPayment = paymentTypeId === 'pix' ||
          payment.payment_method_id === 'pix' ||
          payment.qr_code_base64 ||
          payment.qr_code;
        const isTicketPayment = paymentTypeId === 'ticket' || payment.ticket_url;

        setPaymentResult({
          ...payment,
          order_number: orderNumber
        });

        if (isPixPayment || isTicketPayment) {
          window.location.href = `/pendente?order=${orderNumber}`;
          return;
        }

        if (paymentStatus === 'approved') {
          window.location.href = `/sucesso?order=${orderNumber}`;
          return;
        }

        if (paymentStatus === 'rejected') {
          const errorCode = payment.status_detail || '';
          window.location.href = `/erro?order=${orderNumber}&error=${errorCode}`;
          return;
        }

        window.location.href = `/pendente?order=${orderNumber}`;
        return;
      }

      // Redirect to Mercado Pago (fallback)
      const paymentLink = response.data.init_point || response.data.sandbox_init_point;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Link de pagamento nao recebido');
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
        setPaymentError(errorMsg);
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
    <div className="checkout-page">
      <div className="checkout-container">
        
        {/* Header */}
        <div className="checkout-header">
          <Link to="/cardapio" className="checkout-back-link">
            &larr; Voltar ao Cardapio
          </Link>
          <h1>Finalizar Pedido</h1>
          <p>Confirme seus dados para prosseguir com o pagamento</p>
        </div>

        {paymentError && (
          <div style={alertStyle}>
            {paymentError}
          </div>
        )}

        {paymentResult && (
          <div style={paymentInfoStyle}>
            <div style={paymentHeaderStyle}>
              <h3 style={{ margin: 0 }}>Pagamento criado</h3>
              <span style={paymentStatusBadgeStyle}>{paymentResult.status}</span>
            </div>
            <p style={{ margin: '10px 0 0 0', color: '#555' }}>
              Pedido: <strong>{paymentResult.order_number}</strong>
            </p>

            {paymentResult.payment_type_id === 'pix' && (
              <div style={paymentDetailBlockStyle}>
                <p style={{ margin: '0 0 10px 0' }}>
                  Escaneie o QR Code ou copie o codigo PIX.
                </p>
                {paymentResult.qr_code_base64 && (
                  <img
                    src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                    alt="QR Code PIX"
                    style={qrImageStyle}
                  />
                )}
                {paymentResult.qr_code && (
                  <textarea
                    readOnly
                    value={paymentResult.qr_code}
                    style={qrTextStyle}
                  />
                )}
              </div>
            )}

            {paymentResult.payment_type_id === 'ticket' && paymentResult.ticket_url && (
              <div style={paymentDetailBlockStyle}>
                <p style={{ margin: '0 0 10px 0' }}>
                  Seu boleto foi gerado. Abra para pagar.
                </p>
                <a
                  href={paymentResult.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  style={ticketLinkStyle}
                >
                  Abrir boleto
                </a>
              </div>
            )}

            <div style={{ marginTop: '12px' }}>
              <Link to={`/pendente?order=${paymentResult.order_number}`} style={pendingLinkStyle}>
                Acompanhar status do pagamento
              </Link>
            </div>
          </div>
        )}

        <div className="checkout-grid">
          
          {/* Form Section */}
          <div>
            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #eee' }}>
                <h3 style={{ color: 'var(--color-marsala)', marginTop: 0, marginBottom: '15px', fontSize: '1.1rem' }}>
                  Endereços Salvos
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
            <div className="checkout-card checkout-form-card">
              <h3 className="checkout-section-title">Dados de Entrega</h3>
              
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

                  <div className="checkout-grid-two">
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
                  <div className="checkout-grid-cep">
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

                  <div className="checkout-grid-city">
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

                {/* Payment Section */}
                <h4 style={{ color: '#333', marginBottom: '15px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
                  Pagamento
                </h4>

                <div style={paymentMethodGridStyle}>
                  <label style={paymentOptionStyle}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={paymentOptionLabelStyle}>PIX</div>
                      <div style={paymentOptionHintStyle}>Aprovacao rapida, QR Code apos confirmar.</div>
                    </div>
                  </label>
                  <label style={paymentOptionStyle}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={paymentOptionLabelStyle}>Boleto</div>
                      <div style={paymentOptionHintStyle}>Pagamento em ate 3 dias uteis.</div>
                    </div>
                  </label>
                  <label style={paymentOptionStyle}>
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      style={{ marginTop: '3px' }}
                    />
                    <div>
                      <div style={paymentOptionLabelStyle}>Cartao</div>
                      <div style={paymentOptionHintStyle}>Credito ou debito com tokenizacao.</div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'pix' && (
                  <div style={paymentNoteStyle}>
                    O QR Code sera exibido apos confirmar o pedido.
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div style={paymentNoteStyle}>
                    <label style={labelStyle}>Metodo de boleto</label>
                    <select
                      name="cashMethod"
                      value={cashMethod}
                      onChange={(event) => setCashMethod(event.target.value)}
                      style={inputStyle}
                    >
                      <option value="bolbradesco">Boleto (Bradesco)</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div style={paymentCardBlockStyle}>
                    {!mpPublicKey && (
                      <div style={mpWarningStyle}>
                        Public key do Mercado Pago nao configurada.
                      </div>
                    )}
                    {mpPublicKey && !mpReady && (
                      <div style={mpWarningStyle}>
                        Carregando SDK do Mercado Pago...
                      </div>
                    )}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={labelStyle}>Tipo do cartao</label>
                      <select
                        name="cardPaymentType"
                        value={cardPaymentType}
                        onChange={(event) => setCardPaymentType(event.target.value)}
                        style={inputStyle}
                      >
                        <option value="credit_card">Credito</option>
                        <option value="debit_card">Debito</option>
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Numero do cartao</label>
                      <input
                        type="text"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardChange}
                        placeholder="0000 0000 0000 0000"
                        style={inputStyle}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Nome no cartao</label>
                      <input
                        type="text"
                        name="holder"
                        value={cardData.holder}
                        onChange={handleCardChange}
                        placeholder="Nome impresso"
                        style={inputStyle}
                      />
                    </div>

                    <div style={paymentFieldGridStyle}>
                      <div>
                        <label style={labelStyle}>Mes</label>
                        <input
                          type="text"
                          name="expMonth"
                          value={cardData.expMonth}
                          onChange={handleCardChange}
                          placeholder="MM"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>Ano</label>
                        <input
                          type="text"
                          name="expYear"
                          value={cardData.expYear}
                          onChange={handleCardChange}
                          placeholder="AA"
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={labelStyle}>CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="123"
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <div style={{ marginTop: '12px' }}>
                      <label style={labelStyle}>Parcelas</label>
                      <select
                        name="installments"
                        value={cardData.installments}
                        onChange={handleCardChange}
                        style={inputStyle}
                      >
                        {INSTALLMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}x</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

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
                  disabled={loading || !isCardReady}
                  style={{ 
                    marginTop: '25px', 
                    width: '100%', 
                    fontSize: '1.1rem', 
                    padding: '16px',
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading
                    ? 'PROCESSANDO...'
                    : paymentMethod === 'pix'
                      ? 'GERAR PIX'
                      : paymentMethod === 'cash'
                        ? 'GERAR BOLETO'
                        : 'PAGAR COM CARTAO'}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="checkout-card checkout-summary-card">
              <h3 className="checkout-section-title">Resumo do Pedido</h3>
              
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
                  Pagamento seguro via Mercado Pago
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
  border: '1px solid #e7ded5', 
  fontSize: '1rem', 
  outline: 'none', 
  backgroundColor: '#fffaf6',
  transition: 'border-color 0.2s, box-shadow 0.2s'
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

const alertStyle = {
  backgroundColor: '#fee2e2',
  color: '#b91c1c',
  padding: '12px 16px',
  borderRadius: '10px',
  marginBottom: '20px',
  border: '1px solid #fecaca'
};

const paymentInfoStyle = {
  backgroundColor: '#fff',
  border: '1px solid #eee',
  padding: '20px',
  borderRadius: '14px',
  marginBottom: '20px'
};

const paymentHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const paymentStatusBadgeStyle = {
  backgroundColor: '#fef3c7',
  color: '#92400e',
  padding: '4px 10px',
  borderRadius: '999px',
  fontSize: '0.8rem',
  fontWeight: '600',
  textTransform: 'capitalize'
};

const paymentDetailBlockStyle = {
  marginTop: '12px',
  backgroundColor: '#f9fafb',
  padding: '12px',
  borderRadius: '10px',
  border: '1px solid #eee'
};

const qrImageStyle = {
  width: '200px',
  height: '200px',
  display: 'block',
  margin: '10px 0'
};

const qrTextStyle = {
  width: '100%',
  minHeight: '90px',
  resize: 'vertical',
  padding: '10px',
  borderRadius: '8px',
  border: '1px solid #ddd',
  fontFamily: 'monospace',
  fontSize: '0.85rem'
};

const ticketLinkStyle = {
  display: 'inline-block',
  padding: '10px 16px',
  borderRadius: '8px',
  backgroundColor: 'var(--color-marsala)',
  color: '#fff',
  textDecoration: 'none',
  fontWeight: '600'
};

const pendingLinkStyle = {
  color: 'var(--color-marsala)',
  textDecoration: 'none',
  fontWeight: '600'
};

const paymentMethodGridStyle = {
  display: 'grid',
  gap: '12px',
  marginBottom: '12px'
};

const paymentOptionStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
  padding: '12px',
  border: '1px solid #e7ded5',
  borderRadius: '10px',
  cursor: 'pointer',
  backgroundColor: '#fffaf6',
  boxShadow: '0 6px 14px rgba(30, 20, 15, 0.06)'
};

const paymentOptionLabelStyle = {
  fontSize: '0.95rem',
  fontWeight: '600',
  color: '#333'
};

const paymentOptionHintStyle = {
  fontSize: '0.85rem',
  color: '#666',
  marginTop: '4px'
};

const paymentNoteStyle = {
  backgroundColor: '#fff7ed',
  border: '1px dashed #f1c89b',
  borderRadius: '10px',
  padding: '12px',
  marginBottom: '16px',
  color: '#7a3e12',
  fontSize: '0.9rem'
};

const paymentCardBlockStyle = {
  display: 'grid',
  gap: '12px',
  backgroundColor: '#fffaf6',
  border: '1px solid #ecdccc',
  borderRadius: '12px',
  padding: '16px'
};

const paymentFieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
  gap: '12px'
};

const mpWarningStyle = {
  backgroundColor: '#fff7ed',
  border: '1px solid #fed7aa',
  color: '#9a3412',
  padding: '10px 12px',
  borderRadius: '8px',
  fontSize: '0.85rem'
};

export default CheckoutPage;




