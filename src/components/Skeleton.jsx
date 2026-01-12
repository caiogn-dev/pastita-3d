import React from 'react';

export const Skeleton = ({ width, height, borderRadius = '4px', className = '' }) => {
  return (
    <div 
      className={`skeleton ${className}`}
      style={{ 
        width: width || '100%', 
        height: height || '20px',
        borderRadius 
      }}
    />
  );
};

export const ProductCardSkeleton = () => {
  return (
    <div className="product-card-skeleton">
      <Skeleton height="200px" borderRadius="12px 12px 0 0" />
      <div className="skeleton-content">
        <Skeleton width="70%" height="20px" />
        <Skeleton width="100%" height="14px" />
        <Skeleton width="40%" height="24px" />
        <Skeleton width="100%" height="40px" borderRadius="8px" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton = ({ count = 6 }) => {
  return (
    <div className="product-grid-skeleton">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
};

export const OrderSkeleton = () => {
  return (
    <div className="order-skeleton">
      <div className="order-skeleton-header">
        <Skeleton width="120px" height="16px" />
        <Skeleton width="80px" height="24px" borderRadius="12px" />
      </div>
      <div className="order-skeleton-items">
        <Skeleton width="100%" height="60px" borderRadius="8px" />
        <Skeleton width="100%" height="60px" borderRadius="8px" />
      </div>
      <div className="order-skeleton-footer">
        <Skeleton width="100px" height="20px" />
      </div>
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <div className="profile-skeleton">
      <div className="profile-skeleton-header">
        <Skeleton width="80px" height="80px" borderRadius="50%" />
        <div className="profile-skeleton-info">
          <Skeleton width="150px" height="24px" />
          <Skeleton width="200px" height="16px" />
        </div>
      </div>
      <div className="profile-skeleton-form">
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
        <Skeleton width="100%" height="48px" borderRadius="8px" />
      </div>
    </div>
  );
};

export default Skeleton;
