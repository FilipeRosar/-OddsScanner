'use client';

import { useState, useMemo, useEffect } from "react";
import { Match } from "@/app/types";
import MatchCard from "./MatchCard";
import MatchFilters from "./MatchFilters";
import { Search, TrendingUp, X, ChevronLeft, ChevronRight, Hash } from "lucide-react";

interface MatchListProps {
  initialMatches: Match[];
  initialLeague?: string;
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

const ITEMS_PER_PAGE = 12;

export default function MatchList({ initialMatches = [], initialLeague }: MatchListProps) {
  const [viewMode, setViewMode] = useState<"all" | "live" | "surebets">("all");
  const [filters, setFilters] = useState<Filters>({ 
    ...defaultFilters, 
    league: initialLeague || "all" 
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Sincroniza filtro se a liga mudar via URL/Props
  useEffect(() => {
    if (initialLeague) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFilters(prev => ({ ...prev, league: initialLeague }));
      setCurrentPage(1);
    }
  }, [initialLeague]);

  const handleViewModeChange = (mode: "all" | "live" | "surebets") => {
    setCurrentPage(1);
    setViewMode(mode);
  };

  const handleSearchChange = (term: string) => {
    setCurrentPage(1);
    setSearchTerm(term);
  };

  const handleFilterChange = (newFilters: Filters) => {
    setCurrentPage(1);
    setFilters(newFilters);
  };

  // Garantia de array e filtragem base
  const safeMatches = useMemo(() => Array.isArray(initialMatches) ? initialMatches : [], [initialMatches]);
  
  const liveMatches = useMemo(() => safeMatches.filter(m => m?.isLive), [safeMatches]);
  const surebetMatches = useMemo(() => safeMatches.filter(m => m?.surebetProfit != null && m.surebetProfit > 0), [safeMatches]);
  const upcomingMatches = useMemo(() => safeMatches.filter(m => !m?.isLive), [safeMatches]);

  const allLeagues = useMemo(() => {
    const unique = Array.from(new Set(safeMatches.map(m => m.league).filter(Boolean)));
    return unique.sort();
  }, [safeMatches]);

  const filteredMatches = useMemo(() => {
    let source: Match[] = [];
    if (viewMode === "live") source = liveMatches;
    else if (viewMode === "surebets") source = surebetMatches;
    else source = [...upcomingMatches, ...liveMatches];

    return source.filter(match => {
      if (!match) return false;

      // Filtro de Liga (Case Insensitive para evitar erros de DB)
      if (filters.league !== "all" && match.league?.toLowerCase() !== filters.league.toLowerCase()) return false;
      
      if (filters.surebetsOnly && !match.surebetProfit) return false;
      if (filters.liveOnly && !match.isLive) return false;

      // Filtro de Tempo
      if (filters.timeRange !== "all" && match.startTime) {
        const today = new Date();
        const matchDate = new Date(match.startTime);
        today.setHours(0,0,0,0);
        matchDate.setHours(0,0,0,0);
        
        const diffTime = matchDate.getTime() - today.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (filters.timeRange === "today" && diffDays !== 0) return false;
        if (filters.timeRange === "tomorrow" && diffDays !== 1) return false;
        if (filters.timeRange === "3days" && (diffDays < 0 || diffDays > 3)) return false;
      }

      // Busca Textual
      if (searchTerm.trim() !== "") {
        const lowerSearch = searchTerm.toLowerCase();
        return (
          (match.homeTeam || "").toLowerCase().includes(lowerSearch) ||
          (match.awayTeam || "").toLowerCase().includes(lowerSearch) ||
          (match.league || "").toLowerCase().includes(lowerSearch)
        );
      }
      return true;
    });
  }, [safeMatches, liveMatches, surebetMatches, upcomingMatches, viewMode, filters, searchTerm]);

  // Lógica de Paginação
  const totalPages = Math.ceil(filteredMatches.length / ITEMS_PER_PAGE);
  const paginatedMatches = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredMatches.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredMatches, currentPage]);

