export interface Prediction {
  score: string;
  p: number;
}

export interface WinProb {
  home: number;
  draw: number;
  away: number;
}

export interface Match {
  id: string;
  league: string;
  time: string;
  homeTeam: string;
  awayTeam: string;
  status: string;
  matchTime: string;
  score: {
    current: string;
    halfTime: string;
  };
  redCards: {
    home: number;
    away: number;
  };
  predictedScore: {
    home: number;
    away: number;
  };
  // For backward compatibility or UI convenience
  competition?: string; 
  date?: string;
}
