import { LayoutDashboard, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomNavProps {
  view: string;
  setView: (view: 'list' | 'detail' | 'add' | 'register' | 'report') => void;
  handleEnterRegister: () => void;
}

export function BottomNav({ view, setView, handleEnterRegister }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-around z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
      <button 
        onClick={() => setView('list')}
        className={cn(
          "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
          view === 'list' ? "text-primary" : "text-slate-400"
        )}
      >
        <LayoutDashboard className={cn("w-6 h-6", view === 'list' ? "fill-primary/10" : "")} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Dashboard</span>
      </button>
      <button 
        onClick={handleEnterRegister}
        className={cn(
          "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
          view === 'register' ? "text-primary" : "text-slate-400"
        )}
      >
        <Users className={cn("w-6 h-6", view === 'register' ? "fill-primary/10" : "")} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Pendaftaran</span>
      </button>
      <button 
        onClick={() => setView('report')}
        className={cn(
          "flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all",
          view === 'report' ? "text-primary" : "text-slate-400"
        )}
      >
        <CheckCircle2 className={cn("w-6 h-6", view === 'report' ? "fill-primary/10" : "")} />
        <span className="text-[10px] font-bold uppercase tracking-wider">Laporan</span>
      </button>
    </nav>
  );
}
