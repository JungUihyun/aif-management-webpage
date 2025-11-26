
export enum UserRole {
  MEMBER = 'MEMBER',
  MANAGER = 'MANAGER',
  EXECUTIVE = 'EXECUTIVE'
}

export enum MatchStatus {
  UPCOMING = 'UPCOMING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface User {
  id: string;        // 학번 (UI 입력 편의성을 위해 string으로 관리하되, 내부적으로 숫자로 취급 가능)
  password?: string; // 암호화된 비밀번호
  birth: number;     // 생년월일 yyyymmdd
  gender: number;    // 성별 (1: Male, 2: Female, etc.)
  shortName: string; // 별명(유니폼 표시 이름)
  name: string;      // 본명
  matches: number;   // 경기 출전 수
  
  // App logic fields
  role: UserRole;
  position: string; 
  avatarUrl?: string;
  joinedAt?: string; 
}

export interface Match {
  id: string;
  date: string; // ISO string
  time: string;
  opponent: string;
  location: string;
  status: MatchStatus;
  participants: string[]; // User IDs
  score?: {
    us: number;
    opponent: number;
  };
  formation?: string; // e.g., "4-3-3"
  lineup?: Record<string, string>; // position key -> user ID
}

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string;
  isImportant: boolean;
}

export interface DuesRecord {
  id: string;
  userId: string;
  month: string; // "2023-10"
  amount: number;
  status: 'PAID' | 'UNPAID';
  paidDate?: string;
}

export interface UserStats {
  matchesPlayed: number;
  goals: number;
  assists: number;
  attendanceRate: number; // percentage
}
