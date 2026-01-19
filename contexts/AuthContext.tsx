import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { supabase } from '../services/supabase';

// Auth Context 타입 정의
export interface AuthContextType {
  user: User | null;
  login: (id: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

// useAuth 훅 - 어디서든 로그인 유저 정보에 접근 가능
export const useAuth = () => useContext(AuthContext);

// AuthProvider 컴포넌트
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscriptionRef: { unsubscribe: () => void } | null = null;

    // JWT 세션 자동 복구 (새로고침 시)
    const initAuth = async () => {
      try {
        const session = await authService.getSession();

        if (session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          if (userData) {
            setUser({
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
              password: '',
            });
          }
        }
      } catch (error) {
        console.error('[Auth] 세션 복구 오류:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // 세션 복구 완료 후 리스너 등록
    initAuth().then(() => {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event, session) => {
        // INITIAL_SESSION은 무시 (initAuth에서 이미 처리됨)
        if (event === 'INITIAL_SESSION') {
          return;
        }

        try {
          if (session) {
            const userData = await authService.getCurrentUser();
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('[Auth] 인증 상태 변경 오류:', error);
          setUser(null);
        }
      });

      subscriptionRef = subscription;
    });

    return () => {
      subscriptionRef?.unsubscribe();
    };
  }, []);

  const login = async (id: string, password?: string) => {
    setIsLoading(true);
    try {
      await authService.signIn(id, password!);
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateUserRole = (role: UserRole) => {
    if (user) {
      setUser({ ...user, role });
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, updateUserRole, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
