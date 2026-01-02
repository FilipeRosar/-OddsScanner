"use client";

import { useState } from "react";
import { Match } from "@/app/types";
import { Clock, Home, ArrowRight } from "lucide-react"; 
import Image from "next/image";
import { getTeamLogoUrl } from "@/utils/teamLogos";
import OddButton from "./OddButton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import OddHistoryChart from "./OddHistoryChart";
import MatchStatsModal from "./MatchStatsModal";

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedOdd, setSelectedOdd] = useState<any>(null);
  const [statsOpen, setStatsOpen] = useState(false);

  // Helper para buscar a melhor odd
  const getBestOdd = (selection: "Home" | "Draw" | "Away") => {
    if (!match.odds) return null; // Proteção contra odds nulas
    const filtered = match.odds.filter((o) => o.selection === selection);
    if (filtered.length === 0) return null;
    return filtered.reduce((best, current) =>
      current.value > best.value ? current : best
    );
  };

  const bestHome = getBestOdd("Home");
  const bestDraw = getBestOdd("Draw");
  const bestAway = getBestOdd("Away");

  // Cálculo de Dropping Odds
  const calculateDropPercent = (selection: "Home" | "Draw" | "Away") => {
    const best = selection === "Home" ? bestHome : selection === "Draw" ? bestDraw : bestAway;
    if (!best || !best.history || best.history.length === 0) return undefined;

    const previousValue = best.history[0].value;
    if (previousValue <= 0) return undefined;

    const drop = ((previousValue - best.value) / previousValue) * 100;
    return drop > 2 ? Number(drop.toFixed(1)) : undefined;
  };

  const dropHome = calculateDropPercent("Home");
  const dropDraw = calculateDropPercent("Draw");
  const dropAway = calculateDropPercent("Away");

  const formatTime = (dateString: string) => {
    if (!dateString) return "--:--";
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- CORREÇÃO PRINCIPAL DAS LOGOS ---
  // Tenta ler a propriedade snake_case (da API) ou camelCase (se já estiver tipado assim)
  // @ts-expect-error Ignora erro de tipo se a interface Match ainda não tiver as propriedades snake_case
  const rawHomeLogo = match.home_team_logo || match.homeTeamLogo;
  // @ts-expect-error Ignora erro de tipo se a interface Match ainda não tiver as propriedades snake_case
  const rawAwayLogo = match.away_team_logo || match.awayTeamLogo;

  const homeLogo = getTeamLogoUrl(match.homeTeam, rawHomeLogo);
  const awayLogo = getTeamLogoUrl(match.awayTeam, rawAwayLogo);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden group relative flex flex-col h-full">
        {/* Barra lateral de hover */}
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badge de Surebet */}
        {match.surebetProfit && match.surebetProfit > 0 && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg z-20 animate-pulse border-2 border-white">
            SUREBET +{match.surebetProfit}%
          </div>
        )}

        {/* Badge de Live */}
        {match.isLive && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            AO VIVO
          </div>
        )}

        {/* Header do Card */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-4 py-2.5 flex justify-between items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest truncate max-w-[180px] opacity-90">
            {match.league || "Campeonato"}
          </span>
          <span className="text-xs flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            {formatTime(match.startTime)}
          </span>
        </div>

        <div className="p-5 pb-4 flex flex-col flex-1 justify-between">
          <div className="flex items-center justify-between mb-6">
            {/* Time da Casa */}
            <div className="flex flex-col items-center flex-1 text-center gap-2">
              <div className="relative group/logo">
                {/* Verifica se homeLogo existe E não é string vazia */}
                {homeLogo && homeLogo !== "" ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-white p-1.5 group-hover/logo:scale-110 transition-transform duration-300">
                    <Image
                      src={homeLogo}
                      alt={match.homeTeam || "Home Team"}
                      width={56}
                      height={56}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <Home className="w-7 h-7 text-gray-400" />
                  </div>
                )}
              </div>
              <span className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                {match.homeTeam}
              </span>
            </div>

            {/* Divisor VS */}
            <div 
              className="flex flex-col items-center px-2 cursor-pointer group/vs shrink-0"
              onClick={() => setStatsOpen(true)}
            >
              <div className="text-[10px] font-black text-gray-300 mb-1 group-hover/vs:text-indigo-500 transition-colors">STATS</div>
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center border border-gray-100 shadow-inner group-hover/vs:bg-indigo-50 transition-all">
                <span className="text-xs font-black text-gray-400 group-hover/vs:text-indigo-600">VS</span>
              </div>
            </div>

            {/* Time Visitante */}
            <div className="flex flex-col items-center flex-1 text-center gap-2">
              <div className="relative group/logo">
                {awayLogo && awayLogo !== "" ? (
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shadow-sm bg-white p-1.5 group-hover/logo:scale-110 transition-transform duration-300">
                    <Image
                      src={awayLogo}
                      alt={match.awayTeam || "Away Team"}
                      width={56}
                      height={56}
                      className="object-contain w-full h-full"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ArrowRight className="w-7 h-7 text-gray-400 rotate-180" />
                  </div>
                )}
              </div>
              <span className="text-sm font-black text-gray-800 leading-tight uppercase tracking-tight line-clamp-2 min-h-[2.5em] flex items-center justify-center">
                {match.awayTeam}
              </span>
            </div>
          </div>

          {/* Seção de Odds */}
          <div className="grid grid-cols-3 gap-3">
            <div onClick={() => bestHome && setSelectedOdd(bestHome)} className="active:scale-95 transition-transform cursor-pointer">
              <OddButton
                bestOdd={bestHome}
                allOddsForSelection={match.odds?.filter(o => o.selection === "Home") || []}
                label="1"
                icon="home"
                dropPercent={dropHome}
              />
            </div>

            <div onClick={() => bestDraw && setSelectedOdd(bestDraw)} className="active:scale-95 transition-transform cursor-pointer">
              <OddButton
                bestOdd={bestDraw}
                allOddsForSelection={match.odds?.filter(o => o.selection === "Draw") || []}
                label="X"
                icon="draw"
                dropPercent={dropDraw}
              />
            </div>

            <div onClick={() => bestAway && setSelectedOdd(bestAway)} className="active:scale-95 transition-transform cursor-pointer">
              <OddButton
                bestOdd={bestAway}
                allOddsForSelection={match.odds?.filter(o => o.selection === "Away") || []}
                label="2"
                icon="away"
                dropPercent={dropAway}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Histórico */}
      <Dialog open={!!selectedOdd} onOpenChange={() => setSelectedOdd(null)}>
        <DialogContent className="max-w-2xl bg-white p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="sr-only">
             <DialogTitle>Histórico de Odds</DialogTitle>
          </DialogHeader>
          <div className="bg-slate-900 p-6 text-white">
            <div className="text-xl font-black uppercase tracking-tight">
              Análise de Movimentação
            </div>
            <DialogDescription className="text-slate-400 text-xs mt-1">
              {selectedOdd && (
                <>
                  Mercado 1X2: <span className="text-indigo-400 font-bold">
                    {selectedOdd.selection === "Home" ? match.homeTeam :
                     selectedOdd.selection === "Away" ? match.awayTeam : "Empate"}
                  </span> na {selectedOdd.bookmakerName}
                </>
              )}
            </DialogDescription>
          </div>

          <div className="p-6">
            {selectedOdd && (
              <OddHistoryChart
                history={selectedOdd.history || []}
                bookmakerName={selectedOdd.bookmakerName}
                selection={
                  selectedOdd.selection === "Home" ? match.homeTeam :
                  selectedOdd.selection === "Draw" ? "Empate" :
                  match.awayTeam
                }
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <MatchStatsModal 
        match={match} 
        open={statsOpen} 
        onOpenChange={setStatsOpen} 
      />
    </>
  );
}