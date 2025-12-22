import { Match } from "@/app/types";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  const getOdd = (selection: string) => {
    const odd = match.odds.find(o => o.selection === selection);
    return odd ? odd.value.toFixed(2) : '-';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all duration-300">
      {/* Cabeçalho do Card */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded uppercase tracking-wider">
          {match.league}
        </span>
        <span className="text-xs text-slate-400 font-medium">
          {formatDate(match.startTime)}
        </span>
      </div>

      {/* Times */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-lg font-bold text-slate-800 w-1/3 text-left">
          {match.homeTeam}
        </div>
        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          VS
        </div>
        <div className="text-lg font-bold text-slate-800 w-1/3 text-right">
          {match.awayTeam}
        </div>
      </div>

      {/* Botões de Odds */}
      <div className="grid grid-cols-3 gap-3">
        <OddButton label="Casa" value={getOdd('Home')} />
        <OddButton label="Empate" value={getOdd('Draw')} />
        <OddButton label="Fora" value={getOdd('Away')} />
      </div>
    </div>
  );
}

// Sub-componente simples para o botão
function OddButton({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center justify-center bg-slate-50 border border-slate-200 rounded-lg p-2 cursor-pointer hover:bg-green-50 hover:border-green-200 transition-colors group">
      <span className="text-xs text-slate-500 mb-1 group-hover:text-green-700">{label}</span>
      <span className="font-bold text-slate-900 text-lg group-hover:text-green-700">{value}</span>
    </div>
  );
}