import { Metadata } from 'next';
import MatchList from '@/app/components/MatchList';

export const metadata: Metadata = {
  title: 'Value Bets Hoje - Melhores Oportunidades Brasileirão | OddsScanner',
  description: 'Encontre value bets com +5% de valor esperado. As melhores odds destacadas automaticamente em todos os jogos do Brasileirão.',
  keywords: 'value bet, value bets hoje, melhores odds brasileirão, apostas com valor, edge apostas',
  openGraph: {
    title: 'Value Bets ao Vivo - Encontre o Melhor Valor | OddsScanner',
    description: 'Value bets detectadas automaticamente com cálculo de valor esperado.',
    url: 'https://odds-scanner.vercel.app/value-bets',
  },
};

export default async function ValueBetsPage() {
  const res = await fetch('http://localhost:5175/api/matches?valueBetOnly=true', { cache: 'no-store' });
  const matches = await res.json();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12">
      <section className="max-w-7xl mx-auto px-4 text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6">
          Value Bets <span className="text-orange-600">+Valor Esperado</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-4xl mx-auto mb-8">
          Encontre odds com <strong>valor esperado positivo</strong> — as apostas mais lucrativas a longo prazo.<br />
          Destaques automáticos nas melhores oportunidades do Brasileirão.
        </p>
      </section>

      <section className="max-w-7xl mx-auto px-4">
        {matches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-slate-600">Nenhuma value bet forte no momento</p>
            <p className="text-lg text-slate-500 mt-4">As melhores odds são atualizadas a cada 30 minutos.</p>
          </div>
        ) : (
          <>
            <p className="text-center text-lg text-slate-600 mb-8">
              {matches.length} jogo{matches.length > 1 ? 's' : ''} com value bet detectado
            </p>
            <MatchList initialMatches={matches} />
          </>
        )}
      </section>
    </main>
  );
}