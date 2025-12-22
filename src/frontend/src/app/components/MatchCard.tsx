import { Match, Odd } from "@/app/types/index";
import { Home, ArrowRight, Clock, Zap, Trophy, Shield } from "lucide-react";
import { getTeamLogoUrl } from "@/utils/teamLogos"; // <--- Importamos nossa função

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const maxHomeOdd = Math.max(...match.odds.filter(o => o.selection === "Home").map(o => o.value), 0);
  const maxDrawOdd = Math.max(...match.odds.filter(o => o.selection === "Draw").map(o => o.value), 0);
  const maxAwayOdd = Math.max(...match.odds.filter(o => o.selection === "Away").map(o => o.value), 0);

  // Lógica Surebet
  let isSurebet = false;
  let profitPercentage = 0;
  if (maxHomeOdd > 0 && maxDrawOdd > 0 && maxAwayOdd > 0) {
    const arbitrageIndex = (1 / maxHomeOdd) + (1 / maxDrawOdd) + (1 / maxAwayOdd);
    if (arbitrageIndex < 1) {
      isSurebet = true;
      profitPercentage = (1 - arbitrageIndex) * 100;
    }
  }

  const getOddData = (selection: string) => {
    const odd = match.odds.find(o => o.selection === selection);
    if (!odd) return null;
    const isBest =
      (selection === "Home" && odd.value >= maxHomeOdd) ||
      (selection === "Draw" && odd.value >= maxDrawOdd) ||
      (selection === "Away" && odd.value >= maxAwayOdd);
    return { ...odd, isBest };
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const homeData = getOddData("Home");
  const drawData = getOddData("Draw");
  const awayData = getOddData("Away");

  // --- LOGOS ---
  const homeLogo = getTeamLogoUrl(match.homeTeam);
  const awayLogo = getTeamLogoUrl(match.awayTeam);

  return (
    <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 hover:shadow-xl transition-all duration-300 group">
      
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {isSurebet && (
        <div className="bg-amber-400 text-amber-950 text-[10px] font-black py-1 px-4 flex items-center justify-center gap-2 shadow-sm animate-pulse">
          <Zap className="w-3 h-3 fill-current" />
          OPORTUNIDADE DE LUCRO GARANTIDO: {profitPercentage.toFixed(2)}%
        </div>
      )}

      {/* Header */}
      <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
            <Trophy className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 truncate max-w-[150px]">
            {match.league}
            </span>
        </div>
        <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100 shadow-sm">
          <Clock className="w-3 h-3" />
          {formatTime(match.startTime)}
        </span>
      </div>

      {/* Times */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-6">
          
          {/* CASA */}
          <div className="flex items-center gap-3 flex-1 justify-end text-right">
            <span className="text-sm font-bold text-slate-700 leading-tight">
              {match.homeTeam}
            </span>
            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 p-1">
                {homeLogo ? (
                    <img src={homeLogo} alt={match.homeTeam} className="w-full h-full object-contain" />
                ) : (
                    <Home className="w-5 h-5 text-indigo-400" />
                )}
            </div>
          </div>

          {/* VS */}
          <div className="mx-2 text-[10px] font-black text-slate-300">VS</div>

          {/* VISITANTE */}
          <div className="flex items-center gap-3 flex-1 text-left">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-full border border-slate-100 p-1">
                {awayLogo ? (
                    <img src={awayLogo} alt={match.awayTeam} className="w-full h-full object-contain" />
                ) : (
                    <Shield className="w-5 h-5 text-rose-400" />
                )}
            </div>
            <span className="text-sm font-bold text-slate-700 leading-tight">
              {match.awayTeam}
            </span>
          </div>
        </div>

        {/* Odds Grid */}
        <div className="grid grid-cols-3 gap-3">
          <OddButton data={homeData} label="1" />
          <OddButton data={drawData} label="X" />
          <OddButton data={awayData} label="2" />
        </div>
      </div>
    </div>
  );
}

// O componente OddButton continua exatamente igual ao anterior
function OddButton({ data, label }: { data: (Odd & { isBest: boolean }) | null; label: string; }) {
  // ... (Copie o mesmo código do OddButton que você já tem)
  if (!data) {
    return (
      <div className="bg-slate-50 border border-slate-100 rounded-xl h-[72px] flex flex-col items-center justify-center opacity-60">
        <span className="text-[10px] text-slate-400 font-bold mb-1">{label}</span>
        <span className="text-lg font-bold text-slate-300">-</span>
      </div>
    );
  }

  const isBest = data.isBest;

  return (
    <a
      href={data.bookmakerUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        relative rounded-xl h-[72px] flex flex-col items-center justify-center transition-all duration-200 group/btn
        ${isBest 
          ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 hover:-translate-y-1 hover:shadow-xl" 
          : "bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md hover:-translate-y-0.5"
        }
      `}
    >
      {isBest && (
        <div className="absolute -top-2 bg-indigo-600 text-white text-[8px] font-bold px-2 py-0.5 rounded-full shadow-sm">
          MELHOR
        </div>
      )}
      <span className={`text-[10px] font-bold mb-0.5 ${isBest ? "text-emerald-100" : "text-slate-400"}`}>
        {label}
      </span>
      <span className="text-xl font-black tracking-tight">
        {data.value.toFixed(2)}
      </span>
      <span className={`text-[8px] font-bold uppercase mt-1 px-1.5 rounded-sm ${isBest ? "bg-black/20 text-white" : "bg-slate-100 text-slate-500"}`}>
        {data.bookmakerName}
      </span>
    </a>
  );
}