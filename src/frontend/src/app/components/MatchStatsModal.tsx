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
import { getTeamLogoUrl } from "@/utils/teamLogos";

interface MatchStatsModalProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MatchStatsModal({ match, open, onOpenChange }: MatchStatsModalProps) {
  // Fallbacks de segurança para URLs de imagem
  const homeLogo = getTeamLogoUrl(match.homeTeam, match.homeTeamLogo) || null;
  const awayLogo = getTeamLogoUrl(match.awayTeam, match.awayTeamLogo) || null;

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
        
        {/* CORREÇÃO ACESSIBILIDADE: Header sempre com Title e Description */}
        <DialogHeader className="sr-only">
          <DialogTitle>Estatísticas: {match.homeTeam} vs {match.awayTeam}</DialogTitle>
          <DialogDescription>Dados de performance, H2H e médias de gols/escanteios.</DialogDescription>
        </DialogHeader>

        {/* Topo Visual (Hero Section) */}
        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')]" />
          <div className="relative z-10 flex items-center justify-around w-full">
            
            {/* Home Team */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl p-2 shadow-2xl flex items-center justify-center">
                {homeLogo ? (
                  <Image src={homeLogo} alt={match.homeTeam} width={80} height={80} className="object-contain" unoptimized />
                ) : (
                  <Shield className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <span className="text-sm font-black uppercase tracking-tighter text-center">{match.homeTeam}</span>
            </div>

            <div className="flex flex-col items-center opacity-50">
              <span className="text-xs font-black mb-1">VS</span>
              <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-2xl p-2 shadow-2xl flex items-center justify-center">
                {awayLogo ? (
                  <Image src={awayLogo} alt={match.awayTeam} width={80} height={80} className="object-contain" unoptimized />
                ) : (
                  <Shield className="w-10 h-10 text-slate-300" />
                )}
              </div>
              <span className="text-sm font-black uppercase tracking-tighter text-center">{match.awayTeam}</span>
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {/* Métricas: Gols, Cantos, Over, BTTS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Gols / Jogo', val: match.avgGoals, icon: Target, color: 'text-indigo-600' },
              { label: 'Escanteios', val: match.avgCorners, icon: Shield, color: 'text-purple-600' },
              { label: 'Over 2.5', val: (match.avgGoals || 0) > 2.5 ? 'Provável' : 'Baixo', icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Ambos Marcam', val: (match.avgGoals || 0) > 2.7 ? 'Sim' : 'Talvez', icon: Zap, color: 'text-orange-600' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center shadow-sm">
                <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                <span className="text-2xl font-black text-slate-800">
                  {stat.val && stat.val !== 0 ? (typeof stat.val === 'number' ? stat.val.toFixed(1) : stat.val) : '--'}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card H2H */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-amber-500" /> CONFRONTOS DIRETOS
              </h3>
              <div className="space-y-3">
                {match.headToHead && match.headToHead.length > 0 ? (
                  match.headToHead.slice(0, 5).map((game, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400">{new Date(game.date).getFullYear()}</span>
                      <div className="flex items-center gap-3 font-mono font-black text-slate-700">
                        <span>{game.homeScore}</span>
                        <span className="text-slate-300">-</span>
                        <span>{game.awayScore}</span>
                      </div>
                      <span className={`text-[10px] font-black uppercase ${game.winner === 'draw' ? 'text-slate-400' : 'text-indigo-600'}`}>
                        {game.winner === 'draw' ? 'Empate' : 'Vitória'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 opacity-40">Sem histórico recente</div>
                )}
              </div>
            </div>

            {/* Card Forma Recente */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-black text-slate-800 flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-indigo-500" /> ÚLTIMOS RESULTADOS
              </h3>
              <div className="space-y-6">
                {[
                  { name: match.homeTeam, form: match.homeForm, color: 'text-blue-600' },
                  { name: match.awayTeam, form: match.awayForm, color: 'text-rose-600' }
                ].map((team, idx) => (
                  <div key={idx}>
                    <p className={`text-[10px] font-black uppercase mb-2 ${team.color}`}>{team.name}</p>
                    <div className="flex gap-2">
                      {team.form && team.form.length > 0 ? (
                        team.form.map((f, i) => (
                          <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black transition-transform hover:scale-110 ${getResultColor(f.result)}`}>
                            {f.result}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-300 text-[10px] italic">Sem dados de forma recente</span>
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