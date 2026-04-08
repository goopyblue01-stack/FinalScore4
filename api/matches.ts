import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const selectedDate = typeof date === 'string' ? date : "오늘";

  try {
    // 1. 사장님이 알려주신 황금 주소로 찌르기
    const targetUrl = `https://data.7m.com.cn/result_data/default_big.shtml?date=${selectedDate}`;
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;

    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    
    // 2. 표(tr)에서 진짜 데이터가 있는지 확인
    const rows = htmlText.match(/<tr[\s\S]*?<\/tr>/g) || [];

    rows.forEach((row, idx) => {
      const cells = row.replace(/<[^>]*>/g, '|').split('|').map(c => c.trim()).filter(c => c.length > 0);
      
      // 진짜 경기 데이터만 골라냅니다 (보통 한 줄에 정보가 7개 이상임)
      if (cells.length >= 7 && !cells[0].includes("대회")) {
        matches.push({
          id: `match-${idx}`,
          league: cells[0], // 대회명 (예: K리그)
          home: cells[2],   // 홈팀
          away: cells[4],   // 원정팀
          score: cells[3] || "VS", // 점수
          time: cells[1] || "-",   // 시간
          predict: { home: 0, away: 0 }
        });
      }
    });

    // 3. 데이터가 있으면 보여주고, 없으면 빈 리스트를 보냅니다.
    // (이상한 글자가 뜨지 않게 빈 리스트 []를 보내는 게 핵심!)
    return res.status(200).json({ matches: matches });

  } catch (error) {
    // 에러 나도 빈 화면을 보여줍니다.
    return res.status(200).json({ matches: [] });
  }
}
