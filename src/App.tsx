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
      
      const rawMatches = json.matches || [];

      const sortedMatches = rawMatches.sort((a: any, b: any) => {
        const isLive = (s: string) => !['NS', 'FT', 'CANC', 'ABD'].includes(s);
        if (isLive(a.status) && !isLive(b.status)) return -1;
        if (!isLive(a.status) && isLive(b.status)) return 1;
        if (a.status === 'NS' && b.status === 'FT') return -1;
        if (a.status === 'FT' && b.status === 'NS') return 1;
        return a.timestamp - b.timestamp;
      });

      setMatches(sortedMatches);
    } catch (e) {
      console.error("Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900">
      <header className="bg-white py-6 flex justify-center items-center border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#bf953f] w-10 h-10 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#bf953f] text-xl font-black italic transform -skew-x-12">FS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-[#bf953f]">FinalScore</h1>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between gap-2">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDateIdx(idx)}
              className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span className="text-sm font-bold">{date.day}</span>
              <span className="text-[9px]">{date.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="space-y-4"> {/* 간격을 6에서 4로 줄여 더 슬림하게 */}
          {matches.map((match) => {
            const isLive = !['NS', 'FT', 'CANC', 'ABD'].includes(match.status);
            const isHomeLiveWin = match.scoreHome > match.scoreAway;
            const isAwayLiveWin = match.scoreAway > match.scoreHome;
            const hExp = match.predict.home;
            const aExp = match.predict.away;
            const isHomePredWin = hExp > aExp;
            const isAwayPredWin = aExp > hExp;
            const isPredDraw = hExp === aExp;

            const darkGrey = "#475569"; 
            const orangeHighlight = "#f97316"; 

            // null' 에러 방지용 시간 표시 로직
            let displayStatus = "";
            let statusColor = darkGrey;
            let statusWeight = "font-medium";

            if (match.status === 'NS') {
              displayStatus = match.korTime;
              statusWeight = "font-normal";
            } else if (match.status === 'FT') {
              displayStatus = 'FT';
              statusWeight = "font-normal";
            } else if (match.status === 'PEN') {
              displayStatus = 'PS';
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            } else {
              // 여기서 null 체크를 강화합니다!
              const timeVal = match.elapsed !== null && match.elapsed !== undefined ? `${match.elapsed}'` : 'LIVE';
              displayStatus = timeVal;
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            }

            return (
              <div key={match.id} 
                   className={`rounded-[24px] border shadow-sm overflow-hidden relative transition-colors ${
                     isLive ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
                   }`}>
                <div className="p-4 md:p-5"> {/* 내부 여백을 줄여 높이 단축 */}
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                      isLive ? 'bg-rose-100 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'
                    }`}>{match.league}</span>
                    <span className={`text-xs ${statusWeight}`} style={{ color: statusColor }}>{displayStatus}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`flex-1 text-right text-base md:text-lg truncate ${isHomeLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>
                      {match.home}
                    </div>

                    <div className="flex items-center gap-2 text-xl md:text-2xl">
                      <span className={`${isHomeLiveWin ? 'font-black text-red-500' : 'font-semibold'}`} 
                            style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>{match.scoreHome}</span>
                      <span className="text-slate-200 text-lg">:</span>
                      <span className={`${isAwayLiveWin ? 'font-black text-red-500' : 'font-semibold'}`} 
                            style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>{match.scoreAway}</span>
                    </div>

                    <div className={`flex-1 text-left text-base md:text-lg truncate ${isAwayLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>
                      {match.away}
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm ${
                          isPredDraw ? 'bg-slate-100 text-slate-900' : 
                          isHomePredWin ? 'bg-red-50 text-red-500' : 'font-medium bg-slate-50 text-slate-500'
                        }`}>
                          {hExp}
                        </div>
                        <span className="text-slate-200 font-bold">:</span>
                        <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center text-xl font-black shadow-sm ${
                          isPredDraw ? 'bg-slate-100 text-slate-900' : 
                          isAwayPredWin ? 'bg-blue-50 text-blue-600' : 'font-medium bg-slate-50 text-slate-500'
                        }`}>
                          {aExp}
                        </div>
                     </div>
                  </div>

                  <div className="mt-5">
                    <div className="h-2 flex rounded-full overflow-hidden bg-slate-100 shadow-inner">
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
            <div className="py-20 text-center text-slate-300 bg-white rounded-[32px]">진행 중인 경기가 없습니다.</div>
          )}
        </div>
      </main>
    </div>
  );
}
