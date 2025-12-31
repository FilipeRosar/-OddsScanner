// src/app/components/MatchStatsModal.tsx
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";
import { Trophy, TrendingUp, Target, Shield } from "lucide-react";
import { Match } from "@/app/types";

interface MatchStatsModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MatchStatsModal({ match, open, onOpenChange }: MatchStatsModalProps) {
  const getResultColor = (result: "W" | "D" | "L") => {
    switch (result) {
      case "W": return "bg-emerald-100 text-emerald-800 border-2 border-emerald-300";
      case "D": return "bg-slate-100 text-slate-800 border-2 border-slate-300";
      case "L": return "bg-red-100 text-red-800 border-2 border-red-300";
      default: return "bg-gray-100 text-gray-800 border-2 border-gray-300";
    }
  };

  const getWinnerText = (winner: "home" | "away" | "draw") => {
    switch (winner) {
      case "home": return match.homeTeam;
      case "away": return match.awayTeam;
      case "draw": return "Empate";
      default: return "Empate";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-2xl md:text-3xl font-black text-center text-slate-900 dark:text-slate-100">
            Estatísticas: {match.homeTeam} vs {match.awayTeam}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Head-to-Head */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-inner">
            <h3 className="text-xl font-black flex items-center gap-3 mb-6 text-slate-800 dark:text-slate-200">
              <Trophy className="w-7 h-7 text-yellow-600" />
              Head-to-Head (últimos jogos)
            </h3>
            {match.headToHead && match.headToHead.length > 0 ? (
              <div className="space-y-4">
                {match.headToHead.map((game, i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      {new Date(game.date).toLocaleDateString('pt-BR')}
                    </span>
                    <div className="flex items-center gap-6 font-black text-lg">
                      <span className="text-blue-600">{game.homeScore}</span>
                      <span className="text-slate-400">x</span>
                      <span className="text-red-600">{game.awayScore}</span>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {getWinnerText(game.winner)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-12">
                Sem histórico disponível
              </p>
            )}
          </div>

          {/* Forma recente */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-6 shadow-inner">
            <h3 className="text-xl font-black flex items-center gap-3 mb-6 text-slate-800 dark:text-slate-200">
              <TrendingUp className="w-7 h-7 text-indigo-600" />
              Forma Recente (últimos 5 jogos)
            </h3>
            <div className="space-y-8">
              <div>
                <p className="font-black text-xl text-blue-600 mb-3">{match.homeTeam}</p>
                <div className="flex gap-3 justify-center">
                  {match.homeForm && match.homeForm.length > 0 ? (
                    match.homeForm.map((game, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${getResultColor(game.result)}`}
                      >
                        {game.result}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      Sem dados
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="font-black text-xl text-red-600 mb-3">{match.awayTeam}</p>
                <div className="flex gap-3 justify-center">
                  {match.awayForm && match.awayForm.length > 0 ? (
                    match.awayForm.map((game, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-lg ${getResultColor(game.result)}`}
                      >
                        {game.result}
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-slate-500 dark:text-slate-400">
                      Sem dados
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Médias reais do backend */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 rounded-2xl p-8 shadow-inner">
          <div className="text-center">
            <Target className="w-12 h-12 mx-auto text-indigo-600 mb-3" />
            <p className="text-4xl font-black text-indigo-800 dark:text-indigo-300">
              {match.avgGoals != null && !isNaN(match.avgGoals)
                ? Number(match.avgGoals).toFixed(1)
                : "-"}
            </p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
              Média de gols por jogo
            </p>
          </div>

          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto text-purple-600 mb-3" />
            <p className="text-4xl font-black text-purple-800 dark:text-purple-300">
              {match.avgCorners != null && !isNaN(match.avgCorners)
                ? Number(match.avgCorners).toFixed(1)
                : "-"}
            </p>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mt-1">
              Média de escanteios
            </p>
          </div>

          <div className="text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-emerald-600 mb-3" />
            <p className="text-2xl font-black text-emerald-800 dark:text-emerald-300">
              Over 2.5
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {match.avgGoals > 2.5 ? "comum (~65%)" : "raro (~45%)"}
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 mx-auto bg-orange-100 dark:bg-orange-900/50 rounded-full flex items-center justify-center mb-3">
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">BTTS</span>
            </div>
            <p className="text-2xl font-black text-orange-800 dark:text-orange-300">
              Ambos marcam
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              {match.avgGoals > 2.7 ? "frequente (~70%)" : "moderado (~50%)"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}