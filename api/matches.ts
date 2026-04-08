import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.API_SPORTS_KEY;

// [ScoreLab 전용 리그 한글 명칭 사전] 사장님이 요청하신 80개 대회 리스트 반영
const leagueNameMap: { [key: number]: string } = {
  // 잉글랜드
  39: "잉글랜드 프리미어리그",
  40: "잉글랜드 챔피언십",
  45: "잉글랜드 FA컵",
  48: "EFL컵 (카라바오)",
  // 스페인
  140: "스페인 라리가",
  141: "스페인 세군다",
  143: "코파 델 레이",
  147: "스페인 슈퍼컵",
  // 독일
  78: "독일 분데스리가",
  79: "독일 2부",
  81: "DFB 포칼",
  529: "독일 슈퍼컵",
  // 이탈리아
  135: "이탈리아 세리에 A",
  136: "이탈리아 세리에 B",
  137: "코파 이탈리아",
  547: "이탈리아 슈퍼컵",
  // 프랑스
  61: "프랑스 리그 앙",
  62: "프랑스 리그 두",
  66: "쿠프 드 프랑스",
  65: "프랑스 리그컵",
  526: "프랑스 슈퍼컵",
  // 네덜란드
  88: "네덜란드 에레디비시",
  89: "네덜란드 2부",
  90: "네덜란드 KNVB 베이커",
  528: "네덜란드 슈퍼컵",
  // 스코틀랜드/포르투갈
  179: "스코틀랜드 프리미어십",
  180: "스코틀랜드 2부",
  94: "포르투갈 프리메이라리가",
  95: "포르투갈 2부",
  96: "타사 드 포르투갈",
  210: "포르투갈 리그컵",
  550: "포르투갈 슈퍼컵",
  // 튀르키예/유럽 기타
  203: "튀르키예 수페르리그",
  204: "튀르키예 1.리그",
  205: "튀르키예 컵",
  551: "튀르키예 슈퍼컵",
  197: "그리스 슈퍼리그 1",
  106: "폴란드 엑스트라클라사",
  103: "노르웨이 엘리테세리엔",
  119: "덴마크 수페르리가",
  172: "불가리아 1부",
  271: "헝가리 1부",
  218: "크로아티아 1부",
  144: "벨기에 프로리그",
  207: "스위스 슈퍼리그",
  357: "아일랜드 프리미어",
  // 아시아
  292: "K리그 1",
  293: "K리그 2",
  295: "KFA 코리아컵",
  98: "J1 리그",
  99: "J2 리그",
  102: "일본 천황배",
  101: "J리그컵",
  530: "일본 슈퍼컵",
  169: "중국 슈퍼리그",
  170: "중국 2부",
  171: "중국 FA컵",
  188: "호주 A리그",
  189: "호주 FFA컵",
  323: "베트남 V리그 1",
  296: "태국 1부",
  307: "사우디 프로리그",
  323: "인도 슈퍼리그",
  274: "인도네시아 1부",
  305: "카타르 스타스 리그",
  301: "UAE 프로리그",
  280: "말레이시아 슈퍼리그",
  310: "요르단 1부",
  // 미주
  253: "미국 MLS",
  255: "미국 USL 챔피언십",
  262: "멕시코 리가 MX",
  71: "브라질 세리에 A",
  1579: "캐나다 프리미어",
  128: "아르헨티나 리가 프로페셔널",
  268: "우루과이 1부",
  281: "페루 1부",
  239: "콜롬비아 1부",
  233: "볼리비아 1부",
  265: "칠레 1부",
  242: "에콰도르 1부",
  252: "파라과이 1부",
  // 국제 대회
  2: "UEFA 챔피언스리그",
  3: "UEFA 유로파리그",
  848: "UEFA 컨퍼런스리그",
  17: "AFC 챔피언스리그",
  1: "월드컵",
  5: "UEFA 네이션스리그",
  9: "아시안컵",
  134: "동아시안컵"
};

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

    const oddsMap: any = {};
    (oddsData.response || []).forEach((o: any) => {
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
      // [한글화 적용] 사전(leagueNameMap)에 ID가 있으면 한글로, 없으면 원문 영어 그대로 사용
      const korLeagueName = leagueNameMap[item.league.id] || item.league.name;

      return {
        id: item.fixture.id,
        timestamp: item.fixture.timestamp,
        league: korLeagueName, // 한글 리그 명칭 적용
        home: item.teams.home.name,
        away: item.teams.away.name,
        scoreHome: item.goals.home ?? 0,
        scoreAway: item.goals.away ?? 0,
        status: item.fixture.status.short,
        elapsed: item.fixture.status.elapsed,
        korTime: new Date(item.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }),
        predict: { home: Math.round((item.fixture.id % 15) / 10 + 1.2), away: Math.round(((item.fixture.id / 10) % 15) / 10 + 0.8) },
        probs: { home: 40, draw: 30, away: 30 },
        odds: oddsMap[item.fixture.id] || null
      };
    });

    return res.status(200).json({ matches });
  } catch (error) {
    return res.status(200).json({ matches: [] });
  }
}
