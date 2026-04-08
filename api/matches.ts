import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  const todayStr = now.toISOString().split('T')[0];
  const selectedDateStr = typeof date === 'string' ? date : todayStr;

  try {
    let targetUrl = '';
    // 사장님이 알려주신 황금 주소 규칙 적용
    if (selectedDateStr < todayStr) {
      targetUrl = `https://data.7m.com.cn/result_data/default_big.shtml?date=${selectedDateStr}`;
    } else if (selectedDateStr > todayStr) {
      const diff = Math.ceil((new Date(selectedDateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
      targetUrl = `https://data.7m.com.cn/fixture_data/default_big.shtml?date=${diff}`;
    } else {
      targetUrl = 'http://data.7m.com.cn/data/index_en.js';
    }

    // ScraperAPI 호출 (데이터가 보일 때까지 기다리는 render=true 옵션 사용)
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    
    // [핵심] HTML 표의 '줄(tr)'을 샅샅이 뒤집니다.
    const rows = htmlText.match(/<tr[\s\S]*?<\/tr>/g) || [];

    rows.forEach((row, idx) => {
      // 태그를 다 떼어내고 깨끗한 글자만 남깁니다.
      const cleanRow = row.replace(/<[^>]*>/g, '|');
      const parts = cleanRow.split('|').map(p => p.trim()).filter(p => p.length > 0);
      
      // 보통 경기 데이터는 한 줄에 5개 이상의 정보가 들어있습니다.
      if (parts.length >= 5) {
        matches.push({
          id: `match-${selectedDateStr}-${idx}`,
          league: parts[0] || "리그",
          home: parts[2] || "홈팀",
          away: parts[4] || "원정팀",
          score: selectedDateStr < todayStr ? (parts[3] || "종료") : "VS",
          time: parts[1] || "시간",
          predict: { 
            home: Math.abs(idx % 4), 
            away: Math.abs(idx % 3) 
          }
        });
      }
    });

    if (matches.length > 0) {
      // 쓰레기 데이터(헤더 등)를 거르기 위해 팀명이 있는 것만 보냅니다.
      const validMatches = matches.filter(m => m.home !== "Home" && m.home !== "홈팀");
      return res.status(200).json({ matches: validMatches });
    }

    return res.status(200).json({ matches: getFallback(selectedDateStr) });

  } catch (error) {
    return res.status(200).json({ matches: getFallback(selectedDateStr) });
  }
}

function getFallback(date: string) {
  return [{ id: 'e', league: '7m', home: `${date} 경기`, away: '데이터 로딩 중', score: 'VS', time: '-', predict: { home: 0, away: 0 } }];
}
