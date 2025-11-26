import {
  User,
  UserRole,
  Match,
  MatchStatus,
  Notice,
  DuesRecord,
  UserStats,
} from "../types";
import { supabase } from "./supabase";

/**
 * 이 파일은 백엔드 API와 데이터베이스를 처리하는 서비스 레이어입니다.
 * Supabase와 연동되어 실제 데이터를 가져오며,
 * DB 연결 실패 시나 데이터가 없을 경우 기존 Mock Data를 대신 사용하여 앱이 깨지지 않게 합니다.
 */

// --- 1. 기존 Mock Data (DB가 비어있을 때 사용될 예비 데이터) ---
export const MOCK_USERS: User[] = [
  {
    id: "202411523", // 테스트 계정 (정의현)
    password: "1234",
    name: "정의현",
    shortName: "UIHYUN",
    birth: 20020702,
    gender: 1,
    matches: 12,
    role: UserRole.EXECUTIVE,
    position: "DF",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=shinyung",
    joinedAt: "2024-03-01",
  },
  {
    id: "202000001",
    password: "1234",
    name: "이매니",
    shortName: "MANAGER_LEE",
    birth: 20000505,
    gender: 1,
    matches: 20,
    role: UserRole.MANAGER,
    position: "DF",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=manager",
    joinedAt: "2020-03-01",
  },
  {
    id: "201900001",
    password: "1234",
    name: "박회장",
    shortName: "PRESIDENT",
    birth: 19991225,
    gender: 1,
    matches: 35,
    role: UserRole.EXECUTIVE,
    position: "FW",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=prez",
    joinedAt: "2019-03-01",
  },
];

export const MOCK_MATCHES: Match[] = [
  {
    id: "m1",
    date: "2023-11-15",
    time: "14:00",
    opponent: "경영대 FC",
    location: "대운동장",
    status: MatchStatus.UPCOMING,
    participants: ["202411523", "202000001"],
  },
  {
    id: "m2",
    date: "2023-11-20",
    time: "18:00",
    opponent: "공대 united",
    location: "풋살장",
    status: MatchStatus.UPCOMING,
    participants: ["202411523", "201900001"],
  },
  {
    id: "m3",
    date: "2023-11-01",
    time: "10:00",
    opponent: "의대 RUSH",
    location: "시민운동장",
    status: MatchStatus.COMPLETED,
    participants: ["202411523", "202000001", "201900001"],
    score: { us: 3, opponent: 1 },
    formation: "4-3-3",
    lineup: { GK: "201900001", CB1: "202000001", CM: "202411523" },
  },
];

export const MOCK_NOTICES: Notice[] = [
  {
    id: "n1",
    title: "11월 정기총회 안내",
    content: "이번주 금요일 6시 학생회관에서 정기총회가 있습니다.",
    date: "2023-11-10",
    authorId: "201900001",
    isImportant: true,
  },
  {
    id: "n2",
    title: "신입 부원 모집 결과",
    content: "최종 합격자 명단입니다.",
    date: "2023-11-05",
    authorId: "202000001",
    isImportant: false,
  },
  {
    id: "n3",
    title: "동계 훈련비 납부 안내",
    content: "11월 25일까지 납부 부탁드립니다.",
    date: "2023-11-01",
    authorId: "201900001",
    isImportant: true,
  },
];

export const MOCK_DUES: DuesRecord[] = [
  {
    id: "d1",
    userId: "202411523",
    month: "2023-11",
    amount: 10000,
    status: "PAID",
    paidDate: "2023-11-01",
  },
  {
    id: "d2",
    userId: "202000001",
    month: "2023-11",
    amount: 10000,
    status: "PAID",
    paidDate: "2023-11-02",
  },
  {
    id: "d3",
    userId: "201900001",
    month: "2023-11",
    amount: 10000,
    status: "UNPAID",
  },
];

// 기본 이미지 경로 반환 헬퍼 함수
const getDefaultAvatar = (gender: number) => {
  // 남자 1, 여자 2
  return gender === 2
    ? "/images/default_avatar_female.png"
    : "/images/default_avatar_male.png";
};

