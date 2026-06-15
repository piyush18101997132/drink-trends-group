import React from 'react';
import { CupSoda, ShoppingBag, Shield, LayoutDashboard, LogOut, UserCircle, X, Menu } from 'lucide-react';
import { User, UserRole } from '../types';
import { useSidebar } from '../context/SidebarContext';

interface NavbarProps {
  currentUser: User | null;
  onLogout: () => void;
  cartCount: number;
  onOpenCart: () => void;
  activeTab: 'shop' | 'dashboard' | 'logs';
  setActiveTab: (tab: 'shop' | 'dashboard' | 'logs') => void;
  roleMode: UserRole;
  setRoleMode: (role: UserRole) => void;
  dbStatus: { connected: boolean; mode: string };
}

export default function Navbar({
  currentUser,
  onLogout,
  cartCount,
  onOpenCart,
  activeTab,
  setActiveTab,
  roleMode,
  setRoleMode,
  dbStatus
}: NavbarProps) {
  const { sidebarOpen, toggleSidebar } = useSidebar();

  return (
    <header className="container-fluid sticky-top bg-white border-bottom shadow-sm">
      <div className="d-flex align-items-center justify-content-between px-3 py-2">
        <div className="d-flex align-items-center gap-2">
        <button
              className="btn btn-sm p-1 d-flex align-items-center justify-content-center"
              style={{
                background: "#8b8b8b1f",
                border: "none",
                borderRadius: 8,
                color: "#000",
                width: 36,
                height: 36,
              }}
              onClick={toggleSidebar}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
        {/* Logo and Branding */}
        <div
          role="button"
          onClick={() => setActiveTab('shop')}
          className="d-flex align-items-center gap-2"
        >
          <div className="d-flex align-items-center justify-content-center rounded-circle bg-warning text-white" style={{ width: 40, height: 40 }}>
            <CupSoda size={20} />
          </div>
          <div>
            <h1 className="mb-0 h5 fw-bold text-dark">
              Drink-india 
            </h1>
            <p className="mb-0 royal-h-b text-muted">
              Royal Heritage Beverages
            </p>
          </div>
        </div>
              </div>
         {/* ─── NAVBAR ─── */}
        {/* Middle Navigation Tabs (Only if user has Admin/Superadmin privilege) */}
        <nav className="d-none d-md-flex align-items-center gap-2">
          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
            <>
              <button
                onClick={() => setActiveTab('shop')}
                className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === 'shop' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
              >
                <CupSoda size={16} />
                <span>Storefront</span>
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className={`btn btn-sm d-flex align-items-center gap-2 ${activeTab === 'dashboard' ? 'btn-primary text-white' : 'btn-outline-secondary'}`}
              >
                <LayoutDashboard size={16} />
                <span>Admin Dashboard</span>
              </button>
            </>
          )}
        </nav>

        {/* Right Section Actions */}
        <div className="d-flex align-items-center gap-3">

          {/* Cart Icon trigger for general shopping */}
          {activeTab === 'shop' && (
            <button
              onClick={onOpenCart}
              className="btn btn-light position-relative d-flex align-items-center justify-content-center rounded-circle"
              style={{ width: 40, height: 40 }}
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Logged Details */}
          {currentUser ? (
            <div className="d-flex align-items-center gap-2 ps-2 border-start">
              <div className="d-none d-sm-block text-end">
                <p className="mb-0 small fw-semibold text-dark">{currentUser.name}</p>
                <div className="d-flex align-items-center justify-content-end gap-1">
                  <Shield size={12} className="text-warning" />
                  <p className="mb-0 small text-uppercase fw-bold text-secondary">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: 40, height: 40 }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <UserCircle size={20} className="text-secondary" />
              <span className="small fw-semibold text-dark">Sign In</span>
            </div>
          )}

        </div>
      </div>

      {/* Small mobile demo role selector layout */}
      <div className="d-flex d-lg-none justify-content-center align-items-center gap-2 border-top bg-light py-2 px-3">
        <span className="small text-muted">Quick Role Switch:</span>
        {(['user', 'admin', 'superadmin'] as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setRoleMode(role)}
            className={`btn btn-sm text-uppercase ${
              roleMode === role
                ? 'btn-primary'
                : 'btn-outline-secondary'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </header>
  );
}
