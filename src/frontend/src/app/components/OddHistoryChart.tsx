import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OddHistoryChartProps {
  history: { value: number; recordedAt: string }[];
  bookmakerName: string;
  selection: string;
}

export default function OddHistoryChart({ history, bookmakerName, selection }: OddHistoryChartProps) {
  if (!history || history.length === 0) {
    return <p className="text-center text-slate-500 py-8">Histórico indisponível</p>;
  }

  // Formata dados para o gráfico
  const data = history
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((h) => ({
      time: new Date(h.recordedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: Number(h.value.toFixed(2)),
    }));

  const currentValue = data[data.length - 1]?.value || 0;
  const initialValue = data[0]?.value || 0;
  const change = ((currentValue - initialValue) / initialValue) * 100;

  return (
    <div className="w-full">
      <div className="mb-4 text-center">
        <p className="text-sm text-slate-600">
          Movimento da odd: <strong>{selection}</strong> na <strong>{bookmakerName}</strong>
        </p>
        <p className={`text-lg font-bold mt-2 ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-600'}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}% desde a abertura
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            domain={['dataMin - 0.05', 'dataMax + 0.05']}
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value) => {
                return typeof value === 'number' ? value.toFixed(2) : String(value);
            }}
            />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}