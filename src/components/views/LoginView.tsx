import { useState } from "react";
import { motion } from "motion/react";
import { Trophy, User as UserIcon, Lock, ArrowRight, Info, Eye } from "lucide-react";

interface LoginViewProps {
  onLogin: (username: string) => void;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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
          <h1 className="text-2xl font-bold text-slate-900">
            Portal Panitia PHBN
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Silakan masuk untuk mengelola lomba
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onLogin(username);
          }}
          className="space-y-6"
        >
          {/* Username */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700">
              Username
            </label>

            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="text"
                placeholder="Masukkan username"
                className="input-clean"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="ml-1 text-sm font-semibold text-slate-700">
              Password
            </label>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                className="input-clean"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Eye 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 cursor-pointer" />
            </div>
          </div>

          {/* Button */}
          <button
            type="submit"
            className="btn-primary-clean mt-2 flex w-full items-center justify-center gap-2 py-4 text-base"
          >
            Masuk ke Dashboard
            <ArrowRight className="h-5 w-5" />
          </button>

          {/* Info */}
          <div className="flex items-start gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <Info className="mt-0.5 h-4 w-4 text-slate-400" />
            <p className="text-[11px] leading-relaxed text-slate-500">
              Aplikasi ini digunakan internal oleh panitia PHBN untuk mencatat
              skor dan hasil lomba 17 Agustus secara real-time.
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
