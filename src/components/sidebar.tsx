import React, { useState } from 'react';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard,
  Users,
  BarChart2,
  FileText,
  Settings,
  LogOut,
  ShoppingCart,
  Package,
  Inbox,
} from 'lucide-react';
import './sidebar.css';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Inbox, label: 'Inbox', badge: 4 },
  { icon: Users, label: 'Users' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: Package, label: 'Products' },
  { icon: BarChart2, label: 'Analytics' },
  { icon: FileText, label: 'Reports' },
  { icon: Settings, label: 'Settings' },
];

const Sidebar = () => {
  const { sidebarOpen } = useSidebar();
  const [activeItem, setActiveItem] = useState(NAV_ITEMS[0]?.label ?? '');

  return (
    <aside className={`sidebar-container ${sidebarOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-scroll">
        <div className="sidebar-section-label">Main Menu</div>

        <ul className="sidebar-nav-list">
          {NAV_ITEMS.map(({ icon: Icon, label, badge }) => {
            const isActive = activeItem === label;
            return (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => setActiveItem(label)}
                  className={`sidebar-item-button ${isActive ? 'active' : ''}`}
                >
                  <Icon className="sidebar-item-icon" size={16} />
                  <span className="sidebar-item-text">{label}</span>
                  {badge && (
                    <span className="badge rounded-pill sidebar-badge">{badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        <hr className="sidebar-divider" />

        <div className="sidebar-help-block">
          <div className="sidebar-help-card">
            <div className="sidebar-help-title">Need help?</div>
            <div className="sidebar-help-copy">
              Check our docs or reach out to support.
            </div>
            <button type="button" className="btn btn-sm w-100 sidebar-docs-button">
              View Docs
            </button>
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <img
          src="https://i.pravatar.cc/32?img=47"
          alt="User"
          className="sidebar-avatar"
        />
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">Alex Monroe</div>
          <div className="sidebar-user-role">Admin</div>
        </div>
        <button type="button" className="sidebar-signout-button" title="Sign out">
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
