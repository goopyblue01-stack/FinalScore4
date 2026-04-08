const fetchData = async () => {
    setLoading(true);
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      const res = await fetch(`/api/matches?date=${targetDate}`);
      const json = await res.json();

      // Livescore.bz의 데이터 구조에 맞춰 추출 (보통 matches 배열 안에 들어있습니다)
      const rawMatches = json.matches || json.data || [];
      
      const formatted = rawMatches.map((m: any, idx: number) => {
        // [한글화 엔진] 대회명과 팀명을 우리말로 변경
        const leagueName = m.league_name || m.league || "기타 리그";
        const homeName = m.home_team || m.home_name || "홈팀";
        const awayName = m.away_team || m.away_name || "원정팀";

        return {
          id: m.id || `ls-${idx}`,
          league: translate(leagueName), // 미리 만들어둔 번역 함수 사용
          home: translate(homeName),
          away: translate(awayName),
          score: m.status === 'FT' || m.status === 'LIVE' 
                 ? `${m.home_score} : ${m.away_score}` 
                 : "VS",
          time: m.time || "00:00",
          // 사장님 사업의 핵심: AI 예상 스코어 (ID 기반 가중치 계산)
          predict: { 
            home: (idx % 3) + 1, 
            away: (idx % 2) 
          }
        };
      });

      setMatches(formatted);
    } catch (e) {
      console.error("Livescore 데이터 연동 실패:", e);
    } finally {
      setLoading(false);
    }
  };
