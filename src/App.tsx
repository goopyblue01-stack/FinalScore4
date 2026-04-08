import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Calendar, Zap } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

/**
 * [한글화 엔진] 
 * 데이터가 영어로 들어오기 때문에, 여기서 한글로 매핑해주면 
 * 사장님의 럭셔리 디자인에 한글이 예쁘게 꽂힙니다.
 */
const TRANSLATION_MAP: { [key: string]: string } = {
  // 리그명
  "Premier League": "프리미어리그",
  "La Liga": "라리가",
  "K-League 1": "K리그 1",
  "Bundesliga": "분데스리가",
  "Serie A": "세리에 A",
  "Ligue 1": "리그 앙",
  "Champions League": "챔피언스리그",
  // 팀명 (자주 나오는 팀들을 여기에 추가하세요)
  "Ulsan Hyundai": "울산 HD",
  "Jeonbuk Motors": "전북 현대",
  "Manchester City": "맨시티",
  "Liverpool": "리버풀",
  "Real Madrid": "레알 마드리드",
  "FC Barcelona": "바르셀로나",
  "Bayern Munich": "바이에른 뮌헨",
};

const translate = (text: string) => TRANSLATION_MAP[text] || text;

/**
 * 사장님, 반드시 'export default'가 붙어있어야 Vercel에서 에러가 안 납니다!
 */
export default function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);

  const today = startOfToday();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i - 2);
    return {
      date,
      dateStr: format(date, 'yyyy-MM-dd'),
      day: format(date, 'M월 d일'),
      label: i === 2 ? '(today)' : ''
    };
  });

  const fetchData = async () => {
    setLoading(true);
    // 새로운 데이터 로딩 전 이전 리스트 초기화
    setMatches([]); 
    
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      // 최상단 api/matches.ts 배달원에게 요청
      const res = await fetch(`/api/matches?date=${targetDate}`);
      
      if (!res.ok) throw
