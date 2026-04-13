import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Info, ChevronUp, ChevronDown, Activity, ListOrdered, Star, X, RefreshCw, Circle, Globe, Users, LayoutList } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

// 🔥 프로토(스포츠토토) 발매 대상 주요 리그 ID 모음
const PROTO_LEAGUES = [
  39, 40, 45, 48,       // 잉글랜드 (EPL, 챔피언십, FA컵, 카라바오컵)
  140, 143,             // 스페인 (라리가, 국왕컵)
  78, 79, 81,           // 독일 (분데스리가, 2부, 포칼)
  135, 137,             // 이탈리아 (세리에A, 코파 이탈리아)
  61, 66,               // 프랑스 (리그앙, 쿠프드프랑스)
  88, 94, 179,          // 네덜란드, 포르투갈, 스코틀랜드 1부
  292, 293,             // 한국 (K리그1, K리그2)
  98, 253, 188,         // 일본 J리그, 미국 MLS, 호주 A리그
  2, 3, 848,            // 챔스, 유로파, 컨퍼런스리그
  15, 4, 1, 9, 10       // 월드컵, 유로, 아시안컵, 코파 아메리카, 친선전
];

// 🔥 [글로벌] 완벽한 번역 사전
const t = {
  ko: {
    liveMatches: "현재 진행 중인 라이브 경기가 없습니다.",
    noMatches: "이 날짜에는 예정된 경기가 없습니다.",
    apiLimit: "(만약 일정이 있는데 안 보인다면 일일 데이터 한도를 모두 소진한 것입니다. 내일 아침에 다시 시도해주세요!)",
    expectedScore: "예상 스코어",
    matchEvents: "주요 이벤트",
    topPredictions: "예상 스코어 순위 (Top 5)",
    oddsInfo: "해외 배당 정보",
    standings: "순위표",
    rank: "순위",
    team: "팀명",
    played: "경기",
    win: "승",
    draw: "무",
    lose: "패",
    goalDiff: "득실",
    points: "승점",
    winShort: "승",
    drawShort: "무",
    loseShort: "패",
    noOdds: "이 경기는 현재 해외 배당 준비 중입니다.",
    oddsWarning: "\"본 데이터는 해외 배당 정보이며, 베팅을 권하지 않습니다.\"",
    about: "소개",
    terms: "이용약관",
    privacy: "개인정보처리방침",
    status: { FT: "종료", AET: "연장종료", PEN: "승부차기", PST: "연기", TBD: "미정", CANC: "취소" },
    modalTitle: "앱처럼 바탕화면에\n저장하시겠습니까?",
    modalDesc: "매일 새로운 축구 예상 스코어를\n가장 빠르게 확인하실 수 있습니다.",
    modalNo: "아니오",
    modalYes: "예",
    modalGuideTitle: "추가 방법 안내",
    modalOk: "확인했습니다",
    lineups: "선발 명단",
    coach: "감독",
    startingXI: "선발 라인업",
    predictionDisclaimer: "* 예상 스코어는 경기 시작 전까지 해외 배당 흐름에 따라 실시간으로 변동될 수 있습니다.",
    listDisclaimer: "현재 표시되는 점수는 예상 스코어 입니다."
  },
  en: {
    liveMatches: "No live matches at the moment.",
    noMatches: "No matches scheduled for this date.",
    apiLimit: "(If matches are expected but not showing, the daily data limit has been reached. Please try again tomorrow!)",
    expectedScore: "Expected Score",
    matchEvents: "Match Events",
    topPredictions: "Top 5 Predictions",
    oddsInfo: "Match Odds",
    standings: "Standings",
    rank: "Rank",
    team: "Team",
    played: "P",
    win: "W",
    draw: "D",
    lose: "L",
    goalDiff: "GD",
    points: "Pts",
    winShort: "W",
    drawShort: "D",
    loseShort: "L",
    noOdds: "Odds are currently unavailable for this match.",
    oddsWarning: "\"This data is for informational purposes only. We do not encourage betting.\"",
    about: "About Us",
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    status: { FT: "FT", AET: "AET", PEN: "PEN", PST: "Postponed", TBD: "TBD", CANC: "Canceled" },
    modalTitle: "Add this app to your\nhome screen?",
    modalDesc: "Get the fastest football score\npredictions every day.",
    modalNo: "No, thanks",
    modalYes: "Yes, add it",
    modalGuideTitle: "How to add",
    modalOk: "I got it",
    lineups: "Lineups",
    coach: "Coach",
    startingXI: "Starting XI",
    predictionDisclaimer: "* Expected scores may fluctuate in real-time based on global odds trends before kickoff.",
    listDisclaimer: "The scores currently displayed are predicted scores."
  }
};

