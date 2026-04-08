// ... (상단 생략) ...

{matches.map((match) => {
  const { home: hExp, away: aExp } = match.predict;
  const isHomePredWin = hExp > aExp;
  const isAwayPredWin = aExp > hExp;
  const isPredDraw = hExp === aExp;

  return (
    <div key={match.id} className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 mb-6">
      {/* (리그 정보 및 실시간 점수 영역은 기존 유지) */}
      
      {/* [수정] AI 예상 스코어 디자인 */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">AI 예상 스코어</span>
        <div className="flex items-center gap-4">
          {/* 홈팀 예상: 이기거나 비기면 볼드, 지면 일반 */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            isHomePredWin || isPredDraw ? 'font-black bg-red-50 text-red-500' : 'font-normal bg-slate-50 text-slate-400'
          } ${isPredDraw ? 'text-slate-900 bg-slate-100' : ''}`}>
            {hExp}
          </div>
          
          <span className="text-slate-200 font-bold">:</span>

          {/* 원정팀 예상: 이기거나 비기면 볼드, 지면 일반 */}
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm ${
            isAwayPredWin || isPredDraw ? 'font-black bg-blue-50 text-blue-600' : 'font-normal bg-slate-50 text-slate-400'
          } ${isPredDraw ? 'text-slate-900 bg-slate-100' : ''}`}>
            {aExp}
          </div>
        </div>
      </div>

      {/* [수정] 실시간 승률 그래프 (서버 데이터와 연동) */}
      <div className="mt-6">
        <div className="flex justify-between text-[10px] font-bold mb-2 text-slate-400 px-1">
          <span>승 {match.probs.home}%</span>
          <span>무 {match.probs.draw}%</span>
          <span>패 {match.probs.away}%</span>
        </div>
        <div className="h-2 flex rounded-full overflow-hidden bg-slate-100">
          <div style={{ width: `${match.probs.home}%` }} className="bg-red-500"></div>
          <div style={{ width: `${match.probs.draw}%` }} className="bg-slate-300"></div>
          <div style={{ width: `${match.probs.away}%` }} className="bg-blue-500"></div>
        </div>
      </div>
    </div>
  );
})}
