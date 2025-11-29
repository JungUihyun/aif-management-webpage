import { UserRole } from "../types";

/**
 * user role을 한국어 표기로 변환
 * @param role UserRole Enum 값
 * @returns 한국어 문자열
 */
export const getUserRoleLabel = (role: UserRole | string): string => {
  switch (role) {
    case UserRole.EXECUTIVE:
      return "임원";
    case UserRole.MANAGER:
      return "매니저";
    case UserRole.MEMBER:
      return "회원";
    default:
      return "-";
  }
};
