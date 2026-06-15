import React, { useState, useMemo } from 'react';
import { ShieldAlert, Users, ToggleLeft, ToggleRight, Sliders, Shield, Terminal, Search, AlertCircle, Ban, CheckCircle, RefreshCw, KeyRound, Radio } from 'lucide-react';
import { User, AuditLog, SystemSettings } from '../types';

interface SuperadminDashboardProps {
  users: User[];
  logs: AuditLog[];
  settings: SystemSettings;
  onUpdateUserRole: (id: number, role: User['role']) => Promise<void>;
  onUpdateUserStatus: (id: number, status: User['status']) => Promise<void>;
  onUpdateSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  isProcessing: boolean;
  dbStatus: { connected: boolean; mode: string; host: string };
}

export default function SuperadminDashboard({
  users,
  logs,
  settings,
  onUpdateUserRole,
  onUpdateUserStatus,
  onUpdateSettings,
  isProcessing,
  dbStatus
}: SuperadminDashboardProps) {

  // Active category: 'settings' | 'users' | 'audit' | 'db'
  const [subTab, setSubTab] = useState<'settings' | 'users' | 'audit' | 'db'>('settings');

  // Search parameters for logs and users
  const [logSearch, setLogSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchText = log.userName.toLowerCase().includes(logSearch.toLowerCase()) ||
                        log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                        log.details.toLowerCase().includes(logSearch.toLowerCase());
      return matchText;
    });
  }, [logs, logSearch]);

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchText = u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.role.toLowerCase().includes(userSearch.toLowerCase());
      return matchText;
    });
  }, [users, userSearch]);

  const handleToggleStore = () => {
    onUpdateSettings({ storeOpen: !settings.storeOpen });
  };

  const handleToggleMaintenance = () => {
    onUpdateSettings({ maintenanceMode: !settings.maintenanceMode });
  };

  const handleToggleRewards = () => {
    onUpdateSettings({ enableRewards: !settings.enableRewards });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-amber-900/10 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-red-100 p-1.5 text-red-800">
              <Shield className="h-5 w-5 animate-pulse" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-amber-950 sm:text-3xl">System Cockpit (Superadmin)</h2>
          </div>
          <p className="text-xs text-amber-900/70 mt-1">Platform-wide policy structures, administrative promotions, database synchronizations, and system security logs.</p>
        </div>

        {/* Global Action Status */}
        {isProcessing && (
          <div className="flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-1.5 font-mono text-xs text-red-900">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-red-800" />
            <span>Updating Platform Security Policies...</span>
          </div>
        )}
      </div>

      {/* SUB TAB LAYOUT */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 bg-amber-100/50 p-1 rounded-2xl border border-amber-900/5">
        <button
          onClick={() => setSubTab('settings')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'settings'
              ? 'bg-amber-900 text-white shadow'
              : 'text-amber-950 hover:bg-amber-200/55'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>Operational Rules</span>
        </button>

        <button
          onClick={() => setSubTab('users')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'users'
              ? 'bg-amber-900 text-white shadow'
              : 'text-amber-950 hover:bg-amber-200/55'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Access Control ({users.length})</span>
        </button>

        <button
          onClick={() => setSubTab('audit')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'audit'
              ? 'bg-amber-900 text-white shadow'
              : 'text-amber-950 hover:bg-amber-200/55'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Audit Log Tracks ({logs.length})</span>
        </button>

        <button
          onClick={() => setSubTab('db')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            subTab === 'db'
              ? 'bg-amber-900 text-white shadow'
              : 'text-amber-950 hover:bg-amber-200/55'
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>Database Integrity</span>
        </button>
      </div>

      {/* SUB TAB 1: SYSTEM SETTINGS POLICY FORM */}
      {subTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Operations toggles card */}
          <div className="lg:col-span-2 rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-heading font-bold text-amber-950 text-base border-b border-amber-900/5 pb-3">Administrative Directives</h3>
            
            <div className="divide-y divide-amber-900/5">
              {/* Directive 1: Store opened state */}
              <div className="flex items-center justify-between py-4">
                <div className="max-w-md">
                  <p className="text-sm font-bold text-amber-950">Storefront Dispatching Policy</p>
                  <p className="text-xs text-amber-900/70 mt-0.5">Controls if customers are permitted to add products and place checkouts.</p>
                </div>
                <button onClick={handleToggleStore} className="text-amber-800 transition-colors cursor-pointer">
                  {settings.storeOpen ? <ToggleRight className="h-10 w-10 text-emerald-600" /> : <ToggleLeft className="h-10 w-10 text-gray-400" />}
                </button>
              </div>

              {/* Directive 2: Maintenance block */}
              <div className="flex items-center justify-between py-4">
                <div className="max-w-md">
                  <p className="text-sm font-bold text-amber-950">Development Maintenance Lock</p>
                  <p className="text-xs text-amber-900/70 mt-0.5">Locks catalog changes and triggers safety overlays across administrative portals.</p>
                </div>
                <button onClick={handleToggleMaintenance} className="text-amber-800 transition-colors cursor-pointer">
                  {settings.maintenanceMode ? <ToggleRight className="h-10 w-10 text-red-600" /> : <ToggleLeft className="h-10 w-10 text-gray-400" />}
                </button>
              </div>

              {/* Directive 3: rewards loyalty systems */}
              <div className="flex items-center justify-between py-4">
                <div className="max-w-md">
                  <p className="text-sm font-bold text-amber-950">Customer Loyalty Rewards</p>
                  <p className="text-xs text-amber-900/70 mt-0.5">Enables calculated coin rewards back to registered buyer profile models.</p>
                </div>
                <button onClick={handleToggleRewards} className="text-amber-800 transition-colors cursor-pointer">
                  {settings.enableRewards ? <ToggleRight className="h-10 w-10 text-emerald-600" /> : <ToggleLeft className="h-10 w-10 text-gray-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Numeric ranges adjustments */}
          <div className="lg:col-span-1 rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm space-y-6">
            <h3 className="font-heading font-bold text-amber-950 text-base border-b border-amber-900/5 pb-3">Financial Configs</h3>
            
            {/* Range 1: Tax GST rate */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
                <span className="text-amber-950">India GST Tax Standard</span>
                <span className="font-mono text-amber-900 font-bold">{Math.round(settings.taxRate * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.28" // max GST in india is 28%
                step="0.01"
                value={settings.taxRate}
                onChange={(e) => onUpdateSettings({ taxRate: Number(e.target.value) })}
                className="w-full h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-700"
              />
              <p className="text-[10px] text-amber-700/60 mt-1 leading-normal">Typically 18% standard rate on packaged yogurt and milk preparations.</p>
            </div>

            {/* Range 2: Minimum checkout value */}
            <div>
              <div className="flex justify-between items-center mb-1.5 text-xs font-semibold">
                <span className="text-amber-950">Min Cart Limit (₹)</span>
                <span className="font-mono text-amber-900 font-bold">₹{settings.minOrderValue}</span>
              </div>
              <input
                type="range"
                min="50"
                max="300"
                step="25"
                value={settings.minOrderValue}
                onChange={(e) => onUpdateSettings({ minOrderValue: Number(e.target.value) })}
                className="w-full h-1 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-700"
              />
              <p className="text-[10px] text-amber-700/60 mt-1 leading-normal">Forces bulk shipments so thermal logistics remain highly cost-efficient.</p>
            </div>

          </div>

        </div>
      )}

      {/* SUB TAB 2: ACCESS CONTROL ROLES MANAGER */}
      {subTab === 'users' && (
        <div className="rounded-2xl border border-amber-900/10 bg-white shadow-sm overflow-hidden space-y-4 p-5">
          {/* Header search bar */}
          <div className="flex justify-between items-center max-w-sm">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600/70">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Find users by email or role..."
                className="w-full rounded-xl border border-amber-900/15 py-1.5 pl-9 pr-4 text-xs text-amber-950 outline-none focus:border-amber-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-amber-100/40 border-b border-amber-900/10 text-[10px] font-bold uppercase tracking-wider text-amber-900 font-mono">
                  <th className="py-3 px-6">System Identity</th>
                  <th className="py-3 px-6">Email Address</th>
                  <th className="py-3 px-6">Current Privilege</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Access Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-900/5 text-xs text-amber-950">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-amber-50/20 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-amber-600" />
                        <span className="font-bold">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6 font-mono text-amber-900">{u.email}</td>
                    <td className="py-3.5 px-6">
                      <span className={`rounded px-2 py-0.5 font-mono text-[9px] uppercase font-bold tracking-wider ${
                        u.role === 'superadmin' ? 'bg-red-50 text-red-750 border border-red-200' :
                        u.role === 'admin' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-sans text-[10px] font-semibold leading-5 ${
                        u.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {u.status === 'active' ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex justify-end gap-2.5">
                        
                        <div className="flex items-center gap-1 bg-amber-50 rounded-lg p-0.5 border border-amber-900/10">
                          {(['user', 'admin', 'superadmin'] as User['role'][]).map((r) => (
                            <button
                              key={r}
                              disabled={u.role === 'superadmin' && r !== 'superadmin'} // protect superadmin account levels
                              onClick={() => {
                                if (confirm(`Enact promotional transition of ${u.name} to ${r.toUpperCase()} level security?`)) {
                                  onUpdateUserRole(u.id, r);
                                }
                              }}
                              className={`rounded text-[8.5px] font-bold uppercase py-0.5 px-1.5 transition-all cursor-pointer ${
                                u.role === r
                                  ? 'bg-amber-900 text-white'
                                  : 'text-amber-900 hover:bg-amber-100 disabled:opacity-40'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>

                        {/* Ban Suspended state toggler */}
                        <button
                          onClick={() => {
                            const nextState = u.status === 'active' ? 'suspended' : 'active';
                            if (confirm(`Confirm status alteration of account ${u.email} to ${nextState.toUpperCase()} status?`)) {
                              onUpdateUserStatus(u.id, nextState);
                            }
                          }}
                          className={`rounded-lg px-2 py-1 text-[9.5px] font-bold border transition-colors cursor-pointer ${
                            u.status === 'active'
                              ? 'border-red-200 hover:bg-red-50 text-red-700'
                              : 'border-emerald-200 hover:bg-emerald-50 text-emerald-800'
                          }`}
                        >
                          {u.status === 'active' ? 'Suspend' : 'Unsuspend'}
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

      {/* SUB TAB 3: IMMERSIVE SECURITY AUDIT LOGS */}
      {subTab === 'audit' && (
        <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-heading font-bold text-amber-950 text-base">Platform Activity Trails</h3>
              <p className="text-xs text-amber-700/60 mt-0.5">Chronological sequencing of system states and checkout operations.</p>
            </div>

            {/* Logs search bar */}
            <div className="relative w-full max-w-xs">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-amber-600/70">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filter logs by operator or keywords..."
                className="w-full rounded-xl border border-amber-900/15 py-1.5 pl-9 pr-4 text-xs text-amber-950 outline-none focus:border-amber-700"
              />
            </div>
          </div>

          {/* Log blocks shell */}
          <div className="rounded-xl bg-amber-950 text-stone-300 p-4 font-mono text-[11px] leading-relaxed max-h-[460px] overflow-y-auto space-y-2.5 shadow-inner">
            <div className="text-stone-500 border-b border-white/5 pb-2 border-dashed mb-2 flex justify-between items-center text-[10px]">
              <span>[OPERATIONAL SYSTEM LOGSTREAM - ACTIVE OVERWATCH ON]</span>
              <span className="animate-pulse flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                SECURE RECORDING
              </span>
            </div>

            {filteredLogs.length === 0 ? (
              <p className="text-center text-stone-500 py-12">No registered activities correlate with active filters.</p>
            ) : (
              filteredLogs.map((lg) => {
                const isSystem = lg.userRole === 'superadmin';
                const isMod = lg.userRole === 'admin';

                return (
                  <div key={lg.id} className="border-b border-white/5 pb-2 hover:bg-white/5 transition-colors duration-150 px-2 rounded">
                    <div className="flex flex-wrap justify-between items-center text-[10px] text-stone-400 mb-1">
                      <span>[{new Date(lg.timestamp).toISOString()}] • {lg.ipAddress}</span>
                      <span className={`font-bold ${isSystem ? 'text-rose-400' : isMod ? 'text-amber-400' : 'text-blue-400'}`}>
                        {lg.userRole.toUpperCase()} : {lg.userName}
                      </span>
                    </div>
                    <p className="font-semibold text-white">
                      &gt; {lg.action}
                    </p>
                    <p className="text-stone-400 text-[10.5px] mt-0.5 ml-3">
                      {lg.details}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SUB TAB 4: DATABASE SYNCHRONIZATION INTEGRITY */}
      {subTab === 'db' && (
        <div className="rounded-2xl border border-amber-900/10 bg-white p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <KeyRound className="h-9 w-9 text-amber-800" />
            <div>
              <h3 className="font-heading font-bold text-amber-950 text-base">Backend Connection Diagnostics</h3>
              <p className="text-xs text-amber-700/60 mt-0.5">Configuration mapping and pipeline performance testing details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            
            {/* Status overview */}
            <div className="rounded-xl bg-amber-50/40 border border-amber-950/5 p-4 space-y-3">
              <h4 className="font-mono text-xs font-bold text-amber-900 uppercase">Operational Context</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between border-b border-amber-950/5 pb-1">
                  <span className="text-amber-900/70">Registry Status:</span>
                  <span className={`font-bold ${dbStatus.connected ? 'text-emerald-700' : 'text-amber-800'}`}>
                    {dbStatus.connected ? 'ACTIVE MYSQL CONNECTION' : 'SANDBOX SIMULATOR FALLBACK'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-amber-950/5 pb-1">
                  <span className="text-amber-900/70">Database Driver Engine:</span>
                  <span className="font-mono">{dbStatus.mode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-900/70">Database Endpoint Target:</span>
                  <span className="font-mono font-semibold">{dbStatus.host}</span>
                </div>
              </div>
            </div>

            {/* Diagnostic helper tips */}
            <div className="rounded-xl bg-amber-50/40 border border-amber-950/5 p-4 space-y-3.5">
              <h4 className="font-mono text-xs font-bold text-amber-900 uppercase">Infrastructure Mapping Guidance</h4>
              <p className="text-xs text-amber-950 leading-relaxed">
                Platform-wide parameters map immediately to physical system deployments. When standard configurations are passed inside container credentials, Express switches connectivity seamlessly, ensuring true <strong>enterprise architectural scalability</strong>.
              </p>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-white/70 border border-amber-900/5 p-1.5 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-700" />
                <span>Zero service downtime during database connection changes.</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
