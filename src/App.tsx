/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { AnimatePresence } from 'motion/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Competition, Participant, Bracket, Match, RegCard } from './types';

import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { LoginView } from './components/views/LoginView';
import { DashboardView } from './components/views/DashboardView';
import { AddCompetitionView } from './components/views/AddCompetitionView';
import { ReportView } from './components/views/ReportView';
import { RegisterView } from './components/views/RegisterView';
import { DetailView } from './components/views/DetailView';
import { ConfirmModal, BracketModal } from './components/common/Modals';

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
    return <LoginView onLogin={login} />;
  }

  const selectedComp = competitions.find(c => c.id === selectedCompId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <Header 
        user={user} 
        logout={logout} 
        seedData={seedData} 
        handleExportAndReset={handleExportAndReset} 
      />

      <main className="p-6 max-w-2xl mx-auto space-y-8">
        <AnimatePresence mode="wait">
          {view === 'list' && (
            <DashboardView 
              competitions={competitions}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              showGuide={showGuide}
              setShowGuide={setShowGuide}
              setView={setView}
              setSelectedCompId={setSelectedCompId}
            />
          )}

          {view === 'detail' && selectedComp && (
            <DetailView 
              selectedComp={selectedComp}
              setView={setView}
              updateCompetition={updateCompetition}
              deleteCompetition={deleteCompetition}
              setConfirmModal={setConfirmModal}
              setRegCompId={setRegCompId}
              setRegCards={setRegCards}
              setRegStatus={setRegStatus}
              setBracketModal={setBracketModal}
              setPerMatchInput={setPerMatchInput}
              setMatchWinner={setMatchWinner}
              resetBracket={resetBracket}
            />
          )}

          {view === 'register' && (
            <RegisterView 
              competitions={competitions}
              regCompId={regCompId}
              setRegCompId={setRegCompId}
              regCards={regCards}
              addRegCard={addRegCard}
              removeRegCard={removeRegCard}
              updateRegCard={updateRegCard}
              handleSaveRegistration={handleSaveRegistration}
              regStatus={regStatus}
              lastRegistered={lastRegistered}
            />
          )}

          {view === 'report' && (
            <ReportView 
              competitions={competitions}
              setView={setView}
            />
          )}

          {view === 'add' && (
            <AddCompetitionView 
              setView={setView}
              addCompetition={addCompetition}
            />
          )}
        </AnimatePresence>
      </main>

      <BottomNav 
        view={view} 
        setView={setView} 
        handleEnterRegister={handleEnterRegister} 
      />

      <ConfirmModal 
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, show: false }))}
      />

      <BracketModal 
        show={bracketModal.show}
        maxParticipants={bracketModal.maxParticipants}
        perMatchInput={perMatchInput}
        setPerMatchInput={setPerMatchInput}
        onConfirm={() => {
          if (perMatchInput >= 2 && perMatchInput <= bracketModal.maxParticipants) {
            generateBracket(bracketModal.compId, perMatchInput);
            setBracketModal(prev => ({ ...prev, show: false }));
          }
        }}
        onCancel={() => setBracketModal(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
}
