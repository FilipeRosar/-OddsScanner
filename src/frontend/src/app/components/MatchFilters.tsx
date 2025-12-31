"use client";

import { useState } from "react";
import { Filter, X, Clock, TrendingDown, Percent, Zap } from "lucide-react";

interface Filters {
  league: string;
  timeRange: "today" | "tomorrow" | "3days" | "all";
  valueBet: "all" | "3" | "5" | "8";
  droppingOdds: "all" | "10" | "15" | "20";
  surebetsOnly: boolean;
  liveOnly: boolean;
}

interface MatchFiltersProps {
  leagues: string[];
  onFilterChange: (filters: Filters) => void;
}

const defaultFilters: Filters = {
  league: "all",
  timeRange: "all",
  valueBet: "all",
  droppingOdds: "all",
  surebetsOnly: false,
  liveOnly: false,
};

export default function MatchFilters({ leagues, onFilterChange }: MatchFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(defaultFilters);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  const activeFiltersCount =
    (filters.league !== "all" ? 1 : 0) +
    (filters.timeRange !== "all" ? 1 : 0) +
    (filters.valueBet !== "all" ? 1 : 0) +
    (filters.droppingOdds !== "all" ? 1 : 0) +
    (filters.surebetsOnly ? 1 : 0) +
    (filters.liveOnly ? 1 : 0);

  return (
    <div className="relative mb-8">
      {/* Botão principal */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-white border border-slate-200 hover:border-indigo-400 rounded-xl px-6 py-4 shadow-md hover:shadow-lg transition-all duration-300 w-full sm:w-auto"
      >
        <Filter className="w-5 h-5 text-indigo-600" />
        <span className="font-bold text-slate-800">Filtros Avançados</span>
        {activeFiltersCount > 0 && (
          <span className="bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-full ml-2">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Painel de filtros */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-black text-slate-900">Filtrar Jogos</h3>
            <button
              onClick={resetFilters}
              className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <X className="w-4 h-4" />
              Limpar tudo
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Liga */}
            <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Liga</label>
            <select
                value={filters.league}
                onChange={(e) => handleFilterChange("league", e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white text-slate-900 font-medium"
            >
                <option value="all">Todas as ligas</option>
                {leagues.map((league) => (
                <option key={league} value={league}>
                    {league}
                </option>
                ))}
            </select>
            </div>

            {/* Horário */}
           <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Horário
            </label>
            <select
                value={filters.timeRange}
                onChange={(e) => handleFilterChange("timeRange", e.target.value as Filters["timeRange"])}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white text-slate-900 font-medium"
            >
                <option value="all">Todos os jogos</option>
                <option value="today">Hoje</option>
                <option value="tomorrow">Amanhã</option>
                <option value="3days">Próximos 3 dias</option>
            </select>
            </div>

            {/* Value Bet */}
            <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Value Bet
                </label>
                <select
                    value={filters.valueBet}
                    onChange={(e) => handleFilterChange("valueBet", e.target.value as Filters["valueBet"])}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white text-slate-900 font-medium"
                >
                    <option value="all">Todas</option>
                    <option value="3">+3% ou mais</option>
                    <option value="5">+5% ou mais</option>
                    <option value="8">+8% ou mais (forte)</option>
                </select>
                </div>
            {/* Dropping Odds */}
            <div>
                <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Dropping Odds
                </label>
                <select
                    value={filters.droppingOdds}
                    onChange={(e) => handleFilterChange("droppingOdds", e.target.value as Filters["droppingOdds"])}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 transition-all bg-white text-slate-900 font-medium"
                >
                    <option value="all">Todas</option>
                    <option value="10">Queda &gt;10%</option>
                    <option value="15">Queda &gt;15%</option>
                    <option value="20">Queda &gt;20% (sharp money)</option>
                </select>
                </div>

            {/* Surebets */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="surebets"
                checked={filters.surebetsOnly}
                onChange={(e) => handleFilterChange("surebetsOnly", e.target.checked)}
                className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
              />
              <label htmlFor="surebets" className="font-bold text-emerald-700 cursor-pointer flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Apenas Surebets (lucro garantido)
              </label>
            </div>

            {/* Ao Vivo */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="live"
                checked={filters.liveOnly}
                onChange={(e) => handleFilterChange("liveOnly", e.target.checked)}
                className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
              />
              <label htmlFor="live" className="font-bold text-red-600 cursor-pointer">
                Apenas jogos AO VIVO
              </label>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
            <button
              onClick={() => setIsOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-3 rounded-xl shadow-lg transition-all duration-200"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}