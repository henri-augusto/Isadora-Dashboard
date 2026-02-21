'use client';

import { MessageCircle } from 'lucide-react';
import { formatPhone, validatePhone, validateEmail } from '@/lib/validation';

type Step3ContactProps = {
  form: {
    clientPhone: string;
    clientName: string;
    clientEmail: string;
    enderecoCep: string;
    enderecoLogradouro: string;
    enderecoNumero: string;
    enderecoComplemento: string;
    enderecoBairro: string;
    enderecoCidade: string;
    enderecoUf: string;
    notes: string;
  };
  phoneError: string;
  emailError: string;
  cepError: string;
  clientFound: boolean;
  phoneVerified: boolean;
  loadingLookup: boolean;
  loadingCep: boolean;
  loading: boolean;
  error: string;
  onFormChange: (
    updates: Partial<{
      clientPhone: string;
      clientName: string;
      clientEmail: string;
      enderecoCep: string;
      enderecoNumero: string;
      enderecoComplemento: string;
      notes: string;
    }>,
  ) => void;
  onPhoneErrorChange: (msg: string) => void;
  onEmailErrorChange: (msg: string) => void;
  onPhoneBlur: (phone: string) => void;
  onCepBlur: (cep: string) => void;
  onBack: () => void;
};

export function Step3Contact({
  form,
  phoneError,
  emailError,
  cepError,
  clientFound,
  phoneVerified,
  loadingLookup,
  loadingCep,
  loading,
  error,
  onFormChange,
  onPhoneErrorChange,
  onEmailErrorChange,
  onPhoneBlur,
  onCepBlur,
  onBack,
}: Step3ContactProps) {
  const canSubmit =
    phoneVerified &&
    !phoneError &&
    !emailError &&
    validatePhone(form.clientPhone) &&
    validateEmail(form.clientEmail);

  return (
    <div className="space-y-6">
      <section>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Telefone (WhatsApp)
        </label>
        <p className="text-sm text-gray-500 mb-2">
          Informe seu telefone para verificar ou cadastrar seus dados.
        </p>
        <div className="relative">
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-green-600" />
          <input
            type="tel"
            value={form.clientPhone}
            onChange={(e) => {
              const formatted = formatPhone(e.target.value);
              onFormChange({ clientPhone: formatted });
              onPhoneErrorChange(
                formatted
                  ? validatePhone(formatted)
                    ? ''
                    : 'Use DDD + 9 dígitos: (XX) 9XXXX-XXXX'
                  : '',
              );
            }}
            onBlur={() => {
              if (form.clientPhone) {
                onPhoneErrorChange(
                  validatePhone(form.clientPhone)
                    ? ''
                    : 'Use DDD + 9 dígitos: (XX) 9XXXX-XXXX',
                );
                if (validatePhone(form.clientPhone)) onPhoneBlur(form.clientPhone);
              }
            }}
            placeholder="(11) 99999-9999"
            required
            maxLength={16}
            className={`text-black w-full pl-10 pr-4 py-2.5 border rounded-lg ${phoneError ? 'border-red-500' : 'border-gray-300'}`}
          />
        </div>
        {phoneError && <p className="text-red-600 text-xs mt-1">{phoneError}</p>}
        {loadingLookup && (
          <p className="text-sm text-gray-500 mt-1">Verificando no cadastro...</p>
        )}
        {phoneVerified && !clientFound && !loadingLookup && (
          <p className="text-sm text-jade-700 mt-1">
            Novo cadastro. Preencha seus dados abaixo.
          </p>
        )}
      </section>

      {phoneVerified && (
        <div className="space-y-5 pt-2 border-t border-gray-200">
          {clientFound && (
            <div className="rounded-lg bg-jade-50 border border-jade-200 p-3 text-sm text-jade-800">
              Cliente encontrado! Verifique se os dados estão corretos. Edite o que
              for necessário.
            </div>
          )}

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Dados pessoais</h3>
            <div className="grid gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => onFormChange({ clientName: e.target.value })}
                  required
                  className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => {
                    onFormChange({ clientEmail: e.target.value });
                    onEmailErrorChange(
                      e.target.value
                        ? validateEmail(e.target.value)
                          ? ''
                          : 'Email inválido'
                        : '',
                    );
                  }}
                  onBlur={(e) =>
                    onEmailErrorChange(
                      e.target.value
                        ? validateEmail(e.target.value)
                          ? ''
                          : 'Email inválido'
                        : '',
                    )
                  }
                  required
                  className={`text-black w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400 ${emailError ? 'border-red-500' : 'border-gray-300'}`}
                />
                {emailError && (
                  <p className="text-red-600 text-xs mt-1">{emailError}</p>
                )}
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Endereço</h3>
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={form.enderecoCep}
                  onChange={(e) =>
                    onFormChange({
                      enderecoCep: e.target.value.replace(/\D/g, '').slice(0, 8),
                    })
                  }
                  onBlur={(e) => {
                    const cep = e.target.value.replace(/\D/g, '');
                    if (cep.length === 8) onCepBlur(cep);
                  }}
                  placeholder="00000-000"
                  maxLength={9}
                  className="text-black w-full max-w-[140px] px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                />
                {loadingCep && (
                  <span className="text-xs text-gray-500 ml-2">Buscando...</span>
                )}
                {cepError && (
                  <p className="text-red-600 text-xs mt-0.5">{cepError}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Logradouro
                </label>
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
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={form.enderecoNumero}
                    onChange={(e) =>
                      onFormChange({ enderecoNumero: e.target.value })
                    }
                    placeholder="Nº"
                    className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Complemento
                  </label>
                  <input
                    type="text"
                    value={form.enderecoComplemento}
                    onChange={(e) =>
                      onFormChange({ enderecoComplemento: e.target.value })
                    }
                    placeholder="Apt, bloco..."
                    className="text-black w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-jade-200 focus:border-jade-400"
                  />
                </div>
              </div>
              <div className="grid grid-cols-[3fr_2fr_1fr] gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Bairro
                  </label>
                  <input
                    type="text"
                    value={form.enderecoBairro}
                    readOnly
                    placeholder="Bairro"
                    className="text-black w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={form.enderecoCidade}
                    readOnly
                    placeholder="Cidade"
                    className="text-black w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    UF
                  </label>
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

          <section>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações (opcional)
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => onFormChange({ notes: e.target.value })}
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
          onClick={onBack}
          className="px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
        >
          Voltar
        </button>
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="flex-1 py-2.5 bg-jade-500 text-white rounded-lg hover:bg-jade-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        >
          {loading ? 'Enviando...' : 'Confirmar agendamento'}
        </button>
      </div>
    </div>
  );
}
