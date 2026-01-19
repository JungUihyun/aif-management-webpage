/**
 * 애플리케이션 라우트 경로 상수
 */
export const ROUTES = {
  HOME: '/',
  SCHEDULE: '/schedule',
  NOTICES: '/notices',
  MYPAGE: '/mypage',
  ADMIN: '/admin',
  MATCH_DETAIL: (id: string) => `/match/${id}`,
} as const;

/**
 * 라우트 라벨 (한국어)
 */
export const ROUTE_LABELS = {
  HOME: '대시보드',
  SCHEDULE: '일정',
  NOTICES: '공지사항',
  MYPAGE: '마이페이지',
  ADMIN: '관리자 페이지',
} as const;
