import { useState } from 'react';
import { motion } from 'motion/react';
import { Trophy, User as UserIcon, Lock, ArrowRight, Info } from 'lucide-react';

interface LoginViewProps {
  onLogin: (username: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
            <Trophy className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Portal Panitia PHBN</h1>
          <p className="text-slate-500 text-sm mt-1">Silakan masuk untuk mengelola lomba</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(username); }} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="text" 
                className="input-clean pl-12" 
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input 
                type="password" 
                className="input-clean pl-12" 
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary-clean w-full py-4 text-base mt-4">
            Masuk ke Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-2 p-4 bg-slate-50 rounded-2xl border border-slate-100">
            <Info className="w-4 h-4 text-slate-400 mt-0.5" />
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Aplikasi ini digunakan internal oleh panitia PHBN untuk mencatat skor dan hasil lomba 17 Agustus secara real-time.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
