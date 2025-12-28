import React, { useState } from 'react';
import { AuthUser } from '../../types';
import { Button } from '../ui/Button';
import { Mail, Lock } from 'lucide-react';
import { supabase } from '../../services/supabase';

interface LoginScreenProps {
  onLogin: (user: AuthUser) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: email.split('@')[0],
            }
          }
        });
        if (error) throw error;
        alert('確認用メールを送信しました（設定されている場合）。サインインしてください。');
        setIsSignUp(false);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        // Auth state change in App.tsx will handle the rest
      }
    } catch (err: any) {
      setError(err.message || '認証に失敗しました');
    } finally {
      setIsLoading(false);
    }
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
          <div className="mt-4 inline-flex bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setIsSignUp(false)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${!isSignUp ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              ログイン
            </button>
            <button
              onClick={() => setIsSignUp(true)}
              className={`px-4 py-1.5 rounded-md text-sm font-bold transition ${isSignUp ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
              新規登録
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">メールアドレス</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                placeholder="example@email.com"
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
          </div>

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? '処理中...' : (isSignUp ? '新規登録' : 'ログイン')}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          <p>By using this app, you agree to our Terms and Privacy Policy.</p>
        </div>
      </div>
    </div>
  );
};