import { Home, Minus, ArrowRight, ExternalLink, TrendingDown, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils"; 

interface OddButtonProps {
  bestOdd: {
    value: number;
    bookmakerName: string;
    bookmakerUrl: string;
    affiliateUrl?: string;
  } | null;
  allOddsForSelection: { value: number }[];
  label: "1" | "X" | "2";
  icon: "home" | "draw" | "away";
  dropPercent?: number;
  onStatsClick?: () => void;
}

export default function OddButton({
  bestOdd,
  allOddsForSelection,
  label,
  icon,
  dropPercent = 0,
  onStatsClick
}: OddButtonProps) {
  
  // Lógica de Value Bet
  const calculateValuePercent = () => {
    if (!bestOdd || allOddsForSelection.length < 2) return null;
    const average = allOddsForSelection.reduce((sum, o) => sum + o.value, 0) / allOddsForSelection.length;
    if (average === 0) return null;
    const valuePercent = ((bestOdd.value / average) - 1) * 100;
    return valuePercent >= 3 ? valuePercent : null;
  };

  const valuePercent = calculateValuePercent();
  
  // Estado Vazio (Sem odd)
  if (!bestOdd) {
    return (
      <div className="h-full min-h-[120px] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 select-none">
        <span className="text-xs font-bold mb-1">{label}</span>
        <Minus className="w-6 h-6 opacity-50" />
      </div>
    );
  }

  const linkUrl = bestOdd.affiliateUrl || bestOdd.bookmakerUrl || "#";
  const isValueBet = valuePercent !== null;
  const isSharpDrop = dropPercent > 20;

  // Definição de Cores
  const bgGradient = isSharpDrop 
    ? "bg-gradient-to-br from-slate-900 to-slate-800 border-red-500/50" 
    : isValueBet 
      ? "bg-gradient-to-br from-emerald-500 to-emerald-700" // Verde mais profundo para contraste
      : "bg-gradient-to-br from-blue-500 to-indigo-600";

  return (
    <div className={cn(
      "group relative rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 h-full min-h-[120px] flex flex-col overflow-hidden border border-transparent select-none",
      isSharpDrop && "border-red-500 shadow-red-900/20"
    )}>
      
      {/* --- ÁREA DE BADGES (TOPO) --- */}
      {/* Adicionei 'pointer-events-none' para garantir que cliques nas badges passem para o botão principal se necessário */}
      <div className="absolute top-0 left-0 w-full flex justify-between items-start z-20 p-1 pointer-events-none">
        
        {/* Lado Esquerdo: Stack Vertical de Value/Drop */}
        <div className="flex flex-col gap-1 max-w-[65%]">
          {dropPercent > 2 && (
            <div className={cn(
              "flex items-center gap-1 px-1.5 py-0.5 rounded shadow-sm w-fit animate-in fade-in slide-in-from-left-1",
              dropPercent > 20 ? "bg-red-600 text-white" : "bg-red-100 text-red-700"
            )}>
              <TrendingDown className="w-3 h-3" />
              <span className="text-[10px] font-black leading-none">{dropPercent.toFixed(1)}%</span>
            </div>
          )}
          
          {valuePercent && (
            <div className="bg-yellow-400 text-yellow-950 px-1.5 py-0.5 rounded shadow-sm w-fit flex items-center gap-1 animate-in fade-in slide-in-from-left-1 delay-75">
              <span className="text-[10px] font-bold">★</span>
              <span className="text-[10px] font-black leading-none">{valuePercent.toFixed(1)}%</span>
            </div>
          )}
        </div>

        {/* Lado Direito: Badge MELHOR */}
        {/* Adicionei 'shrink-0' para impedir que essa badge seja esmagada */}
        <div className="shrink-0 bg-white/20 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/10 shadow-sm">
          MELHOR
        </div>
      </div>

      {/* --- CORPO PRINCIPAL (Ação: Gráfico) --- */}
      <div 
        onClick={onStatsClick}
        className={cn(
          "flex-1 flex flex-col items-center relative z-10 cursor-pointer overflow-hidden",
          bgGradient
        )}
      >
        {/* Ícone de Fundo (Marca D'água Gigante) */}
        {/* Isso remove a necessidade do ícone pequeno ocupando espaço vertical */}
        <div className="absolute -right-4 -bottom-4 opacity-10 rotate-[-15deg] transition-transform group-hover:scale-110 duration-500">
           {icon === "home" && <Home className="w-24 h-24 text-white" />}
           {icon === "draw" && <Minus className="w-24 h-24 text-white" />}
           {icon === "away" && <ArrowRight className="w-24 h-24 text-white" />}
        </div>

        {/* Conteúdo Centralizado com Padding Top para fugir das badges */}
        <div className="flex-1 flex flex-col items-center justify-center w-full pt-6 pb-2"> 
          
          {/* Label (1, X, 2) */}
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            {label === "1" ? "Casa" : label === "X" ? "Empate" : "Fora"}
          </span>

          {/* O NÚMERO DA ODD */}
          <div className="flex items-center gap-2 transition-transform duration-300 group-hover:scale-110">
            <span className="text-white text-3xl font-black tracking-tighter drop-shadow-md">
              {bestOdd.value.toFixed(2)}
            </span>
            
            {/* Ícone de Gráfico que só aparece no Hover (Substituto do texto "Ver Histórico") */}
            <div className="w-0 overflow-hidden group-hover:w-auto transition-all duration-300 opacity-0 group-hover:opacity-100">
               <BarChart3 className="w-5 h-5 text-yellow-300" />
            </div>
          </div>
        </div>
      </div>

      {/* --- RODAPÉ (Ação: Link Externo) --- */}
      {/* Altura fixa (h-8) para garantir consistência entre cards */}
      <a
        href={linkUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={(e) => e.stopPropagation()} 
        className="h-8 bg-white hover:bg-gray-50 text-gray-800 px-3 flex items-center justify-between border-t border-gray-100 transition-colors z-20 relative"
      >
        <span className="text-[10px] font-bold uppercase tracking-wider truncate max-w-[85px] text-gray-700 group-hover:text-black">
          {bestOdd.bookmakerName}
        </span>
        <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
      </a>
    </div>
  );
}