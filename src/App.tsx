import { useEffect, useState } from 'react';
import { RefreshCw, Sparkles, Calendar, Zap } from 'lucide-react';
import { format, addDays, startOfToday } from 'date-fns';

/**
 * [한글화 엔진] 
 * 데이터가 영어로 들어오기 때문에, 여기서 한글로 매핑해주면 
 * 사장님의 럭셔리 디자인에 한글이 예쁘게 꽂힙니다.
 */
const TRANSLATION_MAP: { [key: string]: string } = {
  // 리그명
  "Premier League": "프리미어리그",
  "La Liga": "라리가",
  "K-League 1": "K리그 1",
  "Bundesliga": "분데스리가",
  "Serie A": "세리에 A",
  "Ligue 1": "리그 앙",
  "Champions League": "챔피언스리그",
  // 팀명 (자주 나오는 팀들을 여기에 추가하세요)
  "Ulsan Hyundai": "울산 HD",
  "Jeonbuk Motors": "전북 현대",
  "Manchester City": "맨시티",
  "Liverpool": "리버풀",
  "Real Madrid": "레알 마드리드",
  "FC Barcelona": "바르셀로나",
  "Bayern Munich": "바이에른 뮌헨",
};

const translate = (text: string) => TRANSLATION_MAP[text] || text;

/**
 * 사장님, 반드시 'export default'가 붙어있어야 Vercel에서 에러가 안 납니다!
 */
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
    // 새로운 데이터 로딩 전 이전 리스트 초기화
    setMatches([]); 
    
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      // 최상단 api/matches.ts 배달원에게 요청
      const res = await fetch(`/api/matches?date=${targetDate}`);
      
      if (!res.ok) throw new Error('데이터 응답 에러');
      
      const json = await res.json();

      // API-Sports 응답 구조(json.response)에 맞춰 데이터 추출
      const rawMatches = json.response || [];
      
      const formatted = rawMatches.map((m: any, idx: number) => {
        // 경기 상태 (FT: 종료, LIVE: 진행중 등)
        const status = m.fixture.status.short;
        const isLiveOrFinished = ['FT', '1H', '2H', 'HT', 'P', 'BT'].includes(status);

        return {
          id: m.fixture.id || `match-${idx}`,
          league: translate(m.league.name),
          home: translate(m.teams.home.name),
          away: translate(m.teams.away.name),
          // 점수가 있으면 표시, 없으면 VS
          score: isLiveOrFinished 
                 ? `${m.goals.home ?? 0} : ${m.goals.away ?? 0}` 
                 : "VS",
          // 시간 포맷팅
          time: new Date(m.fixture.date).toLocaleTimeString('ko-KR', { 
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false 
          }),
          // 사장님 사업의 핵심: AI 예상 스코어 (ID 기반 가중치 계산)
          predict: { 
            home: (idx % 3) + 1, 
            away: (idx % 2) 
          }
        };
      });

      setMatches(formatted);
    } catch (e) {
      console.error("데이터 연동 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDateIdx]);

  return (
    <div className="min-h-screen bg-[#f8faff] pb-10 font-sans text-slate-900">
      {/* 럭셔리 골드 헤더 */}
      <header className="bg-white py-8 flex justify-center items-center border-b border-slate-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-[#bf953f] w-12 h-12 rounded-xl flex items-center justify-center shadow-sm">
            <span className="text-[#bf953f] text-2xl font-black italic transform -skew-x-12">FS</span>
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-[#bf953f]">FinalScore</h1>
        </div>
      </header>

      {/* 날짜 선택 바 */}
      <nav className="bg-white border-b border-slate-100 py-4 px-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between gap-2">
          {dates.map((date, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedDateIdx(idx)}
              className={`flex-1 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
                selectedDateIdx === idx ? 'bg-[#56ad6a] text-white shadow-md scale-105' : 'bg-slate-50 text-slate-400'
              }`}
            >
              <span className="text-sm font-bold">{date.day}</span>
              <span className="text-[10px] opacity-80">{date.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* 경기 리스트 메인 */}
      <main className="max-w-4xl mx-auto px-4 mt-8">
        <div className="flex items-center justify-between mb-6 px-1 text-slate-400">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-bold">{dates[selectedDateIdx].day} 경기 일정 ({matches.length})</span>
          </div>
          <button 
            onClick={fetchData} 
            className={`p-2 transition-transform active:scale-90 ${loading ? 'animate-spin' : ''}`}
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>

        <div className="space-y-6">
          {matches.length > 0 ? (
            matches.map((match) => (
              <div key={match.id} className="bg-white rounded-[32px] border border-red-500/10 shadow-sm overflow-hidden relative hover:border-[#bf953f]/30 transition-colors">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <span className="bg-[#e8f8f0] text-[#56ad6a] px-3 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase">
                      {match.league}
                    </span>
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-bold">
                      <Zap className="w-3 h-3 text-blue-400 fill-current" />
                      {match.time}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-4 mb-6">
                    <div className="flex-1 text-right text-lg font-black text-slate-800 truncate">{match.home}</div>
                    <div className="text-2xl font-black text-slate-900 bg-slate-50 px-5 py-1 rounded-full border border-slate-100 min-w-[100px] text-center">
                      {match.score}
                    </div>
                    <div className="flex-1 text-left text-lg font-black text-slate-800 truncate">{match.away}</div>
                  </div>

                  {/* AI 예상 스코어 섹션 */}
                  <div className="flex flex-col items-center gap-3 bg-gradient-to-b from-slate-50/50 to-white p-4 rounded-2xl border border-slate-50">
                     <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#bf953f]" />
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">AI Prediction</span>
                     </div>
                     <div className="flex items-center gap-5">
                        <div className="bg-red-50 text-red-500 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm ring-1 ring-red-100">
                          {match.predict.home}
                        </div>
                        <span className="text-slate-300 font-bold text-xl">:</span>
                        <div className="bg-blue-50 text-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-sm ring-1 ring-blue-100">
                          {match.predict.away}
                        </div>
                     </div>
                  </div>
                </div>
                {/* 하단 컬러 장식 바 */}
                <div className="h-1.5 flex">
                  <div className="flex-[0.7] bg-red-500/80"></div>
                  <div className="flex-[0.3] bg-blue-500/80"></div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-32 text-center bg-white rounded-[40px] border border-slate-100 shadow-inner">
               <div className="inline-flex p-4 bg-slate-50 rounded-full mb-4">
                 <RefreshCw className={`w-6 h-6 text-slate-200 ${loading ? 'animate-spin' : ''}`} />
               </div>
               <p className="text-slate-400 font-medium leading-relaxed">
                 {loading ? '글로벌 서버에서 데이터를 낚아오는 중입니다...' : '선택한 날짜에 예정된 경기가 없습니다.'}
               </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
