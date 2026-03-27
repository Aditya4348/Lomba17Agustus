import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, Medal } from 'lucide-react';

interface ConfirmModalProps {
  show: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({ show, title, message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 text-center mb-2">{title}</h4>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              {message}
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
              >
                Ya, Lanjutkan
              </button>
              <button
                onClick={onCancel}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Batalkan
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface BracketModalProps {
  show: boolean;
  maxParticipants: number;
  perMatchInput: number;
  setPerMatchInput: (val: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BracketModal({
  show,
  maxParticipants,
  perMatchInput,
  setPerMatchInput,
  onConfirm,
  onCancel
}: BracketModalProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-slate-100"
          >
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 mx-auto">
              <Medal className="w-8 h-8 text-indigo-500" />
            </div>
            <h4 className="text-xl font-bold text-slate-900 text-center mb-2">Generate Bagan</h4>
            <p className="text-slate-500 text-center text-sm mb-6 leading-relaxed">
              Tentukan jumlah peserta dalam satu pertandingan (grup).
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Jumlah per Grup</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="2"
                    max={maxParticipants}
                    value={perMatchInput}
                    onChange={(e) => setPerMatchInput(parseInt(e.target.value) || 0)}
                    className="input-clean pr-12"
                    placeholder="Contoh: 2 atau 4"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">
                    Orang
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 ml-1">
                  * Maksimal {maxParticipants} peserta (Total saat ini)
                </p>
              </div>

              {perMatchInput > maxParticipants && (
                <div className="p-3 bg-red-50 rounded-xl flex items-start gap-2 border border-red-100">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-red-600 font-medium">
                    Jumlah per grup tidak boleh melebihi total peserta ({maxParticipants}).
                  </p>
                </div>
              )}

              {perMatchInput < 2 && (
                <div className="p-3 bg-amber-50 rounded-xl flex items-start gap-2 border border-amber-100">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-600 font-medium">
                    Minimal 2 peserta per grup untuk membuat pertandingan.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={onConfirm}
                disabled={perMatchInput < 2 || perMatchInput > maxParticipants}
                className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
              >
                Buat Bagan Sekarang
              </button>
              <button
                onClick={onCancel}
                className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
              >
                Batal
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
