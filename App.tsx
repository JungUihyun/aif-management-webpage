import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Schedule from './pages/Schedule';
import MatchDetail from './pages/MatchDetail';
import MyPage from './pages/MyPage';
import Admin from './pages/Admin';
import Notices from './pages/Notices';
import { User, UserRole } from './types';
import { emailVerificationApi } from './services/api';
import { authService } from './services/auth';
import { supabase } from './services/supabase';
import {
  Lock,
  User as UserIcon,
  UserPlus,
  ArrowLeft,
  Mail,
} from 'lucide-react';

// --- Auth Context (전역 인증 상태 관리) ---
interface AuthContextType {
  user: User | null;
  login: (id: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUserRole: (role: UserRole) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

// useAuth 훅을 통해 어디서든 로그인 유저 정보에 접근 가능
export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // 실제 로그인 테스트를 위해 초기값을 null로 설정합니다.
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let subscriptionRef: { unsubscribe: () => void } | null = null;

    // JWT 세션 자동 복구 (새로고침 시)
    const initAuth = async () => {
      try {
        const session = await authService.getSession();

        if (session?.user) {
          // session.user를 직접 사용 (순환 의존성 방지)
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

    // 먼저 세션 복구 완료 후 리스너 등록
    initAuth().then(() => {
      // 세션 변경 감지 (INITIAL_SESSION 무시)
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
      const authUser = await authService.signIn(id, password!);

      // JWT 사용자인지 레거시 사용자인지 확인
      if (authUser && 'aud' in authUser) {
        // JWT 사용자
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } else {
        // 레거시 사용자: DB에서 직접 조회
        const { data } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (data) {
          setUser({
            id: data.id,
            email: data.email || '',
            name: data.name,
            shortName: data.short_name,
            birth: data.birth,
            gender: data.gender,
            position: data.position,
            backNumber: data.back_number,
            role: data.role,
            matches: data.matches,
            avatarUrl: data.avatar_url,
            joinedAt: data.joined_at,
            password: '',
          });
        }
      }

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

// --- 로그인/회원가입 페이지 컴포넌트 ---
const LoginPage = () => {
  const { login } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true); // true: 로그인 화면, false: 회원가입 화면

  // 로그인 폼 상태
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 회원가입 3단계 상태
  const [signUpStep, setSignUpStep] = useState<'email' | 'code' | 'form'>(
    'email'
  );
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [remainingTime, setRemainingTime] = useState(600); // 10분 = 600초

  // 회원가입 폼 상태
  const [signUpData, setSignUpData] = useState({
    id: '',
    password: '',
    passwordConfirm: '',
    name: '',
    shortName: '',
    birth: '',
    gender: 1,
    position: 'MF',
    backNumber: '',
  });

  // 타이머 시작
  const startTimer = (seconds: number) => {
    setRemainingTime(seconds);
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // 시간 포맷팅 (MM:SS)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 로그인 핸들러
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const success = await login(id, password);
    if (!success) {
      setError('학번 또는 비밀번호가 올바르지 않습니다.');
    }
    setIsSubmitting(false);
  };

  // Step 1: 이메일 제출 핸들러
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result =
      await emailVerificationApi.sendVerificationCode(verificationEmail);

    if (!result.success) {
      setError(result.error || '인증 코드 발송에 실패했습니다.');
      setIsSubmitting(false);
      return;
    }

    setSignUpStep('code');
    startTimer(10 * 60); // 10분 타이머 시작
    setIsSubmitting(false);
  };

  // Step 2: 코드 검증 핸들러
  const handleCodeVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await emailVerificationApi.verifyCode(
      verificationEmail,
      verificationCode
    );

    if (!result.success) {
      setError(result.error || '인증에 실패했습니다.');
      await emailVerificationApi.incrementAttempts(
        verificationEmail,
        verificationCode
      );
      setIsSubmitting(false);
      return;
    }

    // 인증 성공 → 회원가입 폼으로 이동
    setSignUpStep('form');
    setError('');
    setIsSubmitting(false);
  };

  const handleResendCode = async () => {
    setVerificationCode('');
    setError('');
    const event = new Event('submit', { bubbles: true, cancelable: true });
    await handleEmailSubmit(event as unknown as React.FormEvent);
  };

  // 회원가입 폼 변경 핸들러
  const handleSignUpChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setSignUpData((prev) => ({ ...prev, [name]: value }));
  };

  // Step 3: 회원가입 제출 핸들러
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 유효성 검사
    if (signUpData.password !== signUpData.passwordConfirm) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    if (signUpData.birth.length !== 8) {
      setError('생년월일은 8자리로 입력해주세요. (예: 20040101)');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.signUp(signUpData.id, signUpData.password, {
        id: signUpData.id,
        email: verificationEmail,
        name: signUpData.name,
        shortName: signUpData.shortName || signUpData.name,
        birth: parseInt(signUpData.birth),
        gender: Number(signUpData.gender),
        position: signUpData.position,
        backNumber: signUpData.backNumber
          ? parseInt(signUpData.backNumber)
          : undefined,
        password: signUpData.password, // Required by User type
      });

      alert('회원가입이 완료되었습니다! 로그인해주세요.');
      setIsLoginView(true);
      setSignUpStep('email');
      setId(signUpData.id);
      setPassword('');
    } catch {
      setError('회원가입 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 뷰 전환 시 초기화
  useEffect(() => {
    setError('');
    if (isLoginView) {
      setSignUpStep('email');
      setVerificationEmail('');
      setVerificationCode('');
    }
  }, [isLoginView]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 flex items-center justify-center p-4">
      <div className="relative bg-white p-8 rounded-2xl shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-300">
        {/* 헤더 섹션 */}
        <div className="text-center mb-6 relative">
          {!isLoginView && (
            <button
              onClick={() => setIsLoginView(true)}
              className="absolute top-0 left-0 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center bg-green-50 rounded-full">
            <div className="text-5xl">⚽</div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            {isLoginView ? 'FC AIF' : '회원가입'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isLoginView
              ? '부원 관리를 위한 통합 플랫폼'
              : '새로운 부원이 되어주세요!'}
          </p>
        </div>

        {/* 로그인 폼 */}
        {isLoginView ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                학번
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  placeholder="학번을 입력하세요"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 block w-full border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-primary focus:border-primary transition-colors text-sm"
                  placeholder="비밀번호"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-600 mb-2">계정이 없으신가요?</p>
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                className="text-primary font-bold hover:underline flex items-center justify-center w-full"
              >
                <UserPlus size={16} className="mr-1" /> 회원가입 하기
              </button>
            </div>
          </form>
        ) : (
          /* 회원가입 3단계 폼 */
          <>
            {/* Step 1: 이메일 인증 */}
            {signUpStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  이메일 인증
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  본인 확인을 위해 이메일 인증이 필요합니다.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    이메일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail size={18} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={verificationEmail}
                      onChange={(e) => setVerificationEmail(e.target.value)}
                      className="pl-10 w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '전송 중...' : '인증 코드 받기'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginView(true)}
                  className="w-full text-gray-500 text-sm py-2 hover:text-gray-800"
                >
                  로그인으로 돌아가기
                </button>
              </form>
            )}

            {/* Step 2: 코드 인증 */}
            {signUpStep === 'code' && (
              <form onSubmit={handleCodeVerify} className="space-y-4">
                <h2 className="text-xl font-bold text-gray-800 text-center">
                  인증 코드 입력
                </h2>
                <p className="text-sm text-gray-600 text-center">
                  <strong>{verificationEmail}</strong>로
                  <br />
                  전송된 6자리 코드를 입력해주세요.
                </p>

                {/* 타이머 */}
                <div className="text-center">
                  <span className="text-sm text-gray-500">남은 시간: </span>
                  <span
                    className={`text-lg font-bold ${
                      remainingTime < 60 ? 'text-red-500' : 'text-primary'
                    }`}
                  >
                    {formatTime(remainingTime)}
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) =>
                      setVerificationCode(
                        e.target.value.replace(/\D/g, '').slice(0, 6)
                      )
                    }
                    className="w-full border-2 border-gray-300 rounded-lg p-4 text-center text-3xl font-bold tracking-widest focus:ring-2 focus:ring-primary focus:border-primary"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? '확인 중...' : '인증하기'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={remainingTime > 540}
                  className="w-full text-primary text-sm py-2 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  인증 코드 재전송
                  {remainingTime > 540 && ` (${540 - remainingTime}초 후)`}
                </button>

                <button
                  type="button"
                  onClick={() => setSignUpStep('email')}
                  className="w-full text-gray-500 text-sm py-2 hover:text-gray-800"
                >
                  이메일 변경
                </button>
              </form>
            )}

            {/* Step 3: 회원가입 폼 */}
            {signUpStep === 'form' && (
              <form onSubmit={handleSignUpSubmit} className="space-y-3">
                <div className="text-center mb-4 bg-green-50 p-3 rounded-lg">
                  <p className="text-xs text-green-700">
                    ✓ 이메일 인증 완료: {verificationEmail}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      이름
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={signUpData.name}
                      onChange={handleSignUpChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                      placeholder="본명"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      학번
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={signUpData.id}
                      onChange={handleSignUpChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                      placeholder="2024..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    별명 (유니폼 마킹용)
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={signUpData.shortName}
                    onChange={handleSignUpChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    placeholder="예: SHINYUNG (미입력시 본명)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    placeholder="비밀번호 입력"
                    required
                  />
                </div>
                <div>
                  <input
                    type="password"
                    name="passwordConfirm"
                    value={signUpData.passwordConfirm}
                    onChange={handleSignUpChange}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    placeholder="비밀번호 확인"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      생년월일 (8자리)
                    </label>
                    <input
                      type="text"
                      name="birth"
                      value={signUpData.birth}
                      onChange={handleSignUpChange}
                      maxLength={8}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                      placeholder="20040101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      성별
                    </label>
                    <select
                      name="gender"
                      value={signUpData.gender}
                      onChange={handleSignUpChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    >
                      <option value={1}>남성</option>
                      <option value={2}>여성</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      등번호
                    </label>
                    <input
                      type="text"
                      name="backNumber"
                      value={signUpData.backNumber || ''}
                      onChange={handleSignUpChange}
                      maxLength={2}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      주 포지션
                    </label>
                    <select
                      name="position"
                      value={signUpData.position}
                      onChange={handleSignUpChange}
                      className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:border-primary outline-none"
                    >
                      <option value="FW">FW (공격수)</option>
                      <option value="MF">MF (미드필더)</option>
                      <option value="DF">DF (수비수)</option>
                      <option value="GK">GK (골키퍼)</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-xs text-center font-medium bg-red-50 p-2 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-green-800 transition-colors shadow-md mt-2 disabled:opacity-50"
                >
                  {isSubmitting ? '가입 처리 중...' : '가입 완료'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsLoginView(true)}
                  className="w-full text-gray-500 text-xs py-2 hover:text-gray-800"
                >
                  취소하고 로그인으로 돌아가기
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// --- 메인 앱 라우팅 및 레이아웃 구성 ---
const AppContent = () => {
  const { user, isLoading } = useAuth();

  // 로딩 상태 처리
  if (isLoading)
    return (
      <div className="h-screen flex items-center justify-center text-primary bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );

  // 비로그인 시 로그인 페이지 렌더링
  if (!user) {
    return <LoginPage />;
  }

  return (
    <Router>
      <Layout user={user}>
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/match/:id" element={<MatchDetail user={user} />} />
          <Route path="/notices" element={<Notices user={user} />} />
          {/* <Route path="/dues" element={<Dues user={user} />} /> */}
          <Route path="/mypage" element={<MyPage user={user} />} />
          {/* 관리자 페이지는 EXECUTIVE 권한일 떄만 접근 가능 */}
          <Route
            path="/admin"
            element={
              user.role === 'EXECUTIVE' ? <Admin /> : <Navigate to="/" />
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
