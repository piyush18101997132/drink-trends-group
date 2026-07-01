import React, { useState } from 'react';
import { RefreshCw, Lock } from 'lucide-react';

interface RegisterFormProps {
  onRegisterSuccess: (user: any) => void;
  onToggleMode: () => void;
}

function RegisterForm({ onRegisterSuccess, onToggleMode }: RegisterFormProps) {
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setSuccessMessage(null);
    setIsAuthLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPass })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Registration details rejected.');
      }

      localStorage.setItem('di_token', data.token);
      localStorage.setItem('di_user', JSON.stringify(data.user));
      
      // Show success message
      setSuccessMessage('Account created successfully! Redirecting to login...');
      onRegisterSuccess(data.user);
      
      // Navigate to login after 2 seconds
      setTimeout(() => {
        onToggleMode();
      }, 2000);

    } catch (err: any) {
      setAuthError(err.message || 'Failed to register account.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-white p-8 sm:p-12 md:p-16 flex flex-col justify-center">
      <div className="w-full max-w-md mx-auto space-y-8">
        
        <div>
          <h2 className="font-heading text-2xl font-bold text-amber-950">
            Register Customer Account
          </h2>
          <p className="text-xs text-amber-705 mt-1.5 leading-relaxed">
            Establish a new shopper profile in the regional database.
          </p>
        </div>

        {authError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-red-800 flex gap-2.5">
            <span className="font-bold">Error:</span>
            <span>{authError}</span>
          </div>
        )}

        {successMessage && (
          <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-xs text-green-800 flex gap-2.5">
            <span className="font-bold">Success:</span>
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleRegisterSubmit} className="space-y-4">
          <div>
            <label className="block text-[10.5px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Your Name
            </label>
            <input
              type="text"
              required
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
              placeholder="e.g. Rahul Sen"
              className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3.5 text-sm text-amber-950 outline-none focus:border-amber-700"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3.5 text-sm text-amber-950 outline-none focus:border-amber-700"
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-bold text-amber-900 uppercase tracking-wider mb-1">
              Establish Password
            </label>
            <input
              type="password"
              required
              value={regPass}
              onChange={(e) => setRegPass(e.target.value)}
              placeholder="Choose password"
              className="w-full rounded-xl border border-amber-900/15 py-2.5 px-3.5 text-sm text-amber-950 outline-none focus:border-amber-700"
            />
          </div>

          <button
            type="submit"
            disabled={isAuthLoading}
            className="w-full rounded-xl bg-amber-950 hover:bg-amber-900 text-white py-3.5 text-sm font-bold shadow-lg shadow-amber-950/10 transition-colors flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-60"
          >
            {isAuthLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            <span>Establish Customer Hub Account</span>
          </button>
        </form>

        {/* Toggle auth layout */}
        <div className="text-center font-sans text-xs">
          <p className="text-amber-900/70">
            Registered customer?{' '}
            <button 
              onClick={onToggleMode} 
              className="text-amber-900 font-extrabold hover:underline"
            >
              Log back into security portal
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}

export default RegisterForm;
