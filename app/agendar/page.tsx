'use client';

import Link from 'next/link';
import { useBookingForm } from './hooks/useBookingForm';
import { BookingSuccess } from './components/BookingSuccess';
import { Step1DatePeriod } from './components/Step1DatePeriod';
import { Step2StyleColor } from './components/Step2StyleColor';
import { Step3Contact } from './components/Step3Contact';

export default function AgendarPage() {
  const {
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
  } = useBookingForm();

  if (success) {
    return <BookingSuccess date={form.date} time={form.time} />;
  }

  return (
    <main className="min-h-screen bg-jade-50 py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold text-jade-500 text-center mb-2">
          Agendar
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Escolha data, período, estilo e cor das tranças.
        </p>

        <div className="flex gap-2 mb-6">
          <span
            className={`px-3 py-1 rounded ${step >= 1 ? 'bg-jade-500 text-white' : 'bg-gray-200'}`}
          >
            1. data e período
          </span>
          <span
            className={`px-3 py-1 rounded ${step >= 2 ? 'bg-jade-500 text-white' : 'bg-gray-200'}`}
          >
            2. estilo e cor
          </span>
          <span
            className={`px-3 py-1 rounded ${step >= 3 ? 'bg-jade-500 text-white' : 'bg-gray-200'}`}
          >
            3. contato
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-6 space-y-6"
        >
          {step === 1 && (
            <Step1DatePeriod
              date={form.date}
              time={form.time}
              minDate={minDate}
              maxDate={maxDate}
              bookedPeriods={bookedPeriods}
              loadingPeriods={loadingPeriods}
              onDateChange={(date) => setForm({ ...form, date })}
              onTimeChange={(time) => setForm({ ...form, time })}
              onContinue={() => form.date && form.time && setStep(2)}
            />
          )}

          {step === 2 && (
            <Step2StyleColor
              styles={styles}
              colors={colors}
              selectedStyleId={form.braidStyleId}
              selectedColorId={form.colorId}
              onStyleSelect={(id) => setForm({ ...form, braidStyleId: id })}
              onColorSelect={(id) => setForm({ ...form, colorId: id })}
              onBack={() => setStep(1)}
              onContinue={() => form.braidStyleId && form.colorId && setStep(3)}
            />
          )}

          {step === 3 && (
            <Step3Contact
              form={{
                clientPhone: form.clientPhone,
                clientName: form.clientName,
                clientEmail: form.clientEmail,
                enderecoCep: form.enderecoCep,
                enderecoLogradouro: form.enderecoLogradouro,
                enderecoNumero: form.enderecoNumero,
                enderecoComplemento: form.enderecoComplemento,
                enderecoBairro: form.enderecoBairro,
                enderecoCidade: form.enderecoCidade,
                enderecoUf: form.enderecoUf,
                notes: form.notes,
              }}
              phoneError={phoneError}
              emailError={emailError}
              cepError={cepError}
              clientFound={clientFound}
              phoneVerified={phoneVerified}
              loadingLookup={loadingLookup}
              loadingCep={loadingCep}
              loading={loading}
              error={error}
              onFormChange={updateForm}
              onPhoneErrorChange={setPhoneError}
              onEmailErrorChange={setEmailError}
              onPhoneBlur={lookupClientByPhone}
              onCepBlur={fetchCep}
              onBack={() => {
                setStep(2);
                if (!phoneVerified) {
                  setForm((prev) => ({ ...prev, clientPhone: '' }));
                  setPhoneError('');
                }
              }}
            />
          )}
        </form>

        <p className="text-center mt-6">
          <Link href="/" className="text-jade-500 hover:underline">
            Voltar ao início
          </Link>
        </p>
      </div>
    </main>
  );
}
