import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import {
  BUNDLE_ADDONS,
  GALLERY_IMAGES,
  PRODUCT_VARIANTS,
  ProductBundleOption,
  ProductVariant,
  SINGAPORE_LOCATIONS,
  STYLE_OPTIONS,
} from './data/razerProductData';
import { AmazonHeader } from './components/AmazonHeader';
import { ProductGallery } from './components/ProductGallery';
import { ProductInfoCenter } from './components/ProductInfoCenter';
import { ProductBuyBox } from './components/ProductBuyBox';
import { ManufacturerAndCompare } from './components/ManufacturerAndCompare';
import { ReviewsAndQASection } from './components/ReviewsAndQASection';
import {
  CartPageView,
  MinimizedCartSummary,
  SlidingCartPreview,
} from './components/PersistentCart';
import {
  CartItem,
  LocationModal,
  OrderRecord,
  OrdersAndSavedModal,
} from './components/AmazonDrawersAndModals';

export default function App() {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(PRODUCT_VARIANTS[0]);
  const [selectedStyle, setSelectedStyle] = useState<ProductBundleOption>(STYLE_OPTIONS[0]);
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);
  const [hoverPreviewImage, setHoverPreviewImage] = useState<{
    src: string;
    alt: string;
    caption?: string;
  } | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedLocation, setSelectedLocation] = useState<string>(SINGAPORE_LOCATIONS[0]);

  const [view, setView] = useState<'product' | 'cart'>('product');
  const [startCheckoutInCartView, setStartCheckoutInCartView] = useState<boolean>(false);
  const [isCartPreviewOpen, setIsCartPreviewOpen] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('amz_sg_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [orders, setOrders] = useState<OrderRecord[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('amz_sg_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [addedToastLabel, setAddedToastLabel] = useState<string | null>(null);

  const [isLocationOpen, setIsLocationOpen] = useState<boolean>(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState<boolean>(false);

  // Ensure light theme canvas on document root
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  // Persist cart and orders in browser storage
  useEffect(() => {
    try {
      localStorage.setItem('amz_sg_cart', JSON.stringify(cart));
    } catch {
      // Ignore storage quota errors
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('amz_sg_orders', JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  }, [orders]);

  // Auto-dismiss transient "just added" feedback while remaining on product page
  useEffect(() => {
    if (!justAdded && !addedToastLabel) return;
    const timer = window.setTimeout(() => {
      setJustAdded(false);
      setAddedToastLabel(null);
    }, 4500);
    return () => window.clearTimeout(timer);
  }, [justAdded, addedToastLabel]);

  // Escape key closes modals
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLocationOpen(false);
        setIsOrdersOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSelectVariant = useCallback((variant: ProductVariant) => {
    setSelectedVariant(variant);
    setJustAdded(false);
    const matchingIdx = GALLERY_IMAGES.findIndex((img) => img.variantFilter === variant.id);
    if (matchingIdx !== -1) {
      setActiveImageIdx(matchingIdx);
    } else if (variant.id === 'carbon') {
      setActiveImageIdx(2);
    }
  }, []);

  const handleSelectStyle = useCallback((opt: ProductBundleOption) => {
    setSelectedStyle(opt);
    setJustAdded(false);
  }, []);

  const handleQuantityChange = useCallback((q: number) => {
    setQuantity(q);
    setJustAdded(false);
  }, []);

  const addItemToCart = useCallback((newItem: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === newItem.id);
      if (existing) {
        return prev.map((i) =>
          i.id === newItem.id ? { ...i, quantity: Math.min(99, i.quantity + newItem.quantity) } : i
        );
      }
      return [...prev, newItem];
    });
  }, []);

  const openCartPage = useCallback((checkoutDirect = false) => {
    setIsCartPreviewOpen(false);
    setStartCheckoutInCartView(checkoutDirect);
    setView('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAddMainToCart = useCallback(
    (goToCheckout = false) => {
      const unitPrice = selectedVariant.price + selectedStyle.priceDelta;
      addItemToCart({
        id: `viper-${selectedVariant.id}-${selectedStyle.id}`,
        title: `Razer Viper V4 Pro Wireless Esports Gaming Mouse (${selectedVariant.name})`,
        subtitle: selectedStyle.label,
        price: unitPrice,
        image: selectedVariant.heroImage,
        quantity,
      });

      if (goToCheckout) {
        openCartPage(true);
        return;
      }

      // Remain on the product page for ease of shopping more
      setJustAdded(true);
      setAddedToastLabel(
        `${quantity} × Razer Viper V4 Pro (${selectedVariant.name}) added to cart`
      );
    },
    [selectedVariant, selectedStyle, quantity, addItemToCart, openCartPage]
  );

  const handleAddBundleToCart = useCallback(
    (addonIds: string[]) => {
      addItemToCart({
        id: `viper-${selectedVariant.id}-mouse-only`,
        title: `Razer Viper V4 Pro Wireless Esports Gaming Mouse (${selectedVariant.name})`,
        subtitle: 'Standard retail package',
        price: selectedVariant.price,
        image: selectedVariant.heroImage,
        quantity: 1,
      });

      addonIds.forEach((id) => {
        const addon = BUNDLE_ADDONS.find((a) => a.id === id);
        if (addon) {
          addItemToCart({
            id: addon.id,
            title: addon.title,
            subtitle: 'Bundle accessory',
            price: addon.price,
            image: addon.image,
            quantity: 1,
          });
        }
      });

      // Remain in place on the product page without forcing scroll or checkout
      const totalBundleCount = 1 + addonIds.length;
      setJustAdded(true);
      setAddedToastLabel(
        `${totalBundleCount} ${totalBundleCount === 1 ? 'item' : 'items'} added to cart`
      );
    },
    [selectedVariant, addItemToCart]
  );

  const handleSetQty = useCallback((id: string, nextQty: number) => {
    const safeQty = Math.max(1, Math.min(99, Math.round(nextQty)));
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: safeQty } : item))
    );
  }, []);

  const handleRemoveItem = useCallback((id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const handlePlaceOrder = useCallback(
    (paymentMethod: string): OrderRecord => {
      const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const record: OrderRecord = {
        orderId: `SG-${Math.floor(100 + Math.random() * 899)}-${Math.floor(
          10000 + Math.random() * 89999
        )}`,
        date: '25 November 2026',
        total,
        paymentMethod,
        address: selectedLocation,
        items: [...cart],
      };
      setOrders((prev) => [record, ...prev]);
      setCart([]);
      setJustAdded(false);
      setAddedToastLabel(null);
      return record;
    },
    [cart, selectedLocation]
  );

  const scrollToSection = useCallback(
    (id: string) => {
      if (view !== 'product') {
        setView('product');
        setTimeout(() => {
          if (id === 'top') window.scrollTo({ top: 0, behavior: 'smooth' });
          else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
        return;
      }
      if (id === 'top') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [view]
  );

  const handleSearchSubmit = useCallback(
    (q: string) => {
      setView('product');
      const low = q.toLowerCase();
      if (low.includes('mat') || low.includes('gigantus') || low.includes('grip')) {
        scrollToSection('bundle-section');
      } else if (low.includes('dongle') || low.includes('8000')) {
        setActiveImageIdx(3);
        scrollToSection('top');
      } else {
        scrollToSection('top');
      }
    },
    [scrollToSection]
  );

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const unitPrice = selectedVariant.price + selectedStyle.priceDelta;

  return (
    <div id="top" className="min-h-screen flex flex-col bg-white text-[#0F1111]">
      <AmazonHeader
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setIsLocationOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => {
          if (view === 'cart') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsCartPreviewOpen(true);
          }
        }}
        onOpenOrders={() => setIsOrdersOpen(true)}
        onScrollToSection={scrollToSection}
        onSearchSubmit={handleSearchSubmit}
      />

      {view === 'cart' ? (
        <main className="flex-1">
          <CartPageView
            items={cart}
            onSetQty={handleSetQty}
            onRemoveItem={handleRemoveItem}
            selectedLocation={selectedLocation}
            onBackToProduct={() => {
              setView('product');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onPlaceOrder={handlePlaceOrder}
            initialCheckoutOpen={startCheckoutInCartView}
          />
        </main>
      ) : (
        <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 pt-3 pb-24 lg:pb-14">
          {/* Category Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="text-xs text-[#565959] mb-4 flex flex-wrap items-center gap-1.5"
          >
            <button
              type="button"
              onClick={() => scrollToSection('top')}
              className="hover:underline hover:text-[#C7511F] cursor-pointer"
            >
              Electronics
            </button>
            <span aria-hidden="true">›</span>
            <button
              type="button"
              onClick={() => scrollToSection('tech-specs')}
              className="hover:underline hover:text-[#C7511F] cursor-pointer"
            >
              Computers &amp; Accessories
            </button>
            <span aria-hidden="true">›</span>
            <button
              type="button"
              onClick={() => scrollToSection('manufacturer-section')}
              className="hover:underline hover:text-[#C7511F] cursor-pointer"
            >
              Mice
            </button>
            <span aria-hidden="true">›</span>
            <span className="text-[#0F1111] font-medium">Gaming Mice</span>
          </nav>

          {/* Main 3-Column PDP Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">
            {/* Left: Sticky Image Gallery with In-Place Click-to-Zoom (5 cols) */}
            <div className="lg:col-span-5">
              <ProductGallery
                images={GALLERY_IMAGES}
                activeIndex={activeImageIdx}
                onSelectIndex={setActiveImageIdx}
                previewImage={hoverPreviewImage}
              />
            </div>

            {/* Center: Product Title, Variants, Specs & Bullets — always unobstructed in view (4 cols) */}
            <div className="lg:col-span-4">
              <ProductInfoCenter
                variants={PRODUCT_VARIANTS}
                selectedVariant={selectedVariant}
                onSelectVariant={handleSelectVariant}
                onHoverVariantImage={setHoverPreviewImage}
                styleOptions={STYLE_OPTIONS}
                selectedStyle={selectedStyle}
                onSelectStyle={handleSelectStyle}
                onJumpToReviews={() => scrollToSection('reviews-section')}
                onJumpToManufacturer={() => scrollToSection('manufacturer-section')}
              />
            </div>

            {/* Right: Contiguous Buy Box + Minimized Cart Summary (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <ProductBuyBox
                variant={selectedVariant}
                styleOption={selectedStyle}
                quantity={quantity}
                onQuantityChange={handleQuantityChange}
                locationLabel={selectedLocation}
                onOpenLocationModal={() => setIsLocationOpen(true)}
                onAddToCart={() => handleAddMainToCart(false)}
                onBuyNow={() => handleAddMainToCart(true)}
                onOpenCartPreview={() => setIsCartPreviewOpen(true)}
                isSaved={isSaved}
                onToggleSaved={() => setIsSaved((prev) => !prev)}
                justAdded={justAdded}
              />

              <MinimizedCartSummary
                items={cart}
                onOpenCartPreview={() => setIsCartPreviewOpen(true)}
                onProceedToCheckout={() => openCartPage(true)}
              />
            </div>
          </div>

          {/* Frequently Bought Together, A+ Content, Compare & Technical Details */}
          <ManufacturerAndCompare
            selectedVariant={selectedVariant}
            onAddBundleToCart={handleAddBundleToCart}
          />

          {/* Customer Q&A & Reviews */}
          <ReviewsAndQASection />
        </main>
      )}

      {/* Non-blocking "Added to Cart" Toast — keeps user on product page */}
      {view === 'product' && addedToastLabel && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-5 right-4 z-40 max-w-sm rounded-lg border border-[#007600]/30 bg-white shadow-xl p-3.5 flex items-start gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-[#007600] shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-xs font-bold text-[#0F1111]">{addedToastLabel}</div>
            <div className="text-[11px] text-[#565959] tabular-nums">
              Subtotal ({totalCartCount} {totalCartCount === 1 ? 'item' : 'items'}):{' '}
              <span className="font-semibold text-[#0F1111]">S${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => {
                  setAddedToastLabel(null);
                  setIsCartPreviewOpen(true);
                }}
                className="text-xs font-semibold text-[#007185] hover:underline cursor-pointer"
              >
                Preview Cart
              </button>
              <button
                type="button"
                onClick={() => setAddedToastLabel(null)}
                className="text-xs text-[#565959] hover:text-[#0F1111] cursor-pointer"
              >
                Keep shopping
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAddedToastLabel(null)}
            aria-label="Dismiss notification"
            className="p-0.5 text-[#565959] hover:text-[#0F1111] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mobile Sticky Bottom Bar (<= 15% viewport height) */}
      {view === 'product' && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#D5D9D9] px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="text-base font-bold text-[#0F1111] tabular-nums">
              S${(unitPrice * quantity).toFixed(2)}
            </div>
            <div className="text-[11px] text-[#007600] font-medium">FREE Tomorrow Delivery</div>
          </div>
          <div className="flex items-center gap-2">
            {totalCartCount > 0 && (
              <button
                type="button"
                onClick={() => setIsCartPreviewOpen(true)}
                className="px-3.5 py-2.5 rounded-full border border-[#D5D9D9] bg-white text-xs font-medium text-[#0F1111] whitespace-nowrap cursor-pointer"
              >
                Cart ({totalCartCount})
              </button>
            )}
            <button
              type="button"
              onClick={() => handleAddMainToCart(false)}
              className="px-5 py-2.5 rounded-full bg-[#FFD814] hover:bg-[#F7CA00] border border-[#FCD200] text-xs font-semibold text-[#0F1111] whitespace-nowrap cursor-pointer"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Amazon.sg Footer */}
      <footer className="bg-[#232F3E] text-white mt-auto">
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-3 bg-[#37475A] hover:bg-[#485769] text-xs font-medium text-white transition-colors cursor-pointer"
        >
          Back to top
        </button>

        <div className="max-w-[1440px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#CCCCCC] border-t border-white/10">
          <div className="flex items-center gap-4">
            <span className="font-bold text-white text-sm">amazon.sg</span>
            <span>Singapore · English · SGD (S$)</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => setIsLocationOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Singapore Delivery
            </button>
            <button
              type="button"
              onClick={() => setIsOrdersOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Returns &amp; Orders
            </button>
            <button
              type="button"
              onClick={() => setIsCartPreviewOpen(true)}
              className="hover:underline cursor-pointer"
            >
              Shopping Cart ({totalCartCount})
            </button>
          </div>
        </div>
      </footer>

      {/* Sliding Cart Preview Drawer */}
      <SlidingCartPreview
        open={isCartPreviewOpen}
        onClose={() => setIsCartPreviewOpen(false)}
        items={cart}
        onSetQty={handleSetQty}
        onRemoveItem={handleRemoveItem}
        onOpenFullCart={() => openCartPage(false)}
        onProceedToCheckout={() => openCartPage(true)}
      />

      {/* Location & Orders Modals */}
      <LocationModal
        open={isLocationOpen}
        onClose={() => setIsLocationOpen(false)}
        selected={selectedLocation}
        onSelect={setSelectedLocation}
      />

      <OrdersAndSavedModal
        open={isOrdersOpen}
        onClose={() => setIsOrdersOpen(false)}
        orders={orders}
        isSaved={isSaved}
        onRemoveSaved={() => setIsSaved(false)}
      />
    </div>
  );
}
