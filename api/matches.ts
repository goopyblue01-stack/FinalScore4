import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [1. 리그 한글 매핑 리스트]
const leagueNameMap: { [key: number]: string } = {
  39: "잉글랜드 프리미어리그", 40: "잉글랜드 챔피언십", 45: "잉글랜드 FA컵", 48: "EFL컵",
  140: "스페인 라리가", 141: "스페인 세군다 디비시온", 143: "코파 델 레이",
  78: "독일 분데스리가", 79: "독일 2. 분데스리가", 81: "DFB 포칼",
  135: "이탈리아 세리에 A", 136: "이탈리아 세리에 B", 137: "코파 이탈리아",
  61: "프랑스 리그 앙", 62: "프랑스 리그 두", 66: "쿠프 드 프랑스",
  88: "네덜란드 에레디비시", 89: "네덜란드 에이르스터 디비시", 90: "네덜란드 KNVB 베이커",
  179: "스코틀랜드 프리미어십", 180: "스코틀랜드 챔피언십", 183: "스코틀랜드 컵",
  94: "포르투갈 프리메이라리가", 95: "리가 포르투갈 2", 96: "타사 드 포르투갈",
  203: "튀르키예 수페르리그", 204: "튀르키예 1. 리그", 205: "튀르키예 컵",
  197: "그리스 슈퍼리그 1", 198: "그리스 슈퍼리그 2", 199: "그리스 컵",
  106: "폴란드 엑스트라클라사", 107: "폴란드 I 리가", 108: "폴란드 컵",
  103: "노르웨이 엘리테세리엔", 104: "노르웨이 1. 디비전", 105: "노르웨이 컵",
  119: "덴마크 수페르리가", 120: "덴마크 1. 디비전", 121: "덴마크 DBU 포칼렌",
  172: "불가리아 1부 리그", 173: "불가리아 2부 리그", 174: "불가리아 컵",
  271: "헝가리 NB I", 272: "헝가리 NB II", 273: "헝가리 머저르 쿠퍼",
  218: "크로아티아 HNL", 219: "크로아티아 Prva NL", 220: "크로아티아 컵",
  144: "벨기에 주필러 프로리그", 145: "벨기에 챌린저 프로리그", 146: "벨기에 컵",
  207: "스위스 슈퍼리그", 208: "스위스 챌린지 리그", 209: "스위스 컵",
  357: "아일랜드 프리미어 디비전", 358: "아일랜드 1부 디비전", 359: "아일랜드 FAI 컵",
  292: "K리그 1", 293: "K리그 2", 295: "코리아컵",
  98: "J1 리그", 99: "J2 리그", 102: "일본 일왕배", 101: "J리그컵",
  169: "중국 슈퍼리그", 170: "중국 갑급 리그", 171: "중국 CFA 컵",
  253: "미국 MLS", 255: "미국 USL 챔피언십", 257: "미국 US 오픈컵",
  262: "멕시코 리가 MX", 263: "멕시코 리가 데 익스판시온", 264: "멕시코 코파 MX",
  71: "브라질 세리에 A", 72: "브라질 세리에 B", 73: "브라질 코파 두 브라질",
  128: "아르헨티나 리가 프로페셔널", 129: "아르헨티나 프리메라 나시오날", 130: "아르헨티나 코파 아르헨티나",
  188: "호주 A-리그", 189: "호주 오스트레일리아 컵",
  1: "FIFA 월드컵", 4: "UEFA 유로", 5: "UEFA 네이션스 리그", 9: "코파 아메리카",
  2: "UEFA 챔피언스리그", 3: "UEFA 유로파리그", 848: "UEFA 유로파 컨퍼런스리그", 13: "코파 리베르타도레스", 17: "AFC 챔피언스리그"
};

// ==========================
// 🔥 Logic B: 시간 가중치 폼 계산 함수
// ==========================
function calcForm(matches: any[], isAttack: boolean) {
  if (matches.length === 0) return 1.3;
  let total = 0, weightSum = 0;
  matches.forEach((m) => {
    const days = (Date.now() - new Date(m.date).getTime()) / (1000 * 60 * 60 * 24);
    const timeWeight = Math.exp(-days / 30);
    const val = isAttack ? m.goals : m.conceded;
    total += val * timeWeight;
    weightSum += timeWeight;
  });
  const avg = total / weightSum;
  return isAttack ? Math.max(0.5, avg) : Math.max(0.3, avg);
}

