import type { VercelRequest, VercelResponse } from '@vercel.node';

// [보안] 키값을 코드에 직접 적지 않고, 사장님이 Vercel에 설정한 변수명을 가져와 씁니다.
const API_KEY = process.env.API_SPORTS_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // [가성비 설정] 15분(900초) 동안은 누가 접속해도 본사에 묻지 않고 저장된 데이터를 보여줍니다.
  // 하루 100회 무료 플랜을 안전하게 지켜주는 방어막입니다.
  res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 키가 설정되지 않았을 경우를 대비한 안전장치
  if (!API_KEY) {
    return res.status(200).json({ 
      matches: [{ id: 'err', league: '설정 오류', home: 'API 키를', away: '확인해주세요', score: '0:0', time: '-', predict: { home: 0, away: 0 } }] 
    });
  }

  try {
    // API-Sports의 축구 실시간 데이터 주소
    const targetUrl = 'https://v3.football.api-sports.io/fixtures?live=all';
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY,
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    
    // 데이터가 성공적으로 왔는지 확인
    if (!data.response || data.response.length === 0) {
      return res.status(200).json({ matches: getNoMatchMessage() });
    }

    // [중요] 필요한 데이터만 쏙쏙 골라서 사장님 앱 형식으로 예쁘게 포장합니다.
    const matches = data.response.map((item: any) => ({
      id: item.fixture.id,
      league: item.league.name, // 리그명
      home: item.teams.home.name, // 홈팀명
      away: item.teams.away.name, // 원정팀명
      score: `${item.goals.home ?? 0}:${item.goals.away ?? 0}`, // 실시간 점수
      time: `${item.fixture.status.elapsed}'`, // 경기 진행 시간
      predict: { 
        home: Math.floor(Math.random() * 3), // AI 예상 스코어 (임시 랜덤값)
        away: Math.floor(Math.random() * 2) 
      }
    }));

    return res.status(200).json({ matches });

  } catch (error) {
    return res.status(200).json({ matches: getNoMatchMessage() });
  }
}

// 경기가 없을 때 보여줄 깔끔한 메시지
function getNoMatchMessage() {
  return [{ id: 'none', league: '안내', home: '현재 진행 중인', away: '경기가 없습니다', score: 'VS', time: '-', predict: { home: 0, away: 0 } }];
}
