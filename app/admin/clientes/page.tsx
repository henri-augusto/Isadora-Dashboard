"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Client = {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string | null;
  appointments: { id: string; date: string; time: string; status: string; braidStyle: { name: string }; color: { name: string } }[];
};

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Client | null>(null);

  useEffect(() => {
    const url = search ? `/api/clients?search=${encodeURIComponent(search)}` : "/api/clients";
    fetch(url).then((r) => r.json()).then(setClients);
  }, [search]);

  useEffect(() => {
    if (selected?.id) {
      fetch(`/api/clients/${selected.id}`).then((r) => r.json()).then(setSelected);
    }
  }, [selected?.id]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Clientes</h1>
      <input type="search" placeholder="Buscar por nome, email ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-md px-4 py-2 border rounded-lg mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <ul className="divide-y">
            {clients.map((c) => (
              <li key={c.id} onClick={() => setSelected(c)} className={`p-4 cursor-pointer hover:bg-cinnabar-50 ${selected?.id === c.id ? "bg-cinnabar-50" : ""}`}>
                <p className="text-black font-medium">{c.name}</p>
                <p className="text-sm text-gray-600">{c.email}</p>
                <p className="text-sm text-gray-600">{c.phone}</p>
                <p className="text-xs text-gray-500 mt-1">{c.appointments.length} agendamento(s)</p>
              </li>
            ))}
          </ul>
          {clients.length === 0 && <p className="p-4 text-gray-500 text-center">Nenhum cliente encontrado.</p>}
        </div>
        {selected && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-black text-lg font-semibold mb-4">{selected.name}</h2>
            <p className="text-gray-600">{selected.email}</p>
            <p className="text-gray-600">{selected.phone}</p>
            {selected.notes && <p className="text-gray-600 mt-2">{selected.notes}</p>}
            <h3 className="text-black text-md font-medium mt-6 mb-2">Histórico de agendamentos</h3>
            <ul className="space-y-2">
              {selected.appointments.map((apt) => (
                <li key={apt.id} className="flex justify-between text-sm py-2 border-b last:border-0">
                  <div>
                    <span className="text-gray-500">{format(new Date(apt.date), "dd/MM/yyyy", { locale: ptBR })} às {apt.time}</span>
                    <span className="ml-2 text-gray-500">- {apt.braidStyle.name} - {apt.color.name}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-xs ${apt.status === "completed" ? "bg-green-100 text-green-800" : apt.status === "cancelled" ? "bg-red-100 text-red-800" : "bg-cinnabar-100 text-cinnabar-800"}`}>{apt.status}</span>
                </li>
              ))}
            </ul>
            {selected.appointments.length === 0 && <p className="text-gray-500 text-sm">Nenhum agendamento ainda.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
