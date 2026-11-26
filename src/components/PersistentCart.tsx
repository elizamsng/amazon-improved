import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { CartItem, OrderRecord } from './AmazonDrawersAndModals';
import { QuantityInput } from './QuantityInput';

/* -------------------------------------------------------------------------- */
/* 1. Minimized Cart Summary Card on Product Page Right Rail                  */
/* -------------------------------------------------------------------------- */
interface MinimizedCartSummaryProps {
  items: CartItem[];
  onOpenCartPreview: () => void;
  onProceedToCheckout: () => void;
}

export const MinimizedCartSummary: React.FC<MinimizedCartSummaryProps> = ({
  items,
  onOpenCartPreview,
  onProceedToCheckout,
}) => {
  if (items.length === 0) return null;

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <section
      aria-label="Minimized cart summary"
      className="rounded-lg border border-[#D5D9D9] bg-[#F7F8F8] p-3.5 space-y-2.5"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[11px] font-medium text-[#565959] tabular-nums">
            Cart ({count} {count === 1 ? 'item' : 'items'})
          </div>
          <div className="text-base font-bold text-[#B12704] tabular-nums">
            S${subtotal.toFixed(2)}
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenCartPreview}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-[#D5D9D9] bg-white hover:bg-[#EAEDED] text-xs font-medium text-[#0F1111] whitespace-nowrap shrink-0 cursor-pointer transition-colors"
        >
          <span>Cart Preview</span>
          <ChevronRight className="w-3.5 h-3.5 text-[#565959]" />
        </button>
      </div>

      <button
        type="button"
        onClick={onProceedToCheckout}
        className="w-full py-1.5 px-3 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-medium text-[#0F1111] shadow-xs cursor-pointer transition-colors"
      >
        Proceed to checkout ({count})
      </button>
    </section>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Sliding Cart Preview Drawer (Non-Destructive Preview Overlay)           */
/* -------------------------------------------------------------------------- */
interface SlidingCartPreviewProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onSetQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  onOpenFullCart: () => void;
  onProceedToCheckout: () => void;
}

export const SlidingCartPreview: React.FC<SlidingCartPreviewProps> = ({
  open,
  onClose,
  items,
  onSetQty,
  onRemoveItem,
  onOpenFullCart,
  onProceedToCheckout,
}) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />

      {/* Sliding Drawer Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sliding cart preview"
        className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl border-l border-[#D5D9D9] flex flex-col transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-[#F7F8F8] border-b border-[#E7E7E7] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#007185]" />
            <h2 className="text-base font-bold text-[#0F1111]">
              Cart Preview{' '}
              <span className="text-xs font-medium text-[#565959] tabular-nums">
                ({count} {count === 1 ? 'item' : 'items'})
              </span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart preview"
            className="p-1.5 rounded-md text-[#565959] hover:text-[#0F1111] hover:bg-[#EAEDED] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Cart Items */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-sm font-semibold text-[#0F1111]">Your Amazon Cart is empty.</p>
              <p className="text-xs text-[#565959]">
                Select a colour or bundle on the product page and click Add to Cart.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-medium text-[#0F1111] cursor-pointer"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-2 text-xs text-[#007600] bg-[#F2FAF2] border border-[#007600]/20 rounded-md p-2.5">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Your order qualifies for FREE Singapore Delivery.</span>
              </div>

              <div className="divide-y divide-[#E7E7E7]">
                {items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-start gap-3">
                    <img
                      src={item.image}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-16 h-14 object-contain rounded border border-[#E7E7E7] bg-white p-1 shrink-0"
                    />

                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="text-xs font-semibold text-[#0F1111] line-clamp-2 leading-snug">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-[#565959] truncate">{item.subtitle}</div>
                      <div className="text-sm font-bold text-[#0F1111] tabular-nums">
                        S${(item.price * item.quantity).toFixed(2)}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1.5">
                        <QuantityInput
                          size="sm"
                          value={item.quantity}
                          onChange={(q) => onSetQty(item.id, q)}
                          min={1}
                          max={99}
                          ariaLabel={`Quantity for ${item.title}`}
                        />

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.id)}
                          aria-label={`Remove ${item.title}`}
                          className="text-xs text-[#007185] hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sticky Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#E7E7E7] bg-[#F7F8F8] space-y-2.5 shrink-0">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-[#0F1111]">
                Subtotal ({count} {count === 1 ? 'item' : 'items'}):
              </span>
              <span className="text-lg font-bold text-[#B12704] tabular-nums">
                S${subtotal.toFixed(2)}
              </span>
            </div>

            <button
              type="button"
              onClick={onProceedToCheckout}
              className="w-full py-2.5 px-4 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-semibold text-[#0F1111] shadow-xs cursor-pointer"
            >
              Proceed to checkout ({count})
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-3 rounded-full border border-[#D5D9D9] bg-white hover:bg-[#EAEDED] text-xs font-medium text-[#0F1111] cursor-pointer whitespace-nowrap"
              >
                Continue shopping
              </button>
              <button
                type="button"
                onClick={onOpenFullCart}
                className="py-2 px-3 rounded-full border border-[#D5D9D9] bg-white hover:bg-[#EAEDED] text-xs font-medium text-[#007185] cursor-pointer whitespace-nowrap"
              >
                Full Cart Page
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 3. Full In-Page Amazon.sg Shopping Cart & Checkout View                     */
/* -------------------------------------------------------------------------- */
interface CartPageViewProps {
  items: CartItem[];
  onSetQty: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
  selectedLocation: string;
  onBackToProduct: () => void;
  onPlaceOrder: (paymentMethod: string) => OrderRecord;
  initialCheckoutOpen?: boolean;
}

export const CartPageView: React.FC<CartPageViewProps> = ({
  items,
  onSetQty,
  onRemoveItem,
  selectedLocation,
  onBackToProduct,
  onPlaceOrder,
  initialCheckoutOpen = false,
}) => {
  const [showCheckout, setShowCheckout] = useState(initialCheckoutOpen);
  const [paymentMethod, setPaymentMethod] = useState('PayNow (Instant SG)');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const record = onPlaceOrder(paymentMethod);
    setConfirmedOrder(record);
    setShowCheckout(false);
  };

  return (
    <div className="bg-[#EAEDED] min-h-[calc(100vh-96px)] py-6">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 space-y-4">
        <button
          type="button"
          onClick={onBackToProduct}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#007185] hover:text-[#C7511F] hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Razer Viper V4 Pro Wireless</span>
        </button>

        {confirmedOrder ? (
          <div className="bg-white rounded-md border border-[#D5D9D9] p-6 max-w-2xl space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#007600] shrink-0 mt-0.5" />
              <div>
                <h1 className="text-xl font-bold text-[#007600]">
                  Order #{confirmedOrder.orderId} Confirmed — Preparing Shipment
                </h1>
                <p className="text-sm text-[#0F1111] mt-1">
                  Delivering Tomorrow to{' '}
                  <span className="font-semibold">{confirmedOrder.address}</span>
                </p>
              </div>
            </div>

            <div className="border-t border-[#E7E7E7] pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[#565959]">Payment method:</span>
                <span className="font-medium">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#565959]">Total paid (incl. GST):</span>
                <span className="font-bold text-[#B12704] tabular-nums">
                  S${confirmedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onBackToProduct}
              className="px-5 py-2 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-medium text-[#0F1111] cursor-pointer"
            >
              Continue shopping on Amazon.sg
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Main Cart List or Checkout Form */}
            <div className="lg:col-span-9 bg-white rounded-md border border-[#D5D9D9] p-5 sm:p-6">
              <div className="flex items-baseline justify-between border-b border-[#E7E7E7] pb-3 mb-4">
                <h1 className="text-2xl font-medium text-[#0F1111]">
                  {showCheckout ? 'Checkout' : 'Shopping Cart'}
                </h1>
                {!showCheckout && items.length > 0 && (
                  <span className="text-xs text-[#565959] hidden sm:inline">Price</span>
                )}
              </div>

              {items.length === 0 ? (
                <div className="py-12 space-y-3">
                  <p className="text-base font-semibold text-[#0F1111]">
                    Your Amazon Cart is empty.
                  </p>
                  <p className="text-xs text-[#565959]">
                    Return to the Razer Viper V4 Pro product page to add items to your persistent
                    cart.
                  </p>
                  <button
                    type="button"
                    onClick={onBackToProduct}
                    className="px-4 py-2 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-medium text-[#0F1111] cursor-pointer"
                  >
                    Shop Razer Viper V4 Pro
                  </button>
                </div>
              ) : showCheckout ? (
                <form id="page-checkout-form" onSubmit={handleConfirmOrder} className="space-y-5">
                  <div className="border-b border-[#E7E7E7] pb-4 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 text-sm">
                    <span className="font-bold text-[#0F1111]">1. Delivery address</span>
                    <div>
                      <div className="font-medium text-[#0F1111]">{selectedLocation}</div>
                      <div className="text-xs text-[#007600] mt-0.5">
                        FREE Next-Day Delivery applied
                      </div>
                    </div>
                  </div>

                  <div className="border-b border-[#E7E7E7] pb-4 grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-2 text-sm">
                    <span className="font-bold text-[#0F1111]">2. Payment method</span>
                    <div className="space-y-2">
                      {[
                        'PayNow (Instant SG)',
                        'Visa ending in 4242',
                        'Cash on Delivery (COD)',
                      ].map((m) => (
                        <label key={m} className="flex items-center gap-2.5 cursor-pointer text-xs">
                          <input
                            type="radio"
                            name="cart-payment"
                            checked={paymentMethod === m}
                            onChange={() => setPaymentMethod(m)}
                            className="accent-[#007185]"
                          />
                          <span className="font-medium text-[#0F1111]">{m}</span>
                        </label>
                      ))}
                      {paymentMethod.includes('Cash on Delivery') && (
                        <p className="text-xs text-[#565959] pl-6">
                          Total payable to courier on arrival: S${subtotal.toFixed(2)} (Free
                          shipping threshold met).
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="px-4 py-2 rounded-full border border-[#D5D9D9] bg-white hover:bg-[#F7F8F8] text-xs font-medium cursor-pointer"
                    >
                      Back to Cart
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-bold text-[#0F1111] cursor-pointer"
                    >
                      Place your order (S${subtotal.toFixed(2)})
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="divide-y divide-[#E7E7E7]">
                    {items.map((item) => (
                      <div key={item.id} className="py-4 flex flex-col sm:flex-row gap-4">
                        <img
                          src={item.image}
                          alt={item.title}
                          referrerPolicy="no-referrer"
                          className="w-32 h-24 object-contain rounded border border-[#E7E7E7] bg-white p-1.5 shrink-0"
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="text-base font-medium text-[#0F1111] leading-snug">
                              {item.title}
                            </h2>
                            <span className="text-base font-bold text-[#0F1111] tabular-nums shrink-0">
                              S${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>

                          <p className="text-xs text-[#007600] font-medium">In Stock</p>
                          <p className="text-xs text-[#565959]">{item.subtitle}</p>
                          <p className="text-xs text-[#565959]">
                            Eligible for FREE Delivery &amp; 30-day Returns
                          </p>

                          <div className="flex flex-wrap items-center gap-4 pt-2">
                            <QuantityInput
                              size="sm"
                              value={item.quantity}
                              onChange={(q) => onSetQty(item.id, q)}
                              min={1}
                              max={99}
                              ariaLabel={`Quantity for ${item.title}`}
                            />

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-xs text-[#007185] hover:underline inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#E7E7E7] text-right text-base">
                    Subtotal ({count} {count === 1 ? 'item' : 'items'}):{' '}
                    <span className="font-bold tabular-nums">S${subtotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Right: Cart Summary Box */}
            {items.length > 0 && (
              <aside className="lg:col-span-3 bg-white rounded-md border border-[#D5D9D9] p-5 space-y-3.5">
                <div className="flex items-start gap-2 text-xs text-[#007600]">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Your order qualifies for FREE Singapore Delivery.</span>
                </div>

                <div className="text-base text-[#0F1111]">
                  Subtotal ({count} {count === 1 ? 'item' : 'items'}):{' '}
                  <span className="font-bold tabular-nums">S${subtotal.toFixed(2)}</span>
                </div>

                {!showCheckout && (
                  <button
                    type="button"
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-2.5 px-4 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-medium text-[#0F1111] shadow-xs cursor-pointer"
                  >
                    Proceed to checkout
                  </button>
                )}
              </aside>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
