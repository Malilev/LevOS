import { useState } from 'react';
import { SCENARIOS, CONTEXTS } from '../../constants';

interface ScenarioModalProps {
  dateKey: string;
  dayOfWeek: number;
  currentScenario: string | null;
  currentContext: string;
  onApply: (scenario: string, opCount: number, context: string) => void;
  onClear: () => void;
  onClose: () => void;
}

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function ScenarioModal({
  dateKey,
  dayOfWeek,
  currentScenario,
  currentContext,
  onApply,
  onClear,
  onClose,
}: ScenarioModalProps) {
  const [scenario, setScenario] = useState(currentScenario || '3');
  const [opCount, setOpCount] = useState(2);
  const [contextKey, setContextKey] = useState(currentContext);

  const date = new Date(dateKey);

  const handleApply = () => {
    onApply(scenario, opCount, contextKey);
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="glass rounded-2xl p-5 w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold mb-4 text-center text-white">
          📅 {DAY_NAMES[dayOfWeek]} {date.getDate()}
        </h3>

        {/* Приоритет дня */}
        <div className="mb-4">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Приоритет дня</div>
          <div className="flex gap-2">
            {Object.entries(CONTEXTS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setContextKey(k)}
                className={`flex-1 py-3 rounded-xl text-lg transition-all ${
                  contextKey === k
                    ? 'ring-2 ring-white shadow-lg'
                    : 'opacity-60 hover:opacity-80'
                }`}
                style={{
                  backgroundColor: v.color + (contextKey === k ? '' : '44'),
                  boxShadow: contextKey === k ? `0 4px 15px ${v.color}44` : undefined,
                }}
              >
                {v.emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Номер в очереди */}
        <div className="mb-4">
          <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Номер в очереди</div>
          <div className="flex gap-2">
            {Object.entries(SCENARIOS).map(([k, s]) => (
              <button
                key={k}
                onClick={() => setScenario(k)}
                className={`flex-1 py-2.5 rounded-xl text-xs transition-all ${
                  scenario === k
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
                    : 'glass-btn'
                }`}
              >
                <div className="font-bold text-white">{s.name}</div>
                <div className="text-white/50" style={{ fontSize: '9px' }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Количество операций */}
        {scenario !== 'w' && (
          <div className="mb-5">
            <div className="text-xs text-white/40 mb-2 uppercase tracking-wider">Количество операций</div>
            <div className="flex gap-2">
              {[1, 2, 3].map((n) => (
                <button
                  key={n}
                  onClick={() => setOpCount(n)}
                  className={`flex-1 py-4 rounded-xl text-xl transition-all ${
                    opCount === n
                      ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-500/30'
                      : 'glass-btn'
                  }`}
                >
                  {'🏥'.repeat(n)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Кнопки */}
        <div className="flex gap-2">
          <button
            onClick={onClear}
            className="px-4 py-3 glass-btn rounded-xl text-sm text-white/70 hover:text-white"
          >
            🗑
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 glass-btn rounded-xl text-sm text-white/70 hover:text-white"
          >
            Отмена
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl text-sm font-bold text-white shadow-lg shadow-green-500/30 hover:scale-[1.02] transition-transform"
          >
            Применить
          </button>
        </div>
      </div>
    </div>
  );
}
