import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

const TRANSLATION_MAP: { [key: string]: string } = {
  "Premier League": "프리미어리그",
  "LaLiga": "라리가",
  "K-League 1": "K리그 1",
  "Vietnam": "베트남 리그",
  "Ulsan Hyundai": "울산 HD",
  "Jeonbuk Motors": "전북 현대",
  "Manchester City": "맨시티",
  "Liverpool": "리버풀",
  "Real Madrid": "레알 마드리드",
  "FC Barcelona": "바르셀로나",
  "Philippine Army": "필리핀 아미",
  "Kaya": "카야 FC",
  "PFL": "필리핀 리그"
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
    setMatches([]);
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      const res = await fetch(`/api/matches?date=${targetDate}`);
      const json = await res.json();

      const rawMatches = json.matches || [];
      
      const formatted = rawMatches.map((m: any) => ({
        ...m,
        league: translate(m.league),
        home: translate(m.home),
        away: translate(m.away),
        // 서버에서 온 점수값 숫자로 변환
        hScore: parseInt(m.scoreText?.split(':')[0]) || 0,
        aScore: parseInt(m.scoreText?.split(':')[1]) || 0
      }));

      setMatches(formatted);
    } catch (e) {
      console.error("데이터 처리 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-8 flex justify-center items-center border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#bf953f] w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#bf953f] text-2xl font-black italic transform -skew-x-12">FS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#bf953f]">FinalScore</h1>
        </div>
      </header>

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
        <div className="flex items-center justify-between mb-6 px-1 text-slate-400 font-bold">
          <span>{dates[selectedDateIdx].day} 경기 ({matches.length})</span>
          <button onClick={fetchData} className={loading ? 'animate-spin' : ''}><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="space-y-6">
          {matches.map((match) => {
            // 승패 판정 로직
            const isHomeWin = match.hScore > match.aScore;
            const isAwayWin = match.aScore > match.hScore;
            const isDraw = match.hScore === match.aScore;

            return (
              <div key={match.id} className="bg-white rounded-[32px] border border-red-500/10 shadow-sm overflow-hidden relative">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-[#e8f8f0] text-[#56ad6a] px-3 py-1 rounded-lg text-[10px] font-black">{match.league}</span>
                    <span className="text-slate-400 text-xs font-bold">{match.time}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    {/* 홈팀 이름: 이기면 진한검정+볼드, 아니면 연한회색+보통 */}
                    <div className={`flex-1 text-right text-lg truncate ${
                      isHomeWin ? 'font-black text-slate-900' : 'font-normal text-slate-400'
                    }`}>
                      {match.home}
                    </div>

                    {/* 실시간 스코어: 무승부면 검정, 아니면 빨간색 */}
                    <div className={`text-2xl font-black px-4 ${
                      isDraw ? 'text-slate-900' : 'text-red-500'
                    }`}>
                      {match.scoreText || "VS"}
                    </div>

                    {/* 원정팀 이름: 이기면 진한검정+볼드, 아니면 연한회색+보통 */}
                    <div className={`flex-1 text-left text-lg truncate ${
                      isAwayWin ? 'font-black text-slate-900' : 'font-normal text-slate-400'
                    }`}>
                      {match.away}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-4">
                        <div className="bg-red-50 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">{match.predict.home || 0}</div>
                        <span className="text-slate-200 font-bold">:</span>
                        <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm">{match.predict.away || 0}</div>
                     </div>
                  </div>
                </div>
                <div className="h-1.5 flex"><div className="flex-[0.7] bg-red-500"></div><div className="flex-[0.3] bg-blue-500"></div></div>
              </div>
            );
          })}
          {!loading && matches.length === 0 && (
            <div className="py-24 text-center text-slate-300 bg-white rounded-[32px]">현재 날짜에 진행 중인 경기가 없습니다.</div>
          )}
        </div>
      </main>
    </div>
  );
}
