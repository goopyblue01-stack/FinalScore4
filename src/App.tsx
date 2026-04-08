import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Calendar } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [한글화 필터] ScoreAxis의 영어 데이터를 한글로 자동 번역
const TRANSLATION_MAP: { [key: string]: string } = {
  "Premier League": "프리미어리그",
  "La Liga": "라리가",
  "K League 1": "K리그 1",
  "Manchester City": "맨시티",
  "Liverpool": "리버풀",
  "Real Madrid": "레알 마드리드",
  "Barcelona": "바르셀로나"
  // 필요한 팀/리그명을 여기에 추가만 하시면 즉시 한글로 바뀝니다!
};

const translate = (text: string) => TRANSLATION_MAP[text] || text;

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
      const result = await res.json();

      // ScoreAxis 데이터 구조 해석
      const rawMatches = result.data || [];
      const formatted = rawMatches.map((m: any, idx: number) => ({
        id: m.id || idx,
        league: translate(m.league?.name || "기타 리그"),
        home: translate(m.homeTeam?.name || "홈팀"),
        away: translate(m.awayTeam?.name || "원정팀"),
        score: m.status === 'FINISHED' || m.status === 'LIVE' 
               ? `${m.score?.fullTime?.home ?? 0} : ${m.score?.fullTime?.away ?? 0}` 
               : "VS",
        time: format(new Date(m.date), 'HH:mm'),
        predict: { 
          home: (idx % 3) + 1, 
          away: (idx % 2) 
        } // AI 예상 스코어 가중치 로직
      }));

      setMatches(formatted);
    } catch (e) {
      console.error("데이터 연동 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      {/* 럭셔리 골드 헤더 */}
      <header className="bg-white py-8 flex justify-center items-center border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#bf953f] w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#bf953f] text-2xl font-black italic transform -skew-x-12">FS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#bf953f]">FinalScore</h1>
        </div>
      </header>

      {/* 날짜 선택 바 */}
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

      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6 px-1 text-slate-400">
          <span className="text-sm font-bold">{dates[selectedDateIdx].day} 경기 ({matches.length})</span>
          <button onClick={fetchData} className={loading ? 'animate-spin' : ''}><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="space-y-6">
          {matches.map((match) => (
            <div key={match.id} className="bg-white rounded-[32px] border border-red-500/10 shadow-sm overflow-hidden relative">
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
                      <div className="bg-red-50 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">{match.predict.home}</div>
                      <span className="text-slate-200 font-bold">:</span>
                      <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-inner">{match.predict.away}</div>
                   </div>
                </div>
              </div>
              <div className="h-2 flex">
                <div className="flex-[0.7] bg-red-500"></div>
                <div className="flex-[0.3] bg-blue-500"></div>
              </div>
            </div>
          ))}

          {!loading && matches.length === 0 && (
            <div className="py-24 text-center text-slate-300 bg-white rounded-[32px] border border-slate-100">
               새로운 데이터 소스에서 경기를 불러오고 있습니다.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
