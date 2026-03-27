export interface Match {
  id: string;
  participantIds: string[];
  winnerId?: string;
  roundIndex: number;
}

export interface Round {
  name: string;
  matches: Match[];
}

export interface Bracket {
  rounds: Round[];
  participantsPerMatch: number;
}

export interface Competition {
  id: string;
  name: string;
  category: string;
  date: string;
  time: string;
  location: string;
  status: 'pending' | 'ongoing' | 'completed';
  type: 'individu' | 'tim';
  participants: Participant[];
  winners?: {
    first?: string;
    second?: string;
    third?: string;
  };
  bracket?: Bracket;
}

export interface Participant {
  id: string;
  name: string;
  members?: string[];
  team?: string;
  rt?: string;
  kelas?: string;
  kategori?: string;
  status?: 'active' | 'eliminated';
}

export interface User {
  username: string;
  role: 'admin' | 'panitia';
}

export interface RegCard {
  id: string;
  name: string;
  members: string[];
  rt: string;
  kelas: string;
  kategori: string;
}
