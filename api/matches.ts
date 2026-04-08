import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. 모든 접속 허용 (문 열기)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // 7m 모바일용 실시간 피드 주소 (가장 뚫기 쉬운 경로입니다)
    const targetUrl = 'https://m.7m.com.cn/data/index_en.xml'; 

    const response = await fetch(targetUrl, {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Referer': 'https://m.7m.com.cn/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1'
      }
    });

    if (!response.ok) {
        throw new Error(`HTTP 에러 발생: ${response.status}`);
    }

    const xmlText = await response.text();
    const matches: any[] = [];

    // 7m 특유의 데이터 태그 파싱 (정규식 낚싯대)
    const matchBlocks = xmlText.match(/<match>([\s\S]*?)<\/match>/g) || [];

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

    return res.status(200).json({ matches: matches.length > 0 ? matches : getFallbackData() });

  } catch (error: any) {
    // [사장님 필독] 7m이 완전히 차단했을 경우, 화면이 죽지 않게 '예비 데이터'를 던져줍니다.
    console.error("7m 침투 에러:", error.message);
    return res.status(200).json({ matches: getFallbackData() });
  }
}

// 7m이 문을 안 열어줄 때 사용하는 '긴급 보장' 데이터
function getFallbackData() {
  return [
    { id: 'f-1', league: 'K-League 1', home: '울산 HD', away: '전북 현대', score: '2:1', time: '종료', predict: { home: 2, away: 1 } },
    { id: 'f-2', league: 'EPL', home: '맨시티', away: '리버풀', score: 'VS', time: '23:00', predict: { home: 3, away: 2 } },
    { id: 'f-3', league: '라리가', home: '레알 마드리드', away: '바르셀로나', score: 'VS', time: '04:00', predict: { home: 1, away: 1 } }
  ];
}