// 🔥 [핵심 마법] 브라우저 비밀 수첩(LocalStorage)을 활용한 배당 추적 함수!
const processMatchesWithTrends = (fetchedMatches: any[], dateStr: string) => {
  const storageKey = `scoredLab_odds_${dateStr}`;
  const storedData = localStorage.getItem(storageKey);
  let oldMatches: any[] = [];
  
  if (storedData) {
    try { oldMatches = JSON.parse(storedData); } catch (e) {}
  }

  const updatedMatches = fetchedMatches.map(newMatch => {
    const oldMatch = oldMatches.find(m => m.id === newMatch.id);
    
    // 이전 화살표 방향을 그대로 물려받습니다. (변화가 없어도 화살표 유지!)
    let trend = oldMatch?.oddsTrend || { home: null, away: null };

    if (oldMatch?.odds && newMatch.odds) {
      const oldHome = parseFloat(oldMatch.odds.home);
      const newHome = parseFloat(newMatch.odds.home);
      
      // 숫자가 변했을 때만 화살표 방향을 새로 갱신합니다.
      if (newHome < oldHome) trend.home = 'down';
      else if (newHome > oldHome) trend.home = 'up';

      const oldAway = parseFloat(oldMatch.odds.away);
      const newAway = parseFloat(newMatch.odds.away);
      
      if (newAway < oldAway) trend.away = 'down';
      else if (newAway > oldAway) trend.away = 'up';
    }

    return { ...newMatch, oddsTrend: trend };
  });

  // 갱신된 데이터를 다시 비밀 수첩에 안전하게 적어둡니다. (새로고침 방어!)
  localStorage.setItem(storageKey, JSON.stringify(updatedMatches));
  return updatedMatches;
};

