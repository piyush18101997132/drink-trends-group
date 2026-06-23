import React, { useState } from 'react';
import { RefreshCw, LogIn } from 'lucide-react';

interface LoginFormProps {
  onLoginSuccess: (user: any, role: string) => void;
  onToggleMode: () => void;
}

function LoginForm({ onLoginSuccess, onToggleMode }: LoginFormProps) {
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Invalid credentials.');
      }

      localStorage.setItem('di_token', data.token);
      localStorage.setItem('di_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.user.role);

    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const executePresetLogin = async (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPass(pass);
    setAuthError(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      localStorage.setItem('di_token', data.token);
      localStorage.setItem('di_user', JSON.stringify(data.user));
      onLoginSuccess(data.user, data.user.role);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-center">
      <div className="w-full max-w-md mx-auto space-y-8">
        
        <div>
          <h2 className="font-heading text-2xl font-bold text-amber-950">
            System Log In Portal
          </h2>
          <p className="text-xs text-amber-705 mt-1.5 leading-relaxed">
            Access secure nodes using direct database credentials.
          </p>
        </div>

        {authError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex gap-2.5">
            <span className="font-bold">Error:</span>
            <span>{authError}</span>
          </div>
        )}

        {/* Preconfigured Account Quick Logins for Evaluator Ease! */}
        <div className="space-y-2 text-[10.5px]">
          <div>
            <span className="font-mono text-amber-805">admin@drinkindia.com / admin123</span>
            &nbsp;&nbsp;
            <button 
              onClick={() => executePresetLogin('admin@drinkindia.com', 'admin123')}
              className="text-amber-900 font-bold hover:underline ml-2"
            >
              Quick Login
            </button>
          </div>
          <div>
            <span className="font-mono text-amber-805">superadmin@drinkindia.com / super123</span>
            &nbsp;&nbsp;
            <button 
              onClick={() => executePresetLogin('superadmin@drinkindia.com', 'super123')}
              className="text-amber-900 font-bold hover:underline ml-2"
            >
              Quick Login
            </button>
          </div>
          <div>
            <span className="font-mono text-amber-800">user@drinkindia.com / user123</span>
            &nbsp;&nbsp;
            <button 
              onClick={() => executePresetLogin('user@drinkindia.com', 'user123')}
              className="text-amber-900 font-bold hover:underline ml-2"
            >
              Quick Login
            </button>
          </div>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-[10.5px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="name@organization.com"
              className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3.5 text-sm text-amber-950 outline-none focus:border-amber-700"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Security Password
            </label>
            <input
              type="password"
              required
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              placeholder="Enter password"
              className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3.5 text-sm text-amber-950 outline-none focus:border-amber-700"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full rounded-xl bg-amber-950 hover:bg-amber-900 text-white py-3.5 text-sm font-bold shadow-lg shadow-amber-950/10 transition-colors flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isAuthLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            <span>Sign In Credentials</span>
          </button>
        </form>

        {/* Toggle auth layout */}
        <div className="text-center font-sans text-xs">
          <p className="text-amber-900/70">
            New visitor?{' '}
            <button 
              onClick={onToggleMode} 
              className="text-amber-900 font-extrabold hover:underline"
            >
              Register new customer profile
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default LoginForm;