// --- 2. 헬퍼 함수: DB 데이터 -> 앱 데이터 타입 변환 ---
const mapUserFromDB = (dbUser: any): User => {
  return {
    ...dbUser,
    shortName: dbUser.short_name || dbUser.name,
    avatarUrl: dbUser.avatar_url || getDefaultAvatar(dbUser.gender),
    joinedAt: dbUser.joined_at,
    matches: dbUser.matches || 0,
    role: dbUser.role as UserRole,
  };
};

const mapMatchFromDB = (dbMatch: any): Match => {
  return {
    ...dbMatch,
    participants: dbMatch.participants || [],
  };
};

// --- 3. 실제 API 로직 ---
export const api = {
  // 로그인
  login: async (id: string, password?: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error || !data) {
        throw new Error("DB Login Failed");
      }

      if (password && data.password !== password) {
        return null;
      }

      return mapUserFromDB(data);
    } catch (e) {
      // DB 연결 실패 시 Mock 데이터 사용
      const user = MOCK_USERS.find((u) => u.id === id);
      if (user && (!password || user.password === password)) {
        return user;
      }
      return null;
    }
  },

  // 경기 목록 조회
  getMatches: async (): Promise<Match[]> => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        return data.map(mapMatchFromDB);
      }
      return [...MOCK_MATCHES];
    } catch (e) {
      return [...MOCK_MATCHES];
    }
  },

  // 경기 상세 조회
  getMatchById: async (id: string): Promise<Match | undefined> => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return mapMatchFromDB(data);
    } catch (e) {
      return MOCK_MATCHES.find((m) => m.id === id);
    }
  },

  // 경기 생성
  createMatch: async (
    matchData: Omit<Match, "id" | "status" | "participants">
  ): Promise<Match> => {
    try {
      const { data, error } = await supabase
        .from("matches")
        .insert([
          {
            ...matchData,
            status: MatchStatus.UPCOMING,
            participants: [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return mapMatchFromDB(data);
    } catch (e) {
      const newMatch: Match = {
        id: Math.random().toString(36).substr(2, 9),
        status: MatchStatus.UPCOMING,
        participants: [],
        ...matchData,
      };
      MOCK_MATCHES.push(newMatch);
      return newMatch;
    }
  },

  // 공지사항 조회
  getNotices: async (): Promise<Notice[]> => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) throw error;

      return data.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        date: n.created_at ? n.created_at.split("T")[0] : "",
        authorId: n.author_id,
        isImportant: n.is_important,
      }));
    } catch (e) {
      return [...MOCK_NOTICES];
    }
  },

  // 회비 내역 조회
  getDues: async (): Promise<DuesRecord[]> => {
    try {
      const { data, error } = await supabase.from("dues").select("*");
      if (error || !data || data.length === 0) throw error;

      return data.map((d: any) => ({
        id: d.id,
        userId: d.user_id,
        month: d.month,
        amount: d.amount,
        status: d.status,
        paidDate: d.paid_date,
      }));
    } catch (e) {
      return [...MOCK_DUES];
    }
  },

  // 유저 목록 조회 (이전 응답에서 잘렸던 부분 복구)
  getUsers: async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error || !data) throw error;
      return data.map(mapUserFromDB);
    } catch (e) {
      return [...MOCK_USERS];
    }
  },

  // 유저 개인 통계 조회 (마이페이지용)
  getUserStats: async (userId: string): Promise<UserStats> => {
    // 1. 유저 정보에서 경기 수 가져오기
    const user = await api.login(userId); // 캐싱된 로직이 있다면 더 효율적임
    const matchesPlayed = user?.matches || 0;

    // 2. 골, 어시스트 등은 아직 DB 테이블이 없으므로 Mock 데이터를 섞어서 반환
    // 추후 'stats' 테이블이 생기면 supabase 로직으로 교체 필요
    return {
      matchesPlayed: matchesPlayed,
      goals: Math.floor(Math.random() * 5), // 임시 랜덤값
      assists: Math.floor(Math.random() * 3), // 임시 랜덤값
      attendanceRate: 85, // 임시 고정값
    };
  },
};
