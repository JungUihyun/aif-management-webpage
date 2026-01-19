/**
 * 현재 연도 반환
 */
export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

/**
 * 특정 연도의 시작일과 종료일 반환
 */
export const getYearRange = (year: number) => {
  return {
    start: `${year}-01-01`,
    end: `${year}-12-31`,
  };
};

/**
 * 날짜 문자열 포맷팅 (YYYY-MM-DD → YYYY년 MM월 DD일)
 */
export const formatDateKorean = (dateString: string): string => {
  const [year, month, day] = dateString.split('-');
  return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
};

/**
 * 날짜 문자열 포맷팅 (YYYY-MM-DD → MM/DD)
 */
export const formatDateShort = (dateString: string): string => {
  const [, month, day] = dateString.split('-');
  return `${parseInt(month)}/${parseInt(day)}`;
};

/**
 * 시간 포맷팅 (초 → MM:SS)
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 날짜가 올해인지 확인
 */
export const isThisYear = (dateString: string): boolean => {
  const year = parseInt(dateString.split('-')[0]);
  return year === getCurrentYear();
};
