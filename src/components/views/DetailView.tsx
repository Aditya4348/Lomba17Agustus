import { motion } from 'motion/react';
import { ChevronRight, Clock, MapPin, Settings, Users, Trash2, Flag, Plus, Trophy, Medal } from 'lucide-react';
import { Competition, RegCard } from '../../types';
import { cn } from '../../lib/utils';

interface DetailViewProps {
  selectedComp: Competition;
  setView: (view: 'list' | 'detail' | 'add' | 'register' | 'report') => void;
  updateCompetition: (comp: Competition) => void;
  deleteCompetition: (id: string) => void;
  setConfirmModal: (modal: any) => void;
  setRegCompId: (id: string) => void;
  setRegCards: (cards: RegCard[]) => void;
  setRegStatus: (status: any) => void;
  setBracketModal: (modal: any) => void;
  setPerMatchInput: (val: number) => void;
  setMatchWinner: (compId: string, roundIdx: number, matchIdx: number, winnerId: string) => void;
  resetBracket: (compId: string) => void;
}

export function DetailView({
  selectedComp,
  setView,
  updateCompetition,
  deleteCompetition,
  setConfirmModal,
  setRegCompId,
  setRegCards,
  setRegStatus,
  setBracketModal,
  setPerMatchInput,
  setMatchWinner,
  resetBracket
}: DetailViewProps) {
  return (
    <motion.div 
      key="detail"
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('list')}
          className="btn-secondary-clean py-2 px-4"
        >
          <ChevronRight className="w-5 h-5 rotate-180" /> Kembali
        </button>
        <button 
          onClick={() => {
            setConfirmModal({
              show: true,
              title: 'Hapus Lomba',
              message: 'Apakah Anda yakin ingin menghapus lomba ini? Semua data peserta dan bagan akan hilang selamanya.',
              onConfirm: () => {
                deleteCompetition(selectedComp.id);
                setView('list');
                setConfirmModal((prev: any) => ({ ...prev, show: false }));
              }
            });
          }}
          className="text-red-500 text-xs font-bold uppercase tracking-wider hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
        >
          Hapus Lomba
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="badge-clean status-ongoing">{selectedComp.category}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• ID: {selectedComp.id}</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-900">{selectedComp.name}</h3>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-slate-400" /> {selectedComp.time}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <MapPin className="w-4 h-4 text-slate-400" /> {selectedComp.location}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Status Control */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" /> Atur Status Lomba
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['pending', 'ongoing', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateCompetition({...selectedComp, status: status as any})}
                  className={cn(
                    "py-3 rounded-xl text-[11px] font-bold uppercase tracking-wider border transition-all",
                    selectedComp.status === status 
                      ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-300"
                  )}
                >
                  {status === 'pending' ? 'Menunggu' : status === 'ongoing' ? 'Aktif' : 'Selesai'}
                </button>
              ))}
            </div>
            <p className="helper-text italic">* Ubah status ke "Selesai" untuk menentukan pemenang.</p>
          </div>

          {/* Participants Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Daftar Peserta ({selectedComp.participants.length})
              </h5>
              <button 
                onClick={() => {
                  setRegCompId(selectedComp.id);
                  setRegCards([{ id: Math.random().toString(36).substr(2, 9), name: '', members: [''], rt: '', kelas: '', kategori: '' }]);
                  setView('register');
                  setRegStatus(null);
                }}
                className="text-xs font-bold text-primary bg-primary/5 px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
              >
                + Tambah Peserta
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedComp.participants.length > 0 ? (
                selectedComp.participants.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-bold text-slate-400 border border-slate-100 shadow-sm">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800">
                            {selectedComp.type === 'tim' ? `Tim: ${p.name}` : p.name}
                          </p>
                          {p.status === 'eliminated' && (
                            <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-black uppercase border border-red-100">Gugur</span>
                          )}
                        </div>
                        {p.members && (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                            Anggota: {Array.isArray(p.members) ? p.members.join(', ') : p.members}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-0.5">
                          {p.rt && <span className="text-[9px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-bold uppercase">RT {p.rt}</span>}
                          {p.kelas && <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase">{p.kelas}</span>}
                          {p.kategori && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">{p.kategori}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          setConfirmModal({
                            show: true,
                            title: 'Hapus Peserta',
                            message: `Apakah Anda yakin ingin menghapus ${p.name} dari lomba ini?`,
                            onConfirm: () => {
                              const newParticipants = selectedComp.participants.filter(part => part.id !== p.id);
                              updateCompetition({...selectedComp, participants: newParticipants});
                              setConfirmModal((prev: any) => ({ ...prev, show: false }));
                            }
                          });
                        }}
                        className="ml-2 p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 bg-slate-50/30 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400 italic">Belum ada peserta. Tambahkan peserta untuk mulai membuat bagan.</p>
                </div>
              )}
            </div>
          </div>

          {/* Bracket Management */}
          <div className="space-y-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h5 className="font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-5 h-5 text-indigo-500" />
                Bagan Pertandingan (Tournament)
              </h5>
              {!selectedComp.bracket ? (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => {
                      setBracketModal({
                        show: true,
                        compId: selectedComp.id,
                        maxParticipants: selectedComp.participants.length
                      });
                      setPerMatchInput(2);
                    }}
                    disabled={selectedComp.participants.length < 2}
                    className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Generate Bagan
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => resetBracket(selectedComp.id)}
                  className="text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Reset Bagan
                </button>
              )}
            </div>

            {selectedComp.bracket ? (
              <div className="space-y-8 overflow-x-auto pb-4">
                {selectedComp.bracket.rounds.map((round, rIdx) => (
                  <div key={rIdx} className="space-y-4 min-w-[300px]">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
                        {round.name}
                      </span>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {round.matches.map((match, mIdx) => (
                        <div key={match.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                          <div className="bg-slate-900 px-4 py-2 flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Match {mIdx + 1}</span>
                            {match.winnerId && (
                              <span className="text-[9px] bg-yellow-400 text-black px-2 py-0.5 rounded-full font-black uppercase flex items-center gap-1">
                                <Trophy className="w-2.5 h-2.5" /> Selesai
                              </span>
                            )}
                          </div>
                          <div className="p-3 space-y-2">
                            {match.participantIds.map(pId => {
                              const p = selectedComp.participants.find(part => part.id === pId);
                              const isWinner = match.winnerId === pId;
                              return (
                                <div 
                                  key={pId} 
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border transition-all",
                                    isWinner 
                                      ? "bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200" 
                                      : match.winnerId 
                                        ? "bg-slate-50 border-slate-100 opacity-60" 
                                        : "bg-white border-slate-100 hover:border-slate-200"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs",
                                      isWinner ? "bg-yellow-400 text-black" : "bg-slate-100 text-slate-400"
                                    )}>
                                      {p?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold text-slate-800">
                                          {selectedComp.type === 'tim' ? `Tim: ${p?.name}` : p?.name}
                                        </p>
                                        {p?.status === 'eliminated' && (
                                          <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded font-black uppercase border border-red-100">Gugur</span>
                                        )}
                                      </div>
                                      <p className="text-[9px] text-slate-400 font-medium uppercase">RT {p?.rt} • {p?.kelas}</p>
                                    </div>
                                  </div>
                                  
                                  {!match.winnerId && (
                                    <button 
                                      onClick={() => setMatchWinner(selectedComp.id, rIdx, mIdx, pId)}
                                      className="text-[10px] font-bold text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 transition-all active:scale-95"
                                    >
                                      Menang
                                    </button>
                                  )}
                                  {isWinner && <Trophy className="w-4 h-4 text-yellow-500" />}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                <Flag className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm text-slate-400 italic max-w-[200px] mx-auto">
                  Klik "Generate Bagan" untuk membagi peserta ke dalam grup pertandingan.
                </p>
              </div>
            )}
          </div>

          {/* Winners Selection - Professional Podium */}
          {selectedComp.status === 'completed' && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 shadow-xl"
            >
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <Medal className="w-6 h-6 text-yellow-400" />
                <h5 className="text-xl font-bold">Penentuan Pemenang</h5>
              </div>
              
              <div className="space-y-4">
                {[
                  { rank: 1, label: 'Juara 1', color: 'text-yellow-400', key: 'first' },
                  { rank: 2, label: 'Juara 2', color: 'text-slate-300', key: 'second' },
                  { rank: 3, label: 'Juara 3', color: 'text-amber-600', key: 'third' }
                ].map((winner) => (
                  <div key={winner.rank} className="flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-xl border-2 border-white/10 flex items-center justify-center font-bold text-lg", winner.color)}>
                      {winner.rank}
                    </div>
                    <div className="flex-1">
                      <select 
                        value={(selectedComp.winners as any)?.[winner.key] || ''}
                        onChange={(e) => updateCompetition({
                          ...selectedComp, 
                          winners: { ...selectedComp.winners, [winner.key]: e.target.value }
                        })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-white/30 transition-all text-white appearance-none"
                      >
                        <option value="" className="bg-slate-900">Pilih {winner.label}</option>
                        {selectedComp.participants.map(p => <option key={p.id} value={p.name} className="bg-slate-900">{p.name}</option>)}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-white/40 italic text-center uppercase tracking-widest">Data pemenang akan disimpan dalam laporan akhir</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
