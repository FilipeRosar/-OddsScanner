'use client';

import { useState, useMemo } from "react";
import { Match } from "@/app/types";
import MatchCard from "./MatchCard";
import { Search, Filter, TrendingUp } from "lucide-react";

interface MatchListProps {
  initialMatches: Match[];
}

export default function MatchList({ initialMatches }: MatchListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("Todas");
  const [viewMode, setViewMode] = useState<"all" | "live" | "surebets">("all");

  // Separação de jogos
  const liveMatches = useMemo(() => initialMatches.filter(m => m.isLive), [initialMatches]);
  const surebetMatches = useMemo(() => initialMatches.filter(m => m.surebetProfit != null), [initialMatches]);
  const upcomingMatches = useMemo(() => initialMatches.filter(m => !m.isLive), [initialMatches]);

  // Ligas para o filtro (depende da aba)
  const leagues = useMemo(() => {
    let source = initialMatches;
    if (viewMode === "live") source = liveMatches;
    if (viewMode === "surebets") source = surebetMatches;
    const unique = Array.from(new Set(source.map(m => m.league)));
    return ["Todas", ...unique.sort()];
  }, [initialMatches, liveMatches, surebetMatches, viewMode]);

  // Filtragem final
  const filteredMatches = useMemo(() => {
    let source = initialMatches;
    if (viewMode === "live") source = liveMatches;
    if (viewMode === "surebets") source = surebetMatches;
    if (viewMode === "all") source = upcomingMatches.concat(liveMatches); // todos

    return source.filter(match => {
      const matchesLeague = selectedLeague === "Todas" || match.league === selectedLeague;
      const matchesSearch =
        searchTerm === "" ||
        match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
        match.league.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesLeague && matchesSearch;
    });
  }, [initialMatches, liveMatches, surebetMatches, upcomingMatches, viewMode, selectedLeague, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Abas principais */}
      <div className="flex gap-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setViewMode("all")}
          className={`font-bold text-lg transition-colors relative pb-3 ${
            viewMode === "all" 
              ? "text-indigo-600 border-b-3 border-indigo-600" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          Todos os jogos
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({initialMatches.length})
          </span>
        </button>

        <button
          onClick={() => setViewMode("live")}
          className={`font-bold text-lg transition-colors relative pb-3 flex items-center gap-2 ${
            viewMode === "live" 
              ? "text-red-600 border-b-3 border-red-600" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <span className="relative flex">
            <span className="w-3 h-3 bg-red-600 rounded-full animate-ping absolute"></span>
            <span className="w-3 h-3 bg-red-600 rounded-full"></span>
          </span>
          Ao Vivo
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({liveMatches.length})
          </span>
        </button>

        {/* Aba Surebets do Dia */}
        <button
          onClick={() => setViewMode("surebets")}
          className={`font-bold text-lg transition-colors relative pb-3 flex items-center gap-2 ${
            viewMode === "surebets" 
              ? "text-emerald-600 border-b-3 border-emerald-600" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <TrendingUp className="w-5 h-5" />
          Surebets do Dia
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({surebetMatches.length})
          </span>
          {surebetMatches.length > 0 && (
            <span className="ml-2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
              NOVO
            </span>
          )}
        </button>
      </div>

      {/* Filtros (só aparece nas abas normais) */}
      {viewMode !== "surebets" && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar time ou liga..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <select
                value={selectedLeague}
                onChange={(e) => setSelectedLeague(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-slate-800 font-medium cursor-pointer"
              >
                {leagues.map(league => (
                  <option key={league} value={league}>
                    {league === "Todas" ? "Todas as ligas" : league}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mensagem especial para Surebets */}
      {viewMode === "surebets" && surebetMatches.length === 0 && (
        <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-200">
          <TrendingUp className="w-16 h-16 mx-auto text-emerald-600 mb-4" />
          <p className="text-2xl font-bold text-emerald-800">Nenhuma Surebet no momento</p>
          <p className="text-emerald-600 mt-2 max-w-md mx-auto">
            Surebets são raras, mas quando aparecem, garantem lucro independente do resultado. 
            Fique de olho — novas oportunidades surgem a todo momento!
          </p>
        </div>
      )}

      {/* Lista de jogos */}
      {filteredMatches.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-slate-200">
          <p className="text-xl text-slate-600 font-medium">
            {viewMode === "surebets" ? "Nenhuma Surebet encontrada" : "Nenhum jogo encontrado"}
          </p>
          <p className="text-slate-500 mt-2">Tente ajustar os filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map(match => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}