  return (
    <div className="space-y-8 min-h-screen pb-20">
      {/* Abas Principais */}
      <div className="flex flex-wrap gap-6 border-b border-slate-200 pb-0">
        <button
          onClick={() => handleViewModeChange("all")}
          className={`font-bold text-lg transition-all relative pb-4 flex items-center gap-2 ${
            viewMode === "all" ? "text-indigo-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Todos os jogos 
          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
            {safeMatches.length}
          </span>
          {viewMode === "all" && <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />}
        </button>

        <button
          onClick={() => handleViewModeChange("live")}
          className={`font-bold text-lg transition-all relative pb-4 flex items-center gap-2 ${
            viewMode === "live" ? "text-red-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse" />
          Ao Vivo 
          <span className="text-xs bg-red-50 px-2 py-0.5 rounded-full text-red-600">
            {liveMatches.length}
          </span>
          {viewMode === "live" && <div className="absolute bottom-0 left-0 w-full h-1 bg-red-600 rounded-t-full" />}
        </button>

        <button
          onClick={() => handleViewModeChange("surebets")}
          className={`font-bold text-lg transition-all relative pb-4 flex items-center gap-2 ${
            viewMode === "surebets" ? "text-emerald-600" : "text-slate-500 hover:text-slate-700"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Surebets
          <span className="text-xs bg-emerald-50 px-2 py-0.5 rounded-full text-emerald-600">
            {surebetMatches.length}
          </span>
          {viewMode === "surebets" && <div className="absolute bottom-0 left-0 w-full h-1 bg-emerald-600 rounded-t-full" />}
        </button>
      </div>

      {/* Busca e Filtros */}
      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Time, liga ou confronto..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-14 pr-12 py-4 text-lg border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 transition-all shadow-sm outline-none bg-white"
          />
          {searchTerm && (
            <button onClick={() => handleSearchChange("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <MatchFilters leagues={allLeagues} onFilterChange={handleFilterChange} />
      </div>

      {/* Grid de Jogos */}
      <div className="min-h-[400px]">
        {paginatedMatches.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-500">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Hash className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-xl font-bold text-slate-600">Nenhum confronto encontrado</p>
            <p className="text-sm text-slate-400 mt-2">Tente ajustar seus filtros ou termos de busca.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-700">
              {paginatedMatches.map(match => (
                <MatchCard key={`${match.id}-${match.homeTeam}`} match={match} />
              ))}
            </div>

            {/* Paginação Estilizada com Input Editável */}
{totalPages > 1 && (
  <div className="relative z-30 flex flex-col sm:flex-row items-center justify-center gap-4 pt-16 pb-10">
    <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-xl border border-slate-100">
      
      {/* Botão Voltar - Seta mais escura e visível */}
      <button
        onClick={() => {
          const newPage = Math.max(1, currentPage - 1);
          setCurrentPage(newPage);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        disabled={currentPage === 1}
        className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-20 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-sm group"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-6 h-6 stroke-[2.5px]" /> 
      </button>
      
      <div className="flex items-center gap-3 px-2">
        {/* Input Editável para o número da página */}
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val >= 1 && val <= totalPages) {
                          setCurrentPage(val);
                        }
                      }}
                      className="w-12 h-10 text-center font-black text-indigo-600 bg-indigo-50 border-2 border-indigo-100 rounded-lg focus:outline-none focus:border-indigo-400 focus:ring-0 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>

                  <span className="text-sm text-slate-400 font-bold uppercase tracking-tighter select-none">
                    de {totalPages}
                  </span>
                </div>

                {/* Botão Próximo - Seta mais escura e visível */}
                <button
                  onClick={() => {
                    const newPage = Math.min(totalPages, currentPage + 1);
                    setCurrentPage(newPage);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={currentPage === totalPages}
                  className="p-3 rounded-xl border border-slate-200 bg-white disabled:opacity-20 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-600 transition-all shadow-sm group"
                  aria-label="Próxima página"
                >
                  <ChevronRight className="w-6 h-6 stroke-[2.5px]" />
                </button>
              </div>
            </div>

            )}
          </>
        )}
      </div>
    </div>
  );
}