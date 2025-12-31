import { Match } from "@/app/types";
import MatchList from "@/app/components/MatchList";
import Link from "next/link";
import { Bell, Goal } from "lucide-react";

async function getMatches(): Promise<Match[]> {
  try {
    // Nota: Em produção, substitua localhost pela URL da sua API hospedada
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Lista de Partidas e Odds em Tempo Real",
    "itemListElement": matches.slice(0, 15).map((match, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SportsEvent",
        "name": `${match.homeTeam} vs ${match.awayTeam}`,
        "startDate": match.startTime,
        "homeTeam": { "@type": "SportsTeam", "name": match.homeTeam },
        "awayTeam": { "@type": "SportsTeam", "name": match.awayTeam },
        "sport": "Soccer"
      }
    }))
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Script de SEO Técnico */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo - Semântica: Div ou Span, para deixar o H1 para o conteúdo principal */}
          <Link href="/" className="flex items-center gap-3">
            <Goal className="w-10 h-10 text-indigo-600" strokeWidth={2} />
            <div className="text-2xl font-black tracking-tight">
              <span className="text-slate-400">Odds</span>
              <span className="text-indigo-600">Scanner</span>
            </div>
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
          {/* SEO: Título Principal H1 da Página */}
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            Mercado de Apostas em Tempo Real
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Encontre as melhores odds, value bets e oportunidades de lucro garantido com nosso scanner de arbitragem.
          </p>
        </div>

        <MatchList initialMatches={matches} />
      </section>
    </main>
  );
}