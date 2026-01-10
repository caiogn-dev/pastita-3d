import React from 'react';

const ORDER_STATUSES = [
  { key: 'pending', label: 'Pedido Recebido', icon: '📋' },
  { key: 'awaiting_payment', label: 'Aguardando Pagamento', icon: '💳' },
  { key: 'paid', label: 'Pagamento Confirmado', icon: '✅' },
  { key: 'confirmed', label: 'Pedido Confirmado', icon: '👍' },
  { key: 'preparing', label: 'Em Preparação', icon: '👨‍🍳' },
  { key: 'shipped', label: 'Enviado', icon: '🚚' },
  { key: 'delivered', label: 'Entregue', icon: '🎉' },
];

const STATUS_MAP = {
  pending: 0,
  awaiting_payment: 1,
  processing: 1,
  paid: 2,
  confirmed: 3,
  preparing: 4,
  shipped: 5,
  delivered: 6,
  completed: 6,
  cancelled: -1,
  failed: -1,
};

const OrderTimeline = ({ status, createdAt: _createdAt, updatedAt }) => {
  const currentIndex = STATUS_MAP[status] ?? 0;
  const isCancelled = status === 'cancelled' || status === 'failed';
  
  // createdAt is available for future use (e.g., showing order creation time)
  void _createdAt;

  if (isCancelled) {
    return (
      <div className="order-timeline order-timeline-cancelled">
        <div className="timeline-cancelled-icon">❌</div>
        <div className="timeline-cancelled-text">
          {status === 'cancelled' ? 'Pedido Cancelado' : 'Pagamento Falhou'}
        </div>
      </div>
    );
  }

  return (
    <div className="order-timeline">
      <div className="timeline-header">
        <h3 className="timeline-title">Acompanhe seu pedido</h3>
        {updatedAt && (
          <span className="timeline-updated">
            Atualizado: {new Date(updatedAt).toLocaleString('pt-BR')}
          </span>
        )}
      </div>
      
      <div className="timeline-steps">
        {ORDER_STATUSES.map((step, index) => {
          const isCompleted = index <= currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div 
              key={step.key} 
              className={`timeline-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
            >
              <div className="timeline-step-icon">
                {isCompleted ? '✓' : step.icon}
              </div>
              <div className="timeline-step-content">
                <span className="timeline-step-label">{step.label}</span>
              </div>
              {index < ORDER_STATUSES.length - 1 && (
                <div className={`timeline-step-line ${isCompleted ? 'completed' : ''}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTimeline;
