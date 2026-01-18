-- Email Verification System Database Schema
-- 이 SQL을 Supabase SQL Editor에서 실행하세요

-- 1. 이메일 인증 테이블 생성
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  attempts INTEGER DEFAULT 0,
  
  -- 코드는 유니크해야 함
  CONSTRAINT email_verifications_code_unique UNIQUE (code)
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_code ON email_verifications(code);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE email_verifications ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 누구나 인증 코드 생성 가능 (인증 전이므로)
CREATE POLICY IF NOT EXISTS "Anyone can create verification"
  ON email_verifications FOR INSERT
  WITH CHECK (true);

-- 5. RLS POLICY: 누구나 조회 가능 (본인 확인용)
CREATE POLICY IF NOT EXISTS "Anyone can view verifications"
  ON email_verifications FOR SELECT
  USING (true);

-- 6. 인증 시도 횟수 증가 함수
CREATE OR REPLACE FUNCTION increment_verification_attempts(p_email TEXT, p_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE email_verifications
  SET attempts = attempts + 1
  WHERE email = p_email 
    AND code = p_code 
    AND verified = false;
END;
$$ LANGUAGE plpgsql;

-- 7. 만료된 인증 코드 자동 정리 함수 (선택 사항)
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verifications
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 완료!
-- 이제 Supabase Dashboard에서 테이블이 생성되었는지 확인하세요.
