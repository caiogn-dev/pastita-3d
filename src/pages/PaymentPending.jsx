import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import * as storeApi from '../services/storeApi';
import Button from '../components/ui/Button';
import PixPayment from '../components/ui/PixPayment';

const AUTO_REFRESH_INTERVAL = 5000; // 5 seconds
const MAX_AUTO_REFRESH_TIME = 30 * 60 * 1000; // 30 minutes

const formatMoney = (value) => {
  const numeric = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'));
  return Number.isFinite(numeric) ? numeric.toFixed(2) : '0.00';
};

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
  const [orderItems, setOrderItems] = useState([]);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [checking, setChecking] = useState(false);
  const [pixCopied, setPixCopied] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  // Initialize startTime on mount (not during render)
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, []);

  const cachedPayment = useMemo(() => {
    if (typeof window === 'undefined' || !orderNumber) return null;
    try {
      const cached = sessionStorage.getItem(`mp_payment_${orderNumber}`);
      return cached ? normalizePayment(JSON.parse(cached)) : null;
    } catch {
      // Cache read failed - will fetch from API
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

  const checkStatus = useCallback(async (isAutoRefresh = false) => {
    if (!orderNumber) return;
    if (!isAutoRefresh) setChecking(true);
    
    try {
      // Use unified store API for order status
      const data = await storeApi.getOrderStatus(orderNumber);
      setOrderDetails(data);
      setLastChecked(new Date());
      
      if (data.payment) {
        setPaymentInfo(data.payment);
      }
      
      if (data.items) {
        setOrderItems(data.items);
      }
      
      const currentStatus = data.payment_status || data.status || data.payment?.status;

      if (currentStatus === 'completed' || currentStatus === 'approved' || currentStatus === 'paid') {
        setAutoRefreshEnabled(false);
        router.push(`/sucesso?order=${orderNumber}`);
      } else if (currentStatus === 'failed' || currentStatus === 'rejected' || currentStatus === 'cancelled') {
        setAutoRefreshEnabled(false);
        router.push(`/erro?order=${orderNumber}`);
      }
    } catch {
      // Status check failed - will retry on next interval
    }
    
    if (!isAutoRefresh) setChecking(false);
  }, [orderNumber, router]);

  // Initial fetch
  useEffect(() => {
    if (!orderNumber) return;
    
    let isMounted = true;
    
    const fetchInitialStatus = async () => {
      try {
        const data = await storeApi.getOrderStatus(orderNumber);
        if (!isMounted) return;
        
        setOrderDetails(data);
        setLastChecked(new Date());
        
        if (data.payment) {
          setPaymentInfo(data.payment);
        }
        
        if (data.items) {
          setOrderItems(data.items);
        }
        
        const currentStatus = data.payment_status || data.status || data.payment?.status;
        if (currentStatus === 'completed' || currentStatus === 'approved' || currentStatus === 'paid') {
          setAutoRefreshEnabled(false);
          router.push(`/sucesso?order=${orderNumber}`);
        } else if (currentStatus === 'failed' || currentStatus === 'rejected') {
          setAutoRefreshEnabled(false);
          router.push(`/erro?order=${orderNumber}`);
        }
      } catch {
        // Initial status fetch failed - will retry
      }
    };
    
    fetchInitialStatus();
    
    return () => {
      isMounted = false;
    };
  }, [orderNumber, router]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefreshEnabled || !orderNumber) return;

    intervalRef.current = setInterval(() => {
      // Stop auto-refresh after max time
      if (startTimeRef.current && Date.now() - startTimeRef.current > MAX_AUTO_REFRESH_TIME) {
        setAutoRefreshEnabled(false);
        return;
      }
      checkStatus(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [autoRefreshEnabled, orderNumber, checkStatus]);


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

        {/* Detalhes do Pedido (Total e Status) */}
        {(orderDetails || totalAmount) && (
          <div className="status-details">
            <div className="status-row">
              <span>Status:</span>
              <span className="status-badge">{displayStatus}</span>
            </div>
            <div className="status-row">
              <span>Total:</span>
              <span className="status-price">
                R$ {formatMoney(totalAmount)}
              </span>
            </div>
          </div>
        )}

        {/* Order Items */}
        {orderItems.length > 0 && (
          <div className="status-items">
            <h3 className="status-items-title">Itens do Pedido</h3>
            {orderItems.map((item) => (
              <div key={item.id} className="status-item">
                {item.product_image && (
                  <img 
                    src={item.product_image} 
                    alt={item.product_name} 
                    className="status-item-image"
                  />
                )}
                <div className="status-item-info">
                  <div className="status-item-name">{item.product_name}</div>
                  <div className="status-item-qty">Qtd: {item.quantity}</div>
                </div>
                <div className="status-item-price">
                  R$ {formatMoney(item.subtotal ?? item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PIX Payment */}
        {activePayment && isPixPayment && (activePayment.qr_code || activePayment.qr_code_base64) && (
          <>
            <PixPayment
              pixCode={activePayment.qr_code}
              qrCodeBase64={activePayment.qr_code_base64}
              amount={totalAmount}
              onCopy={() => setPixCopied(true)}
            />
            {pixCopied && (
              <div className="status-info status-info-success" style={{ marginTop: '1rem' }}>
                <p>✅ Código PIX copiado!</p>
              </div>
            )}
          </>
        )}

        {/* Boleto Payment */}
        {activePayment && activePayment.ticket_url && !isPixPayment && (
          <div className="status-boleto">
            <h3 className="status-boleto-title">Boleto Bancário</h3>
            <p>Clique no botão abaixo para visualizar e pagar seu boleto.</p>
            <a 
              href={activePayment.ticket_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="status-boleto-link"
            >
              Visualizar Boleto
            </a>
          </div>
        )}

        {/* Informações */}
        <div className="status-info status-info-info">
          <h3 className="status-info-title">O que acontece agora?</h3>
          <ul className="status-info-list">
            {isPixPayment ? (
              <>
                <li>Pagamentos via PIX são confirmados em minutos.</li>
                <li>Escaneie o QR Code ou copie o código PIX acima.</li>
              </>
            ) : activePayment?.ticket_url ? (
              <>
                <li>Pagamentos via Boleto podem levar até 3 dias úteis.</li>
                <li>Acesse o link acima para visualizar o boleto.</li>
              </>
            ) : (
              <li>Aguarde a confirmação do pagamento.</li>
            )}
            <li>Você receberá um e-mail assim que o pagamento for confirmado.</li>
            <li>Se houver algum erro, você será notificado aqui.</li>
          </ul>
        </div>

        {/* Auto-refresh indicator */}
        {autoRefreshEnabled && (
          <div className="auto-refresh-indicator">
            <div className="auto-refresh-spinner"></div>
            <span>Verificando automaticamente a cada 5 segundos...</span>
          </div>
        )}

        {lastChecked && (
          <p className="status-last-checked">
            Última verificação: {lastChecked.toLocaleTimeString('pt-BR')}
          </p>
        )}

        <div className="status-actions">
           <Button 
             variant="primary" 
             onClick={() => checkStatus(false)} 
             disabled={checking}
             isLoading={checking}
           >
             {checking ? 'Verificando...' : 'Já paguei / Verificar status'}
           </Button>
           <Link href="/cardapio">
             <Button variant="outline">Voltar ao Cardápio</Button>
           </Link>
        </div>

        {!autoRefreshEnabled && (
          <Button 
            variant="ghost"
            size="sm"
            onClick={() => { startTimeRef.current = Date.now(); setAutoRefreshEnabled(true); }}
          >
            Reativar verificação automática
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentPending;
