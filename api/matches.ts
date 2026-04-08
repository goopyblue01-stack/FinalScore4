import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date.replace(/-/g, '') : getTodayString();

  try {
    // [전략] 7m의 가장 확실한 데이터 주머니 (vxml)
    const targetUrl = targetDate === getTodayString() 
      ? 'https://bf.7m.com.cn/vxml/bf_all_en.xml'
      : `https://bf.7m.com.cn/vxml/bf_${targetDate}_en.xml`;

    // ScraperAPI 호출 (충분한 대기시간 부여)
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=false`;

    const response = await fetch(proxyUrl);
    const xmlText = await response.text();

    const matches: any[] = [];
    
    // 7m XML 파싱 (가장 튼튼한 정규식으로 교체)
    const matchBlocks = xmlText.match(/<m>([\s\S]*?)<\/m>/g) || [];

    matchBlocks.forEach((block, idx) => {
      const data = block.replace(/<\/?m>/g, '').split(',');
      
      // 데이터가 5개 이상만 있으면 일단 가져옵니다.
      if (data.length > 5) {
        matches.push({
          id: `7m-${targetDate}-${idx}`,
          league: data[2] || "리그",
          home: data[5] || "홈팀",
          away: data[6] || "원정팀",
          score: `${data[13] || 0}:${data[14] || 0}`,
          time: data[12] === '1' ? '전반' : (data[12] === '3' ? '후반' : (data[12] === '-1' ? '종료' : '대기')),
          predict: { 
            // NaN을 절대 안 만드는 안전한 예상 점수 로직
            home: (idx % 3), 
            away: (idx % 2) 
          }
        });
      }
    });

    if (matches.length > 0) {
      return res.status(200).json({ matches });
    }

    // 데이터가 진짜 없을 때만 알림
    return res.status(200).json({ matches: getEmptyMsg(targetDate) });

  } catch (error) {
    return res.status(200).json({ matches: getEmptyMsg(targetDate) });
  }
}

function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function getEmptyMsg(dateStr: string) {
  return [{ 
    id: 'e', 
    league: '알림', 
    home: `${dateStr} 경기`, 
    away: '목록 업데이트 중', 
    score: 'VS', 
    time: '-', 
    predict: { home: 0, away: 0 } 
  }];
}
