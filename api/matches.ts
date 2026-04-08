import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query;
    // [중요] 봉다 웹사이트 주소가 아니라, 봉다의 '진짜 데이터 보관함' 주소입니다.
    const targetUrl = `https://api.bongda.com.vn/v1/matches?date=${date || ''}&lang=vi`;

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'application/json', // "나 JSON 데이터로 받을게"라고 선언
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
      }
    });

    if (!response.ok) throw new Error('데이터 응답 에러');

    const data = await response.json(); // 이제 HTML이 아니라 깔끔한 JSON 데이터가 옵니다!
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: '데이터 낚시 실패', message: error.message });
  }
}
