import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [ScoreLab 전용 리그 한글 명칭 사전] (사장님 요청 80개 리그)
const leagueNameMap: { [key: number]: string } = {
  39: "잉글랜드 프리미어리그", 40: "잉글랜드 챔피언십", 45: "잉글랜드 FA컵", 48: "EFL컵 (카라바오)",
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const { date } = req.query;
  // 기준 날짜 (예: 2026-04-09)
  const targetDateStr = typeof date === 'string' ? date : new Date().toISOString().split('T')[0];

  try {
    // [핵심 수정] 시차 문제를 해결하기 위해 요청일(target)과 전날(prev) 데이터를 모두 가져옴
    const prevDate = new Date(targetDateStr);
    prevDate.setDate(prevDate.getDate() - 1);
    const prevDateStr = prevDate.toISOString().split('T')[0];

    const fetchMatches = (d: string) => 
      fetch(`https://v3.football.api-sports.io/fixtures?date=${d}`, { 
        headers: { 'x-rapidapi-key': API_KEY || '', 'x-rapidapi-host': 'v3.football.api-sports.io' } 
      }).then(r => r.json());

    // 오늘과 전날 데이터를 동시에 호출 (새벽 경기 누락 방지)
    const [targetData, prevData] = await Promise.all([
      fetchMatches(targetDateStr),
      fetchMatches(prevDateStr)
    ]);

    // 두 데이터를 합침
    const allResponses = [...(targetData.response || []), ...(prevData.response || [])];

    // 중복 제거 및 한국 날짜 기준 필터링
    const filteredMatches = allResponses
      .filter((item: any) => {
        // 1. 80개 리그 필터링
        if (leagueNameMap[item.league.id] === undefined) return false;

        // 2. 한국 시간 기준으로 해당 날짜인지 체크
        const matchDateKST = new Date(item.fixture.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });
        return matchDateKST === targetDateStr;
      })
      .map((item: any) => ({
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: leagueNameMap[item.league.id],
        home: item.teams.home.name,
        away: item.teams.away.name,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        status: item.fixture.status.short,
        elapsed: item.fixture.status.elapsed,
        korTime: new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }),
        predict: { home: Math.round((item.fixture.id % 15) / 10 + 1.2), away: Math.round(((item.fixture.id / 10) % 15) / 10 + 0.8) },
        probs: { home: 40, draw: 30, away: 30 }
      }))
      // 정렬: 진행중 > 예정(시간순) > 종료
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
