import { createClient } from '@supabase/supabase-js';

// [로컬 개발 환경 설정 가이드]
// 1. Supabase 프로젝트를 생성합니다. (https://supabase.com)
// 2. 대시보드 -> Project Settings -> API 메뉴에서 'Project URL'과 'anon public key'를 확인하세요.
// 3. 로컬에서 실행 시 .env 파일을 만들어 관리하거나, 아래 문자열에 직접 붙여넣으세요.
//    (보안을 위해 실제 배포 시에는 반드시 환경 변수를 사용해야 합니다)

// Vite 환경 변수 사용
// Vite는 import.meta.env를 통해 VITE_ 접두사가 붙은 환경 변수를 자동으로 로드합니다
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}
export const supabase = createClient(supabaseUrl, supabaseKey);
