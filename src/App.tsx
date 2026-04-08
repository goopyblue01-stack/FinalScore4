import React, { useState, useEffect } from 'react';

// [1. 스코어 색상 로직 함수]
// 홈 승: 빨간색 볼드 / 원정 승: 파란색 볼드 / 무승부: 검정 노멀
const getScoreStyle = (team: 'home' | 'away', scoreHome: number, scoreAway: number) => {
  if (scoreHome > scoreAway) {
    return team === 'home' 
      ? { color: '#FF0000', fontWeight: 'bold' } 
      : { color: '#000000', fontWeight: 'normal' };
  } else if (scoreAway > scoreHome) {
    return team === 'away' 
      ? { color: '#0000FF', fontWeight: 'bold' } 
      : { color: '#000000', fontWeight: 'normal' };
  } else {
    return { color: '#000000', fontWeight: 'normal' };
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
      .catch(err => console.error("데이터 로딩 실패:", err));
  }, []);

  // [상세 페이지 화면]
  if (selectedMatch) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <button onClick={() => setSelectedMatch(null)} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>
          ← 뒤로가기
        </button>
        
        {/* 상단 최종 스코어 - 메인과 동일한 색상 로직 적용 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '40px 20px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedMatch.home}</div>
          </div>
          
          <div style={{ fontSize: '36px', flex: 1, textAlign: 'center', fontWeight: 'bold' }}>
            <span style={getScoreStyle('home', selectedMatch.scoreHome, selectedMatch.scoreAway)}>
              {selectedMatch.scoreHome}
            </span>
            <span style={{ margin: '0 10px', color: '#ccc' }}>:</span>
            <span style={getScoreStyle('away', selectedMatch.scoreHome, selectedMatch.scoreAway)}>
              {selectedMatch.scoreAway}
            </span>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{selectedMatch.away}</div>
          </div>
        </div>

        {/* 하단 AI 승률 그래프 - 경기별 데이터(probs) 연동 */}
        <div style={{ marginTop: '40px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '20px', textAlign: 'center' }}>AI 승패 예측 분석</h3>
          <div style={{ height: '40px', display: 'flex', borderRadius: '20px', overflow: 'hidden', backgroundColor: '#eee', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)' }}>
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

  // [메인 리스트 화면]
  return (
    <div style={{ padding: '15px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333', fontSize: '24px', marginBottom: '30px' }}>ScoreLab</h1>
      {matches.length === 0 && <div style={{ textAlign: 'center', color: '#999' }}>경기를 불러오는 중입니다...</div>}
      {matches.map((match: any) => (
        <div 
          key={match.id} 
          onClick={() => setSelectedMatch(match)}
          style={{ border: '1px solid #eee', borderRadius: '12px', padding: '20px', marginBottom: '15px', cursor: 'pointer', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px' }}>{match.league} | {match.korTime}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ ...getScoreStyle('home', match.scoreHome, match.scoreAway), fontSize: '17px', flex: 1, textAlign: 'left' }}>{match.home}</span>
            <div style={{ flex: 1, textAlign: 'center', fontSize: '20px' }}>
              <span style={getScoreStyle('home', match.scoreHome, match.scoreAway)}>{match.scoreHome}</span>
              <span style={{ margin: '0 8px', color: '#ddd' }}>:</span>
              <span style={getScoreStyle('away', match.scoreHome, match.scoreAway)}>{match.scoreAway}</span>
            </div>
            <span style={{ ...getScoreStyle('away', match.scoreHome, match.scoreAway), fontSize: '17px', flex: 1, textAlign: 'right' }}>{match.away}</span>
          </div>
          
          {/* 해외 배당 표시 */}
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '15px', textAlign: 'center', borderTop: '1px solid #fafafa', paddingTop: '10px' }}>
            해외 배당: <span style={{ color: '#666' }}>{match.odds?.home || '-'}</span> | <span style={{ color: '#666' }}>{match.odds?.draw || '-'}</span> | <span style={{ color: '#666' }}>{match.odds?.away || '-'}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
