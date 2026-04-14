import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Info, ChevronUp, ChevronDown, Activity, ListOrdered, Star, X, RefreshCw, Circle, Globe, Users, LayoutList, History, BarChart3 } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

declare global { interface Window { gtag?: (...args: any[]) => void; } }

const PROTO_LEAGUES = [
  39, 40, 45, 48, 140, 143, 78, 79, 81, 135, 137, 61, 66, 88, 94, 179, 
  292, 293, 98, 253, 188, 2, 3, 848, 15, 4, 1, 9, 10
];

const t = {
  ko: {
    liveMatches: "현재 진행 중인 라이브 경기가 없습니다.", noMatches: "이 날짜에는 예정된 경기가 없습니다.",
    apiLimit: "(만약 일정이 있는데 안 보인다면 일일 데이터 한도를 모두 소진한 것입니다. 내일 아침에 다시 시도해주세요!)",
    expectedScore: "예상 스코어", matchEvents: "주요 이벤트", topPredictions: "예상 스코어 순위 (Top 5)",
    oddsInfo: "해외 배당 정보", standings: "순위표", rank: "순위", team: "팀명", played: "경기",
    win: "승", draw: "무", lose: "패", goalDiff: "득실", points: "승점",
    winShort: "승", drawShort: "무", loseShort: "패", noOdds: "이 경기는 현재 해외 배당 준비 중입니다.",
    oddsWarning: "\"본 데이터는 해외 배당 정보이며, 베팅을 권하지 않습니다.\"",
    about: "소개", terms: "이용약관", privacy: "개인정보처리방침",
    status: { FT: "종료", AET: "연장종료", PEN: "승부차기", PST: "연기", TBD: "미정", CANC: "취소" },
    modalTitle: "앱처럼 바탕화면에\n저장하시겠습니까?", modalDesc: "매일 새로운 축구 예상 스코어를\n가장 빠르게 확인하실 수 있습니다.",
    modalNo: "아니오", modalYes: "예", modalGuideTitle: "추가 방법 안내", modalOk: "확인했습니다",
    lineups: "선발 명단", coach: "감독", startingXI: "선발 라인업",
    predictionDisclaimer: "* 예상 스코어는 경기 시작 전까지 해외 배당 흐름에 따라 실시간으로 변동될 수 있습니다.",
    listDisclaimer: "현재 표시되는 점수는 예상 스코어 입니다.",
    oddsHistoryTitle: "과거 배당 변동 내역", oddsHistoryDesc: "위쪽이 최신입니다",
    statsTitle: "경기 기록", statPossession: "볼 점유율 (%)", statShotsTotal: "총 슈팅", statShotsOn: "유효 슈팅",
    statShotsOff: "빗나간 슈팅", statShotsBlocked: "막힌 슈팅", statShotsInside: "박스 안 슈팅", statShotsOutside: "박스 밖 슈팅",
    statPassesTotal: "패스 횟수", statPassesAccurate: "패스 성공", statPassesPct: "패스 성공률 (%)",
    statOffsides: "오프사이드", statSaves: "골키퍼 선방", statFouls: "파울", statCorners: "코너킥", statYellows: "경고", statReds: "퇴장"
  },
  en: {
    liveMatches: "No live matches at the moment.", noMatches: "No matches scheduled for this date.",
    apiLimit: "(If matches are expected but not showing, the daily data limit has been reached. Please try again tomorrow!)",
    expectedScore: "Expected Score", matchEvents: "Match Events", topPredictions: "Top 5 Predictions",
    oddsInfo: "Match Odds", standings: "Standings", rank: "Rank", team: "Team", played: "P",
    win: "W", draw: "D", lose: "L", goalDiff: "GD", points: "Pts",
    winShort: "W", drawShort: "D", loseShort: "L", noOdds: "Odds are currently unavailable for this match.",
    oddsWarning: "\"This data is for informational purposes only. We do not encourage betting.\"",
    about: "About Us", terms: "Terms of Service", privacy: "Privacy Policy",
    status: { FT: "FT", AET: "AET", PEN: "PEN", PST: "Postponed", TBD: "TBD", CANC: "Canceled" },
    modalTitle: "Add this app to your\nhome screen?", modalDesc: "Get the fastest football score\npredictions every day.",
    modalNo: "No, thanks", modalYes: "Yes, add it", modalGuideTitle: "How to add", modalOk: "I got it",
    lineups: "Lineups", coach: "Coach", startingXI: "Starting XI",
    predictionDisclaimer: "* Expected scores may fluctuate in real-time based on global odds trends before kickoff.",
    listDisclaimer: "The scores currently displayed are predicted scores.",
    oddsHistoryTitle: "Past Odds History", oddsHistoryDesc: "Top is the latest",
    statsTitle: "Match Stats", statPossession: "Possession (%)", statShotsTotal: "Total Shots", statShotsOn: "Shots on Goal",
    statShotsOff: "Shots off Goal", statShotsBlocked: "Blocked Shots", statShotsInside: "Shots inside box", statShotsOutside: "Shots outside box",
    statPassesTotal: "Total Passes", statPassesAccurate: "Accurate Passes", statPassesPct: "Pass Accuracy (%)",
    statOffsides: "Offsides", statSaves: "Goalkeeper Saves", statFouls: "Fouls", statCorners: "Corners", statYellows: "Yellow Cards", statReds: "Red Cards"
  }
};

