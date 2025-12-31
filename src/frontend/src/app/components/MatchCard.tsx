// src/app/components/MatchCard.tsx
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

  const getBestOdd = (selection: "Home" | "Draw" | "Away") => {
    const filtered = match.odds.filter((o) => o.selection === selection);
    if (filtered.length === 0) return null;
    return filtered.reduce((best, current) =>
      current.value > best.value ? current : best
    );
  };

  const bestHome = getBestOdd("Home");
  const bestDraw = getBestOdd("Draw");
  const bestAway = getBestOdd("Away");

  const calculateDropPercent = (selection: "Home" | "Draw" | "Away") => {
    const best = selection === "Home" ? bestHome : selection === "Draw" ? bestDraw : bestAway;
    if (!best || !best.history || best.history.length === 0) return undefined;

    const previousValue = best.history[best.history.length - 1].value;
    if (previousValue <= 0) return undefined;

    const drop = ((previousValue - best.value) / previousValue) * 100;
    return drop > 0 ? Number(drop.toFixed(1)) : undefined;
  };

  const dropHome = calculateDropPercent("Home");
  const dropDraw = calculateDropPercent("Draw");
  const dropAway = calculateDropPercent("Away");

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const surebetProfit = match.surebetProfit;

  const homeLogo = getTeamLogoUrl(match.homeTeam);
  const awayLogo = getTeamLogoUrl(match.awayTeam);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-md border border-gray-200 hover:shadow-2xl transition-all duration-300 overflow-hidden group">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-emerald-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {surebetProfit && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-2xl z-20 animate-pulse border-2 border-white">
            SUREBET +{surebetProfit}%
          </div>
        )}

        {match.isLive && (
          <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg z-20 animate-pulse">
            <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
            <span className="w-2 h-2 bg-white rounded-full absolute"></span>
            AO VIVO
          </div>
        )}

        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2.5 flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider truncate max-w-[200px]">
            {match.league}
          </span>
          <span className="text-xs flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {formatTime(match.startTime)}
          </span>
        </div>

        <div className="p-5 pb-4">
          <div className="flex items-center justify-between mb-6">
            {/* Time da Casa */}
            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-right">
                <div className="flex items-center justify-end gap-3">
                  <span className="text-lg font-extrabold text-blue-600 truncate max-w-[120px]">
                    {match.homeTeam}
                  </span>
                  {homeLogo ? (
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-blue-200 shadow-lg bg-white p-1">
                      <Image
                        src={homeLogo}
                        alt={match.homeTeam}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-blue-100 border-2 border-blue-300 flex items-center justify-center">
                      <Home className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div 
              className="text-lg font-black text-indigo-600 uppercase tracking-widest mx-4 cursor-pointer hover:text-indigo-800 transition-colors"
              onClick={() => setStatsOpen(true)}
            >
              VS
            </div>

            {/* Time Visitante */}
            <div className="flex items-center gap-3 flex-1">
              <div className="text-left">
                <div className="flex items-center gap-3">
                  {awayLogo ? (
                    <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-red-200 shadow-lg bg-white p-1">
                      <Image
                        src={awayLogo}
                        alt={match.awayTeam}
                        width={44}
                        height={44}
                        className="object-contain w-full h-full"
                        unoptimized
                      />
                    </div>
                  ) : (
                    <div className="w-11 h-11 rounded-full bg-red-100 border-2 border-red-300 flex items-center justify-center">
                      <ArrowRight className="w-7 h-7 text-red-600 rotate-180" />
                    </div>
                  )}
                  <span className="text-lg font-extrabold text-red-600 truncate max-w-[120px]">
                    {match.awayTeam}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Odds 1X2 com clique para abrir gráfico */}
          <div className="grid grid-cols-3 gap-3">
            <div onClick={() => bestHome && setSelectedOdd(bestHome)} className="cursor-pointer">
              <OddButton
                bestOdd={bestHome}
                allOddsForSelection={match.odds.filter(o => o.selection === "Home")}
                label="1"
                icon="home"
                dropPercent={dropHome}
              />
            </div>

            <div onClick={() => bestDraw && setSelectedOdd(bestDraw)} className="cursor-pointer">
              <OddButton
                bestOdd={bestDraw}
                allOddsForSelection={match.odds.filter(o => o.selection === "Draw")}
                label="X"
                icon="draw"
                dropPercent={dropDraw}
              />
            </div>

            <div onClick={() => bestAway && setSelectedOdd(bestAway)} className="cursor-pointer">
              <OddButton
                bestOdd={bestAway}
                allOddsForSelection={match.odds.filter(o => o.selection === "Away")}
                label="2"
                icon="away"
                dropPercent={dropAway}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal com gráfico de histórico */}
      <Dialog open={!!selectedOdd} onOpenChange={() => setSelectedOdd(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Histórico de Movimento da Odd</DialogTitle>
            <DialogDescription>
              {selectedOdd && (
                <>
                  {selectedOdd.selection === "Home" && match.homeTeam}
                  {selectedOdd.selection === "Draw" && "Empate"}
                  {selectedOdd.selection === "Away" && match.awayTeam}
                  {' '}na <strong>{selectedOdd.bookmakerName}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

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
          <MatchStatsModal 
          match={match} 
          open={statsOpen} 
          onOpenChange={setStatsOpen} 
        />
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