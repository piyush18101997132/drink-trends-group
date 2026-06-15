import React from 'react';
import { CupSoda, ShoppingBag, Shield, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { User, UserRole } from '../types';

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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-amber-900/10 bg-amber-50/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Branding */}
        <div 
          onClick={() => setActiveTab('shop')} 
          className="flex cursor-pointer items-center space-x-2.5 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 shadow-md shadow-amber-900/10 text-white">
            <CupSoda className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold tracking-tight text-amber-900 sm:text-xl">
              drink-india
            </h1>
            <p className="font-mono text-[9px] font-semibold uppercase tracking-wider text-amber-700/80">
              Royal Heritage Beverages
            </p>
          </div>
        </div>

        {/* Middle Navigation Tabs (Only if user has Admin/Superadmin privilege) */}
        <nav className="hidden md:flex items-center space-x-1.5">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-sans text-sm font-medium transition-all ${
              activeTab === 'shop'
                ? 'bg-amber-950 text-amber-50'
                : 'text-amber-800 hover:bg-amber-100'
            }`}
          >
            <CupSoda className="h-4 w-4" />
            <span>Storefront</span>
          </button>

          {currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin') && (
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 rounded-lg px-4 py-2 font-sans text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-amber-950 text-amber-50'
                  : 'text-amber-800 hover:bg-amber-100'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </button>
          )}
        </nav>

        {/* Right Section Actions */}
        <div className="flex items-center space-x-4">
          
          {/* Quick Role Impersonator / Demo Switcher */}
          {currentUser && (
            <div className="hidden lg:flex items-center space-x-1 rounded-lg bg-amber-100/50 p-1 border border-amber-900/5">
              <span className="px-2 font-mono text-[9.5px] uppercase tracking-wider text-amber-800/80">Demo Access:</span>
              {(['user', 'admin', 'superadmin'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => setRoleMode(role)}
                  className={`rounded-md px-2 py-1 font-mono text-[10px] font-bold uppercase transition-all ${
                    roleMode === role
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-amber-900 hover:bg-amber-200/60'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          )}

          {/* Database Connectivity Badge */}
          <div className="hidden sm:flex items-center space-x-1.5 rounded-full bg-amber-100/30 px-2.5 py-1 border border-amber-900/10">
            <span className={`inline-block h-2 w-2 rounded-full ${dbStatus.connected ? 'bg-emerald-500' : 'bg-orange-400'}`} />
            <span className="font-mono text-[10px] text-amber-900">
              {dbStatus.connected ? 'MySQL Live' : `Preview State`}
            </span>
          </div>

          {/* Cart Icon trigger for general shopping */}
          {activeTab === 'shop' && (
            <button
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-colors cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-700 text-[10px] font-bold text-white ring-2 ring-amber-50">
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* User Logged Details */}
          {currentUser ? (
            <div className="flex items-center space-x-3 pl-2 border-l border-amber-900/10">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-semibold text-amber-950">{currentUser.name}</p>
                <div className="flex items-center justify-end space-x-1">
                  <Shield className="h-3 w-3 text-amber-700" />
                  <p className="font-mono text-[9px] uppercase tracking-wider font-bold text-amber-700">
                    {currentUser.role}
                  </p>
                </div>
              </div>
              <button
                onClick={onLogout}
                title="Sign Out"
                className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-red-50 text-amber-800 hover:text-red-700 transition-colors"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <UserCircle className="h-6 w-6 text-amber-800" />
              <span className="text-sm font-semibold text-amber-900">Sign In</span>
            </div>
          )}

        </div>
      </div>

      {/* Small mobile demo role selector layout */}
      <div className="flex lg:hidden justify-center items-center space-x-2 border-t border-amber-900/5 bg-amber-100/30 py-1.5 px-4">
        <span className="font-mono text-[10px] tracking-wide text-amber-800">Quick Role Switch:</span>
        {(['user', 'admin', 'superadmin'] as UserRole[]).map((role) => (
          <button
            key={role}
            onClick={() => setRoleMode(role)}
            className={`rounded px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase transition-all ${
              roleMode === role
                ? 'bg-amber-700 text-white'
                : 'text-amber-900 hover:bg-amber-200'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </header>
  );
}
