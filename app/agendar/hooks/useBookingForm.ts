'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, addDays } from 'date-fns';
import { validatePhone } from '@/lib/validation';
import type { BraidStyle, Color, ViaCepResponse, BookingForm } from '../types';

const INITIAL_FORM: BookingForm = {
  clientName: '',
  clientPhone: '',
  clientEmail: '',
  date: '',
  time: '',
  braidStyleId: '',
  colorId: '',
  notes: '',
  enderecoCep: '',
  enderecoLogradouro: '',
  enderecoNumero: '',
  enderecoComplemento: '',
  enderecoBairro: '',
  enderecoCidade: '',
  enderecoUf: '',
};

export function useBookingForm() {
  const [step, setStep] = useState(1);
  const [styles, setStyles] = useState<BraidStyle[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<BookingForm>(INITIAL_FORM);
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [clientFound, setClientFound] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loadingLookup, setLoadingLookup] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [bookedPeriods, setBookedPeriods] = useState<string[]>([]);
  const [loadingPeriods, setLoadingPeriods] = useState(false);

  const minDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), 60), 'yyyy-MM-dd');

  useEffect(() => {
    fetch('/api/braid-styles')
      .then((r) => r.json())
      .then(setStyles);
    fetch('/api/colors')
      .then((r) => r.json())
      .then(setColors);
  }, []);

  useEffect(() => {
    if (!form.date) {
      setBookedPeriods([]);
      return;
    }
    setLoadingPeriods(true);
    fetch(`/api/appointments?forBooking=true&date=${form.date}`)
      .then((r) => r.json())
      .then((data) => {
        const times = data.bookedTimes || [];
        setBookedPeriods(times);
        setForm((prev) =>
          prev.time && times.includes(prev.time) ? { ...prev, time: '' } : prev
        );
      })
      .catch(() => setBookedPeriods([]))
      .finally(() => setLoadingPeriods(false));
  }, [form.date]);

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

  const fetchCep = useCallback(async (cep: string) => {
    const digits = cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setLoadingCep(true);
    setCepError('');
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data: ViaCepResponse = await res.json();
      if (data.erro) {
        setCepError('CEP não encontrado');
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
      setCepError('Erro ao buscar CEP');
    } finally {
      setLoadingCep(false);
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setLoading(true);

      try {
        const checkRes = await fetch(`/api/appointments?forBooking=true&date=${form.date}`);
        const { bookedTimes } = await checkRes.json();
        if (bookedTimes?.includes(form.time)) {
          setError(
            'Este período foi reservado enquanto você preenchia. Por favor, escolha outra data ou período.'
          );
          setLoading(false);
          return;
        }
      } catch {
        setError('Não foi possível verificar a disponibilidade. Tente novamente.');
        setLoading(false);
        return;
      }

      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || 'Erro ao agendar');
      }
    },
    [form]
  );

  const updateForm = useCallback((updates: Partial<BookingForm>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    step,
    setStep,
    form,
    setForm,
    updateForm,
    styles,
    colors,
    success,
    error,
    loading,
    phoneError,
    setPhoneError,
    emailError,
    setEmailError,
    clientFound,
    phoneVerified,
    loadingLookup,
    loadingCep,
    cepError,
    bookedPeriods,
    loadingPeriods,
    minDate,
    maxDate,
    lookupClientByPhone,
    fetchCep,
    handleSubmit,
  };
}
