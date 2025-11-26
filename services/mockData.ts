
import { User, UserRole, Match, MatchStatus, Notice, DuesRecord, UserStats } from '../types';

// Mock Users
export const MOCK_USERS: User[] = [
  { 
    id: '202411523', // Test Account
    password: '1234',
    name: '김신융', 
    shortName: 'SHINYUNG',
    birth: 20040101,
    gender: 1,
    matches: 12,
    role: UserRole.MEMBER, 
    position: 'MF', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shinyung',
    joinedAt: '2024-03-01'
  },
  { 
    id: '202000001', 
    password: '1234',
    name: '이매니', 
    shortName: 'MANAGER_LEE',
    birth: 20000505,
    gender: 1,
    matches: 20,
    role: UserRole.MANAGER, 
    position: 'DF', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=manager',
    joinedAt: '2020-03-01'
  },
  { 
    id: '201900001', 
    password: '1234',
    name: '박회장', 
    shortName: 'PRESIDENT',
    birth: 19991225,
    gender: 1,
    matches: 35,
    role: UserRole.EXECUTIVE, 
    position: 'FW', 
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=prez',
    joinedAt: '2019-03-01'
  },
];

// Mock Matches
export const MOCK_MATCHES: Match[] = [
  { 
    id: 'm1', date: '2023-11-15', time: '14:00', opponent: '경영대 FC', location: '대운동장', status: MatchStatus.UPCOMING, participants: ['202411523', '202000001'] 
  },
  { 
    id: 'm2', date: '2023-11-20', time: '18:00', opponent: '공대 united', location: '풋살장', status: MatchStatus.UPCOMING, participants: ['202411523', '201900001'] 
  },
  { 
    id: 'm3', date: '2023-11-01', time: '10:00', opponent: '의대 RUSH', location: '시민운동장', status: MatchStatus.COMPLETED, participants: ['202411523', '202000001', '201900001'],
    score: { us: 3, opponent: 1 },
    formation: '4-3-3',
    lineup: { 'GK': '201900001', 'CB1': '202000001', 'CM': '202411523' }
  },
];

// Mock Notices
export const MOCK_NOTICES: Notice[] = [
  { id: 'n1', title: '11월 정기총회 안내', content: '이번주 금요일 6시 학생회관에서 정기총회가 있습니다.', date: '2023-11-10', authorId: '201900001', isImportant: true },
  { id: 'n2', title: '신입 부원 모집 결과', content: '최종 합격자 명단입니다.', date: '2023-11-05', authorId: '202000001', isImportant: false },
  { id: 'n3', title: '동계 훈련비 납부 안내', content: '11월 25일까지 납부 부탁드립니다.', date: '2023-11-01', authorId: '201900001', isImportant: true },
];

// Mock Dues
export const MOCK_DUES: DuesRecord[] = [
  { id: 'd1', userId: '202411523', month: '2023-11', amount: 10000, status: 'PAID', paidDate: '2023-11-01' },
  { id: 'd2', userId: '202000001', month: '2023-11', amount: 10000, status: 'PAID', paidDate: '2023-11-02' },
  { id: 'd3', userId: '201900001', month: '2023-11', amount: 10000, status: 'UNPAID' },
];

// Mock Service Functions (Simulating Async DB calls)
export const api = {
  login: async (id: string, password?: string): Promise<User | null> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.id === id);
        
        if (user) {
            // Verify password
            if (password && user.password !== password) {
                resolve(null);
                return;
            }
            resolve({ ...user }); 
        } else {
            resolve(null);
        }
      }, 500); // Simulate network delay
    });
  },

  getMatches: async (): Promise<Match[]> => {
    return new Promise(resolve => resolve([...MOCK_MATCHES]));
  },

  getMatchById: async (id: string): Promise<Match | undefined> => {
    return new Promise(resolve => resolve(MOCK_MATCHES.find(m => m.id === id)));
  },

  getNotices: async (): Promise<Notice[]> => {
    return new Promise(resolve => resolve([...MOCK_NOTICES]));
  },

  getDues: async (): Promise<DuesRecord[]> => {
    return new Promise(resolve => resolve([...MOCK_DUES]));
  },

  getUsers: async (): Promise<User[]> => {
    return new Promise(resolve => resolve([...MOCK_USERS]));
  },
  
  getUserStats: async (userId: string): Promise<UserStats> => {
      const user = MOCK_USERS.find(u => u.id === userId);
      return new Promise(resolve => resolve({
          matchesPlayed: user?.matches || 0,
          goals: Math.floor(Math.random() * 10),
          assists: Math.floor(Math.random() * 5),
          attendanceRate: 85
      }));
  }
};
