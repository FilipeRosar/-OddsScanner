'use client';

import { useState, useMemo } from "react";
import { Match } from "@/app/types";
import MatchCard from "./MatchCard";
import MatchFilters from "./MatchFilters";
import { Search, TrendingUp, X } from "lucide-react";

interface MatchListProps {
  initialMatches: Match[];
}

interface Filters {
  league: string;
  timeRange: "today" | "tomorrow" | "3days" | "all";
  valueBet: "all" | "3" | "5" | "8";
  droppingOdds: "all" | "10" | "15" | "20";
  surebetsOnly: boolean;
  liveOnly: boolean;
}

const defaultFilters: Filters = {
  league: "all",
  timeRange: "all",
  valueBet: "all",
  droppingOdds: "all",
  surebetsOnly: false,
  liveOnly: false,
};

export default function MatchList({ initialMatches }: MatchListProps) {
  const [viewMode, setViewMode] = useState<"all" | "live" | "surebets">("all");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [searchTerm, setSearchTerm] = useState("");

  // Separação de jogos
  const liveMatches = useMemo(() => initialMatches.filter(m => m.isLive), [initialMatches]);
  const surebetMatches = useMemo(() => initialMatches.filter(m => m.surebetProfit != null), [initialMatches]);
  const upcomingMatches = useMemo(() => initialMatches.filter(m => !m.isLive), [initialMatches]);

  // Ligas únicas
  const allLeagues = useMemo(() => {
    const unique = Array.from(new Set(initialMatches.map(m => m.league)));
    return unique.sort();
  }, [initialMatches]);

  // Filtragem principal + busca por time
  const filteredMatches = useMemo(() => {
    let source: Match[] = [];

    if (viewMode === "live") source = liveMatches;
    else if (viewMode === "surebets") source = surebetMatches;
    else source = [...upcomingMatches, ...liveMatches];

    return source.filter(match => {
      // Filtros existentes
      if (filters.league !== "all" && match.league !== filters.league) return false;
      if (filters.surebetsOnly && !match.surebetProfit) return false;
      if (filters.liveOnly && !match.isLive) return false;

      // Filtro por horário (simplificado)
      if (filters.timeRange !== "all") {
        const today = new Date();
        const matchDate = new Date(match.startTime);
        const diffDays = Math.floor((matchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (filters.timeRange === "today" && diffDays !== 0) return false;
        if (filters.timeRange === "tomorrow" && diffDays !== 1) return false;
        if (filters.timeRange === "3days" && diffDays > 3) return false;
      }

      // BUSCA POR TIME, LIGA OU PALAVRA
      if (searchTerm.trim() !== "") {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesSearch =
          match.homeTeam.toLowerCase().includes(lowerSearch) ||
          match.awayTeam.toLowerCase().includes(lowerSearch) ||
          match.league.toLowerCase().includes(lowerSearch);

        if (!matchesSearch) return false;
      }

      return true;
    });
  }, [initialMatches, liveMatches, surebetMatches, upcomingMatches, viewMode, filters, searchTerm]);

  return (
    <div className="space-y-8">
      {/* Abas principais */}
      <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-4">
        <button
          onClick={() => setViewMode("all")}
          className={`font-bold text-lg transition-colors relative pb-3 flex items-center gap-2 ${
            viewMode === "all" 
              ? "text-indigo-600 border-b-3 border-indigo-600" 
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Todos os jogos
          <span className="text-sm font-normal text-slate-500">
            ({initialMatches.length})
          </span>
        </button>

        <button
          onClick={() => setViewMode("live")}
          className={`font-bold text-lg transition-colors relative pb-3 flex items-center gap-2 ${
            viewMode === "live" 
              ? "text-red-600 border-b-3 border-red-600" 
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <span className="relative flex">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute"></span>
            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
          </span>
          Ao Vivo
          <span className="text-sm font-normal text-slate-500">
            ({liveMatches.length})
          </span>
        </button>

        <button
          onClick={() => setViewMode("surebets")}
          className={`font-bold text-lg transition-colors relative pb-3 flex items-center gap-2 ${
            viewMode === "surebets" 
              ? "text-emerald-600 border-b-3 border-emerald-600" 
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Surebets do Dia
          <span className="text-sm font-normal text-slate-500">
            ({surebetMatches.length})
          </span>
          {surebetMatches.length > 0 && (
            <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">
              NOVO
            </span>
          )}
        </button>
      </div>

      {/* BUSCA POR TIME + FILTROS */}
      <div className="space-y-6">
        {/* Barra de busca */}
        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por time, liga ou confronto (ex: Flamengo, Brasileirão, Palmeiras x Corinthians)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 py-4 text-lg border border-slate-300 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm bg-white text-slate-900 placeholder:text-slate-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filtros avançados */}
        {viewMode !== "surebets" && (
          <div className="max-w-5xl mx-auto">
            <MatchFilters
              leagues={allLeagues}
              onFilterChange={setFilters}
            />
          </div>
        )}
      </div>

      {/* Mensagem quando não há surebets */}
      {viewMode === "surebets" && surebetMatches.length === 0 && (
        <div className="text-center py-20 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200">
          <TrendingUp className="w-20 h-20 mx-auto text-emerald-600 mb-6" />
          <p className="text-3xl font-black text-emerald-800 mb-4">Nenhuma Surebet no momento</p>
          <p className="text-lg text-emerald-700 max-w-2xl mx-auto px-4">
            Surebets são raras, mas quando aparecem, garantem <strong>lucro independente do resultado</strong>.<br />
            Fique de olho — novas oportunidades surgem a todo momento!
          </p>
        </div>
      )}

      {/* Lista de jogos */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-slate-200">
          <Search className="w-16 h-16 mx-auto text-slate-400 mb-6" />
          <p className="text-2xl text-slate-600 font-bold">
            Nenhum jogo encontrado
          </p>
          <p className="text-slate-500 mt-3 text-lg max-w-md mx-auto">
            Tente buscar por outro time, ajustar os filtros ou volte mais tarde.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}