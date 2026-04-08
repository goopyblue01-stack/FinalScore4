import React, { useState, useEffect } from 'react';

// [1. 스코어 색상 로직 함수] - 메인과 상세페이지 공통 사용
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
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // 데이터 불러오기 (배당 데이터 포함된 API 호출)
  useEffect(() => {
    fetch('/api/matches')
      .then(res => res.json())
      .then(data => setMatches(data.matches));
  }, []);

  // [상세 페이지 화면]
  if (selectedMatch) {
    return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => setSelectedMatch(null)} style={{ marginBottom: '20px' }}>뒤로가기</button>
        
        {/* 상단 스코어 보드 - 요청하신 색상 로직 적용 */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa', padding: '30px', borderRadius: '15px' }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedMatch.home}</div>
          </div>
          
          <div style={{ fontSize: '32px', flex: 1, textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '10px' }}>
            <span style={getScoreStyle('home', selectedMatch.scoreHome, selectedMatch.scoreAway)}>
              {selectedMatch.scoreHome}
            </span>
            <span>:</span>
            <span style={getScoreStyle('away', selectedMatch.scoreHome, selectedMatch.scoreAway)}>
              {selectedMatch.scoreHome, selectedMatch.scoreAway}>
              {selectedMatch.scoreAway}
            </span>
          </div>

          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedMatch.away}</div>
          </div>
        </div>

        {/* 하단 AI 승률 그래프 - 경기마다 다르게 나오도록 수정 */}
        <div style={{ marginTop: '30px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px' }}>AI 승패 예측 확률</h3>
          <div style={{ height: '30px', display: 'flex', borderRadius: '15px', overflow: 'hidden', backgroundColor: '#eee' }}>
            {/* 사장님, 여기서 selectedMatch.probs 값이 API에서 제대로 넘어와야 
               경기마다 그래프가 다르게 보입니다. 
            */}
            <div style={{ width: `${selectedMatch.probs.home}%`, backgroundColor: '#ff4d4f', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              홈 {selectedMatch.probs.home}%
            </div>
            <div style={{ width: `${selectedMatch.probs.draw}%`, backgroundColor: '#8c8c8c', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              무 {selectedMatch.probs.draw}%
            </div>
            <div style={{ width: `${selectedMatch.probs.away}%`, backgroundColor: '#1890ff', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>
              원정 {selectedMatch.probs.away}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  // [메인 리스트 화면]
  return (
    <div style={{ padding: '10px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center' }}>ScoreLab 실시간 스코어</h2>
      {matches.map((match: any) => (
        <div 
          key={match.id} 
          onClick={() => setSelectedMatch(match)}
          style={{ borderBottom: '1px solid #eee', padding: '15px', cursor: 'pointer' }}
        >
          <div style={{ fontSize: '12px', color: '#888' }}>{match.league} | {match.korTime}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}>
            <span style={getScoreStyle('home', match.scoreHome, match.scoreAway)}>{match.home}</span>
            <span>
              <b style={getScoreStyle('home', match.scoreHome, match.scoreAway)}>{match.scoreHome}</b>
              {" : "}
              <b style={getScoreStyle('away', match.scoreHome, match.scoreAway)}>{match.scoreAway}</b>
            </span>
            <span style={getScoreStyle('away', match.scoreHome, match.scoreAway)}>{match.away}</span>
          </div>
          {/* 해외 배당 표시 부분 */}
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '5px', textAlign: 'right' }}>
            배당: {match.odds?.home || '-'} | {match.odds?.draw || '-'} | {match.odds?.away || '-'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;
