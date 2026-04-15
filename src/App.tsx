import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, TrendingUp, Info, ChevronUp, ChevronDown, Activity, ListOrdered, Star, X, RefreshCw, Circle, Globe, Users, LayoutList, History, BarChart3, BookOpen } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';

declare global { interface Window { gtag?: (...args: any[]) => void; } }

const PROTO_LEAGUES = [
  39, 40, 45, 48, 140, 143, 78, 79, 81, 135, 137, 61, 66, 88, 94, 179, 
  292, 293, 98, 253, 188, 2, 3, 848, 15, 4, 1, 9, 10
];

// 🔥 [위장술용 칼럼 데이터 스토리지 - 오직 데이터 기반 프리뷰 8편]
const COLUMNS_DATA = [
  {
    id: 1,
    date: "2026-04-16",
    title: "[UEL 프리뷰] 셀타 비고 vs 프라이부르크: 피로도 가중치가 가리키는 방향",
    excerpt: "💡 한줄평: 지친 원정팀, 홈 극강의 데이터를 넘을까.\n\n4월 17일 펼쳐지는 유로파리그 8강전. ScoredLab 엔진의 '휴식일 피로도' 지표가 승부의 핵심 변수로 떠올랐습니다.",
    content: `셀타 비고와 프라이부르크의 유로파리그 8강전은 우리 예측 엔진의 핵심인 '휴식일 기반 피로도(Rest Days & Fatigue)' 로직이 가장 강하게 적용되는 매치업입니다.

1. 피로도 및 전력 데이터 분석
원정팀 프라이부르크는 최근 자국 리그 일정 소화 후 단 3일만을 쉬고 스페인 원정에 나섭니다. ScoredLab 엔진은 4일 이하 휴식 시 원정 이동 피로도를 더해 수비력 지표를 15% 하향 조정합니다. 반면 홈팀 셀타 비고는 충분한 휴식을 취하며 폼(Form) 가중치에서 5%의 어드밴티지를 확보했습니다.

2. 세부 스탯 및 배당 흐름
셀타 비고는 홈에서 '박스 안 슈팅(Shots inside box)' 비율이 원정 대비 20% 이상 상승하는 데이터를 보여줍니다. 이를 반영하듯 셀타 비고의 홈 승리 배당은 초기 2.20에서 현재 1.95 선까지 뚜렷한 하락세(🔻)를 보이고 있습니다.

3. 최종 예상 스코어
포아송 분포 모델에 피로도 페널티를 적용한 결과, 2:1 셀타 비고의 승리 확률이 1순위로 도출되었습니다.`
  },
  {
    id: 2,
    date: "2026-04-16",
    title: "[UEL 프리뷰] 애스턴 빌라 vs 볼로냐: 압도적 화력 데이터의 증명",
    excerpt: "💡 한줄평: 데이터가 증명하는 홈팀의 막강한 창.\n\n유효 슈팅 전환율에서 압도적인 수치를 보이는 홈팀과 단단한 원정팀의 대결. 데이터는 어느 쪽을 향할까요?",
    content: `애스턴 빌라와 볼로냐의 경기는 공격 지표와 수비 지표의 팽팽한 충돌이 예상됩니다.

1. 슈팅 효율성 데이터 분석
ScoredLab의 최근 5경기 스탯에 따르면, 애스턴 빌라는 전체 슈팅 대비 '유효 슈팅(Shots on Goal)' 전환율이 출전 팀 중 최상위권에 랭크되어 있습니다. 볼로냐 역시 상대의 '막힌 슈팅(Blocked Shots)'을 유도하는 수비 지표가 높지만, 홈팀의 파상공세를 90분 내내 제어하기는 수치상으로 쉽지 않습니다.

2. 배당 흐름 및 예상 스코어
해외 오즈메이커들은 애스턴 빌라의 승리 배당을 1.85에 고정하며 홈팀의 우세를 점치고 있습니다. 배당 변동의 폭이 크지 않다는 것은 데이터의 신뢰도가 높다는 의미입니다. 예측 엔진의 계산 결과, 애스턴 빌라의 2:0 무실점 승리가 가장 유력한 결과로 산출되었습니다.`
  },
  {
    id: 3,
    date: "2026-04-16",
    title: "[UEL 프리뷰] 레알 베티스 vs 브라가: 점유율 60%의 마법",
    excerpt: "💡 한줄평: 점유율의 우위, 스코어로 직결될 것인가.\n\n홈 경기 시 압도적인 점유율을 가져가는 베티스. 데이터로 분석한 브라가와의 맞대결 전망입니다.",
    content: `레알 베티스와 브라가의 8강전은 볼 점유율과 패스 네트워크 데이터가 승부를 가를 전망입니다.

1. 볼 점유율 및 패스 스탯 분석
레알 베티스는 홈 경기 시 평균 60% 이상의 '볼 점유율(Ball Possession)'과 88%의 '패스 성공률(Passes accurate)'을 기록하며 상대를 통제하는 데 능숙합니다. 브라가는 라인을 내린 후 역습을 노리겠지만, ScoredLab 데이터상 브라가의 원정 '피파울(Fouls drawn)' 수치가 높아 세트피스 위기를 스스로 초래할 가능성이 있습니다.

2. 배당 흐름 및 예상 스코어
홈팀 베티스의 승리 배당은 1.90 선에서 점진적인 하락(🔻) 추세에 있습니다. 점유율 우위를 바탕으로 한 공격 기회 창출이 배당에 반영된 결과입니다. ScoredLab 엔진은 베티스의 2:1 승리 확률을 가장 높게 보고 있습니다.`
  },
  {
    id: 4,
    date: "2026-04-16",
    title: "[UEL 프리뷰] 노팅엄 포레스트 vs FC 포르투: 기대 득점(xG)의 역설",
    excerpt: "💡 한줄평: 점유율 열세 속 빛나는 역습 데이터.\n\n수치상 우위를 점하는 원정팀과 역습 데이터에 특화된 홈팀. 팽팽한 흐름이 예상되는 경기입니다.",
    content: `노팅엄 포레스트와 FC 포르투의 경기는 객관적 전력 지표와 실제 폼 데이터가 엇갈리는 흥미로운 매치업입니다.

1. 데이터의 역설
ScoredLab의 폼(Form) 엔진 분석 결과, 포르투는 '총 패스(Total passes)'와 공격 지표에서 노팅엄을 크게 앞섭니다. 하지만 노팅엄은 점유율이 40% 미만일 때 오히려 '기대 득점(xG)' 효율이 상승하는 특이한 데이터 패턴을 보입니다. 철저한 선수비 후 빠른 역습 전술이 수치로 증명되는 대목입니다.

2. 배당 흐름 및 예상 스코어
포르투가 원정임에도 2.30 내외의 정배당을 받고 있으나, 무승부 배당 역시 빠른 속도로 동반 하락하고 있습니다. 예측 엔진은 원정팀의 고전을 예상하며 1:1 무승부를 1순위 시나리오로 제시합니다.`
  },
  {
    id: 5,
    date: "2026-04-16",
    title: "[UECL 프리뷰] AZ 알크마르 vs 샤흐타르: 코너킥 스탯이 암시하는 난타전",
    excerpt: "💡 한줄평: 압도적 공격 스탯, 다득점을 예고하다.\n\n공격 지표가 폭발하는 홈팀과 이를 방어해야 하는 원정팀. 화끈한 득점전이 데이터로 나타납니다.",
    content: `AZ 알크마르와 샤흐타르 도네츠크의 경기는 양 팀의 공격 스탯이 강하게 부딪히는 양상이 될 것입니다.

1. 공격 특화 스탯 분석
AZ 알크마르는 이번 대회 홈 경기에서 타 팀을 압도하는 '코너킥(Corner Kicks)' 및 '박스 안 슈팅' 횟수를 기록 중입니다. 이는 상대 진영에서 머무는 시간이 압도적으로 길다는 것을 데이터로 보여줍니다. 샤흐타르 역시 최근 원정 경기에서 득점 폼 수치가 일정하게 유지되고 있어 양 팀 모두 득점할 확률이 높습니다.

2. 배당 흐름 및 예상 스코어
홈팀의 우세 데이터가 쌓이며 알크마르의 승리 배당이 2.20에서 2.05까지 하락(🔻)했습니다. ScoredLab의 포아송 계산기는 양 팀의 공격 가중치를 반영하여 알크마르의 3:1 또는 2:1 다득점 승리를 예측합니다.`
  },
  {
    id: 6,
    date: "2026-04-16",
    title: "[UECL 프리뷰] AEK 아테네 vs 라요 바예카노: 원정 피로도와 저득점 확률",
    excerpt: "💡 한줄평: 극심한 원정 피로도, 언더(저득점)를 가리키다.\n\n장거리 원정과 짧은 휴식. ScoredLab 엔진의 피로도 페널티가 득점력 빈곤으로 이어질 확률을 분석합니다.",
    content: `AEK 아테네와 라요 바예카노의 경기는 철저하게 '피로도'와 '수비 스탯'이 지배할 경기입니다.

1. 원정 페널티와 수비 스탯
라요 바예카노는 4일 이하의 짧은 휴식 후 그리스 원정에 나섭니다. ScoredLab의 피로도 알고리즘은 이를 공격력 10% 하락 변수로 인식합니다. 설상가상으로 홈팀 아테네는 최근 5경기에서 상대의 '유효 슈팅'을 최소화하는 강력한 수비 조직력 데이터를 보여주고 있습니다.

2. 배당 흐름 및 예상 스코어
득점이 많이 나오지 않을 것이라는 데이터가 모이면서 팽팽했던 승리 배당은 아테네 쪽의 약우세로 서서히 이동하고 있습니다. 예측 엔진은 피로도 변수를 100% 반영하여 1:0 아테네의 신승 또는 1:1 무승부라는 저득점 결과를 내놓았습니다.`
  },
  {
    id: 7,
    date: "2026-04-16",
    title: "[UECL 프리뷰] 피오렌티나 vs 크리스탈 팰리스: 파울 스탯과 세트피스의 상관관계",
    excerpt: "💡 한줄평: 정교한 패스 데이터 vs 거친 파울 스탯.\n\n높은 패스 성공률을 기록하는 피오렌티나와 파울로 이를 저지하려는 팰리스의 상성을 데이터로 확인합니다.",
    content: `피오렌티나와 크리스탈 팰리스의 매치업은 상반된 두 데이터 지표의 대결입니다.

1. 패스 스탯과 파울 스탯의 충돌
피오렌티나는 높은 '패스 성공률'을 바탕으로 파이널 서드 진입 횟수가 월등히 높습니다. 크리스탈 팰리스는 이를 저지하기 위해 '파울(Fouls)' 수치가 필연적으로 상승할 수밖에 없습니다. ScoredLab 데이터 분석에 따르면 팰리스의 잦은 파울은 피오렌티나에게 치명적인 위험 지역 세트피스 기회를 다수 제공할 확률이 큽니다.

2. 배당 흐름 및 예상 스코어
데이터의 우위가 배당률에 그대로 반영되어 피오렌티나의 승리 배당은 1.80대 정배당으로 굳어지고 있습니다. 팰리스가 체력적으로 버티더라도 후반 막판 집중력 저하가 예상되며, 엔진은 피오렌티나의 2:0 완승을 지목하고 있습니다.`
  },
  {
    id: 8,
    date: "2026-04-16",
    title: "[UECL 프리뷰] 스트라스부르 vs 마인츠: 완벽한 밸런스가 만드는 무승부 확률",
    excerpt: "💡 한줄평: 엇비슷한 폼 데이터, 승부의 균형을 유지하다.\n\n공수 지표에서 완벽에 가까운 밸런스를 보이는 두 팀. 데이터 엔진이 가장 고민하는 예측 매치입니다.",
    content: `스트라스부르와 마인츠의 경기는 ScoredLab의 모든 폼(Form) 데이터 지표가 가장 근사치로 겹치는 박빙의 승부입니다.

1. 폼(Form) 가중치 분석
두 팀 모두 최근 5경기에서 득점 및 실점 데이터가 거의 동일합니다. 특히 양 팀 모두 공격 진영에서의 '오프사이드(Offsides)' 발생 횟수와 수비 시 '골키퍼 선방(Saves)' 스탯까지 유사한 패턴을 보이고 있어, 한쪽으로 뚜렷하게 기울어지는 지표를 찾기 어렵습니다. 

2. 배당 흐름 및 예상 스코어
완벽한 데이터 밸런스는 배당 시장에도 반영되었습니다. 양 팀 승리 배당은 2.50 대 2.80 수준으로 팽팽하며, 무승부 배당만이 점진적인 하락(🔻) 추세에 있습니다. 포아송 확률 계산기 역시 양 팀이 1골씩 주고받는 1:1 무승부를 최우선 확률로 도출해냈습니다.`
  }
];

