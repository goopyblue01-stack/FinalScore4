import type { VercelRequest, VercelResponse } from '@vercel node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // [수단과 방법을 가리지 않는 기술: Allorigins 우회]
    // 7m이 우리(Vercel)를 막으니, 중간에 '대리 서버'를 거쳐서 데이터를 뺏어옵니다.
    // 7m 경비원은 우리가 아니라 이 '대리 서버'의 주소를 보게 됩니다.
    const targetUrl = encodeURIComponent('https://m.7m.com.cn/data/index_en.xml');
    const proxyUrl = `https://api.allorigins.win/get?url=${targetUrl}`;

    const response = await fetch(proxyUrl);
    const json = await response.json();
    const xmlText = json.contents; // 대리 서버가 훔쳐온 7m의 XML 원본

    const matches: any[] = [];
    // 7m 데이터 해독 (정규식 파싱)
    const matchBlocks = xmlText.match(/<match>([\s\S]*?)<\/match>/g) || [];

    matchBlocks.forEach((block: string, idx: number) => {
      matches.push({
        id: `7m-${idx}`,
        league: block.match(/<league>([^<]+)<\/league>/)?.[1] || "7m League",
        home: block.match(/<hometeam>([^<]+)<\/hometeam>/)?.[1] || "Home",
        away: block.match(/<awayteam>([^<]+)<\/awayteam>/)?.[1] || "Away",
        score: block.match(/<score>([^<]+)<\/score>/)?.[1] || "VS",
        time: "LIVE"
      });
    });

    return res.status(200).json({ matches });

  } catch (error: any) {
    return res.status(200).json({ error: "침투 실패", message: error.message });
  }
}
