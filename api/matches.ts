import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = '3e6dcc3f6c4e20790bdec3de093b4378';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 1. 사장님이 앱에서 선택한 날짜를 가져옵니다. (없으면 오늘 날짜)
  const { date } = req.query; 
  const targetDate = typeof date === 'string' ? date.replace(/-/g, '') : '';

  try {
    // 2. 날짜에 맞춰 7m의 데이터 주머니 주소를 바꿉니다.
    // 오늘이면 bf_all_en, 과거/미래면 bf_YYYYMMDD_en 형식을 사용합니다.
    let targetUrl = 'https://bf.7m.com.cn/vxml/bf_all_en.xml';
    
    if (targetDate && targetDate !== getTodayString()) {
        targetUrl = `https://bf.7m.com.cn/vxml/bf_${targetDate}_en.xml`;
    }

    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    const xmlText = await response.text();

    const matches: any[] = [];
    const matchBlocks = xmlText.match(/<m>([\s\S]*?)<\/m>/g) || [];

    matchBlocks.forEach((block, idx) => {
      const data = block.replace(/<\/?m>/g, '').split(',');
      if (data.length > 10) {
        matches.push({
          id: `7m-${targetDate}-${idx}`,
          league: data[2] || "리그",
          home: data[5] || "홈팀",
          away: data[6] || "원정팀",
          score: `${data[13] || 0}:${data[14] || 0}`,
          time: data[12] === '1' ? 'LIVE' : (data[12] === '3' ? '종료' : '대기'),
          predict: { home: (idx % 3), away: (idx % 2) }
        });
      }
    });

    return res.status(200).json({ 
      matches: matches.length > 0 ? matches : getCleanFallback() 
    });

  } catch (error) {
    return res.status(200).json({ matches: getCleanFallback() });
  }
}

// 오늘 날짜를 YYYYMMDD 형식으로 만드는 함수
function getTodayString() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}${m}${d}`;
}

function getCleanFallback() {
    return [{ id: 'empty', league: '알림', home: '해당 날짜에', away: '경기가 없습니다.', score: '0:0', time: '-', predict: { home: 0, away: 0 } }];
}
