import React from 'react';

const EmptyState = ({ 
  icon = '📦', 
  title, 
  description, 
  action,
  actionLabel,
  variant = 'default' // default, cart, wishlist, orders, search
}) => {
  const presets = {
    cart: {
      icon: '🛒',
      title: 'Seu carrinho está vazio',
      description: 'Adicione produtos deliciosos ao seu carrinho!'
    },
    wishlist: {
      icon: '❤️',
      title: 'Nenhum favorito ainda',
      description: 'Salve seus produtos favoritos para encontrá-los facilmente!'
    },
    orders: {
      icon: '📋',
      title: 'Nenhum pedido encontrado',
      description: 'Você ainda não fez nenhum pedido.'
    },
    search: {
      icon: '🔍',
      title: 'Nenhum resultado encontrado',
      description: 'Tente buscar com outros termos.'
    },
    products: {
      icon: '🍝',
      title: 'Nenhum produto disponível',
      description: 'Volte em breve para conferir nossas novidades!'
    }
  };

  const preset = presets[variant] || {};
  const displayIcon = icon || preset.icon || '📦';
  const displayTitle = title || preset.title || 'Nada por aqui';
  const displayDescription = description || preset.description || '';

  return (
    <div className="empty-state">
      <div className="empty-state-icon">{displayIcon}</div>
      <h3 className="empty-state-title">{displayTitle}</h3>
      {displayDescription && (
        <p className="empty-state-description">{displayDescription}</p>
      )}
      {action && actionLabel && (
        <button className="empty-state-action" onClick={action}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
