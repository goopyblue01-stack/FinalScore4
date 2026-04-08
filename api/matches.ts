import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query; // 형식: 2026-04-08
    
    // Livescore.bz의 실시간 데이터 인터페이스 주소입니다.
    // 보안이 낮고 데이터 양이 방대하여 사장님 사업에 딱 맞습니다.
    const targetUrl = `https://api.livescore.bz/v1/matches/json?date=${date || ''}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) throw new Error('데이터 소스 응답 없음');

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Livescore.bz 연결 실패', message: error.message });
  }
}
