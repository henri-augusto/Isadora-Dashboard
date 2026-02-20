"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { format, addDays } from "date-fns";
import { Sun, CloudSun, Moon, Clock, DollarSign, MessageCircle, Bold } from "lucide-react";
import { data } from "autoprefixer";

// Máscara de telefone: (XX) 9XXXX-XXXX
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 2) return digits ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
}

function validatePhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return digits.length === 11 && digits[2] === "9";
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

const PERIODS = [
  { id: "manhã", label: "Manhã", icon: Sun },
  { id: "tarde", label: "Tarde", icon: CloudSun },
  { id: "noite", label: "Noite", icon: Moon },
] as const;

type BraidStyle = { id: string; name: string; description?: string | null; basePrice: number; estimatedDuration: number };
type Color = { id: string; name: string; hexCode: string };

export default function AgendarPage() {
  const [step, setStep] = useState(1);
  const [styles, setStyles] = useState<BraidStyle[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    clientName: "",
    clientPhone: "",
    clientEmail: "",
    date: "",
    time: "",
    braidStyleId: "",
    colorId: "",
    notes: "",
    enderecoCep: "",
    enderecoLogradouro: "",
    enderecoNumero: "",
    enderecoComplemento: "",
    enderecoBairro: "",
    enderecoCidade: "",
    enderecoUf: "",
  });
  const [phoneError, setPhoneError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [clientFound, setClientFound] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState("");

  useEffect(() => {
    fetch("/api/braid-styles").then((r) => r.json()).then(setStyles);
    fetch("/api/colors").then((r) => r.json()).then(setColors);
  }, []);

  // Scroll para o card selecionado
  useEffect(() => {
    if (step !== 2 || !form.braidStyleId) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    const selectedCard = container.querySelector(`[data-style-id="${form.braidStyleId}"]`) as HTMLElement;
    if (selectedCard) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = selectedCard.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + (cardRect.left - containerRect.left) - (containerRect.width / 2) + (cardRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [form.braidStyleId, step]);

  // Data mínima = amanhã (dia atual não disponível para agendamento)
  const minDate = format(addDays(new Date(), 1), "yyyy-MM-dd");
  const maxDate = format(addDays(new Date(), 60), "yyyy-MM-dd");

  // Pesquisa o cliente pelo campo telefone no banco de dados
  const lookupClientByPhone = useCallback(async (phone: string) => {
    if (!validatePhone(phone)) return;
    setLoadingLookup(true);
    try {
      const res = await fetch(`/api/clients/lookup?phone=${encodeURIComponent(phone)}`);
      const { client } = await res.json();
      if (client) {
        setForm((prev) => ({
          ...prev,
          clientName: client.name || prev.clientName,
          clientEmail: client.email || prev.clientEmail,
          enderecoCep: client.enderecoCep ?? prev.enderecoCep,
          enderecoLogradouro: client.enderecoLogradouro ?? prev.enderecoLogradouro,
          enderecoNumero: client.enderecoNumero ?? prev.enderecoNumero,
          enderecoComplemento: client.enderecoComplemento ?? prev.enderecoComplemento,
          enderecoBairro: client.enderecoBairro ?? prev.enderecoBairro,
          enderecoCidade: client.enderecoCidade ?? prev.enderecoCidade,
          enderecoUf: client.enderecoUf ?? prev.enderecoUf,
        }));
        setClientFound(true);
      } else {
        setClientFound(false);
      }
      setPhoneVerified(true);
    } catch {
      setClientFound(false);
      setPhoneVerified(true);
    } finally {
      setLoadingLookup(false);
    }
  }, []);

  // Busca o CEP e preenche os campos de endereço
  const fetchCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;
    setLoadingCep(true);
    setCepError("");
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setCepError("CEP não encontrado");
        setLoadingCep(false);
        return;
      }
      setForm((prev) => ({
        ...prev,
        enderecoCep: data.cep ?? prev.enderecoCep,
        enderecoLogradouro: data.logradouro ?? prev.enderecoLogradouro,
        enderecoBairro: data.bairro ?? prev.enderecoBairro,
        enderecoCidade: data.localidade ?? prev.enderecoCidade,
        enderecoUf: data.uf ?? prev.enderecoUf,
      }));
    } catch {
      setCepError("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
  }, []);

  // Envia o agendamento para o banco de dados  
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

  const instagramUrl = "https://www.instagram.com/doka_hair_design?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D";

  if (success) {
    return (
      <main className="min-h-screen bg-jade-50 py-12 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-green-700 mb-4">Agendamento realizado!</h1>
          <p className="text-gray-600 mb-6">A data <strong>{format(form.date, "dd/MM")} no período da {form.time}</strong> foi reservado. Em breve entraremos em contato para confirmar.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-br from-purple-600 via-pink-500 to-amber-500 text-white hover:opacity-90 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              Instagram
            </Link>
            <Link href="/" className="inline-block px-6 py-2.5 bg-jade-500 text-white rounded-lg hover:bg-jade-400">
              Voltar ao início
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-jade-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-jade-500 text-center mb-2">Agendar</h1>
        <p className="text-center text-gray-600 mb-8">Escolha data, período, estilo e cor das tranças.</p>

        <div className="flex gap-2 mb-6">
          <span className={`px-3 py-1 rounded ${step >= 1 ? "bg-jade-500 text-white" : "bg-gray-200"}`}>1. data e período</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                <div className="grid grid-cols-3 gap-3">
                  {PERIODS.map(({ id, label, icon: Icon }) => (
                    <button key={id} type="button" onClick={() => setForm({ ...form, time: id })} className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border transition-colors ${form.time === id ? "bg-jade-500 text-white border-jade-500" : "text-gray-700 border-gray-300 hover:bg-jade-50 hover:border-jade-200"}`}>
                      <Icon className="w-8 h-8" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">Entraremos em contato para verificar o melhor horário dentro do período.</p>
              </div>
              <button type="button" onClick={() => form.date && form.time && setStep(2)} disabled={!form.date || !form.time} className="w-full py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50">Continuar</button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Estilo da trança</label>
                <div 
                  ref={scrollContainerRef}
                  className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory px-2" 
                  style={{ scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch' }}
                >
                  {styles.map((style) => {
                    const hours = Math.floor(style.estimatedDuration / 60);
                    const minutes = style.estimatedDuration % 60;
                    const durationText = hours > 0 
                      ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}`
                      : `${minutes}min`;
                    
                    return (
                      <div
                        key={style.id}
                        data-style-id={style.id}
                        onClick={() => {
                          setForm({ ...form, braidStyleId: style.id });
                        }}
                        className={`relative rounded-lg overflow-hidden transition-all cursor-pointer flex-shrink-0 w-64 snap-start ${
                          form.braidStyleId === style.id
                            ? "border-[3px] border-jade-500 shadow-xl scale-105"
                            : "border-2 border-gray-200 hover:border-jade-300"
                        }`}
                      >
                        {/* Imagens como modelo */}
                        <div className="relative w-full aspect-[16/9] bg-gray-100">
                          <div className="grid grid-cols-2 h-full">
                            <div className="relative">
                              <Image
                                src="/assets/nago_feminina.png"
                                alt={`${style.name} - Modelo feminino`}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="relative">
                              <Image
                                src="/assets/nago_masculina.png"
                                alt={`${style.name} - Modelo masculino`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </div>
                          {form.braidStyleId === style.id && (
                            <div className="absolute inset-0 bg-jade-500/10" />
                          )}
                        </div>
                        
                        {/* Informações do estilo */}
                        <div className={`p-4 ${form.braidStyleId === style.id ? "bg-jade-50" : "bg-white"}`}>
                          <h3 className={`text-lg font-semibold mb-2 ${
                            form.braidStyleId === style.id ? "text-jade-700" : "text-gray-900"
                          }`}>{style.name}</h3>
                          {style.description && (
                            <p className={`text-sm mb-3 ${
                              form.braidStyleId === style.id ? "text-jade-600" : "text-gray-600"
                            }`}>{style.description}</p>
                          )}
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-gray-700">
                              <DollarSign className={`w-4 h-4 ${
                                form.braidStyleId === style.id ? "text-jade-600" : "text-jade-600"
                              }`} />
                              <span className={`font-semibold text-lg ${
                                form.braidStyleId === style.id ? "text-jade-600" : "text-jade-600"
                              }`}>
                                R$ {style.basePrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{durationText}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor desejada</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button key={c.id} type="button" onClick={() => setForm({ ...form, colorId: c.id })} className={`text-black flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${form.colorId === c.id ? "ring-2 ring-jade-500 border-jade-500" : "border-gray-300 hover:border-jade-200"}`}>
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
            <div className="space-y-6">
              {/* 1. Telefone — sempre visível, primeiro passo */}
              <section>
                <label className="block text-sm font-medium text-gray-700 mb-2">Telefone (WhatsApp)</label>
                <p className="text-sm text-gray-500 mb-2">Informe seu telefone para verificar ou cadastrar seus dados.</p>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
                  <input
                    type="tel"
                    value={form.clientPhone}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value);
                      setForm({ ...form, clientPhone: formatted });
                      setPhoneError(formatted ? (validatePhone(formatted) ? "" : "Use DDD + 9 dígitos: (XX) 9XXXX-XXXX") : "");
                    }}
                    onBlur={() => {
                      if (form.clientPhone) {
                        setPhoneError(validatePhone(form.clientPhone) ? "" : "Use DDD + 9 dígitos: (XX) 9XXXX-XXXX");
                        if (validatePhone(form.clientPhone)) lookupClientByPhone(form.clientPhone);
                      }
                    }}
                    placeholder="(11) 99999-9999"
                    required
                    maxLength={16}
                    className={`text-black w-full pl-10 pr-4 py-2.5 border rounded-lg ${phoneError ? "border-red-500" : "border-gray-300"}`}
                  />
                </div>
                {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}
                {loadingLookup && <p className="text-sm text-gray-500 mt-1">Verificando no cadastro...</p>}
                {phoneVerified && !clientFound && !loadingLookup && (
                  <p className="text-sm text-jade-700 mt-1">Novo cadastro. Preencha seus dados abaixo.</p>
                )}
              </section>

              {/* 2. Demais campos — visíveis após verificação do telefone */}
              {phoneVerified && (
                <div className="space-y-5 pt-2 border-t border-gray-200">
                  {clientFound && (
                    <div className="rounded-lg bg-jade-50 border border-jade-200 p-3 text-sm text-jade-800">
                      Cliente encontrado! Verifique se os dados estão corretos. Edite o que for necessário.
                    </div>
                  )}

                  {/* Dados pessoais */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Dados pessoais</h3>
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
                        <input
                          type="text"
                          value={form.clientName}
                          onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                          required
                          className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                        <input
                          type="email"
                          value={form.clientEmail}
                          onChange={(e) => {
                            setForm({ ...form, clientEmail: e.target.value });
                            setEmailError(e.target.value ? (validateEmail(e.target.value) ? "" : "Email inválido") : "");
                          }}
                          onBlur={(e) => setEmailError(e.target.value ? (validateEmail(e.target.value) ? "" : "Email inválido") : "")}
                          required
                          className={`text-black w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400 ${emailError ? "border-red-500" : "border-gray-300"}`}
                        />
                        {emailError && <p className="text-red-600 text-xs mt-1">{emailError}</p>}
                      </div>
                    </div>
                  </section>

                  {/* Endereço */}
                  <section className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-700">Endereço</h3>
                    <div className="grid gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">CEP</label>
                        <input
                          type="text"
                          value={form.enderecoCep}
                          onChange={(e) => setForm({ ...form, enderecoCep: e.target.value.replace(/\D/g, "").slice(0, 8) })}
                          onBlur={(e) => {
                            const cep = e.target.value.replace(/\D/g, "");
                            if (cep.length === 8) fetchCep(cep);
                          }}
                          placeholder="00000-000"
                          maxLength={9}
                          className="text-black w-full max-w-[140px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                        />
                        {loadingCep && <span className="text-xs text-gray-500 ml-2">Buscando...</span>}
                        {cepError && <p className="text-red-600 text-xs mt-0.5">{cepError}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Logradouro</label>
                        <input
                          type="text"
                          value={form.enderecoLogradouro}
                          readOnly
                          placeholder="Rua, avenida..."
                          className="text-black w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Número</label>
                          <input
                            type="text"
                            value={form.enderecoNumero}
                            onChange={(e) => setForm({ ...form, enderecoNumero: e.target.value })}
                            placeholder="Nº"
                            className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Complemento</label>
                          <input
                            type="text"
                            value={form.enderecoComplemento}
                            onChange={(e) => setForm({ ...form, enderecoComplemento: e.target.value })}
                            placeholder="Apt, bloco..."
                            className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-[3fr_2fr_1fr] gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Bairro</label>
                          <input
                            type="text"
                            value={form.enderecoBairro}
                            readOnly
                            placeholder="Bairro"
                            className="text-black w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Cidade</label>
                          <input
                            type="text"
                            value={form.enderecoCidade}
                            readOnly
                            placeholder="Cidade"
                            className="text-black w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">UF</label>
                          <input
                            type="text"
                            value={form.enderecoUf}
                            readOnly
                            placeholder="UF"
                            maxLength={2}
                            className="text-black w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-gray-50 uppercase text-center"
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Observações */}
                  <section>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Observações (opcional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={2}
                      placeholder="Ex: Gostaria de um tom mais escuro de loiro"
                      className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400 resize-none"
                    />
                  </section>
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep(2);
                    if (!phoneVerified) {
                      setForm((prev) => ({ ...prev, clientPhone: "" }));
                      setPhoneError("");
                    }
                  }}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={
                    loading ||
                    !phoneVerified ||
                    !!phoneError ||
                    !!emailError ||
                    !validatePhone(form.clientPhone) ||
                    !validateEmail(form.clientEmail)
                  }
                  className="flex-1 py-2.5 bg-jade-500 text-white rounded-lg hover:bg-jade-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? "Enviando..." : "Confirmar agendamento"}
                </button>
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
