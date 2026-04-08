import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

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
      setMatches(json.matches || []);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900">
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
        <div className="space-y-6">
          {matches.map((match) => {
            const isHomeLiveWin = match.scoreHome > match.scoreAway;
            const isAwayLiveWin = match.scoreAway > match.scoreHome;
            const hExp = match.predict.home;
            const aExp = match.predict.away;
            const isHomePredWin = hExp > aExp;
            const isAwayPredWin = aExp > hExp;
            const isPredDraw = hExp === aExp;

            const darkGrey = "#475569"; // 기본 회색
            const orangeHighlight = "#f97316"; // 주황색 (가공후 가시성 높은 색)

            // 경기 상태 텍스트 및 스타일 결정
            let displayStatus = "";
            let statusColor = darkGrey;
            let statusWeight = "font-medium";

            if (match.status === 'NS') {
              displayStatus = match.korTime; // 경기전 -> 시간 표시
              statusWeight = "font-normal";
            } else if (match.status === 'FT') {
              displayStatus = 'FT'; // 종료 -> FT
              statusWeight = "font-normal";
            } else if (match.status === 'PEN') {
              displayStatus = 'PS'; // 승부차기 -> PS
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            } else {
              // 경기 중 (연장 포함)
              displayStatus = `${match.elapsed}'`;
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            }

            return (
              <div key={match.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden relative">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-[#e8f8f0] text-[#56ad6a] px-3 py-1 rounded-lg text-[10px] font-black uppercase">{match.league}</span>
                    <span className={`text-xs ${statusWeight}`} style={{ color: statusColor }}>{displayStatus}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className={`flex-1 text-right text-lg truncate ${isHomeLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>
                      {match.home}
                    </div>

                    <div className="flex items-center gap-2 text-2xl">
                      <span className={`${isHomeLiveWin ? 'font-black text-red-500' : 'font-semibold'}`} 
                            style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>{match.scoreHome}</span>
                      <span className="text-slate-200">:</span>
                      <span className={`${isAwayLiveWin ? 'font-black text-red-500' : 'font-semibold'}`} 
                            style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>{match.scoreAway}</span>
                    </div>

                    <div className={`flex-1 text-left text-lg truncate ${isAwayLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>
                      {match.away}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-3">
                     <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                          isPredDraw ? 'font-black bg-slate-100 text-slate-900' : 
                          isHomePredWin ? 'font-black bg-red-50 text-red-500' : 'font-medium bg-slate-50 text-slate-500'
                        }`}>
                          {hExp}
                        </div>
                        <span className="text-slate-200 font-bold">:</span>
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
                          isPredDraw ? 'font-black bg-slate-100 text-slate-900' : 
                          isAwayPredWin ? 'font-black bg-blue-50 text-blue-600' : 'font-medium bg-slate-50 text-slate-500'
                        }`}>
                          {aExp}
                        </div>
                     </div>
                  </div>

                  <div className="mt-8">
                    <div className="h-2.5 flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
                      <div style={{ width: `${match.probs.home}%` }} className="bg-red-500"></div>
                      <div style={{ width: `${match.probs.draw}%` }} className="bg-slate-300"></div>
                      <div style={{ width: `${match.probs.away}%` }} className="bg-blue-500"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {!loading && matches.length === 0 && (
            <div className="py-24 text-center text-slate-300 bg-white rounded-[32px]">진행 중인 경기가 없습니다.</div>
          )}
        </div>
      </main>
    </div>
  );
}
