import { serve } from 'std/http/server.ts';
import { createClient } from '@supabase/supabase-js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { email } = await req.json();

    // 1. 이메일 유효성 검사
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: '유효한 이메일을 입력해주세요.' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 2. Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. 이메일 중복 체크
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: '이미 가입된 이메일입니다.' }),
        {
          status: 409,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. 6자리 랜덤 코드 생성
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // 5. DB에 인증 코드 저장 (만료: 10분)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: dbError } = await supabase
      .from('email_verifications')
      .insert({
        email,
        code,
        expires_at: expiresAt,
      });

    if (dbError) {
      console.error('DB 저장 오류:', dbError);
      return new Response(JSON.stringify({ error: '인증 코드 생성 실패' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 6. Brevo API로 이메일 발송
    const brevoApiKey = Deno.env.get('BREVO_API_KEY')!;

    const emailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sender: { email: 'fcaif.manager@gmail.com', name: 'FC AIF 관리자' },
        to: [{ email }],
        subject: '[FC AIF] 회원가입 인증 코드',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0;">⚽ FC AIF</h1>
              <h2 style="color: #374151; margin-top: 10px;">회원가입 인증</h2>
            </div>
            
            <p style="color: #4b5563; line-height: 1.6;">안녕하세요!</p>
            <p style="color: #4b5563; line-height: 1.6;">아래 인증 코드를 입력하여 회원가입을 완료해주세요.</p>
            
            <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; text-align: center; margin: 30px 0; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <p style="color: #ffffff; margin: 0 0 10px 0; font-size: 14px;">인증 코드</p>
              <h1 style="color: #ffffff; font-size: 48px; margin: 0; letter-spacing: 12px; font-weight: bold;">${code}</h1>
            </div>
            
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="color: #92400e; margin: 0; font-size: 14px;">⏰ 이 코드는 <strong>10분</strong> 동안 유효합니다.</p>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              본인이 요청하지 않았다면 이 이메일을 무시하세요.
            </p>
          </div>
        `,
      }),
    });

    if (!emailResponse.ok) {
      const error = await emailResponse.text();
      console.error('Brevo 이메일 발송 오류:', error);
      return new Response(JSON.stringify({ error: '이메일 발송 실패' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '인증 코드가 이메일로 전송되었습니다.',
        expiresAt,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: '서버 오류가 발생했습니다.' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
