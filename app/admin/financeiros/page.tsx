"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const MONTHS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

export default function FinanceirosPage() {
  const [summary, setSummary] = useState<{ income: number; expense: number; balance: number; byMonth: { month: string; receita: number; despesa: number }[] } | null>(null);
  const [entries, setEntries] = useState<{ id: string; amount: number; description: string; date: string }[]>([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: "income" as "income" | "expense", amount: "", description: "", date: format(new Date(), "yyyy-MM-dd") });

  useEffect(() => {
    fetch(`/api/finance/summary?month=${month}&year=${year}`).then((r) => r.json()).then(setSummary);
  }, [month, year]);

  useEffect(() => {
    fetch(`/api/finance?month=${month}&year=${year}`).then((r) => r.json()).then(setEntries);
  }, [month, year]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/finance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, amount: parseFloat(form.amount) }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ type: "income", amount: "", description: "", date: format(new Date(), "yyyy-MM-dd") });
      const s = await fetch(`/api/finance/summary?month=${month}&year=${year}`).then((r) => r.json());
      setSummary(s);
      const e = await fetch(`/api/finance?month=${month}&year=${year}`).then((r) => r.json());
      setEntries(e);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Finanças</h1>
      <div className="flex gap-4 mb-6">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="text-black px-3 py-2 border rounded-lg">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="text-black px-3 py-2 border rounded-lg">
          {[year].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
          {showForm ? "Cancelar" : "+ Nova entrada"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
          <div className="flex gap-4">
            <label className="text-black"><input type="radio" name="type" checked={form.type === "income"} onChange={() => setForm({ ...form, type: "income" })} /> Receita</label>
            <label className="text-black"><input type="radio" name="type" checked={form.type === "expense"} onChange={() => setForm({ ...form, type: "expense" })} /> Despesa</label>
          </div>
          <div><label className="text-black block text-sm font-medium mb-1">Valor</label><input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required className="text-black w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="text-black block text-sm font-medium mb-1">Data</label><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="text-black w-full px-4 py-2 border rounded-lg" /></div>
          <div><label className="text-black block text-sm font-medium mb-1">Descrição</label><input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required className="text-black w-full px-4 py-2 border rounded-lg" /></div>
          <button type="submit" className="px-4 py-2 bg-amber-600 text-white rounded-lg">Salvar</button>
        </form>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4"><p className="text-sm text-green-700">Receita</p><p className="text-2xl font-bold text-green-800">R$ {summary.income.toFixed(2)}</p></div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4"><p className="text-sm text-red-700">Despesa</p><p className="text-2xl font-bold text-red-800">R$ {summary.expense.toFixed(2)}</p></div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><p className="text-sm text-amber-700">Saldo</p><p className="text-2xl font-bold text-amber-800">R$ {summary.balance.toFixed(2)}</p></div>
          </div>
          {summary.byMonth?.length > 0 && (
            <div className="bg-white rounded-lg shadow p-4 mb-6 h-80">
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={summary.byMonth}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="receita" fill="#22c55e" name="Receita" /><Bar dataKey="despesa" fill="#ef4444" name="Despesa" /></BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="text-black text-lg font-semibold p-4">Lançamentos</h2>
        <table className="w-full"><thead className="bg-gray-50"><tr><th className="text-black text-left p-3">Data</th><th className="text-black text-left p-3">Descricao</th><th className="text-black text-left p-3">Tipo</th><th className="text-black text-right p-3">Valor</th></tr></thead>
        <tbody>
          {entries.map((e) => (
            <tr key={e.id} className="border-t">
              <td className="text-gray-500 p-3">{format(new Date(e.date), "dd/MM/yyyy", { locale: ptBR })}</td>
              <td className="text-gray-500 p-3">{e.description}</td>
              <td className="p-3"><span className={e.amount > 0 ? "text-green-600" : "text-red-600"}>{e.amount > 0 ? "Receita" : "Despesa"}</span></td>
              <td className={`p-3 text-right font-medium ${e.amount > 0 ? "text-green-600" : "text-red-600"}`}>{e.amount > 0 ? "+" : ""} R$ {e.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody></table>
        {entries.length === 0 && <p className="p-4 text-gray-500 text-center">Nenhum lancamento.</p>}
      </div>
    </div>
  );
}
