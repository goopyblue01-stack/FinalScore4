const fetchData = async () => {
    setLoading(true);
    try {
      const targetDate = dates[selectedDateIdx].dateStr;
      const res = await fetch(`/api/matches?date=${targetDate}`);
      const json = await res.json();

      // 무적 소스(API-Sports 구조)에 맞게 데이터 추출
      const rawMatches = json.response || [];
      
      const formatted = rawMatches.map((m: any, idx: number) => {
        return {
          id: m.fixture.id || idx,
          league: translate(m.league.name),
          home: translate(m.teams.home.name),
          away: translate(m.teams.away.name),
          score: m.fixture.status.short === 'FT' || m.fixture.status.short === '1H' || m.fixture.status.short === '2H'
                 ? `${m.goals.home} : ${m.goals.away}` 
                 : "VS",
          time: new Date(m.fixture.date).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false }),
          predict: { home: (idx % 3) + 1, away: (idx % 2) }
        };
      });

      setMatches(formatted);
    } catch (e) {
      console.error("최후 통로 연결 실패:", e);
    } finally {
      setLoading(false);
    }
  };