function factorial(n: number): number { return n <= 1 ? 1 : n * factorial(n - 1); }
function poissonProb(lambda: number, k: number) { return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k); }

function poisson(homeGoals: number, awayGoals: number) {
  const max = 6;
  let matrix = [];
  for (let i = 0; i <= max; i++) {
    for (let j = 0; j <= max; j++) {
      const p = poissonProb(homeGoals, i) * poissonProb(awayGoals, j);
      matrix.push({ homeScore: i, awayScore: j, p });
    }
  }
  const homeWin = matrix.filter((m) => m.homeScore > m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const draw = matrix.filter((m) => m.homeScore === m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const awayWin = matrix.filter((m) => m.homeScore < m.awayScore).reduce((sum, m) => sum + m.p, 0);
  const total = homeWin + draw + awayWin;
  
  return {
    prob: { 
      home: Math.round((homeWin / total) * 100), 
      draw: Math.round((draw / total) * 100), 
      away: Math.round((awayWin / total) * 100) 
    }
  };
}

// 🛡️ API 보호용 글로벌 메모리 캐시
let fixturesCache: { [dateStr: string]: { timestamp: number, data: any } } = {};
let predictionCache: { [leagueSeason: string]: { timestamp: number, data: any[] } } = {};
let oddsCache: { [fixtureId: number]: { timestamp: number, data: any } } = {}; 
let standingsCache: { [leagueSeason: string]: { timestamp: number, data: any } } = {};
let eventsCache: { [fixtureId: number]: { timestamp: number, data: any[] } } = {};
let lineupsCache: { [fixtureId: number]: { timestamp: number, data: any[] } } = {}; // 🔥 라인업 캐시 추가

const FIXTURES_CACHE_TTL = 1 * 60 * 1000;
const CACHE_TTL = 60 * 60 * 1000; 
const ODDS_CACHE_TTL = 2 * 60 * 60 * 1000;
const STANDINGS_CACHE_TTL = 6 * 60 * 60 * 1000; 

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  const targetDateStr = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    const now = Date.now();
    const prevDate = new Date(targetDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const fetchAPI = (endpoint: string, params: string) => 
      fetch(`https://v3.football.api-sports.io/${endpoint}?${params}`, { 
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } 
      }).then(r => r.json());

    const getFixturesWithCache = async (dateString: string) => {
      if (fixturesCache[dateString] && (now - fixturesCache[dateString].timestamp < FIXTURES_CACHE_TTL)) {
        return fixturesCache[dateString].data;
      }
      const data = await fetchAPI('fixtures', `date=${dateString}`);
      if (data.errors && Object.keys(data.errors).length > 0) {
        console.error(`API Error for ${dateString}:`, data.errors);
      } else {
        fixturesCache[dateString] = { timestamp: now, data };
      }
      return data;
    };

    const [targetData, prevDataResult] = await Promise.all([
      getFixturesWithCache(targetDateStr),
      getFixturesWithCache(prevDateStr)
    ]);

    const allMatches = [...(targetData.response || []), ...(prevDataResult.response || [])];

    const rawFilteredMatches = allMatches.filter((item: any) => {
      if (leagueNameMap[item.league.id] === undefined) return false;
      const matchDateKST = new Date(item.fixture.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
      return matchDateKST === targetDateStr;
    });

    const uniqueLeagues = new Set<string>();
    rawFilteredMatches.forEach((m: any) => { uniqueLeagues.add(`${m.league.id}-${m.league.season}`); });

    const standingsPromises = Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      if (!standingsCache[key] || now - standingsCache[key].timestamp > STANDINGS_CACHE_TTL) {
        const res = await fetchAPI('standings', `league=${leagueId}&season=${season}`);
        if (res && res.response && res.response.length > 0) {
          standingsCache[key] = { timestamp: now, data: res };
        }
      }
      return standingsCache[key]?.data || null;
    });
    const standingsResults = await Promise.all(standingsPromises);

    const leagueAvgMap: { [key: string]: number } = {};
    const leagueStandingsMap: { [key: string]: any[][] } = {};

    standingsResults.forEach((res: any) => {
      try {
        if (res && res.response && res.response.length > 0 && res.response[0].league.standings) {
          const leagueInfo = res.response[0].league;
          const leagueKey = `${leagueInfo.id}-${leagueInfo.season}`;
          
          leagueStandingsMap[leagueKey] = leagueInfo.standings.map((group: any[]) => {
            if (!Array.isArray(group)) return [];
            return group.map((t: any) => {
              const tName = t.team.name;
              const mappedName = teamNameMap[tName] || tName;
              return {
                rank: t.rank,
                team: { en: tName, ko: mappedName },
                played: t.all.played,
                win: t.all.win,
                draw: t.all.draw,
                lose: t.all.lose,
                goalDiff: t.goalsDiff,
                points: t.points
              };
            });
          });

          let totalGoals = 0, totalPlayed = 0;
          leagueInfo.standings.forEach((group: any[]) => {
            if (Array.isArray(group)) {
              group.forEach((team: any) => {
                if (team.all && team.all.goals && team.all.goals.for !== undefined) {
                  totalGoals += team.all.goals.for;
                  totalPlayed += team.all.played;
                }
              });
            }
          });
          let calcAvg = totalPlayed > 0 ? totalGoals / totalPlayed : 1.3;
          if (calcAvg < 0.9) calcAvg = 1.2; 
          if (calcAvg > 2.5) calcAvg = 2.0; 
          leagueAvgMap[leagueKey] = calcAvg;
        }
      } catch (e) {}
    });

    await Promise.all(Array.from(uniqueLeagues).map(async (key) => {
      const [leagueId, season] = key.split('-');
      if (!predictionCache[key] || now - predictionCache[key].timestamp > CACHE_TTL) {
        const pastMatchesRes = await fetchAPI('fixtures', `league=${leagueId}&season=${season}&status=FT`);
        predictionCache[key] = { timestamp: now, data: pastMatchesRes.response || [] };
      }
    }));

    const batchSize = 5; 

    // 해외 배당 가져오기
    const fixturesToFetchOdds = rawFilteredMatches.filter(item => {
      const fId = item.fixture.id;
      return !oddsCache[fId] || now - oddsCache[fId].timestamp > ODDS_CACHE_TTL;
    });

    for (let i = 0; i < fixturesToFetchOdds.length; i += batchSize) {
      const batch = fixturesToFetchOdds.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item: any) => {
        const fId = item.fixture.id;
        try {
          const oddsRes = await fetchAPI('odds', `fixture=${fId}&bet=1`);
          let oddsData = null;
          if (oddsRes && oddsRes.response && oddsRes.response.length > 0) {
            let bookmaker = oddsRes.response[0].bookmakers.find((b: any) => b.id === 8 || b.name === 'Bet365');
            if (!bookmaker) bookmaker = oddsRes.response[0].bookmakers[0]; 
            const market = bookmaker?.bets[0];
            if (market) {
              oddsData = {
                home: market.values.find((v: any) => v.value === 'Home' || v.value === '1')?.odd,
                draw: market.values.find((v: any) => v.value === 'Draw' || v.value === 'X')?.odd,
                away: market.values.find((v: any) => v.value === 'Away' || v.value === '2')?.odd
              };
            }
          }
          oddsCache[fId] = { timestamp: now, data: oddsData };
        } catch (e) {
          oddsCache[fId] = { timestamp: now, data: null };
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 경기 이벤트 가져오기
    const fixturesToFetchEvents = rawFilteredMatches.filter((item: any) => {
      const fId = item.fixture.id;
      const status = item.fixture.status.short;
      if (status === 'NS') return false; 
      const cached = eventsCache[fId];
      if (!cached) return true; 
      const isFinished = ['FT', 'AET', 'PEN'].includes(status);
      const ttl = isFinished ? 24 * 60 * 60 * 1000 : 2 * 60 * 1000;
      return now - cached.timestamp > ttl;
    });

    for (let i = 0; i < fixturesToFetchEvents.length; i += batchSize) {
      const batch = fixturesToFetchEvents.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item: any) => {
        const fId = item.fixture.id;
        try {
          const eventsRes = await fetchAPI('fixtures/events', `fixture=${fId}`);
          eventsCache[fId] = { timestamp: now, data: eventsRes.response || [] };
        } catch (e) {
          eventsCache[fId] = { timestamp: now, data: [] };
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // 🔥 [선발 명단(Lineups) 가져오기 로직]
    const fixturesToFetchLineups = rawFilteredMatches.filter((item: any) => {
      const fId = item.fixture.id;
      const status = item.fixture.status.short;
      const timeToKickoff = item.fixture.timestamp * 1000 - now;

      if (['PST', 'CANC', 'TBD', 'ABD'].includes(status)) return false;
      // 시작까지 1시간 이상 남은 경기는 스킵
      if (status === 'NS' && timeToKickoff > 60 * 60 * 1000) return false;

      const cached = lineupsCache[fId];
      if (!cached) return true;
      const isFinished = ['FT', 'AET', 'PEN'].includes(status);
      const ttl = isFinished ? 24 * 60 * 60 * 1000 : 5 * 60 * 1000;
      return now - cached.timestamp > ttl;
    });

    for (let i = 0; i < fixturesToFetchLineups.length; i += batchSize) {
      const batch = fixturesToFetchLineups.slice(i, i + batchSize);
      await Promise.all(batch.map(async (item: any) => {
        const fId = item.fixture.id;
        try {
          const res = await fetchAPI('fixtures/lineups', `fixture=${fId}`);
          lineupsCache[fId] = { timestamp: now, data: res.response || [] };
        } catch (e) {
          lineupsCache[fId] = { timestamp: now, data: [] };
        }
      }));
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    const filteredMatches = rawFilteredMatches.map((item: any) => {
      const hName = item.teams.home.name;
      const aName = item.teams.away.name;
      const homeId = item.teams.home.id;
      const awayId = item.teams.away.id;
      const leagueKey = `${item.league.id}-${item.league.season}`;
      
      const pastMatches = predictionCache[leagueKey]?.data || [];
      const validPastMatches = pastMatches.filter((m: any) => m.fixture.id !== item.fixture.id);
      const leagueAvgGoals = leagueAvgMap[leagueKey] || 1.3;

      const rawEvents = eventsCache[item.fixture.id]?.data || [];
      const mappedEvents = rawEvents.map((ev: any) => {
        let type = "";
        if (ev.type === "Goal") type = "goal";
        else if (ev.type === "Card" && ev.detail.includes("Yellow")) type = "yellow";
        else if (ev.type === "Card" && ev.detail.includes("Red")) type = "red";
        else if (ev.type === "subst") type = "sub";
        if (!type) return null; 
        return {
          minute: ev.time.elapsed,
          team: ev.team.id === homeId ? "home" : "away",
          type: type,
          player: ev.player?.name,
          playerOut: type === "sub" ? ev.player?.name : undefined,
          playerIn: type === "sub" ? ev.assist?.name : undefined
        };
      }).filter((e: any) => e !== null); 

      const getRecentMatches = (teamId: number, targetMatches: any[]) => {
        return targetMatches
          .filter((m: any) => m.teams.home.id === teamId || m.teams.away.id === teamId)
          .sort((a: any, b: any) => b.fixture.timestamp - a.fixture.timestamp)
          .slice(0, 5) 
          .map((m: any) => {
            const isHome = m.teams.home.id === teamId;
            return { 
              date: m.fixture.date, 
              isHome, 
              goals: isHome ? m.goals.home : m.goals.away, 
              conceded: isHome ? m.goals.away : m.goals.home
            };
          });
      };

      const homeRecent = getRecentMatches(homeId, validPastMatches);
      const awayRecent = getRecentMatches(awayId, validPastMatches);
      const homeAttack = calcForm(homeRecent.filter((m: any) => m.isHome), true);
      const homeDefense = calcForm(homeRecent.filter((m: any) => m.isHome), false);
      const awayAttack = calcForm(awayRecent.filter((m: any) => !m.isHome), true);
      const awayDefense = calcForm(awayRecent.filter((m: any) => !m.isHome), false);

      const allGroups = leagueStandingsMap[leagueKey] || [];
      let correctStandings: any[] = [];
      for (const group of allGroups) {
        if (Array.isArray(group) && group.some((s: any) => s.team?.en === hName || s.team?.en === aName)) {
          correctStandings = group;
          break;
        }
      }
      if (correctStandings.length === 0 && allGroups.length > 0) correctStandings = allGroups[0];

      const homeTeamInfo = correctStandings.find((s: any) => s.team?.en === hName);
      const awayTeamInfo = correctStandings.find((s: any) => s.team?.en === aName);
      const homeRank = homeTeamInfo ? homeTeamInfo.rank : 999;
      const awayRank = awayTeamInfo ? awayTeamInfo.rank : 999;

      let homeAdv = 1.10; let awayDis = 0.90;
      if (homeRank < awayRank) { homeAdv = 1.15; awayDis = 0.85; }
      else if (homeRank > awayRank) { homeAdv = 1.05; awayDis = 0.95; }

      let expectedHomeGoals = Math.max(0.5, homeAttack * (awayDefense / leagueAvgGoals) * homeAdv);
      let expectedAwayGoals = Math.max(0.5, awayAttack * (homeDefense / leagueAvgGoals) * awayDis);
      expectedHomeGoals = Math.min(expectedHomeGoals, 4.0);
      expectedAwayGoals = Math.min(expectedAwayGoals, 4.0);

      const logicBPredictions = poisson(expectedHomeGoals, expectedAwayGoals);
      const logicBProbHome = logicBPredictions.prob.home;
      const logicBProbDraw = logicBPredictions.prob.draw;
      const logicBProbAway = logicBPredictions.prob.away;

      let hasOdds = false;
      const matchOdds = oddsCache[item.fixture.id]?.data || null;
      let finalProbHome = logicBProbHome;
      let finalProbDraw = logicBProbDraw;
      let finalProbAway = logicBProbAway;

      if (matchOdds && matchOdds.home && matchOdds.draw && matchOdds.away) {
        const invHome = 1 / parseFloat(matchOdds.home);
        const invDraw = 1 / parseFloat(matchOdds.draw);
        const invAway = 1 / parseFloat(matchOdds.away);
        const totalInv = invHome + invDraw + invAway;
        const oH = (invHome / totalInv) * 100;
        const oD = (invDraw / totalInv) * 100;
        const oA = (invAway / totalInv) * 100;
        finalProbHome = Math.round((logicBProbHome * 0.6) + (oH * 0.4));
        finalProbDraw = Math.round((logicBProbDraw * 0.6) + (oD * 0.4));
        finalProbAway = Math.max(0, 100 - finalProbHome - finalProbDraw);
        hasOdds = true;
      }

      let predictHome = Math.round(expectedHomeGoals);
      let predictAway = Math.round(expectedAwayGoals);
      if (predictHome === predictAway) {
        if (finalProbHome - finalProbAway >= 10) predictHome += 1;
        else if (finalProbAway - finalProbHome >= 10) predictAway += 1;
      }

      const kstDate = new Date(new Date(item.fixture.date).toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
      const timeKo = `${kstDate.getMonth() + 1}/${kstDate.getDate()} (${['일', '월', '화', '수', '목', '금', '토'][kstDate.getDay()]}) ${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}`;
      const timeEn = `${kstDate.getMonth() + 1}/${kstDate.getDate()} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][kstDate.getDay()]}) ${String(kstDate.getHours()).padStart(2, '0')}:${String(kstDate.getMinutes()).padStart(2, '0')}`;

      return {
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: { en: item.league.name, ko: leagueNameMap[item.league.id] || item.league.name },
        home: { en: hName, ko: teamNameMap[hName] || hName },
        away: { en: aName, ko: teamNameMap[aName] || aName },
        time: { en: timeEn, ko: timeKo },
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        penHome: item.score?.penalty?.home ?? null,
        penAway: item.score?.penalty?.away ?? null,
        status: item.fixture.status.short,
        elapsed: item.fixture.status.elapsed,
        predict: { home: predictHome, away: predictAway },
        probs: { home: finalProbHome, draw: finalProbDraw, away: finalProbAway },
        odds: matchOdds,
        events: mappedEvents,
        lineups: lineupsCache[item.fixture.id]?.data || [], // 🔥 라인업 배송
        homeId: homeId, // 🔥 구분용
        awayId: awayId,
        standings: correctStandings
      };
    })
    .sort((a: any, b: any) => {
      const statusOrder: any = { 'LIVE': 0, '1H': 0, 'HT': 0, '2H': 0, 'ET': 0, 'P': 0, 'BT': 0, 'NS': 1, 'FT': 2, 'AET': 2, 'PEN': 2 };
      const orderA = statusOrder[a.status] ?? 3;
      const orderB = statusOrder[b.status] ?? 3;
      if (orderA !== orderB) return orderA - orderB;
      return a.timestamp - b.timestamp;
    });

    return res.status(200).json({ matches: filteredMatches });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
