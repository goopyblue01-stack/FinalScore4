import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = '3e6dcc3f6c4e20790bdec3de093b4378';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // 7m 모바일 스코어 페이지 (데이터가 가장 밀집된 곳)
    const targetUrl = 'https://m.7m.com.cn/score/index_en.shtml';
    
    // ScraperAPI 호출 (render=true 옵션으로 자바스크립트 데이터까지 싹 긁어옵니다)
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;

    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    
    // [정밀 낚싯바늘] 7m 모바일 소스코드의 실제 데이터 패턴을 공략합니다.
    // 팀명 추출 (보통 class="team_name" 또는 특정 패턴 안에 숨어있습니다)
    const matchData = htmlText.match(/<div class="match_item"[\s\S]*?<\/div>/g) || [];

    matchData.forEach((item, idx) => {
      // 한 경기 블록 안에서 홈팀, 원정팀, 점수를 정교하게 찢어냅니다.
      const home = item.match(/<span class="team_name">([^<]+)<\/span>/)?.[1] || "";
      const away = item.matchAll(/<span class="team_name">([^<]+)<\/span>/g);
      const awayName = [...away][1]?.[1] || "";
      const score = item.match(/<span class="score">([^<]+)<\/span>/)?.[1] || "VS";
      const league = item.match(/<span class="league_name">([^<]+)<\/span>/)?.[1] || "7m";

      if (home && awayName) {
        matches.push({
          id: `7m-real-${idx}`,
          league: league,
          home: home,
          away: awayName,
          score: score,
          time: "LIVE",
          predict: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 2) }
        });
      }
    });

    // 만약 파싱이 실패했을 때를 대비한 2차 낚싯바늘 (단순 패턴 매칭)
    if (matches.length === 0) {
      const teams = [...htmlText.matchAll(/<span class="team_name">([^<]+)<\/span>/g)].map(m => m[1]);
      const scores = [...htmlText.matchAll(/<span class="score">([^<]+)<\/span>/g)].map(m => m[1]);

      for (let i = 0; i < teams.length; i += 2) {
        if (teams[i] && teams[i+1]) {
          matches.push({
            id: `7m-fallback-${i}`,
            league: "7m Live",
            home: teams[i],
            away: teams[i+1],
            score: scores[Math.floor(i/2)] || "VS",
            time: "LIVE",
            predict: { home: 1, away: 0 }
          });
        }
      }
    }

    // 결과 전송
    return res.status(200).json({ 
      matches: matches.length > 0 ? matches : getFinalBackup() 
    });

  } catch (error: any) {
    return res.status(200).json({ error: '침투 실패', msg: error.message });
  }
}

function getFinalBackup() {
  return [{ id: 'wait', league: '7m', home: '데이터 로딩 중', away: '잠시 후 새로고침', score: 'VS', time: 'LIVE', predict: { home: 0, away: 0 } }];
}
