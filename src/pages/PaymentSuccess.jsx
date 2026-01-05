import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import '../styles/status-pages.css';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderNumber) {
        try {
          const response = await api.get(`/checkout/status/?order_number=${orderNumber}`);
          setOrderDetails(response.data);
        } catch (error) {
          console.error('Error fetching order details:', error);
        }
      }
      setLoading(false);
    };

    fetchOrderDetails();
  }, [orderNumber]);

  return (
    <div className="status-page">
      <div className="status-card status-success">
        <div className="status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
            <polyline points="22,4 12,14.01 9,11.01" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="status-title">Pagamento confirmado!</h1>
        <p className="status-subtitle">Seu pedido foi processado com sucesso.</p>

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

        {!loading && (
          <p className="status-note">
            Voce recebera um e-mail com os detalhes do seu pedido e informacoes de entrega.
          </p>
        )}

        <div className="status-actions">
          <Link to="/cardapio" className="status-button status-button-primary">
            Continuar comprando
          </Link>
          <Link to="/" className="status-button status-button-secondary">
            Voltar ao inicio
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
