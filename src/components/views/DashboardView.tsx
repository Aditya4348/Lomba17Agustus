import { motion } from "motion/react";
import {
  HelpCircle,
  X,
  Search,
  Plus,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { currentYear } from "@/src/lib/CurrentYear";
import { useCompetition } from "@/src/context/CompetitionContext";

interface DashboardViewProps {
  showGuide: boolean;
  setShowGuide: (show: boolean) => void;
  setView: (view: "list" | "detail" | "add" | "register" | "report") => void;
  setSelectedCompId: (id: string) => void;
}

export function DashboardView({
  showGuide,
  setShowGuide,
  setView,
  setSelectedCompId,
}: DashboardViewProps) {
  const {
    competitions: allCompetitions,
    isLoading,
    setSearchCompetitions,
    searchCompetitions,
  } = useCompetition();

  return (
    <motion.div
      key="list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      {/* Quick Guide Card */}
      {showGuide && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-primary text-white p-6 rounded-3xl shadow-xl shadow-primary/10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-2">
            <button
              onClick={() => setShowGuide(false)}
              className="p-1 hover:bg-white/10 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h3 className="font-bold text-lg">Selamat Datang, Panitia!</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Kelola perlombaan PHBN mulai dari registrasi peserta massal,
                pembuatan bagan otomatis (bracket), hingga ekspor laporan akhir
                PDF.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                  <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">
                    1
                  </span>{" "}
                  Buat Lomba
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                  <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">
                    2
                  </span>{" "}
                  Registrasi Peserta
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                  <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">
                    3
                  </span>{" "}
                  Bagan & Pemenang
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Total
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {allCompetitions?.length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">
            Aktif
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {allCompetitions?.filter((c) => c.status === "ongoing").length || 0}
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">
            Selesai
          </p>
          <p className="text-2xl font-bold text-slate-900">
            {allCompetitions?.filter((c) => c.status === "completed").length || 0}
          </p>
        </div>
      </div>

      {/* Search & Actions */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            className="input-clean pl-12"
            placeholder="Cari nama lomba..."
            value={searchCompetitions}
            onChange={(e) => setSearchCompetitions(e.target.value)}
          />
        </div>
        <button
          onClick={() => setView("add")}
          className="bg-white text-slate-600 p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold text-xs"
        >
          <Plus className="w-5 h-5" />
          Lomba
        </button>
      </div>

      {/* Competition List */}
      <div className="space-y-4">
        <h4 className="text-sm font-bold text-slate-700 ml-1">
          Daftar Lomba PHBN Tahun {currentYear}
        </h4>
        {isLoading ? (
          // 🔄 Loading State
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse"
              >
                <div className="h-4 w-24 bg-slate-200 rounded mb-3" />
                <div className="h-5 w-40 bg-slate-200 rounded mb-4" />
                <div className="flex gap-4">
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                  <div className="h-3 w-20 bg-slate-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : allCompetitions && allCompetitions.length > 0 ? (
          // ✅ Data ada
          allCompetitions.map((comp) => (
            <motion.div
              key={comp.id}
              layoutId={comp.id}
              onClick={() => {
                setSelectedCompId(comp.id);
                setView("detail");
              }}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "badge-clean",
                        comp.status === "pending"
                          ? "status-pending"
                          : comp.status === "ongoing"
                            ? "status-ongoing"
                            : "status-completed",
                      )}
                    >
                      {comp.status === "pending"
                        ? "Belum Dimulai"
                        : comp.status === "ongoing"
                          ? "Sedang Berlangsung"
                          : "Selesai"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      • {comp.category}
                    </span>
                  </div>
                  <h5 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">
                    {comp.name}
                  </h5>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                <div className="text-xs text-slate-500">{comp.time}</div>
                <div className="text-xs text-slate-500">{comp.location}</div>
                <div className="text-xs text-slate-500">
                  {comp.participants.length} Peserta
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          // 📭 Empty state
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
            <h5 className="font-bold text-slate-900">Belum Ada Lomba</h5>
            <p className="text-sm text-slate-500 mt-1 mb-6">
              Mulai dengan menambahkan lomba pertama Anda.
            </p>
            <button
              onClick={() => setView("add")}
              className="btn-primary-clean mx-auto"
            >
              Tambah Lomba
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
