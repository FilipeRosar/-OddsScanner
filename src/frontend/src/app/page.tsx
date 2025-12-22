import MatchCard from "@/app/components/MatchCard";
import { Match } from "@/app/types";

const API_URL = "http://localhost:5175/api/Matches";

async function getMatches(): Promise<Match[]> {
  try {
    // cache: 'no-store' garante que ele sempre busque dados novos (como o Redis faz no backend)
    const res = await fetch(API_URL, { cache: 'no-store' });
    
    if (!res.ok) {
      throw new Error('Falha ao buscar jogos');
    }
    
    return res.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 py-6 px-8 mb-8 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Odds<span className="text-indigo-600">Scanner</span> ⚽
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitorando oportunidades em tempo real
            </p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
               <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
               Ao Vivo
             </div>
          </div>
        </div>
      </header>

      {/* Grid de Jogos */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <h2 className="text-xl text-slate-600 font-semibold">Nenhum jogo encontrado 😕</h2>
            <p className="text-slate-500 mt-2">Verifique se a API está rodando na porta correta.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}