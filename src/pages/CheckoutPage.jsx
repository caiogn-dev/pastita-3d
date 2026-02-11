import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { fetchCsrfToken } from '../services/api';

// ... (Funções auxiliares validateCPF, formatCPF, etc. permanecem iguais)
const toSafeString = (value) => (value == null ? '' : String(value));

const validateCPF = (cpf) => {
  const cleanCpf = toSafeString(cpf).replace(/[^\d]/g, '');
  if (cleanCpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleanCpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i += 1) sum += parseInt(cleanCpf[i], 10) * (10 - i);
  let digit = (sum * 10 % 11) % 10;
  if (digit !== parseInt(cleanCpf[9], 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i += 1) sum += parseInt(cleanCpf[i], 10) * (11 - i);
  digit = (sum * 10 % 11) % 10;
  return digit === parseInt(cleanCpf[10], 10);
};

const formatCPF = (value) => {
  const numbers = toSafeString(value).replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 3) return numbers;
  if (numbers.length <= 6) return `${numbers.slice(0, 3)}.${numbers.slice(3)}`;
  if (numbers.length <= 9) return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6)}`;
  return `${numbers.slice(0, 3)}.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

const formatPhone = (value) => {
  const numbers = toSafeString(value).replace(/\D/g, '').slice(0, 11);
  if (numbers.length <= 2) return numbers;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const formatCEP = (value) => {
  const safe = toSafeString(value);
  const numbers = safe.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

const onlyDigits = (value) => toSafeString(value).replace(/\D/g, '');

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

const DELIVERY_FEE = 15;
const STORE_ADDRESS = {
  address: 'Q. 112 Sul Rua SR 1, conj. 06 lote 04 - Plano Diretor Sul',
  city: 'Palmas',
  state: 'TO',
  zip_code: '77020-170'
};
const STORE_MAPS_URL = `https://www.google.com/maps?q=Ivoneth+Banqueteria`;

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
  const router = useRouter();
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('delivery');
  const deliveryAddressRef = useRef(null);
  const previousSavePref = useRef(true);

  // ... (Estados formData, paymentMethod, etc. permanecem iguais)
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
  const cashMethod = 'bolbradesco';
  const [paymentError, setPaymentError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const isCardReady = paymentMethod !== 'card' || Boolean(mpPublicKey);
  const saveAddressRef = useRef(saveAddress);
  const couponCodeNormalized = couponCode.trim().toUpperCase();

  // ... (Effects e handlers permanecem iguais até o handleSubmit)
  useEffect(() => {
    saveAddressRef.current = saveAddress;
  }, [saveAddress]);

  useEffect(() => {
    const loadUserData = async () => {
      if (profile) {
        setFormData((prev) => ({
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

      try {
        await api.get('/orders/history/');
      } catch {
        console.log('No previous orders found');
      }
    };

    loadUserData();
  }, [profile]);

  useEffect(() => {
    if (!mpPublicKey) return;
    initMercadoPago(mpPublicKey, { locale: 'pt-BR' });
  }, [mpPublicKey]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    let formattedValue = value;
    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'zip_code') formattedValue = formatCEP(value);
    setFormData((prev) => ({ ...prev, [name]: formattedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCouponChange = (event) => {
    setCouponCode(event.target.value);
    if (couponError) setCouponError('');
  };

  useEffect(() => {
    if (shippingMethod === 'pickup') {
      previousSavePref.current = saveAddressRef.current;
      setSaveAddress(false);
      setFormData((prev) => {
        deliveryAddressRef.current = {
          address: prev.address,
          city: prev.city,
          state: prev.state,
          zip_code: prev.zip_code
        };
        return {
          ...prev,
          ...STORE_ADDRESS,
          zip_code: formatCEP(STORE_ADDRESS.zip_code)
        };
      });
      setShippingCost(0);
    } else {
      setSaveAddress(previousSavePref.current ?? true);
      setShippingCost(DELIVERY_FEE);
      if (deliveryAddressRef.current) {
        setFormData((prev) => ({ ...prev, ...deliveryAddressRef.current }));
      }
    }
  }, [shippingMethod]);


  const fetchAddressFromCEP = async (cep) => {
    const cleanCEP = onlyDigits(cep);
    if (cleanCEP.length !== 8) return;
    setLoadingCEP(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
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

  const handleCEPBlur = () => {
    if (onlyDigits(formData.zip_code).length === 8) {
      fetchAddressFromCEP(formData.zip_code);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatorio';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatorio';
    else if (onlyDigits(formData.phone).length < 10) newErrors.phone = 'Telefone inválido (mínimo 10 dígitos)';
    
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatorio';
    else if (!validateCPF(formData.cpf)) newErrors.cpf = 'CPF inválido';

    if (shippingMethod === 'delivery') {
      if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
      if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!formData.state) newErrors.state = 'Estado é obrigatório';
      if (!formData.zip_code.trim()) newErrors.zip_code = 'CEP é obrigatório';
      else if (onlyDigits(formData.zip_code).length !== 8) newErrors.zip_code = 'CEP inválido (8 dígitos)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildBuyerPayload = () => ({
    name: formData.name,
    email: formData.email,
    phone: onlyDigits(formData.phone),
    cpf: onlyDigits(formData.cpf),
    address: shippingMethod === 'pickup' ? STORE_ADDRESS.address : formData.address,
    city: shippingMethod === 'pickup' ? STORE_ADDRESS.city : formData.city,
    state: shippingMethod === 'pickup' ? STORE_ADDRESS.state : formData.state,
    zip_code: shippingMethod === 'pickup'
      ? onlyDigits(STORE_ADDRESS.zip_code)
      : onlyDigits(formData.zip_code),
    shipping_method: shippingMethod
  });

  const processCheckout = async (paymentPayload) => {
    const response = await api.post('/checkout/create_checkout/', {
      shipping_method: shippingMethod,
      buyer: buildBuyerPayload(),
      coupon_code: couponCodeNormalized,
      payment: paymentPayload
    });

    clearCart();

    if (response.data.payment_error) {
      let msg = response.data.payment_error;
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      throw new Error(`Erro no pagamento: ${msg}`);
    }

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

      const paymentStatus = payment.status;

      if (paymentStatus === 'rejected') {
        const errorCode = payment.status_detail || '';
        router.push(`/erro?order=${orderNumber}&error=${errorCode}`);
        return;
      }

      router.push(`/pendente?order=${orderNumber}`);
      return;
    }

    const paymentLink = response.data.init_point || response.data.sandbox_init_point;
    if (paymentLink) {
      router.push(paymentLink);
      return;
    }

    throw new Error('Link de pagamento nao recebido do servidor.');
  };

  const handleCardSubmit = async (cardFormData, additionalData) => {
    if (!validateForm()) {
      setPaymentError('Verifique os erros no formulario.');
      return Promise.reject(new Error('Formulario invalido'));
    }

    setLoading(true);
    setPaymentError('');

    try {
      await fetchCsrfToken();
      if (saveAddress && shippingMethod === 'delivery') {
        await updateProfile({
          phone: onlyDigits(formData.phone),
          cpf: onlyDigits(formData.cpf),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: onlyDigits(formData.zip_code)
        });
      }

      const paymentType = additionalData?.paymentTypeId
        || cardFormData.payment_type_id
        || 'credit_card';

      const paymentPayload = {
        method: paymentType,
        payment_method_id: cardFormData.payment_method_id,
        token: cardFormData.token,
        installments: cardFormData.installments,
        issuer_id: cardFormData.issuer_id
      };

      await processCheckout(paymentPayload);
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);
      let errorMsg = 'Erro ao processar pagamento. Tente novamente.';

      if (error.response?.data?.details) {
        const backendErrors = {};
        Object.entries(error.response.data.details).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
        errorMsg = 'Verifique os erros no formulario.';
      } else if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.toLowerCase().includes('cupom')) {
          setCouponError(backendError);
        }
        errorMsg = backendError;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setPaymentError(errorMsg);
      return Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (paymentMethod === 'card') return;
    if (!validateForm()) return;

    setLoading(true);
    setPaymentError('');

    try {
      await fetchCsrfToken();

      if (saveAddress && shippingMethod === 'delivery') {
        await updateProfile({
          phone: onlyDigits(formData.phone),
          cpf: onlyDigits(formData.cpf),
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip_code: onlyDigits(formData.zip_code)
        });
      }

      let paymentPayload = null;
      if (paymentMethod === 'pix') {
        paymentPayload = { method: 'pix' };
      } else if (paymentMethod === 'cash') {
        paymentPayload = { method: 'cash', payment_method_id: cashMethod };
      }

      await processCheckout(paymentPayload);
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);
      let errorMsg = 'Erro ao processar pagamento. Tente novamente.';

      if (error.response?.data?.details) {
        const backendErrors = {};
        Object.entries(error.response.data.details).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
        errorMsg = 'Verifique os erros no formulario.';
      } else if (error.response?.data?.error) {
        const backendError = error.response.data.error;
        if (backendError.toLowerCase().includes('cupom')) {
          setCouponError(backendError);
        }
        errorMsg = backendError;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setPaymentError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // ... (Renderização permanece igual)
  const submitLabel = loading
    ? 'PROCESSANDO...'
    : paymentMethod === 'pix'
      ? 'GERAR PIX'
      : paymentMethod === 'cash'
        ? 'GERAR BOLETO'
        : 'PAGAR COM CARTAO';

  const shippingValue = shippingCost ?? 0;
  const couponDiscount = couponCodeNormalized === 'PASTITA10'
    ? Number(((cartTotal + shippingValue) * 0.1).toFixed(2))
    : 0;
  const totalWithShipping = Math.max(0, cartTotal + shippingValue - couponDiscount);

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <div>
          <h2>Seu carrinho está vazio</h2>
          <p>Adicione produtos ao carrinho para continuar.</p>
          <Link href="/cardapio" className="btn-secondary">Voltar ao Cardápio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        {/* ... (Resto do JSX igual) */}
        <div className="checkout-header">
          <Link href="/cardapio" className="checkout-back-link">
            ← Voltar ao Cardápio
          </Link>
          <h1>Finalizar Pedido</h1>
          <p>Confirme seus dados para prosseguir com o pagamento</p>
        </div>

        {paymentError && (
          <div className="checkout-alert" style={{backgroundColor: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', border: '1px solid #fecaca'}}>
            {paymentError}
          </div>
        )}

        {/* ... (O restante do componente não precisa de alterações visuais) */}
        {/* ... */}
        
        {/* Incluindo o form e os inputs exatamente como antes... */}
        <div className="checkout-grid">
            {/* ... */}
            <div className="checkout-card checkout-form-card">
              {/* ... */}
              <form onSubmit={handleSubmit}>
                {/* ... */}
                {/* Copie o resto do JSX do arquivo original aqui */}
                <div className="checkout-field-group">
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'delivery'}
                      onChange={() => setShippingMethod('delivery')}
                    />
                    <div>
                      <div className="checkout-payment-option-label">Entrega</div>
                      <div className="checkout-payment-option-hint">Frete fixo R$ 15,00</div>
                    </div>
                  </label>
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === 'pickup'}
                      onChange={() => setShippingMethod('pickup')}
                    />
                    <div>
                      <div className="checkout-payment-option-label">Retirada</div>
                      <div className="checkout-payment-option-hint">Sem frete na loja (112 Sul)</div>
                    </div>
                  </label>
                </div>
                
                {/* Campos do form... */}
                <div className="checkout-field-group">
                  <div className="form-field">
                    <label className="form-label">Nome completo *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Seu nome completo" className={`form-input ${errors.name ? 'is-error' : ''}`} />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>
                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">E-mail *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" className={`form-input ${errors.email ? 'is-error' : ''}`} />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Telefone *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="(11) 99999-9999" className={`form-input ${errors.phone ? 'is-error' : ''}`} />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-field">
                    <label className="form-label">CPF *</label>
                    <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" className={`form-input ${errors.cpf ? 'is-error' : ''}`} />
                    {errors.cpf && <span className="form-error">{errors.cpf}</span>}
                  </div>
                </div>

                <h4 className="checkout-subsection-title">{shippingMethod === 'pickup' ? 'Endereço de retirada' : 'Endereço de entrega'}</h4>
                
                {shippingMethod === 'pickup' && (
                  <div className="pickup-map-card">
                    <div className="pickup-map-header">
                      <div className="pickup-map-text">
                        <strong>Retirada na loja</strong>
                        <div className="pickup-map-address">{STORE_ADDRESS.address}, {STORE_ADDRESS.city} - {STORE_ADDRESS.state}</div>
                      </div>
                      <a href={STORE_MAPS_URL} target="_blank" rel="noreferrer" className="btn-secondary pickup-map-button">Ver no Google Maps</a>
                    </div>
                  </div>
                )}
                
                {shippingMethod === 'delivery' && (
                  <div className="checkout-field-group">
                     {/* Campos de endereço padrão ... */}
                    <div className="checkout-grid-cep">
                    <div className="form-field">
                      <label className="form-label">CEP *</label>
                      <div className="checkout-field-with-icon">
                        <input type="text" name="zip_code" value={formData.zip_code} onChange={handleChange} onBlur={handleCEPBlur} placeholder="00000-000" className={`form-input ${errors.zip_code ? 'is-error' : ''}`} />
                        {loadingCEP && <span className="checkout-field-note">Buscando...</span>}
                      </div>
                      {errors.zip_code && <span className="form-error">{errors.zip_code}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Endereço *</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className={`form-input ${errors.address ? 'is-error' : ''}`} />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                  </div>
                  <div className="checkout-grid-city">
                    <div className="form-field">
                      <label className="form-label">Cidade *</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className={`form-input ${errors.city ? 'is-error' : ''}`} />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Estado *</label>
                        <select name="state" value={formData.state} onChange={handleChange} className={`form-input ${errors.state ? 'is-error' : ''}`}>
                        <option value="">Selecione</option>
                        {BRAZILIAN_STATES.map((state) => (
                          <option key={state.value} value={state.value}>{state.label}</option>
                        ))}
                      </select>
                      {errors.state && <span className="form-error">{errors.state}</span>}
                    </div>
                  </div>
                  </div>
                )}

                <div className="checkout-field-group">
                  <div className="form-field">
                    <label className="form-label">Cupom</label>
                    <input
                      type="text"
                      name="coupon"
                      value={couponCode}
                      onChange={handleCouponChange}
                      placeholder="PASTITA10"
                      className={`form-input ${couponError ? 'is-error' : ''}`}
                    />
                    {couponError && <span className="form-error">{couponError}</span>}
                  </div>
                </div>

                <h4 className="checkout-subsection-title">Pagamento</h4>
                 <div className="checkout-payment-methods">
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                    <div><div className="checkout-payment-option-label">PIX</div></div>
                  </label>
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} />
                    <div><div className="checkout-payment-option-label">Boleto</div></div>
                  </label>
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <div><div className="checkout-payment-option-label">Cartão</div></div>
                  </label>
                </div>
                
                {/* ... Campos condicionais de cartao ... */}
                {paymentMethod === 'card' && (
                  <div className="checkout-payment-card">
                    {!mpPublicKey ? (
                      <div className="checkout-alert" style={{backgroundColor: '#fff7ed', color: '#c2410c', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fed7aa'}}>
                        Public key do Mercado Pago nao configurada.
                      </div>
                    ) : (
                      <CardPayment
                        key={`card-${shippingMethod}-${totalWithShipping}`}
                        initialization={{ amount: Number(totalWithShipping.toFixed(2)) }}
                        onSubmit={handleCardSubmit}
                        onReady={() => {}}
                        onError={(error) => {
                          console.error('Erro no Brick de cartao:', error);
                          setPaymentError('Erro ao processar cartao. Verifique os dados.');
                        }}
                      />
                    )}
                  </div>
                )}

                <label className="checkout-save-address">
                  <input type="checkbox" checked={saveAddress} onChange={(event) => setSaveAddress(event.target.checked)} disabled={shippingMethod === 'pickup'} />
                  <span>Salvar endereço para próximas compras</span>
                </label>

                {paymentMethod !== 'card' && (
                  <button type="submit" className="btn-primary checkout-submit" disabled={loading || !isCardReady}>
                    {submitLabel}
                  </button>
                )}
              </form>
            </div>
            
             {/* Resumo do pedido */}
             <div>
            <div className="checkout-card checkout-summary-card">
              <h3 className="checkout-section-title">Resumo do Pedido</h3>
              {cart.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <img src={item.image} alt={item.name} className="checkout-summary-image" />
                  <div className="checkout-summary-info">
                    <h4 className="checkout-summary-name">{item.name}</h4>
                    <p className="checkout-summary-qty">Qtd: {item.quantity}</p>
                  </div>
                  <span className="checkout-summary-price">R$ {isNaN(Number(item.price)) || isNaN(Number(item.quantity)) ? '0,00' : (Number(item.price) * Number(item.quantity)).toFixed(2)}</span>
                </div>
              ))}
              <div className="checkout-summary-divider">
                <div className="checkout-summary-row">
                  <span>Subtotal</span><span>R$ {isNaN(Number(cartTotal)) ? '0,00' : Number(cartTotal).toFixed(2)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>{shippingMethod === 'pickup' ? 'Retirada' : 'Frete'}</span>
                  <span>{shippingMethod === 'pickup' ? 'R$ 0,00' : `R$ ${shippingValue.toFixed(2)}`}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="checkout-summary-row">
                    <span>Cupom {couponCodeNormalized}</span>
                    <span>-R$ {couponDiscount.toFixed(2)}</span>
                  </div>
                )}
              </div>
              <div className="checkout-summary-total">
                <span>Total</span><span>R$ {isNaN(Number(totalWithShipping)) ? '0,00' : Number(totalWithShipping).toFixed(2)}</span>
              </div>
              <div className="checkout-security">Pagamento seguro via Mercado Pago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
