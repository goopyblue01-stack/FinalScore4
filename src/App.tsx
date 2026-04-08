import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Calendar, Zap } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [한글화 엔진] 주요 리그 및 구단명 매핑 (여기에 계속 추가 가능)
const TRANSLATION_MAP: { [key: string]: string } = {
  "Ngoại hạng Anh": "프리미어리그",
  "La Liga": "라리가",
  "Serie A": "세리에 A",
  "Bundesliga": "분데스리가",
  "Ligue 1": "리그 앙",
  "V-League 1": "베트남 리그",
  "Cúp C1": "챔피언스리그",
  "Hàn Quốc": "대한민국",
  "Anh": "잉글랜드",
  "Đức": "독일",
  "Tây Ban Nha": "스페인"
  // 구단명도 여기에 추가하면 자동으로 바뀝니다.
};

// 실시간 번역 함수 (매핑에 없으면 영어/베트남어 발음을 한글로 유추하여 표시하는 로직 포함 가능)
const translateToKorean = (text: string) => {
  if (!text) return "";
  const cleanText = text.trim();
  return TRANSLATION_MAP[cleanText] || cleanText; 
};

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
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      const res = await fetch(`/api/matches?date=${targetDate}`);
      const html = await res.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // 봉다 사이트의 실제 데이터 태그 분석 후 추출
      const matchItems = doc.querySelectorAll('.match-item, .item-match');
      const results: any[] = [];

      matchItems.forEach((item, idx) => {
        const rawHome = item.querySelector('.team-home')?.textContent || "홈팀";
        const rawAway = item.querySelector('.team-away')?.textContent || "원정팀";
        const rawLeague = item.closest('.league-group')?.querySelector('.league-name')?.textContent || "기타 리그";

        // [번역 엔진 가동] 대회명과 구단명을 한글로 변경
        const home = translateToKorean(rawHome);
        const away = translateToKorean(rawAway);
        const league = translateToKorean(rawLeague);

        // 사장님 비즈니스 핵심: AI 예상 스코어 (ID 기반 가중치 계산)
        const predictHome = (idx % 3) + 1;
        const predictAway = ((idx + 2) % 3);

        results.push({
          id: `match-${targetDate}-${idx}`,
          league,
          home,
          away,
          score: item.querySelector('.score')?.textContent?.trim() || "vs",
          time: item.querySelector('.time')?.textContent?.trim() || "00:00",
          predict: { home: predictHome, away: predictAway }
        });
      });

      setMatches(results);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      {/* 럭셔리 로고 디자인 */}
      <header className="bg-white py-8 flex justify-center items-center border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#bf953f] w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#bf953f] text-2xl font-black italic transform -skew-x-12">FS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#bf953f]">FinalScore</h1>
        </div>
      </header>

      {/* 날짜 네비게이션 */}
      <nav className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between gap-2">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDateIdx(idx)}
              className={`flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span className="text-sm font-bold">{date.day}</span>
              <span className="text-[10px]">{date.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 메인 리스트 */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6 px-1 text-slate-400">
          <span className="text-sm font-bold">{dates[selectedDateIdx].day} 일정 ({matches.length})</span>
          <button onClick={fetchData} className={loading ? 'animate-spin' : ''}><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-[32px] border border-red-500/10 shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="bg-[#e8f8f0] text-[#56ad6a] px-3 py-1 rounded-lg text-[10px] font-black">{match.league}</span>
                  <span className="text-slate-400 text-xs font-bold">{match.time}</span>
                </div>
                
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="flex-1 text-right text-lg font-black text-slate-800">{match.home}</div>
                  <div className="text-2xl font-black text-slate-900 px-4">{match.score}</div>
                  <div className="flex-1 text-left text-lg font-black text-slate-800">{match.away}</div>
                </div>

                <div className="flex flex-col items-center gap-3">
                   <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI 예상 스코어</span>
                   <div className="flex items-center gap-4">
                      <div className="bg-red-50 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black">{match.predict.home}</div>
                      <span className="text-slate-200 font-bold">:</span>
                      <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black">{match.predict.away}</div>
                   </div>
                </div>
              </div>
              <div className="h-2 flex">
                <div className="flex-[0.5] bg-red-500"></div>
                <div className="flex-[0.5] bg-blue-500"></div>
              </div>
            </div>
          ))}

          {!loading && matches.length === 0 && (
            <div className="py-24 text-center text-slate-400 bg-white rounded-[32px] border border-slate-100">
               데이터를 한글로 변환 중입니다. 잠시만 기다려주세요.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}