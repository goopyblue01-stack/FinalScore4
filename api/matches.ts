import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  try {
    const { date } = req.query; // 형식: 2026-04-08
    
    // [비밀 침투 주소] Flashscore의 실시간 스코어 데이터가 흐르는 파이프라인입니다.
    // 일반적인 웹 화면이 아니라, 숫자가 가득한 raw 데이터를 직접 낚아챕니다.
    const targetUrl = `https://d.flashscore.com/x/feed/d_1_${date || '2026-04-08'}_3_en_1`;

    const response = await fetch(targetUrl, {
      headers: {
        // [변장 1] 나 로봇 아냐! 아이폰이야!
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        // [변장 2] 나 방금 너네 메인 페이지 보고 온 거야! (CORS 우회 필수 헤더)
        'Origin': 'https://www.flashscore.com',
        'Referer': 'https://www.flashscore.com/',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    if (!response.ok) throw new Error('Flashscore 침투 실패');

    const rawData = await response.text();

    // 2. [스크래핑의 꽃: 파싱] 암호 같은 raw 데이터를 해독합니다.
    const matches: any[] = [];
    
    // Flashscore 고유의 데이터 분리자(¬)를 기준으로 데이터를 찢습니다.
    const events = rawData.split('¬~').filter(e => e.includes('¬AE÷'));

    events.forEach(event => {
      // 각 경기 데이터 안에서 필요한 정보만 정교하게 추출합니다.
      const matchData: { [key: string]: string } = {};
      event.split('¬').forEach(pair => {
        const [key, value] = [pair.slice(0, 2), pair.slice(3)];
        matchData[key] = value;
      });

      // 예: AE(홈팀), AF(원정팀), AG(홈점수), AH(원정점수), AI(경기상태)
      if (matchData['AE'] && matchData['AF']) {
        matches.push({
          id: matchData['AA'] || 'fs-id',
          league: matchData['ZA'] || '기타 리그',
          home: matchData['AE'],
          away: matchData['AF'],
          score: matchData['AI'] === 'Finished' || matchData['AI'] === 'Live' 
                 ? `${matchData['AG'] ?? 0}:${matchData['AH'] ?? 0}` 
                 : 'VS',
          time: matchData['AD'] || '시간'
        });
      }
    });

    return res.status(200).json({ matches: matches.slice(0, 100) }); // 상위 100경기만 전송

  } catch (error: any) {
    return res.status(500).json({ error: '데이터 스크래핑 실패', message: error.message });
  }
}
