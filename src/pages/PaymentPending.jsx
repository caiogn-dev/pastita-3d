import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import api from '../services/api';

const normalizePayment = (payment) => {
  if (!payment) return null;
  const poi = payment.point_of_interaction?.transaction_data || payment.transaction_data || {};
  const paymentMethodId = payment.payment_method_id
    || payment.payment_method?.id
    || poi.payment_method_id;
  return {
    ...payment,
    payment_method_id: paymentMethodId,
    payment_type_id: payment.payment_type_id || payment.payment_method?.type || poi.payment_type_id,
    qr_code: payment.qr_code || poi.qr_code,
    qr_code_base64: payment.qr_code_base64 || poi.qr_code_base64,
  };
};

const PaymentPending = () => {
  const router = useRouter();
  const orderParam = router.query.order;
  const orderNumber = Array.isArray(orderParam) ? orderParam[0] : orderParam;
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [cachedPayment, setCachedPayment] = useState(null);
  const [checking, setChecking] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);

  const activePayment = useMemo(
    () => normalizePayment(paymentInfo) || normalizePayment(cachedPayment),
    [paymentInfo, cachedPayment]
  );
  const paymentStatus = orderDetails?.payment_status;
  const isPendingStatus = ['pending', 'processing'].includes(paymentStatus);
  const showPaymentDetails = isPendingStatus || !paymentStatus;
  const isPixPayment = activePayment?.payment_type_id === 'pix'
    || activePayment?.payment_method_id === 'pix'
    || activePayment?.qr_code_base64
    || activePayment?.qr_code;

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderNumber) return;

      try {
        const cached = sessionStorage.getItem(`mp_payment_${orderNumber}`);
        if (cached) {
          setCachedPayment(normalizePayment(JSON.parse(cached)));
        }
      } catch {
        setCachedPayment(null);
      }

      try {
        const response = await api.get(`/checkout/status/?order_number=${orderNumber}`, { skipAuthRedirect: true });
        setOrderDetails(response.data);
        setPaymentInfo(response.data.payment ? normalizePayment(response.data.payment) : null);
      } catch (error) {
        console.error('Error fetching order details:', error);
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
      setPaymentInfo(response.data.payment ? normalizePayment(response.data.payment) : null);

      if (response.data.payment_status === 'completed') {
        router.push(`/sucesso?order=${orderNumber}`);
      } else if (response.data.payment_status === 'failed') {
        router.push(`/erro?order=${orderNumber}`);
      }
    } catch (err) {
      console.error('Error checking status:', err);
    }
    setChecking(false);
  };

  const handleCopyPix = async () => {
    if (!activePayment?.qr_code) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(activePayment.qr_code);
      } else {
        window.prompt('Copie o codigo PIX:', activePayment.qr_code);
      }
      setPixCopied(true);
      setTimeout(() => setPixCopied(false), 1500);
    } catch {
      window.prompt('Copie o codigo PIX:', activePayment.qr_code);
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

        <h1 className="status-title">Pagamento em analise</h1>
        <p className="status-subtitle">
          Seu pagamento esta sendo processado e sera confirmado em breve.
        </p>

        {orderNumber && (
          <div className="status-order">
            <span className="status-label">Numero do Pedido:</span>
            <span className="status-value">{orderNumber}</span>
          </div>
        )}

        {orderDetails && (
          <div className="status-details">
            <div className="status-row">
              <span>Status:</span>
              <span className="status-badge">{orderDetails.payment_status}</span>
            </div>
            <div className="status-row">
              <span>Total:</span>
              <span className="status-price">
                R$ {orderDetails.total_amount ? Number(orderDetails.total_amount).toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        )}

        {showPaymentDetails && isPixPayment && (
          <div className="status-pix">
            <h3 className="status-pix-title">PIX pronto para pagamento</h3>
            <p className="status-pix-subtitle">Escaneie o QR Code ou copie o codigo abaixo.</p>
            {activePayment?.qr_code_base64 && (
              <img
                src={`data:image/png;base64,${activePayment.qr_code_base64}`}
                alt="QR Code PIX"
                className="status-pix-image"
              />
            )}
            {activePayment?.qr_code && (
              <div className="status-pix-row">
                <textarea
                  readOnly
                  value={activePayment.qr_code}
                  className="status-pix-code"
                />
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="status-pix-copy"
                >
                  {pixCopied ? 'Copiado' : 'Copiar'}
                </button>
              </div>
            )}
          </div>
        )}


        <div className="status-info status-info-info">
          <h3 className="status-info-title">O que acontece agora?</h3>
          <ul className="status-info-list">
            <li>Pagamentos via boleto podem levar ate 3 dias uteis</li>
            <li>Pagamentos via PIX sao confirmados em minutos</li>
            <li>Voce recebe um e-mail quando o pagamento for confirmado</li>
          </ul>
        </div>

        <button
          onClick={checkStatus}
          disabled={checking}
          className="status-button status-button-primary"
        >
          {checking ? 'Verificando...' : 'Verificar status'}
        </button>

        <div className="status-actions">
          <Link href="/cardapio" className="status-button status-button-primary">
            Continuar comprando
          </Link>
          <Link href="/" className="status-button status-button-secondary">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentPending;
