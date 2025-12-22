import { Match } from "@/app/types/index";
import MatchList from "@/app/components/MatchList";

// Função para buscar dados da API
async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch('http://localhost:5175/api/matches', { 
      cache: 'no-store' 
    });
    
    if (!res.ok) throw new Error('Falha ao buscar jogos');
    
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
      {/* Header Bonito */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚽</span>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">
              Odds<span className="text-indigo-600">Scanner</span>
            </h1>
          </div>
          <div className="text-sm text-slate-500">
            Monitorando <strong className="text-indigo-600">{matches.length}</strong> jogos
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-800">Mercado de Apostas</h2>
          <p className="text-slate-500">Compare odds e encontre valor em tempo real.</p>
        </div>

        {/* Aqui entra nosso componente interativo */}
        <MatchList initialMatches={matches} />
      </div>
    </main>
  );
}