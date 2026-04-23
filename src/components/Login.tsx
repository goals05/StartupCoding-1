import React, { useState } from 'react';
import { Zap, Mail, Lock, ArrowRight, Github, Chrome } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (email: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: loginError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          // AI Studio iframe environment might block popups. 
          // Suggesting "Open in new tab" if it fails.
          redirectTo: window.location.origin,
        }
      });
      
      if (loginError) throw loginError;
    } catch (err: any) {
      console.error(err);
      setError(`${provider === 'google' ? '구글' : '깃허브'} 로그인에 실패했습니다. 브라우저 팝업 설정을 확인하거나 상단의 "새 창에서 열기" 버튼을 사용해 주세요.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;
    } catch (err: any) {
      console.error(err);
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-blue-200 mb-6 rotate-3">
            <Zap size={36} className="text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-gray-900 mb-2">
            More than <span className="text-blue-600">Line</span>
          </h1>
          <p className="text-gray-500 font-medium">데이터로 그리는 당신의 스마트한 여정</p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100">
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl font-medium flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">이메일</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">비밀번호</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input 
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none text-gray-900"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full py-4 bg-blue-600 text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300",
                isLoading && "opacity-70 cursor-wait"
              )}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>로그인 <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px bg-gray-100 flex-1" />
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">or login with</span>
            <div className="h-px bg-gray-100 flex-1" />
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button 
              type="button"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
            >
              <Github size={20} /> GitHub
            </button>
            <button 
              type="button"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors font-semibold text-gray-700"
            >
              <Chrome size={20} /> Google
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <p className="text-center text-sm text-gray-500">
          계정정보: goals0509@gmail.com
        </p>
      </motion.div>
    </div>
  );
}
