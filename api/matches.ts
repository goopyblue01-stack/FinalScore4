import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [1. 리그 한글 매핑 리스트 - 80개 주요 대회]
const leagueNameMap: { [key: number]: string } = {
  39: "잉글랜드 프리미어리그", 40: "잉글랜드 챔피언십", 45: "잉글랜드 FA컵", 48: "EFL컵",
  140: "스페인 라리가", 141: "스페인 세군다", 143: "코파 델 레이", 147: "스페인 슈퍼컵",
  78: "독일 분데스리가", 79: "독일 2부", 81: "DFB 포칼", 529: "독일 슈퍼컵",
  135: "이탈리아 세리에 A", 136: "이탈리아 세리에 B", 137: "코파 이탈리아", 547: "이탈리아 슈퍼컵",
  61: "프랑스 리그 앙", 62: "프랑스 리그 두", 66: "쿠프 드 프랑스", 65: "프랑스 리그컵", 526: "프랑스 슈퍼컵",
  88: "네덜란드 에레디비시", 89: "네덜란드 2부", 90: "네덜란드 KNVB 베이커", 528: "네덜란드 슈퍼컵",
  179: "스코틀랜드 프리미어십", 180: "스코틀랜드 2부", 94: "포르투갈 프리메이라리가", 95: "포르투갈 2부", 96: "타사 드 포르투갈", 210: "포르투갈 리그컵", 550: "포르투갈 슈퍼컵",
  203: "튀르키예 수페르리그", 204: "튀르키예 1.리그", 205: "튀르키예 컵", 551: "튀르키예 슈퍼컵", 197: "그리스 슈퍼리그 1", 106: "폴란드 엑스트라클라사", 103: "노르웨이 엘리테세리엔", 119: "덴마크 수페르리가", 172: "불가리아 1부", 271: "헝가리 1부", 218: "크로아티아 1부", 144: "벨기에 프로리그", 207: "스위스 슈퍼리그", 357: "아일랜드 프리미어",
  292: "K리그 1", 293: "K리그 2", 295: "KFA 코리아컵", 98: "J1 리그", 99: "J2 리그", 102: "일본 천황배", 101: "J리그컵", 530: "일본 슈퍼컵", 169: "중국 슈퍼리그", 170: "중국 2부", 171: "중국 FA컵", 188: "호주 A리그", 189: "호주 FFA컵", 323: "베트남 V리그 1", 296: "태국 1부", 307: "사우디 프로리그", 323: "인도 슈퍼리그", 274: "인도네시아 1부", 305: "카타르 스타스 리그", 301: "UAE 프로리그", 280: "말레이시아 슈퍼리그", 310: "요르단 1부",
  253: "미국 MLS", 255: "미국 USL 챔피언십", 262: "멕시코 리가 MX", 71: "브라질 세리에 A", 1579: "캐나다 프리미어", 128: "아르헨티나 리가 프로페셔널", 268: "우루과이 1부", 281: "페루 1부", 239: "콜롬비아 1부", 233: "볼리비아 1부", 265: "칠레 1부", 242: "에콰도르 1부", 252: "파라과이 1부",
  2: "UEFA 챔피언스리그", 3: "UEFA 유로파리그", 848: "UEFA 컨퍼런스리그", 17: "AFC 챔피언스리그", 1: "월드컵", 5: "UEFA 네이션스리그", 9: "아시안컵", 134: "동아시안컵"
};

