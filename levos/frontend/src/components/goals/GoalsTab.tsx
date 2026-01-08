import { useState, useMemo } from 'react';
import type { Goal } from '../../types';
import { PROJECTS, METRICS_CONFIG } from '../../constants';

interface GoalsTabProps {
  goals: Goal[];
  metrics: Record<string, Record<string, number | string | boolean>>;
  onAddGoal: (goal: Omit<Goal, 'id'>) => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  onUpdateMetric: (project: string, key: string, value: number | string | boolean) => void;
}

export function GoalsTab({
  goals,
  metrics,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  onUpdateMetric,
}: GoalsTabProps) {
  const [newGoalText, setNewGoalText] = useState('');
  const [newGoalProject, setNewGoalProject] = useState('');
  const [newGoalPeriod, setNewGoalPeriod] = useState('');
  const [goalsFilter, setGoalsFilter] = useState('');

  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.done).length;
  const progressPercent = totalGoals > 0 ? Math.round(completedGoals / totalGoals * 100) : 0;

  const goalsByPeriod = useMemo(() => {
    const periods: Record<string, Goal[]> = { D: [], W: [], M: [], Q: [], other: [] };
    goals.forEach(g => {
      const key = g.period && periods[g.period] ? g.period : 'other';
      periods[key].push(g);
    });
    return periods;
  }, [goals]);

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    onAddGoal({
      text: newGoalText.trim(),
      project: newGoalProject || '',
      period: (newGoalPeriod || '') as '' | 'D' | 'W' | 'M' | 'Q',
      done: false,
    });
    setNewGoalText('');
    setNewGoalProject('');
    setNewGoalPeriod('');
  };

  const PERIODS = [
    { key: 'D', label: 'Сегодня', emoji: '📅', color: '#EF4444' },
    { key: 'W', label: 'Эта неделя', emoji: '📆', color: '#F59E0B' },
    { key: 'M', label: 'Этот месяц', emoji: '🗓', color: '#3B82F6' },
    { key: 'Q', label: 'Квартал', emoji: '🎯', color: '#8B5CF6' },
    { key: 'other', label: 'Без срока', emoji: '📌', color: '#6B7280' },
  ];

  return (
    <div className="flex-1 overflow-auto">
      {/* Заголовок с прогрессом */}
      <div className="glass border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xl font-bold text-white">🎯 Цели</div>
          <div className="text-sm text-white/50">{completedGoals}/{totalGoals}</div>
        </div>
        <div className="h-2 glass-dark rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Добавление цели */}
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-medium mb-3 text-white/40 uppercase tracking-wider">Добавить цель</div>
          <input
            type="text"
            value={newGoalText}
            onChange={(e) => setNewGoalText(e.target.value)}
            placeholder="Что нужно сделать?"
            className="w-full glass-input rounded-xl px-4 py-3 text-sm mb-3 text-white placeholder-white/30"
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
          />
          <div className="flex gap-2">
            <select
              value={newGoalProject}
              onChange={(e) => setNewGoalProject(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">📁 Проект</option>
              {Object.entries(PROJECTS).map(([k, v]) => (
                <option key={k} value={k}>{v.emoji} {v.name}</option>
              ))}
            </select>
            <select
              value={newGoalPeriod}
              onChange={(e) => setNewGoalPeriod(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">⏰ Срок</option>
              <option value="D">День</option>
              <option value="W">Неделя</option>
              <option value="M">Месяц</option>
              <option value="Q">Квартал</option>
            </select>
            <button
              onClick={addGoal}
              className="px-5 py-2 accent-orange rounded-xl text-sm font-bold transition-transform hover:scale-105 active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Фильтры по проектам */}
        <div className="glass rounded-2xl p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setGoalsFilter('')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                goalsFilter === ''
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'glass-btn text-white/60'
              }`}
            >
              Все
            </button>
            {Object.entries(PROJECTS).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setGoalsFilter(k)}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  goalsFilter === k
                    ? 'shadow-lg'
                    : 'glass-btn'
                }`}
                style={{
                  backgroundColor: goalsFilter === k ? v.color : `${v.color}22`,
                  color: goalsFilter === k ? 'white' : v.color,
                  boxShadow: goalsFilter === k ? `0 4px 15px ${v.color}44` : undefined,
                }}
              >
                {v.emoji} {v.name}
              </button>
            ))}
          </div>
        </div>

        {/* Метрики проекта */}
        {goalsFilter && METRICS_CONFIG[goalsFilter] && (
          <div
            className="rounded-2xl p-4 backdrop-blur-xl"
            style={{
              backgroundColor: PROJECTS[goalsFilter]?.color + '22',
              border: `1px solid ${PROJECTS[goalsFilter]?.color}44`
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: PROJECTS[goalsFilter]?.color + '44' }}
              >
                {PROJECTS[goalsFilter]?.emoji}
              </div>
              <div>
                <div className="font-bold text-white">{PROJECTS[goalsFilter]?.name}</div>
                <div className="text-xs text-white/50">Метрики недели</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {METRICS_CONFIG[goalsFilter].map(m => (
                <div key={m.key} className="glass-dark rounded-xl p-3">
                  <div className="text-xs text-white/40 mb-2">{m.label}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onUpdateMetric(
                        goalsFilter,
                        m.key,
                        Math.max(0, (Number(metrics[goalsFilter]?.[m.key]) || 0) - 1)
                      )}
                      className="w-8 h-8 glass-btn rounded-lg text-sm transition-colors"
                    >
                      −
                    </button>
                    <span className="text-2xl font-bold flex-1 text-center text-white">
                      {metrics[goalsFilter]?.[m.key] || 0}
                      {m.target && <span className="text-sm text-white/30">/{m.target}</span>}
                    </span>
                    <button
                      onClick={() => onUpdateMetric(
                        goalsFilter,
                        m.key,
                        (Number(metrics[goalsFilter]?.[m.key]) || 0) + 1
                      )}
                      className="w-8 h-8 glass-btn rounded-lg text-sm transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Списки целей по периодам */}
        {PERIODS.map(p => {
          const filteredGoals = goalsByPeriod[p.key].filter(
            g => !goalsFilter || g.project === goalsFilter
          );
          const periodCompleted = filteredGoals.filter(g => g.done).length;
          const periodTotal = filteredGoals.length;

          if (filteredGoals.length === 0) return null;

          return (
            <div key={p.key} className="glass rounded-2xl overflow-hidden">
              <div
                className="px-4 py-3 border-b border-white/10 flex items-center justify-between"
                style={{ borderLeftWidth: '4px', borderLeftColor: p.color }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{p.emoji}</span>
                  <span className="font-medium text-white">{p.label}</span>
                </div>
                <span className="text-xs text-white/40">{periodCompleted}/{periodTotal}</span>
              </div>
              <div className="divide-y divide-white/5">
                {filteredGoals.map(g => (
                  <div
                    key={g.id}
                    className={`flex items-center gap-4 px-4 py-3 transition-colors ${
                      g.done ? 'bg-green-500/10' : 'hover:bg-white/5'
                    }`}
                  >
                    <button
                      onClick={() => onToggleGoal(g.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                        g.done
                          ? 'bg-green-500 border-green-500 shadow-lg shadow-green-500/30'
                          : 'border-white/30 hover:border-green-400'
                      }`}
                    >
                      {g.done && <span className="text-white text-xs">✓</span>}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${g.done ? 'line-through text-white/40' : 'text-white'}`}>
                        {g.text}
                      </div>
                    </div>

                    {g.project && (
                      <span
                        className="text-xs px-2 py-1 rounded-lg shrink-0"
                        style={{ backgroundColor: PROJECTS[g.project]?.color + '33' }}
                      >
                        {PROJECTS[g.project]?.emoji}
                      </span>
                    )}

                    <button
                      onClick={() => onDeleteGoal(g.id)}
                      className="text-white/30 hover:text-red-400 transition-colors text-lg shrink-0"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Пустое состояние */}
        {goals.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4 opacity-50">🎯</div>
            <div className="text-white/40 text-lg mb-2">Нет целей</div>
            <div className="text-white/30 text-sm">Добавь первую цель выше</div>
          </div>
        )}
      </div>
    </div>
  );
}
