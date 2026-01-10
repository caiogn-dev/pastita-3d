import React from 'react';

/**
 * Skeleton loader component for loading states
 * @param {Object} props
 * @param {'text' | 'circle' | 'rect' | 'card'} props.variant
 * @param {string | number} props.width
 * @param {string | number} props.height
 * @param {number} props.count - Number of skeleton items to render
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
  ...props
}) => {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const classes = [
    'ui-skeleton',
    `ui-skeleton--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  const items = Array.from({ length: count }, (_, i) => (
    <span key={i} className={classes} style={style} {...props} />
  ));

  return count > 1 ? <>{items}</> : items[0];
};

/**
 * Product Card Skeleton
 */
const ProductCardSkeleton = () => (
  <div className="ui-skeleton-product">
    <Skeleton variant="rect" className="ui-skeleton-product__image" />
    <div className="ui-skeleton-product__content">
      <Skeleton variant="text" width="70%" />
      <Skeleton variant="text" width="40%" height={14} />
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="rect" height={40} className="ui-skeleton-product__button" />
    </div>
  </div>
);

/**
 * List Item Skeleton
 */
const ListItemSkeleton = () => (
  <div className="ui-skeleton-list-item">
    <Skeleton variant="circle" width={48} height={48} />
    <div className="ui-skeleton-list-item__content">
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" height={12} />
    </div>
  </div>
);

/**
 * Table Row Skeleton
 */
const TableRowSkeleton = ({ columns = 4 }) => {
  const widths = Array.from({ length: columns }, (_, i) => 40 + ((i * 13) % 40));

  return (
    <div className="ui-skeleton-table-row">
      {widths.map((width, i) => (
        <Skeleton key={i} variant="text" width={`${width}%`} />
      ))}
    </div>
  );
};

Skeleton.ProductCard = ProductCardSkeleton;
Skeleton.ListItem = ListItemSkeleton;
Skeleton.TableRow = TableRowSkeleton;

export default Skeleton;
