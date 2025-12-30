// app/page.tsx
import { Match } from "@/app/types";
import MatchList from "@/app/components/MatchList";
import Link from "next/link";
import { Bell, Goal } from "lucide-react"; // ← Goal, não Football

async function getMatches(): Promise<Match[]> {
  try {
    const res = await fetch("http://localhost:5175/api/matches", {
      cache: "no-store",
      next: { revalidate: 30 },
    });

    if (!res.ok) throw new Error("Falha ao buscar jogos");
    return res.json();
  } catch (error) {
    console.error("Erro ao carregar matches:", error);
    return [];
  }
}

export default async function Home() {
  const matches = await getMatches();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Goal className="w-10 h-10 text-indigo-600" strokeWidth={2} />
            <h1 className="text-2xl font-black tracking-tight">
              <span className="text-slate-400">Odds</span>
              <span className="text-indigo-600">Scanner</span>
            </h1>
          </Link>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-bold">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Ao Vivo
            </div>

            <div className="text-sm text-slate-600">
              <strong className="text-indigo-600 font-bold">{matches.length}</strong> jogos monitorados
            </div>

            <Link
              href="/alertas"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              <Bell className="w-5 h-5" />
              Alertas Grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Mercado de Apostas em Tempo Real
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encontre as melhores odds, value bets e oportunidades de lucro garantido com surebets.
          </p>
        </div>

        <MatchList initialMatches={matches} />
      </section>
    </main>
  );
}