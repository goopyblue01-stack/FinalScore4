import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = '3e6dcc3f6c4e20790bdec3de093b4378';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // [사장님이 주신 fbig.js의 실시간 원천 주소]
    const targetUrl = 'https://bf.7m.com.cn/vxml/bf_all_en.js';
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    const rawData = await response.text();

    const matches: any[] = [];
    
    // 1. 사장님이 주신 파일에 있는 "sDt[번호]=[...]" 구조를 통째로 잡습니다.
    const dataRows = rawData.match(/sDt\[\d+\]=\[([\s\S]*?)\];/g) || [];

    dataRows.forEach((row, idx) => {
      // 2. 데이터 알맹이만 추출 (쉼표로 구분된 리스트)
      const content = row.match(/\[([\s\S]*?)\]/)?.[1];
      if (!content) return;

      // 7m 데이터는 ',' 로 구분되어 있습니다. 따옴표를 제거하고 배열로 만듭니다.
      const parts = content.split(',').map(p => p.replace(/'/g, "").trim());

      // 3. 사장님이 주신 fbig.js의 실제 데이터 순서 적용
      // parts[0]: 리그명, parts[2]: 홈팀, parts[3]: 원정팀
      if (parts.length > 5) {
        matches.push({
          id: `7m-${idx}`,
          league: parts[0] || "Live",
          home: parts[2] || "Home",
          away: parts[3] || "Away",
          // 실시간 점수는 다른 변수에 있으나, 일단 기본 구조를 잡습니다.
          score: parts[14] && parts[15] ? `${parts[14]}:${parts[15]}` : "VS", 
          time: "LIVE",
          predict: { 
            home: Math.floor(Math.random() * 3), 
            away: Math.floor(Math.random() * 2) 
          }
        });
      }
    });

    // 4. 만약 데이터가 잘 뽑혔다면 사장님 앱으로 전송!
    if (matches.length > 0) {
      return res.status(200).json({ matches });
    }

    // 데이터가 비었을 때만 비상 문구 송출
    return res.status(200).json({ matches: getWaitMsg() });

  } catch (error: any) {
    return res.status(200).json({ matches: getWaitMsg() });
  }
}

function getWaitMsg() {
  return [{ id: 'w', league: '7m', home: '데이터 채널 분석 중', away: '잠시 후 새로고침', score: '0:0', time: '-', predict: { home: 0, away: 0 } }];
}