const t = {
  ko: {
    liveMatches: "현재 진행 중인 라이브 경기가 없습니다.", noMatches: "이 날짜에는 예정된 경기가 없습니다.",
    apiLimit: "(만약 일정이 있는데 안 보인다면 일일 데이터 한도를 모두 소진한 것입니다. 내일 아침에 다시 시도해주세요!)",
    expectedScore: "예상 스코어", matchEvents: "주요 이벤트", topPredictions: "예상 스코어 순위 (Top 5)",
    oddsInfo: "해외 배당 정보", standings: "순위표", rank: "순위", team: "팀명", played: "경기",
    win: "승", draw: "무", lose: "패", goalDiff: "득실", points: "승점", winShort: "승", drawShort: "무", loseShort: "패",
    noOdds: "이 경기는 현재 해외 배당 준비 중입니다.", oddsWarning: "\"본 데이터는 해외 배당 정보이며, 베팅을 권하지 않습니다.\"",
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
    statOffsides: "오프사이드", statSaves: "골키퍼 선방", statFouls: "파울", statCorners: "코너킥", statYellows: "경고", statReds: "퇴장",
    columnTitle: "분석 칼럼", columnBack: "목록으로"
  },
  en: {
    liveMatches: "No live matches at the moment.", noMatches: "No matches scheduled for this date.",
    apiLimit: "(If matches are expected but not showing, the daily data limit has been reached. Please try again tomorrow!)",
    expectedScore: "Expected Score", matchEvents: "Match Events", topPredictions: "Top 5 Predictions",
    oddsInfo: "Match Odds", standings: "Standings", rank: "Rank", team: "Team", played: "P",
    win: "W", draw: "D", lose: "L", goalDiff: "GD", points: "Pts", winShort: "W", drawShort: "D", loseShort: "L",
    noOdds: "Odds are currently unavailable for this match.", oddsWarning: "\"This data is for informational purposes only. We do not encourage betting.\"",
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
    statOffsides: "Offsides", statSaves: "Goalkeeper Saves", statFouls: "Fouls", statCorners: "Corners", statYellows: "Yellow Cards", statReds: "Red Cards",
    columnTitle: "Analysis", columnBack: "Back to list"
  }
};

