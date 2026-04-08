import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query; // 형식: 2026-04-08
    
    // [비밀 통로] 봉다의 실제 데이터 API 서버 주소입니다.
    const targetUrl = `https://api.bongda.com.vn/v1/match/list?date=${date || ''}`;

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
        'Referer': 'https://www.bongda.com.vn/'
      }
    });

    if (!response.ok) throw new Error(`서버 응답 실패: ${response.status}`);

    const json = await response.json();
    // 데이터 알맹이만 깔끔하게 전달
    return res.status(200).json(json);

  } catch (error: any) {
    return res.status(500).json({ error: '데이터 수신 실패', message: error.message });
  }
}
