import React, {useState} from 'react';
import { motion } from 'motion/react';
import { ChevronRight, Info, User as UserIcon, Users } from 'lucide-react';
import { Competition } from '@/src/types';
import { useCompetition } from '@/src/context/CompetitionContext';

interface AddCompetitionViewProps {
  setView: (view: 'list' | 'detail' | 'add' | 'register' | 'report') => void;
}

export function AddCompetitionView({ setView }: AddCompetitionViewProps) {
  const { createCompetition, isCreating } = useCompetition();

  // State untuk form input bisa ditambahkan di sini jika ingin menggunakan controlled components
  const [formData, setFormData] = useState({
    type: 'individu',
    name: '',
    category: 'Anak-anak',
    date: '2026-08-17',
    time: '09:00',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Buat objek kompetisi baru sesuai dengan tipe Competition
    const newCompetition = {
      name: formData.name,
      category: formData.category,
      type: formData.type as 'individu' | 'tim',
      time: formData.time,
      date: formData.date,
      location: formData.location,
      status: 'pending' as const,
      participants: [],
      winners: {}
    } as Competition;

    createCompetition(newCompetition);
    setView('list');
  };

  return (
    <motion.div 
      key="add"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4">
        <button 
          onClick={() => setView('list')}
          className="btn-secondary-clean py-2 px-4"
        >
          <ChevronRight className="w-5 h-5 rotate-180" /> Batal
        </button>
        <h3 className="text-xl font-bold text-slate-900">Tambah Lomba Baru</h3>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100">
          <Info className="w-5 h-5 text-blue-500 mt-0.5" />
          <p className="text-xs text-blue-700 leading-relaxed">
            Pastikan informasi lomba sudah sesuai dengan jadwal PHBN. Anda dapat menambahkan peserta setelah lomba berhasil disimpan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Jenis Lomba</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'individu', label: 'Individu', icon: UserIcon },
                { id: 'tim', label: 'Tim / Kelompok', icon: Users }
              ].map((t) => (
                <label key={t.id} className="relative cursor-pointer group">
                  <input 
                    type="radio" 
                    name="type" 
                    value={formData.type}
                    onChange={() => setFormData(prev => ({ ...prev, type: t.id }))} 
                    className="peer sr-only" 
                    defaultChecked={t.id === 'individu'}
                  />
                  <div className="flex flex-col items-center gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl peer-checked:bg-primary/5 peer-checked:border-primary peer-checked:text-primary transition-all group-hover:border-slate-300">
                    <t.icon className="w-6 h-6" />
                    <span className="text-xs font-bold uppercase tracking-wider">{t.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Nama Lomba</label>
            <input 
              name="name" 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="input-clean" 
              placeholder="Contoh: Balap Karung" 
              required 
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Kategori Peserta</label>
            <select name="category" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}  className="input-clean appearance-none" required>
              <option value="Anak-anak">Anak-anak</option>
              <option value="Remaja">Remaja</option>
              <option value="Dewasa">Dewasa</option>
              <option value="Umum">Umum</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Tanggal</label>
              <input name="date" type="date" value={formData.date} onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))} className="input-clean" required />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Waktu Mulai</label>
              <input name="time" type="time" value={formData.time} onChange={e => setFormData(prev => ({ ...prev, time: e.target.value }))} className="input-clean" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Lokasi Pelaksanaan</label>
            <input 
              name="location" 
              type="text" 
              value={formData.location} 
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} 
              className="input-clean" 
              placeholder="Contoh: Lapangan Utama RT 01" 
              required 
            />
          </div>
          <div className="pt-4">
            <button 
              type="submit" 
              disabled={isCreating}
              className="btn-primary-clean w-full py-4 text-base disabled:opacity-50"
            >
              {isCreating ? "Menyimpan..." : "Simpan Data Lomba"}
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
