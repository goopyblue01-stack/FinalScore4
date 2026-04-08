import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  try {
    const { date } = req.query;
    // 봉다의 모든 경기 일정을 가져오는 주소
    const targetUrl = `https://bongda.com.vn/lich-thi-dau?date=${date || ''}`;

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    return res.status(200).send(response.data);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}