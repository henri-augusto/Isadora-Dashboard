import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Converte uma data do banco (ISO string ou Date) para um Date local
 * que representa o mesmo dia do calendário. Corrige o problema de timezone
 * onde datas armazenadas como UTC midnight aparecem 1 dia antes no cliente.
 */
export function toLocalDate(value: string | Date): Date {
  if (value instanceof Date) {
    return new Date(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }
  const str = String(value);
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10));
  }
  const d = new Date(str);
  return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Formata uma data do banco para exibição (dd/MM/yyyy).
 */
export function formatDate(date: string | Date): string {
  return format(toLocalDate(date), "dd/MM/yyyy", { locale: ptBR });
}

/**
 * Formata uma data do banco para exibição curta (dd/MM).
 */
export function formatDateShort(date: string | Date): string {
  return format(toLocalDate(date), "dd/MM", { locale: ptBR });
}
