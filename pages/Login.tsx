import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import { emailVerificationApi } from '../services/api';
import {
  Lock,
  User as UserIcon,
  UserPlus,
  ArrowLeft,
  Mail,
} from 'lucide-react';

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
    <div className="min-h-screen bg-[#f2f4f6] flex items-center justify-center p-4">
      <div className="relative bg-white p-8 sm:p-10 rounded-[32px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] max-w-sm w-full animate-in fade-in zoom-in duration-300">
        {/* 헤더 섹션 */}
        <div className="text-center mb-8 relative">
          {!isLoginView && (
            <button
              onClick={() => setIsLoginView(true)}
              className="absolute top-0 left-0 text-gray-400 hover:text-gray-600 transition-colors p-2 -ml-2 rounded-full hover:bg-gray-50"
            >
              <ArrowLeft size={24} strokeWidth={2.5} />
            </button>
          )}
          <div className="w-[88px] h-[88px] mx-auto mb-5 flex items-center justify-center bg-[#e8f3ee] rounded-[28px]">
            <div className="text-[44px]">⚽</div>
          </div>
          <h1 className="text-[26px] font-bold text-gray-900 tracking-tight">
            {isLoginView ? 'FC AIF' : '회원가입'}
          </h1>
          <p className="text-gray-500 text-[15px] mt-1.5 font-medium">
            {isLoginView
              ? '부원 관리를 위한 통합 플랫폼'
              : '새로운 부원이 되어주세요!'}
          </p>
        </div>

        {/* 로그인 폼 */}
        {isLoginView ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                학번
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <UserIcon size={20} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="pl-12 block w-full bg-[#f2f4f6] rounded-[16px] py-4 pr-4 focus:ring-2 focus:ring-[#00a550]/20 transition-all text-[16px] font-medium border-none placeholder-gray-400"
                  placeholder="학번을 입력하세요"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1 mt-4">
                비밀번호
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={20} className="text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 block w-full bg-[#f2f4f6] rounded-[16px] py-4 pr-4 focus:ring-2 focus:ring-[#00a550]/20 transition-all text-[16px] font-medium border-none placeholder-gray-400"
                  placeholder="비밀번호"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-[13px] text-center font-bold bg-red-50 p-3 rounded-[12px] mt-2">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#00a550] text-white py-4 mt-6 rounded-[16px] font-bold text-[17px] hover:bg-[#008f45] active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {isSubmitting ? '로그인 중...' : '로그인'}
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-[14px] font-medium text-gray-500 mb-3">
                계정이 없으신가요?
              </p>
              <button
                type="button"
                onClick={() => setIsLoginView(false)}
                className="text-[#00a550] font-bold hover:bg-[#00a550]/5 py-3 rounded-[12px] transition-colors flex items-center justify-center w-full"
              >
                <UserPlus size={18} className="mr-1.5" strokeWidth={2.5} />{' '}
                회원가입 하기
              </button>
            </div>
          </form>
        ) : (
          /* 회원가입 3단계 폼 */
          <>
            {/* Step 1: 이메일 인증 */}
            {signUpStep === 'email' && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <h2 className="text-[20px] font-bold text-gray-900 text-center tracking-tight">
                  이메일 인증
                </h2>
                <p className="text-[14px] font-medium text-gray-500 text-center">
                  본인 확인을 위해 이메일 인증이 필요합니다.
                </p>

                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2 pl-1">
                    이메일
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail size={20} className="text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={verificationEmail}
                      onChange={(e) => setVerificationEmail(e.target.value)}
                      className="pl-12 w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[16px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 placeholder-gray-400 transition-all"
                      placeholder="example@gmail.com"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-[13px] text-center font-bold bg-red-50 p-3 rounded-[12px]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#00a550] text-white py-4 rounded-[16px] font-bold hover:bg-[#008f45] active:scale-[0.98] transition-all disabled:opacity-50 text-[16px]"
                >
                  {isSubmitting ? '전송 중...' : '인증 코드 받기'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsLoginView(true)}
                  className="w-full text-gray-500 font-bold py-3 hover:bg-gray-50 rounded-[12px] transition-colors mt-2 text-[14px]"
                >
                  로그인으로 돌아가기
                </button>
              </form>
            )}

            {/* Step 2: 코드 인증 */}
            {signUpStep === 'code' && (
              <form onSubmit={handleCodeVerify} className="space-y-5">
                <h2 className="text-[20px] font-bold text-gray-900 text-center tracking-tight">
                  인증 코드 입력
                </h2>
                <p className="text-[14px] font-medium text-gray-500 text-center leading-relaxed">
                  <strong>{verificationEmail}</strong>로
                  <br />
                  전송된 6자리 코드를 입력해주세요.
                </p>

                {/* 타이머 */}
                <div className="text-center mt-2">
                  <span className="text-[14px] font-medium text-gray-500">
                    남은 시간:{' '}
                  </span>
                  <span
                    className={`text-[16px] font-bold ${
                      remainingTime < 60 ? 'text-red-500' : 'text-[#00a550]'
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
                    className="w-full bg-[#f2f4f6] rounded-[16px] p-5 text-center text-[32px] font-bold tracking-[0.2em] border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-300"
                    placeholder="000000"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="text-red-500 text-[13px] text-center font-bold bg-red-50 p-3 rounded-[12px]">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || verificationCode.length !== 6}
                  className="w-full bg-[#00a550] text-white py-4 rounded-[16px] font-bold hover:bg-[#008f45] active:scale-[0.98] transition-all disabled:opacity-50 text-[16px]"
                >
                  {isSubmitting ? '확인 중...' : '인증하기'}
                </button>

                <div className="flex justify-between items-center px-2">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={remainingTime > 540}
                    className="text-[#00a550] font-bold text-[14px] p-2 hover:bg-[#00a550]/5 rounded-[10px] transition-colors disabled:opacity-50"
                  >
                    재전송
                    {remainingTime > 540 && ` (${540 - remainingTime}s)`}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSignUpStep('email')}
                    className="text-gray-500 font-bold text-[14px] p-2 hover:bg-gray-50 rounded-[10px] transition-colors"
                  >
                    이메일 변경
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: 회원가입 폼 */}
            {signUpStep === 'form' && (
              <form
                onSubmit={handleSignUpSubmit}
                className="space-y-4 max-h-[60vh] overflow-y-auto px-1 -mx-1 pb-4"
              >
                <div className="text-center mb-6 bg-[#e8f3ee] p-4 rounded-[16px]">
                  <p className="text-[13px] font-bold text-[#00a550]">
                    ✓ 이메일 인증 완료: {verificationEmail}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      이름
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={signUpData.name}
                      onChange={handleSignUpChange}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                      placeholder="본명"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      학번
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={signUpData.id}
                      onChange={handleSignUpChange}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                      placeholder="2024..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1 mt-1">
                    별명 (유니폼 마킹용)
                  </label>
                  <input
                    type="text"
                    name="shortName"
                    value={signUpData.shortName}
                    onChange={handleSignUpChange}
                    className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                    placeholder="예: SHINYUNG (미입력시 본명)"
                  />
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1 mt-1">
                    비밀번호
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={signUpData.password}
                    onChange={handleSignUpChange}
                    className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
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
                    className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none mt-1"
                    placeholder="비밀번호 확인"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      생년월일
                    </label>
                    <input
                      type="text"
                      name="birth"
                      value={signUpData.birth}
                      onChange={handleSignUpChange}
                      maxLength={8}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                      placeholder="20040101"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      성별
                    </label>
                    <select
                      name="gender"
                      value={signUpData.gender}
                      onChange={handleSignUpChange}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all outline-none"
                    >
                      <option value={1}>남성</option>
                      <option value={2}>여성</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      등번호
                    </label>
                    <input
                      type="text"
                      name="backNumber"
                      value={signUpData.backNumber || ''}
                      onChange={handleSignUpChange}
                      maxLength={2}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-medium border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all placeholder-gray-400 outline-none"
                      placeholder="10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-gray-700 mb-2 pl-1">
                      주 포지션
                    </label>
                    <select
                      name="position"
                      value={signUpData.position}
                      onChange={handleSignUpChange}
                      className="w-full bg-[#f2f4f6] rounded-[16px] p-4 text-[15px] font-bold text-gray-700 border-none focus:ring-2 focus:ring-[#00a550]/20 transition-all outline-none"
                    >
                      <option value="FW">FW (공격수)</option>
                      <option value="MF">MF (미드필더)</option>
                      <option value="DF">DF (수비수)</option>
                      <option value="GK">GK (골키퍼)</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="text-red-500 text-[13px] text-center font-bold bg-red-50 p-3 rounded-[12px] mt-4">
                    {error}
                  </div>
                )}

                <div className="pt-4 sticky bottom-0 bg-white border-t border-white shadow-[0_-10px_20px_white]">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#00a550] text-white py-4 rounded-[16px] font-bold text-[17px] hover:bg-[#008f45] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? '가입 처리 중...' : '가입 완료'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLoginView(true)}
                    className="w-full text-gray-500 font-bold text-[14px] py-4 hover:bg-gray-50 rounded-[12px] transition-colors mt-2"
                  >
                    취소하고 로그인으로 돌아가기
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