function MatchDetail({ match, onBack, lang }: { match: any, onBack: () => void, lang: 'ko' | 'en' }) {
  const dict = t[lang];

  // 🔥 [스크롤 엘리베이터] 상세페이지 진입 시 화면을 무조건 맨 위로 끌어올립니다!
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
  if (['FT', 'AET', 'PEN', 'PST', 'TBD', 'CANC'].includes(match.status)) {
    centerStatus = (dict.status as any)[match.status] || match.status;
  } else if (match.status !== 'NS') {
    centerStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
  }

  const isHomeWin = match.scoreHome > match.scoreAway || (match.penHome && match.penAway && match.penHome > match.penAway);
  const isAwayWin = match.scoreAway > match.scoreHome || (match.penHome && match.penAway && match.penAway > match.penHome);
  
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
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-sm">{match.league[lang]}</h2>
      </header>

      <main className="max-w-4xl mx-auto px-3 mt-6">
        <div className={`rounded-[32px] p-6 mb-6 shadow-sm border ${
          !['NS', 'FT', 'AET', 'PEN', 'PST', 'TBD', 'CANC', 'ABD'].includes(match.status) ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center text-sm font-bold text-slate-500 mb-2">
            {match.time[lang]}
          </div>
          
          <div className="flex items-center justify-between gap-2 pt-6">
            <div className={`flex-1 text-right text-base md:text-xl truncate ${homeNameClass}`}>{match.home[lang]}</div>
            
            <div className="relative flex items-center justify-center min-w-[80px]">
              {match.status !== 'NS' && (
                <span className="absolute -top-7 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>
              )}
              <div className="flex items-center gap-2 text-base md:text-xl">
                {match.status === 'NS' ? <span className="text-slate-300 font-bold">VS</span> : 
                <>
                  <span className={homeScoreClass}>
                    {match.scoreHome}
                    {match.penHome !== null && <span className="text-sm ml-1 text-orange-500">({match.penHome})</span>}
                  </span>
                  <span className="text-sm font-bold text-slate-300 lowercase">vs</span>
                  <span className={awayScoreClass}>
                    {match.penAway !== null && <span className="text-sm mr-1 text-orange-500">({match.penAway})</span>}
                    {match.scoreAway}
                  </span>
                </>}
              </div>
            </div>

            <div className={`flex-1 text-left text-base md:text-xl truncate ${awayNameClass}`}>{match.away[lang]}</div>
          </div>
        </div>

        {match.lineups && match.lineups.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-5 text-blue-500 font-bold">
              <Users className="w-5 h-5" /><span>{dict.lineups}</span>
            </div>
            
            <div className="flex justify-between gap-4">
              <div className="flex-1 text-left overflow-hidden">
                {match.lineups.filter((l:any) => l.team.id === match.homeId).map((homeLineup: any, idx: number) => (
                  <div key={idx}>
                    <div className="font-black text-slate-800 mb-1">{homeLineup.formation}</div>
                    <div className="text-[10px] font-bold text-slate-300 mb-2 border-b border-slate-100 pb-1 uppercase tracking-wider">{dict.startingXI}</div>
                    <ul className="space-y-1.5 mb-4">
                      {homeLineup.startXI?.map((p: any, i: number) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0">{p.player.number}</span>
                          <span className="truncate">{p.player.name}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">{dict.coach}</div>
                    <div className="text-xs text-slate-500 font-medium truncate">{homeLineup.coach?.name}</div>
                  </div>
                ))}
              </div>

              <div className="w-px bg-slate-50 shrink-0"></div>

              <div className="flex-1 text-right overflow-hidden">
                {match.lineups.filter((l:any) => l.team.id === match.awayId).map((awayLineup: any, idx: number) => (
                  <div key={idx}>
                    <div className="font-black text-slate-800 mb-1">{awayLineup.formation}</div>
                    <div className="text-[10px] font-bold text-slate-300 mb-2 border-b border-slate-100 pb-1 uppercase tracking-wider">{dict.startingXI}</div>
                    <ul className="space-y-1.5 mb-4 flex flex-col items-end">
                      {awayLineup.startXI?.map((p: any, i: number) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2 flex-row-reverse">
                          <span className="text-[10px] font-bold text-slate-400 w-4 text-right shrink-0">{p.player.number}</span>
                          <span className="truncate">{p.player.name}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="text-[10px] font-bold text-slate-300 mb-1 uppercase tracking-wider">{dict.coach}</div>
                    <div className="text-xs text-slate-500 font-medium truncate">{awayLineup.coach?.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {match.status !== 'NS' && match.events && match.events.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-[#0f3460] font-bold"><Activity className="w-5 h-5" /><span>{dict.matchEvents}</span></div>
            <div className="flex flex-col gap-4">
              {match.events.map((ev: any, idx: number) => (
                <div key={idx} className="flex items-center justify-center">
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
                  <div className="w-12 flex-shrink-0 text-center font-black text-slate-400 text-xs bg-slate-50 py-1 rounded-lg mx-3 border border-slate-100">
                    {ev.minute}'
                  </div>
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

        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#56ad6a] font-bold"><TrendingUp className="w-5 h-5" /><span>{dict.topPredictions}</span></div>
          <div className="flex flex-col gap-2.5">
            {topPredictions.map((p: any) => {
              const isRank1 = p.rank === 1;
              const style = isRank1 ? getRank1Style(p.h, p.a) : getNormalStyle(p.h, p.a);
              return (
                <div key={p.rank} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                  isRank1 ? 'bg-slate-900 border-slate-800 scale-[1.01] shadow-md' : 
                  p.rank <= 3 ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-70'
                }`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isRank1 ? 'bg-[#56ad6a] text-white' : 'bg-slate-200 text-slate-500'}`}>{p.rank}{lang === 'ko' ? '위' : ''}</span>
                    <div className="flex items-center gap-2 text-base">
                      <span className={style.h}>{p.h}</span><span className={isRank1 ? 'text-slate-600' : 'text-slate-400'}>:</span><span className={style.a}>{p.a}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] ${isRank1 ? 'text-[#56ad6a]' : 'text-slate-400'}`}>{p.prob}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] text-slate-400 text-center italic leading-relaxed break-keep">
            {dict.predictionDisclaimer}
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f] font-bold"><Info className="w-5 h-5" /><span>{dict.oddsInfo}</span></div>
          {match.odds ? (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="flex flex-col items-center p-4 bg-red-50 rounded-2xl border border-red-100">
                <span className="text-[10px] font-bold text-red-400 mb-1">{dict.winShort}</span>
                <div className="flex items-center gap-1">
                  {match.oddsTrend?.home === 'down' && <ChevronDown className="w-4 h-4 text-red-500" strokeWidth={3}/>}
                  {match.oddsTrend?.home === 'up' && <ChevronUp className="w-4 h-4 text-red-500" strokeWidth={3}/>}
                  <span className="text-lg font-black text-red-500">{match.odds.home}</span>
                </div>
              </div>
              <div className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 mb-1">{dict.drawShort}</span>
                <span className="text-lg font-black text-slate-800">{match.odds.draw}</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-bold text-blue-400 mb-1">{dict.loseShort}</span>
                <div className="flex items-center gap-1">
                  {match.oddsTrend?.away === 'down' && <ChevronDown className="w-4 h-4 text-blue-600" strokeWidth={3}/>}
                  {match.oddsTrend?.away === 'up' && <ChevronUp className="w-4 h-4 text-blue-600" strokeWidth={3}/>}
                  <span className="text-lg font-black text-blue-600">{match.odds.away}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed">{dict.noOdds}</div>
          )}
          <p className="mt-5 text-[10px] text-center text-slate-400 italic">{dict.oddsWarning}</p>
        </div>

        {match.standings && match.standings.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold"><ListOrdered className="w-5 h-5 text-slate-500" /><span>{dict.standings}</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium w-10">{dict.rank}</th>
                    <th className="py-2.5 font-medium text-left">{dict.team}</th>
                    <th className="py-2.5 font-medium w-8">{dict.played}</th>
                    <th className="py-2.5 font-medium w-8">{dict.win}</th>
                    <th className="py-2.5 font-medium w-8">{dict.draw}</th>
                    <th className="py-2.5 font-medium w-8">{dict.lose}</th>
                    <th className="py-2.5 font-medium w-8">{dict.goalDiff}</th>
                    <th className="py-2.5 font-black w-10 text-[#56ad6a]">{dict.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {match.standings.map((s: any) => {
                    const isTargetTeam = s.team.en === match.home.en || s.team.en === match.away.en;
                    return (
                      <tr key={s.rank} className={`border-b border-slate-50 last:border-0 ${isTargetTeam ? 'bg-slate-50/80 font-bold' : ''}`}>
                        <td className="py-3 text-slate-500">{s.rank}</td>
                        <td className={`py-3 text-left ${isTargetTeam ? 'text-slate-900' : 'text-slate-600'}`}>{s.team[lang]}</td>
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

export default function App() {
  const [matches, setMatches] = useState<any[]>([]);
  const [matchCache, setMatchCache] = useState<{ [key: string]: any[] }>({}); 
  const [selectedDateIdx, setSelectedDateIdx] = useState(2);
  const [selectedMatch, setSelectedMatch] = useState<any | null>(null);
  const [selectedPage, setSelectedPage] = useState<string>('main');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [showBookmarkModal, setShowBookmarkModal] = useState(false);
  const [showStep2, setShowStep2] = useState(false);

  const [isLiveMode, setIsLiveMode] = useState(false);
  const [isListView, setIsListView] = useState(false);

  const [lang, setLang] = useState<'ko' | 'en'>('ko');
  const dict = t[lang];

  useEffect(() => {
    const browserLang = navigator.language || (navigator as any).userLanguage;
    if (browserLang && !browserLang.toLowerCase().includes('ko')) {
      setLang('en');
    }
  }, []);

  const today = startOfToday();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i - 2);
    return { 
      date, 
      dateStr: format(date, 'yyyy-MM-dd'), 
      dayKo: format(date, 'M월 d일'), 
      dayEn: format(date, 'MMM d'), 
      labelKo: i === 2 ? '(오늘)' : '',
      labelEn: i === 2 ? '(today)' : ''
    };
  });

  const handleDateClick = (idx: number) => {
    setSelectedDateIdx(idx);
    const dateStr = dates[idx].dateStr;
    const url = `/?date=${dateStr}`;
    window.history.pushState({}, '', url);
  };

  const handleRefresh = async () => {
    if (isRefreshing) return; 
    setIsRefreshing(true);
    const dateStr = dates[selectedDateIdx].dateStr;
    try {
      const res = await fetch(`/api/matches?date=${dateStr}`);
      const json = await res.json();
      
      // 🔥 서버에서 가져온 새 데이터를 '비밀 수첩' 함수에 통과시킵니다.
      const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr);
      
      setMatches(updatedMatches);
      setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const dateStr = dates[selectedDateIdx].dateStr;
    const fetchData = async (isStealthMode = false) => {
      if (!isStealthMode) setIsLoading(true); 
      try {
        const res = await fetch(`/api/matches?date=${dateStr}`);
        const json = await res.json();
        
        // 🔥 자동 갱신 시에도 '비밀 수첩' 함수를 통해 화살표를 유지/갱신합니다.
        const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr);
        
        setMatches(updatedMatches);
        setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches }));
      } catch (e) { 
      } finally {
        if (!isStealthMode) setIsLoading(false); 
      }
    };

    if (matchCache[dateStr]) {
      setMatches(matchCache[dateStr]);
    } else {
      fetchData(false);
    }

    let stealthTimer: NodeJS.Timeout;
    if (selectedDateIdx === 2) {
      stealthTimer = setInterval(() => {
        fetchData(true); 
      }, 3 * 60 * 1000); 
    }

    return () => {
      if (stealthTimer) clearInterval(stealthTimer);
    };
  }, [selectedDateIdx]);

  useEffect(() => {
    const handlePopState = () => {
      setSelectedMatch(null);
      setSelectedPage('main');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToMatch = (match: any) => {
    setSelectedMatch(match);
    window.history.pushState({}, '', `/?match=${match.id}`);
  };

  const goToPage = (page: string) => {
    setSelectedPage(page);
    window.history.pushState({}, '', `/?page=${page}`);
  };

  const goHome = () => {
    setSelectedMatch(null);
    setSelectedPage('main');
    setSelectedDateIdx(2); 
    window.history.pushState({}, '', '/');
  };

  const goBackToList = () => {
    setSelectedMatch(null);
    window.history.pushState({}, '', `/?date=${dates[selectedDateIdx].dateStr}`);
  };

  const userAgent = navigator.userAgent;
  const isiOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  const isUnknownMobile = !isiOS && !isAndroid && /Mobi|webOS/i.test(userAgent);
  const isMac = /Mac/i.test(userAgent);

  if (selectedPage === 'about') return <About onBack={() => goHome()} />;
  if (selectedPage === 'terms') return <Terms onBack={() => goHome()} />;
  if (selectedPage === 'privacy') return <Privacy onBack={() => goHome()} />;

  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={goBackToList} lang={lang} />;

  const displayedMatches = isLiveMode 
    ? matches.filter(m => !['NS', 'FT', 'AET', 'PEN', 'CANC', 'ABD', 'PST', 'TBD', 'AWD', 'WO'].includes(m.status))
    : matches;

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900 font-sans tracking-tight">
      
      <header className="bg-white pt-10 pb-6 flex flex-col items-center border-b border-slate-100 shadow-sm relative">
        <div 
          className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" 
          onClick={() => goHome()}
        >
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none">
            <span className="text-[#0f3460]">Scored</span>
            <span className="text-[#84cc16]">Lab</span>
          </h1>
          <div 
            className="w-16 h-1.5 mt-2 rounded-full" 
            style={{ background: 'linear-gradient(to right, #0f3460, #84cc16)' }}
          ></div>
        </div>

        <div className="w-full max-w-4xl px-4 mt-8 grid grid-cols-5 gap-1.5 md:gap-2 items-center">
          
          <button 
            onClick={() => setIsLiveMode(!isLiveMode)} 
            className={`h-11 flex flex-row items-center justify-center gap-1.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-sm border ${
              isLiveMode ? 'bg-[#56ad6a] border-[#56ad6a] text-white shadow-md shadow-green-500/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
            }`}
          >
            <Circle className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isLiveMode ? 'fill-white text-white' : 'fill-slate-300 text-slate-300'}`} />
            LIVE
          </button>

          <button 
            onClick={() => setIsListView(!isListView)} 
            className={`h-11 flex flex-row items-center justify-center gap-1.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm border ${
              isListView ? 'bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-500/20' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <LayoutList className={`w-4 h-4 ${isListView ? 'text-white' : 'text-slate-500'}`} />
            {isListView ? 'CARD' : 'LIST'}
          </button>

          <button 
            onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} 
            className="h-11 flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-100 transition-all shadow-sm hover:bg-slate-50 font-bold text-xs text-slate-600"
          >
            <Globe className="w-4 h-4 text-[#0f3460]" />
            {lang === 'ko' ? 'ENG' : 'KOR'}
          </button>

          <button 
            onClick={() => { setShowBookmarkModal(true); setShowStep2(false); }}
            className="h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all shadow-sm hover:bg-slate-50"
          >
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          </button>

          <button 
            onClick={handleRefresh} 
            className={`h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all shadow-sm hover:bg-slate-50 ${isRefreshing ? 'opacity-70 scale-95' : 'active:scale-95'}`}
          >
            <RefreshCw className={`w-5 h-5 text-[#56ad6a] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

        </div>
      </header>

      {showBookmarkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setShowBookmarkModal(false)} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
              <X className="w-6 h-6" />
            </button>
            
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center">
                <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
              </div>
            </div>
            
            {!showStep2 ? (
              <>
                <h3 className="text-xl font-black text-slate-800 text-center mb-3 leading-tight whitespace-pre-line">
                  {dict.modalTitle}
                </h3>
                <p className="text-slate-500 text-center text-sm mb-8 whitespace-pre-line">{dict.modalDesc}</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowBookmarkModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-500 font-bold rounded-2xl hover:bg-slate-200 transition-colors">{dict.modalNo}</button>
                  <button onClick={() => setShowStep2(true)} className="flex-1 py-4 bg-[#56ad6a] text-white font-bold rounded-2xl shadow-lg shadow-green-100 hover:bg-[#4a9a5d] transition-colors">{dict.modalYes}</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-black text-slate-800 text-center mb-5">{dict.modalGuideTitle}</h3>
                
                <div className="text-sm text-slate-600 text-center mb-8 space-y-3 bg-slate-50 p-5 rounded-[24px] border border-slate-100 leading-relaxed">
                  {isiOS && !isAndroid ? (
                    <div className="space-y-4 text-left px-2">
                      <div>
                        <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded mb-1">Chrome</span>
                        <p className="text-xs text-slate-600">Share(⬆️) ➔ <strong className="text-[#0f3460]">Add to Home Screen</strong></p>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <span className="inline-block bg-slate-200 text-slate-700 text-[10px] font-black px-2 py-0.5 rounded mb-1">Safari</span>
                        <p className="text-xs text-slate-600">Share(⬆️) ➔ <strong className="text-[#0f3460]">Add to Home Screen</strong></p>
                      </div>
                    </div>
                  ) : isAndroid && !isiOS ? (
                    <p>Tap the <strong>Menu (⋮)</strong> ➔<br/><span className="text-[#0f3460] font-bold underline">Add to Home screen</span></p>
                  ) : (
                    <p>Press <strong className="text-[#0f3460] text-lg">{isMac ? 'Cmd + D' : 'Ctrl + D'}</strong> to bookmark!</p>
                  )}
                </div>

                <button onClick={() => setShowBookmarkModal(false)} className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">{dict.modalOk}</button>
              </>
            )}
          </div>
        </div>
      )}

      <nav className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between gap-2">
          {dates.map((date, idx) => (
            <button key={idx} onClick={() => handleDateClick(idx)}
              className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md' : 'bg-slate-50 text-slate-400'
              }`}>
              <span className="text-sm font-bold">{lang === 'ko' ? date.dayKo : date.dayEn}</span>
              <span className="text-[9px]">{lang === 'ko' ? date.labelKo : date.labelEn}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 mt-6">
        
        {isListView && !isLoading && displayedMatches.length > 0 && (
          <div className="bg-slate-800 text-white text-xs font-bold text-center py-3 rounded-2xl mb-4 shadow-sm animate-in fade-in">
            💡 {dict.listDisclaimer}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="rounded-[24px] border border-slate-100 bg-white p-4 shadow-sm animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-3 bg-slate-100 rounded"></div>
                  <div className="w-16 h-3 bg-slate-100 rounded"></div>
                </div>
                <div className="flex items-center justify-center gap-3 mb-6 pt-2">
                  <div className="flex-1 h-4 bg-slate-100 rounded"></div>
                  <div className="w-8 h-8 bg-slate-100 rounded-full"></div>
                  <div className="flex-1 h-4 bg-slate-100 rounded"></div>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-2 bg-slate-100 rounded mb-1"></div>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-xl"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-[24px] border border-slate-100 shadow-sm">
            <div className="text-4xl mb-3">⚽</div>
            <div className="text-slate-500 font-bold">
              {isLiveMode ? dict.liveMatches : dict.noMatches}
            </div>
            <p className="text-[10px] text-slate-300 mt-4 px-6">{dict.apiLimit}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayedMatches.map((match: any) => {
              const isLive = !['NS', 'FT', 'AET', 'PEN', 'CANC', 'ABD', 'PST', 'TBD', 'AWD', 'WO'].includes(match.status);
              
              const isHomeWin = match.scoreHome > match.scoreAway || (match.penHome && match.penAway && match.penHome > match.penAway);
              const isAwayWin = match.scoreAway > match.scoreHome || (match.penHome && match.penAway && match.penAway > match.penHome);
              
              const hExp = match.predict.home;
              const aExp = match.predict.away;
              const isHomePredWin = hExp > aExp;
              const isAwayPredWin = aExp > hExp;
              const isPredDraw = hExp === aExp;
              
              let centerStatus = "";
              if (['FT', 'AET', 'PEN', 'PST', 'TBD', 'CANC'].includes(match.status)) {
                centerStatus = (dict.status as any)[match.status] || match.status;
              } else if (match.status !== 'NS') {
                centerStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE';
              }

              const homeListScoreClass = isHomeWin ? "text-red-500 font-black" : isAwayWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
              const awayListScoreClass = isAwayWin ? "text-red-500 font-black" : isHomeWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
              const homeListNameClass = isHomeWin ? "font-black text-slate-900" : isAwayWin ? "font-medium text-slate-400" : "font-bold text-slate-700";
              const awayListNameClass = isAwayWin ? "font-black text-slate-900" : isHomeWin ? "font-medium text-slate-400" : "font-bold text-slate-700";

              const predWinBoxClass = "bg-red-50 border-red-100 text-red-500 font-black";
              const predLoseBoxClass = "bg-slate-50 border-slate-100 text-slate-400 font-normal";
              const predDrawBoxClass = "bg-slate-200 border-slate-300 text-slate-900 font-bold";
              const homePredBoxClass = isPredDraw ? predDrawBoxClass : isHomePredWin ? predWinBoxClass : predLoseBoxClass;
              const awayPredBoxClass = isPredDraw ? predDrawBoxClass : isAwayPredWin ? predWinBoxClass : predLoseBoxClass;

              if (isListView) {
                return (
                  <div key={match.id} onClick={() => goToMatch(match)}
                       className={`flex items-center justify-between p-3 mb-2 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${
                         isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
                       }`}>
                    
                    <div className="w-14 md:w-20 shrink-0 flex flex-col justify-center pr-2 border-r border-slate-100">
                       {PROTO_LEAGUES.includes(match.leagueId) && (
                          <span className="bg-[#0f3460] text-white text-[7px] font-black px-1 py-0.5 rounded-sm w-max tracking-wider mb-1 shadow-sm">PROTO</span>
                       )}
                       <span className={`text-[9px] font-black uppercase truncate ${isLive ? 'text-rose-500' : 'text-[#56ad6a]'}`}>{match.league[lang]}</span>
                    </div>

                    <div className="flex flex-1 items-center justify-center gap-3 md:gap-6 px-2 md:px-4 overflow-hidden">
                       <div className={`flex-1 text-right text-xs md:text-sm truncate ${homeListNameClass}`}>
                          {match.home[lang]}
                       </div>
                       
                       <div className="shrink-0 flex items-center gap-2 md:gap-3 text-base md:text-lg">
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${homePredBoxClass}`}>{hExp}</div>
                          <span className="text-slate-300 font-bold text-xs md:text-sm">:</span>
                          <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${awayPredBoxClass}`}>{aExp}</div>
                       </div>

                       <div className={`flex-1 text-left text-xs md:text-sm truncate ${awayListNameClass}`}>
                          {match.away[lang]}
                       </div>
                    </div>

                    <div className="w-12 md:w-16 shrink-0 flex flex-col items-end pl-2 border-l border-slate-100">
                       {match.status !== 'NS' ? (
                          <span className="text-[10px] font-black text-orange-500">{centerStatus}</span>
                       ) : (
                          <span className="text-[10px] font-bold text-slate-400">{match.time[lang].split(' ').pop()}</span>
                       )}
                    </div>
                  </div>
                );
              }

              return (
                <div key={match.id} onClick={() => goToMatch(match)}
                     className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.005] duration-300 ${
                       isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
                     }`}>
                  <div className="p-3 md:p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        {PROTO_LEAGUES.includes(match.leagueId) && (
                          <span className="bg-[#0f3460] text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center justify-center tracking-wider shadow-sm">
                            PROTO
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isLive ? 'bg-rose-100/50 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'}`}>{match.league[lang]}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{match.time[lang]}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-3 mb-3 pt-4">
                      <div className={`flex-1 text-right text-sm md:text-base truncate ${homeListNameClass}`}>{match.home[lang]}</div>
                      <div className="relative flex items-center justify-center min-w-[80px]">
                          {match.status !== 'NS' && (
                            <span className="absolute -top-6 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>
                          )}
                          <div className="flex items-center gap-2 text-xl">
                              {match.status === 'NS' ? <span className="text-slate-300 text-sm font-bold mt-1">VS</span> : 
                              <>
                                <span className={homeListScoreClass}>
                                  {match.scoreHome}
                                  {match.penHome !== null && <span className="text-xs ml-1 text-orange-500">({match.penHome})</span>}
                                </span>
                                <span className="text-slate-300 text-sm font-bold lowercase">vs</span>
                                <span className={awayListScoreClass}>
                                  {match.penAway !== null && <span className="text-xs mr-1 text-orange-500">({match.penAway})</span>}
                                  {match.scoreAway}
                                </span>
                              </>}
                          </div>
                      </div>
                      <div className={`flex-1 text-left text-sm md:text-base truncate ${awayListNameClass}`}>{match.away[lang]}</div>
                    </div>

                    <div className="flex flex-col items-center gap-2">
                       <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{dict.expectedScore}</span>
                       <div className="flex items-center gap-3 text-lg">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${homePredBoxClass}`}>{hExp}</div>
                          <span className="text-slate-300 font-bold">:</span>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${awayPredBoxClass}`}>{aExp}</div>
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
        )}
      </main>

      <footer className="mt-12 py-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="flex gap-4 text-xs text-slate-400 font-medium">
          <button onClick={() => goToPage('about')} className="hover:text-slate-600 transition-colors">{dict.about}</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => goToPage('terms')} className="hover:text-slate-600 transition-colors">{dict.terms}</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => goToPage('privacy')} className="hover:text-slate-600 transition-colors">{dict.privacy}</button>
        </div>
        <p className="text-[10px] text-slate-300">© {new Date().getFullYear()} ScoredLab. All rights reserved.</p>
      </footer>
    </div>
  );
}
