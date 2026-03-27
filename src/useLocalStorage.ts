import { useState, useEffect } from 'react';
import { Competition, User } from './types';

const STORAGE_KEY = 'phbn_competitions';
const AUTH_KEY = 'phbn_auth';

export function useLocalStorage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedComps = localStorage.getItem(STORAGE_KEY);
    const storedAuth = localStorage.getItem(AUTH_KEY);

    if (storedComps) {
      setCompetitions(JSON.parse(storedComps));
    } else {
      // Initial mock data if empty
      const initialData: Competition[] = [
        {
          id: '1',
          name: 'Balap Karung',
          category: 'Anak-anak',
          date: '2026-08-17',
          time: '09:00',
          location: 'Lapangan Utama',
          status: 'pending',
          type: 'individu',
          participants: []
        },
        {
          id: '2',
          name: 'Panjat Pinang',
          category: 'Dewasa',
          date: '2026-08-17',
          time: '14:00',
          location: 'Area Pohon Pinang',
          status: 'pending',
          type: 'tim',
          participants: []
        }
      ];
      setCompetitions(initialData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }

    if (storedAuth) {
      setUser(JSON.parse(storedAuth));
    }
    setIsLoaded(true);
  }, []);

  const saveCompetitions = (newComps: Competition[]) => {
    setCompetitions(newComps);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newComps));
  };

  const login = (username: string) => {
    const newUser: User = { username, role: 'panitia' };
    setUser(newUser);
    localStorage.setItem(AUTH_KEY, JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEY);
  };

  const resetData = () => {
    const initialData: Competition[] = [
      {
        id: '1',
        name: 'Balap Karung',
        category: 'Anak-anak',
        date: '2026-08-17',
        time: '09:00',
        location: 'Lapangan Utama',
        status: 'pending',
        type: 'individu',
        participants: []
      },
      {
        id: '2',
        name: 'Panjat Pinang',
        category: 'Dewasa',
        date: '2026-08-17',
        time: '14:00',
        location: 'Area Pohon Pinang',
        status: 'pending',
        type: 'tim',
        participants: []
      }
    ];
    saveCompetitions(initialData);
  };

  const addCompetition = (comp: Omit<Competition, 'id' | 'participants'>) => {
    const newComp: Competition = {
      ...comp,
      id: Math.random().toString(36).substr(2, 9),
      participants: []
    };
    saveCompetitions([...competitions, newComp]);
  };

  const updateCompetition = (updatedComp: Competition) => {
    const newComps = competitions.map(c => c.id === updatedComp.id ? updatedComp : c);
    saveCompetitions(newComps);
  };

  const deleteCompetition = (id: string) => {
    const newComps = competitions.filter(c => c.id !== id);
    saveCompetitions(newComps);
  };

  const seedData = () => {
    const demoData: Competition[] = [
      {
        id: '1',
        name: 'Balap Karung',
        category: 'Anak-anak',
        date: '2026-08-17',
        time: '09:00',
        location: 'Lapangan Utama',
        status: 'completed',
        type: 'individu',
        participants: [
          { id: 'p1', name: 'Budi Santoso', rt: '01', kelas: '5', status: 'active' },
          { id: 'p2', name: 'Siti Aminah', rt: '02', kelas: '4', status: 'active' },
          { id: 'p3', name: 'Agus Salim', rt: '01', kelas: '6', status: 'active' },
          { id: 'p4', name: 'Lani Wijaya', rt: '03', kelas: '5', status: 'active' },
        ],
        winners: {
          first: 'Budi Santoso',
          second: 'Siti Aminah',
          third: 'Agus Salim'
        }
      },
      {
        id: '2',
        name: 'Panjat Pinang',
        category: 'Dewasa',
        date: '2026-08-17',
        time: '14:00',
        location: 'Area Pohon Pinang',
        status: 'ongoing',
        type: 'tim',
        participants: [
          { id: 't1', name: 'Tim Garuda', members: ['Andi', 'Joko', 'Eko'], rt: '01', status: 'active' },
          { id: 't2', name: 'Tim Elang', members: ['Rudi', 'Dedi', 'Heri'], rt: '02', status: 'active' },
          { id: 't3', name: 'Tim Macan', members: ['Soni', 'Toni', 'Boni'], rt: '03', status: 'active' },
        ]
      },
      {
        id: '3',
        name: 'Tarik Tambang',
        category: 'Umum',
        date: '2026-08-17',
        time: '16:00',
        location: 'Lapangan Tengah',
        status: 'pending',
        type: 'tim',
        participants: []
      },
      {
        id: '4',
        name: 'Makan Kerupuk',
        category: 'Anak-anak',
        date: '2026-08-17',
        time: '10:00',
        location: 'Teras Balai Desa',
        status: 'pending',
        type: 'individu',
        participants: [
          { id: 'p5', name: 'Doni', rt: '04', kelas: '2', status: 'active' },
          { id: 'p6', name: 'Rina', rt: '01', kelas: '3', status: 'active' },
        ]
      }
    ];
    saveCompetitions(demoData);
  };

  return {
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
  };
}
