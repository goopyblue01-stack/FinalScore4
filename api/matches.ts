import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [번역 사전] 사장님, 여기에 팀명이 보일 때마다 한글을 추가하시면 앱이 점점 완벽해집니다!
const translator: { [key: string]: string } = {
  "Premier League": "프리미어리그", "La Liga": "라리가", "K-League 1": "K리그 1",
  "Manchester City": "맨시티", "Arsenal": "아스널", "Liverpool": "리버풀",
  "Real Madrid": "레알 마드리드", "FC Barcelona": "바르셀로나",
  "Philippine Army": "필리핀 아미", "Kaya": "카야 FC", "PFL": "필리핀 리그"
};

const translate = (text: string) => translator[text] || text;

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
      headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' }
    });
    const data = await response.json();

    const matches = (data.response || []).map((item: any) => ({
      id: item.fixture.id,
      league: translate(item.league.name), // 서버에서 번역
      home: translate(item.teams.home.name), // 서버에서 번역
      away: translate(item.teams.away.name), // 서버에서 번역
      scoreHome: item.goals.home ?? 0,
      scoreAway: item.goals.away ?? 0,
      time: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture.status.short,
      predict: { 
        home: (parseInt(String(item.fixture.id).slice(-1)) % 3) + 1, 
        away: (parseInt(String(item.fixture.id).slice(-2, -1)) % 2) 
      }
    }));

    return res.status(200).json({ matches: matches.slice(0, 50) });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
