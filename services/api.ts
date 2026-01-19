import {
  User,
  UserRole,
  Match,
  MatchStatus,
  Notice,
  UserStats,
} from '../types';
import { supabase } from './supabase';

/**
 * 이 파일은 백엔드 API와 데이터베이스를 처리하는 서비스 레이어입니다.
 * Supabase와 연동되어 실제 데이터를 가져옵니다.
 */

// 기본 이미지 경로 반환 헬퍼 함수
const getDefaultAvatar = (gender: number) => {
  // 남자 1, 여자 2
  return gender === 2
    ? '/images/default_avatar_female.png'
    : '/images/default_avatar_male.png';
};

// --- 헬퍼 함수: DB 데이터 -> 앱 데이터 타입 변환 ---
const mapUserFromDB = (dbUser: any): User => {
  return {
    ...dbUser,
    shortName: dbUser.short_name || dbUser.name,
    avatarUrl: dbUser.avatar_url || getDefaultAvatar(dbUser.gender),
    joinedAt: dbUser.joined_at,
    matches: dbUser.matches || 0,
    role: dbUser.role as UserRole,
    backNumber: dbUser.back_number,
  };
};

const mapMatchFromDB = (dbMatch: any): Match => {
  const participants = dbMatch.match_participants
    ? dbMatch.match_participants.map((p: any) => mapUserFromDB(p.users))
    : [];

  return {
    ...dbMatch,
    time: dbMatch.time ? dbMatch.time.substring(0, 5) : '',
    participants: participants,
  };
};

const mapNoticeFromDB = (dbNotice: any): Notice => {
  return {
    ...dbNotice,
    createdAt: dbNotice.created_at,
    aurthorId: dbNotice.author_id,
    isImportant: dbNotice.is_important,
  };
};

// --- API 로직 ---
export const api = {
  // 경기 목록 조회
  getMatches: async (): Promise<Match[]> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, match_participants(users(*))')
      .order('date', { ascending: true });

    if (error) {
      console.error('경기 목록 조회 오류:', error);
      return [];
    }

    return data ? data.map(mapMatchFromDB) : [];
  },

  // 경기 상세 조회
  getMatchById: async (id: string): Promise<Match | undefined> => {
    const { data, error } = await supabase
      .from('matches')
      .select('*, match_participants(users(*))')
      .eq('id', id)
      .single();

    if (error) {
      console.error('경기 상세 조회 오류:', error);
      return undefined;
    }

    return mapMatchFromDB(data);
  },

  // 경기 생성
  createMatch: async (
    matchData: Omit<Match, 'id' | 'status' | 'participants'>
  ): Promise<Match | null> => {
    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          ...matchData,
          status: MatchStatus.UPCOMING,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('경기 생성 오류:', error);
      return null;
    }

    return mapMatchFromDB(data);
  },

  // 공지사항 조회
  getNotices: async (): Promise<Notice[]> => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('공지사항 조회 오류:', error);
      return [];
    }

    return data ? data.map(mapNoticeFromDB) : [];
  },

  // 공지사항 작성
  createNotice: async (
    noticeData: Omit<Notice, 'id' | 'date' | 'createdAt'>
  ): Promise<boolean> => {
    const { error } = await supabase.from('notices').insert([
      {
        title: noticeData.title,
        content: noticeData.content,
        author_id: noticeData.authorId,
        is_important: noticeData.isImportant,
      },
    ]);

    if (error) {
      console.error('공지사항 작성 오류:', error);
      return false;
    }

    return true;
  },

  // 공지사항 수정
  updateNotice: async (
    noticeId: string,
    noticeData: Partial<Omit<Notice, 'id' | 'date' | 'createdAt' | 'authorId'>>
  ): Promise<boolean> => {
    const updateData: any = {};
    if (noticeData.title !== undefined) updateData.title = noticeData.title;
    if (noticeData.content !== undefined)
      updateData.content = noticeData.content;
    if (noticeData.isImportant !== undefined)
      updateData.is_important = noticeData.isImportant;

    const { error } = await supabase
      .from('notices')
      .update(updateData)
      .eq('id', noticeId);

    if (error) {
      console.error('공지사항 수정 오류:', error);
      return false;
    }

    return true;
  },

  // 공지사항 삭제
  deleteNotice: async (noticeId: string): Promise<boolean> => {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', noticeId);

    if (error) {
      console.error('공지사항 삭제 오류:', error);
      return false;
    }

    return true;
  },

  // 공지사항 상세 조회
  getNoticeById: async (noticeId: string): Promise<Notice | null> => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', noticeId)
      .single();

    if (error) {
      console.error('공지사항 상세 조회 오류:', error);
      return null;
    }

    return mapNoticeFromDB(data);
  },

  // 유저 목록 조회
  getUsers: async (): Promise<User[]> => {
    const { data, error } = await supabase.from('users').select('*');

    if (error) {
      console.error('유저 목록 조회 오류:', error);
      return [];
    }

    return data ? data.map(mapUserFromDB) : [];
  },

  // 유저 권한 수정
  updateUserRole: async (
    userId: string,
    newRole: UserRole
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      console.error('유저 권한 수정 오류:', error);
      return false;
    }

    return true;
  },

  // 유저 개인 통계 조회 (마이페이지용)
  getUserStats: async (userId: string): Promise<UserStats> => {
    // 현재 연도의 시작일과 종료일 계산
    const currentYear = new Date().getFullYear();
    const yearStart = `${currentYear}-01-01`;
    const yearEnd = `${currentYear}-12-31`;

    // 올해 경기 중 해당 유저가 참가한 경기 수 카운트
    const { data: participantData, error: participantError } = await supabase
      .from('match_participants')
      .select('match_id, matches(date)')
      .eq('user_id', userId);

    if (participantError) {
      console.error('유저 경기 참가 기록 조회 오류:', participantError);
    }

    // 올해 경기만 필터링
    const thisYearMatches =
      participantData?.filter((item: any) => {
        const matchDate = item.matches?.date;
        return matchDate && matchDate >= yearStart && matchDate <= yearEnd;
      }) || [];

    const matchesPlayed = thisYearMatches.length;

    // 골, 어시스트 등은 아직 DB 테이블이 없으므로 기본값 반환
    // 추후 'stats' 테이블이 생기면 supabase 로직으로 교체 필요
    return {
      matchesPlayed: matchesPlayed,
      goals: 0,
      assists: 0,
      attendanceRate: 0,
    };
  },

  // 경기 상태 업데이트 (임원/매니저 전용)
  updateMatchStatus: async (
    matchId: string,
    newStatus: MatchStatus
  ): Promise<boolean> => {
    const { error } = await supabase
      .from('matches')
      .update({ status: newStatus })
      .eq('id', matchId);

    if (error) {
      console.error('경기 상태 업데이트 오류:', error);
      return false;
    }

    return true;
  },
};

