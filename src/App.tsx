import React, { useState, useEffect } from 'react';

// [1. 스코어 색상 로직 함수]
const getScoreStyle = (team: 'home' | 'away', scoreHome: number, scoreAway: number) => {
  if (scoreHome > scoreAway) {
    return team === 'home' 
      ? { color: '#FF0000', fontWeight: 'bold' } 
      : { color: '#333', fontWeight: 'normal' };
  } else if (scoreAway > scoreHome) {
    return team === 'away' 
      ? { color: '#0000FF', fontWeight: 'bold' } 
      : { color: '#333', fontWeight: 'normal' };
  } else {
    return { color: '#333', fontWeight: 'normal' };
  }
};

const App = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);

  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => {
        if (data.matches) setMatches(data.matches);
      })
      .catch(err => console.error("Data Error:", err));
  }, []);

  // [상세 페이지 - 디자인 복구 버전]
  if (selectedMatch) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: '"Noto Sans KR", sans-serif' }}>
        <button 
          onClick={() => setSelectedMatch(null)} 
          style={{ marginBottom: '20px', border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: '#666' }}
        >
          ← 뒤로가기
        </button>
        
        <div style={{ background: '#fff', border: '1px solid #eee', borderRadius: '20px', padding: '40px 20px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: '#999', marginBottom: '20px' }}>{selectedMatch.league}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...getScoreStyle('home', selectedMatch.scoreHome, selectedMatch.scoreAway), fontSize: '20px' }}>{selectedMatch.home}</div>
            </div>
            
            <div style={{ flex: 1, fontSize: '40px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <span style={getScoreStyle('home', selectedMatch.scoreHome, selectedMatch.scoreAway)}>{selectedMatch.scoreHome}</span>
              <span style={{ color: '#eee' }}>:</span>
              <span style={getScoreStyle('away', selectedMatch.scoreHome, selectedMatch.scoreAway)}>{selectedMatch.scoreAway}</span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ ...getScoreStyle('away', selectedMatch.scoreHome, selectedMatch.scoreAway), fontSize: '20px' }}>{selectedMatch.away}</div>
            </div>
          </div>
        </div>

        {/* AI 확률 그래프 - 경기별 데이터 적용 */}
        <div style={{ marginTop: '50px' }}>
          <div style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '20px', fontSize: '18px' }}>AI 승패 예측 분석</div>
          <div style={{ height: '45px', display: 'flex', borderRadius: '25px', overflow: 'hidden', backgroundColor: '#f0f0f0' }}>
            <div style={{ width: `${selectedMatch.probs?.home || 33}%`, backgroundColor: '#ff4d4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
              홈 {selectedMatch.probs?.home || 33}%
            </div>
            <div style={{ width: `${selectedMatch.probs?.draw || 34}%`, backgroundColor: '#8c8c8c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
              무 {selectedMatch.probs?.draw || 34}%
            </div>
            <div style={{ width: `${selectedMatch.probs?.away || 33}%`, backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
              원정 {selectedMatch.probs?.away || 33}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // [메인 리스트 - 스크린샷 기반 디자인 복구]
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: '"Noto Sans KR", sans-serif' }}>
      <h1 style={{ textAlign: 'center', fontSize: '24px', fontWeight: '300', marginBottom: '40px', color: '#333' }}>ScoreLab</h1>
      
      {matches.map((match: any) => (
        <div 
          key={match.id} 
          onClick={() => setSelectedMatch(match)}
          style={{ background: '#fff', border: '1px solid #eee', borderRadius: '15px', padding: '25px', marginBottom: '20px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}
        >
          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '15px' }}>{match.league} | {match.korTime}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ flex: 1.5, fontSize: '18px', ...getScoreStyle('home', match.scoreHome, match.scoreAway) }}>
              {match.home}
            </div>
            
            <div style={{ flex: 1, textAlign: 'center', fontSize: '22px', fontWeight: '500' }}>
              <span style={getScoreStyle('home', match.scoreHome, match.scoreAway)}>{match.scoreHome}</span>
              <span style={{ margin: '0 10px', color: '#eee' }}>:</span>
              <span style={getScoreStyle('away', match.scoreHome, match.scoreAway)}>{match.scoreAway}</span>
            </div>
            
            <div style={{ flex: 1.5, textAlign: 'right', fontSize: '18px', ...getScoreStyle('away', match.scoreHome, match.scoreAway) }}>
              {match.away}
            </div>
          </div>
          
          <div style={{ fontSize: '12px', color: '#ccc', marginTop: '20px', textAlign: 'center' }}>
            해외 배당: {match.odds?.home || '-'} | {match.odds?.draw || '-'} | {match.odds?.away || '-'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
