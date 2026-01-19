/**
 * 이메일 형식 검증
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 강도 검증
 * - 최소 6자 이상
 */
export const validatePassword = (
  password: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (password.length < 6) {
    return {
      isValid: false,
      message: '비밀번호는 최소 6자 이상이어야 합니다.',
    };
  }
  return { isValid: true };
};

/**
 * 학번 형식 검증
 * - 숫자만 포함
 * - 8자리 또는 9자리
 */
export const validateStudentId = (id: string): boolean => {
  return /^\d{8,9}$/.test(id);
};

/**
 * 생년월일 형식 검증 (YYYYMMDD)
 */
export const validateBirthDate = (
  birth: string
): {
  isValid: boolean;
  message?: string;
} => {
  if (birth.length !== 8) {
    return {
      isValid: false,
      message: '생년월일은 8자리로 입력해주세요. (예: 20040101)',
    };
  }

  if (!/^\d{8}$/.test(birth)) {
    return {
      isValid: false,
      message: '생년월일은 숫자만 입력 가능합니다.',
    };
  }

  return { isValid: true };
};
