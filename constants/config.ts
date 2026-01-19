/**
 * 애플리케이션 설정 상수
 */

/**
 * 인증 코드 만료 시간 (초)
 */
export const VERIFICATION_CODE_EXPIRE_TIME = 10 * 60; // 10분

/**
 * 인증 코드 길이
 */
export const VERIFICATION_CODE_LENGTH = 6;

/**
 * 인증 코드 재전송 대기 시간 (초)
 */
export const VERIFICATION_CODE_RESEND_DELAY = 60; // 1분

/**
 * 기본 색상
 */
export const COLORS = {
  PRIMARY: '#036b3f',
  PRIMARY_DARK: '#025230',
  GRAY_50: '#f9fafb',
  GRAY_100: '#f3f4f6',
  GRAY_200: '#e5e7eb',
  GRAY_300: '#d1d5db',
  GRAY_400: '#9ca3af',
  GRAY_500: '#6b7280',
  GRAY_600: '#4b5563',
  GRAY_700: '#374151',
  GRAY_800: '#1f2937',
  RED_500: '#ef4444',
  RED_600: '#dc2626',
  GREEN_50: '#f0fdf4',
  GREEN_700: '#15803d',
} as const;

/**
 * 포지션 목록
 */
export const POSITIONS = [
  { value: 'FW', label: 'FW (공격수)' },
  { value: 'MF', label: 'MF (미드필더)' },
  { value: 'DF', label: 'DF (수비수)' },
  { value: 'GK', label: 'GK (골키퍼)' },
] as const;

/**
 * 성별 목록
 */
export const GENDERS = [
  { value: 1, label: '남성' },
  { value: 2, label: '여성' },
] as const;
