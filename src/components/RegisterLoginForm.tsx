import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface RegisterLoginFormProps {
  onAuthSuccess?: (user: any, role: string) => void;
}

function RegisterLoginForm({ onAuthSuccess }: RegisterLoginFormProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('di_token');
  });

  const handleLoginSuccess = (user: any, role: string) => {
    setToken(localStorage.getItem('di_token'));
    if (onAuthSuccess) {
      onAuthSuccess(user, role);
    }
  };

  const handleRegisterSuccess = (user: any) => {
    setToken(localStorage.getItem('di_token'));
    if (onAuthSuccess) {
      onAuthSuccess(user, 'user');
    }
  };

  const toggleMode = () => {
    setAuthMode(authMode === 'login' ? 'register' : 'login');
  };


  return (
    <>
      {authMode === 'login' ? (
        <LoginForm 
          onLoginSuccess={handleLoginSuccess}
          onToggleMode={toggleMode}
        />
      ) : (
        <RegisterForm 
          onRegisterSuccess={handleRegisterSuccess}
          onToggleMode={toggleMode}
        />
      )}
    </>
  );
}

export default RegisterLoginForm