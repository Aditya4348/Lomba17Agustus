import { FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Plus, Minus, CheckCircle2, AlertCircle } from 'lucide-react';
import { Competition, RegCard } from '../../types';
import { cn } from '../../lib/utils';

interface RegisterViewProps {
  competitions: Competition[];
  regCompId: string;
  setRegCompId: (id: string) => void;
  regCards: RegCard[];
  addRegCard: () => void;
  removeRegCard: (id: string) => void;
  updateRegCard: (id: string, updates: Partial<RegCard>) => void;
  handleSaveRegistration: (e: FormEvent) => void;
  regStatus: { type: 'success' | 'error', msg: string } | null;
  lastRegistered: { name: string, compName: string }[];
}

export function RegisterView({
  competitions,
  regCompId,
  setRegCompId,
  regCards,
  addRegCard,
  removeRegCard,
  updateRegCard,
  handleSaveRegistration,
  regStatus,
  lastRegistered
}: RegisterViewProps) {
  return (
    <motion.div 
      key="register"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6 pb-24"
    >
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-slate-900">Pendaftaran Peserta</h3>
        <p className="text-sm text-slate-500">Mode kartu dengan fitur Auto-Fill (Sticky Data).</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Pilih Lomba</label>
            <select 
              value={regCompId}
              onChange={(e) => setRegCompId(e.target.value)}
              className="input-clean bg-slate-50 border-transparent font-bold text-primary h-12"
              required
            >
              <option value="">-- Pilih Lomba --</option>
              {competitions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status === 'ongoing' ? 'AKTIF' : 'PENDING'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {regCards.map((card, index) => (
              <motion.div 
                key={card.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm relative group"
              >
                <div className="absolute -top-2 -left-2 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-lg z-10">
                  {index + 1}
                </div>
                
                {regCards.length > 1 && (
                  <button 
                    onClick={() => removeRegCard(card.id)}
                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}

                <div className="space-y-4 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
                      {competitions.find(c => c.id === regCompId)?.type === 'tim' ? 'Nama Tim' : 'Nama Peserta'}
                    </label>
                    <input 
                      autoFocus={index === regCards.length - 1}
                      value={card.name}
                      onChange={(e) => updateRegCard(card.id, { name: e.target.value })}
                      className="input-clean h-12 text-base font-bold"
                      placeholder={competitions.find(c => c.id === regCompId)?.type === 'tim' ? "Ketik Nama Tim..." : "Ketik Nama..."}
                    />
                  </div>

                  {competitions.find(c => c.id === regCompId)?.type === 'tim' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Anggota Tim</label>
                      <div className="space-y-2">
                        {card.members.map((member, mIndex) => (
                          <div key={mIndex} className="flex gap-2">
                            <input 
                              value={member}
                              onChange={(e) => {
                                const newMembers = [...card.members];
                                newMembers[mIndex] = e.target.value;
                                updateRegCard(card.id, { members: newMembers });
                              }}
                              className="input-clean h-10 text-sm flex-1"
                              placeholder={`Anggota ${mIndex + 1}`}
                            />
                            <div className="flex gap-1">
                              {card.members.length > 1 && (
                                <button 
                                  type="button"
                                  onClick={() => {
                                    const newMembers = card.members.filter((_, i) => i !== mIndex);
                                    updateRegCard(card.id, { members: newMembers });
                                  }}
                                  className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                              )}
                              {mIndex === card.members.length - 1 && (
                                <button 
                                  type="button"
                                  onClick={() => updateRegCard(card.id, { members: [...card.members, ''] })}
                                  className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-xl hover:bg-primary/20 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">RT</label>
                      <input 
                        value={card.rt}
                        onChange={(e) => updateRegCard(card.id, { rt: e.target.value })}
                        className="input-clean h-10 text-sm"
                        placeholder="Contoh: 01"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kelas</label>
                      <input 
                        value={card.kelas}
                        onChange={(e) => updateRegCard(card.id, { kelas: e.target.value })}
                        className="input-clean h-10 text-sm"
                        placeholder="Contoh: 5 SD"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Kategori Lomba</label>
                    <div className="flex flex-wrap gap-2">
                      {['Anak', 'Remaja', 'Dewasa', 'Umum'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => updateRegCard(card.id, { kategori: cat })}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                            card.kategori === cat 
                              ? "bg-primary text-white border-primary shadow-md shadow-primary/20" 
                              : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          <button 
            onClick={addRegCard}
            className="w-full py-4 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 font-bold text-sm hover:border-primary hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Tambah Peserta Lain
          </button>
        </div>

        <div className="pt-4 space-y-4">
          <AnimatePresence>
            {regStatus && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-4 rounded-2xl text-xs font-bold flex items-center gap-3",
                  regStatus.type === 'success' ? "bg-green-50 text-green-600 border border-green-100" : "bg-red-50 text-red-600 border border-red-100"
                )}
              >
                {regStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                {regStatus.msg}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            onClick={handleSaveRegistration}
            className="btn-primary-clean w-full py-5 text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
          >
            <CheckCircle2 className="w-6 h-6" />
            Simpan Semua Peserta
          </button>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-700 ml-1">Pendaftaran Terakhir</h4>
        <div className="space-y-2">
          {lastRegistered.length > 0 ? (
            lastRegistered.map((reg, i) => (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={i} 
                className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{reg.name}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">{reg.compName}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-300 uppercase">Baru Saja</span>
              </motion.div>
            ))
          ) : (
            <p className="text-center py-8 text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              Belum ada pendaftaran di sesi ini.
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
