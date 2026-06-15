import React, { useState, useMemo } from 'react';
import { ShoppingCart, Search, Filter, Sparkles, SlidersHorizontal, Check, RefreshCw, MapPin, Phone, CheckCircle, Tag, Info } from 'lucide-react';
import { Product, CartItem, Order } from '../types';

interface UserDashboardProps {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  onAddToCart: (product: Product) => void;
  onRemoveFromCart: (productId: number) => void;
  onUpdateCartQty: (productId: number, qty: number) => void;
  onPlaceOrder: (shippingAddress: string, phone: string) => Promise<void>;
  isPlacingOrder: boolean;
  orderCompleted: boolean;
  onResetOrderState: () => void;
  taxRate: number;
  minOrderValue: number;
}

export default function UserDashboard({
  products,
  cart,
  orders,
  onAddToCart,
  onRemoveFromCart,
  onUpdateCartQty,
  onPlaceOrder,
  isPlacingOrder,
  orderCompleted,
  onResetOrderState,
  taxRate,
  minOrderValue
}: UserDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [priceRange, setPriceRange] = useState(250); // maximum price limit slider default
  const [sortBy, setSortBy] = useState<'sales' | 'priceAsc' | 'priceDesc'>('sales');
  
  // Checkout Form Details
  const [shippingAddress, setShippingAddress] = useState('Flat 405, Nilgiri Heights, Bandra West, Mumbai, MH - 400050');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'cart' | 'form'>('cart');

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                              p.description.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
        const matchesPrice = p.price <= priceRange;
        return matchesSearch && matchesCategory && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === 'sales') return b.salesCount - a.salesCount;
        if (sortBy === 'priceAsc') return a.price - b.price;
        if (sortBy === 'priceDesc') return b.price - a.price;
        return 0;
      });
  }, [products, search, selectedCategory, priceRange, sortBy]);

  // Calculate cart metrics
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  }, [cart]);

  const taxAmount = useMemo(() => {
    return Math.round(cartSubtotal * taxRate);
  }, [cartSubtotal, taxRate]);

  const deliveryCharge = useMemo(() => {
    if (cartSubtotal === 0) return 0;
    return cartSubtotal >= 250 ? 0 : 40; // Free delivery over ₹250
  }, [cartSubtotal]);

  const cartTotal = useMemo(() => {
    return cartSubtotal + taxAmount + deliveryCharge;
  }, [cartSubtotal, taxAmount, deliveryCharge]);

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || !phone.trim()) return;
    await onPlaceOrder(shippingAddress, phone);
    setShowCheckoutForm(false);
    setCheckoutStep('cart');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Hero Welcome banner */}
      <div className="relative mb-12 overflow-hidden rounded-3xl bg-amber-950 px-6 py-12 text-amber-50 shadow-xl sm:px-12 sm:py-16 md:px-16">
        {/* Subtle royal background grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
        
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-800/60 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-200">
            <Sparkles className="h-3 w-3 text-amber-400" />
            Vocal for Local Beverages
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl font-heading">
            Taste the Royal Indian Heritage
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-amber-200/90 sm:text-base">
            Journey into India’s beverage legacy. Handpicked organic tea, premium saffron lassis, and ancient therapeutic coolers formulated by local experts and styled for contemporary connoisseurs.
          </p>
        </div>

        {/* Floating Abstract Circle decoration */}
        <div className="absolute right-0 bottom-0 top-0 hidden w-1/3 items-center justify-center lg:flex">
          <div className="relative h-48 w-48 rounded-full border-4 border-amber-500/20 bg-amber-900/40 p-4">
            <div className="h-full w-full rounded-full border-2 border-dashed border-amber-300/40 flex items-center justify-center">
              <span className="font-serif text-5xl font-semibold italic text-amber-300">DI</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        
        {/* LEFT COLUMN: Sidebar Filters */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-amber-900/5 pb-4 mb-5">
              <h3 className="font-heading font-bold text-amber-950 flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-amber-800" />
                Refine Selection
              </h3>
              <p className="font-mono text-[10px] text-amber-700 font-bold uppercase">{filteredProducts.length} Drinks</p>
            </div>

            {/* Live Search */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1.5">Search Beverages</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600/70">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="e.g. Lassi, Chai, saffron..."
                    className="w-full rounded-xl border border-amber-900/15 bg-amber-50/50 py-2 pl-9 pr-4 text-sm text-amber-950 outline-none focus:border-amber-700 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Price Filter Slider */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-amber-900 uppercase tracking-wide">Max Price</label>
                  <span className="font-mono text-xs font-bold text-amber-800">₹{priceRange}</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="250"
                  step="10"
                  value={priceRange}
                  onChange={(e) => setPriceRange(Number(e.target.value))}
                  className="w-full h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-700"
                />
                <div className="flex justify-between text-[10px] text-amber-700/60 font-mono mt-1">
                  <span>₹50</span>
                  <span>₹150</span>
                  <span>₹250</span>
                </div>
              </div>

              {/* Sort By selection */}
              <div>
                <label className="block text-xs font-semibold text-amber-900 uppercase tracking-wide mb-1.5">Sort Priority</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full rounded-xl border border-amber-900/15 bg-white py-2 px-3 text-sm text-amber-950 outline-none focus:border-amber-700 transition-all cursor-pointer"
                >
                  <option value="sales">Popularity (Bestsellers)</option>
                  <option value="priceAsc">Price: Low to High</option>
                  <option value="priceDesc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Informational Guide banner */}
          <div className="rounded-2xl bg-amber-50 border border-amber-900/10 p-5 space-y-3.5">
            <h4 className="font-heading font-bold text-amber-950 flex items-center gap-1.5 text-sm">
              <Info className="h-4 w-4 text-amber-700" />
              Sourcing Guarantee
            </h4>
            <ul className="text-xs text-amber-900 space-y-2 leading-relaxed">
              <li className="flex gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Milk sourced directly from dynamic cooperatives in Haryana and Rajasthan.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Zero chemical colors, synthetic essences, or preservative concentrates.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-amber-700 font-bold">•</span>
                <span>Eco-friendly sustainable shipping packing for chilled and thermal hot containers.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: Store Grid and Cart */}
        <div className="lg:col-span-3 space-y-8">
          
          {/* Category Slider Bar */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? 'bg-amber-800 text-white shadow-md shadow-amber-900/10'
                    : 'bg-white text-amber-900 border border-amber-900/10 hover:bg-amber-100/40'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-amber-900/20 bg-amber-50/20 py-24 text-center">
              <p className="text-base text-amber-800">No divine brews match your active search filters.</p>
              <button
                onClick={() => { setSearch(''); setSelectedCategory('All'); setPriceRange(250); }}
                className="mt-4 rounded-xl bg-amber-900 text-white px-4 py-2 text-xs font-semibold hover:bg-amber-950 transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((prod) => (
                <div 
                  key={prod.id} 
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-amber-900/10 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-700/25"
                >
                  {/* Image container and indicators */}
                  <div className="relative aspect-4/3 overflow-hidden bg-amber-100">
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    
                    {/* Floating top tags */}
                    <div className="absolute top-3 inset-x-3 flex justify-between items-start">
                      <span className="rounded-md bg-white/95 backdrop-blur-sm px-2 py-0.5 font-mono text-[9.5px] font-bold text-amber-950 shadow-sm">
                        {prod.volume}
                      </span>
                      {prod.stock < 10 && prod.stock > 0 && (
                        <span className="rounded-md bg-amber-700 px-2 py-0.5 font-mono text-[9.5px] font-bold text-white uppercase shadow-sm">
                          Only {prod.stock} Left
                        </span>
                      )}
                      {prod.stock === 0 && (
                        <span className="rounded-md bg-gray-600 px-2 py-0.5 font-mono text-[9.5px] font-bold text-white uppercase shadow-sm">
                          Sold Out
                        </span>
                      )}
                    </div>

                    {/* Best-seller indicator tag */}
                    {prod.salesCount > 150 && (
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-amber-950/90 backdrop-blur-sm px-2.5 py-1 text-[9px] font-bold text-amber-400">
                        <Sparkles className="h-2.5 w-2.5" />
                        <span>Bestseller</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col p-5">
                    <p className="font-mono text-[9px] font-extrabold uppercase tracking-widest text-amber-700">{prod.category}</p>
                    <h4 className="mt-1 font-heading text-base font-bold text-amber-950 line-clamp-1 group-hover:text-amber-800 transition-colors">
                      {prod.name}
                    </h4>
                    <p className="mt-2 text-xs leading-relaxed text-amber-900/70 line-clamp-2">
                      {prod.description}
                    </p>

                    {/* Price and Add button layout */}
                    <div className="mt-auto pt-4 flex items-center justify-between border-t border-amber-900/5">
                      <div>
                        <span className="font-mono text-[10px] text-amber-700 font-bold block leading-none">Price</span>
                        <span className="text-xl font-black text-amber-950">₹{prod.price}</span>
                      </div>

                      <button
                        onClick={() => prod.stock > 0 && onAddToCart(prod)}
                        disabled={prod.stock === 0}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                          prod.stock === 0
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-amber-900 hover:bg-amber-950 text-white shadow-md shadow-amber-900/10'
                        }`}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        <span>{prod.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* User's Checkout Order History Panel */}
          {orders.length > 0 && (
            <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm mt-12">
              <h3 className="font-heading font-bold text-amber-950 text-lg mb-4">Your Recent Orders</h3>
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="rounded-xl border border-amber-900/5 bg-amber-50/20 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-amber-900/5 pb-2.5 mb-2.5">
                      <div>
                        <p className="font-mono text-[10px] font-bold text-amber-800 uppercase">Order ID: #{ord.id}</p>
                        <p className="text-[11px] text-amber-700/70">{new Date(ord.createdAt).toLocaleDateString()} at {new Date(ord.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <span className={`mt-2 sm:mt-0 font-mono text-[10px] font-bold uppercase rounded-md px-2 py-0.5 border ${
                        ord.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : ord.status === 'processing'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : ord.status === 'cancelled'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {ord.status}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {ord.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-xs text-amber-950">
                          <span>{item.productName} <span className="text-amber-700">x{item.quantity}</span></span>
                          <span className="font-mono">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-amber-900/5 pt-2.5 mt-2.5">
                      <div className="flex items-center text-[11px] text-amber-700/80 gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate max-w-[200px] sm:max-w-md">{ord.shippingAddress}</span>
                      </div>
                      <span className="font-bold text-amber-950 font-heading">Total: <span className="font-mono text-base">₹{ord.totalAmount}</span></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Slide-out Panel overlay for Shopping Cart */}
      {orderCompleted && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-heading text-xl font-bold text-amber-950">
              Order Placed Successfully!
            </h3>
            <p className="mt-2 text-sm text-amber-900/70 leading-relaxed">
              Your royal Indian blend order has been compiled and cataloged into our state pipeline! Your thermal insulated delivery logistics are assembling now.
            </p>
            <div className="bg-amber-50/50 mt-4 rounded-xl border border-amber-900/5 p-4 text-left">
              <div className="flex justify-between text-xs font-mono font-bold text-amber-900 border-b border-amber-900/10 pb-1.5 mb-1.5">
                <span>Summary</span>
                <span className="text-emerald-700">PAID via Sandbox</span>
              </div>
              <div className="text-xs text-amber-900/80 space-y-1">
                <p><span className="font-semibold">Recipient Contact:</span> {phone}</p>
                <p><span className="font-semibold">Delivery Address:</span> {shippingAddress}</p>
              </div>
            </div>
            <button
              onClick={onResetOrderState}
              className="mt-6 w-full rounded-xl bg-amber-900 hover:bg-amber-950 text-white py-3 text-sm font-semibold transition-colors cursor-pointer"
            >
              Back to Storefront
            </button>
          </div>
        </div>
      )}

      {/* Cart Items Floating Drawer Overlay */}
      {showCheckoutForm && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-amber-50 h-full shadow-2xl flex flex-col overflow-hidden">
            
            {/* Drawer Header */}
            <div className="bg-amber-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-amber-400" />
                Your Royal Cart
              </h3>
              <button 
                onClick={() => { setShowCheckoutForm(false); setCheckoutStep('cart'); }}
                className="text-amber-200 hover:text-white font-bold text-sm bg-white/10 rounded-lg px-2.5 py-1"
              >
                Close
              </button>
            </div>

            {checkoutStep === 'cart' ? (
              /* TAB 1: CART DETAILS LIST */
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {cart.length === 0 ? (
                    <div className="text-center py-24 space-y-3">
                      <ShoppingCart className="mx-auto h-12 w-12 text-amber-800/20" />
                      <p className="text-sm text-amber-800/70">Your shopping cart is currently vacant.</p>
                      <button 
                        onClick={() => setShowCheckoutForm(false)}
                        className="rounded-xl border border-amber-900/20 px-4 py-2 text-xs font-semibold text-amber-950 hover:bg-amber-100/60"
                      >
                        Browse Drinks
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.product.id} className="flex gap-4 rounded-xl border border-amber-900/10 bg-white p-3 shadow-sm">
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name} 
                          referrerPolicy="no-referrer"
                          className="h-16 w-16 bg-amber-100 rounded-lg object-cover" 
                        />
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-amber-950 leading-tight">{item.product.name}</h4>
                          <p className="font-mono text-[9px] uppercase font-semibold text-amber-700/80 mb-1">{item.product.category} • {item.product.volume}</p>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-sm font-black text-amber-950">₹{item.product.price}</span>
                            
                            {/* Quantity buttons */}
                            <div className="flex items-center gap-2 bg-amber-50 rounded-lg border border-amber-900/10 p-0.5">
                              <button 
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity - 1)}
                                className="h-5 w-5 flex items-center justify-center font-bold text-xs text-amber-800 hover:bg-amber-200/60 rounded"
                              >
                                -
                              </button>
                              <span className="font-mono text-xs font-bold text-amber-950 w-5 text-center">{item.quantity}</span>
                              <button 
                                onClick={() => onUpdateCartQty(item.product.id, item.quantity + 1)}
                                className="h-5 w-5 flex items-center justify-center font-bold text-xs text-amber-800 hover:bg-amber-200/60 rounded"
                              >
                                +
                              </button>
                            </div>

                            <button 
                              onClick={() => onRemoveFromCart(item.product.id)}
                              className="text-[10px] font-bold text-red-700 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Subtotals & Proceed block */}
                {cart.length > 0 && (
                  <div className="bg-white border-t border-amber-900/10 p-5 space-y-4">
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-amber-900/80">
                        <span>Items Subtotal</span>
                        <span className="font-mono">₹{cartSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-amber-900/80">
                        <span>GST standard tax (18%)</span>
                        <span className="font-mono">₹{taxAmount}</span>
                      </div>
                      <div className="flex justify-between text-amber-900/80">
                        <span>Insulated logistics delivery</span>
                        <span className="font-mono">
                          {deliveryCharge === 0 ? <span className="text-emerald-700 font-bold uppercase">FREE</span> : `₹${deliveryCharge}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-extrabold text-amber-950 border-t border-amber-900/10 pt-2 font-heading">
                        <span>Total Checkout Bill</span>
                        <span className="font-mono text-base text-amber-900">₹{cartTotal}</span>
                      </div>
                    </div>

                    {cartSubtotal < minOrderValue ? (
                      <div className="rounded-xl bg-orange-50 border border-orange-200 p-3 text-[11px] text-orange-850 flex gap-2">
                        <span>⚠️</span>
                        <span>Minimum order checkout limit is <strong>₹{minOrderValue}</strong> (excluding taxes). Add ₹{minOrderValue - cartSubtotal} more.</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setCheckoutStep('form')}
                        className="w-full rounded-xl bg-amber-900 hover:bg-amber-950 text-white py-3.5 text-sm font-semibold transition-all shadow-md shadow-amber-900/10 cursor-pointer"
                      >
                        Proceed to Delivery Details
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* TAB 2: DELIVERY FORM */
              <form onSubmit={handleCreateOrderSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  <div className="rounded-xl bg-amber-100/50 p-4 border border-amber-950/5">
                    <h5 className="font-heading font-bold text-amber-950 text-xs mb-1 uppercase tracking-wider">Order Verification Summary</h5>
                    <p className="text-xs text-amber-900 leading-relaxed mb-3">Your transaction handles sandbox state syncing.</p>
                    <div className="flex justify-between text-xs font-mono font-bold text-amber-950">
                      <span>Total Amount Pay</span>
                      <span>₹{cartTotal}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-amber-900 uppercase mb-1.5 flex justify-between">
                        <span>Shipping Address</span>
                        <span className="text-[10px] text-amber-600 lowercase font-normal">(required)</span>
                      </label>
                      <textarea
                        required
                        value={shippingAddress}
                        onChange={(e) => setShippingAddress(e.target.value)}
                        placeholder="Flat / House No, Building, Street Address, City, State, PIN Code"
                        rows={3}
                        className="w-full rounded-xl border border-amber-900/15 bg-white p-3 text-sm text-amber-950 outline-none focus:border-amber-700 focus:bg-white transition-all resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-900 uppercase mb-1.5 flex justify-between">
                        <span>Mobile Phone Contact</span>
                        <span className="text-[10px] text-amber-600 lowercase font-normal">(required)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. +91 98765 43210"
                          className="w-full rounded-xl border border-amber-900/15 bg-white py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700 focus:bg-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="rounded-xl border border-amber-900/5 bg-amber-50 p-3 flex gap-2.5 text-[11px] text-amber-900">
                      <Tag className="h-4 w-4 text-amber-700 flex-shrink-0" />
                      <p>
                        <strong>Cash on Delivery (COD) / Mock Pay</strong>: We support simulation testing out of the box in playground environments.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-t border-amber-900/10 p-5 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="flex-1 rounded-xl border border-amber-900/15 text-amber-900 py-3.5 text-xs font-bold text-center hover:bg-amber-100/30 transition-colors"
                  >
                    Back to Cart
                  </button>
                  <button
                    type="submit"
                    disabled={isPlacingOrder}
                    className="flex-[2] rounded-xl bg-amber-900 hover:bg-amber-950 text-white py-3.5 text-xs font-extrabold transition-all shadow-md shadow-amber-900/10 flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isPlacingOrder ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Assembling Order...</span>
                      </>
                    ) : (
                      <span>Place COD Order (₹{cartTotal})</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Quick toggle cart trigger overlay button */}
      {cart.length > 0 && !showCheckoutForm && (
        <button
          onClick={() => setShowCheckoutForm(true)}
          className="fixed bottom-6 right-6 z-40 bg-amber-950 hover:bg-amber-900 text-amber-50 rounded-2xl shadow-xl hover:shadow-2xl px-5 py-4 flex items-center gap-2.5 transition-all cursor-pointer group"
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-amber-600 text-white rounded-full h-4 w-4 flex items-center justify-center text-[9px] font-bold">
              {cart.length}
            </span>
          </div>
          <span className="text-sm font-semibold tracking-wide border-l border-amber-700 pl-2.5">
            Checkout (₹{cartSubtotal})
          </span>
        </button>
      )}

    </div>
  );
}
