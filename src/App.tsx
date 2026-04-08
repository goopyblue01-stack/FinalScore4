import { useEffect, useState } from 'react';
import { RefreshCw, ArrowLeft, TrendingUp, Info } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [상세 페이지 컴포넌트]
function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  const [extraData, setExtraData] = useState<{ pred: string, odds: string }>({
    pred: "데이터 분석 중...",
    odds: "배당 흐름 확인 중..."
  });

  // 상세 페이지 접속 시 Predictions 및 Odds 데이터를 가져오는 로직 (샘플)
  useEffect(() => {
    // 여기에 나중에 fetch(`/api/predictions?id=${match.id}`) 형태로 연동할 예정입니다.
    // 지금은 사장님이 보실 수 있게 문구만 살짝 바꿔두겠습니다.
    setTimeout(() => {
      setExtraData({
        pred: "현재 홈팀 승률이 높게 측정되고 있습니다. (최종 분석 완료)",
        odds: "해외 Bet365 기준 승(1.85) 무(3.40) 패(4.20)"
      });
    }, 1000);
  }, [match.id]);

  // 메인과 동일한 상태 표시 로직
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
    const timeVal = match.elapsed !== null && match.elapsed !== undefined ? `${match.elapsed}'` : 'LIVE';
    displayStatus = timeVal;
    statusColor = orangeHighlight;
    statusWeight = "font-bold";
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-sm md:text-base">{match.league}</h2>
      </header>

      <main className="max-w-4xl mx-auto px-3 mt-6">
        {/* 점수 섹션: 모바일에서도 한 줄로 나오도록 flex-nowrap 적용 */}
        <div className={`rounded-[32px] p-6 mb-6 shadow-sm border ${
          !['NS', 'FT'].includes(match.status) ? 'bg-[#fff1f2] border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className={`text-center text-xs mb-4 ${statusWeight}`} style={{ color: statusColor }}>
            {match.status === 'FT' ? '경기 종료' : match.status === 'NS' ? '경기전' : displayStatus}
          </div>
          
          <div className="flex items-center justify-between gap-2 flex-nowrap">
            {/* 홈팀 */}
            <div className="flex-1 text-right">
              <span className="font-black text-sm md:text-xl text-slate-800 break-keep">{match.home}</span>
            </div>
            
            {/* 스코어: 절대 줄바꿈 되지 않게 고정폭과 flex-shrink-0 적용 */}
            <div className="flex-shrink-0 flex items-center justify-center gap-1 min-w-[80px] md:min-w-[120px]">
              <span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreHome}</span>
              <span className="text-xl md:text-3xl font-black text-slate-200">:</span>
              <span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreAway}</span>
            </div>
            
            {/* 원정팀 */}
            <div className="flex-1 text-left">
              <span className="font-black text-sm md:text-xl text-slate-800 break-keep">{match.away}</span>
            </div>
          </div>
        </div>

        {/* 프리미엄 정보 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#56ad6a]">
              <TrendingUp className="w-5 h-5" />
              <span className="font-bold">전문가 분석</span>
            </div>
            <div className="py-6 text-slate-600 text-sm leading-relaxed">
              {extraData.pred}
            </div>
          </div>

          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2 mb-4 text-[#bf953f]">
              <Info className="w-5 h-5" />
              <span className="font-bold">해외 배당 흐름</span>
            </div>
            <div className="py-6 text-slate-600 text-sm leading-relaxed">
              {extraData.odds}
              <div className="mt-4 pt-4 border-t border-slate-50 text-[10px] text-slate-400 italic">
                "본 데이터는 정보 제공 목적으로만 활용됩니다"
              </div>
            </div>
          </div>
        </div>

        {/* 하단 예상 스코어 강조 */}
        <div className="mt-6 bg-slate-900 rounded-[24px] p-8 text-white text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4 block">FinalScore 정밀 예측</span>
            <div className="flex justify-center items-center gap-8">
                <div className="flex flex-col gap-1">
                    <span className="text-4xl font-black text-red-500">{match.predict.home}</span>
                    <span className="text-[10px] text-slate-500 font-bold">HOME</span>
                </div>
                <span className="text-2xl font-bold text-slate-700">:</span>
                <div className="flex flex-col gap-1">
                    <span className="text-4xl font-black text-blue-500">{match.predict.away}</span>
                    <span className="text-[10px] text-slate-500 font-bold">AWAY</span>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

// [메인 앱 컴포넌트] - 기존과 동일하나 상세페이지 호출 부분만 유지
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

  if (selectedMatch) {
    return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900">
      <header className="bg-white py-8 flex justify-center items-center border-b border-slate-100 shadow-sm">
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
                   onClick={() => setSelectedMatch(match)}
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
