import { Home, Minus, ArrowRight } from "lucide-react";

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
}

export default function OddButton({ 
  bestOdd, 
  allOddsForSelection, 
  label, 
  icon,
  dropPercent = 0 // padrão 0 se não vier do backend
}: OddButtonProps) {
  // Cálculo do Value Bet
  const calculateValuePercent = () => {
    if (!bestOdd || allOddsForSelection.length < 2) return null;

    const average = allOddsForSelection.reduce((sum, o) => sum + o.value, 0) / allOddsForSelection.length;
    const valuePercent = ((bestOdd.value / average) - 1) * 100;

    return valuePercent >= 3 ? valuePercent.toFixed(1) : null;
  };

  const valuePercent = calculateValuePercent();

  if (!bestOdd) {
    return (
      <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center text-gray-400 opacity-60">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-2xl font-bold mt-1">-</span>
      </div>
    );
  }

  const linkUrl = bestOdd.affiliateUrl || bestOdd.bookmakerUrl || "#";

  return (
    <a
      href={linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 block h-full"
    >
      {/* Badge MELHOR */}
      <div className="absolute -top-1 -right-1 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded-bl-lg rounded-tr-lg shadow-md z-10 animate-pulse">
        MELHOR
      </div>

      {/* Badge VALUE BET */}
      {valuePercent && (
        <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-bounce">
          +{valuePercent}% VALUE
        </div>
      )}

      {/* Badge DROPPING ODDS NORMAL (>10%) */}
      {dropPercent > 10 && dropPercent <= 20 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-pulse">
          ↓ {dropPercent.toFixed(1)}% DROP
        </div>
      )}

      {/* Badge SHARP MONEY (>20%) */}
      {dropPercent > 20 && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 rounded-full shadow-lg z-10 animate-pulse border-2 border-red-600">
          SHARP MONEY ↓ {dropPercent.toFixed(1)}%
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-4 flex flex-col items-center justify-center h-full">
        <div className="mb-1 opacity-80">
          {icon === "home" && <Home className="w-5 h-5" />}
          {icon === "draw" && <Minus className="w-5 h-5" />}
          {icon === "away" && <ArrowRight className="w-5 h-5" />}
        </div>

        <span className="text-xs font-bold tracking-wider">{label}</span>
        <span className="text-2xl font-extrabold tracking-tight mt-1">
          {bestOdd.value.toFixed(2)}
        </span>

        <span className="text-[9px] uppercase font-bold bg-white/30 px-2 py-0.5 rounded mt-2">
          {bestOdd.bookmakerName}
        </span>
      </div>
    </a>
  );
}