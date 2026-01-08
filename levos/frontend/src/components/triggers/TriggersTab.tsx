import { useMemo } from 'react';
import type { Goal, BrainDumpItem, ScheduleBlock } from '../../types';
import { SCENARIOS, CONTEXTS, PROJECTS, METRICS_CONFIG } from '../../constants';
import { getTriggers } from '../../utils/triggers';

interface TriggersTabProps {
  todayKey: string;
  schedules: Record<string, ScheduleBlock[]>;
  dayScenarios: Record<string, string>;
  weekContexts: Record<number, string>;
  goals: Goal[];
  brainDump: BrainDumpItem[];
  checkedTriggers: Record<string, boolean>;
  weekFocus: string;
  metrics: Record<string, Record<string, number | string | boolean>>;
  setCheckedTriggers: (fn: (prev: Record<string, boolean>) => Record<string, boolean>) => void;
  setWeekFocus: (focus: string) => void;
  setDayScenarios: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  toggleGoal: (id: string) => void;
}

export function TriggersTab({
  todayKey,
  schedules,
  dayScenarios,
  weekContexts,
  goals,
  brainDump,
  checkedTriggers,
  weekFocus,
  metrics,
  setCheckedTriggers,
  setWeekFocus,
  setDayScenarios,
  toggleGoal,
}: TriggersTabProps) {
  const todayDayOfWeek = new Date().getDay();
  const todayContext = weekContexts[todayDayOfWeek] || 'POLECHAT';
  const activeScenario = dayScenarios[todayKey] || null;

  // Контекст из расписания
  const getContextFromSchedule = useMemo(() => {
    const todaySchedule = schedules[todayKey] || [];
    const workBlocks = todaySchedule.filter(b =>
      b.blockId === 'POLECHAT' || b.blockId === 'LAB' || b.blockId === 'SOMALAB'
    );
    if (workBlocks.length === 0) return null;
    return workBlocks[0].blockId;
  }, [schedules, todayKey]);

  const contextProject = getContextFromSchedule ||
    (todayContext === 'POLECHAT' ? 'POLECHAT' :
     todayContext === 'LAB' ? 'LAB' :
     todayContext === 'SOMALAB' ? 'SOMALAB' :
     todayContext === 'FAMILY' ? 'FAMILY' : null);

  const contextDump = contextProject ? brainDump.filter(d => d.project === contextProject) : [];
  const contextGoals = contextProject ? goals.filter(g => g.project === contextProject && !g.done) : [];

  const triggers = getTriggers(activeScenario, todayDayOfWeek, todayContext);

  const setScenarioForDate = (dateKey: string, scenario: string) => {
    setDayScenarios(prev => ({ ...prev, [dateKey]: scenario }));
  };

  // Прогресс
  const allKeys = triggers.flatMap(s => s.items.map(i => i.key));
  const checked = allKeys.filter(k => checkedTriggers[k]).length;
  const percent = allKeys.length > 0 ? Math.round(checked / allKeys.length * 100) : 0;

  return (
    <div className="flex-1 overflow-auto p-4 space-y-4">
      {/* Выбор сценария */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/40">Сегодня:</span>
          <span
            className="text-sm px-3 py-1 rounded-lg"
            style={{
              backgroundColor: CONTEXTS[todayContext]?.color + '33',
              color: CONTEXTS[todayContext]?.color
            }}
          >
            {CONTEXTS[todayContext]?.emoji} {CONTEXTS[todayContext]?.name}
          </span>
        </div>
        <div className="flex gap-2">
          {Object.entries(SCENARIOS).map(([k, s]) => (
            <button
              key={k}
              onClick={() => setScenarioForDate(todayKey, k)}
              className={`flex-1 py-2 rounded-xl text-xs transition-all ${
                activeScenario === k
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

      {/* Контекст блока */}
      {contextProject && (
        <div
          className="rounded-2xl p-4 backdrop-blur-xl"
          style={{
            backgroundColor: PROJECTS[contextProject]?.color + '22',
            border: `1px solid ${PROJECTS[contextProject]?.color}44`
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ backgroundColor: PROJECTS[contextProject]?.color + '44' }}
              >
                {PROJECTS[contextProject]?.emoji}
              </div>
              <span className="font-medium text-white">{PROJECTS[contextProject]?.name}</span>
            </div>
            <span className="text-xs text-white/40 glass-dark px-2 py-1 rounded-lg">
              {getContextFromSchedule ? '📅 из плана' : '📆 из дня'}
            </span>
          </div>

          {contextDump.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-white/40 mb-2">🧠 Мысли ({contextDump.length}):</div>
              <div className="space-y-1">
                {contextDump.slice(0, 3).map(d => (
                  <div key={d.id} className="text-sm glass-dark rounded-xl px-3 py-2 truncate text-white/80">
                    {d.text}
                  </div>
                ))}
                {contextDump.length > 3 && (
                  <div className="text-xs text-white/40">+{contextDump.length - 3} ещё...</div>
                )}
              </div>
            </div>
          )}

          {contextGoals.length > 0 && (
            <div className="mb-3">
              <div className="text-xs text-white/40 mb-2">🎯 Цели:</div>
              <div className="space-y-1">
                {contextGoals.slice(0, 3).map(g => (
                  <div
                    key={g.id}
                    onClick={() => toggleGoal(g.id)}
                    className="flex items-center gap-2 text-sm glass-dark rounded-xl px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-white/30"></div>
                    <span className="truncate text-white/80">{g.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {METRICS_CONFIG[contextProject] && (
            <div>
              <div className="text-xs text-white/40 mb-2">📊 Метрики:</div>
              <div className="flex flex-wrap gap-2 text-sm">
                {METRICS_CONFIG[contextProject].slice(0, 2).map(m => (
                  <span key={m.key} className="glass-dark rounded-lg px-3 py-1.5 text-white/80">
                    {m.label}: <span className="font-bold text-white">{metrics[contextProject]?.[m.key] || 0}</span>
                    {m.target ? <span className="text-white/40">/{m.target}</span> : ''}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Фокус недели */}
      <div className="glass rounded-2xl p-4">
        <div className="text-sm font-medium mb-3 text-white/40 uppercase tracking-wider">🎯 Фокус недели</div>
        <input
          type="text"
          value={weekFocus}
          onChange={(e) => setWeekFocus(e.target.value)}
          placeholder="Главная цель..."
          className="w-full glass-input rounded-xl px-4 py-3 text-sm text-white placeholder-white/30"
        />
      </div>

      {/* Секции триггеров */}
      {triggers.map(section => (
        <div key={section.id} className="glass rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="font-medium text-white">{section.title}</div>
            {section.subtitle && (
              <div className="text-xs text-white/40 mt-0.5">{section.subtitle}</div>
            )}
          </div>

          <div className="divide-y divide-white/5">
            {section.items.map(item => (
              <div
                key={item.key}
                onClick={() => setCheckedTriggers(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                className={`px-4 py-3 cursor-pointer transition-all ${
                  checkedTriggers[item.key] ? 'bg-green-500/20' : 'hover:bg-white/5'
                } ${item.indent ? 'pl-10' : ''} ${item.highlight ? 'bg-orange-500/10' : ''}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    checkedTriggers[item.key]
                      ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                      : item.highlight ? 'border-orange-500' : 'border-white/30'
                  }`}>
                    {checkedTriggers[item.key] && <span className="text-white text-xs">✓</span>}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-medium text-sm ${
                      checkedTriggers[item.key] ? 'line-through text-white/40' : 'text-white'
                    }`}>
                      {item.title}
                    </div>
                    <div className="text-xs text-white/40 mt-1">{item.desc}</div>

                    {(item.anchor || item.warn) && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.anchor && (
                          <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg border border-blue-500/30">
                            📍 {item.anchor}
                          </span>
                        )}
                        {item.warn && (
                          <span className="text-xs px-2 py-1 bg-red-500/20 text-red-300 rounded-lg border border-red-500/30">
                            ⚠️ {item.warn}
                          </span>
                        )}
                      </div>
                    )}

                    {item.next && !checkedTriggers[item.key] && (
                      <div className="text-xs text-white/30 mt-2">↓ далее</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Прогресс */}
      <div className="glass rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-white/40">Прогресс дня</span>
          <span className="text-green-400 font-medium">{checked}/{allKeys.length} ({percent}%)</span>
        </div>
        <div className="h-2 glass-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Сброс */}
      <button
        onClick={() => setCheckedTriggers(() => ({}))}
        className="w-full py-3 text-sm text-white/30 hover:text-white/60 transition-colors"
      >
        Сбросить все триггеры
      </button>

      {/* Цитата */}
      <div className="bg-orange-500/20 border border-orange-500/30 rounded-2xl p-4 text-center backdrop-blur-xl">
        <div className="text-sm text-orange-200 italic">
          "Показал задачу, отошёл. Захватило — еду."
        </div>
      </div>
    </div>
  );
}
