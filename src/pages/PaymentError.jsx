import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const PaymentError = () => {
  const router = useRouter();
  const orderParam = router.query.order;
  const errorParam = router.query.error;
  const orderNumber = Array.isArray(orderParam) ? orderParam[0] : orderParam;
  const errorCode = Array.isArray(errorParam) ? errorParam[0] : errorParam;

  const getErrorMessage = (code) => {
    const errorMessages = {
      cc_rejected_bad_filled_card_number: 'Numero do cartao invalido',
      cc_rejected_bad_filled_date: 'Data de validade invalida',
      cc_rejected_bad_filled_other: 'Dados do cartao incorretos',
      cc_rejected_bad_filled_security_code: 'Codigo de seguranca invalido',
      cc_rejected_blacklist: 'Cartao nao autorizado',
      cc_rejected_call_for_authorize: 'Autorizacao necessaria - entre em contato com seu banco',
      cc_rejected_card_disabled: 'Cartao desabilitado',
      cc_rejected_duplicated_payment: 'Pagamento duplicado',
      cc_rejected_high_risk: 'Pagamento recusado por seguranca',
      cc_rejected_insufficient_amount: 'Saldo insuficiente',
      cc_rejected_invalid_installments: 'Parcelas invalidas',
      cc_rejected_max_attempts: 'Limite de tentativas excedido',
      cc_rejected_other_reason: 'Pagamento recusado',
    };
    return errorMessages[code] || 'Ocorreu um erro ao processar seu pagamento';
  };

  return (
    <div className="status-page">
      <div className="status-card status-error">
        <div className="status-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>

        <h1 className="status-title">Pagamento nao aprovado</h1>
        <p className="status-subtitle">{getErrorMessage(errorCode)}</p>

        {orderNumber && (
          <div className="status-order">
            <span className="status-label">Pedido:</span>
            <span className="status-value">{orderNumber}</span>
          </div>
        )}

        <div className="status-info status-info-warning">
          <h3 className="status-info-title">O que voce pode fazer:</h3>
          <ul className="status-info-list">
            <li>Verificar os dados do cartao</li>
            <li>Tentar outro metodo de pagamento</li>
            <li>Entrar em contato com seu banco</li>
            <li>Tentar novamente em alguns minutos</li>
          </ul>
        </div>

        <div className="status-actions">
          <Link href="/checkout" className="status-button status-button-primary">
            Tentar novamente
          </Link>
          <Link href="/cardapio" className="status-button status-button-secondary">
            Voltar ao cardapio
          </Link>
        </div>

        <p className="status-note">Precisa de ajuda? Entre em contato pelo WhatsApp</p>
      </div>
    </div>
  );
};

export default PaymentError;
