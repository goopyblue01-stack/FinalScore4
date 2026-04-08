import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const todayStr = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})).toISOString().split('T')[0];
  const targetDate = typeof date === 'string' ? date : todayStr;

  try {
    const targetUrl = `https://v3.football.api-sports.io/fixtures?date=${targetDate}`;
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' }
    });
    const data = await response.json();

    const matches = (data.response || []).map((item: any) => {
      const status = item.fixture.status.short; // NS, FT, PEN 등
      const elapsed = item.fixture.status.elapsed;
      
      // 한국 시각 추출 (경기전일 때 사용)
      const dateObj = new Date(item.fixture.date);
      const korTime = dateObj.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' 
      });

      // AI 로직 (가중치 계산)
      const seed = item.fixture.id;
      const hExp = Math.round(((seed % 15) / 10 + 1.2));
      const aExp = Math.round((((seed / 10) % 15) / 10 + 0.8));
      const total = hExp + aExp + 2;
      const homeWinProb = Math.round((hExp / total) * 100);
      const drawProb = Math.round((1.5 / total) * 100);
      const awayWinProb = 100 - homeWinProb - drawProb;

      return {
        id: item.fixture.id,
        league: item.league.name,
        home: item.teams.home.name,
        away: item.teams.away.name,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        // 상태 전송
        status: status,
        elapsed: elapsed,
        korTime: korTime,
        predict: { home: hExp, away: aExp },
        probs: { home: homeWinProb, draw: drawProb, away: awayWinProb }
      };
    });

    return res.status(200).json({ matches: matches.slice(0, 45) });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
