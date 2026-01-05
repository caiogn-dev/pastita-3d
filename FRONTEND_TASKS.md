# Frontend Tasks

## Goals
- Improve navigation flow and reduce checkout friction.
- Fix responsiveness for all pages/components.
- Stabilize modular UI (buttons, inputs, badges, cards).
- Address inconsistencies and missing UI states.
- Align news API calls with Django models in `server-main/api/models.py`.

## Global Tasks
- Responsive grid system: replace inline grid styles with reusable CSS classes.
- Component library: Button, Input, Badge, Card, Modal (single source of truth).
- Typography and spacing scale (consistent headings, paragraph spacing).
- Error/loading states: skeletons and empty states across pages.
- Accessibility: focus states, button labels, aria for icons.
- Performance: lazy load images, reduce layout shifts.

## Pages
### Navbar / Header
- Mobile layout: hamburger left, logo centered, cart right.
- Ensure sticky header does not overlap content on small screens.
- Improve mobile menu animation and close on route change.

### Landing Page
- Clarify primary CTA and next steps (Cardapio, Login).
- Add social proof and delivery/production info.

### Cardapio (Products)
- Fix images: handle relative URLs, placeholders on missing image.
- Add category filter (Product.category) and search.
- Show stock badge (Product.stock_quantity) and disable add if zero.

### Cart Sidebar
- Show subtotals per item and total.
- Improve mobile spacing and touch targets.
- Add "continue shopping" and "checkout" quick actions.

### Checkout
- Reduce steps and keep payment and address on one screen.
- Normalize responsive columns (mobile should stack).
- Show PIX QR on success/pending.

### Payment Pending / Success / Error
- Always show PIX QR if status is pending/processing and payment data exists.
- Auto refresh and auto-redirect on approval.
- Provide copy-to-clipboard for PIX code.

### Auth (Login/Register)
- Normalize styles using shared Input/Button components.
- Improve validation and error copy.
- Ensure mobile spacing and fonts are consistent.

## New Feature Ideas
- Order tracking timeline (Order.status in models).
- Favorites / wishlist.
- Promo codes and discounts.
- Delivery fee calculator and address validation.
- Customer profile page with saved addresses.

## Inconsistencies / Issues
- Encoding issues in multiple UI strings.
- Mixed inline styles vs CSS files.
- Cart icon glyph is inconsistent.
- Some pages lack responsive layout controls.

## API References (Django Models)
- Product: name, description, price, image, category, stock_quantity.
- Cart / CartItem: quantity and totals.
- Order / OrderItem: order_number, status, total_amount.
- Checkout: payment_status, payment_method, mercado_pago_payment_id.

