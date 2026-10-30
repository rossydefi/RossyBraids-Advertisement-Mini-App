import React, { useState, useEffect, useMemo, useRef } from 'react';
import { PRODUCTS_SHOP_DATA, BRAND_DATA } from '../data/flyerData';
import { CartItem, ProductShopItem } from '../types';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Check,
  Sparkles,
  Search,
  X,
  ArrowRight,
  ShieldCheck,
  Truck,
  MessageCircle,
  Tag,
  Crown,
  AlertCircle,
  Clock,
  CheckCircle2,
  Gift,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getMostExpensiveWig, getTimeRemaining } from '../utils/referral';
import { api, applyProductOverrides, ApiError, request, type RewardView, type ServerOrder } from '../api/client';
import { useSite } from '../api/SiteProvider';
import { useModalA11y } from '../hooks/useModalA11y';

interface RewardCheck {
  discountAmount: number;
  reward?: RewardView;
  /** True when the server has no preview endpoint: the order itself will verify the code. */
  unverified?: boolean;
}

/** Asks the server whether this code can be used by this phone on this cart. Throws ApiError with the reason. */
async function checkReward(code: string, phone: string, productIds: string[]): Promise<RewardCheck> {
  const res = await api.checkReward(code, phone, productIds);
  if (!res.valid || !res.reward) throw new ApiError(400, res.error || 'This discount code cannot be used.');
  return { discountAmount: res.discountAmount ?? res.reward.discountAmount, reward: res.reward };
}

interface ProductShopProps {
  onNavigateToBooking?: () => void;
  onOpenReferModal?: () => void;
  prefilledDiscountCode?: string;
  preselectedWigId?: string;
}

