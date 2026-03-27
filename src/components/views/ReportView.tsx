import { motion } from 'motion/react';
import { ChevronRight, Trophy, CheckCircle2, Users, BarChart3, Medal, Flag, PieChart } from 'lucide-react';
import { Competition } from '../../types';

interface ReportViewProps {
  competitions: Competition[];
  setView: (view: 'list' | 'detail' | 'add' | 'register' | 'report') => void;
}

export function ReportView({ competitions, setView }: ReportViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="flex items-center gap-4 mb-2">
        <button 
          onClick={() => setView('list')}
          className="btn-secondary-clean py-2 px-4"
        >
          <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
        </button>
        <h3 className="text-xl font-bold text-slate-900">Laporan PHBN</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{competitions.length}</div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Lomba</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {competitions.filter(c => c.status === 'completed').length}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lomba Selesai</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {competitions.reduce((acc, c) => acc + c.participants.length, 0)}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Peserta</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {competitions.filter(c => c.status === 'ongoing').length}
          </div>
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lomba Berjalan</div>
        </div>
      </div>

      {/* Winners List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h4 className="text-lg font-black text-slate-900">Daftar Pemenang</h4>
            <p className="text-sm text-slate-400 font-medium">Hasil akhir lomba yang telah selesai</p>
          </div>
          <Medal className="w-8 h-8 text-amber-400" />
        </div>
        <div className="divide-y divide-slate-50">
          {competitions.filter(c => c.status === 'completed').length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                <Flag className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-400 font-bold">Belum ada lomba yang selesai</p>
            </div>
          ) : (
            competitions
              .filter(c => c.status === 'completed')
              .map(comp => (
                <div key={comp.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                      {comp.category}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{comp.name}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100/50">
                      <div className="text-[10px] font-black text-amber-600 uppercase tracking-tighter mb-1">Juara 1</div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {comp.winners?.first || '-'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/50">
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-tighter mb-1">Juara 2</div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {comp.winners?.second || '-'}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-2xl border border-orange-100/50">
                      <div className="text-[10px] font-black text-orange-600 uppercase tracking-tighter mb-1">Juara 3</div>
                      <div className="text-sm font-bold text-slate-900 truncate">
                        {comp.winners?.third || '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Participation by RT (Simple Table) */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-3 mb-6">
          <PieChart className="w-6 h-6 text-indigo-500" />
          <h4 className="text-lg font-black text-slate-900">Partisipasi RT</h4>
        </div>
        <div className="space-y-4">
          {Array.from(new Set(competitions.flatMap(c => c.participants.map(p => p.rt)).filter(Boolean))).sort().map(rt => {
            const count = competitions.reduce((acc, c) => acc + c.participants.filter(p => p.rt === rt).length, 0);
            return (
              <div key={rt} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <span className="font-bold text-slate-700">RT {rt}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-indigo-600">{count}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Peserta</span>
                </div>
              </div>
            );
          })}
          {competitions.every(c => c.participants.length === 0) && (
            <p className="text-center text-slate-400 py-4 italic">Belum ada data peserta</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
