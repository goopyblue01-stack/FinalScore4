import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 날짜별로 데이터가 다르게 보여야 하므로 캐시를 1분(60초)으로 줄여서 더 정확하게 만듭니다.
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 사용자가 클릭한 날짜를 받아옵니다. (없으면 오늘 날짜)
  const { date } = req.query;
  const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  const todayStr = today.toISOString().split('T')[0];
  const targetDate = typeof date === 'string' ? date : todayStr;

  try {
    /**
     * [지능형 주소 선택]
     * 1. 오늘 날짜라면? -> 진짜 생생한 '라이브' 경기를 우선 가져옵니다.
     * 2. 오늘이 아닌 과거/미래라면? -> 해당 날짜의 '전체 경기' 리스트를 가져옵니다.
     */
    let targetUrl = `https://v3.football.api-sports.io/fixtures?date=${targetDate}`;
    if (targetDate === todayStr) {
      targetUrl = 'https://v3.football.api-sports.io/fixtures?live=all';
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': API_KEY || '',
        'x-rapidapi-host': 'v3.football.api-sports.io'
      }
    });

    const data = await response.json();
    
    // 만약 라이브 경기가 하나도 없으면(오늘인데 경기가 아직 안 시작했으면) 그날의 전체 일정을 다시 가져옵니다.
    if (targetDate === todayStr && (!data.response || data.response.length === 0)) {
      const fallbackRes = await fetch(`https://v3.football.api-sports.io/fixtures?date=${targetDate}`, {
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' }
      });
      const fallbackData = await fallbackRes.json();
      data.response = fallbackData.response;
    }

    const matches = (data.response || []).map((item: any) => ({
      id: item.fixture.id,
      league: item.league.name,
      home: item.teams.home.name,
      away: item.teams.away.name,
      // 점수가 없으면 VS로 표시
      score: item.goals.home !== null ? `${item.goals.home}:${item.goals.away}` : "VS",
      // 경기 시간 또는 상태 표시
      time: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture.status.short,
      predict: { 
        home: Math.floor(Math.random() * 3), 
        away: Math.floor(Math.random() * 2) 
      }
    }));

    return res.status(200).json({ matches: matches.slice(0, 50) }); // 너무 많으면 50개까지만

  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
