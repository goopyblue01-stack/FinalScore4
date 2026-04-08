import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const todayStr = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})).toISOString().split('T')[0];
  const selectedDateStr = typeof date === 'string' ? date : todayStr;

  try {
    // 사장님이 알려주신 검증된 주소 사용
    let targetUrl = `https://data.7m.com.cn/result_data/default_big.shtml?date=${selectedDateStr}`;
    if (selectedDateStr > todayStr) {
      const diff = Math.ceil((new Date(selectedDateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
      targetUrl = `https://data.7m.com.cn/fixture_data/default_big.shtml?date=${diff}`;
    }

    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    const rows = htmlText.match(/<tr[\s\S]*?<\/tr>/g) || [];

    rows.forEach((row, idx) => {
      // 1. 태그 제거 후 텍스트만 추출
      const cells = row.replace(/<[^>]*>/g, '|').split('|').map(c => c.trim()).filter(c => c.length > 0);
      
      /**
       * 2. [필터링 핵심] 진짜 경기 데이터는 보통 이런 식입니다:
       * [대회명, 시간, 홈팀, 점수, 원정팀, ...]
       * 글자 수가 너무 짧거나, 특수문자(&nbsp;), 중국어 메뉴명은 다 버립니다.
       */
      if (cells.length >= 7 && 
          !cells[0].includes("Language") && 
          !cells[0].includes("Match") &&
          !cells[2].includes("nbsp") &&
          cells[2].length > 1) { // 팀명이 최소 2글자 이상인 것만
        
        matches.push({
          id: `match-${selectedDateStr}-${idx}`,
          league: cells[0], 
          home: cells[2],   
          away: cells[4] || cells[5] || "원정팀", // 7m 구조에 맞게 보정
          score: cells[3] || "VS",
          time: cells[1] || "대기",
          predict: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 2) }
        });
      }
    });

    // 3. 중복이나 쓰레기 데이터 한 번 더 거르기
    const finalData = matches.filter(m => !m.home.includes("Match_name") && !m.home.includes("Arr"));

    return res.status(200).json({ matches: finalData });

  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
