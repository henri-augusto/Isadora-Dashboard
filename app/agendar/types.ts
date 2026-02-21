export type BraidStyle = {
  id: string;
  name: string;
  description?: string | null;
  basePrice: number;
  estimatedDuration: number;
};

export type Color = {
  id: string;
  name: string;
  hexCode: string;
};

export type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export type BookingForm = {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  date: string;
  time: string;
  braidStyleId: string;
  colorId: string;
  notes: string;
  enderecoCep: string;
  enderecoLogradouro: string;
  enderecoNumero: string;
  enderecoComplemento: string;
  enderecoBairro: string;
  enderecoCidade: string;
  enderecoUf: string;
};
