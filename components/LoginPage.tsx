
import React, { useState } from 'react';
import { User, Lock, ArrowRight, ShieldCheck, UserCircle } from 'lucide-react';
import { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulated network delay
    setTimeout(() => {
      if (username === 'admin' && password === 'admin123') {
        onLogin({ username: 'admin', role: 'admin', name: 'Administrator' });
      } else if (username === 'user' && password === 'user123') {
        onLogin({ username: 'user', role: 'user', name: 'Member' });
      } else {
        setError('Invalid username or password');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      
      {/* Cute Background Blobs - Warm Colors */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
         <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-highlight-light dark:bg-teal-900/30 rounded-full blur-[80px] opacity-60"></div>
         <div className="absolute bottom-[10%] right-[10%] w-64 h-64 bg-accent-light dark:bg-purple-900/30 rounded-full blur-[80px] opacity-60"></div>
      </div>

      <div className="bg-neutral-50 dark:bg-slate-900 w-full max-w-md p-10 rounded-[2.5rem] shadow-soft-lg border border-neutral-200 dark:border-slate-800 animate-fade-in-up relative z-10">
        
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-accent-DEFAULT rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-accent-DEFAULT/20 mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-300">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-800 dark:text-white tracking-tight font-heading">Welcome Back</h1>
          <p className="text-neutral-500 dark:text-slate-400 mt-2 font-medium">Sign in to your happy place</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-5">
            <div className="group">
              <label className="block text-xs font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 ml-2">Username</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent-DEFAULT transition-colors">
                  <User size={22} />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-slate-800 border-2 border-transparent focus:border-accent-DEFAULT hover:bg-neutral-200 dark:hover:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-neutral-800 dark:text-slate-100 outline-none transition-all font-semibold placeholder:text-neutral-300 dark:placeholder:text-slate-600"
                  placeholder="admin or user"
                />
              </div>
            </div>

            <div className="group">
              <label className="block text-xs font-bold text-neutral-400 dark:text-slate-500 uppercase tracking-wider mb-2.5 ml-2">Password</label>
              <div className="relative">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-accent-DEFAULT transition-colors">
                  <Lock size={22} />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-100 dark:bg-slate-800 border-2 border-transparent focus:border-accent-DEFAULT hover:bg-neutral-200 dark:hover:bg-slate-700 rounded-2xl py-4 pl-14 pr-6 text-neutral-800 dark:text-slate-100 outline-none transition-all font-semibold placeholder:text-neutral-300 dark:placeholder:text-slate-600"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-100 dark:border-red-800 rounded-2xl text-red-500 dark:text-red-300 text-sm text-center font-bold animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-neutral-800 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-bold text-lg hover:bg-neutral-700 dark:hover:bg-slate-200 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-neutral-200 dark:shadow-none"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-3 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Sign In <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-neutral-200 dark:border-slate-800">
           <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-neutral-100 dark:bg-slate-800/50 rounded-xl border border-neutral-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-neutral-400 uppercase mb-1">User Login</p>
                <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-neutral-200 dark:border-slate-700 font-mono text-neutral-600 dark:text-slate-400">user / user123</code>
              </div>
              <div className="p-3 bg-neutral-100 dark:bg-slate-800/50 rounded-xl border border-neutral-200 dark:border-slate-800">
                <p className="text-[10px] font-bold text-accent-DEFAULT uppercase mb-1">Admin Login</p>
                <code className="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-neutral-200 dark:border-slate-700 font-mono text-neutral-600 dark:text-slate-400">admin / admin123</code>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};
