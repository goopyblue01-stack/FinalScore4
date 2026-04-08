import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [한글 번역 사전] 자주 나오는 팀들을 여기에 추가하세요!
const translator: { [key: string]: string } = {
  "Man City": "맨시티", "Arsenal": "아스널", "Liverpool": "리버풀", "Real Madrid": "레알 마드리드",
  "Barcelona": "바르셀로나", "Bayern Munich": "뮌헨", "Tottenham": "토트넘", "Man United": "맨유",
  "Philippine Army": "필리핀 아미", "Kaya": "카야 FC", "PFL": "필리핀 리그", "Premier League": "EPL"
};

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

    const matches = (data.response || []).map((item: any) => {
      const hName = item.teams.home.name;
      const aName = item.teams.away.name;
      const lName = item.league.name;

      return {
        id: item.fixture.id,
        league: translator[lName] || lName,
        home: translator[hName] || hName, // 사전에 있으면 한글, 없으면 영어
        away: translator[aName] || aName,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        scoreText: item.goals.home !== null ? `${item.goals.home}:${item.goals.away}` : "VS",
        time: item.fixture.status.elapsed ? `${item.fixture.status.elapsed}'` : item.fixture.status.short,
        predict: { home: Math.floor(Math.random() * 3), away: Math.floor(Math.random() * 2) }
      };
    });

    return res.status(200).json({ matches: matches.slice(0, 50) });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
