'use client';
import { useState } from "react";
import { Bell, Mail, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function AlertSubscriptionPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setStatus("error");
      setMessage("Por favor, insira um email válido");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setMessage("Inscrito com sucesso! Você receberá alertas de surebets por email.");
        setEmail("");
      } else {
        const error = await res.json();
        setStatus("error");
        setMessage(error.message || "Erro ao inscrever. Tente novamente.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("Erro de conexão. Verifique sua internet.");
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Voltar */}
        <Link href="/" className="flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Voltar para o scanner
        </Link>
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-10 h-10 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Alertas de Surebets</h1>
            <p className="text-slate-600 mt-3 text-lg">
              Receba notificações instantâneas quando aparecer uma surebet — lucro garantido!
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Seu melhor email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  disabled={status === "loading"}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold py-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all transform hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {status === "loading" ? "Inscrevendo..." : "Receber Alertas Grátis"}
            </button>
          </form>
          {/* Status */}
          {status === "success" && (
            <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-3 text-emerald-700">
              <CheckCircle className="w-6 h-6" />
              <p className="font-medium">{message}</p>
            </div>
          )}
          {status === "error" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
              <AlertCircle className="w-6 h-6" />
              <p className="font-medium">{message}</p>
            </div>
          )}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-sm text-slate-600">
              Também ative notificações no navegador para alertas instantâneos:
            </p>
           <button
            onClick={async () => {
                // Verifica se OneSignal está carregado e tem o método
                if (window.OneSignal && "showNativePrompt" in window.OneSignal) {
                try {
                    // Type assertion segura
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    await (window.OneSignal as any).showNativePrompt();
                    alert("✅ Notificações ativadas! Você receberá alertas de surebets em tempo real.");
                } catch (err) {
                    alert("❌ Erro ao ativar notificações. Tente novamente.");
                }
                } else {
                alert("⏳ OneSignal ainda carregando. Tente novamente em alguns segundos.");
                }
            }}
            className="mt-3 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-all"
            >
            Ativar Notificações no Navegador
            </button>
          </div>
          <p className="text-center text-xs text-slate-500 mt-8">
            Zero spam. Apenas alertas de surebets reais. Cancele quando quiser.
          </p>
        </div>
      </div>
    </div>
  );
}