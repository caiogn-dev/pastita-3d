import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../services/api';

const normalizePayment = (payment) => {
  if (!payment) return null;
  // Busca profunda por dados da transação (comum em PIX no MP)
  const poi = payment.point_of_interaction?.transaction_data || 
              payment.transaction_data || 
              payment.point_of_interaction || {};
  
  const paymentMethodId = payment.payment_method_id
    || payment.payment_method?.id
    || poi.payment_method_id;

  const qrCode = payment.qr_code || poi.qr_code;
  const qrCodeBase64 = payment.qr_code_base64 || poi.qr_code_base64;
  const ticketUrl = payment.ticket_url || payment.transaction_details?.external_resource_url;

  return {
    ...payment,
    payment_method_id: paymentMethodId,
    payment_type_id: payment.payment_type_id || payment.payment_method?.type || poi.payment_type_id,
    qr_code: qrCode,
    qr_code_base64: qrCodeBase64,
    ticket_url: ticketUrl
  };
};

const PaymentPending = () => {
  const router = useRouter();
  const orderParam = router.isReady ? router.query.order : null;
  const orderNumber = Array.isArray(orderParam) ? orderParam[0] : orderParam;
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const cachedPayment = useMemo(() => {
    if (typeof window === 'undefined' || !orderNumber) return null;
    try {
      const cached = sessionStorage.getItem(`mp_payment_${orderNumber}`);
      return cached ? normalizePayment(JSON.parse(cached)) : null;
    } catch (e) {
      console.error("Erro ao ler cache", e);
      return null;
    }
  }, [orderNumber]);

  const activePayment = useMemo(() => {
    const apiP = normalizePayment(paymentInfo);
    const cacheP = normalizePayment(cachedPayment);

    // Se a API retornar o pagamento mas sem o QR Code (comum em checks rápidos),
    // mescla com o QR Code que já tínhamos no cache
    if (apiP && !apiP.qr_code && cacheP?.qr_code) {
        return { ...apiP, qr_code: cacheP.qr_code, qr_code_base64: cacheP.qr_code_base64 };
    }
    return apiP || cacheP;
  }, [paymentInfo, cachedPayment]);

  const totalAmount = useMemo(() => {
    if (orderDetails?.total_amount) return Number(orderDetails.total_amount);
    if (orderDetails?.checkout?.total_amount) return Number(orderDetails.checkout.total_amount);
    if (activePayment?.transaction_amount) return Number(activePayment.transaction_amount);
    return null;
  }, [orderDetails, activePayment]);

  // Define status
  const rawStatus = orderDetails?.payment_status || activePayment?.status;
  const displayStatus = rawStatus || 'pending';
  
  const isPixPayment = activePayment?.payment_type_id === 'bank_transfer' 
    || activePayment?.payment_method_id === 'pix'
    || !!activePayment?.qr_code;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber) return;
      try {
        const response = await api.get(`/checkout/status/?order_number=${orderNumber}`, { skipAuthRedirect: true });
        setOrderDetails(response.data);
        if (response.data.payment) {
            setPaymentInfo(response.data.payment);
        }
      } catch (error) {
        console.error('Erro ao buscar detalhes:', error);
      }
    };
    fetchOrderDetails();
  }, [orderNumber]);

  const checkStatus = async () => {
    if (!orderNumber) return;
    setChecking(true);
    try {
      const response = await api.get(`/checkout/status/?order_number=${orderNumber}`, { skipAuthRedirect: true });
      setOrderDetails(response.data);
      if (response.data.payment) {
          setPaymentInfo(response.data.payment);
      }
      
      const currentStatus = response.data.payment_status || response.data.payment?.status;

      if (currentStatus === 'completed' || currentStatus === 'approved') {
        router.push(`/sucesso?order=${orderNumber}`);
      } else if (currentStatus === 'failed' || currentStatus === 'rejected') {
        router.push(`/erro?order=${orderNumber}`);
      }
    } catch (err) {
      console.error('Erro ao verificar status:', err);
    }
    setChecking(false);
  };

  const handleCopyPix = async () => {
    if (!activePayment?.qr_code) return;
    try {
      await navigator.clipboard.writeText(activePayment.qr_code);
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 1500);
    } catch {
      window.prompt('Copie o código PIX:', activePayment.qr_code);
    }
  };

  return (
    <div className="status-page">
      <div className="status-card status-pending">
        <div className="status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12,6 12,12 16,14" />
          </svg>
        </div>

        <h1 className="status-title">Pagamento em análise</h1>
        <p className="status-subtitle">
          Seu pagamento está sendo processado e será confirmado em breve.
        </p>

        {orderNumber && (
          <div className="status-order">
            <span className="status-label">Número do Pedido:</span>
            <span className="status-value">{orderNumber}</span>
          </div>
        )}

        {/* RE-ADICIONADO: Detalhes do Pedido (Total e Status) */}
        {(orderDetails || totalAmount) && (
          <div className="status-details">
            <div className="status-row">
              <span>Status:</span>
              <span className="status-badge">{displayStatus}</span>
            </div>
            <div className="status-row">
              <span>Total:</span>
              <span className="status-price">
                R$ {totalAmount !== null ? totalAmount.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        )}

        {activePayment && isPixPayment && (
          <div className="status-pix">
            <h3 className="status-pix-title">PIX pronto para pagamento</h3>
            <p className="status-pix-subtitle">Escaneie o QR Code ou copie o código abaixo.</p>
            {activePayment.qr_code_base64 && (
              <img src={`data:image/png;base64,${activePayment.qr_code_base64}`} alt="QR Code PIX" className="status-pix-image" />
            )}
            {activePayment.qr_code && (
              <div className="status-pix-row">
                <textarea readOnly value={activePayment.qr_code} className="status-pix-code" />
                <button type="button" onClick={handleCopyPix} className="status-pix-copy">{pixCopied ? 'Copiado' : 'Copiar'}</button>
              </div>
            )}
          </div>
        )}

        {/* RE-ADICIONADO: Informações Informativas */}
        <div className="status-info status-info-info">
          <h3 className="status-info-title">O que acontece agora?</h3>
          <ul className="status-info-list">
            <li>Pagamentos via PIX são confirmados em minutos.</li>
            <li>Você receberá um e-mail assim que o pagamento for confirmado.</li>
            <li>Se houver algum erro, você será notificado aqui.</li>
          </ul>
        </div>

        <div className="status-actions">
           <button onClick={checkStatus} disabled={checking} className="status-button status-button-primary">
             {checking ? 'Verificando...' : 'Já paguei / Verificar status'}
           </button>
           <Link href="/cardapio" className="status-button status-button-secondary">
             Voltar ao Cardápio
           </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