const processMatchesWithTrends = (fetchedMatches: any[], dateStr: string) => {
  const storageKey = `scoredLab_oddsHistory_${dateStr}`;
  const storedData = localStorage.getItem(storageKey);
  let oldHistoryMap: { [id: number]: any[] } = {};
  if (storedData) { 
    try { 
      oldHistoryMap = JSON.parse(storedData); 
    } catch (e) {} 
  }

  const updatedMatches = fetchedMatches.map(newMatch => {
    let history = oldHistoryMap[newMatch.id] || [];
    if (newMatch.odds && newMatch.odds.home && newMatch.odds.draw && newMatch.odds.away) {
      const latest = history.length > 0 ? history[0] : null;
      const isChanged = !latest || latest.home !== newMatch.odds.home || latest.draw !== newMatch.odds.draw || latest.away !== newMatch.odds.away;
      if (isChanged) { 
        history = [newMatch.odds, ...history].slice(0, 5); 
      }
    }
    oldHistoryMap[newMatch.id] = history;
    return { ...newMatch, oddsHistory: history };
  });

  localStorage.setItem(storageKey, JSON.stringify(oldHistoryMap));
  return updatedMatches;
};

// 🔥 줄다리기 그래프 바 컴포넌트
const StatBar = ({ label, home, away }: { label: string, home: number, away: number }) => {
  if (home === undefined || away === undefined) return null;
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

// 🔥 [신규 컴포넌트] 칼럼 상세 보기 화면
function ColumnDetail({ column, onBack, lang }: { column: any, onBack: () => void, lang: 'ko' | 'en' }) {
  const dict = t[lang];
  useEffect(() => { window.scrollTo(0, 0); }, []);
  
  return (
    <div className="min-h-screen bg-[#f8faff] pb-10">
      <header className="bg-white py-6 flex items-center px-4 border-b border-slate-100 sticky top-0 z-30 shadow-sm">
        <button onClick={onBack} className="p-2 hover:bg-slate-50 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600" />
        </button>
        <h2 className="flex-1 text-center font-black text-slate-800 pr-10 text-sm">{dict.columnTitle}</h2>
      </header>
      
      <main className="max-w-2xl mx-auto px-6 mt-10">
        <p className="text-[#56ad6a] font-bold text-xs mb-3">{column.date}</p>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight mb-8 break-keep">
          {column.title}
        </h1>
        <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
          {column.content}
        </div>
        <button onClick={onBack} className="mt-12 w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg">
          {dict.columnBack}
        </button>
      </main>
    </div>
  );
}

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

  const history = match.oddsHistory || (match.odds ? [match.odds] : []);
  let hProps, dProps, aProps;

  if (history.length > 0) {
    const latest = history[0]; 
    const past = history.length > 1 ? history[1] : null;
    const styleMap: Record<string, any> = {
      red: { bg: 'bg-red-50 border-red-100', label: 'text-red-400', text: 'text-red-600' },
      blue: { bg: 'bg-blue-50 border-blue-100', label: 'text-blue-400', text: 'text-blue-600' },
      gray: { bg: 'bg-slate-50 border-slate-100', label: 'text-slate-400', text: 'text-slate-800' }
    };
    const getProps = (type: 'home' | 'draw' | 'away') => {
        let color = 'gray'; let icon = null;
        const currVal = parseFloat(latest[type]); 
        const pastVal = past ? parseFloat(past[type]) : null;
        
        if (pastVal !== null && currVal !== pastVal) {
            if (currVal < pastVal) { color = 'red'; icon = 'down'; } 
            else { color = 'blue'; icon = 'up'; }
        } else if (type === 'home' || type === 'away') {
            const h = parseFloat(latest.home); const a = parseFloat(latest.away);
            if (type === 'home' && h < a) color = 'red'; 
            if (type === 'home' && h > a) color = 'blue';
            if (type === 'away' && a < h) color = 'red'; 
            if (type === 'away' && a > h) color = 'blue';
        }
        return { ...styleMap[color], icon, val: latest[type] };
    };
    hProps = getProps('home'); 
    dProps = getProps('draw'); 
    aProps = getProps('away');
  }

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
          <div className="text-center text-sm font-bold text-slate-500 mb-2">{match.time[lang]}</div>
          <div className="flex items-center justify-between gap-2 pt-6">
            <div className={`flex-1 text-right text-base md:text-xl truncate ${homeNameClass}`}>{match.home[lang]}</div>
            <div className="relative flex items-center justify-center min-w-[80px]">
              {match.status !== 'NS' && <span className="absolute -top-7 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>}
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

        {/* 경기 통계 영역 */}
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

        {/* 주요 이벤트 */}
        {match.status !== 'NS' && match.events && match.events.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-[#0f3460] font-bold">
              <Activity className="w-5 h-5" /><span>{dict.matchEvents}</span>
            </div>
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

        {/* 예상 스코어 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#56ad6a] font-bold">
            <TrendingUp className="w-5 h-5" /><span>{dict.topPredictions}</span>
          </div>
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
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isRank1 ? 'bg-[#56ad6a] text-white' : 'bg-slate-200 text-slate-500'}`}>
                      {p.rank}{lang === 'ko' ? '위' : ''}
                    </span>
                    <div className="flex items-center gap-2 text-base">
                      <span className={style.h}>{p.h}</span>
                      <span className={isRank1 ? 'text-slate-600' : 'text-slate-400'}>:</span>
                      <span className={style.a}>{p.a}</span>
                    </div>
                  </div>
                  <span className={`font-bold text-[10px] ${isRank1 ? 'text-[#56ad6a]' : 'text-slate-400'}`}>{p.prob}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-5 text-[10px] text-slate-400 text-center italic leading-relaxed break-keep">{dict.predictionDisclaimer}</p>
        </div>

        {/* 해외 배당 */}
        <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
          <div className="flex items-center gap-2 mb-6 text-[#bf953f] font-bold">
            <Info className="w-5 h-5" /><span>{dict.oddsInfo}</span>
          </div>
          {history.length > 0 && hProps && dProps && aProps ? (
            <div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${hProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${hProps.label}`}>{dict.winShort}</span>
                  <div className="flex items-center gap-1">
                    {hProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${hProps.text}`} strokeWidth={3}/>}
                    {hProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${hProps.text}`} strokeWidth={3}/>}
                    <span className={`text-lg font-black ${hProps.text}`}>{hProps.val}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${dProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${dProps.label}`}>{dict.drawShort}</span>
                  <div className="flex items-center gap-1">
                    {dProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${dProps.text}`} strokeWidth={3}/>}
                    {dProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${dProps.text}`} strokeWidth={3}/>}
                    <span className={`text-lg font-black ${dProps.text}`}>{dProps.val}</span>
                  </div>
                </div>
                <div className={`flex flex-col items-center p-4 rounded-2xl border ${aProps.bg}`}>
                  <span className={`text-[10px] font-bold mb-1 ${aProps.label}`}>{dict.loseShort}</span>
                  <div className="flex items-center gap-1">
                    {aProps.icon === 'down' && <ChevronDown className={`w-4 h-4 ${aProps.text}`} strokeWidth={3}/>}
                    {aProps.icon === 'up' && <ChevronUp className={`w-4 h-4 ${aProps.text}`} strokeWidth={3}/>}
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
                           <span className="text-xs font-bold text-slate-500">{old.home}</span>
                           <span className="text-xs font-medium text-slate-400">{old.draw}</span>
                           <span className="text-xs font-bold text-slate-500">{old.away}</span>
                         </div>
                       );
                     })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-400 text-xs italic bg-slate-50 rounded-2xl border border-dashed">{dict.noOdds}</div>
          )}
          <p className="mt-5 text-[10px] text-center text-slate-400 italic">{dict.oddsWarning}</p>
        </div>

        {/* 순위표 */}
        {match.standings && match.standings.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-5 text-slate-800 font-bold">
              <ListOrdered className="w-5 h-5 text-slate-500" /><span>{dict.standings}</span>
            </div>
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
  
  // 🔥 페이지 상태 관리를 위한 state (메인, 칼럼 목록, 소개 등)
  const [selectedPage, setSelectedPage] = useState<string>('main'); 
  const [selectedCol, setSelectedCol] = useState<any | null>(null);

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
    window.history.pushState({}, '', `/?date=${dates[idx].dateStr}`); 
  };

  const handleRefresh = async () => {
    if (isRefreshing) return; 
    setIsRefreshing(true); 
    const dateStr = dates[selectedDateIdx].dateStr;
    try { 
      const res = await fetch(`/api/matches?date=${dateStr}`); 
      const json = await res.json(); 
      const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr); 
      setMatches(updatedMatches); 
      setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches })); 
    } catch (e) { 
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
        const updatedMatches = processMatchesWithTrends(json.matches || [], dateStr); 
        setMatches(updatedMatches); 
        setMatchCache(prev => ({ ...prev, [dateStr]: updatedMatches })); 
      } catch (e) { 
      } finally { 
        if (!isStealthMode) setIsLoading(false); 
      }
    };

    if (matchCache[dateStr]) setMatches(matchCache[dateStr]); 
    else fetchData(false);

    let stealthTimer: NodeJS.Timeout; 
    if (selectedDateIdx === 2) {
      stealthTimer = setInterval(() => { fetchData(true); }, 3 * 60 * 1000); 
    }
    return () => { if (stealthTimer) clearInterval(stealthTimer); };
  }, [selectedDateIdx]);

  useEffect(() => { 
    const handlePopState = () => { 
      setSelectedMatch(null); 
      setSelectedPage('main'); 
      setSelectedCol(null);
    }; 
    window.addEventListener('popstate', handlePopState); 
    return () => window.removeEventListener('popstate', handlePopState); 
  }, []);

  const goToMatch = (match: any) => { 
    setSelectedMatch(match); 
    window.history.pushState({}, '', `/?match=${match.id}`); 
  };
  
  const goHome = () => { 
    setSelectedMatch(null); 
    setSelectedPage('main'); 
    setSelectedCol(null); 
    setSelectedDateIdx(2); 
    window.history.pushState({}, '', '/'); 
  };
  
  const goBackToList = () => { 
    setSelectedMatch(null); 
    window.history.pushState({}, '', `/?date=${dates[selectedDateIdx].dateStr}`); 
  };

  if (selectedPage === 'about') return <About onBack={goHome} />; 
  if (selectedPage === 'terms') return <Terms onBack={goHome} />; 
  if (selectedPage === 'privacy') return <Privacy onBack={goHome} />;
  
  if (selectedMatch) return <MatchDetail match={selectedMatch} onBack={goBackToList} lang={lang} />;
  if (selectedCol) return <ColumnDetail column={selectedCol} onBack={() => setSelectedCol(null)} lang={lang} />;

  const displayedMatches = isLiveMode ? matches.filter(m => !['NS', 'FT', 'AET', 'PEN', 'CANC', 'ABD', 'PST', 'TBD', 'AWD', 'WO'].includes(m.status)) : matches;

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 text-slate-900 font-sans tracking-tight">
      <header className="bg-white pt-10 pb-6 flex flex-col items-center border-b border-slate-100 shadow-sm relative">
        <div className="flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity" onClick={goHome}>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter italic leading-none">
            <span className="text-[#0f3460]">Scored</span>
            <span className="text-[#84cc16]">Lab</span>
          </h1>
          <div className="w-16 h-1.5 mt-2 rounded-full" style={{ background: 'linear-gradient(to right, #0f3460, #84cc16)' }}></div>
        </div>
        <div className="w-full max-w-4xl px-4 mt-8 grid grid-cols-5 gap-1.5 md:gap-2 items-center">
          <button onClick={() => setIsLiveMode(!isLiveMode)} className={`h-11 flex flex-row items-center justify-center gap-1.5 rounded-xl font-black text-xs md:text-sm transition-all shadow-sm border ${isLiveMode ? 'bg-[#56ad6a] border-[#56ad6a] text-white shadow-md shadow-green-500/20' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}>
            <Circle className={`w-3 h-3 md:w-3.5 md:h-3.5 ${isLiveMode ? 'fill-white text-white' : 'fill-slate-300 text-slate-300'}`} />LIVE
          </button>
          <button onClick={() => setIsListView(!isListView)} className={`h-11 flex flex-row items-center justify-center gap-1.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm border ${isListView ? 'bg-slate-800 border-slate-800 text-white shadow-md shadow-slate-500/20' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}>
            <LayoutList className={`w-4 h-4 ${isListView ? 'text-white' : 'text-slate-500'}`} />{isListView ? 'CARD' : 'LIST'}
          </button>
          
          {/* 🔥 새로 추가된 [칼럼] 버튼 */}
          <button onClick={() => setSelectedPage('columns')} className="h-11 flex flex-row items-center justify-center gap-1.5 rounded-xl font-bold text-xs md:text-sm transition-all shadow-sm border bg-white border-slate-100 text-slate-600 hover:bg-slate-50">
            <BookOpen className="w-4 h-4 text-[#9d4edd]" />COLUMN
          </button>
          
          <button onClick={() => setLang(lang === 'ko' ? 'en' : 'ko')} className="h-11 flex items-center justify-center gap-1.5 rounded-xl bg-white border border-slate-100 transition-all shadow-sm hover:bg-slate-50 font-bold text-xs text-slate-600">
            <Globe className="w-4 h-4 text-[#0f3460]" />{lang === 'ko' ? 'ENG' : 'KOR'}
          </button>
          <button onClick={handleRefresh} className={`h-11 flex items-center justify-center rounded-xl bg-white border border-slate-100 transition-all shadow-sm hover:bg-slate-50 ${isRefreshing ? 'opacity-70 scale-95' : 'active:scale-95'}`}>
            <RefreshCw className={`w-5 h-5 text-[#56ad6a] ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* 🔥 페이지 렌더링 로직 분기: 칼럼 페이지 vs 메인 페이지 */}
      {selectedPage === 'columns' ? (
        <main className="max-w-4xl mx-auto px-4 mt-10">
          <h2 className="text-2xl font-black text-slate-800 mb-8 px-2 flex items-center gap-2">
            <BookOpen className="text-[#9d4edd] w-7 h-7"/> {dict.columnTitle}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {COLUMNS_DATA.map(col => (
              <div 
                key={col.id} 
                onClick={() => setSelectedCol(col)} 
                className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm cursor-pointer hover:scale-[1.02] transition-transform duration-300"
              >
                <p className="text-[#56ad6a] font-bold text-[10px] mb-2">{col.date}</p>
                <h3 className="text-lg md:text-xl font-black text-slate-800 mb-3 break-keep leading-tight">{col.title}</h3>
                <p className="text-slate-500 text-sm line-clamp-3 leading-relaxed">{col.excerpt}</p>
              </div>
            ))}
          </div>
        </main>
      ) : (
        <>
          <nav className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-20 shadow-sm">
            <div className="max-w-4xl mx-auto flex justify-between gap-2">
              {dates.map((date, idx) => (
                 <button key={idx} onClick={() => handleDateClick(idx)} className={`flex-1 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                   <span className="text-sm font-bold">{lang === 'ko' ? date.dayKo : date.dayEn}</span>
                   <span className="text-[9px]">{lang === 'ko' ? date.labelKo : date.labelEn}</span>
                 </button>
              ))}
            </div>
          </nav>

          <main className="max-w-4xl mx-auto px-4 mt-6">
            {isListView && !isLoading && displayedMatches.length > 0 && <div className="bg-slate-800 text-white text-xs font-bold text-center py-3 rounded-2xl mb-4 shadow-sm animate-in fade-in">💡 {dict.listDisclaimer}</div>}
            
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
                  </div>
                ))}
              </div>
            ) : displayedMatches.length === 0 ? (
              <div className="py-16 text-center bg-white rounded-[24px] border border-slate-100 shadow-sm">
                <div className="text-4xl mb-3">⚽</div>
                <div className="text-slate-500 font-bold">{isLiveMode ? dict.liveMatches : dict.noMatches}</div>
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
                      <div key={match.id} onClick={() => goToMatch(match)} className={`flex items-center justify-between p-3 mb-2 rounded-2xl border shadow-sm cursor-pointer transition-all hover:scale-[1.01] ${isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'}`}>
                        <div className="w-14 md:w-20 shrink-0 flex flex-col justify-center pr-2 border-r border-slate-100">
                           {PROTO_LEAGUES.includes(match.leagueId) && <span className="bg-[#0f3460] text-white text-[7px] font-black px-1 py-0.5 rounded-sm w-max tracking-wider mb-1 shadow-sm">PROTO</span>}
                           <span className={`text-[9px] font-black uppercase truncate ${isLive ? 'text-rose-500' : 'text-[#56ad6a]'}`}>{match.league[lang]}</span>
                        </div>
                        <div className="flex flex-1 items-center justify-center gap-3 md:gap-6 px-2 md:px-4 overflow-hidden">
                           <div className={`flex-1 text-right text-xs md:text-sm truncate ${homeListNameClass}`}>{match.home[lang]}</div>
                           <div className="shrink-0 flex items-center gap-2 md:gap-3 text-base md:text-lg">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${homePredBoxClass}`}>{hExp}</div>
                              <span className="text-slate-300 font-bold text-xs md:text-sm">:</span>
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-colors duration-300 ${awayPredBoxClass}`}>{aExp}</div>
                           </div>
                           <div className={`flex-1 text-left text-xs md:text-sm truncate ${awayListNameClass}`}>{match.away[lang]}</div>
                        </div>
                        <div className="w-12 md:w-16 shrink-0 flex flex-col items-end pl-2 border-l border-slate-100">
                           {match.status !== 'NS' ? <span className="text-[10px] font-black text-orange-500">{centerStatus}</span> : <span className="text-[10px] font-bold text-slate-400">{match.time[lang].split(' ').pop()}</span>}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={match.id} onClick={() => goToMatch(match)} className={`rounded-[24px] border shadow-sm overflow-hidden relative cursor-pointer transition-all hover:scale-[1.005] duration-300 ${isLive ? 'bg-rose-50/40 border-rose-100' : 'bg-white border-slate-100'}`}>
                      <div className="p-3 md:p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-1.5">
                            {PROTO_LEAGUES.includes(match.leagueId) && <span className="bg-[#0f3460] text-white text-[8px] font-black px-1.5 py-0.5 rounded flex items-center justify-center tracking-wider shadow-sm">PROTO</span>}
                            <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${isLive ? 'bg-rose-100/50 text-rose-500' : 'bg-[#e8f8f0] text-[#56ad6a]'}`}>{match.league[lang]}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-700">{match.time[lang]}</span>
                        </div>
                        <div className="flex items-center justify-center gap-3 mb-3 pt-4">
                          <div className={`flex-1 text-right text-sm md:text-base truncate ${homeListNameClass}`}>{match.home[lang]}</div>
                          <div className="relative flex items-center justify-center min-w-[80px]">
                              {match.status !== 'NS' && <span className="absolute -top-6 text-orange-400 font-medium text-sm tracking-wide">{centerStatus}</span>}
                              <div className="flex items-center gap-2 text-xl">
                                {match.status === 'NS' ? <span className="text-slate-300 text-sm font-bold mt-1">VS</span> : 
                                <>
                                  <span className={homeListScoreClass}>{match.scoreHome}{match.penHome !== null && <span className="text-xs ml-1 text-orange-500">({match.penHome})</span>}</span>
                                  <span className="text-slate-300 text-sm font-bold lowercase">vs</span>
                                  <span className={awayListScoreClass}>{match.penAway !== null && <span className="text-xs mr-1 text-orange-500">({match.penAway})</span>}{match.scoreAway}</span>
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
        </>
      )}

      <footer className="mt-12 py-8 text-center flex flex-col items-center justify-center gap-3">
        <div className="flex gap-4 text-xs text-slate-400 font-medium">
          <button onClick={() => setSelectedPage('about')} className="hover:text-slate-600 transition-colors">{dict.about}</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => setSelectedPage('terms')} className="hover:text-slate-600 transition-colors">{dict.terms}</button>
          <span className="text-slate-200">|</span>
          <button onClick={() => setSelectedPage('privacy')} className="hover:text-slate-600 transition-colors">{dict.privacy}</button>
        </div>
        <p className="text-[10px] text-slate-300">© {new Date().getFullYear()} ScoredLab. All rights reserved.</p>
      </footer>
    </div>
  );
}
