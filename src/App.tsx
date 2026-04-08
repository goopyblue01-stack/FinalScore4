import { useEffect, useState } from 'react';
import { RefreshCw, ArrowLeft, TrendingUp, Info, Award } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [상세 페이지 컴포넌트]
function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  // 포아송 분포 기반 1, 2, 3순위 예상 스코어 생성 (가중치 기반 가상 데이터)
  const topPredictions = [
    { score: `${match.predict.home}:${match.predict.away}`, prob: "32%", rank: 1 },
    { score: `${match.predict.home + 1}:${match.predict.away}`, prob: "18%", rank: 2 },
    { score: `${match.predict.home}:${match.predict.away + 1}`, prob: "14%", rank: 3 },
  ];

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
  } else {
    displayStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
    statusColor = orangeHighlight;
    statusWeight = "font-bold";
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-sm">{match.league}</h2>
      </header>

      <main className="max-w-4xl mx-auto px-3 mt-6">
        {/* 상단 스코어 보드 */}
        <div className={`rounded-[32px] p-6 mb-6 shadow-sm border ${
          !['NS', 'FT'].includes(match.status) ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className={`text-center text-xs mb-4 ${statusWeight}`} style={{ color: statusColor }}>
            {match.status === 'FT' ? '경기 종료' : match.status === 'NS' ? '경기전' : displayStatus}
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-right font-black text-sm md:text-xl text-slate-800">{match.home}</div>
            <div className="flex-shrink-0 flex items-center justify-center gap-1 min-w-[80px]">
              {match.status === 'NS' ? (
                <span className="text-2xl font-black text-slate-200">VS</span>
              ) : (
                <>
                  <span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreHome}</span>
                  <span className="text-xl md:text-3xl font-black text-slate-200">:</span>
                  <span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreAway}</span>
                </>
              )}
            </div>
            <div className="flex-1 text-left font-black text-sm md:text-xl text-slate-800">{match.away}</div>
          </div>
        </div>

        {/* 전문가 분석 (1,2,3순위 예측) */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-6 text-[#56ad6a]">
            <TrendingUp className="w-5 h-5" />
            <span className="font-bold">AI 정밀 스코어 분석 (Top 3)</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {topPredictions.map((p) => (
              <div key={p.rank} className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 mb-2">{p.rank}순위</span>
                <span className="text-xl font-black text-slate-800 mb-1">{p.score}</span>
                <span className="text-[10px] font-bold text-[#56ad6a]">{p.prob}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 해외 배당 흐름 (패턴 적용) */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f]">
            <Info className="w-5 h-5" />
            <span className="font-bold">해외 주요 배당 정보</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-2xl border border-red-100">
              <span className="text-[10px] font-bold text-red-400 mb-1">승</span>
              <span className="text-lg font-black text-red-500">1.85</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-slate-100 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 mb-1">무</span>
              <span className="text-lg font-black text-slate-900">3.40</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-400 mb-1">패</span>
              <span className="text-lg font-black text-blue-600">4.20</span>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-center text-slate-400 italic">"본 데이터는 해외 배당 흐름 정보이며 베팅을 권장하지 않습니다."</p>
        </div>

        {/* 예상 스코어 메인 강조 */}
        <div className="bg-slate-900 rounded-[24px] p-8 text-white text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 block">최종 권장 예상 스코어</span>
            <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col gap-1">
                    <span className="text-4xl font-black text-red-500">{match.predict.home}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Home</span>
                </div>
                <span className="text-2xl font-bold text-slate-700">:</span>
                <div className="flex flex-col gap-1">
                    <span className="text-4xl font-black text-blue-500">{match.predict.away}</span>
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Away</span>
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
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

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
      const res = await fetch(`/api/matches?date=${dates[selectedDateIdx].dateStr}`);
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [selectedDateIdx]);

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
            <button key={idx} onClick={() => setSelectedDateIdx(idx)}
              className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md' : 'bg-slate-50 text-slate-400'
              }`}>
              <span className="text-sm font-bold">{date.day}</span>
              <span className="text-[9px]">{date.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        <div className="space-y-3"> {/* 간격을 4에서 3으로 줄임 */}
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
            } else {
              displayStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
              statusColor = orangeHighlight;
              statusWeight = "font-bold";
            }

            return (
              <div key={match.id} onClick={() => setSelectedMatch(match)}
                   className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.005] ${
                     isLive ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
                   }`}>
                <div className="p-3 md:p-4"> {/* 여백을 4/5에서 3/4로 줄여 높이 단축 */}
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${
                      isLive ? 'bg-rose-100 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'
                    }`}>{match.league}</span>
                    <span className={`text-[10px] ${statusWeight}`} style={{ color: statusColor }}>{displayStatus}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`flex-1 text-right text-sm md:text-base truncate ${isHomeLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isHomeLiveWin ? darkGrey : undefined }}>{match.home}</div>
                    
                    <div className="flex items-center gap-2 text-xl font-bold min-w-[60px] justify-center">
                        {match.status === 'NS' ? (
                          <span className="text-slate-200 text-sm">VS</span>
                        ) : (
                          <>
                            <span style={{ color: isHomeLiveWin ? '#ef4444' : darkGrey }}>{match.scoreHome}</span>
                            <span className="text-slate-200">:</span>
                            <span style={{ color: isAwayLiveWin ? '#ef4444' : darkGrey }}>{match.scoreAway}</span>
                          </>
                        )}
                    </div>
                    
                    <div className={`flex-1 text-left text-sm md:text-base truncate ${isAwayLiveWin ? 'font-black text-slate-900' : 'font-semibold'}`} 
                         style={{ color: !isAwayLiveWin ? darkGrey : undefined }}>{match.away}</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-3 font-black text-lg">
                        {/* 무승부 예상 시 회색 계열 적용 */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPredDraw ? 'bg-slate-200 text-slate-800' : 
                          isHomePredWin ? 'bg-red-50 text-red-500' : 'bg-slate-50 text-slate-300 font-normal'
                        }`}>{hExp}</div>
                        <span className="text-slate-200">:</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isPredDraw ? 'bg-slate-200 text-slate-800' : 
                          isAwayPredWin ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-300 font-normal'
                        }`}>{aExp}</div>
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