const processMatchesWithTrends = (fetchedMatches: any[], dateStr: string) => {
  const storageKey = `scoredLab_oddsHistory_${dateStr}`;
  const storedData = localStorage.getItem(storageKey);
  let oldHistoryMap: { [id: number]: any[] } = {};
  if (storedData) { try { oldHistoryMap = JSON.parse(storedData); } catch (e) {} }

  const updatedMatches = fetchedMatches.map(newMatch => {
    let history = oldHistoryMap[newMatch.id] || [];
    if (newMatch.odds && newMatch.odds.home && newMatch.odds.draw && newMatch.odds.away) {
      const latest = history.length > 0 ? history[0] : null;
      const isChanged = !latest || latest.home !== newMatch.odds.home || latest.draw !== newMatch.odds.draw || latest.away !== newMatch.odds.away;
      if (isChanged) { history = [newMatch.odds, ...history].slice(0, 5); }
    }
    oldHistoryMap[newMatch.id] = history;
    return { ...newMatch, oddsHistory: history };
  });

  localStorage.setItem(storageKey, JSON.stringify(oldHistoryMap));
  return updatedMatches;
};

const StatBar = ({ label, home, away }: { label: string, home: number, away: number }) => {
  if (home === undefined || away === undefined) return null; // 🔥 안전장치 추가!
  const total = home + away;
  const homePct = total === 0 ? 50 : (home / total) * 100;
  const awayPct = total === 0 ? 50 : (away / total) * 100;
  const isPercent = label.includes('%');
  const displayLabel = label.replace(' (%)', '');

  const homeColor = home > away ? 'bg-red-500' : home < away ? 'bg-slate-200' : 'bg-slate-400';
  const awayColor = away > home ? 'bg-blue-500' : away < home ? 'bg-slate-200' : 'bg-slate-400';
  const homeTextClass = home > away ? 'text-red-500 font-black' : 'text-slate-500 font-bold';
  const awayTextClass = away > home ? 'text-blue-600 font-black' : 'text-slate-500 font-bold';

  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between items-end text-xs mb-1.5 px-1">
        <span className={`w-10 text-left ${homeTextClass}`}>{home}{isPercent ? '%' : ''}</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{displayLabel}</span>
        <span className={`w-10 text-right ${awayTextClass}`}>{away}{isPercent ? '%' : ''}</span>
      </div>
      <div className="flex h-2.5 w-full bg-slate-100 rounded-full overflow-hidden gap-1">
        <div className={`h-full ${homeColor} rounded-r-[4px] transition-all duration-1000 ease-out`} style={{ width: `${homePct}%` }}></div>
        <div className={`h-full ${awayColor} rounded-l-[4px] transition-all duration-1000 ease-out`} style={{ width: `${awayPct}%` }}></div>
      </div>
    </div>
  );
};

