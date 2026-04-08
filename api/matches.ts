import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query; // 형식: 2026-04-08
    
    // [비밀 통로] Sofascore의 웹 위젯에서 사용하는 실시간 데이터 주소입니다.
    // 날짜별로 모든 경기를 한 번에 가져오는 가장 안정적인 통로입니다.
    const targetUrl = `https://api.sofascore.com/api/v1/event/schedule/date/${date}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) throw new Error('Sofascore 응답 실패');

    const data = await response.json();
    // 데이터 알맹이(events)만 전달
    return res.status(200).json(data);

  } catch (error: any) {
    return res.status(500).json({ error: 'Sofascore 연결 실패', message: error.message });
  }
}
