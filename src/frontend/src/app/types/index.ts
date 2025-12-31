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
  surebetProfit?: number;
}