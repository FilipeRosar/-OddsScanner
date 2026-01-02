export interface Odd {
  bookmakerName: string;
  value: number;
  selection: string;
  bookmakerUrl: string;
  affiliateUrl?: string;
  history?: { value: number; recordAt: string }[]; 
  dropPercent?: number; 
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  startTime: string;
  league: string;
  isLive: boolean;
  odds: Odd[];
  homeTeamLogo?: string; 
  awayTeamLogo?: string;
  surebetProfit?: number;
  headToHead?: {
    date: string;
    homeScore: number;
    awayScore: number;
    winner: "home" | "away" | "draw";
  }[];
  homeForm?: { result: "W" | "D" | "L"; opponent: string }[];
  awayForm?: { result: "W" | "D" | "L"; opponent: string }[];
  avgGoals: number;
  avgCorners: number;
}