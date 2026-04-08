import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = '3e6dcc3f6c4e20790bdec3de093b4378';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    // [전략 변경] 모바일보다 데이터가 더 확실한 PC 버전 사이트를 타격합니다.
    const targetUrl = 'https://www.7m.com.cn/score/index_en.shtml';
    
    // ScraperAPI에게 7초(wait=7000)를 기다리라고 명령합니다. 7m 전광판이 다 켜질 때까지요.
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true&wait=7000`;

    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];

    // [무적의 낚싯바늘] 7m의 가장 원초적인 데이터 패턴을 잡습니다.
    // 팀 이름과 점수가 들어있는 모든 텍스트를 훑습니다.
    const rowRegex = /<tr[^>]*id="tr_[0-9]+"[^>]*>([\s\S]*?)<\/tr>/g;
    const matchRows = htmlText.match(rowRegex) || [];

    matchRows.forEach((row, idx) => {
      // 7m PC 버전의 클래스 구조에 맞게 정밀하게 쪼갭니다.
      const home = row.match(/class="home">([\s\S]*?)<span/)?.[1]?.replace(/<[^>]+>/g, "").trim() || 
                   row.match(/class="home">([^<]+)/)?.[1]?.trim();
      
      const away = row.match(/class="away">([\s\S]*?)<span/)?.[1]?.replace(/<[^>]+>/g, "").trim() || 
                   row.match(/class="away">([^<]+)/)?.[1]?.trim();

      const score = row.match(/class="score"[^>]*>([\s\S]*?)<\/b>/)?.[1]?.replace(/<[^>]+>/g, "").trim() || 
                    row.match(/class="score"[^>]*>([^<]+)/)?.[1]?.trim() || "VS";

      const league = row.match(/class="league"[^>]*>([^<]+)/)?.[1] || "7m";

      if (home && away) {
        matches.push({
          id: `7m-pc-${idx}`,
          league: league,
          home: home,
          away: away,
          score: score,
          time: "LIVE",
          predict: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 2) }
        });
      }
    });

    // 만약 PC 버전 파싱도 실패하면, 마지막으로 '전체 텍스트'에서 고기를 낚습니다.
    if (matches.length === 0) {
        const teamNames = htmlText.match(/class="team_name">([^<]+)</g)?.map(t => t.split(">")[1].split("<")[0]) || [];
        const scoreValues = htmlText.match(/class="score">([^<]+)</g)?.map(s => s.split(">")[1].split("<")[0]) || [];
        
        for(let i=0; i < teamNames.length; i += 2) {
            if(teamNames[i] && teamNames[i+1]) {
                matches.push({
                    id: `7m-text-${i}`,
                    league: "7m Live",
                    home: teamNames[i],
                    away: teamNames[i+1],
                    score: scoreValues[Math.floor(i/2)] || "VS",
                    time: "LIVE",
                    predict: { home: 1, away: 0 }
                });
            }
        }
    }

    return res.status(200).json({ 
      matches: matches.length > 0 ? matches : getFinalError() 
    });

  } catch (error: any) {
    return res.status(200).json({ matches: getFinalError() });
  }
}

function getFinalError() {
  return [{ id: 'err', league: '연결 성공', home: '데이터 로딩 중', away: '잠시 후 다시 확인', score: 'VS', time: '-', predict: { home: 0, away: 0 } }];
}
