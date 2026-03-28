import { Flag, PieChart, FileText, LogOut } from 'lucide-react';
import { User } from '../../types';
import { useAuth } from '@/src/context/AuthContext';
import { currentYear } from '@/src/lib/CurrentYear';

interface HeaderProps {
  user: User;
  seedData: () => void;
  handleExportAndReset: () => void;
}

export function Header({ user,  seedData, handleExportAndReset }: HeaderProps) {
  const { onLogout } = useAuth();

  const handleLogout = () => {
    onLogout();
  };


  return (
    <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <Flag className="text-white w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 leading-tight">Panitia PHBN</h2>
          <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Tahun {currentYear} • {user.username}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={seedData}
          className="flex items-center gap-2 px-3 py-2 text-indigo-600 hover:bg-indigo-50 transition-colors rounded-xl font-bold text-xs border border-indigo-100"
          title="Isi Data Demo (Dev Mode)"
        >
          <PieChart className="w-4 h-4" />
          <span className="hidden sm:inline">Fill Seeder</span>
        </button>
        <button 
          onClick={handleExportAndReset}
          className="flex items-center gap-2 px-3 py-2 text-orange-600 hover:bg-orange-50 transition-colors rounded-xl font-bold text-xs border border-orange-100"
          title="Selesaikan & Reset Data"
        >
          <FileText className="w-4 h-4" />
          <span className="hidden sm:inline">Tutup Kegiatan</span>
        </button>
        <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