// --- 이메일 인증 API ---
export const emailVerificationApi = {
  // 1. 인증 코드 발송
  sendVerificationCode: async (
    email: string
  ): Promise<{ success: boolean; expiresAt?: string; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke(
        'send-verification-code',
        {
          body: { email },
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.error) {
        return { success: false, error: data.error };
      }

      return { success: true, expiresAt: data.expiresAt };
    } catch (error) {
      console.error('인증 코드 발송 오류:', error);
      return { success: false, error: '인증 코드 발송에 실패했습니다.' };
    }
  },

  // 2. 인증 코드 검증
  verifyCode: async (
    email: string,
    code: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // DB에서 최신 인증 코드 조회
      const { data, error } = await supabase
        .from('email_verifications')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('verified', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('코드 검증 오류:', error);
        return {
          success: false,
          error: '인증 코드 확인 중 오류가 발생했습니다.',
        };
      }

      if (!data) {
        return {
          success: false,
          error: '인증 코드가 올바르지 않거나 만료되었습니다.',
        };
      }

      // 시도 횟수 제한 체크 (5회)
      if (data.attempts >= 5) {
        return {
          success: false,
          error: '인증 시도 횟수를 초과했습니다. 새로운 코드를 요청해주세요.',
        };
      }

      // 인증 성공: verified = true로 업데이트
      await supabase
        .from('email_verifications')
        .update({ verified: true })
        .eq('id', data.id);

      return { success: true };
    } catch (error) {
      console.error('코드 검증 오류:', error);
      return { success: false, error: '인증 코드 확인에 실패했습니다.' };
    }
  },

  // 3. 인증 시도 횟수 증가
  incrementAttempts: async (email: string, code: string): Promise<void> => {
    try {
      await supabase.rpc('increment_verification_attempts', {
        p_email: email,
        p_code: code,
      });
    } catch (error) {
      console.error('시도 횟수 증가 오류:', error);
    }
  },
};
