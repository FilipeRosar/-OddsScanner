'use client';

import { useState, useEffect } from 'react';
import { Match } from '@/app/types/index';
import MatchCard from './MatchCard';
import { Search, Filter, Radio, Frown } from 'lucide-react';

interface MatchListProps {
  initialMatches: Match[];
}

export default function MatchList({ initialMatches }: MatchListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState<'ALL' | 'LIVE'>('ALL');
  const [now, setNow] = useState(new Date());

  // Atualiza o relógio a cada minuto para garantir que o filtro "Ao Vivo" mude sozinho
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const filteredMatches = initialMatches.filter(match => {
    // 1. Filtro de Texto (Busca)
    const matchesSearch = 
      match.homeTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.awayTeam.toLowerCase().includes(searchTerm.toLowerCase()) ||
      match.league.toLowerCase().includes(searchTerm.toLowerCase());

    // 2. Filtro de Estado (Ao Vivo vs Todos)
    let matchesState = true;

    if (filterState === 'LIVE') {
      const matchTime = new Date(match.startTime);
      // É Ao Vivo se: Já começou E começou a menos de 150 minutos (2h30 de jogo)
      const diffInMinutes = (now.getTime() - matchTime.getTime()) / 1000 / 60;
      matchesState = diffInMinutes >= 0 && diffInMinutes < 150; 
    }

    return matchesSearch && matchesState;
  });

  return (
    <div className="space-y-8">
      {/* Barra de Controle */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2 pr-2 pl-6 rounded-2xl shadow-sm border border-slate-200">
        
        {/* Input de Pesquisa */}
        <div className="flex items-center gap-3 w-full md:w-96">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar times, ligas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 bg-transparent border-none focus:outline-none text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>

        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

        {/* Botões de Filtro */}
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => setFilterState('ALL')}
            className={`
              flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
              ${filterState === 'ALL' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
              }
            `}
          >
            <Filter className="w-4 h-4" />
            Todos
          </button>
          
          <button 
            onClick={() => setFilterState('LIVE')}
            className={`
              flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2
              ${filterState === 'LIVE' 
                ? 'bg-rose-500 text-white shadow-md shadow-rose-200' 
                : 'bg-transparent text-slate-500 hover:bg-slate-50'
              }
            `}
          >
            <Radio className={`w-4 h-4 ${filterState === 'LIVE' ? 'animate-pulse' : ''}`} />
            Ao Vivo
          </button>
        </div>
      </div>

      {/* Grid de Resultados */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <Frown className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-lg font-medium">Nenhum jogo encontrado</p>
          <p className="text-sm">
            {filterState === 'LIVE' 
              ? "Nenhum jogo rolando agora. Tente ver 'Todos'." 
              : `Não achei nada para "${searchTerm}"`
            }
          </p>
        </div>
      )}
    </div>
  );
}