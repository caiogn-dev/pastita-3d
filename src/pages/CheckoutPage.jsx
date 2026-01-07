import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { fetchCsrfToken } from '../services/api';

const validateCPF = (cpf) => {
  const cleanCpf = cpf.replace(/[^\d]/g, '');
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
  const safe = value || '';
  const numbers = safe.replace(/\D/g, '').slice(0, 8);
  if (numbers.length <= 5) return numbers;
  return `${numbers.slice(0, 5)}-${numbers.slice(5)}`;
};

const formatCardNumber = (value) => {
  const numbers = value.replace(/\D/g, '').slice(0, 19);
  return numbers.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
};

const onlyDigits = (value) => value.replace(/\D/g, '');

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

const INSTALLMENT_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const DELIVERY_FEE = 15;
const STORE_ADDRESS = 'Ivoneth Banqueteria';;
const STORE_MAPS_URL = `https://www.google.com/maps?q=Ivoneth+Banqueteria`;

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { profile, updateProfile } = useAuth();
  const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
  const [shippingCost, setShippingCost] = useState(null);
  const [shippingMethod, setShippingMethod] = useState('delivery');
  const deliveryAddressRef = useRef(null);

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
        const response = await api.get('/orders/history/');
        if (response.data.recent_orders && response.data.recent_orders.length > 0) {
          const addresses = response.data.recent_orders
            .filter((order) => order.shipping_address)
            .map((order) => ({
              id: order.id,
              address: order.shipping_address,
              city: order.shipping_city,
              state: order.shipping_state,
              zip_code: order.shipping_zip_code,
              label: `${order.shipping_address}, ${order.shipping_city} - ${order.shipping_state}`
            }))
            .filter((addr, index, self) =>
              index === self.findIndex((item) => item.label === addr.label)
            )
            .slice(0, 3);

          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setUseNewAddress(false);
          }
        }
      } catch {
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

  const handleChange = (event) => {
    const { name, value } = event.target;
    let formattedValue = value;

    if (name === 'cpf') formattedValue = formatCPF(value);
    else if (name === 'phone') formattedValue = formatPhone(value);
    else if (name === 'zip_code') formattedValue = formatCEP(value);

    setFormData((prev) => ({ ...prev, [name]: formattedValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  useEffect(() => {
    if (shippingMethod === 'pickup') {
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
      setShippingCost(DELIVERY_FEE);
      if (deliveryAddressRef.current) {
        setFormData((prev) => ({ ...prev, ...deliveryAddressRef.current }));
      }
    }
  }, [shippingMethod]);

  const handleCardChange = (event) => {
    const { name, value } = event.target;
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

    setCardData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const buildCardPaymentData = async () => {
    if (!mpPublicKey) {
      throw new Error('Public key do Mercado Pago nao configurada');
    }
    if (!mpInstance || !mpReady) {
      throw new Error('SDK do Mercado Pago nao carregado');
    }

    const cardNumber = onlyDigits(cardData.number);
    const cardholderName = cardData.holder.trim();
    const expMonth = onlyDigits(cardData.expMonth);
    const expYearRaw = onlyDigits(cardData.expYear);
    const expYear = expYearRaw.length === 4 ? expYearRaw.slice(-2) : expYearRaw;
    const securityCode = onlyDigits(cardData.cvv);

    if (!cardNumber || cardNumber.length < 13) {
      throw new Error('Numero do cartão inválido');
    }
    if (!cardholderName) {
      throw new Error('Nome impresso no cartão é obrigatório');
    }
    if (!expMonth || !expYear) {
      throw new Error('Validade do cartão inválida');
    }
    if (!securityCode) {
      throw new Error('Código de segurança inválido');
    }

    const bin = cardNumber.slice(0, 6);
    const paymentMethodResponse = await mpInstance.getPaymentMethods({ bin });
    const paymentMethodId = paymentMethodResponse?.results?.[0]?.id || paymentMethodResponse?.[0]?.id;

    if (!paymentMethodId) {
      throw new Error('Não foi possível identificar a bandeira do cartão');
    }

    let issuerId;
    try {
      const issuerResponse = await mpInstance.getIssuers({ paymentMethodId, bin });
      issuerId = issuerResponse?.results?.[0]?.id || issuerResponse?.[0]?.id;
    } catch {
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
      throw new Error('Não foi possível gerar o token do cartão');
    }

    return {
      method: cardPaymentType,
      payment_method_id: paymentMethodId,
      token: tokenId,
      issuer_id: issuerId,
      installments: Number(cardData.installments) || 1
    };
  };

  const fetchAddressFromCEP = async (cep) => {
    const cleanCEP = cep.replace(/\D/g, '');
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
    if (formData.zip_code.replace(/\D/g, '').length === 8) {
      fetchAddressFromCEP(formData.zip_code);
    }
  };

  const selectSavedAddress = (address) => {
    setFormData((prev) => ({
      ...prev,
      address: address.address,
      city: address.city,
      state: address.state,
      zip_code: formatCEP(address.zip_code)
    }));
    setUseNewAddress(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatorio';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatorio';
    else if (formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido (mínimo 10 dígitos)';
    }

    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatorio';
    else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (shippingMethod === 'delivery') {
      if (!formData.address.trim()) newErrors.address = 'Endereço é obrigatório';
      if (!formData.city.trim()) newErrors.city = 'Cidade é obrigatória';
      if (!formData.state) newErrors.state = 'Estado é obrigatório';

      if (!formData.zip_code.trim()) newErrors.zip_code = 'CEP é obrigatório';
      else if (formData.zip_code.replace(/\D/g, '').length !== 8) {
        newErrors.zip_code = 'CEP inválido (8 dígitos)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setPaymentError('');
    setPaymentResult(null);

    try {
      await fetchCsrfToken();
      if (saveAddress && shippingMethod === 'delivery') {
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

      const response = await api.post('/checkout/create_checkout/', {
        shipping_method: shippingMethod,
        buyer: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone.replace(/\D/g, ''),
          cpf: formData.cpf.replace(/\D/g, ''),
          address: shippingMethod === 'pickup' ? STORE_ADDRESS.address : formData.address,
          city: shippingMethod === 'pickup' ? STORE_ADDRESS.city : formData.city,
          state: shippingMethod === 'pickup' ? STORE_ADDRESS.state : formData.state,
          zip_code: shippingMethod === 'pickup'
            ? STORE_ADDRESS.zip_code.replace(/\D/g, '')
            : formData.zip_code.replace(/\D/g, ''),
          shipping_method: shippingMethod
        },
        payment: paymentPayload
      });

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
        const isPixPayment = paymentTypeId === 'pix'
          || payment.payment_method_id === 'pix'
          || payment.qr_code_base64
          || payment.qr_code;
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

      const paymentLink = response.data.init_point || response.data.sandbox_init_point;
      if (paymentLink) {
        window.location.href = paymentLink;
      } else {
        throw new Error('Link de pagamento não recebido');
      }
    } catch (error) {
      console.error('Erro ao gerar pagamento:', error);

      if (error.response?.data?.details) {
        const backendErrors = {};
        Object.entries(error.response.data.details).forEach(([key, value]) => {
          backendErrors[key] = Array.isArray(value) ? value[0] : value;
        });
        setErrors(backendErrors);
      } else {
        const errorMsg = error.response?.data?.error || 'Erro ao processar pagamento. Tente novamente.';
        setPaymentError(errorMsg);
      }
      setLoading(false);
    }
  };

  const submitLabel = loading
    ? 'PROCESSANDO...'
    : paymentMethod === 'pix'
      ? 'GERAR PIX'
      : paymentMethod === 'cash'
        ? 'GERAR BOLETO'
        : 'PAGAR COM CARTAO';

  const shippingValue = shippingCost ?? 0;
  const totalWithShipping = cartTotal + shippingValue;

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
        <div className="checkout-header">
          <Link href="/cardapio" className="checkout-back-link">
            &larr; Voltar ao Cardápio
          </Link>
          <h1>Finalizar Pedido</h1>
          <p>Confirme seus dados para prosseguir com o pagamento</p>
        </div>

        {paymentError && (
          <div className="checkout-alert">{paymentError}</div>
        )}

        {paymentResult && (
          <div className="checkout-payment-info">
            <div className="checkout-payment-header">
              <h3>Pagamento criado</h3>
              <span className="checkout-status-badge">{paymentResult.status}</span>
            </div>
            <p>
              Pedido: <strong>{paymentResult.order_number}</strong>
            </p>

            {paymentResult.payment_type_id === 'pix' && (
              <div className="checkout-payment-block">
                <p>Escaneie o QR Code ou copie o código PIX.</p>
                {paymentResult.qr_code_base64 && (
                  <img
                    src={`data:image/png;base64,${paymentResult.qr_code_base64}`}
                    alt="QR Code PIX"
                    className="checkout-qr-image"
                  />
                )}
                {paymentResult.qr_code && (
                  <textarea
                    readOnly
                    value={paymentResult.qr_code}
                    className="checkout-qr-text"
                  />
                )}
              </div>
            )}

            {paymentResult.payment_type_id === 'ticket' && paymentResult.ticket_url && (
              <div className="checkout-payment-block">
                <p>Seu boleto foi gerado. Abra para pagar.</p>
                <a
                  href={paymentResult.ticket_url}
                  target="_blank"
                  rel="noreferrer"
                  className="checkout-ticket-link"
                >
                  Abrir boleto
                </a>
              </div>
            )}

            <div>
              <Link
                href={`/pendente?order=${paymentResult.order_number}`}
                className="checkout-pending-link"
              >
                Acompanhar status do pagamento
              </Link>
            </div>
          </div>
        )}

        <div className="checkout-grid">
          <div>
            {shippingMethod === 'delivery' && savedAddresses.length > 0 && (
              <div className="checkout-address-card">
                <h3 className="checkout-address-title">Endereços salvos</h3>
                {savedAddresses.map((addr) => {
                  const isSelected = !useNewAddress && formData.address === addr.address;
                  return (
                    <label
                      key={addr.id}
                      className={`checkout-address-option ${isSelected ? 'is-selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name="savedAddress"
                        checked={isSelected}
                        onChange={() => selectSavedAddress(addr)}
                      />
                      <span className="checkout-address-label">{addr.label}</span>
                    </label>
                  );
                })}
                <label
                  className={`checkout-address-option ${useNewAddress ? 'is-selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={useNewAddress}
                    onChange={() => setUseNewAddress(true)}
                  />
                  <span className="checkout-address-label">Usar novo endereço</span>
                </label>
              </div>
            )}

            <div className="checkout-card checkout-form-card">
              <h3 className="checkout-section-title">Dados de entrega</h3>

              <form onSubmit={handleSubmit}>
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

                <div className="checkout-field-group">
                  <div className="form-field">
                    <label className="form-label">Nome completo *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Seu nome completo"
                      className={`form-input ${errors.name ? 'is-error' : ''}`}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-grid-2">
                    <div className="form-field">
                      <label className="form-label">E-mail *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="seu@email.com"
                        className={`form-input ${errors.email ? 'is-error' : ''}`}
                      />
                      {errors.email && <span className="form-error">{errors.email}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Telefone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="(11) 99999-9999"
                        className={`form-input ${errors.phone ? 'is-error' : ''}`}
                      />
                      {errors.phone && <span className="form-error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-field">
                    <label className="form-label">CPF *</label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      placeholder="000.000.000-00"
                      className={`form-input ${errors.cpf ? 'is-error' : ''}`}
                    />
                    {errors.cpf && <span className="form-error">{errors.cpf}</span>}
                  </div>
                </div>
                <h4 className="checkout-subsection-title">
                  {shippingMethod === 'pickup' ? 'Endereço de retirada' : 'Endereço de entrega'}
                </h4>

                {shippingMethod === 'pickup' && (
                  <div className="pickup-map-card">
                    <div className="pickup-map-header">
                      <div className="pickup-map-text">
                        <strong>Retirada na loja</strong>
                        <div className="pickup-map-address">
                          {STORE_ADDRESS.address}, {STORE_ADDRESS.city} - {STORE_ADDRESS.state}
                        </div>
                      </div>
                      <a
                        href={STORE_MAPS_URL}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-secondary pickup-map-button"
                      >
                        Ver no Google Maps
                      </a>
                    </div>
                    <div className="pickup-map-embed">
                      <iframe
                        title="Mapa Pastita"
                        src={`${STORE_MAPS_URL}&output=embed`}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
                {shippingMethod === 'delivery' && useNewAddress && (
                <div className="checkout-field-group">
                  <div className="checkout-grid-cep">
                    <div className="form-field">
                      <label className="form-label">CEP *</label>
                      <div className="checkout-field-with-icon">
                        <input
                          type="text"
                          name="zip_code"
                          value={formData.zip_code}
                          onChange={handleChange}
                          onBlur={handleCEPBlur}
                          placeholder="00000-000"
                          className={`form-input ${errors.zip_code ? 'is-error' : ''}`}
                          disabled={shippingMethod === 'pickup'}
                        />
                        {loadingCEP && (
                          <span className="checkout-field-note">Buscando...</span>
                        )}
                      </div>
                      {errors.zip_code && <span className="form-error">{errors.zip_code}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Endereço (Rua, número, bairro) *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          placeholder="Rua Exemplo, 123, Centro"
                          className={`form-input ${errors.address ? 'is-error' : ''}`}
                          disabled={shippingMethod === 'pickup'}
                        />
                      {errors.address && <span className="form-error">{errors.address}</span>}
                    </div>
                  </div>

                  <div className="checkout-grid-city">
                    <div className="form-field">
                      <label className="form-label">Cidade *</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="Sao Paulo"
                          className={`form-input ${errors.city ? 'is-error' : ''}`}
                          disabled={shippingMethod === 'pickup'}
                        />
                      {errors.city && <span className="form-error">{errors.city}</span>}
                    </div>
                    <div className="form-field">
                      <label className="form-label">Estado *</label>
                        <select
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          className={`form-input ${errors.state ? 'is-error' : ''}`}
                          disabled={shippingMethod === 'pickup'}
                        >
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

                <h4 className="checkout-subsection-title">Pagamento</h4>

                <div className="checkout-payment-methods">
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'pix'}
                      onChange={() => setPaymentMethod('pix')}
                    />
                    <div>
                      <div className="checkout-payment-option-label">PIX</div>
                      <div className="checkout-payment-option-hint">Aprovação rápida, QR Code após confirmar.</div>
                    </div>
                  </label>
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                    />
                    <div>
                      <div className="checkout-payment-option-label">Boleto</div>
                      <div className="checkout-payment-option-hint">Pagamento em até 3 dias úteis.</div>
                    </div>
                  </label>
                  <label className="checkout-payment-option">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                    />
                    <div>
                      <div className="checkout-payment-option-label">Cartão</div>
                      <div className="checkout-payment-option-hint">Crédito ou débito com tokenização.</div>
                    </div>
                  </label>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="checkout-payment-note">
                    O QR Code será exibido após confirmar o pedido.
                  </div>
                )}

                {paymentMethod === 'cash' && (
                  <div className="checkout-payment-note">
                    <label className="form-label">Método de boleto</label>
                    <select
                      name="cashMethod"
                      value={cashMethod}
                      onChange={(event) => setCashMethod(event.target.value)}
                      className="form-input"
                    >
                      <option value="bolbradesco">Boleto (Bradesco)</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="checkout-payment-card">
                    {!mpPublicKey && (
                      <div className="checkout-payment-warning">
                        Public key do Mercado Pago não configurada.
                      </div>
                    )}
                    {mpPublicKey && !mpReady && (
                      <div className="checkout-payment-warning">
                        Carregando SDK do Mercado Pago...
                      </div>
                    )}

                    <div className="form-field">
                      <label className="form-label">Tipo do cartão</label>
                      <select
                        name="cardPaymentType"
                        value={cardPaymentType}
                        onChange={(event) => setCardPaymentType(event.target.value)}
                        className="form-input"
                      >
                        <option value="credit_card">Crédito</option>
                        <option value="debit_card">Débito</option>
                      </select>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Número do cartão</label>
                      <input
                        type="text"
                        name="number"
                        value={cardData.number}
                        onChange={handleCardChange}
                        placeholder="0000 0000 0000 0000"
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Nome no cartão</label>
                      <input
                        type="text"
                        name="holder"
                        value={cardData.holder}
                        onChange={handleCardChange}
                        placeholder="Nome contido no cartão"
                        className="form-input"
                      />
                    </div>

                    <div className="checkout-payment-grid">
                      <div className="form-field">
                        <label className="form-label">Mês</label>
                        <input
                          type="text"
                          name="expMonth"
                          value={cardData.expMonth}
                          onChange={handleCardChange}
                          placeholder="MM"
                          className="form-input"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">Ano</label>
                        <input
                          type="text"
                          name="expYear"
                          value={cardData.expYear}
                          onChange={handleCardChange}
                          placeholder="AA"
                          className="form-input"
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label">CVV</label>
                        <input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="123"
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="form-field">
                      <label className="form-label">Parcelas</label>
                      <select
                        name="installments"
                        value={cardData.installments}
                        onChange={handleCardChange}
                        className="form-input"
                      >
                        {INSTALLMENT_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}x</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <label className="checkout-save-address">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                  />
                  <span>Salvar endereço para próximas compras</span>
                </label>

                <button
                  type="submit"
                  className="btn-primary checkout-submit"
                  disabled={loading || !isCardReady}
                >
                  {submitLabel}
                </button>
              </form>
            </div>
          </div>

          <div>
            <div className="checkout-card checkout-summary-card">
              <h3 className="checkout-section-title">Resumo do Pedido</h3>

              {cart.map((item) => (
                <div key={item.id} className="checkout-summary-item">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="checkout-summary-image"
                  />
                  <div className="checkout-summary-info">
                    <h4 className="checkout-summary-name">{item.name}</h4>
                    <p className="checkout-summary-qty">Qtd: {item.quantity}</p>
                  </div>
                  <span className="checkout-summary-price">
                    R$ {(Number(item.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}

              <div className="checkout-summary-divider">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>R$ {cartTotal.toFixed(2)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>{shippingMethod === 'pickup' ? 'Retirada' : 'Frete'}</span>
                  <span>
                    {shippingMethod === 'pickup'
                      ? 'R$ 0,00'
                      : `R$ ${shippingValue.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="checkout-summary-total">
                <span>Total</span>
                <span>R$ {totalWithShipping.toFixed(2)}</span>
              </div>

              <div className="checkout-security">
                Pagamento seguro via Mercado Pago
              </div>
              <p className="checkout-summary-note">
                Entrega com frete fixo de R$ 15,00 ou retirada sem custo na 112 Sul.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
