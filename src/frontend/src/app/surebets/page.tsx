import { Metadata } from 'next';
import MatchList from '@/app/components/MatchList';
import Link from 'next/link';
import { Bell } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Surebets Brasil - Lucro Garantido em Tempo Real | OddsScanner',
  description: 'Encontre surebets ativas no Brasileirão e ligas internacionais. Aposte nos 3 resultados e garanta lucro independente do resultado. Alertas gratuitos!',
  keywords: 'surebets brasil, surebet hoje, lucro garantido apostas, arbitrage betting brasil, surebets brasileirão',
  openGraph: {
    title: 'Surebets ao Vivo - Lucro Garantido | OddsScanner',
    description: 'Surebets detectadas em tempo real com +5% de lucro garantido.',
    url: 'https://odds-scanner.vercel.app/surebets',
  },
};

export default async function SurebetsPage() {
  // Busca apenas jogos com surebet
  const res = await fetch('http://localhost:5175/api/matches?surebetOnly=true', {
    cache: 'no-store',
  });
  const matches = await res.json();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <section className="max-w-7xl mx-auto px-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
          Surebets <span className="text-emerald-600">Lucro Garantido</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
          Aposte nos 3 resultados em casas diferentes e <strong>ganhe independente do resultado</strong>.<br />
          Receba alertas gratuitos quando uma surebet aparecer!
        </p>
        <Link
          href="/alertas"
          className="inline-flex items-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-4 rounded-xl text-lg shadow-lg transition-all"
        >
          <Bell className="w-6 h-6" />
          Receber Alertas de Surebet Grátis
        </Link>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-600">Nenhuma surebet ativa no momento</p>
            <p className="text-lg text-slate-500 mt-4">Volte em breve ou ative os alertas!</p>
          </div>
        ) : (
          <>
            <p className="text-center text-lg text-slate-600 mb-8">
              {matches.length} surebet{matches.length > 1 ? 's' : ''} detectada{matches.length > 1 ? 's' : ''} agora
            </p>
            <MatchList initialMatches={matches} />
          </>
        )}
      </section>
    </main>
  );
}