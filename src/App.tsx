/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  Trophy, 
  Users, 
  Plus, 
  LogOut, 
  ChevronRight, 
  Search, 
  Clock,
  Trash2,
  User as UserIcon,
  Lock,
  ArrowRight,
  Minus,
  Flag,
  Medal,
  LayoutDashboard,
  Settings,
  Info,
  X,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  BarChart3,
  PieChart,
  Download,
  FileText
} from 'lucide-react';
import { useLocalStorage } from './useLocalStorage';
import { Competition, Participant, Bracket, Match } from './types';
import { cn } from './types';

interface RegCard {
  id: string;
  name: string;
  members: string[];
  rt: string;
  kelas: string;
  kategori: string;
}

export default function App() {
  const { 
    competitions, 
    user, 
    isLoaded, 
    login, 
    logout, 
    resetData,
    seedData,
    addCompetition, 
    updateCompetition, 
    deleteCompetition 
  } = useLocalStorage();

  const [view, setView] = useState<'list' | 'detail' | 'add' | 'register' | 'report'>('list');
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGuide, setShowGuide] = useState(true);

  // Registration State
  const [regCompId, setRegCompId] = useState<string>('');
  const [regCards, setRegCards] = useState<RegCard[]>([]);
  const [lastRegistered, setLastRegistered] = useState<{name: string, compName: string}[]>([]);
  const [regStatus, setRegStatus] = useState<{type: 'success' | 'error', msg: string} | null>(null);

  // Login State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [confirmModal, setConfirmModal] = useState<{
    show: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [bracketModal, setBracketModal] = useState<{
    show: boolean;
    compId: string;
    maxParticipants: number;
  }>({
    show: false,
    compId: '',
    maxParticipants: 0,
  });
  const [perMatchInput, setPerMatchInput] = useState<number>(2);

  // Set default competition for registration when entering the view
  const handleEnterRegister = () => {
    const activeComp = (selectedCompId && competitions.find(c => c.id === selectedCompId)) || 
                      competitions.find(c => c.status === 'ongoing') || 
                      competitions[0];
    if (activeComp) setRegCompId(activeComp.id);
    setRegCards([{ id: Math.random().toString(36).substr(2, 9), name: '', members: [''], rt: '', kelas: '', kategori: '' }]);
    setView('register');
    setRegStatus(null);
  };

  const addRegCard = () => {
    const lastCard = regCards[regCards.length - 1];
    const newCard: RegCard = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      members: [''],
      rt: lastCard?.rt || '',
      kelas: lastCard?.kelas || '',
      kategori: lastCard?.kategori || ''
    };
    setRegCards([...regCards, newCard]);
  };

  const removeRegCard = (id: string) => {
    if (regCards.length <= 1) return;
    setRegCards(regCards.filter(c => c.id !== id));
  };

  const updateRegCard = (id: string, updates: Partial<RegCard>) => {
    setRegCards(regCards.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const generateBracket = (compId: string, perMatch: number) => {
    const comp = competitions.find(c => c.id === compId);
    if (!comp || comp.participants.length < 2) return;

    // Shuffle participants
    const shuffled = [...comp.participants].sort(() => Math.random() - 0.5);
    
    const matches: Match[] = [];
    for (let i = 0; i < shuffled.length; i += perMatch) {
      const group = shuffled.slice(i, i + perMatch);
      matches.push({
        id: Math.random().toString(36).substr(2, 9),
        participantIds: group.map(p => p.id),
        roundIndex: 0
      });
    }

    const bracket: Bracket = {
      rounds: [{ name: 'Babak Penyisihan', matches }],
      participantsPerMatch: perMatch
    };

    updateCompetition({ ...comp, bracket });
  };

  const setMatchWinner = (compId: string, roundIdx: number, matchIdx: number, winnerId: string) => {
    const comp = competitions.find(c => c.id === compId);
    if (!comp || !comp.bracket) return;

    const newBracket = JSON.parse(JSON.stringify(comp.bracket)) as Bracket;
    const match = newBracket.rounds[roundIdx].matches[matchIdx];
    match.winnerId = winnerId;

    // Mark others in this match as eliminated
    const newParticipants = comp.participants.map(p => {
      if (match.participantIds.includes(p.id) && p.id !== winnerId) {
        return { ...p, status: 'eliminated' as const };
      }
      if (p.id === winnerId) {
        return { ...p, status: 'active' as const };
      }
      return p;
    });

    const currentRound = newBracket.rounds[roundIdx];
    const allWinnersSet = currentRound.matches.every(m => m.winnerId);
    let newWinners = { ...comp.winners };

    if (allWinnersSet) {
      const winners = currentRound.matches.map(m => m.winnerId!);
      
      if (winners.length > 1 && roundIdx === newBracket.rounds.length - 1) {
        const nextMatches: Match[] = [];
        for (let i = 0; i < winners.length; i += newBracket.participantsPerMatch) {
          const group = winners.slice(i, i + newBracket.participantsPerMatch);
          nextMatches.push({
            id: Math.random().toString(36).substr(2, 9),
            participantIds: group,
            roundIndex: roundIdx + 1
          });
        }
        
        const nextRoundName = nextMatches.length === 1 ? 'Babak Final' : `Babak Ke-${roundIdx + 2}`;
        newBracket.rounds.push({ name: nextRoundName, matches: nextMatches });
      } else if (winners.length === 1 && roundIdx === newBracket.rounds.length - 1) {
        // Final winner found!
        const finalWinner = comp.participants.find(p => p.id === winners[0]);
        if (finalWinner) {
          newWinners.first = finalWinner.name;
        }
      }
    }

    updateCompetition({ 
      ...comp, 
      participants: newParticipants, 
      bracket: newBracket,
      winners: newWinners
    });
  };

  const resetBracket = (compId: string) => {
    const comp = competitions.find(c => c.id === compId);
    if (comp) {
      setConfirmModal({
        show: true,
        title: 'Reset Bagan',
        message: 'Apakah Anda yakin ingin menghapus bagan dan mulai ulang? Semua status eliminasi peserta akan dikembalikan.',
        onConfirm: () => {
          const resetParticipants = comp.participants.map(p => ({ ...p, status: 'active' as const }));
          const { bracket, winners, ...rest } = comp;
          updateCompetition({ ...rest, participants: resetParticipants } as Competition);
          setConfirmModal(prev => ({ ...prev, show: false }));
        }
      });
    }
  };

  const handleExportAndReset = () => {
    setConfirmModal({
      show: true,
      title: 'Selesaikan & Reset Data',
      message: 'Data akan diunduh sebagai PDF dan seluruh data aplikasi akan dihapus permanen untuk tahun depan. Lanjutkan?',
      onConfirm: () => {
        const doc = new jsPDF();
        
        // Header
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text('LAPORAN AKHIR KEGIATAN PHBN 2026', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Dicetak pada: ${new Date().toLocaleString('id-ID')}`, 105, 28, { align: 'center' });
        
        // Stats
        const totalLomba = competitions.length;
        const totalPeserta = competitions.reduce((acc, c) => acc + c.participants.length, 0);
        const selesai = competitions.filter(c => c.status === 'completed').length;
        
        doc.setFontSize(14);
        doc.setTextColor(0, 0, 0);
        doc.text('Ringkasan Statistik:', 14, 45);
        doc.setFontSize(11);
        doc.text(`- Total Perlombaan: ${totalLomba}`, 20, 52);
        doc.text(`- Lomba Selesai: ${selesai}`, 20, 58);
        doc.text(`- Total Partisipasi Peserta: ${totalPeserta}`, 20, 64);

        // Winners Table
        const winnerData = competitions
          .filter(c => c.status === 'completed')
          .map(c => {
            const getWinnerInfo = (name?: string) => {
              if (!name || name === '-' || name === '') return '-';
              // Find the participant in this competition to get their RT and Kelas
              const p = c.participants.find(p => p.name === name);
              if (!p) return name;
              
              const details = [];
              if (p.rt) details.push(`RT ${p.rt}`);
              if (p.kelas) details.push(`Kls ${p.kelas}`);
              
              return details.length > 0 ? `${name}\n(${details.join(', ')})` : name;
            };

            return [
              c.name,
              c.category,
              getWinnerInfo(c.winners?.first),
              getWinnerInfo(c.winners?.second),
              getWinnerInfo(c.winners?.third)
            ];
          });

        if (winnerData.length > 0) {
          autoTable(doc, {
            startY: 75,
            head: [['Nama Lomba', 'Kategori', 'Juara 1', 'Juara 2', 'Juara 3']],
            body: winnerData,
            theme: 'grid',
            headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
            margin: { top: 75 }
          });
        }

        // RT Participation Table
        const rtSet = new Set(competitions.flatMap(c => c.participants.map(p => p.rt)).filter(Boolean));
        const rtData = Array.from(rtSet).sort().map(rt => {
          const count = competitions.reduce((acc, c) => acc + c.participants.filter(p => p.rt === rt).length, 0);
          return [`RT ${rt}`, `${count} Peserta`];
        });

        if (rtData.length > 0) {
          const startY = winnerData.length > 0 ? (doc as any).lastAutoTable.finalY + 15 : 75;
          autoTable(doc, {
            startY: startY,
            head: [['Unit RT', 'Jumlah Partisipasi']],
            body: rtData,
            theme: 'striped',
            headStyles: { fillColor: [15, 23, 42] }, // Slate-900
            columnStyles: { 1: { halign: 'right' } }
          });
        }

        // Footer
        const finalY = (doc as any).lastAutoTable?.finalY ? (doc as any).lastAutoTable.finalY + 30 : 100;
        doc.setFontSize(10);
        doc.text('__________________________', 140, finalY);
        doc.text('Ketua Panitia PHBN 2026', 145, finalY + 7);

        // Save and Reset
        doc.save('Laporan_PHBN_2026.pdf');
        resetData();
        setConfirmModal(prev => ({ ...prev, show: false }));
        setView('list');
      }
    });
  };

  const handleSaveRegistration = (e: FormEvent) => {
    e.preventDefault();
    if (!regCompId || regCards.length === 0) return;

    const targetComp = competitions.find(c => c.id === regCompId);
    if (!targetComp) return;

    const validCards = regCards.filter(c => c.name.trim().length > 0);
    if (validCards.length === 0) {
      setRegStatus({ type: 'error', msg: 'Mohon isi setidaknya satu nama peserta.' });
      return;
    }

    let addedCount = 0;
    let duplicateCount = 0;
    const newParticipants = [...targetComp.participants];
    const newRecent: {name: string, compName: string}[] = [];

    validCards.forEach(card => {
      const name = card.name.trim();
      const isDuplicate = newParticipants.some(p => p.name.toLowerCase() === name.toLowerCase());
      
      if (!isDuplicate) {
        const newP: Participant = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          members: card.members.filter(m => m.trim().length > 0),
          rt: card.rt,
          kelas: card.kelas,
          kategori: card.kategori
        };
        newParticipants.push(newP);
        newRecent.unshift({ name, compName: targetComp.name });
        addedCount++;
      } else {
        duplicateCount++;
      }
    });

    if (addedCount > 0) {
      updateCompetition({ ...targetComp, participants: newParticipants });
      setLastRegistered(prev => [...newRecent, ...prev].slice(0, 5));
      
      // Reset cards but keep one empty with sticky data from the last valid card
      const lastCard = validCards[validCards.length - 1];
      setRegCards([{ 
        id: Math.random().toString(36).substr(2, 9), 
        name: '', 
        members: [''],
        rt: lastCard.rt, 
        kelas: lastCard.kelas, 
        kategori: lastCard.kategori 
      }]);
      
      setRegStatus({ 
        type: 'success', 
        msg: `${addedCount} Peserta berhasil didaftarkan! ${duplicateCount > 0 ? `(${duplicateCount} duplikat dilewati)` : ''}` 
      });
    } else if (duplicateCount > 0) {
      setRegStatus({ type: 'error', msg: 'Semua nama yang dimasukkan sudah terdaftar di lomba ini.' });
    }

    // Auto-clear status after 3s
    setTimeout(() => setRegStatus(null), 3000);
  };

  if (!isLoaded) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-slate-500 font-medium">Menyiapkan Aplikasi...</p>
    </div>
  );

  if (!user) {
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

          <form onSubmit={(e) => { e.preventDefault(); login(username); }} className="space-y-5">
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

  const filteredCompetitions = competitions.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedComp = competitions.find(c => c.id === selectedCompId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-5 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Flag className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 leading-tight">Panitia PHBN</h2>
            <p className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">Tahun 2026 • {user.username}</p>
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
          <button onClick={logout} className="p-2 text-slate-400 hover:text-primary transition-colors hover:bg-primary/5 rounded-xl">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="p-6 max-w-2xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {view === 'list' && (
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
                    <button onClick={() => setShowGuide(false)} className="p-1 hover:bg-white/10 rounded-lg">
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
                        Kelola lomba (Individu/Tim) dengan mudah. Tambahkan lomba, daftarkan peserta/tim, lalu buat bagan untuk mencatat skor pemenang.
                      </p>
                      <div className="flex flex-wrap gap-3 pt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                          <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">1</span> Tambah Lomba
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                          <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">2</span> Daftar Peserta
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 px-2 py-1 rounded-lg">
                          <span className="w-4 h-4 bg-white text-primary rounded-full flex items-center justify-center text-[8px]">3</span> Input Skor
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
                  <p className="text-2xl font-bold text-slate-900">{competitions.length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Aktif</p>
                  <p className="text-2xl font-bold text-slate-900">{competitions.filter(c => c.status === 'ongoing').length}</p>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                  <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest mb-1">Selesai</p>
                  <p className="text-2xl font-bold text-slate-900">{competitions.filter(c => c.status === 'completed').length}</p>
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setView('add')}
                  className="bg-white text-slate-600 p-3.5 rounded-2xl border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors flex items-center gap-2 font-bold text-xs"
                >
                  <Plus className="w-5 h-5" />
                  Lomba
                </button>
              </div>

              {/* Competition List */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-700 ml-1">Daftar Lomba Hari Ini</h4>
                {filteredCompetitions.length > 0 ? (
                  filteredCompetitions.map((comp) => (
                    <motion.div 
                      key={comp.id}
                      layoutId={comp.id}
                      onClick={() => { setSelectedCompId(comp.id); setView('detail'); }}
                      className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "badge-clean",
                              comp.status === 'pending' ? "status-pending" :
                              comp.status === 'ongoing' ? "status-ongoing" : "status-completed"
                            )}>
                              {comp.status === 'pending' ? 'Belum Dimulai' : 
                               comp.status === 'ongoing' ? 'Sedang Berlangsung' : 'Selesai'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">• {comp.category}</span>
                          </div>
                          <h5 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{comp.name}</h5>
                        </div>
                        <div className="p-2 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors">
                          <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary" />
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6 pt-4 border-t border-slate-50">
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {comp.time}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          {comp.location}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Users className="w-4 h-4 text-slate-400" />
                          {comp.participants.length} Peserta
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="text-slate-200 w-8 h-8" />
                    </div>
                    <h5 className="font-bold text-slate-900">Belum Ada Lomba</h5>
                    <p className="text-sm text-slate-500 mt-1 mb-6">Mulai dengan menambahkan lomba pertama Anda.</p>
                    <button onClick={() => setView('add')} className="btn-primary-clean mx-auto">
                      <Plus className="w-5 h-5" />
                      Tambah Lomba
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'detail' && selectedComp && (
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
                        setConfirmModal(prev => ({ ...prev, show: false }));
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
                          setRegCards([{ id: Math.random().toString(36).substr(2, 9), name: '', rt: '', kelas: '', kategori: '' }]);
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
                                      setConfirmModal(prev => ({ ...prev, show: false }));
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
          )}

          {view === 'register' && (
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
          )}

          {/* Report View */}
          {view === 'report' && (
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
          )}

          {view === 'add' && (
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

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addCompetition({
                      name: formData.get('name') as string,
                      category: formData.get('category') as string,
                      type: formData.get('type') as 'individu' | 'tim',
                      date: formData.get('date') as string,
                      time: formData.get('time') as string,
                      location: formData.get('location') as string,
                      status: 'pending'
                    });
                    setView('list');
                  }}
                  className="space-y-5"
                >
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
                            value={t.id} 
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
                    <input name="name" type="text" className="input-clean" placeholder="Contoh: Balap Karung" required />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Kategori Peserta</label>
                    <select name="category" className="input-clean appearance-none" required>
                      <option value="Anak-anak">Anak-anak</option>
                      <option value="Remaja">Remaja</option>
                      <option value="Dewasa">Dewasa</option>
                      <option value="Umum">Umum</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Tanggal</label>
                      <input name="date" type="date" className="input-clean" defaultValue="2026-08-17" required />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Waktu Mulai</label>
                      <input name="time" type="time" className="input-clean" required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Lokasi Pelaksanaan</label>
                    <input name="location" type="text" className="input-clean" placeholder="Contoh: Lapangan Utama RT 01" required />
                  </div>
                  <div className="pt-4">
                    <button type="submit" className="btn-primary-clean w-full py-4 text-base">
                      Simpan Data Lomba
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
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

      {/* Confirm Modal */}
      <AnimatePresence>
        {confirmModal.show && (
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
              <h4 className="text-xl font-bold text-slate-900 text-center mb-2">{confirmModal.title}</h4>
              <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmModal.onConfirm}
                  className="w-full py-4 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200"
                >
                  Ya, Lanjutkan
                </button>
                <button
                  onClick={() => setConfirmModal(prev => ({ ...prev, show: false }))}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Batalkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bracket Generation Modal */}
      <AnimatePresence>
        {bracketModal.show && (
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
                      max={bracketModal.maxParticipants}
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
                    * Maksimal {bracketModal.maxParticipants} peserta (Total saat ini)
                  </p>
                </div>

                {perMatchInput > bracketModal.maxParticipants && (
                  <div className="p-3 bg-red-50 rounded-xl flex items-start gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-red-600 font-medium">
                      Jumlah per grup tidak boleh melebihi total peserta ({bracketModal.maxParticipants}).
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
                  onClick={() => {
                    if (perMatchInput >= 2 && perMatchInput <= bracketModal.maxParticipants) {
                      generateBracket(bracketModal.compId, perMatchInput);
                      setBracketModal(prev => ({ ...prev, show: false }));
                    }
                  }}
                  disabled={perMatchInput < 2 || perMatchInput > bracketModal.maxParticipants}
                  className="w-full py-4 bg-indigo-500 text-white rounded-2xl font-bold hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                >
                  Buat Bagan Sekarang
                </button>
                <button
                  onClick={() => setBracketModal(prev => ({ ...prev, show: false }))}
                  className="w-full py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                >
                  Batal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
