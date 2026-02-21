import { PERIODS } from '../constants';

type Step1DatePeriodProps = {
  date: string;
  time: string;
  minDate: string;
  maxDate: string;
  bookedPeriods: string[];
  loadingPeriods: boolean;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  onContinue: () => void;
};

export function Step1DatePeriod(props: Step1DatePeriodProps) {
  const {
    date,
    time,
    minDate,
    maxDate,
    bookedPeriods,
    loadingPeriods,
    onDateChange,
    onTimeChange,
    onContinue,
  } = props;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <input
          type="date"
          value={date}
          onChange={(e) => onDateChange(e.target.value)}
          min={minDate}
          max={maxDate}
          required
          className="bg-jade-500 w-full px-4 py-2 border rounded-lg"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
        <div className="grid grid-cols-3 gap-3">
          {PERIODS.map(({ id, label, icon: Icon }) => {
            const isBooked = bookedPeriods.includes(id);
            return (
              <button
                key={id}
                type="button"
                disabled={isBooked}
                title={isBooked ? 'Período já reservado' : undefined}
                onClick={() => !isBooked && onTimeChange(id)}
                className={`flex flex-col items-center gap-2 px-3 py-4 rounded-lg border transition-colors ${
                  isBooked
                    ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200 text-gray-500'
                    : time === id
                      ? 'bg-jade-500 text-white border-jade-500'
                      : 'text-gray-700 border-gray-300 hover:bg-jade-50 hover:border-jade-200'
                }`}
              >
                <Icon className="w-8 h-8" strokeWidth={1.5} />
                <span className="text-sm font-medium">{label}</span>
                {isBooked && <span className="text-xs">Ocupado</span>}
              </button>
            );
          })}
        </div>
        {loadingPeriods && (
          <p className="text-sm text-gray-500 mt-2 text-center">Verificando disponibilidade...</p>
        )}
        <p className="text-sm text-gray-500 mt-3 text-center">
          Entraremos em contato para verificar o melhor horário dentro do período.
        </p>
      </div>
      <button
        type="button"
        onClick={onContinue}
        disabled={!date || !time}
        className="w-full py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50"
      >
        Continuar
      </button>
    </div>
  );
}
