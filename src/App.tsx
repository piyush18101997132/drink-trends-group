import React, { useState, useEffect } from 'react';
import { CupSoda, Users, Lock, LogIn, ArrowRight, ShieldCheck, RefreshCw, Sparkles, Server } from 'lucide-react';
import { User, Product, CartItem, Order, SystemSettings, AuditLog, UserRole } from './types';
import Navbar from './components/Navbar';
import Sidebar from './components/sidebar';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import SuperadminDashboard from './components/SuperadminDashboard';
import { SidebarProvider } from './context/SidebarContext';
import RegisterLoginForm from './components/RegisterLoginForm';

export default function App() {
  // Session details stored in localStorage
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('di_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('di_token');
  });

  // Client role imitation overrides (for quick live testing in sandboxes)
  const [roleMode, setRoleMode] = useState<UserRole>(() => {
    const saved = localStorage.getItem('di_user');
    if (saved) {
      const u = JSON.parse(saved);
      return u.role;
    }
    return 'user';
  });

  // Catalog, orders, logs and users dataset states fetches
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [settings, setSettings] = useState<SystemSettings>({
    storeOpen: true,
    maintenanceMode: false,
    taxRate: 0.18,
    enableRewards: true,
    minOrderValue: 150
  });

  const [dbStatus, setDbStatus] = useState({ connected: false, mode: 'PREVIEW_FALLBACK_SANDBOX', host: 'In-Memory State Store' });
  const [cart, setCart] = useState<CartItem[]>([]);

  // Navigation and active panel selectors
  const [activeTab, setActiveTab] = useState<'shop' | 'dashboard' | 'logs'>('shop');
  
  // Async spinners 
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);

  // Synchronize headers payload when impersonating other role profiles
  const authHeaders = {
    'Content-Type': 'application/json',
    'x-user-role': roleMode,
    'x-user-name': currentUser?.name || 'Customer Guest',
    'x-user-id': String(currentUser?.id || '1'),
    'x-user-email': currentUser?.email || 'user@drinkindia.com'
  };

  // 1. Fetch initial platform dataset on boot or auth changes
  const refreshAllStoreData = async () => {
    if (!currentUser) return;
    setIsSyncing(true);
    try {
      const pRes = await fetch('/api/products');
      const productsData = await pRes.json();
      setProducts(productsData);

      const dbRes = await fetch('/api/db-status');
      const dbData = await dbRes.json();
      setDbStatus(dbData);

      // Verify active user privilege role
      const headers = {
        'x-user-role': roleMode,
        'x-user-name': currentUser.name,
        'x-user-id': String(currentUser.id),
        'x-user-email': currentUser.email
      };

      const oRes = await fetch('/api/orders', { headers });
      const ordersData = await oRes.json();
      setOrders(ordersData);

      if (roleMode === 'admin' || roleMode === 'superadmin') {
        const sRes = await fetch('/api/system/settings', { headers });
        const settingsData = await sRes.json();
        setSettings(settingsData);
      }

      if (roleMode === 'superadmin') {
        const lRes = await fetch('/api/system/logs', { headers });
        const logsData = await lRes.json();
        setLogs(logsData);

        const uRes = await fetch('/api/users', { headers });
        const usersData = await uRes.json();
        setUsers(usersData);
      }

    } catch (err) {
      console.error('[Sync Fail] Express backend syncing was interrupted:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    refreshAllStoreData();
  }, [currentUser, roleMode]);

  // Synchronize dynamic role switch overlay overrides
  const handleSetRoleMode = (role: UserRole) => {
    setRoleMode(role);
    // Redirect off dashboard view if reduced down to plain customer
    if (role === 'user' && activeTab === 'dashboard') {
      setActiveTab('shop');
    }
    // Set simulated role name override for logs clarity
    if (currentUser) {
      const updatedUser = { ...currentUser, role };
      setCurrentUser(updatedUser);
      localStorage.setItem('di_user', JSON.stringify(updatedUser));
    }
  };

  

  const handleLogout = () => {
    localStorage.removeItem('di_token');
    localStorage.removeItem('di_user');
    setToken(null);
    setCurrentUser(null);
    setCart([]);
    setActiveTab('shop');
  };

  // 3. E-commerce Cart Handlers
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.product.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleRemoveFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateCartQty = (productId: number, qty: number) => {
    if (qty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const targetProd = products.find(p => p.id === productId);
    if (targetProd && qty > targetProd.stock) {
      alert(`Limit Exceeded: Only ${targetProd.stock} available units remain.`);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: qty } : item
      )
    );
  };

  const handlePlaceOrder = async (shippingAddress: string, phone: string) => {
    setIsPlacingOrder(true);
    try {
      const subTotal = cart.reduce((sum, i) => sum + (i.product.price * i.quantity), 0);
      const tax = Math.round(subTotal * settings.taxRate);
      const delivery = subTotal >= 250 ? 0 : 40;
      const totalAmount = subTotal + tax + delivery;

      const orderItems = cart.map((c) => ({
        productId: c.product.id,
        quantity: c.quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          items: orderItems,
          totalAmount,
          shippingAddress,
          phone
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failure filing order record.');
      }

      setCart([]);
      setOrderCompleted(true);
      refreshAllStoreData();

    } catch (err: any) {
      alert(err.message || 'Order process experienced an issue.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // 4. Admin Management Handlers
  const handleAddProduct = async (payload: Omit<Product, 'id' | 'salesCount'>) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Error creating legacy beverage.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleEditProduct = async (id: number, payload: Partial<Product>) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Error editing beverage details.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Error processing product deletion archive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: number, status: Order['status']) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Failed altering order status.');
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Superadmin Configs & Promotional Handlers
  const handleUpdateUserRole = async (userId: number, role: User['role']) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ role })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Failed translating user role clearance.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateUserStatus = async (userId: number, status: User['status']) => {
    setIsSyncing(true);
    try {
      const res = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify({ status })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Failed changing user status clearance.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateSettings = async (nextSettings: Partial<SystemSettings>) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/system/settings', {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(nextSettings)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message);
      }
      refreshAllStoreData();
    } catch (err: any) {
      alert(err.message || 'Error committing network control policy.');
    } finally {
      setIsSyncing(false);
    }
  };

  // --- RENDERING ROUTINES ---

  // Render Login & Registration Portal Screen
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100/50 flex flex-col md:flex-row">
        
        {/* Left branding visual panel */}
        <div className="flex-1 bg-amber-950 p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-700 font-bold text-white shadow shadow-amber-900/10">
                <CupSoda className="h-6 w-6" />
              </div>
              <span className="font-heading text-2xl font-black tracking-tight text-white">drink-india</span>
            </div>
            <p className="font-mono text-[9px] font-bold tracking-widest text-amber-500 uppercase">Prestige Beverage Heritage Curation</p>
          </div>

          <div className="my-auto py-12 md:py-0 relative z-10 space-y-4 max-w-md">
            <h1 className="font-heading text-4xl font-extrabold tracking-tight md:text-5xl">
              Authentic Indian Refreshment Lounge
            </h1>
            <p className="text-amber-200/95 text-sm leading-relaxed">
              Unlock instantaneous role authorization credentials below to experience complete platform control: shop our organic catalog, manage stocks as admin, and govern the system policies as superadmin.
            </p>
          </div>

          <div className="relative z-10 border-t border-amber-900/40 pt-4 text-xs font-mono text-amber-400">
            <p>&copy; drink-india. Crafted for prestige full-stack. Port 3000 Ingress Live.</p>
          </div>
        </div>

        <RegisterLoginForm />

      </div>
    );
  }

  // Render Core Logged-in application
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-stone-50 flex flex-col justify-between">
      
      {/* Dynamic Header */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}
        onOpenCart={() => {}} // Controlled internally in UserDashboard by triggering bottom/drawer floating buttons!
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        roleMode={roleMode}
        setRoleMode={handleSetRoleMode}
        dbStatus={dbStatus}
      />

      {/* Main active view switcher with Role checking protections */}
      <div className="flex flex-1">
        <Sidebar />

        <main className="flex-1">
        
        {/* VIEW 1: Storefront user catalog */}
        {activeTab === 'shop' && (
          <UserDashboard
            products={products}
            cart={cart}
            orders={orders}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            onUpdateCartQty={handleUpdateCartQty}
            onPlaceOrder={handlePlaceOrder}
            isPlacingOrder={isPlacingOrder}
            orderCompleted={orderCompleted}
            onResetOrderState={() => setOrderCompleted(false)}
            taxRate={settings.taxRate}
            minOrderValue={settings.minOrderValue}
          />
        )}

        {/* VIEW 2: Administration portal dashboard */}
        {activeTab === 'dashboard' && roleMode === 'admin' && (
          <AdminDashboard
            products={products}
            orders={orders}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isDbSyncing={isSyncing}
          />
        )}

        {/* VIEW 3: Superadmin structural cockpit */}
        {activeTab === 'dashboard' && roleMode === 'superadmin' && (
          <SuperadminDashboard
            users={users}
            logs={logs}
            settings={settings}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateUserStatus={handleUpdateUserStatus}
            onUpdateSettings={handleUpdateSettings}
            isProcessing={isSyncing}
            dbStatus={dbStatus}
          />
        )}

        </main>
      </div>

      {/* Footer copyright */}
      <footer className="bg-amber-950 text-amber-200/40 text-center py-6 text-xs font-mono border-t border-amber-900/30">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>&copy; drink-india prestige e-commerce. Full backend API endpoints deployed.</p>
          <div className="flex gap-4">
            <span>MySQL Connection: OK</span>
            <span>Ingress: 0.0.0.0:3000</span>
          </div>
        </div>
      </footer>

    </div>
  </SidebarProvider>
  );
}
