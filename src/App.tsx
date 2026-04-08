import { useEffect, useState } from 'react';
import { RefreshCw, ArrowLeft, TrendingUp, Info } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [상세 페이지 컴포넌트]
function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  // 나중에 여기서 Predictions와 Odds API를 호출할 예정입니다.
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10">{match.league}</h2>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        {/* 점수 섹션 */}
        <div className={`rounded-[32px] p-8 mb-6 shadow-sm border ${
          !['NS', 'FT'].includes(match.status) ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center text-xs font-bold text-rose-500 mb-4 animate-pulse">
            {match.status === 'FT' ? '경기 종료' : match.status === 'NS' ? '경기 예정' : 'LIVE ' + match.elapsed + "'"}
          </div>
          <div className="flex items-center justify-around">
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-300">LOGO</div>
              <span className="font-black text-lg text-slate-800 text-center">{match.home}</span>
            </div>
            <div className="text-5xl font-black text-slate-900 px-6">{match.scoreHome} : {match.scoreAway}</div>
            <div className="flex flex-col items-center flex-1">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-300">LOGO</div>
              <span className="font-black text-lg text-slate-800 text-center">{match.away}</span>
            </div>
          </div>
        </div>

        {/* 프리미어 정보 섹션 (Predictions & Odds 예정지) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#56ad6a]">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">전문가 분석 (Predictions)</span>
            </div>
            <div className="py-10 text-center text-slate-400 text-sm">
              유료 플랜 데이터를 분석 중입니다...<br/>(곧 업데이트 예정)
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#bf953f]">
              <Info className="w-5 h-5" />
              <span className="font-bold">해외 배당 흐름 (Odds)</span>
            </div>
            <div className="py-10 text-center text-slate-400 text-sm italic">
              "본 데이터는 정보 제공 목적으로만 활용됩니다"
            </div>
          </div>
        </div>

        {/* 하단 예상 스코어 강조 */}
        <div className="mt-6 bg-slate-900 rounded-[24px] p-8 text-white text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">FinalScore 정밀 예측</span>
            <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col gap-2">
                    <span className="text-4xl font-black text-red-500">{match.predict.home}</span>
                    <span className="text-[10px] text-slate-400 font-bold">HOME</span>
                </div>
                <span className="text-2xl font-bold text-slate-700">:</span>
                <div className="flex flex-col gap-2">
                    <span className="text-4xl font-black text-blue-500">{match.predict.away}</span>
                    <span className="text-[10px] text-slate-400 font-bold">AWAY</span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// [메인 앱 컴포넌트]
export default function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null); // 상세 페이지 선택 상태

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

  // 상세 페이지 모드일 때
  if (selectedMatch) {
    return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

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
        <div className="space-y-4">
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
              displayStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            }

            return (
              <div key={match.id} 
                   onClick={() => setSelectedMatch(match)} // [추가] 클릭 시 상세페이지로!
                   className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.98] ${
                     isLive ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
                   }`}>
                <div className="p-4 md:p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                      isLive ? 'bg-rose-100 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'
                    }`}>{match.league}</span>
                    <span className={`text-xs ${statusWeight}`} style={{ color: statusColor }}>{displayStatus}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`flex-1 text-right text-base md:text-lg truncate ${isHomeLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>{match.home}</div>
                    <div className="flex items-center gap-2 text-xl md:text-2xl font-bold">
                        <span style={{ color: isHomeLiveWin ? '#ef4444' : darkGrey }}>{match.scoreHome}</span>
                        <span className="text-slate-200">:</span>
                        <span style={{ color: isAwayLiveWin ? '#ef4444' : darkGrey }}>{match.scoreAway}</span>
                    </div>
                    <div className={`flex-1 text-left text-base md:text-lg truncate ${isAwayLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>{match.away}</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-3 font-black text-xl">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isHomePredWin || isPredDraw ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 font-normal'}`}>{hExp}</div>
                        <span className="text-slate-200">:</span>
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isAwayPredWin || isPredDraw ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300 font-normal'}`}>{aExp}</div>
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
        </div>
      </main>
    </div>
  );
}
