import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = '3e6dcc3f6c4e20790bdec3de093b4378';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    const targetUrl = 'https://m.7m.com.cn/score/index_en.shtml';
    
    // [핵심 변경] render=true에 wait=5000(5초 대기)을 추가하여 실시간 점수가 뜰 때까지 기다립니다.
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true&wait=5000`;

    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    
    // 7m 모바일의 실제 데이터 구조인 li 태그(class="match-item")를 공략합니다.
    const matchBlocks = htmlText.match(/<li[^>]*class="[^"]*match-item[^"]*"[^>]*>([\s\S]*?)<\/li>/g) || [];

    matchBlocks.forEach((block, idx) => {
      // 7m 특유의 클래스명을 정교하게 파싱합니다.
      const home = block.match(/<span[^>]*class="[^"]*home-team-name[^"]*"[^>]*>([^<]+)<\/span>/)?.[1] || 
                   block.match(/<div[^>]*class="[^"]*home-name[^"]*"[^>]*>([^<]+)<\/div>/)?.[1] || "";
      
      const away = block.match(/<span[^>]*class="[^"]*away-team-name[^"]*"[^>]*>([^<]+)<\/span>/)?.[1] || 
                   block.match(/<div[^>]*class="[^"]*away-name[^"]*"[^>]*>([^<]+)<\/div>/)?.[1] || "";

      const score = block.match(/<span[^>]*class="[^"]*score[^"]*"[^>]*>([^<]+)<\/span>/)?.[1] || "VS";
      const league = block.match(/<span[^>]*class="[^"]*league-name[^"]*"[^>]*>([^<]+)<\/span>/)?.[1] || "7m";

      if (home && away) {
        matches.push({
          id: `7m-${idx}`,
          league: league.trim(),
          home: home.trim(),
          away: away.trim(),
          score: score.trim(),
          time: "LIVE",
          predict: { 
            home: Math.floor(Math.random() * 3), 
            away: Math.floor(Math.random() * 2) 
          }
        });
      }
    });

    // 만약 그물에 걸린 게 없다면, 최후의 수단으로 텍스트 기반 낚시를 시도합니다.
    if (matches.length === 0) {
      const teamNames = htmlText.match(/<span class="team_name">([^<]+)<\/span>/g)?.map(t => t.replace(/<[^>]+>/g, '')) || [];
      const scoreValues = htmlText.match(/<span class="score">([^<]+)<\/span>/g)?.map(s => s.replace(/<[^>]+>/g, '')) || [];
      
      for(let i=0; i < teamNames.length; i += 2) {
        if(teamNames[i] && teamNames[i+1]) {
          matches.push({
            id: `7m-fallback-${i}`,
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
      matches: matches.length > 0 ? matches : getEmptyMsg() 
    });

  } catch (error: any) {
    return res.status(200).json({ matches: getEmptyMsg() });
  }
}

function getEmptyMsg() {
  return [{ id: 'err', league: '알림', home: '현재 진행 중인', away: '경기가 없습니다.', score: '0:0', time: '-', predict: { home: 0, away: 0 } }];
}
