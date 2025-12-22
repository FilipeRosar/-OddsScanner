export interface Odd {
  bookmakerName: string;
  value: number;
  selection: string; 
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  league: string;
  odds: Odd[];
}