export const ProductShop: React.FC<ProductShopProps> = ({
  onNavigateToBooking,
  onOpenReferModal,
  prefilledDiscountCode,
  preselectedWigId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [selectedProductModal, setSelectedProductModal] = useState<ProductShopItem | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<ServerOrder | null>(null);
  const [checkingDiscount, setCheckingDiscount] = useState<boolean>(false);

  const { config, refreshConfig } = useSite();
  // Catalog with the owner's live price and stock changes applied
  const products = useMemo(() => applyProductOverrides(PRODUCTS_SHOP_DATA, config), [config]);

  // Referral discount code state
  const [discountCodeInput, setDiscountCodeInput] = useState<string>(prefilledDiscountCode || '');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    reward?: RewardView;
    targetWig?: ProductShopItem;
    unverified?: boolean;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [countdownFormatted, setCountdownFormatted] = useState<string>('');

  const mostExpensiveWig = getMostExpensiveWig(products);

  const closeCart = () => setIsCartOpen(false);
  const closeProductModal = () => setSelectedProductModal(null);
  const cartDialogRef = useModalA11y(isCartOpen, closeCart);
  const productDialogRef = useModalA11y(!!selectedProductModal, closeProductModal);

  const categories = [
    'All',
    'Luxury Ready-to-Wear Wigs',
    'Wash & Cleansing',
    'Conditioners & Masks',
    'Serums & Oils',
    'Accessories & Silk',
  ];

  // If navigated with preselected wig or prefilled discount code
  useEffect(() => {
    if (preselectedWigId) {
      const wig = products.find((p) => p.id === preselectedWigId);
      if (wig) {
        setCart((prev) => {
          if (!prev.some((item) => item.product.id === wig.id)) {
            return [...prev, { product: wig, quantity: 1 }];
          }
          return prev;
        });
        setSelectedCategory('Luxury Ready-to-Wear Wigs');
        setIsCartOpen(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedWigId]);

  // Keep bag items in step with the owner's latest prices and stock
  useEffect(() => {
    setCart((prev) =>
      prev
        .map((item) => ({ ...item, product: products.find((p) => p.id === item.product.id) ?? item.product }))
        .filter((item) => item.product.inStock)
    );
  }, [products]);

  useEffect(() => {
    if (prefilledDiscountCode) {
      setDiscountCodeInput(prefilledDiscountCode.toUpperCase());
      setIsCartOpen(true);
    }
  }, [prefilledDiscountCode]);

  // Live timer tick for active discount countdown
  useEffect(() => {
    if (!appliedDiscount?.reward?.expiresAt) {
      setCountdownFormatted('');
      return;
    }

    const tick = () => {
      const status = getTimeRemaining(appliedDiscount.reward!.expiresAt!);
      if (status.isExpired) {
        setAppliedDiscount(null);
        setDiscountError('Your referral discount code has expired. Codes are valid for 72 hours once unlocked.');
      } else {
        setCountdownFormatted(status.formatted);
      }
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [appliedDiscount]);

  // Re-check the applied code with the server whenever the bag or phone number changes
  const cartKey = cart.map((i) => i.product.id).sort().join(',');
  const recheckSeq = useRef(0);
  useEffect(() => {
    if (!appliedDiscount) return;
    const seq = ++recheckSeq.current;
    const timer = setTimeout(async () => {
      try {
        const result = await checkReward(appliedDiscount.code, customerPhone, cart.map((i) => i.product.id));
        if (seq !== recheckSeq.current) return;
        if (!result.unverified) {
          setAppliedDiscount((prev) =>
            prev ? { ...prev, discountAmount: result.discountAmount, reward: result.reward ?? prev.reward } : prev
          );
        }
      } catch (err) {
        if (seq !== recheckSeq.current) return;
        if (err instanceof ApiError && err.status === 0) return; // offline: the order request will decide
        setAppliedDiscount(null);
        setDiscountError(err instanceof ApiError ? err.message : 'Your discount could not be re-checked.');
      }
    }, 600);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, customerPhone]);

  // Filtering
  const filteredProducts = products.filter((prod) => {
    const matchCategory =
      selectedCategory === 'All' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Cart operations
  const addToCart = (product: ProductShopItem) => {
    if (!product.inStock) return;
    setOrderError(null);
    setPlacedOrder(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleApplyDiscount = async () => {
    const code = discountCodeInput.trim().toUpperCase();
    if (!code) {
      setDiscountError('Please enter a referral discount code.');
      return;
    }
    if (!customerPhone.trim()) {
      setDiscountError('Enter your phone number below first. Reward codes are tied to the phone number used when booking.');
      return;
    }

    setCheckingDiscount(true);
    setDiscountError(null);
    try {
      const result = await checkReward(code, customerPhone, cart.map((i) => i.product.id));
      const wig = result.reward ? products.find((p) => p.id === result.reward!.productId) : mostExpensiveWig;
      const inCart = cart.find((i) => i.product.id === wig?.id);
      setAppliedDiscount({
        code,
        // Without a preview endpoint show the standard 25%; the order response carries the real figure.
        discountAmount: result.unverified ? Math.round((inCart?.product.price ?? 0) * 0.25) : result.discountAmount,
        reward: result.reward,
        targetWig: wig,
        unverified: result.unverified,
      });
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#10B981', '#FAF7F2'],
      });
    } catch (err) {
      setDiscountError(err instanceof ApiError ? err.message : 'Could not check this code. Please try again.');
    } finally {
      setCheckingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountError(null);
  };

  const cartTotalItems = cart.reduce((acc, curr) => acc + curr.quantity, 0);
  const cartSubtotal = cart.reduce(
    (acc, curr) => acc + curr.product.price * curr.quantity,
    0
  );

  const discountDeduction = appliedDiscount ? appliedDiscount.discountAmount : 0;
  const finalPayable = Math.max(0, cartSubtotal - discountDeduction);
  const isFreeDelivery = finalPayable >= 25000;
  const hasMostExpensiveWigInCart = cart.some(
    (i) => i.product.id === mostExpensiveWig.id
  );

  const openOrderOnWhatsApp = (order: ServerOrder) => {
    const itemsSummary = order.items
      .map(
        (item, index) =>
          `${index + 1}. ${item.productName} x${item.quantity} — ₦${(item.price * item.quantity).toLocaleString()}`
      )
      .join('\n');

    const discountSummaryText = order.discount > 0
      ? `\n\n👑 *VIP REFERRAL DISCOUNT APPLIED:*\n` +
        `• Code: ${order.discountCode}\n` +
        `• Discount: -₦${order.discount.toLocaleString()}\n` +
        `• Original Subtotal: ₦${order.subtotal.toLocaleString()}\n` +
        `• *NET PAYABLE AMOUNT:* ₦${order.total.toLocaleString()}`
      : `\n\n• Subtotal: ₦${order.subtotal.toLocaleString()}`;

    const message = encodeURIComponent(
      `Hello Rose / RossyBraids! 🛍️✨\nI would like to confirm my order ${order.id} for hair-care products & luxury wigs:\n\n` +
        itemsSummary +
        discountSummaryText +
        `\n• Delivery Status: ${
          order.total >= 25000 ? 'FREE VIP Delivery (Orders over ₦25,000)' : 'Standard Local Dispatch'
        }` +
        `\n\n• Customer Name: ${order.customerName}\n• Phone: ${order.customerPhone}\n• Delivery Address: ${
          order.deliveryAddress || 'Pick-up at RossyBraids Studio'
        }` +
        `\n\nPlease confirm product availability and payment account details. Thank you!`
    );

    window.open(`https://wa.me/${BRAND_DATA.whatsappRaw}?text=${message}`, '_blank');
  };

  const handlePlaceOrder = async (payNow: boolean) => {
    if (cart.length === 0 || submitting) return;
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      setOrderError('Please fill in your name, phone number and delivery address.');
      return;
    }

    setSubmitting(true);
    setOrderError(null);
    try {
      const { order, payment } = await api.createOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        deliveryAddress: deliveryAddress.trim(),
        items: cart.map((i) => ({ productId: i.product.id, quantity: i.quantity })),
        discountCode: appliedDiscount?.code,
        payNow,
      });

      // Cache the order on this device for the "Happy New Month" greeting
      try {
        const existingRaw = localStorage.getItem('rossybraids_orders');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem('rossybraids_orders', JSON.stringify([order, ...existing]));
      } catch {
        // Ignore storage issues
      }

      if (payNow && payment) {
        window.location.assign(payment.authorizationUrl);
        return;
      }

      setPlacedOrder(order);
      setCart([]);
      setAppliedDiscount(null);
      setDiscountCodeInput('');
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#D4AF37', '#FAF7F2', '#2D1B11'],
      });
      if (payNow) {
        setOrderError('Your order was saved, but online payment could not start. Send it on WhatsApp and Rose will share payment details.');
      }
      openOrderOnWhatsApp(order);
    } catch (err) {
      setOrderError(err instanceof ApiError ? err.message : 'Something went wrong placing your order. Your bag is still saved, please try again.');
      // The server may have changed stock or prices since this page loaded
      if (err instanceof ApiError && err.status === 409) void refreshConfig();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fade-in text-[#2D1B11]">
      {/* Shop Header & Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2D1B11] via-[#3E2517] to-[#2D1B11] text-[#FAF7F2] p-6 sm:p-10 border border-[#D4AF37]/50 shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 text-[#F5E6A3] text-xs font-sans-modern font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            Official RossyBraids Boutique
          </div>
          <h1 className="font-serif-luxury text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight">
            Salon-Grade Hair Essentials & Accessories
          </h1>
          <p className="font-sans-modern text-xs sm:text-sm text-[#DFCEBC] leading-relaxed">
            Formulated specifically for bone-straight revamps, tension-free boho braids, dreadlocks,
            and 4C natural hair. Maintain effortless mirror shine and hydration between salon visits.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-sans-modern text-[#E6D7C8]">
            <span className="flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-[#D4AF37]" /> Free delivery on orders over ₦25,000
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> 100% Authentic & Salon-Tested
            </span>
          </div>
        </div>

        {/* Floating Cart Trigger on Desktop */}
        <button
          onClick={() => setIsCartOpen(true)}
          aria-label={`Open shopping bag, ${cartTotalItems} item${cartTotalItems === 1 ? '' : 's'}`}
          className="absolute top-6 right-6 hidden sm:flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-[#D4AF37] text-[#2A1810] font-sans-modern font-bold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all cursor-pointer z-10"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>My Bag</span>
          {cartTotalItems > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#2A1810] text-[#D4AF37] text-[11px] font-bold flex items-center justify-center">
              {cartTotalItems}
            </span>
          )}
        </button>
      </div>

      {/* VIP Referral Promo Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#24130A] via-[#351C0E] to-[#24130A] border border-[#D4AF37]/40 p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 text-[#FAF7F2]">
        <div className="flex items-center gap-3 text-center sm:text-left">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] flex items-center justify-center shrink-0 shadow-md">
            <Crown className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#F5E6A3]">
                Referral Reward Program
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                72-Hour Window
              </span>
            </div>
            <h3 className="font-serif-luxury text-base sm:text-lg font-bold text-white">
              Unlock 25% OFF Our Most Expensive Luxury Wig
            </h3>
            <p className="text-xs text-[#DFCEBC] max-w-xl">
              Invite a friend to book any appointment at RossyBraids. Once their first booking is confirmed, both of you unlock a discount code strictly valid for our flagship wig ({mostExpensiveWig.name})!
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          {onOpenReferModal && (
            <button
              type="button"
              onClick={onOpenReferModal}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] font-sans-modern font-bold text-xs hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Gift className="w-4 h-4" />
              <span>Get My Referral Link</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('Luxury Ready-to-Wear Wigs');
              const wigElement = document.getElementById(`product-${mostExpensiveWig.id}`);
              wigElement?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="hidden lg:flex px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#DFCEBC] text-xs font-semibold transition-colors cursor-pointer"
          >
            View Flagship Wig
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={`px-3.5 py-1.5 rounded-full text-xs font-sans-modern font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D1B11] text-[#D4AF37] shadow-sm'
                  : 'bg-white/80 text-[#6C4A32] border border-[#DFCEBC] hover:border-[#D4AF37]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8F6A1E]" aria-hidden="true" />
          <input
            type="search"
            aria-label="Search products"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#DFCEBC] bg-white focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const cartItem = cart.find((i) => i.product.id === product.id);
          const isFlagshipWig = product.id === mostExpensiveWig.id;

          return (
            <div
              key={product.id}
              id={`product-${product.id}`}
              className={`group bg-white/90 backdrop-blur-sm rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col ${
                isFlagshipWig
                  ? 'border-[#D4AF37] ring-2 ring-[#D4AF37]/40 shadow-md'
                  : 'border-[#DFCEBC] hover:border-[#D4AF37]'
              }`}
            >
              {/* Image & Badges */}
              <button
                type="button"
                className="relative block h-56 w-full bg-[#2D1B11] overflow-hidden cursor-pointer text-left"
                onClick={() => setSelectedProductModal(product)}
                aria-label={`View details for ${product.name}`}
              >
                <img
                  src={product.image}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${product.inStock ? '' : 'grayscale opacity-60'}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[85%]">
                  {isFlagshipWig ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#F5E6A3] text-[#2A1810] text-[10px] font-sans-modern font-bold uppercase tracking-wider shadow-md flex items-center gap-1">
                      <Crown className="w-3 h-3 fill-current" />
                      <span>Most Expensive Wig</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2D1B11]/85 border border-[#D4AF37]/50 text-[#F5E6A3] text-[10px] font-sans-modern font-semibold uppercase tracking-wider backdrop-blur-sm">
                      {product.volume}
                    </span>
                  )}

                  {product.featured && (
                    <span className="px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#2A1810] text-[10px] font-sans-modern font-bold uppercase tracking-wider shadow-sm">
                      Bestseller
                    </span>
                  )}
                  {!product.inStock && (
                    <span className="px-2 py-0.5 rounded-full bg-red-700 text-white text-[10px] font-sans-modern font-bold uppercase tracking-wider shadow-sm">
                      Sold out
                    </span>
                  )}
                </div>
              </button>

              {/* Product Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-[#8F6A1E] font-sans-modern font-semibold">
                      {product.category}
                    </span>
                    {isFlagshipWig && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Referral 25% Off Target
                      </span>
                    )}
                  </div>

                  <h3 className="font-serif-luxury text-base font-bold text-[#2D1B11] group-hover:text-[#8F6A1E] transition-colors line-clamp-1">
                    <button type="button" onClick={() => setSelectedProductModal(product)} className="cursor-pointer text-left">
                      {product.name}
                    </button>
                  </h3>
                  <p className="text-xs text-[#6C4A32] font-sans-modern line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Benefits List */}
                <div className="space-y-1 pt-1 border-t border-[#DFCEBC]/50">
                  {product.benefits.slice(0, 2).map((benefit, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#553823] font-sans-modern">
                      <Check className="w-3 h-3 text-[#D4AF37] shrink-0" />
                      <span className="line-clamp-1">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Price and Add to Cart */}
                <div className="pt-3 border-t border-[#DFCEBC]/60 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-[#8F6A1E] block font-sans-modern">Salon Price</span>
                    <span className="font-serif-luxury text-lg font-bold text-[#2D1B11]">
                      {product.formattedPrice}
                    </span>
                    {isFlagshipWig && (
                      <span className="block text-[10px] text-emerald-600 font-semibold">
                        ₦{(product.price * 0.75).toLocaleString()} with referral code
                      </span>
                    )}
                  </div>

                  {cartItem ? (
                    <div className="flex items-center gap-2 bg-[#F5EFEB] border border-[#D4AF37] rounded-full px-2 py-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, -1)}
                        aria-label={`Remove one ${product.name}`}
                        className="w-6 h-6 rounded-full bg-white text-[#2D1B11] flex items-center justify-center text-xs hover:bg-[#D4AF37] transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" aria-hidden="true" />
                      </button>
                      <span className="text-xs font-bold font-sans-modern px-1" aria-live="polite">
                        {cartItem.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(product.id, 1)}
                        aria-label={`Add one more ${product.name}`}
                        className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#2D1B11] flex items-center justify-center text-xs hover:brightness-110 transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" aria-hidden="true" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      disabled={!product.inStock}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#2D1B11] text-[#F9E498] text-xs font-sans-modern font-semibold hover:bg-[#442718] active:scale-95 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#D4AF37]" aria-hidden="true" />
                      <span>{product.inStock ? 'Add to Bag' : 'Out of stock'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Mobile Cart Bar */}
      {cartTotalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 sm:hidden z-40">
          <button
            onClick={() => setIsCartOpen(true)}
            aria-label={`Open shopping bag, ${cartTotalItems} item${cartTotalItems === 1 ? '' : 's'}`}
            className="w-full py-3.5 px-5 rounded-full bg-[#2D1B11] text-[#FAF7F2] border border-[#D4AF37] shadow-2xl flex items-center justify-between font-sans-modern font-bold text-xs"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span>
                {cartTotalItems} item{cartTotalItems > 1 ? 's' : ''} in Bag
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#D4AF37] font-serif-luxury text-sm">
                ₦{cartSubtotal.toLocaleString()}
              </span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Slide-Over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            ref={cartDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            className="w-full max-w-md bg-[#FAF7F2] h-full shadow-2xl flex flex-col text-[#2D1B11] focus:outline-none"
          >
            {/* Cart Header */}
            <div className="p-5 border-b border-[#DFCEBC] flex items-center justify-between bg-[#2D1B11] text-[#FAF7F2]">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-[#D4AF37]" />
                <h3 id="cart-title" className="font-serif-luxury text-lg font-bold text-[#F9E498]">
                  Your Shopping Bag ({cartTotalItems})
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close shopping bag"
                className="p-1 rounded-full text-[#DFCEBC] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            {/* Delivery Alert */}
            <div className="px-5 py-2.5 bg-[#F5EFEB] border-b border-[#DFCEBC] text-xs font-sans-modern flex items-center gap-2 text-[#6C4A32]">
              <Truck className="w-4 h-4 text-[#8F6A1E] shrink-0" />
              {isFreeDelivery ? (
                <span className="text-emerald-700 font-bold">
                  ✓ You qualify for FREE VIP Delivery!
                </span>
              ) : (
                <span>
                  Add <strong>₦{(25000 - cartSubtotal).toLocaleString()}</strong> more for FREE
                  delivery.
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 && placedOrder ? (
                <div role="status" className="text-center py-10 space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" aria-hidden="true" />
                  <p className="font-serif-luxury text-lg font-bold text-[#2D1B11]">Order {placedOrder.id} received!</p>
                  <p className="text-xs text-[#6C4A32] font-sans-modern">
                    Total <strong>₦{placedOrder.total.toLocaleString()}</strong>
                    {placedOrder.discount > 0 && <> (you saved ₦{placedOrder.discount.toLocaleString()})</>}. Send the order on
                    WhatsApp so Rose can confirm availability and share payment details.
                  </p>
                  <button
                    type="button"
                    onClick={() => openOrderOnWhatsApp(placedOrder)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#25D366] text-white text-xs font-bold cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" aria-hidden="true" />
                    <span>Send order on WhatsApp</span>
                  </button>
                  {orderError && (
                    <p role="alert" className="text-[11px] text-amber-800 bg-amber-50 border border-amber-300 rounded-lg p-2">
                      {orderError}
                    </p>
                  )}
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <ShoppingBag className="w-12 h-12 text-[#DFCEBC] mx-auto" />
                  <p className="font-serif-luxury text-base text-[#6C4A32]">Your bag is empty.</p>
                  <p className="text-xs text-[#8F6A1E] font-sans-modern">
                    Explore our shampoos, bone-straight serums, and silk scrunchies!
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="p-3.5 rounded-xl bg-white border border-[#DFCEBC] flex gap-3 items-center"
                  >
                    <img
                      src={product.image}
                      alt=""
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-black/5"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif-luxury text-xs font-bold text-[#2D1B11] truncate">
                        {product.name}
                      </h4>
                      <span className="text-[11px] text-[#8F6A1E] font-sans-modern block">
                        {product.volume} • {product.formattedPrice}
                      </span>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 bg-[#F5EFEB] rounded-full px-2 py-0.5 border border-[#DFCEBC]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, -1)}
                            aria-label={`Remove one ${product.name}`}
                            className="w-5 h-5 rounded-full text-xs hover:bg-[#D4AF37] flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-2.5 h-2.5" aria-hidden="true" />
                          </button>
                          <span className="text-xs font-bold font-sans-modern px-1">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(product.id, 1)}
                            aria-label={`Add one more ${product.name}`}
                            className="w-5 h-5 rounded-full text-xs hover:bg-[#D4AF37] flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" aria-hidden="true" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(product.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          aria-label={`Remove ${product.name} from bag`}
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Referral Discount Code Section */}
              {cart.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-[#DFCEBC] space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D1B11] uppercase tracking-wider flex items-center gap-1.5 font-sans-modern">
                      <Crown className="w-3.5 h-3.5 text-[#D4AF37]" />
                      <span>Referral Discount Code</span>
                    </span>
                    <span className="text-[10px] text-[#8F6A1E] font-medium">
                      Strictly for Flagship Wig
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <label htmlFor="discount-code" className="sr-only">Referral discount code</label>
                    <input
                      id="discount-code"
                      type="text"
                      autoComplete="off"
                      placeholder="e.g. REF-WELCOME-XXXX"
                      value={discountCodeInput}
                      onChange={(e) => {
                        setDiscountCodeInput(e.target.value.toUpperCase());
                        setDiscountError(null);
                      }}
                      disabled={!!appliedDiscount}
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-[#FAF7F2] text-[#2D1B11] placeholder:text-[#2D1B11]/30 font-mono focus:outline-none focus:border-[#D4AF37]"
                    />
                    {appliedDiscount ? (
                      <button
                        type="button"
                        onClick={handleRemoveDiscount}
                        className="px-3 py-2 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleApplyDiscount}
                        disabled={checkingDiscount}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-[#2D1B11] text-[#F9E498] hover:bg-[#442718] transition-colors cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-wait"
                      >
                        {checkingDiscount ? 'Checking…' : 'Apply'}
                      </button>
                    )}
                  </div>

                  {/* Active Discount Card with 3-Day Countdown */}
                  {appliedDiscount && (
                    <div role="status" className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 space-y-1.5 animate-fade-in text-xs">
                      <div className="flex items-center justify-between text-emerald-800 font-bold">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{appliedDiscount.unverified ? '25% Off Flagship Wig (confirmed at checkout)' : '25% Off Flagship Wig Applied!'}</span>
                        </span>
                        <span className="font-mono text-sm text-emerald-700 font-extrabold">
                          -₦{appliedDiscount.discountAmount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800">
                        Applied to: <strong>{appliedDiscount.targetWig?.name}</strong>
                      </p>
                      {countdownFormatted && (
                        <div className="flex items-center gap-1.5 text-[10.5px] text-amber-800 font-semibold pt-1 border-t border-emerald-200/60">
                          <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                          <span>72-Hour Window Remaining: {countdownFormatted}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount Error / Restriction Notification */}
                  {discountError && (
                    <div role="alert" className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2 animate-fade-in">
                      <div className="flex items-start gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <p className="leading-snug text-[11.5px]">{discountError}</p>
                      </div>
                      {!hasMostExpensiveWigInCart && mostExpensiveWig.inStock && (
                        <button
                          type="button"
                          onClick={() => {
                            addToCart(mostExpensiveWig);
                            setDiscountError(null);
                          }}
                          className="w-full py-1.5 px-3 rounded-lg bg-[#D4AF37] text-[#2A1810] font-bold text-xs hover:bg-[#E5C158] transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add {mostExpensiveWig.name.split('(')[0]} to Bag</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Delivery Details Form */}
              {cart.length > 0 && (
                <div className="p-4 rounded-xl bg-white border border-[#DFCEBC] space-y-3 mt-4">
                  <span className="text-xs font-bold text-[#2D1B11] uppercase tracking-wider block font-sans-modern">
                    Delivery / Contact Info
                  </span>
                  <div>
                    <label htmlFor="customer-name" className="sr-only">Your full name</label>
                    <input
                      id="customer-name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your Full Name *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label htmlFor="customer-phone" className="sr-only">Phone or WhatsApp number</label>
                    <input
                      id="customer-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      placeholder="Phone / WhatsApp Number *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                  {config?.paymentsEnabled && (
                    <div>
                      <label htmlFor="customer-email" className="sr-only">Email for payment receipt</label>
                      <input
                        id="customer-email"
                        type="email"
                        autoComplete="email"
                        placeholder="Email (for your payment receipt)"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-[#FAF7F2] focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                  )}
                  <div>
                    <label htmlFor="delivery-address" className="sr-only">Delivery address</label>
                    <textarea
                      id="delivery-address"
                      required
                      autoComplete="street-address"
                      rows={2}
                      placeholder="Delivery Address (City, State, Street) *"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-[#DFCEBC] bg-[#FAF7F2] focus:outline-none focus:border-[#D4AF37] resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 bg-white border-t border-[#DFCEBC] space-y-3 shadow-lg">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#6C4A32] font-sans-modern">
                    <span>Order Subtotal:</span>
                    <span className="font-semibold text-[#2D1B11]">
                      ₦{cartSubtotal.toLocaleString()}
                    </span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex items-center justify-between text-xs text-emerald-600 font-sans-modern font-semibold">
                      <span className="flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5" />
                        <span>Referral Discount (25% on Flagship Wig):</span>
                      </span>
                      <span>-₦{appliedDiscount.discountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#DFCEBC] flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2D1B11] font-sans-modern">
                      Net Total Payable:
                    </span>
                    <span className="font-serif-luxury text-xl font-bold text-[#2D1B11]">
                      ₦{finalPayable.toLocaleString()}
                    </span>
                  </div>
                </div>

                {orderError && (
                  <p role="alert" className="text-[11px] text-amber-900 bg-amber-50 border border-amber-300 rounded-lg p-2.5 leading-snug">
                    {orderError}
                  </p>
                )}

                {config?.paymentsEnabled && (
                  <button
                    type="button"
                    onClick={() => handlePlaceOrder(true)}
                    disabled={submitting}
                    className="w-full py-3 rounded-lg bg-[#2D1B11] text-[#F9E498] font-sans-modern font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-[#442718] active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                  >
                    <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                    <span>{submitting ? 'Placing order…' : 'Pay online now (Paystack)'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handlePlaceOrder(false)}
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-gradient-to-r from-[#D4AF37] to-[#B89228] text-[#2A1810] font-sans-modern font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:brightness-105 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-wait"
                >
                  <MessageCircle className="w-4 h-4 fill-current" aria-hidden="true" />
                  <span>{submitting ? 'Placing order…' : 'Place Order & Send on WhatsApp'}</span>
                </button>

                <p className="text-[10px] text-center text-[#8F6A1E] font-sans-modern">
                  Your order is saved with the salon • Pay by bank transfer on confirmation
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div
            ref={productDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-modal-title"
            className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto bg-[#FAF7F2] border border-[#D4AF37]/50 rounded-2xl shadow-2xl text-[#2D1B11] focus:outline-none"
          >
            <button
              type="button"
              onClick={closeProductModal}
              aria-label="Close product details"
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>

            <div className="relative h-64 bg-[#2D1B11]">
              <img
                src={selectedProductModal.image}
                alt={selectedProductModal.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-semibold font-sans-modern">
                  {selectedProductModal.category} • {selectedProductModal.volume}
                </span>
                <h3 id="product-modal-title" className="font-serif-luxury text-xl font-bold text-white">
                  {selectedProductModal.name}
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#553823] font-sans-modern leading-relaxed">
                {selectedProductModal.description}
              </p>

              <div>
                <span className="text-xs font-bold text-[#2D1B11] uppercase tracking-wider block font-sans-modern mb-2">
                  Proven Salon Benefits:
                </span>
                <div className="space-y-1.5">
                  {selectedProductModal.benefits.map((b, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-[#6C4A32] font-sans-modern">
                      <Check className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#DFCEBC] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8F6A1E] block font-sans-modern">Salon Price</span>
                  <span className="font-serif-luxury text-xl font-bold text-[#2D1B11]">
                    {selectedProductModal.formattedPrice}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={!selectedProductModal.inStock}
                  onClick={() => {
                    addToCart(selectedProductModal);
                    setSelectedProductModal(null);
                    setIsCartOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-full bg-[#2D1B11] text-[#F9E498] text-xs font-sans-modern font-bold hover:bg-[#442718] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedProductModal.inStock ? 'Add to Bag & Checkout' : 'Out of stock'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
