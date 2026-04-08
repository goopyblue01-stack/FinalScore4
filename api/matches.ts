import type { VercelRequest, VercelResponse } from '@vercel.node';

// [보안 조치] 이제 키를 직접 적지 않고, Vercel 설정에 저장된 값을 몰래 가져옵니다.
const API_KEY = process.env.SCRAPER_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 한글 깨짐 방지 및 보안 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  // 1. 사용자가 선택한 날짜 가져오기 (없으면 오늘)
  const { date } = req.query;
  const targetDate = typeof date === 'string' ? date.replace(/-/g, '') : getTodayString();

  try {
    // 2. 날짜에 맞는 7m 데이터 주소 결정
    let targetUrl = 'https://bf.7m.com.cn/vxml/bf_all_en.xml';
    if (targetDate !== getTodayString()) {
      targetUrl = `https://bf.7m.com.cn/vxml/bf_${targetDate}_en.xml`;
    }

    // 3. ScraperAPI 통로 이용 (환경변수 키 사용)
    const proxyUrl = `https://api.scraperapi.com?api_key=${API_KEY}&url=${encodeURIComponent(targetUrl)}`;

    const response = await fetch(proxyUrl);
    const xmlText = await response.text();

    const matches: any[] = [];
    // 7m XML 데이터 조각(<m> 태그) 추출
    const matchBlocks = xmlText.match(/<m>([\s\S]*?)<\/m>/g) || [];

    matchBlocks.forEach((block, idx) => {
      const content = block.replace(/<\/?m>/g, '');
      const data = content.split(',');

      // 7m 데이터 순서에 맞춰 낚아채기
      if (data.length > 10) {
        matches.push({
          id: `7m-${targetDate}-${idx}`,
          league: data[2] || "리그",
          home: data[5] || "홈팀",
          away: data[6] || "원정팀",
          score: `${data[13] || 0}:${data[14] || 0}`,
          time: data[12] === '1' ? 'LIVE' : (data[12] === '3' ? '종료' : '대기'),
          predict: { 
            home: (idx % 3), // AI 예상 (임시 로직)
            away: (idx % 2) 
          }
        });
      }
    });

    // 4. 데이터가 있으면 보내고, 없으면 알림 메시지 전송
    if (matches.length > 0) {
      return res.status(200).json({ matches });
    } else {
      return res.status(200).json({ matches: getEmptyMsg(targetDate) });
    }

  } catch (error: any) {
    // 에러 발생 시에도 앱이 죽지 않도록 예비 데이터 송출
    return res.status(200).json({ matches: getEmptyMsg(targetDate) });
  }
}

// 오늘 날짜 YYYYMMDD 생성 함수
function getTodayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

// 데이터가 없을 때 보여줄 깔끔한 한글 메시지
function getEmptyMsg(dateStr: string) {
  return [{ 
    id: 'empty', 
    league: '알림', 
    home: `${dateStr.slice(4,6)}월 ${dateStr.slice(6,8)}일은`, 
    away: '경기가 없습니다.', 
    score: '0:0', 
    time: '-', 
    predict: { home: 0, away: 0 } 
  }];
}
