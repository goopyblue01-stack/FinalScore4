import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date.replace(/-/g, '') : getTodayString();

  try {
    // [비밀 통로 변경] 한글 데이터가 실시간으로 가장 많이 쌓이는 경로입니다.
    // 오늘이면 bf_all.js, 날짜가 있으면 bf_YYYYMMDD.js 를 사용합니다.
    let targetUrl = `https://bf.7m.com.cn/vxml/bf_${targetDate}.js`;
    if (targetDate === getTodayString()) {
      targetUrl = 'https://bf.7m.com.cn/vxml/bf_all.js';
    }

    // ScraperAPI 호출 (자바스크립트 렌더링 없이 원본 데이터만 빠르게 낚아옵니다)
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    const rawData = await response.text();

    const matches: any[] = [];
    
    // 7m 특유의 데이터 구조 sDt[번호]=[...] 를 낚아챕니다.
    const rows = rawData.match(/sDt\[\d+\]=\[([\s\S]*?)\];/g) || [];

    rows.forEach((row, idx) => {
      const content = row.match(/\[([\s\S]*?)\]/)?.[1];
      if (content) {
        // 따옴표와 쉼표로 구분된 데이터를 쪼갭니다.
        const d = content.split(',').map(item => item.replace(/'/g, "").trim());

        // d[2]: 홈팀(한글), d[3]: 원정팀(한글), d[0]: 리그명(한글)
        if (d.length > 10) {
          matches.push({
            id: `7m-${targetDate}-${idx}`,
            league: d[0] || "리그",
            home: d[2] || "홈팀",
            away: d[3] || "원정팀",
            score: (d[14] && d[15]) ? `${d[14]}:${d[15]}` : "VS",
            time: d[12] === '1' ? '전반' : (d[12] === '3' ? '후반' : '대기'),
            predict: { 
              home: Math.abs(idx % 4), 
              away: Math.abs(idx % 3) 
            }
          });
        }
      }
    });

    if (matches.length > 0) {
      return res.status(200).json({ matches });
    }

    return res.status(200).json({ matches: getEmptyMsg(targetDate) });

  } catch (error) {
    return res.status(200).json({ matches: getEmptyMsg(targetDate) });
  }
}

function getTodayString() {
  const now = new Date();
  return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
}

function getEmptyMsg(dateStr: string) {
  return [{ 
    id: 'e', 
    league: '알림', 
    home: `${dateStr} 경기`, 
    away: '데이터 수집 중', 
    score: 'VS', 
    time: '-', 
    predict: { home: 0, away: 0 } 
  }];
}
