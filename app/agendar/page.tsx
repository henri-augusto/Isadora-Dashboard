"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

type BraidStyle = { id: string; name: string; description?: string | null; basePrice: number };
type Color = { id: string; name: string; hexCode: string };

export default function AgendarPage() {
  const [step, setStep] = useState(1);
  const [styles, setStyles] = useState<BraidStyle[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    time: "",
    braidStyleId: "",
    colorId: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/braid-styles").then((r) => r.json()).then(setStyles);
    fetch("/api/colors").then((r) => r.json()).then(setColors);
  }, []);

  useEffect(() => {
    if (form.date) {
      fetch(`/api/appointments?forBooking=true&date=${form.date}`).then((r) => r.json()).then((data) => setBookedTimes(data.bookedTimes || []));
    } else {
      setBookedTimes([]);
    }
  }, [form.date]);

  const availableSlots = TIME_SLOTS.filter((t) => !bookedTimes.includes(t));
  const minDate = format(new Date(), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Erro ao agendar");
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-jade-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-4">Agendamento realizado!</h1>
          <p className="text-gray-600 mb-6">Seu horário foi reservado. Em breve entraremos em contato para confirmar.</p>
          <Link href="/" className="inline-block px-6 py-2 bg-jade-500 text-white rounded-lg hover:bg-jade-400">Voltar ao início</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-jade-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-jade-500 text-center mb-2">Agendar Horário</h1>
        <p className="text-center text-gray-600 mb-8">Escolha data, horário, estilo e cor das tranças</p>

        <div className="flex gap-2 mb-6">
          <span className={`px-3 py-1 rounded ${step >= 1 ? "bg-jade-500 text-white" : "bg-gray-200"}`}>1. data e horário</span>
          <span className={`px-3 py-1 rounded ${step >= 2 ? "bg-jade-500 text-white" : "bg-gray-200"}`}>2. estilo e cor</span>
          <span className={`px-3 py-1 rounded ${step >= 3 ? "bg-jade-500 text-white" : "bg-gray-200"}`}>3. contato</span>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} min={minDate} max={maxDate} required className="bg-jade-500 w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Horário</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((t) => (
                    <button key={t} type="button" onClick={() => setForm({ ...form, time: t })} className={`text-black px-3 py-2 rounded-lg border ${form.time === t ? "bg-jade-500 text-white border-jade-500" : "hover:bg-jade-50"}`}>{t}</button>
                  ))}
                </div>
                {form.date && availableSlots.length === 0 && <p className="text-sm text-gray-500 mt-1">Nenhum horario disponivel nesta data.</p>}
              </div>
              <button type="button" onClick={() => form.date && form.time && setStep(2)} disabled={!form.date || !form.time} className="w-full py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50">Continuar</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estilo da trança</label>
                <select value={form.braidStyleId} onChange={(e) => setForm({ ...form, braidStyleId: e.target.value })} required className="bg-jade-500 w-full px-4 py-2 border rounded-lg">
                  <option value="">Selecione</option>
                  {styles.map((s) => <option key={s.id} value={s.id}>{s.name} - R$ {s.basePrice.toFixed(2)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor desejada</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, colorId: c.id })} className={`text-black flex items-center gap-2 px-3 py-2 rounded-lg border ${form.colorId === c.id ? "ring-2 ring-jade-500" : ""}`}>
                      <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hexCode }} />
                      <span>{c.name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(1)} className="text-black px-4 py-2 border rounded-lg">Voltar</button>
                <button type="button" onClick={() => form.braidStyleId && form.colorId && setStep(3)} disabled={!form.braidStyleId || !form.colorId} className="flex-1 py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50">Continuar</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} required className="text-black w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label><input type="tel" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} required className="text-black w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={form.clientEmail} onChange={(e) => setForm({ ...form, clientEmail: e.target.value })} required className="text-black w-full px-4 py-2 border rounded-lg" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Observacoes (opcional)</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} className="text-black w-full px-4 py-2 border rounded-lg" /></div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep(2)} className="text-black px-4 py-2 border rounded-lg">Voltar</button>
                <button type="submit" disabled={loading} className="flex-1 py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50">{loading ? "Enviando..." : "Confirmar agendamento"}</button>
              </div>
            </div>
          )}
        </form>

        <p className="text-center mt-6">
          <Link href="/" className="text-jade-500 hover:underline">Voltar ao início</Link>
        </p>
      </div>
    </main>
  );
}
