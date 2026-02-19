"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";

type Appointment = {
  id: string;
  date: string;
  time: string;
  status: string;
  notes?: string | null;
  client: { name: string; phone: string; email: string };
  braidStyle: { name: string };
  color: { name: string };
};

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    fetch(`/api/appointments?date=${dateStr}`).then((r) => r.json()).then((data) => { setAppointments(data); setLoading(false); }).catch(() => setLoading(false));
  }, [selectedDate]);

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/appointments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) {
      const apt = await res.json();
      setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, ...apt } : a)));
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Agenda</h1>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {weekDays.map((d) => (
          <button key={d.toISOString()} onClick={() => setSelectedDate(d)} className={`text-gray-500 flex-shrink-0 px-4 py-2 rounded-lg font-medium ${isSameDay(d, selectedDate) ? "bg-jade-500 text-white" : "bg-white border hover:bg-jade-50"}`}>
            {format(d, "EEE dd", { locale: ptBR })}
          </button>
        ))}
      </div>
      <div className="text-black aflex gap-2 mb-4">
        <button onClick={() => setSelectedDate((prev) => addDays(prev, -7))} className="px-3 py-1 border rounded-lg">Semana anterior</button>
        <button onClick={() => setSelectedDate((prev) => addDays(prev, 7))} className="px-3 py-1 border rounded-lg">Próxima semana</button>
        <button onClick={() => setSelectedDate(new Date())} className="px-3 py-1 border rounded-lg">Hoje</button>
      </div>
      <h2 className="text-black text-lg font-semibold mb-4">{format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })}</h2>
      {loading ? <p className="text-gray-500">Carregando...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {appointments.length === 0 ? <p className="p-6 text-gray-500 text-center">Nenhum agendamento para esta data.</p> : (
            <ul className="divide-y">
              {appointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
                <li key={apt.id} className="p-4 flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-black">{apt.time} - {apt.client.name}</p>
                    <p className="text-sm text-gray-600">{apt.braidStyle.name} - {apt.color.name}</p>
                    <p className="text-sm text-gray-500">{apt.client.phone} | {apt.client.email}</p>
                    {apt.notes && <p className="text-sm text-gray-500 mt-1">{apt.notes}</p>}
                  </div>
                  <select value={apt.status} onChange={(e) => updateStatus(apt.id, e.target.value)} className="text-black px-3 py-1 border rounded text-sm">
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Concluido</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