// [2. 주요 150개 팀 한글 매핑 리스트]
// 사장님, 아래 리스트에 없는 팀은 자동으로 영문명이 노출됩니다. 
// 나중에 영문명을 보고 여기에 한 줄씩 추가만 하시면 바로 한글로 바뀝니다.
const teamNameMap: { [key: string]: string } = {
  // 프리미어리그
  "Arsenal": "아스널", "Aston Villa": "아스톤 빌라", "Bournemouth": "본머스", "Brentford": "브렌트포드", "Brighton": "브라이튼", "Chelsea": "첼시", "Crystal Palace": "크리스탈 팰리스", "Everton": "에버턴", "Fulham": "풀럼", "Ipswich": "입스위치", "Leicester": "레스터", "Liverpool": "리버풀", "Manchester City": "맨시티", "Manchester United": "맨유", "Newcastle": "뉴캐슬", "Nottingham Forest": "노팅엄", "Southampton": "사우샘프턴", "Tottenham": "토트넘", "West Ham": "웨스트햄", "Wolves": "울버햄튼",
  // 라리가
  "Alaves": "알라베스", "Athletic Club": "빌바오", "Atletico Madrid": "AT 마드리드", "Barcelona": "바르셀로나", "Celta Vigo": "셀타 비고", "Espanyol": "에스파뇰", "Getafe": "헤타페", "Girona": "지로나", "Las Palmas": "라스팔마스", "Leganes": "레가네스", "Mallorca": "마요르카", "Osasuna": "오사수나", "Ray오 Vallecano": "라요", "Real Betis": "베티스", "Real Madrid": "레알 마드리드", "Real Sociedad": "소시에다드", "Sevilla": "세비야", "Valencia": "발렌시아", "Valladolid": "바야돌리드", "Villarreal": "비야레알",
  // 분데스리가
  "Augsburg": "아우크스부르크", "Bayer Leverkusen": "레버쿠젠", "Bayern Munich": "바이에른 뮌헨", "Borussia Dortmund": "도르트문트", "Borussia Monchengladbach": "글라트바흐", "Eintracht Frankfurt": "프랑크푸르트", "Freiburg": "프라이부르크", "Heidenheim": "하이덴하임", "Hoffenheim": "호펜하임", "Holstein Kiel": "홀슈타인 킬", "RB Leipzig": "라이프치히", "Mainz 05": "마인츠", "St. Pauli": "상파울루", "Stuttgart": "슈투트가르트", "Union Berlin": "우니온 베를린", "Werder Bremen": "브레멘", "Wolfsburg": "볼프스부르크",
  // 세리에 A
  "AC Milan": "AC 밀란", "Atalanta": "아탈란타", "Bologna": "볼로냐", "Cagliari": "칼리아리", "Como": "코모", "Empoli": "엠폴리", "Fiorentina": "피오렌티나", "Genoa": "제노아", "Inter": "인테르", "Juventus": "유벤투스", "Lazio": "라치오", "Lecce": "레체", "Monza": "몬차", "Napoli": "나폴리", "Parma": "파르마", "Roma": "AS 로마", "Torino": "토리노", "Udinese": "우디네세", "Venezia": "베네치아", "Verona": "베로나",
  // 리그 앙
  "Auxerre": "오세르", "Angers": "앙제", "Brest": "브레스투아", "Le Havre": "르아브르", "Lens": "랑스", "Lille": "릴", "Lyon": "리옹", "Marseille": "마르세유", "Monaco": "모나코", "Montpellier": "몽펠리에", "Nantes": "낭트", "Nice": "니스", "Paris Saint Germain": "PSG", "Reims": "랭스", "Rennes": "렌", "Saint Etienne": "생테티엔", "Strasbourg": "스트라스부르", "Toulouse": "툴루즈",
  // K리그 1
  "Ulsan HD": "울산 HD", "Pohang Steelers": "포항", "Gwangju FC": "광주", "Jeonbuk Motors": "전북", "Daegu FC": "대구", "Incheon United": "인천", "FC Seoul": "FC 서울", "Daejeon Citizen": "대전", "Jeju United": "제주", "Gangwon FC": "강원", "Suwon FC": "수원 FC", "Gimcheon Sangmu": "김천 상무"
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  const targetDateStr = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    const prevDate = new Date(targetDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const fetchAPI = (endpoint: string, params: string) => 
      fetch(`https://v3.football.api-sports.io/${endpoint}?${params}`, { 
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } 
      }).then(r => r.json());

    // 경기 정보와 배당 정보를 각각 오늘/전날치 가져옴
    const [targetData, prevData, targetOdds, prevOdds] = await Promise.all([
      fetchAPI('fixtures', `date=${targetDateStr}`),
      fetchAPI('fixtures', `date=${prevDateStr}`),
      fetchAPI('odds', `date=${targetDateStr}`),
      fetchAPI('odds', `date=${prevDateStr}`)
    ]);

    const allMatches = [...(targetData.response || []), ...(prevData.response || [])];
    const allOdds = [...(targetOdds.response || []), ...(prevOdds.response || [])];

    // [개선] 배당 데이터 맵핑 (Bet365 없으면 다른 북메이커라도 찾기)
    const oddsMap: any = {};
    allOdds.forEach((o: any) => {
      // 1순위 Bet365, 없으면 첫번째 북메이커 사용
      const bookmaker = o.bookmakers.find((b: any) => b.name === 'Bet365') || o.bookmakers[0];
      const market = bookmaker?.bets.find((b: any) => b.name === 'Match Winner' || b.name === '1x2');
      if (market) {
        oddsMap[o.fixture.id] = {
          home: market.values.find((v: any) => v.value === 'Home' || v.value === '1')?.odd,
          draw: market.values.find((v: any) => v.value === 'Draw' || v.value === 'X')?.odd,
          away: market.values.find((v: any) => v.value === 'Away' || v.value === '2')?.odd
        };
      }
    });

    const filteredMatches = allMatches
      .filter((item: any) => {
        if (leagueNameMap[item.league.id] === undefined) return false;
        const matchDateKST = new Date(item.fixture.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
        return matchDateKST === targetDateStr;
      })
      .map((item: any) => {
        const hName = item.teams.home.name;
        const aName = item.teams.away.name;
        
        return {
          id: item.fixture.id,
          timestamp: item.fixture.timestamp,
          league: leagueNameMap[item.league.id],
          // [팀 이름 처리] 맵에 있으면 한글, 없으면 영문 유지
          home: teamNameMap[hName] || hName,
          away: teamNameMap[aName] || aName,
          scoreHome: item.goals.home ?? 0,
          scoreAway: item.goals.away ?? 0,
          status: item.fixture.status.short,
          elapsed: item.fixture.status.elapsed,
          korTime: new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }),
          predict: { home: Math.round((item.fixture.id % 15) / 10 + 1.2), away: Math.round(((item.fixture.id / 10) % 15) / 10 + 0.8) },
          probs: { home: 40, draw: 30, away: 30 },
          odds: oddsMap[item.fixture.id] || null
        };
      })
      .sort((a: any, b: any) => {
        const statusOrder: any = { 'LIVE': 0, '1H': 0, 'HT': 0, '2H': 0, 'ET': 0, 'P': 0, 'BT': 0, 'NS': 1, 'FT': 2 };
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
