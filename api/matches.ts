import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  const { date } = req.query;
  const todayStr = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"})).toISOString().split('T')[0];
  const targetDate = typeof date === 'string' ? date : todayStr;

  try {
    // 1. 경기 목록 가져오기
    const matchUrl = `https://v3.football.api-sports.io/fixtures?date=${targetDate}`;
    // 2. 배당 목록 한 번에 가져오기 (호출 횟수를 아끼기 위해 날짜별 전체 배당 호출)
    const oddsUrl = `https://v3.football.api-sports.io/odds?date=${targetDate}`;

    const [matchRes, oddsRes] = await Promise.all([
      fetch(matchUrl, { headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } }),
      fetch(oddsUrl, { headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } })
    ]);

    const matchData = await matchRes.json();
    const oddsData = await oddsRes.json();

    // 배당 데이터를 매치 ID별로 매핑 (Bet365 데이터 우선 사용)
    const oddsMap: any = {};
    (oddsData.response || []).forEach((o: any) => {
      const bookmaker = o.bookmakers.find((b: any) => b.name === 'Bet365') || o.bookmakers[0];
      const market = bookmaker?.bets.find((b: any) => b.name === 'Match Winner');
      if (market) {
        oddsMap[o.fixture.id] = {
          home: market.values.find((v: any) => v.value === 'Home')?.odd || "1.00",
          draw: market.values.find((v: any) => v.value === 'Draw')?.odd || "1.00",
          away: market.values.find((v: any) => v.value === 'Away')?.odd || "1.00"
        };
      }
    });

    const matches = (matchData.response || []).map((item: any) => {
      const status = item.fixture.status.short;
      const korTime = new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' });
      
      const seed = item.fixture.id;
      const hExp = Math.round(((seed % 15) / 10 + 1.2));
      const aExp = Math.round((((seed / 10) % 15) / 10 + 0.8));
      
      // 실제 배당 데이터 연결 (없으면 가상 데이터 생성)
      const realOdds = oddsMap[item.fixture.id] || { home: "1.80", draw: "3.20", away: "4.50" };

      return {
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: item.league.name,
        home: item.teams.home.name,
        away: item.teams.away.name,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        status: status,
        elapsed: item.fixture.status.elapsed,
        korTime: korTime,
        predict: { home: hExp, away: aExp },
        probs: { home: 40, draw: 30, away: 30 }, // 실제 승률로 보정 가능
        odds: realOdds // 실제 해외 배당 추가
      };
    });

    return res.status(200).json({ matches: matches.slice(0, 50) });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
