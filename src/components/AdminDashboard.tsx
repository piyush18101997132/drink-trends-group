import React, { useState, useMemo } from 'react';
import { Plus, Edit3, Trash2, Tag, Layers, IndianRupee, BarChart3, ChevronDown, Check, X, RefreshCw, AlertTriangle, Package2, ClipboardList } from 'lucide-react';
import { Product, Order } from '../types';

interface AdminDashboardProps {
  products: Product[];
  orders: Order[];
  onAddProduct: (prod: Omit<Product, 'id' | 'salesCount'>) => Promise<void>;
  onEditProduct: (id: number, prod: Partial<Product>) => Promise<void>;
  onDeleteProduct: (id: number) => Promise<void>;
  onUpdateOrderStatus: (orderId: number, status: Order['status']) => Promise<void>;
  isDbSyncing: boolean;
}

export default function AdminDashboard({
  products,
  orders,
  onAddProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateOrderStatus,
  isDbSyncing
}: AdminDashboardProps) {
  
  // Tabs inside Admin Dashboard: 'catalog' | 'orders' | 'analytics'
  const [adminTab, setAdminTab] = useState<'catalog' | 'orders' | 'analytics'>('catalog');

  // Add/Edit Product Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [pName, setPName] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pPrice, setPPrice] = useState('');
  const [pCategory, setPCategory] = useState('Lassis & Yogurt');
  const [pStock, setPStock] = useState('');
  const [pVolume, setPVolume] = useState('350ml');
  const [pImageChoice, setPImageChoice] = useState('lassi_seed');

  // Handle Form open to Add
  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setPName('');
    setPDesc('');
    setPPrice('');
    setPCategory('Lassis & Yogurt');
    setPStock('');
    setPVolume('350ml');
    setPImageChoice('lassi_seed');
    setShowProductModal(true);
  };

  // Handle Form open to Edit
  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setPName(prod.name);
    setPDesc(prod.description);
    setPPrice(String(prod.price));
    setPCategory(prod.category);
    setPStock(String(prod.stock));
    setPVolume(prod.volume);
    setPImageChoice('custom');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName || isNaN(Number(pPrice)) || isNaN(Number(pStock))) return;

    let imageUrl = '';
    if (editingProduct) {
      imageUrl = editingProduct.imageUrl;
    } else {
      // Pick high-resolution curated placeholders based on selected themes
      if (pImageChoice === 'lassi_seed') {
        imageUrl = 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=600';
      } else if (pImageChoice === 'chai_seed') {
        imageUrl = 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600';
      } else if (pImageChoice === 'thandai_seed') {
        imageUrl = 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=600';
      } else if (pImageChoice === 'kokum_seed') {
        imageUrl = 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&q=80&w=600';
      } else {
        imageUrl = 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&q=80&w=600';
      }
    }

    const payload = {
      name: pName,
      description: pDesc,
      price: Number(pPrice),
      category: pCategory,
      imageUrl,
      stock: Number(pStock),
      volume: pVolume
    };

    if (editingProduct) {
      await onEditProduct(editingProduct.id, payload);
    } else {
      await onAddProduct(payload);
    }

    setShowProductModal(false);
  };

  // Computations for Admin Statistics
  const stats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => o.status === 'completed' || o.status === 'processing' ? sum + o.totalAmount : sum, 0);
    const orderCountProcessed = orders.filter(o => o.status !== 'cancelled').length;
    const warningInventory = products.filter(p => p.stock <= 25).length;
    const itemsCirculating = products.reduce((sum, p) => sum + p.stock, 0);

    return {
      totalSales,
      orderCountProcessed,
      warningInventory,
      itemsCirculating
    };
  }, [products, orders]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-amber-900/10 pb-6 mb-8 gap-4">
        <div>
          <h2 className="font-heading text-2xl font-bold text-amber-950 sm:text-3xl">Drink India Administration</h2>
          <p className="text-xs text-amber-900/70 mt-1">Catalog curation, orders verification, and systemic analytics for regional outlets.</p>
        </div>

        {/* Database Status and Sync Feedback */}
        <div className="flex items-center gap-3">
          {isDbSyncing && (
            <div className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 font-mono text-xs text-amber-900">
              <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-800" />
              <span>Updating Store State...</span>
            </div>
          )}
          <button
            onClick={handleOpenAddModal}
            className="rounded-xl bg-amber-900 text-amber-50 hover:bg-amber-950 text-xs font-semibold px-4 py-2.5 shadow-md shadow-amber-900/10 flex items-center gap-2 cursor-pointer transition-transform hover:scale-[1.01]"
          >
            <Plus className="h-4 w-4" />
            <span>Add Legacy Brew</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards Bar */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        
        {/* Total revenue */}
        <div className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <IndianRupee className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-900/70 uppercase font-mono block">Registered Sales</span>
            <span className="text-2xl font-black text-amber-950 font-mono">₹{stats.totalSales}</span>
          </div>
        </div>

        {/* Order queue */}
        <div className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-900/70 uppercase font-mono block">Current Active Orders</span>
            <span className="text-2xl font-black text-amber-950 font-mono">{stats.orderCountProcessed}</span>
          </div>
        </div>

        {/* Inventory low level warning */}
        <div className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stats.warningInventory > 0 ? 'bg-orange-50 text-orange-700' : 'bg-amber-50 text-amber-800'}`}>
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-900/70 uppercase font-mono block">Low Stock Items</span>
            <span className="text-2xl font-black text-amber-950 font-mono">{stats.warningInventory}</span>
          </div>
        </div>

        {/* Physical stock counter */}
        <div className="rounded-2xl border border-amber-900/10 bg-white p-5 shadow-sm flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
            <Package2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-900/70 uppercase font-mono block">Volume in Bottles</span>
            <span className="text-2xl font-black text-amber-950 font-mono">{stats.itemsCirculating} <span className="text-xs text-amber-805 font-sans">qty</span></span>
          </div>
        </div>

      </div>

      {/* TAB NAVIGATION */}
      <div className="border-b border-amber-900/10 mb-8 flex space-x-6">
        <button
          onClick={() => setAdminTab('catalog')}
          className={`pb-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            adminTab === 'catalog'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-amber-700 hover:text-amber-900'
          }`}
        >
          Product Catalog ({products.length})
        </button>
        <button
          onClick={() => setAdminTab('orders')}
          className={`pb-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            adminTab === 'orders'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-amber-700 hover:text-amber-900'
          }`}
        >
          Customer Orders Fulfillment ({orders.length})
        </button>
        <button
          onClick={() => setAdminTab('analytics')}
          className={`pb-4 text-sm font-semibold transition-all border-b-2 cursor-pointer ${
            adminTab === 'analytics'
              ? 'border-amber-900 text-amber-950'
              : 'border-transparent text-amber-700 hover:text-amber-900'
          }`}
        >
          Performance Metrics
        </button>
      </div>

      {/* TAB 1 CONTENT: PRODUCTS TABLE */}
      {adminTab === 'catalog' && (
        <div className="rounded-2xl border border-amber-900/10 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/40 border-b border-amber-900/10 text-[10px] font-bold uppercase tracking-wider text-amber-900 font-mono">
                  <th className="py-4 px-6">Beverage Drink</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Volume</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6">Stock Status</th>
                  <th className="py-4 px-6">Total Sales</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 text-sm text-amber-950">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img 
                          src={prod.imageUrl} 
                          alt={prod.name} 
                          referrerPolicy="no-referrer"
                          className="h-10 w-10 rounded-lg object-cover bg-amber-50 flex-shrink-0" 
                        />
                        <div>
                          <p className="font-semibold text-amber-950">{prod.name}</p>
                          <p className="text-[11px] text-amber-700/60 line-clamp-1 max-w-xs">{prod.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-amber-900">{prod.category}</td>
                    <td className="py-4 px-6 font-mono text-xs">{prod.volume}</td>
                    <td className="py-4 px-6 font-mono font-bold">₹{prod.price}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className={`h-2.5 w-2.5 rounded-full ${prod.stock > 25 ? 'bg-emerald-500' : prod.stock > 0 ? 'bg-orange-500' : 'bg-red-500'}`} />
                        <span className="font-mono text-xs font-semibold">{prod.stock} left</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs font-bold text-amber-800">{prod.salesCount} sold</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(prod)}
                          title="Modify Details"
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-amber-50 text-amber-800 transition-colors cursor-pointer"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Confirm permanent removal of ${prod.name} from traditional beverage archives?`)) {
                              onDeleteProduct(prod.id);
                            }
                          }}
                          title="Delete"
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-red-50 text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2 CONTENT: CUSTOMER ORDERS QUEUE */}
      {adminTab === 'orders' && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-amber-900/20 bg-amber-50/10 py-16 text-center">
              <p className="text-gray-500">No customer checkout transactions are currently queued on our terminal.</p>
            </div>
          ) : (
            orders.map((ord) => (
              <div key={ord.id} className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
                
                {/* Header detail */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-amber-900/5 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-900 uppercase">Order ID: #{ord.id}</span>
                      <span className={`text-[10px] font-bold rounded px-1.5 py-0.5 uppercase border ${
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
                    <p className="text-xs text-amber-700/80 mt-1">
                      Customer: <strong>{ord.userName}</strong> ({ord.userEmail}) • Contact: {ord.phone}
                    </p>
                  </div>

                  {/* Interactive order flow changer */}
                  <div className="flex flex-wrap items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-950/5">
                    <span className="font-mono text-[10px] uppercase font-bold text-amber-800 px-2">Update Stage:</span>
                    {(['pending', 'processing', 'completed', 'cancelled'] as Order['status'][]).map((st) => (
                      <button
                        key={st}
                        onClick={() => onUpdateOrderStatus(ord.id, st)}
                        className={`rounded-lg px-2 font-mono uppercase transition-all whitespace-nowrap cursor-pointer ${
                          ord.status === st
                            ? 'bg-amber-900 text-white'
                            : 'text-amber-900 hover:bg-amber-200'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Items layout */}
                <div className="space-y-2 mb-4">
                  <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider">Beverage Manifest</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ord.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center rounded-xl bg-amber-50/40 border border-amber-950/5 p-2.5 text-xs">
                        <div>
                          <p className="font-bold text-amber-950">{item.productName}</p>
                          <p className="text-[10px] text-amber-700/70 font-mono">₹{item.price} x {item.quantity}</p>
                        </div>
                        <span className="font-mono font-black text-amber-900">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Logistics */}
                <div className="flex flex-col sm:flex-row justify-between items-center text-xs border-t border-amber-900/5 pt-4 mt-2 gap-2">
                  <p className="text-amber-900 flex items-center gap-1.5 self-start sm:self-center">
                    <span className="font-bold">Shipping Hub destination:</span> {ord.shippingAddress}
                  </p>
                  <p className="font-bold font-heading text-sm text-amber-950 self-end sm:self-center">
                    Collected Bill total: <span className="font-mono text-base text-amber-900">₹{ord.totalAmount}</span>
                  </p>
                </div>

              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3 CONTENT: ANALYTICS VISUALIZER */}
      {adminTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Comparative analysis box */}
          <div className="lg:col-span-2 rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm">
            <h3 className="font-heading font-bold text-amber-950 text-base mb-2">Bestseller Delivery Share</h3>
            <p className="text-xs text-amber-750/70 mb-6">Quantity comparison of regional recipes in checkout volumes.</p>
            
            {/* Handcrafted dynamic bar list chart with responsive width bars */}
            <div className="space-y-4">
              {products.map((p) => {
                const percentage = Math.min(100, Math.round((p.salesCount / 400) * 100)); // Cap metric scale dynamically
                return (
                  <div key={p.id}>
                    <div className="flex justify-between items-center text-xs font-semibold mb-1">
                      <span className="text-amber-950">{p.name} <span className="font-mono text-[10px] text-amber-700">({p.volume})</span></span>
                      <span className="font-mono font-bold text-amber-900">{p.salesCount} sold</span>
                    </div>
                    {/* Visual Bar structure */}
                    <div className="w-full h-3 bg-amber-50 rounded-full overflow-hidden border border-amber-900/5">
                      <div 
                        style={{ width: `${percentage}%` }} 
                        className="h-full bg-amber-800 rounded-full transition-all duration-500 ease-out" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stock warning panel */}
          <div className="lg:col-span-1 rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-heading font-bold text-amber-950 text-base mb-1">Logistics Integrity</h3>
              <p className="text-xs text-amber-750/70">Warning levels when batch sizes descend threshold parameters.</p>
            </div>

            <div className="space-y-3.5">
              {products.map((p) => {
                const ratio = p.stock / 150; // max threshold benchmark ratio
                const status = p.stock <= 25 ? 'CRITICAL_REFILL' : p.stock <= 50 ? 'LOW_BUFFER' : 'HEALTHY_BATCH';

                return (
                  <div key={p.id} className="flex items-center gap-3 border-b border-amber-900/5 pb-3">
                    <div className={`h-2 w-2 rounded-full flex-shrink-0 ${status === 'CRITICAL_REFILL' ? 'bg-red-500' : status === 'LOW_BUFFER' ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                    <div className="flex-1 text-xs">
                      <p className="font-bold text-amber-950 leading-tight">{p.name}</p>
                      <p className="font-mono text-[9px] text-amber-700 uppercase tracking-widest leading-none mt-1">{status}</p>
                    </div>
                    <span className="font-mono text-xs font-black text-amber-900">{p.stock} units</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* DYNAMIC MODAL LAYER FOR PRODUCT ARCHIVING (ADD/EDIT) */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2">
          <div className="w-full max-w-lg  mt-5 overflow-hidden rounded-2xl bg-white border border-amber-950/10 shadow-2xl">
            
            {/* Modal Header */}
            <div className="bg-amber-950 text-amber-50 p-2 flex items-center justify-between">
              <h3 className="font-heading font-bold text-lg">
                {editingProduct ? `Edit traditional drink: ${editingProduct.name}` : 'Assemble New Indian Brew'}
              </h3>
              <button 
                type="button"
                onClick={() => setShowProductModal(false)}
                className="text-amber-200 hover:text-white font-mono text-xs font-bold uppercase tracking-wider bg-white/10 rounded-lg py-1 px-2.5"
              >
                Cancel
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Beverage Title</label>
                  <input
                    type="text"
                    required
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    placeholder="e.g. Saffron Rose Lassi"
                    className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Detailed Description</label>
                  <textarea
                    value={pDesc}
                    onChange={(e) => setPDesc(e.target.value)}
                    placeholder="Briefly narrative on botanicals, dairy blend or organic parameters..."
                    rows={2}
                    className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={pPrice}
                    onChange={(e) => setPPrice(e.target.value)}
                    placeholder="e.g. 120"
                    className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Batch Stock level</label>
                  <input
                    type="number"
                    required
                    value={pStock}
                    onChange={(e) => setPStock(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Curation Class</label>
                  <select
                    value={pCategory}
                    onChange={(e) => setPCategory(e.target.value)}
                    className="w-full rounded-xl border border-amber-900/15 bg-white py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700 cursor-pointer"
                  >
                    <option value="Lassis & Yogurt">Lassis & Yogurt</option>
                    <option value="Hot Beverages">Hot Beverages</option>
                    <option value="Royal Shakes">Royal Shakes</option>
                    <option value="Coolers & Sherbets">Coolers & Sherbets</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-amber-900 uppercase mb-1">Standard Volume Size</label>
                  <input
                    type="text"
                    required
                    value={pVolume}
                    onChange={(e) => setPVolume(e.target.value)}
                    placeholder="e.g. 350ml"
                    className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3 text-sm text-amber-950 outline-none focus:border-amber-700"
                  />
                </div>

                {/* Picture seed option (only if adding) */}
                {!editingProduct && (
                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-amber-900 uppercase mb-1.5">Aesthetic Image Theme Seed Selection</label>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-900/10 cursor-pointer">
                        <input type="radio" checked={pImageChoice === 'lassi_seed'} onChange={() => setPImageChoice('lassi_seed')} className="accent-amber-800" />
                        <span className="text-xs text-amber-950">Creamy Lassi</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-900/10 cursor-pointer">
                        <input type="radio" checked={pImageChoice === 'chai_seed'} onChange={() => setPImageChoice('chai_seed')} className="accent-amber-800" />
                        <span className="text-xs text-amber-950">Steaming Masala Chai</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-900/10 cursor-pointer">
                        <input type="radio" checked={pImageChoice === 'thandai_seed'} onChange={() => setPImageChoice('thandai_seed')} className="accent-amber-800" />
                        <span className="text-xs text-amber-950">Royal Saffron Thandai</span>
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-amber-50 rounded-xl border border-amber-900/10 cursor-pointer">
                        <input type="radio" checked={pImageChoice === 'kokum_seed'} onChange={() => setPImageChoice('kokum_seed')} className="accent-amber-800" />
                        <span className="text-xs text-amber-950">Tangy Pink Kokum</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit panel */}
              <div className="pt-4 border-t border-amber-900/5 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="border border-amber-900/15 p-2 small rounded-2 font-semibold text-amber-950 hover:bg-amber-100/30"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={isDbSyncing}
                  className="bg-amber-900 hover:bg-amber-950 text-amber-50 p-2 rounded-2 small font-bold shadow-md shadow-amber-900/10"
                >
                  {isDbSyncing ? 'Syncing...' : editingProduct ? 'Commit Edits' : 'Enact Drink Curation'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
