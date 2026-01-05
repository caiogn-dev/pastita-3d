import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const PaymentError = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const errorCode = searchParams.get('error');

  const getErrorMessage = (code) => {
    const errorMessages = {
      'cc_rejected_bad_filled_card_number': 'Número do cartão inválido',
      'cc_rejected_bad_filled_date': 'Data de validade inválida',
      'cc_rejected_bad_filled_other': 'Dados do cartão incorretos',
      'cc_rejected_bad_filled_security_code': 'Código de segurança inválido',
      'cc_rejected_blacklist': 'Cartão não autorizado',
      'cc_rejected_call_for_authorize': 'Autorização necessária - entre em contato com seu banco',
      'cc_rejected_card_disabled': 'Cartão desabilitado',
      'cc_rejected_duplicated_payment': 'Pagamento duplicado',
      'cc_rejected_high_risk': 'Pagamento recusado por segurança',
      'cc_rejected_insufficient_amount': 'Saldo insuficiente',
      'cc_rejected_invalid_installments': 'Parcelas inválidas',
      'cc_rejected_max_attempts': 'Limite de tentativas excedido',
      'cc_rejected_other_reason': 'Pagamento recusado',
    };
    return errorMessages[code] || 'Ocorreu um erro ao processar seu pagamento';
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={iconContainerStyle}>
          <svg style={iconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        
        <h1 style={titleStyle}>Pagamento não Aprovado</h1>
        <p style={subtitleStyle}>
          {getErrorMessage(errorCode)}
        </p>
        
        {orderNumber && (
          <div style={orderInfoStyle}>
            <span style={labelStyle}>Pedido:</span>
            <span style={valueStyle}>{orderNumber}</span>
          </div>
        )}

        <div style={tipsContainerStyle}>
          <h3 style={tipsTitle}>O que você pode fazer:</h3>
          <ul style={tipsList}>
            <li>Verificar os dados do cartão</li>
            <li>Tentar outro método de pagamento</li>
            <li>Entrar em contato com seu banco</li>
            <li>Tentar novamente em alguns minutos</li>
          </ul>
        </div>

        <div style={buttonContainerStyle}>
          <Link to="/checkout" style={primaryButtonStyle}>
            Tentar Novamente
          </Link>
          <Link to="/cardapio" style={secondaryButtonStyle}>
            Voltar ao Cardápio
          </Link>
        </div>

        <p style={supportTextStyle}>
          Precisa de ajuda? Entre em contato pelo WhatsApp
        </p>
      </div>
    </div>
  );
};

const containerStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'var(--color-cream)',
  padding: '20px',
};

const cardStyle = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '50px 40px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
};

const iconContainerStyle = {
  width: '80px',
  height: '80px',
  borderRadius: '50%',
  backgroundColor: '#fee2e2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  margin: '0 auto 24px',
};

const iconStyle = {
  width: '40px',
  height: '40px',
  color: '#dc2626',
};

const titleStyle = {
  fontSize: '2rem',
  color: '#dc2626',
  marginBottom: '12px',
  fontWeight: '700',
};

const subtitleStyle = {
  fontSize: '1.1rem',
  color: '#666',
  marginBottom: '24px',
};

const orderInfoStyle = {
  backgroundColor: '#f8f8f8',
  padding: '16px 24px',
  borderRadius: '8px',
  marginBottom: '24px',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.9rem',
  color: '#888',
  marginBottom: '4px',
};

const valueStyle = {
  display: 'block',
  fontSize: '1.1rem',
  fontWeight: '600',
  color: '#333',
  fontFamily: 'monospace',
};

const tipsContainerStyle = {
  backgroundColor: '#fef3c7',
  padding: '20px',
  borderRadius: '8px',
  marginBottom: '24px',
  textAlign: 'left',
};

const tipsTitle = {
  fontSize: '1rem',
  color: '#92400e',
  marginBottom: '12px',
  marginTop: 0,
};

const tipsList = {
  margin: 0,
  paddingLeft: '20px',
  color: '#92400e',
  fontSize: '0.9rem',
  lineHeight: '1.8',
};

const buttonContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const primaryButtonStyle = {
  display: 'block',
  backgroundColor: 'var(--color-marsala)',
  color: '#fff',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
};

const secondaryButtonStyle = {
  display: 'block',
  backgroundColor: 'transparent',
  color: 'var(--color-marsala)',
  padding: '14px 24px',
  borderRadius: '8px',
  textDecoration: 'none',
  fontWeight: '600',
  fontSize: '1rem',
  border: '2px solid var(--color-marsala)',
  transition: 'all 0.3s ease',
};

const supportTextStyle = {
  marginTop: '24px',
  fontSize: '0.85rem',
  color: '#888',
};

export default PaymentError;

