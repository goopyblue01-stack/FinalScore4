import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 보안 설정 및 한글 깨짐 방지
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // 7m 침투 시도 (타임아웃 설정으로 무한 대기 방지)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 넘으면 포기

    const targetUrl = 'https://m.7m.com.cn/data/index_en.xml'; 

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'Referer': 'https://m.7m.com.cn/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      }
    }).catch(() => null);

    clearTimeout(timeoutId);

    // 만약 7m에서 응답이 없거나 막혔다면 바로 '긴급 보장 데이터'로 넘어갑니다.
    if (!response || !response.ok) {
        return res.status(200).json({ matches: getFallbackData() });
    }

    const xmlText = await response.text();
    const matches: any[] = [];

    // 데이터 파싱 시도
    const matchBlocks = xmlText.match(/<match>([\s\S]*?)<\/match>/g) || [];

    if (matchBlocks.length === 0) {
        return res.status(200).json({ matches: getFallbackData() });
    }

    matchBlocks.forEach((block, idx) => {
      matches.push({
        id: `7m-${idx}`,
        league: block.match(/<league>([^<]+)<\/league>/)?.[1] || "League",
        home: block.match(/<hometeam>([^<]+)<\/hometeam>/)?.[1] || "Home",
        away: block.match(/<awayteam>([^<]+)<\/awayteam>/)?.[1] || "Away",
        score: block.match(/<score>([^<]+)<\/score>/)?.[1] || "VS",
        time: "LIVE",
        predict: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 2) }
      });
    });

    return res.status(200).json({ matches });

  } catch (error) {
    // 어떤 에러가 나도 서버는 죽지 않고 예비 데이터를 보냅니다.
    console.error("에러 발생!");
    return res.status(200).json({ matches: getFallbackData() });
  }
}

// 7m이 차단했을 때 보여줄 '긴급 보험' 데이터
function getFallbackData() {
  return [
    { id: 'f-1', league: 'K-League 1', home: '울산 HD', away: '전북 현대', score: '2:1', time: '종료', predict: { home: 2, away: 1 } },
    { id: 'f-2', league: 'EPL', home: '맨시티', away: '리버풀', score: 'VS', time: '23:00', predict: { home: 3, away: 2 } },
    { id: 'f-3', league: '라리가', home: '레알 마드리드', away: '바르셀로나', score: 'VS', time: '04:00', predict: { home: 1, away: 1 } }
  ];
}
