import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { CardPayment, initMercadoPago } from '@mercadopago/sdk-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { fetchCsrfToken } from '../services/api';
import dynamic from 'next/dynamic';

// Dynamically import map component to avoid SSR issues
const InteractiveMap = dynamic(() => import('../components/InteractiveMap'), {
  ssr: false,
  loading: () => <div className="map-loading-placeholder">Carregando mapa...</div>
});

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
const formatMoney = (value) => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'));
  if (Number.isNaN(numeric)) return '0.00';
  return numeric.toFixed(2);
};

const splitFullName = (value) => {
  const parts = toSafeString(value).trim().split(/\s+/).filter(Boolean);
  const firstName = parts.shift() || '';
  const lastName = parts.join(' ');
  return { firstName, lastName };
};

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

const STORE_ADDRESS = {
  address: process.env.NEXT_PUBLIC_STORE_ADDRESS || 'Q. 112 Sul Rua SR 1, conj. 06 lote 04 - Plano Diretor Sul',
  city: process.env.NEXT_PUBLIC_STORE_CITY || 'Palmas',
  state: process.env.NEXT_PUBLIC_STORE_STATE || 'TO',
  zip_code: process.env.NEXT_PUBLIC_STORE_ZIP || '77020-170'
};

// Store coordinates for map display (Palmas, TO)
const STORE_LOCATION = {
  latitude: parseFloat(process.env.NEXT_PUBLIC_STORE_LAT) || -10.1847,
  longitude: parseFloat(process.env.NEXT_PUBLIC_STORE_LNG) || -48.3337
};

