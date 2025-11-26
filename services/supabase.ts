import { createClient } from "@supabase/supabase-js";

// [로컬 개발 환경 설정 가이드]
// 1. Supabase 프로젝트를 생성합니다. (https://supabase.com)
// 2. 대시보드 -> Project Settings -> API 메뉴에서 'Project URL'과 'anon public key'를 확인하세요.
// 3. 로컬에서 실행 시 .env 파일을 만들어 관리하거나, 아래 문자열에 직접 붙여넣으세요.
//    (보안을 위해 실제 배포 시에는 반드시 환경 변수를 사용해야 합니다)

// 브라우저 환경에서 'process'가 정의되지 않았을 경우를 대비한 안전한 접근
const getEnv = (key: string) => {
  try {
    return typeof process !== "undefined" ? process.env[key] : undefined;
  } catch (e) {
    return undefined;
  }
};

// const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_URL = "https://qkvybbksocmsneznzyhx.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFrdnliYmtzb2Ntc25lem56eWh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNDg0NzYsImV4cCI6MjA3OTcyNDQ3Nn0.hcylbjRv3pMRT87wNqYMLgBIWlER0RghRdm4CrGcc_c";

// Supabase 클라이언트 인스턴스 생성 및 내보내기
// 이 객체를 import해서 DB 쿼리(select, insert 등)를 실행합니다.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
