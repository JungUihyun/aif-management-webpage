import { supabase } from './supabase';
import { User } from '../types';

/**
 * JWT 기반 인증 서비스
 * 학번을 내부 이메일 형식으로 변환하여 Supabase Auth 사용
 * 사용자는 학번만 입력하지만, 내부적으로 JWT 토큰으로 세션 관리
 */

// 학번 <-> 이메일 변환 헬퍼
const studentIdToEmail = (studentId: string) => `${studentId}@aif.internal`;

export const authService = {
  /**
   * 회원가입: 학번 입력 -> 내부 이메일 변환 -> Supabase Auth 사용자 생성
   */
  signUp: async (
    studentId: string,
    password: string,
    userData: Omit<User, 'matches' | 'role' | 'avatarUrl' | 'joinedAt'>
  ) => {
    // 1. Supabase Auth에 사용자 생성 (JWT 자동 발급)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: studentIdToEmail(studentId),
      password: password,
      options: {
        data: {
          student_id: studentId,
          name: userData.name,
        },
      },
    });

    if (authError) throw authError;

    // 2. public.users 테이블에 추가 정보 저장
    const { error: dbError } = await supabase.from('users').insert({
      id: studentId,
      auth_user_id: authData.user!.id,
      email: userData.email,
      name: userData.name,
      short_name: userData.shortName,
      birth: userData.birth,
      gender: userData.gender,
      position: userData.position,
      back_number: userData.backNumber,
      role: 'MEMBER',
      matches: 0,
    });

    if (dbError) {
      console.error('DB 저장 오류:', dbError);
      // Auth 사용자는 생성되었지만 DB 저장 실패 시 정리
      await supabase.auth.admin.deleteUser(authData.user!.id);
      throw dbError;
    }

    return authData;
  },

  /**
   * 로그인: 학번 입력 -> JWT 토큰 발급
   * 하이브리드 인증: Supabase Auth 우선, 실패 시 레거시 bcrypt 방식 폴백
   */
  signIn: async (studentId: string, password: string) => {
    try {
      // 1차 시도: Supabase Auth (새 사용자용)
      const { data, error } = await supabase.auth.signInWithPassword({
        email: studentIdToEmail(studentId),
        password: password,
      });

      if (!error && data.user) {
        return data.user;
      }

      // 2차 시도: 레거시 로그인 (기존 사용자용)
      const { api } = await import('./api');
      const legacyUser = await api.legacyLogin(studentId, password);

      if (!legacyUser) {
        throw new Error('학번 또는 비밀번호가 올바르지 않습니다.');
      }

      console.warn(
        '[Auth] 레거시 사용자 로그인 성공. Supabase Auth로 마이그레이션을 권장합니다.'
      );

      // 레거시 사용자 정보 반환
      return { id: legacyUser.id, email: legacyUser.email || '' };
    } catch (error) {
      console.error('[Auth] 로그인 오류:', error);
      throw error;
    }
  },

  /**
   * 로그아웃: JWT 토큰 삭제
   */
  signOut: async () => {
    await supabase.auth.signOut();
  },

  /**
   * 세션 확인: 새로고침 시 자동 호출
   * JWT 토큰을 검증하고 세션 정보 반환
   */
  getSession: async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  },

  /**
   * 현재 사용자 정보 가져오기
   * JWT에서 사용자 ID 추출 후 public.users 조회
   */
  getCurrentUser: async (): Promise<User | null> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // public.users에서 상세 정보 조회
      const { data: userData, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();

      if (error) {
        console.error('사용자 정보 조회 오류:', error);
        return null;
      }

      if (!userData) {
        console.warn(
          'auth_user_id로 사용자를 찾을 수 없습니다. DB 마이그레이션이 필요합니다.'
        );
        return null;
      }

      return {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        shortName: userData.short_name,
        birth: userData.birth,
        gender: userData.gender,
        position: userData.position,
        backNumber: userData.back_number,
        role: userData.role,
        matches: userData.matches,
        avatarUrl: userData.avatar_url,
        joinedAt: userData.joined_at,
        password: '', // 비밀번호는 반환하지 않음
      };
    } catch (error) {
      console.error('getCurrentUser 오류:', error);
      return null;
    }
  },
};
