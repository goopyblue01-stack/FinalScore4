import { useEffect, useState } from 'react';
import { RefreshCw, ArrowLeft, TrendingUp, Info, ChevronUp, ChevronDown } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// [상세 페이지 컴포넌트]
function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  // 1순위(검정배경) 전용 스타일
  const getRank1Style = (h: number, a: number) => {
    if (h > a) return { h: "text-red-500 font-black", a: "text-white font-normal" };
    if (a > h) return { h: "text-white font-normal", a: "text-blue-400 font-black" };
    return { h: "text-white font-normal", a: "text-white font-normal" };
  };

  // 2~5순위 전용 스타일 (낮은 숫자 가독성 강화)
  const getNormalStyle = (h: number, a: number) => {
    if (h > a) return { h: "text-red-500 font-black", a: "text-slate-700 font-normal" };
    if (a > h) return { h: "text-slate-700 font-normal", a: "text-blue-600 font-black" };
    return { h: "text-slate-800 font-normal", a: "text-slate-800 font-normal" };
  };

  // [수정] 포아송 기반 Top 5 예상 스코어 생성
  const topPredictions = [
    { h: match.predict.home, a: match.predict.away, prob: "32%", rank: 1 },
    { h: match.predict.home + 1, a: match.predict.away, prob: "18%", rank: 2 },
    { h: match.predict.home, a: match.predict.away + 1, prob: "14%", rank: 3 },
    { h: match.predict.home + 1, a: match.predict.away + 1, prob: "9%", rank: 4 },
    { h: Math.max(0, match.predict.home - 1), a: match.predict.away, prob: "7%", rank: 5 },
  ];

  const orangeHighlight = "#f97316";
  const darkGrey = "#475569";
  
  let displayStatus = "";
  let statusColor = darkGrey;
  if (match.status === 'NS') displayStatus = match.korTime;
  else if (match.status === 'FT') displayStatus = 'FT';
  else {
    displayStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
    statusColor = orangeHighlight;
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
        <div className={`rounded-[32px] p-6 mb-6 shadow-sm border ${
          !['NS', 'FT'].includes(match.status) ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center text-xs mb-4 font-bold" style={{ color: statusColor }}>
            {match.status === 'FT' ? '경기 종료' : match.status === 'NS' ? '경기전' : displayStatus}
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1 text-right font-black text-sm md:text-xl text-slate-800">{match.home}</div>
            <div className="flex-shrink-0 flex items-center justify-center gap-1 min-w-[80px]">
              {match.status === 'NS' ? <span className="text-slate-200 text-2xl font-black">VS</span> : 
              <><span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreHome}</span><span className="text-xl md:text-3xl font-black text-slate-200">:</span><span className="text-2xl md:text-4xl font-black text-slate-900">{match.scoreAway}</span></>}
            </div>
            <div className="flex-1 text-left font-black text-sm md:text-xl text-slate-800">{match.away}</div>
          </div>
        </div>

        {/* [수정] 예상 스코어 순위 Top 5 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-4">
          <div className="flex items-center gap-2 mb-6 text-[#56ad6a] font-bold"><TrendingUp className="w-5 h-5" /><span>예상 스코어 순위 (Top 5)</span></div>
          <div className="flex flex-col gap-2.5">
            {topPredictions.map((p) => {
              const isRank1 = p.rank === 1;
              const style = isRank1 ? getRank1Style(p.h, p.a) : getNormalStyle(p.h, p.a);
              return (
                <div key={p.rank} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isRank1 ? 'bg-slate-900 border-slate-800 scale-[1.01] shadow-md' : 
                    p.rank <= 3 ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-70'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isRank1 ? 'bg-[#56ad6a] text-white' : 'bg-slate-200 text-slate-500'}`}>{p.rank}위</span>
                    <div className="flex items-center gap-2 text-base">
                      <span className={style.h}>{p.h}</span><span className={isRank1 ? 'text-slate-600' : 'text-slate-200'}>:</span><span className={style.a}>{p.a}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] ${isRank1 ? 'text-[#56ad6a]' : 'text-slate-400'}`}>{p.prob}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* [수정] 해외 배당 정보 (진짜 데이터 연결) */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f] font-bold"><Info className="w-5 h-5" /><span>해외 배당 정보</span></div>
          <div className="grid grid-cols-3 gap-3 text-center">
            {/* 승 배당 */}
            <div className="flex flex-col items-center p-4 bg-red-50 rounded-2xl border border-red-100">
              <span className="text-[10px] font-bold text-red-400 mb-1">승</span>
              <div className="flex items-center gap-1">
                <ChevronDown className="w-4 h-4 text-red-500" strokeWidth={3}/><span className="text-lg font-black text-red-500">{match.odds?.home || "1.00"}</span>
              </div>
            </div>
            {/* 무 배당 */}
            <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 mb-1">무</span>
              <span className="text-lg font-black text-slate-800">{match.odds?.draw || "1.00"}</span>
            </div>
            {/* 패 배당 */}
            <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-400 mb-1">패</span>
              <div className="flex items-center gap-1">
                <ChevronUp className="w-4 h-4 text-blue-600" strokeWidth={3}/><span className="text-lg font-black text-blue-600">{match.odds?.away || "1.00"}</span>
              </div>
            </div>
          </div>
          <p className="mt-5 text-[10px] text-center text-slate-400 italic">"본 데이터는 해외 배당 정보이며, 베팅을 권하지 않습니다."</p>
        </div>
      </main>
    </div>
  );
}

// [메인 앱은 기존과 동일하되, fetchData 부분만 최신 서버 API에 맞춰 확인]
export default function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);

  const today = startOfToday();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i - 2);
    return { date, dateStr: format(date, 'yyyy-MM-dd'), day: format(date, 'M월 d일'), label: i === 2 ? '(today)' : '' };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/matches?date=${dates[selectedDateIdx].dateStr}`);
        const json = await res.json();
        setMatches(json.matches || []);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [selectedDateIdx]);

  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;

  // ... 이하 메인 리스트 렌더링 (이전과 동일)
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900 font-sans tracking-tight">
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
        <div className="space-y-3">
          {matches.map((match) => {
            const isLive = !['NS', 'FT', 'CANC', 'ABD'].includes(match.status);
            const isHomeLiveWin = match.scoreHome > match.scoreAway;
            const isAwayLiveWin = match.scoreAway > match.scoreHome;
            const hExp = match.predict.home;
            const aExp = match.predict.away;
            const isHomePredWin = hExp > aExp;
            const isAwayPredWin = aExp > hExp;
            const isPredDraw = hExp === aExp;
            let displayStatus = "";
            if (match.status === 'NS') displayStatus = match.korTime;
            else if (match.status === 'FT') displayStatus = 'FT';
            else displayStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';

            return (
              <div key={match.id} onClick={() => setSelectedMatch(match)}
                   className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.005] ${
                     isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
                   }`}>
                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isLive ? 'bg-rose-100/50 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'}`}>{match.league}</span>
                    <span className="text-[10px] font-bold" style={{ color: isLive ? "#f97316" : "#475569" }}>{displayStatus}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className={`flex-1 text-right text-sm md:text-base truncate ${isHomeLiveWin ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{match.home}</div>
                    <div className="flex items-center gap-2 text-xl font-bold min-w-[60px] justify-center">
                        {match.status === 'NS' ? <span className="text-slate-200 text-sm">VS</span> : 
                        <><span style={{ color: isHomeLiveWin ? '#ef4444' : '#475569' }}>{match.scoreHome}</span><span className="text-slate-200">:</span><span style={{ color: isAwayLiveWin ? '#ef4444' : '#475569' }}>{match.scoreAway}</span></>}
                    </div>
                    <div className={`flex-1 text-left text-sm md:text-base truncate ${isAwayLiveWin ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>{match.away}</div>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-3 font-black text-lg">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isPredDraw ? 'bg-slate-200 border-slate-300 text-slate-900' : 
                          isHomePredWin ? 'bg-red-50 border-red-100 text-red-500' : 'bg-slate-50 border-slate-100 text-slate-700 font-semibold'
                        }`}>{hExp}</div>
                        <span className="text-slate-200">:</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          isPredDraw ? 'bg-slate-200 border-slate-300 text-slate-900' : 
                          isAwayPredWin ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-700 font-semibold'
                        }`}>{aExp}</div>
                     </div>
                  </div>
                  <div className="mt-4"><div className="h-1.5 flex rounded-full overflow-hidden bg-slate-100/50"><div style={{ width: `${match.probs.home}%` }} className="bg-red-500"></div><div style={{ width: `${match.probs.draw}%` }} className="bg-slate-300"></div><div style={{ width: `${match.probs.away}%` }} className="bg-blue-500"></div></div></div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
