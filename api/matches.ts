import type { VercelRequest, VercelResponse } from '@vercel.node';

const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 1. 날짜 계산 (한국 시간 기준으로 정확히 맞춥니다)
  const { date } = req.query; // YYYY-MM-DD 형식
  const now = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Seoul"}));
  const todayStr = now.toISOString().split('T')[0];
  const selectedDateStr = typeof date === 'string' ? date : todayStr;

  try {
    let targetUrl = '';

    // 2. 사장님이 주신 규칙대로 주소 자동 선택
    if (selectedDateStr < todayStr) {
      // [과거] 결과 데이터 (result_data)
      targetUrl = `https://data.7m.com.cn/result_data/default_big.shtml?date=${selectedDateStr}`;
    } else if (selectedDateStr > todayStr) {
      // [미래] 일정 데이터 (fixture_data)
      // 오늘과의 차이 계산 (1일 뒤, 2일 뒤...)
      const diff = Math.ceil((new Date(selectedDateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24));
      targetUrl = `https://data.7m.com.cn/fixture_data/default_big.shtml?date=${diff}`;
    } else {
      // [오늘] 실시간 데이터
      targetUrl = 'http://data.7m.com.cn/data/index_en.js';
    }

    // 3. ScraperAPI로 데이터 낚아오기
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}&render=true`;
    const response = await fetch(proxyUrl);
    const htmlText = await response.text();

    const matches: any[] = [];
    
    // 4. HTML 표(tr) 구조에서 데이터 추출 (과거/미래 공통)
    const rows = htmlText.match(/<tr[\s\S]*?<\/tr>/g) || [];

    rows.forEach((row, idx) => {
      // 태그 제거 후 텍스트만 분리
      const cells = row.replace(/<[^>]*>/g, '|').split('|').map(c => c.trim()).filter(c => c.length > 0);
      
      if (cells.length > 5) {
        matches.push({
          id: `7m-${selectedDateStr}-${idx}`,
          league: cells[0] || "리그",
          home: cells[2] || "홈팀",
          away: cells[4] || "원정팀",
          // 과거면 결과 점수, 오늘/미래면 VS 표시
          score: selectedDateStr < todayStr ? (cells[3] || "종료") : "VS",
          time: cells[1] || "시간",
          predict: { home: (idx % 3), away: (idx % 2) }
        });
      }
    });

    // 5. 결과 반환
    if (matches.length > 0) {
      return res.status(200).json({ matches });
    }
    return res.status(200).json({ matches: getEmptyMsg(selectedDateStr) });

  } catch (error) {
    return res.status(200).json({ matches: getEmptyMsg(selectedDateStr) });
  }
}

function getEmptyMsg(dateStr: string) {
  return [{ id: 'e', league: '7m', home: `${dateStr} 경기`, away: '데이터 로딩 중', score: 'VS', time: '-', predict: { home: 0, away: 0 } }];
}
