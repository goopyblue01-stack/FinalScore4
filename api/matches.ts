import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    const matchUrl = `https://v3.football.api-sports.io/fixtures?date=${targetDate}`;
    const oddsUrl = `https://v3.football.api-sports.io/odds?date=${targetDate}`;

    const [matchRes, oddsRes] = await Promise.all([
      fetch(matchUrl, { headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
      fetch(oddsUrl, { headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } })
    ]);

    const matchData = await matchRes.json();
    const oddsData = await oddsRes.json();

    // 배당 매핑 (더 정교하게 수정)
    const oddsMap: any = {};
    (oddsData.response || []).forEach((o: any) => {
      // Bet365를 먼저 찾고 없으면 첫 번째 북메이커 선택
      const bookmaker = o.bookmakers.find((b: any) => b.name === 'Bet365') || o.bookmakers[0];
      const market = bookmaker?.bets.find((b: any) => b.name === 'Match Winner');
      if (market) {
        oddsMap[o.fixture.id] = {
          home: market.values.find((v: any) => v.value === 'Home')?.odd,
          draw: market.values.find((v: any) => v.value === 'Draw')?.odd,
          away: market.values.find((v: any) => v.value === 'Away')?.odd
        };
      }
    });

    const matches = (matchData.response || []).map((item: any) => {
      return {
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: item.league.name,
        home: item.teams.home.name,
        away: item.teams.away.name,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        status: item.fixture.status.short,
        elapsed: item.fixture.status.elapsed,
        korTime: new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }),
        predict: { home: Math.round((item.fixture.id % 15) / 10 + 1.2), away: Math.round(((item.fixture.id / 10) % 15) / 10 + 0.8) },
        probs: { home: 40, draw: 30, away: 30 },
        odds: oddsMap[item.fixture.id] || null // 데이터 없으면 null
      };
    });

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
