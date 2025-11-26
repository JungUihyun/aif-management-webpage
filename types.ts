
// 유저 권한 레벨 정의
// MEMBER: 일반 부원, MANAGER: 매니저(일정 관리 등), EXECUTIVE: 임원(회비, 권한 관리 등)
export enum UserRole {
  MEMBER = 'MEMBER',
  MANAGER = 'MANAGER',
  EXECUTIVE = 'EXECUTIVE'
}

// 경기 상태 정의
export enum MatchStatus {
  UPCOMING = 'UPCOMING', // 예정됨
  COMPLETED = 'COMPLETED', // 종료됨
  CANCELLED = 'CANCELLED'  // 취소됨
}

// 사용자 정보 인터페이스
export interface User {
  id: string;        // 학번 (UI 입력 편의성을 위해 string으로 관리하되, 내부적으로 숫자로 취급 가능)
  password?: string; // 암호화된 비밀번호 (실제 프로덕션에서는 해시값 사용 권장)
  birth: number;     // 생년월일 yyyymmdd 형식
  gender: number;    // 성별 (1: 남성, 2: 여성 등)
  shortName: string; // 별명 (유니폼 등에 표시될 이름)
  name: string;      // 본명
  matches: number;   // 총 경기 출전 수
  
  // 앱 로직 필드
  role: UserRole;    // 권한 레벨
  position: string;  // 주 포지션 (예: FW, MF, DF, GK)
  avatarUrl?: string; // 프로필 이미지 URL
  joinedAt?: string;  // 가입일
}

// 경기 일정 인터페이스
export interface Match {
  id: string;
  date: string; // ISO string 형태의 날짜 (YYYY-MM-DD)
  time: string; // 시간 (HH:MM)
  opponent: string; // 상대팀 이름
  location: string; // 경기 장소
  status: MatchStatus; // 경기 진행 상태
  participants: string[]; // 참여 신청한 유저들의 ID 배열
  
  // 경기 종료 후 입력되는 데이터
  score?: {
    us: number;       // 우리 팀 점수
    opponent: number; // 상대 팀 점수
  };
  formation?: string; // 사용 포메이션 (예: "4-3-3")
  lineup?: Record<string, string>; // 포지션별 배치된 유저 ID (Key: 포지션명, Value: 유저ID)
}

// 공지사항 인터페이스
export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  authorId: string; // 작성자 ID
  isImportant: boolean; // 중요 공지 여부 (상단 고정 또는 강조용)
}

// 회비 납부 기록 인터페이스
export interface DuesRecord {
  id: string;
  userId: string;
  month: string; // 해당 월 (예: "2023-10")
  amount: number; // 납부 금액
  status: 'PAID' | 'UNPAID'; // 납부 상태
  paidDate?: string; // 실 납부일
}

// 마이페이지용 통계 인터페이스
export interface UserStats {
  matchesPlayed: number; // 경기 수
  goals: number;         // 득점
  assists: number;       // 도움
  attendanceRate: number; // 참석률 (백분율)
}
