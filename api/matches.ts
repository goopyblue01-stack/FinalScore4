import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { date } = req.query; // 예: 2026-04-08
    
    // ScoreAxis의 공개된 위젯 데이터 소스를 공략합니다.
    // 별도의 복잡한 인증 없이도 데이터가 잘 나오는 통로입니다.
    const targetUrl = `https://www.scoreaxis.com/api/fixtures?date=${date || ''}`;

    const response = await fetch(targetUrl, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // "나 정식 요청이야"라고 말하기
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'ScoreAxis 연결 실패', message: error.message });
  }
}
