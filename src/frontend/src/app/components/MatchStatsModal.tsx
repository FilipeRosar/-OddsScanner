"use client";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/app/components/ui/dialog";
import { Trophy, TrendingUp, Target, Shield, Zap } from "lucide-react";
import { Match } from "@/app/types";
import Image from "next/image";

interface MatchStatsModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MatchStatsModal({ match, open, onOpenChange }: MatchStatsModalProps) {
  const homeLogo = match.homeTeamLogo || null;
  const awayLogo = match.awayTeamLogo || null;

  const getResultColor = (result: "W" | "D" | "L") => {
    switch (result) {
      case "W": return "bg-emerald-500 text-white shadow-lg shadow-emerald-200/50";
      case "D": return "bg-slate-400 text-white shadow-lg shadow-slate-200/50";
      case "L": return "bg-rose-500 text-white shadow-lg shadow-rose-200/50";
      default: return "bg-gray-100 text-gray-400";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-0 border-none shadow-2xl">
        {/* Acessibilidade */}
        <DialogHeader className="sr-only">
          <DialogTitle>Estatísticas: {match.homeTeam} vs {match.awayTeam}</DialogTitle>
          <DialogDescription>Dados reais de performance, H2H e médias.</DialogDescription>
        </DialogHeader>

        {/* Hero Section com logos e VS */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
          <div className="relative z-10 flex items-center justify-around w-full">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center">
                {homeLogo ? (
                  <Image src={homeLogo} alt={match.homeTeam} width={96} height={96} className="object-contain" unoptimized />
                ) : (
                  <Shield className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <span className="text-lg font-black uppercase tracking-tighter text-center">{match.homeTeam}</span>
            </div>

            <div className="flex flex-col items-center">
              <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400 animate-pulse" />
              <span className="text-xs font-black uppercase mt-2 text-yellow-300">VS</span>
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-3xl p-3 shadow-2xl flex items-center justify-center">
                {awayLogo ? (
                  <Image src={awayLogo} alt={match.awayTeam} width={96} height={96} className="object-contain" unoptimized />
                ) : (
                  <Shield className="w-12 h-12 text-slate-300" />
                )}
              </div>
              <span className="text-lg font-black uppercase tracking-tighter text-center">{match.awayTeam}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Métricas principais */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'GOLS / JOGO', val: match.avgGoals, icon: Target, color: 'text-indigo-600' },
              { label: 'ESCANTEIOS', val: match.avgCorners, icon: Shield, color: 'text-purple-600' },
              { label: 'OVER 2.5', val: (match.avgGoals || 0) > 2.5 ? 'Provável' : 'Baixo', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'AMBOS MARCAM', val: (match.avgGoals || 0) > 2.7 ? 'Sim' : 'Talvez', icon: Zap, color: 'text-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-md">
                <stat.icon className={`w-8 h-8 ${stat.color} mb-3`} />
                <span className="text-3xl font-black text-slate-800">
                  {stat.val && stat.val !== 0 ? (typeof stat.val === 'number' ? stat.val.toFixed(1) : stat.val) : '--'}
                </span>
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest mt-2">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Confrontos Diretos */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-3 mb-5 text-lg">
                <Trophy className="w-6 h-6 text-amber-500" /> CONFRONTOS DIRETOS
              </h3>
              <div className="space-y-3">
                {match.headToHead && match.headToHead.length > 0 ? (
                  match.headToHead.slice(0, 5).map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-xs font-bold text-slate-400">
                        {new Date(game.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-4 font-black text-lg">
                        <span>{game.homeScore}</span>
                        <span className="text-slate-300">-</span>
                        <span>{game.awayScore}</span>
                      </div>
                      <span className={`text-xs font-black uppercase px-3 py-1 rounded-full ${game.winner === 'draw' ? 'bg-slate-200 text-slate-600' : 'bg-indigo-100 text-indigo-700'}`}>
                        {game.winner === 'draw' ? 'Empate' : game.winner === 'home' ? match.homeTeam : match.awayTeam}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-slate-400 italic">
                    Sem histórico recente
                  </div>
                )}
              </div>
            </div>

            {/* Últimos Resultados (Forma Recente) */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-3 mb-5 text-lg">
                <TrendingUp className="w-6 h-6 text-indigo-500" /> ÚLTIMOS RESULTADOS
              </h3>
              <div className="space-y-6">
                {[
                  { name: match.homeTeam, form: match.homeForm, color: 'text-blue-600' },
                  { name: match.awayTeam, form: match.awayForm, color: 'text-rose-600' }
                ].map((team, idx) => (
                  <div key={idx}>
                    <p className={`text-sm font-black uppercase mb-3 ${team.color}`}>{team.name}</p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      {team.form && team.form.length > 0 ? (
                        team.form.map((f, i) => (
                          <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-transform hover:scale-110 ${getResultColor(f.result)}`}>
                            {f.result}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic text-sm">
                          Sem dados de forma recente
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}