function MatchDetail({ match, onBack, lang }: { match: any, onBack: () => void, lang: 'ko' | 'en' }) {
  const dict = t[lang];

  useEffect(() => { window.scrollTo(0, 0); }, []);

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
  if (['FT', 'AET', 'PEN', 'PST', 'TBD', 'CANC'].includes(match.status)) { centerStatus = (dict.status as any)[match.status] || match.status; } 
  else if (match.status !== 'NS') { centerStatus = match.elapsed ? `${match.elapsed}'` : 'LIVE'; }

  const isHomeWin = match.scoreHome > match.scoreAway || (match.penHome && match.penAway && match.penHome > match.penAway);
  const isAwayWin = match.scoreAway > match.scoreHome || (match.penHome && match.penAway && match.penAway > match.penHome);
  
  const homeScoreClass = isHomeWin ? "text-red-500 font-black" : isAwayWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
  const awayScoreClass = isAwayWin ? "text-red-500 font-black" : isHomeWin ? "text-slate-400 font-normal" : "text-slate-800 font-bold";
  const homeNameClass = isHomeWin ? "font-black text-slate-900" : isAwayWin ? "font-medium text-slate-400" : "font-black text-slate-800";
  const awayNameClass = isAwayWin ? "font-black text-slate-900" : isHomeWin ? "font-medium text-slate-400" : "font-black text-slate-800";

  const history = match.oddsHistory || (match.odds ? [match.odds] : []);
  let hProps, dProps, aProps;

  if (history.length > 0) {
    const latest = history[0]; const past = history.length > 1 ? history[1] : null;
    const styleMap: Record<string, any> = {
      red: { bg: 'bg-red-50 border-red-100', label: 'text-red-400', text: 'text-red-600' },
      blue: { bg: 'bg-blue-50 border-blue-100', label: 'text-blue-400', text: 'text-blue-600' },
      gray: { bg: 'bg-slate-50 border-slate-100', label: 'text-slate-400', text: 'text-slate-800' }
    };
    const getProps = (type: 'home' | 'draw' | 'away') => {
        let color = 'gray'; let icon = null;
        const currVal = parseFloat(latest[type]); const pastVal = past ? parseFloat(past[type]) : null;
        if (pastVal !== null && currVal !== pastVal) {
            if (currVal < pastVal) { color = 'red'; icon = 'down'; } else { color = 'blue'; icon = 'up'; }
        } else if (type === 'home' || type === 'away') {
            const h = parseFloat(latest.home); const a = parseFloat(latest.away);
            if (type === 'home' && h < a) color = 'red'; if (type === 'home' && h > a) color = 'blue';
            if (type === 'away' && a < h) color = 'red'; if (type === 'away' && a > h) color = 'blue';
        }
        return { ...styleMap[color], icon, val: latest[type] };
    };
    hProps = getProps('home'); dProps = getProps('draw'); aProps = getProps('away');
  }

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors"><ArrowLeft className="w-6 h-6 text-slate-600" /></button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-sm">{match.league[lang]}</h2>
      </header>

      <main className="max-w-4xl mx-auto px-3 mt-6">
        <div className={`rounded-[32px] p-6 mb-6 shadow-sm border ${
          !['NS', 'FT', 'AET', 'PEN', 'PST', 'TBD', 'CANC', 'ABD'].includes(match.status) ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center text-sm font-bold text-slate-500 mb-2">{match.time[lang]}</div>
          <div className="flex items-center justify-between gap-2 pt-6">
            <div className={`flex-1 text-right text-base md:text-xl truncate ${homeNameClass}`}>{match.home[lang]}</div>
            <div className="relative flex items-center justify-center min-w-[80px]">
              {match.status !== 'NS' && <span className="absolute -top-7 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>}
              <div className="flex items-center gap-2 text-base md:text-xl">
                {match.status === 'NS' ? <span className="text-slate-300 font-bold">VS</span> : 
                <>
                  <span className={homeScoreClass}>{match.scoreHome}{match.penHome !== null && <span className="text-sm ml-1 text-orange-500">({match.penHome})</span>}</span>
                  <span className="text-sm font-bold text-slate-300 lowercase">vs</span>
                  <span className={awayScoreClass}>{match.penAway !== null && <span className="text-sm mr-1 text-orange-500">({match.penAway})</span>}{match.scoreAway}</span>
                </>}
              </div>
            </div>
            <div className={`flex-1 text-left text-base md:text-xl truncate ${awayNameClass}`}>{match.away[lang]}</div>
          </div>
        </div>

        {/* 🔥 안전장치가 적용된 엄청나게 방대해진 경기 통계! */}
        {match.stats && match.stats.possession && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-6 text-[#9d4edd] font-bold">
              <BarChart3 className="w-5 h-5" /><span>{dict.statsTitle}</span>
            </div>
            
            <div className="mb-4">
              <StatBar label={dict.statPossession} home={match.stats.possession?.home} away={match.stats.possession?.away} />
              <StatBar label={dict.statShotsTotal} home={match.stats.shotsTotal?.home} away={match.stats.shotsTotal?.away} />
              <StatBar label={dict.statShotsOn} home={match.stats.shotsOn?.home} away={match.stats.shotsOn?.away} />
              <StatBar label={dict.statShotsOff} home={match.stats.shotsOff?.home} away={match.stats.shotsOff?.away} />
              <StatBar label={dict.statShotsBlocked} home={match.stats.shotsBlocked?.home} away={match.stats.shotsBlocked?.away} />
              <StatBar label={dict.statShotsInside} home={match.stats.shotsInside?.home} away={match.stats.shotsInside?.away} />
              <StatBar label={dict.statShotsOutside} home={match.stats.shotsOutside?.home} away={match.stats.shotsOutside?.away} />
            </div>

            <div className="mb-4 border-t border-slate-50 pt-4">
              <StatBar label={dict.statPassesTotal} home={match.stats.passesTotal?.home} away={match.stats.passesTotal?.away} />
              <StatBar label={dict.statPassesAccurate} home={match.stats.passesAccurate?.home} away={match.stats.passesAccurate?.away} />
              <StatBar label={dict.statPassesPct} home={match.stats.passesPct?.home} away={match.stats.passesPct?.away} />
            </div>

            <div className="border-t border-slate-50 pt-4">
              <StatBar label={dict.statCorners} home={match.stats.corners?.home} away={match.stats.corners?.away} />
              <StatBar label={dict.statOffsides} home={match.stats.offsides?.home} away={match.stats.offsides?.away} />
              <StatBar label={dict.statFouls} home={match.stats.fouls?.home} away={match.stats.fouls?.away} />
              <StatBar label={dict.statSaves} home={match.stats.saves?.home} away={match.stats.saves?.away} />
              {(match.stats.yellows?.home > 0 || match.stats.yellows?.away > 0) && (
                <StatBar label={dict.statYellows} home={match.stats.yellows?.home} away={match.stats.yellows?.away} />
              )}
              {(match.stats.reds?.home > 0 || match.stats.reds?.away > 0) && (
                <StatBar label={dict.statReds} home={match.stats.reds?.home} away={match.stats.reds?.away} />
              )}
            </div>
          </div>
        )}

        {/* 선발 명단 */}
        {match.lineups && match.lineups.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6 animate-in fade-in duration-500">
            <div className="flex items-center gap-2 mb-5 text-blue-500 font-bold"><Users className="w-5 h-5" /><span>{dict.lineups}</span></div>
            <div className="flex justify-between gap-4">
              <div className="flex-1 text-left overflow-hidden">
                {match.lineups.filter((l:any) => l.team.id === match.homeId).map((homeLineup: any, idx: number) => (
                  <div key={idx}>
                    <div className="font-black text-slate-800 mb-1">{homeLineup.formation}</div>
                    <div className="text-[10px] font-bold text-slate-300 mb-2 border-b border-slate-100 pb-1 uppercase tracking-wider">{dict.startingXI}</div>
                    <ul className="space-y-1.5 mb-4">
                      {homeLineup.startXI?.map((p: any, i: number) => (
                        <li key={i} className="text-xs text-slate-600 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 w-4 shrink-0">{p.player.number}</span><span className="truncate">{p.player.name}</span>
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
                          <span className="text-[10px] font-bold text-slate-400 w-4 text-right shrink-0">{p.player.number}</span><span className="truncate">{p.player.name}</span>
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

        {/* 주요 이벤트 */}
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
                          <div className="flex flex-col items-end text-[11px] font-medium leading-tight gap-0.5"><div className="flex items-center gap-1 text-slate-500">{ev.playerOut} <ArrowLeft className="w-3 h-3 text-red-500" strokeWidth={3} /></div><div className="flex items-center gap-1 text-slate-800">{ev.playerIn} <ArrowRight className="w-3 h-3 text-[#56ad6a]" strokeWidth={3} /></div></div>
                        ) : (<span className="font-medium text-slate-700 text-sm">{ev.player}</span>)}
                        {ev.type === 'goal' && <span className="text-base">⚽</span>}
                        {ev.type === 'yellow' && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px] border border-yellow-500 shadow-sm shrink-0"></div>}
                        {ev.type === 'red' && <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px] border border-red-600 shadow-sm shrink-0"></div>}
                      </>
                    )}
                  </div>
                  <div className="w-12 flex-shrink-0 text-center font-black text-slate-400 text-xs bg-slate-50 py-1 rounded-lg mx-3 border border-slate-100">{ev.minute}'</div>
                  <div className="flex-1 flex items-center justify-start gap-2 text-left">
                    {ev.team === 'away' && (
                      <>
                        {ev.type === 'goal' && <span className="text-base">⚽</span>}
                        {ev.type === 'yellow' && <div className="w-2.5 h-3.5 bg-yellow-400 rounded-[2px] border border-yellow-500 shadow-sm shrink-0"></div>}
                        {ev.type === 'red' && <div className="w-2.5 h-3.5 bg-red-500 rounded-[2px] border border-red-600 shadow-sm shrink-0"></div>}
                        {ev.type === 'sub' ? (
                          <div className="flex flex-col items-start text-[11px] font-medium leading-tight gap-0.5"><div className="flex items-center gap-1 text-slate-500"><ArrowLeft className="w-3 h-3 text-red-500" strokeWidth={3} /> {ev.playerOut}</div><div className="flex items-center gap-1 text-slate-800"><ArrowRight className="w-3 h-3 text-[#56ad6a]" strokeWidth={3} /> {ev.playerIn}</div></div>
                        ) : (<span className="font-medium text-slate-700 text-sm">{ev.player}</span>)}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 예상 스코어 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#56ad6a] font-bold"><TrendingUp className="w-5 h-5" /><span>{dict.topPredictions}</span></div>
          <div className="flex flex-col gap-2.5">
            {topPredictions.map((p: any) => {
              const isRank1 = p.rank === 1; const style = isRank1 ? getRank1Style(p.h, p.a) : getNormalStyle(p.h, p.a);
              return (
                <div key={p.rank} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isRank1 ? 'bg-slate-900 border-slate-800 scale-[1.01] shadow-md' : p.rank <= 3 ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-100 opacity-70'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isRank1 ? 'bg-[#56ad6a] text-white' : 'bg-slate-200 text-slate-500'}`}>{p.rank}{lang === 'ko' ? '위' : ''}</span>
                    <div className="flex items-center gap-2 text-base"><span className={style.h}>{p.h}</span><span className={isRank1 ? 'text-slate-600' : 'text-slate-400'}>:</span><span className={style.a}>{p.a}</span></div>
                  </div>
                  <span className={`font-bold text-[10px] ${isRank1 ? 'text-[#56ad6a]' : 'text-slate-400'}`}>{p.prob}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] text-slate-400 text-center italic leading-relaxed break-keep">{dict.predictionDisclaimer}</p>
        </div>

        {/* 해외 배당 히스토리 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f] font-bold"><Info className="w-5 h-5" /><span>{dict.oddsInfo}</span></div>
          {history.length > 0 && hProps && dProps && aProps ? (
            <div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${hProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${hProps.label}`}>{dict.winShort}</span>
                  <div className="flex items-center gap-1">
                    {hProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${hProps.text}`} strokeWidth={3}/>}{hProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${hProps.text}`} strokeWidth={3}/>}
                    <span className={`text-lg font-black ${hProps.text}`}>{hProps.val}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${dProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${dProps.label}`}>{dict.drawShort}</span>
                  <div className="flex items-center gap-1">
                    {dProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${dProps.text}`} strokeWidth={3}/>}{dProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${dProps.text}`} strokeWidth={3}/>}
                    <span className={`text-lg font-black ${dProps.text}`}>{dProps.val}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${aProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${aProps.label}`}>{dict.loseShort}</span>
                  <div className="flex items-center gap-1">
                    {aProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${aProps.text}`} strokeWidth={3}/>}{aProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${aProps.text}`} strokeWidth={3}/>}
                    <span className={`text-lg font-black ${aProps.text}`}>{aProps.val}</span>
                  </div>
                </div>
              </div>
              {history.length > 1 && (
                <div className="mt-4 border-t border-slate-100 pt-5 flex flex-col gap-2 relative animate-in fade-in duration-500">
                  <div className="text-[10px] text-slate-500 font-bold mb-2 flex items-center justify-between px-1">
                    <span className="flex items-center gap-1.5"><History className="w-3.5 h-3.5"/> {dict.oddsHistoryTitle}</span>
                    <span className="text-slate-400 font-normal text-[9px] bg-slate-100 px-2 py-0.5 rounded-md">{dict.oddsHistoryDesc}</span>
                  </div>
                  <div className="flex flex-col gap-1.5">
                     {history.slice(1).map((old: any, idx: number) => {
                       const opacityClass = idx === 0 ? 'opacity-80' : idx === 1 ? 'opacity-60' : 'opacity-40';
                       return (
                         <div key={idx} className={`grid grid-cols-3 gap-3 text-center bg-slate-50 rounded-xl py-2 border border-slate-100/50 ${opacityClass} hover:opacity-100 transition-opacity`}>
                           <span className="text-xs font-bold text-slate-500">{old.home}</span><span className="text-xs font-medium text-slate-400">{old.draw}</span><span className="text-xs font-bold text-slate-500">{old.away}</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
              )}
            </div>
          ) : (<div className="py-10 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed">{dict.noOdds}</div>)}
          <p className="mt-5 text-[10px] text-center text-slate-400 italic">{dict.oddsWarning}</p>
        </div>

        {/* 순위표 */}
        {match.standings && match.standings.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold"><ListOrdered className="w-5 h-5 text-slate-500" /><span>{dict.standings}</span></div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center whitespace-nowrap">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-100">
                    <th className="py-2.5 font-medium w-10">{dict.rank}</th><th className="py-2.5 font-medium text-left">{dict.team}</th><th className="py-2.5 font-medium w-8">{dict.played}</th><th className="py-2.5 font-medium w-8">{dict.win}</th><th className="py-2.5 font-medium w-8">{dict.draw}</th><th className="py-2.5 font-medium w-8">{dict.lose}</th><th className="py-2.5 font-medium w-8">{dict.goalDiff}</th><th className="py-2.5 font-black w-10 text-[#56ad6a]">{dict.points}</th>
                  </tr>
                </thead>
                <tbody>
                  {match.standings.map((s: any) => {
                    const isTargetTeam = s.team.en === match.home.en || s.team.en === match.away.en;
                    return (
                      <tr key={s.rank} className={`border-b border-slate-50 last:border-0 ${isTargetTeam ? 'bg-slate-50/80 font-bold' : ''}`}>
                        <td className="py-3 text-slate-500">{s.rank}</td><td className={`py-3 text-left ${isTargetTeam ? 'text-slate-900' : 'text-slate-600'}`}>{s.team[lang]}</td><td className="py-3 text-slate-500">{s.played}</td><td className="py-3 text-slate-500">{s.win}</td><td className="py-3 text-slate-500">{s.draw}</td><td className="py-3 text-slate-500">{s.lose}</td><td className="py-3 text-slate-500">{s.goalDiff}</td><td className="py-3 text-[#56ad6a] font-black">{s.points}</td>
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
    if (browserLang && !browserLang.toLowerCase().includes('ko')) setLang('en');
  }, []);

  const today = startOfToday();
  const dates = Array.from({ length: 5 }, (_, i) => {
    const date = addDays(today, i - 2);
    return { date, dateStr: format(date, 'yyyy-MM-dd'), dayKo: format(date, 'M월 d일'), dayEn: format(date, 'MMM d'), labelKo: i === 2 ? '(오늘)' : '', labelEn: i === 2 ? '(today)' : '' };
  });

  const handleDateClick = (idx: number) => { setSelectedDateIdx(idx); window.history.pushState({}, '', `/?date=${dates[idx].dateStr}`); };

  const handleRefresh = async () => {
    if (isRefreshing) return; setIsRefreshing(true);
    const dateStr = dates[selectedDateIdx].dateStr;
    try {
      const res = await fetch(`/api/matches?date=${dateStr}`); const json = await res.json();
      const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr);
      setMatches(updatedMatches); setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches }));
    } catch (e) { console.error(e); } finally { setIsRefreshing(false); }
  };

  useEffect(() => {
    const dateStr = dates[selectedDateIdx].dateStr;
    const fetchData = async (isStealthMode = false) => {
      if (!isStealthMode) setIsLoading(true); 
      try {
        const res = await fetch(`/api/matches?date=${dateStr}`); const json = await res.json();
        const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr);
        setMatches(updatedMatches); setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches }));
      } catch (e) { } finally { if (!isStealthMode) setIsLoading(false); }
    };
    if (matchCache[dateStr]) setMatches(matchCache[dateStr]); else fetchData(false);

    let stealthTimer: NodeJS.Timeout;
    if (selectedDateIdx === 2) stealthTimer = setInterval(() => { fetchData(true); }, 3 * 60 * 1000); 
    return () => { if (stealthTimer) clearInterval(stealthTimer); };
  }, [selectedDateIdx]);

  useEffect(() => {
    const handlePopState = () => { setSelectedMatch(null); setSelectedPage('main'); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const goToMatch = (match: any) => { setSelectedMatch(match); window.history.pushState({}, '', `/?match=${match.id}`); };
  const goToPage = (page: string) => { setSelectedPage(page); window.history.pushState({}, '', `/?page=${page}`); };
  const goHome = () => { setSelectedMatch(null); setSelectedPage('main'); setSelectedDateIdx(2); window.history.pushState({}, '', '/'); };
  const goBackToList = () => { setSelectedMatch(null); window.history.pushState({}, '', `/?date=${dates[selectedDateIdx].dateStr}`); };

  if (selectedPage === 'about') return <About onBack={goHome} />;
  if (selectedPage === 'terms') return <Terms onBack={goHome} />;
  if (selectedPage === 'privacy') return <Privacy onBack={goHome} />;
  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={goBackToList} lang={lang} />;

  const displayedMatches = isLiveMode ? matches.filter(m => !['NS', 'FT', 'AET', 'PEN', 'CANC', 'ABD', 'PST', 'TBD', 'AWD', 'WO'].includes(m.status)) : matches;

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900 font-sans tracking-tight">
      <header className="bg-white pt-10 pb-6 flex flex-col items-center border-b border-slate-100 shadow-sm relative">
        <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={goHome}>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none"><span className="text-[#0f3460]">Scored</span><span className="text-[#84cc16]">Lab</span></h1>
          <div className="w-16 h-1.
