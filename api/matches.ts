import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 허용 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query;
    // 봉다 사이트 날짜별 주소
    const targetUrl = `https://bongda.com.vn/lich-thi-dau?date=${date || ''}`;

    // axios 대신 기본 내장 도구인 fetch를 사용해 에러 확률을 줄입니다.
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`봉다 서버 응답 에러: ${response.status}`);
    }

    const html = await response.text();
    // 성공 시 HTML 텍스트 전달
    return res.status(200).send(html);

  } catch (error: any) {
    // 에러 발생 시 어떤 문제인지 구체적으로 출력
    return res.status(500).json({ 
      error: '데이터 가져오기 실패', 
      message: error.message 
    });
  }
}