const CheckoutPage = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { profile, user, updateProfile } = useAuth();
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
  const [paymentError, setPaymentError] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loadingCoupon, setLoadingCoupon] = useState(false);

  // Scheduling
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTimeSlot, setScheduledTimeSlot] = useState('');
  const [enableScheduling, setEnableScheduling] = useState(false);
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingCEP, setLoadingCEP] = useState(false);
  const [saveAddress, setSaveAddress] = useState(true);
  const isCardReady = paymentMethod !== 'card' || Boolean(mpPublicKey);
  const saveAddressRef = useRef(saveAddress);

  // Map state for delivery address selection
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Generate available dates (next 7 days, excluding Sundays)
  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      if (date.getDay() !== 0) { // Exclude Sundays
        dates.push({
          value: date.toISOString().split('T')[0],
          label: date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
        });
      }
    }
    return dates;
  };

  // Available time slots
  const TIME_SLOTS = [
    { value: '10:00-12:00', label: '10:00 - 12:00' },
    { value: '12:00-14:00', label: '12:00 - 14:00' },
    { value: '14:00-16:00', label: '14:00 - 16:00' },
    { value: '16:00-18:00', label: '16:00 - 18:00' },
    { value: '18:00-20:00', label: '18:00 - 20:00' },
  ];
  
  // ... (Effects e handlers permanecem iguais até o handleSubmit)
  useEffect(() => {
    saveAddressRef.current = saveAddress;
  }, [saveAddress]);

  useEffect(() => {
    const loadUserData = async () => {
      const currentProfile = profile || user;
      if (currentProfile) {
        setFormData((prev) => ({
          ...prev,
          name: currentProfile.first_name && currentProfile.last_name
            ? `${currentProfile.first_name} ${currentProfile.last_name}`.trim()
            : prev.name,
          email: currentProfile.email || prev.email,
          phone: currentProfile.phone ? formatPhone(currentProfile.phone) : prev.phone,
          cpf: currentProfile.cpf ? formatCPF(currentProfile.cpf) : prev.cpf,
          address: currentProfile.address || prev.address,
          city: currentProfile.city || prev.city,
          state: currentProfile.state || prev.state,
          zip_code: currentProfile.zip_code ? formatCEP(currentProfile.zip_code) : prev.zip_code
        }));
      }

      try {
        await api.get('/orders/history/');
      } catch {
        // No previous orders - this is expected for new users
      }
    };

    loadUserData();
  }, [profile, user]);

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
    // Clear applied coupon if user changes the code
    if (appliedCoupon && event.target.value.trim().toUpperCase() !== appliedCoupon.code) {
      setAppliedCoupon(null);
    }
  };

  const handleApplyCoupon = async () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError('Digite um código de cupom');
      return;
    }

    setLoadingCoupon(true);
    setCouponError('');

    try {
      const shippingValue = Number(shippingCost) || 0;
      const totalForCoupon = cartTotal + shippingValue;
      
      const response = await api.post('/coupons/validate/', {
        code,
        total: totalForCoupon
      });

      if (response.data.valid) {
        setAppliedCoupon({
          code: response.data.code,
          description: response.data.description,
          discount_type: response.data.discount_type,
          discount_value: Number(response.data.discount_value) || 0,
          discount_amount: Number(response.data.discount_amount) || 0
        });
        setCouponError('');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Cupom inválido';
      setCouponError(errorMsg);
      setAppliedCoupon(null);
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(false);

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
      setDeliveryInfo(null);
    } else {
      setSaveAddress(previousSavePref.current ?? true);
      // If we have delivery info, use it; otherwise wait for CEP-based calculation
      if (deliveryInfo) {
        setShippingCost(Number(deliveryInfo.fee) || 0);
      } else {
        const cleanZip = onlyDigits(formData.zip_code);
        if (cleanZip.length === 8) {
          calculateDeliveryFee(formData.zip_code, {
            address: formData.address,
            city: formData.city,
            state: formData.state
          });
        } else {
          setShippingCost(null);
        }
      }
      if (deliveryAddressRef.current) {
        setFormData((prev) => ({ ...prev, ...deliveryAddressRef.current }));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shippingMethod]);

  const fetchAddressFromCEP = async (cep) => {
    const cleanCEP = onlyDigits(cep);
    if (cleanCEP.length !== 8) return;
    setLoadingCEP(true);
    let addressData = null;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      const data = await response.json();
      if (!data.erro) {
        addressData = {
          address: data.logradouro ? `${data.logradouro}, ${data.bairro}` : '',
          city: data.localidade || '',
          state: data.uf || ''
        };
        setFormData((prev) => ({
          ...prev,
          address: addressData.address || prev.address,
          city: addressData.city || prev.city,
          state: addressData.state || prev.state
        }));
      }
    } catch {
      // CEP lookup failed - user can still enter address manually
    }
    setLoadingCEP(false);
    return addressData;
  };

  const calculateDeliveryFee = async (cep, manualData = {}) => {
    const cleanCEP = onlyDigits(cep);
    if (cleanCEP.length !== 8) return;
    
    setLoadingDelivery(true);
    try {
      const payload = {
        zip_code: cleanCEP,
        address: manualData.address || '',
        city: manualData.city || '',
        state: manualData.state || ''
      };
      const response = await api.post('/delivery/calculate/', payload);
      if (response.data.available) {
        setDeliveryInfo({
          fee: Number(response.data.fee) || 0,
          estimated_days: Number(response.data.estimated_days) || 0,
          zone_name: response.data.zone_name,
          distance_km: response.data.distance_km,
          distance_band: response.data.distance_band
        });
        setShippingCost(Number(response.data.fee) || 0);
      }
    } catch {
      // Delivery calculation failed - show error to user via UI
      setShippingCost(null);
      setDeliveryInfo(null);
    }
    setLoadingDelivery(false);
  };

  const handleCEPBlur = async () => {
    const cleanCEP = onlyDigits(formData.zip_code);
    if (cleanCEP.length === 8) {
      const addressData = await fetchAddressFromCEP(formData.zip_code);
      if (shippingMethod === 'delivery') {
        const fallbackData = {
          address: formData.address,
          city: formData.city,
          state: formData.state
        };
        calculateDeliveryFee(formData.zip_code, addressData || fallbackData);
      }
    }
  };

  // Handle map location selection
  const handleMapLocationSelect = useCallback((location) => {
    setSelectedLocation(location);
    // If we got address data from reverse geocoding, update form
    if (location.address || location.city || location.state || location.zip_code) {
      setFormData(prev => ({
        ...prev,
        address: location.address || prev.address,
        city: location.city || prev.city,
        state: location.state || prev.state,
        zip_code: location.zip_code ? formatCEP(location.zip_code) : prev.zip_code
      }));
      // Calculate delivery fee with new address
      if (location.zip_code) {
        calculateDeliveryFee(location.zip_code, {
          address: location.address,
          city: location.city,
          state: location.state
        });
      }
    }
  }, []);

  // Handle address change from map reverse geocoding
  const handleMapAddressChange = useCallback((addressData) => {
    if (!addressData) return;
    setFormData(prev => ({
      ...prev,
      address: addressData.address || prev.address,
      city: addressData.city || prev.city,
      state: addressData.state || prev.state,
      zip_code: addressData.zip_code ? formatCEP(addressData.zip_code) : prev.zip_code
    }));
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'E-mail inválido';
    
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    else if (onlyDigits(formData.phone).length < 10) newErrors.phone = 'Telefone inválido (mínimo 10 dígitos)';
    
    if (!formData.cpf.trim()) newErrors.cpf = 'CPF é obrigatório';
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

  const buildCheckoutPayload = () => ({
    customer_name: formData.name.trim(),
    customer_email: formData.email.trim(),
    customer_phone: onlyDigits(formData.phone),
    cpf: onlyDigits(formData.cpf),
    shipping_address: shippingMethod === 'pickup' ? STORE_ADDRESS.address : formData.address,
    shipping_city: shippingMethod === 'pickup' ? STORE_ADDRESS.city : formData.city,
    shipping_state: shippingMethod === 'pickup' ? STORE_ADDRESS.state : formData.state,
    shipping_zip_code: shippingMethod === 'pickup'
      ? onlyDigits(STORE_ADDRESS.zip_code)
      : onlyDigits(formData.zip_code),
    scheduled_date: enableScheduling && scheduledDate ? scheduledDate : null,
    scheduled_time_slot: enableScheduling && scheduledTimeSlot ? scheduledTimeSlot : null,
  });

  const buildProfileUpdatePayload = () => {
    const payload = {};
    const { firstName, lastName } = splitFullName(formData.name);
    const normalizedEmail = formData.email.trim();
    const normalizedPhone = onlyDigits(formData.phone);
    const normalizedCpf = onlyDigits(formData.cpf);

    if (!profile?.first_name && firstName) payload.first_name = firstName;
    if (!profile?.last_name && lastName) payload.last_name = lastName;
    if (!profile?.email && normalizedEmail) payload.email = normalizedEmail;
    if (!profile?.phone && normalizedPhone) payload.phone = normalizedPhone;
    if (!profile?.cpf && normalizedCpf) payload.cpf = normalizedCpf;

    if (saveAddress && shippingMethod === 'delivery') {
      payload.address = formData.address;
      payload.city = formData.city;
      payload.state = formData.state;
      payload.zip_code = onlyDigits(formData.zip_code);
    }

    return payload;
  };

  const processCheckout = async (paymentPayload) => {
    const response = await api.post('/checkout/create_checkout/', {
      ...buildCheckoutPayload(),
      shipping_method: shippingMethod,
      coupon_code: appliedCoupon ? appliedCoupon.code : '',
      payment: paymentPayload
    });

    if (response.data.payment_error) {
      let msg = response.data.payment_error;
      if (typeof msg === 'object') msg = JSON.stringify(msg);
      throw new Error(`Erro no pagamento: ${msg}`);
    }

    const payment = response.data.payment;
    const orderNumber = response.data.order_number;

    // Cache payment data for the pending page
    if (payment && orderNumber) {
      try {
        sessionStorage.setItem(
          `mp_payment_${orderNumber}`,
          JSON.stringify({ 
            ...payment, 
            order_number: orderNumber,
            total_amount: response.data.total_amount
          })
        );
      } catch {
        // Storage not available - payment will still work
      }
    }

    // Clear cart only after successful checkout creation
    clearCart();

    if (payment) {
      const paymentStatus = payment.status;

      if (paymentStatus === 'approved') {
        router.push(`/sucesso?order=${orderNumber}`);
        return;
      }

      if (paymentStatus === 'rejected') {
        const errorCode = payment.status_detail || '';
        router.push(`/erro?order=${orderNumber}&error=${errorCode}`);
        return;
      }

      // For PIX, Boleto, or pending payments - go to pending page
      router.push(`/pendente?order=${orderNumber}`);
      return;
    }

    // Fallback: check for redirect-based payment link
    const paymentLink = response.data.payment_link || response.data.init_point || response.data.sandbox_init_point;
    if (paymentLink) {
      // For redirect-based payments, redirect to MP
      window.location.href = paymentLink;
      return;
    }

    // If we have an order number but no payment data, still go to pending page
    if (orderNumber) {
      router.push(`/pendente?order=${orderNumber}`);
      return;
    }

    throw new Error('Link de pagamento não recebido do servidor.');
  };

  const handleCardSubmit = async (cardFormData, additionalData) => {
    if (!validateForm()) {
      setPaymentError('Verifique os erros no formulário.');
      return Promise.reject(new Error('Formulário inválido'));
    }
    if (shippingMethod === 'delivery' && shippingCost === null) {
      setPaymentError('Calcule o frete pelo CEP antes de continuar.');
      return Promise.reject(new Error('Frete não calculado'));
    }

    setLoading(true);
    setPaymentError('');

    try {
      await fetchCsrfToken();
      const profilePayload = buildProfileUpdatePayload();
      if (Object.keys(profilePayload).length > 0) {
        await updateProfile(profilePayload);
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
      // Payment error - show to user via UI
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
    if (shippingMethod === 'delivery' && shippingCost === null) {
      setPaymentError('Calcule o frete pelo CEP antes de continuar.');
      return;
    }

    setLoading(true);
    setPaymentError('');

    try {
      await fetchCsrfToken();

      const profilePayload = buildProfileUpdatePayload();
      if (Object.keys(profilePayload).length > 0) {
        await updateProfile(profilePayload);
      }

      let paymentPayload = null;
      if (paymentMethod === 'pix') {
        paymentPayload = { method: 'pix' };
      } else if (paymentMethod === 'cash_on_delivery') {
        paymentPayload = { method: 'cash_on_delivery' };
      }

      await processCheckout(paymentPayload);
    } catch (error) {
      // Payment error - show to user via UI
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
      : paymentMethod === 'cash_on_delivery'
        ? 'CONFIRMAR PEDIDO'
        : 'PAGAR COM CARTÃO';

  const shippingValue = Number(shippingCost) || 0;
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discount_amount) || 0 : 0;
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
                      <div className="checkout-payment-option-hint">
                        {loadingDelivery ? (
                          'Calculando frete...'
                        ) : deliveryInfo ? (
                          <>
                            R$ {formatMoney(deliveryInfo.fee)} - {deliveryInfo.zone_name} ({deliveryInfo.estimated_days} dias
                            {deliveryInfo.distance_km != null ? `, ${formatMoney(deliveryInfo.distance_km)} km` : ''}
                            )
                          </>
                        ) : (
                          'Frete calculado pelo CEP'
                        )}
                      </div>
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
                    </div>
                    <div className="pickup-map-container">
                      <InteractiveMap
                        initialLocation={STORE_LOCATION}
                        height="200px"
                        showSearch={false}
                        showGeolocation={false}
                        markerDraggable={false}
                      />
                    </div>
                  </div>
                )}
                
                {shippingMethod === 'delivery' && (
                  <div className="checkout-field-group">
                    {/* Map toggle button */}
                    <div className="map-toggle-section">
                      <button
                        type="button"
                        className={`map-toggle-btn ${showMap ? 'active' : ''}`}
                        onClick={() => setShowMap(!showMap)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        {showMap ? 'Ocultar mapa' : 'Selecionar no mapa'}
                      </button>
                      {selectedLocation && (
                        <span className="location-confirmed">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          Localização confirmada
                        </span>
                      )}
                    </div>

                    {/* Interactive map for delivery address */}
                    {showMap && (
                      <div className="delivery-map-container">
                        <InteractiveMap
                          initialLocation={selectedLocation}
                          onLocationSelect={handleMapLocationSelect}
                          onAddressChange={handleMapAddressChange}
                          height="300px"
                          showSearch={true}
                          showGeolocation={true}
                          placeholder="Buscar endereço ou CEP..."
                        />
                        <p className="map-hint">Clique no mapa ou use sua localização para selecionar o endereço de entrega</p>
                      </div>
                    )}

                    {/* Address form fields */}
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

                {/* Scheduling Section */}
                <div className="checkout-field-group">
                  <div className="form-field">
                    <label className="checkout-checkbox-label">
                      <input 
                        type="checkbox" 
                        checked={enableScheduling} 
                        onChange={(e) => {
                          setEnableScheduling(e.target.checked);
                          if (!e.target.checked) {
                            setScheduledDate('');
                            setScheduledTimeSlot('');
                          }
                        }} 
                      />
                      <span>Agendar {shippingMethod === 'pickup' ? 'retirada' : 'entrega'}</span>
                    </label>
                  </div>
                  
                  {enableScheduling && (
                    <div className="scheduling-fields">
                      <div className="form-grid-2">
                        <div className="form-field">
                          <label className="form-label">Data *</label>
                          <select 
                            value={scheduledDate} 
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="form-input"
                          >
                            <option value="">Selecione uma data</option>
                            {getAvailableDates().map((date) => (
                              <option key={date.value} value={date.value}>{date.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-field">
                          <label className="form-label">Horário *</label>
                          <select 
                            value={scheduledTimeSlot} 
                            onChange={(e) => setScheduledTimeSlot(e.target.value)}
                            className="form-input"
                          >
                            <option value="">Selecione um horário</option>
                            {TIME_SLOTS.map((slot) => (
                              <option key={slot.value} value={slot.value}>{slot.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <p className="scheduling-note">
                        📅 Seu pedido será {shippingMethod === 'pickup' ? 'preparado para retirada' : 'entregue'} na data e horário selecionados.
                      </p>
                    </div>
                  )}
                </div>

                <div className="checkout-field-group">
                  <div className="form-field">
                    <label className="form-label">Cupom de desconto</label>
                    {appliedCoupon ? (
                      <div className="coupon-applied">
                        <div className="coupon-applied-info">
                          <span className="coupon-applied-code">{appliedCoupon.code}</span>
                          <span className="coupon-applied-discount">
                            -{appliedCoupon.discount_type === 'percentage' 
                              ? `${appliedCoupon.discount_value}%` 
                              : `R$ ${formatMoney(appliedCoupon.discount_value)}`}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          className="coupon-remove-btn"
                          onClick={handleRemoveCoupon}
                        >
                          Remover
                        </button>
                      </div>
                    ) : (
                      <div className="coupon-input-group">
                        <input
                          type="text"
                          name="coupon"
                          value={couponCode}
                          onChange={handleCouponChange}
                          placeholder="Digite o código"
                          className={`form-input ${couponError ? 'is-error' : ''}`}
                          disabled={loadingCoupon}
                        />
                        <button 
                          type="button" 
                          className="coupon-apply-btn"
                          onClick={handleApplyCoupon}
                          disabled={loadingCoupon || !couponCode.trim()}
                        >
                          {loadingCoupon ? 'Validando...' : 'Aplicar'}
                        </button>
                      </div>
                    )}
                    {couponError && <span className="form-error">{couponError}</span>}
                  </div>
                </div>

                <h4 className="checkout-subsection-title">Pagamento</h4>
                 <div className="checkout-payment-methods">
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} />
                    <div>
                      <div className="checkout-payment-option-label">PIX</div>
                      <div className="checkout-payment-option-hint">Pagamento instantâneo</div>
                    </div>
                  </label>
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                    <div>
                      <div className="checkout-payment-option-label">Cartão</div>
                      <div className="checkout-payment-option-hint">Crédito ou débito</div>
                    </div>
                  </label>
                  <label className="checkout-payment-option">
                    <input type="radio" name="paymentMethod" checked={paymentMethod === 'cash_on_delivery'} onChange={() => setPaymentMethod('cash_on_delivery')} />
                    <div>
                      <div className="checkout-payment-option-label">Dinheiro</div>
                      <div className="checkout-payment-option-hint">Pague na entrega/retirada</div>
                    </div>
                  </label>
                </div>
                
                {paymentMethod === 'cash_on_delivery' && (
                  <div className="checkout-payment-note" style={{background: '#fef3c7', border: '1px dashed #f59e0b', color: '#92400e'}}>
                    <strong>💵 Pagamento em dinheiro</strong>
                    <p style={{margin: '8px 0 0', fontSize: '0.9rem'}}>
                      O pagamento será realizado no momento da {shippingMethod === 'pickup' ? 'retirada' : 'entrega'}.
                      Tenha o valor exato em mãos para facilitar o troco.
                    </p>
                  </div>
                )}
                
                {/* ... Campos condicionais de cartão ... */}
                {paymentMethod === 'card' && (
                  <div className="checkout-payment-card">
                    {!mpPublicKey ? (
                      <div className="checkout-alert" style={{backgroundColor: '#fff7ed', color: '#c2410c', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #fed7aa'}}>
                        Public key do Mercado Pago não configurada.
                      </div>
                    ) : (
                      <CardPayment
                        key={`card-${shippingMethod}-${totalWithShipping}`}
                        initialization={{ amount: Number(formatMoney(totalWithShipping)) }}
                        onSubmit={handleCardSubmit}
                        onReady={() => {}}
                        onError={() => {
                          // Card brick error - show to user via UI
                          setPaymentError('Erro ao processar cartão. Verifique os dados.');
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
                  <span className="checkout-summary-price">R$ {formatMoney(Number(item.price) * item.quantity)}</span>
                </div>
              ))}
              <div className="checkout-summary-divider">
                <div className="checkout-summary-row">
                  <span>Subtotal</span><span>R$ {formatMoney(cartTotal)}</span>
                </div>
                <div className="checkout-summary-row">
                  <span>{shippingMethod === 'pickup' ? 'Retirada' : 'Frete'}</span>
                  <span>
                    {shippingMethod === 'pickup'
                      ? 'R$ 0,00'
                      : shippingCost === null
                        ? 'A calcular'
                        : `R$ ${formatMoney(shippingValue)}`}
                  </span>
                </div>
                {appliedCoupon && couponDiscount > 0 && (
                  <div className="checkout-summary-row checkout-summary-discount">
                    <span>Cupom {appliedCoupon.code}</span>
                    <span className="discount-value">-R$ {formatMoney(couponDiscount)}</span>
                  </div>
                )}
              </div>
              <div className="checkout-summary-total">
                <span>Total</span><span>R$ {formatMoney(totalWithShipping)}</span>
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
