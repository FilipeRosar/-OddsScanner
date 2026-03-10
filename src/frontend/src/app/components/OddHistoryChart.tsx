import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface OddHistoryChartProps {
  history: { value: number; recordedAt: string }[];
  bookmakerName: string;
  selection: string;
  currentValue: number; // Adicione o valor atual da odd como prop
}

export default function OddHistoryChart({ history, bookmakerName, selection, currentValue }: OddHistoryChartProps) {
  // Sempre inclui o valor atual como último ponto
  const fullHistory = [
    ... (history || []).map(h => ({
      time: new Date(h.recordedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      value: Number(h.value.toFixed(2)),
    })),
    {
      time: "Agora",
      value: Number(currentValue.toFixed(2)),
    }
  ].sort((a, b) => {
    // Ordena por tempo (Agora sempre último)
    if (a.time === "Agora") return 1;
    if (b.time === "Agora") return -1;
    return a.time.localeCompare(b.time);
  });

  if (fullHistory.length === 1) {
    // Apenas valor atual → mostra mensagem + valor único
    return (
      <div className="text-center py-12">
        <p className="text-slate-500 mb-4">Sem movimentação detectada</p>
        <p className="text-3xl font-black text-indigo-600">
          {currentValue.toFixed(2)}
        </p>
        <p className="text-sm text-slate-600 mt-2">
          Odd atual na <strong>{bookmakerName}</strong> ({selection})
        </p>
      </div>
    );
  }

  const initialValue = fullHistory[0].value;
  const change = ((currentValue - initialValue) / initialValue) * 100;

  return (
    <div className="w-full">
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-600">
          Movimento da odd: <strong>{selection}</strong> na <strong>{bookmakerName}</strong>
        </p>
        <p className={`text-2xl font-black mt-3 ${change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-slate-600'}`}>
          {change > 0 ? '+' : ''}{change.toFixed(1)}% desde a primeira detecção
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={fullHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
            stroke="#666"
          />
          <YAxis 
            domain={['dataMin - 0.1', 'dataMax + 0.1']}
            tick={{ fontSize: 12 }}
            stroke="#666"
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}
            labelStyle={{ color: '#e2e8f0' }}
            formatter={(value?: number) => (value !== undefined ? value.toFixed(2) : '')}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#8b5cf6" 
            strokeWidth={4}
            dot={{ fill: '#8b5cf6', r: 6 }}
            activeDot={{ r: 10 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}