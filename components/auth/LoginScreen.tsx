import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { Button } from '../ui/Button';
import { Mail, Lock } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Demo User Generation
      const demoUser: AuthUser = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email: email,
        name: email.split('@')[0] || 'Demo User',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      
      onLogin(demoUser);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-600 rounded-2xl text-white font-bold font-serif text-5xl italic mb-4 shadow-lg shadow-indigo-200">
            K
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ken-san</h1>
          <p className="text-slate-500 mt-2 font-medium">磨け己を、薙ぎ倒せ世界を</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="demo@example.com"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">パスワード</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="••••••••"
                required
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">※デモ版のため任意のパスワードでログインできます</p>
          </div>

          <Button 
            type="submit" 
            className="w-full mt-2" 
            disabled={isLoading}
          >
             {isLoading ? 'ログイン中...' : 'ログイン'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>By logging in, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};