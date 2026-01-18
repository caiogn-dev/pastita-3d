import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Button from './Button';
import Badge from './Badge';
import styles from './ProductDetailModal.module.css';

/**
 * ProductDetailModal - Modal com detalhes do produto
 * Layout: Imagem à esquerda, informações à direita
 * Mobile: Imagem no topo, informações embaixo
 */
const ProductDetailModal = ({
  isOpen,
  onClose,
  product,
  onAddToCart,
  favoriteButton,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset state when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setObservations('');
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, product?.id]);

  if (!product) return null;

  const inStock = Number(product.stock_quantity) > 0;
  const imageSrc = product.image || product.image_url;
  const totalPrice = (Number(product.price) * quantity).toFixed(2);

  const handleQuantityChange = (delta) => {
    setQuantity(prev => Math.max(1, Math.min(99, prev + delta)));
  };

  const handleAddToCart = () => {
    if (onAddToCart && inStock) {
      onAddToCart(product, quantity, observations);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      className={styles.modal}
      showCloseButton={true}
    >
      <div className={styles.container}>
        {/* Imagem do Produto */}
        <div className={styles.imageContainer}>
          <div className={`${styles.image} ${imageLoaded ? styles.loaded : ''} ${imageError ? styles.error : ''}`}>
            {!imageError && imageSrc ? (
              <img
                src={imageSrc}
                alt={product.name}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className={styles.imageFallback}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>Sem imagem</span>
              </div>
            )}
          </div>
          
          {/* Favorito no mobile */}
          {favoriteButton && (
            <div className={styles.favoriteMobile}>
              {favoriteButton}
            </div>
          )}
        </div>

        {/* Informações do Produto */}
        <div className={styles.info}>
          {/* Header com título e favorito */}
          <div className={styles.header}>
            <div className={styles.titleWrapper}>
              <h2 className={styles.title}>{product.name}</h2>
              {product.category_name && (
                <Badge variant="outline" size="sm">
                  {product.category_name}
                </Badge>
              )}
            </div>
            {favoriteButton && (
              <div className={styles.favoriteDesktop}>
                {favoriteButton}
              </div>
            )}
          </div>

          {/* Preço */}
          <div className={styles.price}>
            <span className={styles.priceCurrency}>R$</span>
            <span className={styles.priceValue}>
              {Number(product.price).toFixed(2)}
            </span>
            {product.weight && (
              <Badge variant="marsala" size="sm" className={styles.weight}>
                {product.weight}g
              </Badge>
            )}
          </div>

          {/* Descrição */}
          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {/* Ingredientes */}
          {product.ingredients && (
            <div className={styles.ingredients}>
              <h4>Ingredientes</h4>
              <p>{product.ingredients}</p>
            </div>
          )}

          {/* Informações nutricionais */}
          {product.nutritional_info && (
            <div className={styles.nutritional}>
              <h4>Informações Nutricionais</h4>
              <p>{product.nutritional_info}</p>
            </div>
          )}

          {/* Observações */}
          <div className={styles.observations}>
            <label htmlFor="observations">
              Observações <span>(opcional)</span>
            </label>
            <textarea
              id="observations"
              placeholder="Ex: Sem cebola, bem passado..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              maxLength={200}
              rows={2}
            />
            <span className={styles.charCount}>
              {observations.length}/200
            </span>
          </div>

          {/* Quantidade e Adicionar */}
          <div className={styles.actions}>
            {/* Seletor de quantidade */}
            <div className={styles.quantity}>
              <button
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
                aria-label="Diminuir quantidade"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button
                className={styles.quantityBtn}
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99 || !inStock}
                aria-label="Aumentar quantidade"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </button>
            </div>

            {/* Botão Adicionar */}
            <Button
              variant={inStock ? 'primary' : 'ghost'}
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock}
              className={styles.addBtn}
            >
              {inStock ? (
                <>
                  <span>Adicionar</span>
                  <span className={styles.total}>R$ {totalPrice}</span>
                </>
              ) : (
                'Produto Indisponível'
              )}
            </Button>
          </div>

          {/* Estoque baixo */}
          {inStock && Number(product.stock_quantity) <= 5 && (
            <p className={styles.lowStock}>
              ⚠️ Apenas {product.stock_quantity} unidades disponíveis
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;
