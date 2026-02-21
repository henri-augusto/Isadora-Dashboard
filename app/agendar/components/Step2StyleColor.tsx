'use client';

import Image from 'next/image';
import { useRef, useEffect } from 'react';
import { Clock, DollarSign } from 'lucide-react';
import type { BraidStyle, Color } from '../types';

type Step2StyleColorProps = {
  styles: BraidStyle[];
  colors: Color[];
  selectedStyleId: string;
  selectedColorId: string;
  onStyleSelect: (id: string) => void;
  onColorSelect: (id: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export function Step2StyleColor({
  styles,
  colors,
  selectedStyleId,
  selectedColorId,
  onStyleSelect,
  onColorSelect,
  onBack,
  onContinue,
}: Step2StyleColorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selectedStyleId) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    const selectedCard = container.querySelector(`[data-style-id="${selectedStyleId}"]`) as HTMLElement;
    if (selectedCard) {
      const containerRect = container.getBoundingClientRect();
      const cardRect = selectedCard.getBoundingClientRect();
      const scrollLeft = container.scrollLeft + (cardRect.left - containerRect.left) - containerRect.width / 2 + cardRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedStyleId]);

  return (
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
            const durationText = hours > 0 ? `${hours}h${minutes > 0 ? ` ${minutes}min` : ''}` : `${minutes}min`;
            const isSelected = selectedStyleId === style.id;
            return (
              <div
                key={style.id}
                data-style-id={style.id}
                onClick={() => onStyleSelect(style.id)}
                className={`relative rounded-lg overflow-hidden transition-all cursor-pointer flex-shrink-0 w-64 snap-start ${
                  isSelected ? 'border-[3px] border-jade-500 shadow-xl scale-105' : 'border-2 border-gray-200 hover:border-jade-300'
                }`}
              >
                <div className="relative w-full aspect-[16/9] bg-gray-100">
                  <div className="grid grid-cols-2 h-full">
                    <div className="relative">
                      <Image src="/assets/nago_feminina.png" alt={`${style.name} - Modelo feminino`} fill className="object-cover" />
                    </div>
                    <div className="relative">
                      <Image src="/assets/nago_masculina.png" alt={`${style.name} - Modelo masculino`} fill className="object-cover" />
                    </div>
                  </div>
                  {isSelected && <div className="absolute inset-0 bg-jade-500/10" />}
                </div>
                <div className={`p-4 ${isSelected ? 'bg-jade-50' : 'bg-white'}`}>
                  <h3 className={`text-lg font-semibold mb-2 ${isSelected ? 'text-jade-700' : 'text-gray-900'}`}>{style.name}</h3>
                  {style.description && (
                    <p className={`text-sm mb-3 ${isSelected ? 'text-jade-600' : 'text-gray-600'}`}>{style.description}</p>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <DollarSign className="w-4 h-4 text-jade-600" />
                      <span className="font-semibold text-lg text-jade-600">R$ {style.basePrice.toFixed(2)}</span>
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
            <button
              key={c.id}
              type="button"
              onClick={() => onColorSelect(c.id)}
              className={`text-black flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                selectedColorId === c.id ? 'ring-2 ring-jade-500 border-jade-500' : 'border-gray-300 hover:border-jade-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full border" style={{ backgroundColor: c.hexCode }} />
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onBack} className="text-black px-4 py-2 border rounded-lg">
          Voltar
        </button>
        <button
          type="button"
          onClick={onContinue}
          disabled={!selectedStyleId || !selectedColorId}
          className="flex-1 py-2 bg-jade-500 text-white rounded-lg disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
