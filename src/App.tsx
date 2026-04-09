import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Info, ChevronUp, ChevronDown, Activity, ListOrdered } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

// 페이지 불러오기
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

// [상세 페이지 컴포넌트]
function MatchDetail({ match, onBack }: { match: any, onBack: () => void }) {
  const getRank1Style = (h: number, a: number) => {
    if (h > a) return { h: "text-red-500 font-black", a: "text-slate-400 font-normal" };
    if (a > h) return { h: "text-slate-400 font-normal", a: "text-red-500 font-black" };
    return { h: "text-white font-bold", a: "text-white font-bold" };
  };

  const getNormalStyle = (h: number, a: number) => {
    if (h > a) return { h: "text-red-500 font-black", a: "text-slate-400 font-normal" };
    if (a > h) return { h: "text-slate-400 font-normal", a: "text-red-500 font-black" };
    return { h: "text-slate-800 font-bold", a: "text-slate-800 font-bold" };
  };

  const topPredictions = [
    { h: match.predict.home, a: match.predict.away, prob: "32%", rank: 1 },
    { h: match.predict.home + 1, a: match.predict.away, prob: "18%", rank: 2 },
    { h: match.predict.home, a: match.predict.away + 1, prob: "14%", rank: 3 },
    { h: match.predict.home + 1, a: match.predict.away + 1, prob: "9%", rank: 4 },
    { h: Math.max(0, match.predict.home - 1), a: match.predict.away, prob: "7%", rank: 5 },
  ];

  let centerStatus = "";
  if (match.status === 'FT') centerStatus = 'FT';
  else if (match.status !== 'NS') centerStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';

  const isHomeWin = match.scoreHome > match.scoreAway;
  const isAwayWin = match.scoreAway > match.scoreHome;
  
  const homeScoreClass = isHomeWin ? "text-red-500 font-black" : isAwayWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
  const awayScoreClass = isAwayWin ? "text-red-500 font-black" : isHomeWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
  
  const homeNameClass = isHomeWin ? "font-black text-slate-900" : isAwayWin ? "font-medium text-slate-400" : "font-black text-slate-800";
  const awayNameClass = isAwayWin ? "font-black text-slate-900" : isHomeWin ? "font-medium text-slate-400" : "font-black text-slate-800";

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
          <div className="text-center text-sm font-bold text-slate-500 mb-2">
            {match.korTime}
          </div>
          
          <div className="flex items-center justify-between gap-2 pt-6">
            <div className={`flex-1 text-right text-base md:text-xl truncate ${homeNameClass}`}>{match.home}</div>
            
            <div className="relative flex items-center justify-center min-w-[80px]">
              {match.status !== 'NS' && (
                <span className="absolute -top-7 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>
              )}
              <div className="flex items-center gap-2 text-base md:text-xl">
                {match.status === 'NS' ? <span className="text-slate-300 font-bold">VS</span> : 
                <>
                  <span className={homeScoreClass}>{match.scoreHome}</span>
                  <span className="text-sm font-bold text-slate-300 lowercase">vs</span>
                  <span className={awayScoreClass}>{match.scoreAway}</span>
                </>}
              </div>
            </div>

            <div className={`flex-1 text-left text-base md:text-xl truncate ${awayNameClass}`}>{match.away}</div>
          </div>
        </div>

        {/* 🔥 1. 경기 이벤트 타임라인 (경기 중이거나 종료되었을 때, 이벤트 데이터가 있을 때만 노출) */}
        {match.status !== 'NS' && match.events && match.events.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-[#0f3460] font-bold"><Activity className="w-5 h-5" /><span>주요 이벤트</span></div>
            <div className="flex flex-col gap-4">
              {match.events.map((ev: any, idx: number) => (
                <div key={idx} className="flex items-center justify-center">
                  
                  {/* 홈팀 이벤트 (오른쪽 정렬, 아이콘이 우측으로 가도록 배치) */}
                  <div className="flex-1 flex items-center justify-end gap-2 text-right">
                    {ev.team === 'home' && (
                      <>
                        {ev.type === 'sub' ? (
                          <div className="flex flex-col items-end text-[11px] font-medium leading-tight gap-0.5">
                            <div className="flex items-center gap-1 text-slate-500">{ev.playerOut} <ArrowLeft className="w-3 h-3 text-red-500" strokeWidth={3} /></div>
                            <div className="flex items-center gap-1 text-slate-800">{ev.playerIn} <ArrowRight className="w-3 h-3 text-[#56ad6a]" strokeWidth={3} /></div>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700 text-sm">{ev.player}</span>
                        )}
                        {ev.type === 'goal' && <span className="text-base">⚽</span>}
                        {ev.type === 'yellow' && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px] border border-yellow-500 shadow-sm shrink-0"></div>}
                        {ev.type === 'red' && <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px] border border-red-600 shadow-sm shrink-0"></div>}
                      </>
                    )}
                  </div>

                  {/* 발생 시간 */}
                  <div className="w-12 flex-shrink-0 text-center font-black text-slate-400 text-xs bg-slate-50 py-1 rounded-lg mx-3 border border-slate-100">
                    {ev.minute}'
                  </div>

                  {/* 원정팀 이벤트 (왼쪽 정렬, 아이콘이 좌측으로 가도록 배치) */}
                  <div className="flex-1 flex items-center justify-start gap-2 text-left">
                    {ev.team === 'away' && (
                      <>
                        {ev.type === 'goal' && <span className="text-base">⚽</span>}
                        {ev.type === 'yellow' && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px] border border-yellow-500 shadow-sm shrink-0"></div>}
                        {ev.type === 'red' && <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px] border border-red-600 shadow-sm shrink-0"></div>}
                        {ev.type === 'sub' ? (
                          <div className="flex flex-col items-start text-[11px] font-medium leading-tight gap-0.5">
                            <div className="flex items-center gap-1 text-slate-500"><ArrowLeft className="w-3 h-3 text-red-500" strokeWidth={3} /> {ev.playerOut}</div>
                            <div className="flex items-center gap-1 text-slate-800"><ArrowRight className="w-3 h-3 text-[#56ad6a]" strokeWidth={3} /> {ev.playerIn}</div>
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700 text-sm">{ev.player}</span>
                        )}
                      </>
                    )}
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 기존 예상 스코어 순위 */}
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
                      <span className={style.h}>{p.h}</span><span className={isRank1 ? 'text-slate-600' : 'text-slate-400'}>:</span><span className={style.a}>{p.a}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] ${isRank1 ? 'text-[#56ad6a]' : 'text-slate-400'}`}>{p.prob}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 기존 해외 배당 정보 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f] font-bold"><Info className="w-5 h-5" /><span>해외 배당 정보</span></div>
          {match.odds ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                <span className="text-[10px] font-bold text-red-400 mb-1">승</span>
                <div className="flex items-center gap-1"><ChevronDown className="w-4 h-4 text-red-500" strokeWidth={3}/><span className="text-lg font-black text-red-500">{match.odds.home}</span></div>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100"><span className="text-[10px] font-bold text-slate-400 mb-1">무</span><span className="text-lg font-black text-slate-800">{match.odds.draw}</span></div>
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-400 mb-1">패</span>
                <div className="flex items-center gap-1"><ChevronUp className="w-4 h-4 text-blue-600" strokeWidth={3}/><span className="text-lg font-black text-blue-600">{match.odds.away}</span></div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed">이 경기는 현재 해외 배당 준비 중입니다.</div>
          )}
          <p className="mt-5 text-[10px] text-center text-slate-400 italic">"본 데이터는 해외 배당 정보이며, 베팅을 권하지 않습니다."</p>
        </div>

        {/* 🔥 2. 대회 순위표 (데이터가 있을 때만 항상 노출) */}
        {match.standings && match.standings.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold"><ListOrdered className="w-5 h-5 text-slate-500" /><span>순위표</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium w-10">순위</th>
                    <th className="py-2.5 font-medium text-left">팀명</th>
                    <th className="py-2.5 font-medium w-8">경기</th>
                    <th className="py-2.5 font-medium w-8">승</th>
                    <th className="py-2.5 font-medium w-8">무</th>
                    <th className="py-2.5 font-medium w-8">패</th>
                    <th className="py-2.5 font-medium w-8">득실</th>
                    <th className="py-2.5 font-black w-10 text-[#56ad6a]">승점</th>
                  </tr>
                </thead>
                <tbody>
                  {match.standings.map((s: any) => {
                    const isTargetTeam = s.team === match.home || s.team === match.away;
                    return (
                      <tr key={s.rank} className={`border-b border-slate-50 last:border-0 transition-colors ${isTargetTeam ? 'bg-slate-50/80 font-bold' : ''}`}>
                        <td className="py-3 text-slate-500">{s.rank}</td>
                        <td className={`py-3 text-left ${isTargetTeam ? 'text-slate-900' : 'text-slate-600'}`}>{s.team}</td>
                        <td className="py-3 text-slate-500">{s.played}</td>
                        <td className="py-3 text-slate-500">{s.win}</td>
                        <td className="py-3 text-slate-500">{s.draw}</td>
                        <td className="py-3 text-slate-500">{s.lose}</td>
                        <td className="py-3 text-slate-500">{s.goalDiff}</td>
                        <td className="py-3 text-[#56ad6a] font-black">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// [메인 앱 컴포넌트]
export default function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('main');

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

  if (selectedPage === 'about') return <About onBack={() => setSelectedPage('main')} />;
  if (selectedPage === 'terms') return <Terms onBack={() => setSelectedPage('main')} />;
  if (selectedPage === 'privacy') return <Privacy onBack={() => setSelectedPage('main')} />;

  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={() => setSelectedMatch(null)} />;

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900 font-sans tracking-tight">
      <header className="bg-white py-10 flex justify-center items-center border-b border-slate-100 shadow-sm">
        <div className="flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none">
            <span style={{ color: '#0f3460' }}>Scored</span>
            <span style={{ color: '#84cc16' }}>Lab</span>
          </h1>
          <div 
            className="w-16 h-1.5 mt-2 rounded-full" 
            style={{ background: 'linear-gradient(to right, #0f3460, #84cc16)' }}
          ></div>
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
            const isHomeWin = match.scoreHome > match.scoreAway;
            const isAwayWin = match.scoreAway > match.scoreHome;
            const hExp = match.predict.home;
            const aExp = match.predict.away;
            const isHomePredWin = hExp > aExp;
            const isAwayPredWin = aExp > hExp;
            const isPredDraw = hExp === aExp;
            
            let centerStatus = "";
            if (match.status === 'FT') centerStatus = 'FT';
            else if (match.status !== 'NS') centerStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';

            const homeListScoreClass = isHomeWin ? "text-red-500 font-black" : isAwayWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
            const awayListScoreClass = isAwayWin ? "text-red-500 font-black" : isHomeWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";

            const homeListNameClass = isHomeWin ? "font-black text-slate-900" : isAwayWin ? "font-medium text-slate-400" : "font-bold text-slate-700";
            const awayListNameClass = isAwayWin ? "font-black text-slate-900" : isHomeWin ? "font-medium text-slate-400" : "font-bold text-slate-700";

            const predWinBoxClass = "bg-red-50 border-red-100 text-red-500 font-black";
            const predLoseBoxClass = "bg-slate-50 border-slate-100 text-slate-400 font-normal";
            const predDrawBoxClass = "bg-slate-200 border-slate-300 text-slate-900 font-bold";

            const homePredBoxClass = isPredDraw ? predDrawBoxClass : isHomePredWin ? predWinBoxClass : predLoseBoxClass;
            const awayPredBoxClass = isPredDraw ? predDrawBoxClass : isAwayPredWin ? predWinBoxClass : predLoseBoxClass;

            return (
              <div key={match.id} onClick={() => setSelectedMatch(match)}
                   className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.005] ${
                     isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
                   }`}>
                <div className="p-3 md:p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isLive ? 'bg-rose-100/50 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'}`}>{match.league}</span>
                    <span className="text-[10px] font-bold text-slate-700">{match.korTime}</span>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 mb-3 pt-4">
                    <div className={`flex-1 text-right text-sm md:text-base truncate ${homeListNameClass}`}>{match.home}</div>
                    
                    <div className="relative flex items-center justify-center min-w-[80px]">
                        {match.status !== 'NS' && (
                          <span className="absolute -top-6 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>
                        )}
                        <div className="flex items-center gap-2 text-xl">
                            {match.status === 'NS' ? <span className="text-slate-300 text-sm font-bold mt-1">VS</span> : 
                            <>
                              <span className={homeListScoreClass}>{match.scoreHome}</span>
                              <span className="text-slate-300 text-sm font-bold lowercase">vs</span>
                              <span className={awayListScoreClass}>{match.scoreAway}</span>
                            </>}
                        </div>
                    </div>

                    <div className={`flex-1 text-left text-sm md:text-base truncate ${awayListNameClass}`}>{match.away}</div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                     <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">예상 스코어</span>
                     <div className="flex items-center gap-3 text-lg">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${homePredBoxClass}`}>{hExp}</div>
                        <span className="text-slate-300 font-bold">:</span>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${awayPredBoxClass}`}>{aExp}</div>
                     </div>
                  </div>
                  
                  <div className="mt-4">
                    <div className="h-1.5 flex rounded-full overflow-hidden bg-slate-100/50">
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

      <footer className="mt-12 py-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="flex gap-4 text-xs text-slate-400 font-medium">
          <button onClick={() => setSelectedPage('about')} className="hover:text-slate-600 transition-colors">소개</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => setSelectedPage('terms')} className="hover:text-slate-600 transition-colors">이용약관</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => setSelectedPage('privacy')} className="hover:text-slate-600 transition-colors">개인정보처리방침</button>
        </div>
        <p className="text-[10px] text-slate-300">© {new Date().getFullYear()} ScoredLab. All rights reserved.</p>
      </footer>
    </div>
  );
}
