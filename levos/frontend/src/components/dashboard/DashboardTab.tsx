import { useState, useMemo } from 'react';
import type { ScheduleBlock, Goal } from '../../types';
import { SCENARIOS, CONTEXTS, LOCATION_CONTEXTS, DEFAULT_BLOCKS, PROJECTS } from '../../constants';
import { formatDate } from '../../utils';

interface TimelineEvent {
  time: string;
  emoji: string;
  title: string;
  subtitle: string;
  color: string;
  highlight?: boolean;
  optional?: boolean;
  isVirtual?: boolean;
  fromCalendar?: boolean;
}

interface DashboardTabProps {
  todayKey: string;
  schedules: Record<string, ScheduleBlock[]>;
  dayScenarios: Record<string, string>;
  weekContexts: Record<number, string>;
  goals: Goal[];
  weekFocus: string;
  currentLocation: string | null;
  setCurrentLocation: (loc: string | null) => void;
  setDayScenarios: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  onGoToTab: (tab: string) => void;
  toggleGoal: (id: string) => void;
}

const DAY_NAMES = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const formatHour = (h: number): string => {
  const normalized = h >= 24 ? h - 24 : h;
  return `${Math.floor(normalized)}:${String(Math.round((normalized % 1) * 60)).padStart(2, '0')}`;
};

export function DashboardTab({
  todayKey,
  schedules,
  dayScenarios,
  weekContexts,
  goals,
  weekFocus,
  currentLocation,
  setCurrentLocation,
  setDayScenarios,
  onGoToTab,
  toggleGoal,
}: DashboardTabProps) {
  const [dashDate, setDashDate] = useState(() => new Date());
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showAlmCalc, setShowAlmCalc] = useState(false);
  const [almCalc, setAlmCalc] = useState({ currentOp: '', myOp: '' });

  const dashDateKey = formatDate(dashDate);
  const dashDayOfWeek = dashDate.getDay();
  const dashContext = weekContexts[dashDayOfWeek] || 'POLECHAT';
  const dashSchedule = schedules[dashDateKey] || [];
  const isToday = dashDateKey === todayKey;

  // Сценарий для выбранного дня
  const dayScenario = dayScenarios[dashDateKey] || null;
  const scenarioInfo = dayScenario ? SCENARIOS[dayScenario] : null;

  const setScenarioForDate = (dateKey: string, scenario: string) => {
    setDayScenarios(prev => ({ ...prev, [dateKey]: scenario }));
  };

  // Время подъёма и сна из расписания
  const sleepBlock = dashSchedule.find(b => b.blockId === 'SLEEP');

  const wakeUpTime = useMemo(() => {
    if (sleepBlock) {
      const sleepEnd = sleepBlock.startHour + sleepBlock.duration / 60;
      const normalizedEnd = sleepEnd >= 24 ? sleepEnd - 24 : sleepEnd;
      return formatHour(normalizedEnd);
    }
    if (scenarioInfo?.wakeUp) {
      return formatHour(scenarioInfo.wakeUp);
    }
    return '?';
  }, [sleepBlock, scenarioInfo]);

  const sleepStartTime = useMemo(() => {
    if (sleepBlock) {
      const h = sleepBlock.startHour >= 24 ? sleepBlock.startHour - 24 : sleepBlock.startHour;
      return formatHour(h);
    }
    return '?';
  }, [sleepBlock]);

  // Ключевые блоки
  const opBlock = dashSchedule.find(b => b.blockId?.startsWith('OP'));
  const sportBlock = dashSchedule.find(b => b.blockId === 'SPORT' || b.blockId === 'SPORT_SPA');

  // Домашнее окно
  const homeWindow = useMemo(() => {
    if (!opBlock) return null;
    const roadBlock = dashSchedule.find(b => b.blockId === 'ROAD' && b.startHour < opBlock.startHour);
    if (!roadBlock) return null;
    const wakeUpHour = sleepBlock
      ? (sleepBlock.startHour + sleepBlock.duration / 60)
      : (scenarioInfo?.wakeUp || 7);
    const normalizedWakeUp = wakeUpHour >= 24 ? wakeUpHour - 24 : wakeUpHour;
    const windowDuration = Math.round((roadBlock.startHour - normalizedWakeUp) * 60);
    if (windowDuration <= 30) return null;
    return { start: normalizedWakeUp, duration: windowDuration };
  }, [dashSchedule, opBlock, sleepBlock, scenarioInfo]);

  // События таймлайна
  const timelineEvents = useMemo(() => {
    const events: TimelineEvent[] = [];

    // Подъём
    if (sleepBlock || scenarioInfo?.wakeUp) {
      events.push({
        time: wakeUpTime,
        emoji: '😴',
        title: 'Подъём',
        subtitle: 'зубы → витамины',
        color: '#6366F1',
        isVirtual: true
      });
    }

    // Домашнее окно
    if (homeWindow && homeWindow.duration > 30) {
      const hours = Math.floor(homeWindow.duration / 60);
      const mins = homeWindow.duration % 60;
      events.push({
        time: formatHour(homeWindow.start + 0.5),
        emoji: '🔥',
        title: `ОКНО ${hours > 0 ? hours + 'ч' : ''}${mins > 0 ? ' ' + mins + 'м' : ''}`,
        subtitle: CONTEXTS[dashContext]?.name || 'работа',
        color: '#F59E0B',
        highlight: true,
        isVirtual: true
      });
    }

    // Можно зал
    if (dayScenario === '4' && !sportBlock) {
      events.push({
        time: '~15:00',
        emoji: '🏋️',
        title: 'МОЖНО ЗАЛ',
        subtitle: 'вход до 17:00!',
        color: '#22C55E',
        highlight: true,
        optional: true,
        isVirtual: true
      });
    }

    // Все блоки из календаря (кроме SLEEP)
    dashSchedule.filter(b => b.blockId !== 'SLEEP').forEach(b => {
      const blockDef = DEFAULT_BLOCKS[b.blockId];
      const startTime = formatHour(b.startHour);

      if (b.blockId?.startsWith('OP')) {
        events.push({
          time: startTime,
          emoji: '🏥',
          title: 'Операции',
          subtitle: blockDef?.name || b.blockId,
          color: '#EF4444',
          fromCalendar: true
        });
        // Конец ОП
        const opEnd = b.startHour + b.duration / 60;
        events.push({
          time: `~${formatHour(opEnd)}`,
          emoji: '✅',
          title: 'Конец ОП',
          subtitle: '',
          color: '#22C55E',
          isVirtual: true
        });
      } else if (b.blockId === 'SPORT' || b.blockId === 'SPORT_SPA') {
        events.push({
          time: startTime,
          emoji: blockDef?.emoji || '🏋️',
          title: blockDef?.name || 'Спорт',
          subtitle: 'вход до 17:00!',
          color: blockDef?.color || '#22C55E',
          highlight: true,
          fromCalendar: true
        });
      } else if (['POLECHAT', 'LAB', 'SOMALAB', 'HYPER'].includes(b.blockId)) {
        events.push({
          time: startTime,
          emoji: blockDef?.emoji || '💼',
          title: b.startHour >= 19 ? (b.blockId === 'HYPER' ? 'Гиперфокус' : 'Окно совы') : (blockDef?.name || b.blockId),
          subtitle: b.startHour >= 19 ? (PROJECTS[b.blockId]?.name || '') : '',
          color: blockDef?.color || '#F59E0B',
          fromCalendar: true
        });
      } else {
        events.push({
          time: startTime,
          emoji: blockDef?.emoji || '📌',
          title: blockDef?.name || b.blockId,
          subtitle: '',
          color: blockDef?.color || '#6B7280',
          fromCalendar: true
        });
      }
    });

    // Записка перед сном
    if (sleepBlock) {
      events.push({
        time: sleepStartTime,
        emoji: '📝',
        title: 'Записка',
        subtitle: '→ зубы → сон',
        color: '#6366F1',
        isVirtual: true
      });
    }

    // Сортировка по времени
    events.sort((a, b) => {
      const parseTime = (t: string) => {
        const clean = t.replace('~', '');
        const [h, m] = clean.split(':').map(Number);
        return h + m / 60;
      };
      return parseTime(a.time) - parseTime(b.time);
    });

    return events;
  }, [dashSchedule, dashContext, dayScenario, sportBlock, sleepBlock, scenarioInfo, wakeUpTime, sleepStartTime, homeWindow]);

  // Цели на день
  const dayGoals = goals.filter(g => g.period === 'D' && !g.done && (!g.project || g.project === dashContext));
  const weekGoal = goals.find(g => g.period === 'W' && !g.done);

  const changeDashDay = (delta: number) => {
    const newDate = new Date(dashDate);
    newDate.setDate(newDate.getDate() + delta);
    setDashDate(newDate);
  };

  const goToDashToday = () => setDashDate(new Date());

  // Калькулятор Алмазова
  const almResult = useMemo(() => {
    if (!almCalc.myOp || !almCalc.currentOp) return null;

    const myOp = parseInt(almCalc.myOp);
    const currentOp = parseInt(almCalc.currentOp);
    const opsToWait = myOp - currentOp;

    if (opsToWait <= 0) {
      return { isMyTurn: true };
    }

    const currentOpRemaining = { min: 30, max: 60 };
    const perOp = { min: 60, max: 120 };
    const fullOpsToWait = Math.max(0, opsToWait - 1);
    const minWait = currentOpRemaining.min + fullOpsToWait * perOp.min;
    const maxWait = currentOpRemaining.max + fullOpsToWait * perOp.max;
    const avgWait = Math.round((minWait + maxWait) / 2);

    return { isMyTurn: false, minWait, maxWait, avgWait, opsToWait };
  }, [almCalc]);

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins} мин`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (m === 0) return `${h} ч`;
    return `${h} ч ${m} мин`;
  };

  return (
    <div className="flex-1 overflow-auto">
      {/* Навигация по дням */}
      <div className="glass border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDashDay(-1)}
            className="w-10 h-10 glass-btn rounded-xl flex items-center justify-center text-xl text-white/60 hover:text-white"
          >
            ‹
          </button>
          <button onClick={goToDashToday} className="flex-1 text-center px-4">
            <div className={`text-xl font-bold ${isToday ? 'text-orange-400' : 'text-white'}`}>
              {DAY_NAMES[dashDayOfWeek]}
            </div>
            <div className="text-sm text-white/50">
              {dashDate.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
              {isToday && <span className="text-orange-400 ml-2">• сегодня</span>}
            </div>
          </button>
          <button
            onClick={() => changeDashDay(1)}
            className="w-10 h-10 glass-btn rounded-xl flex items-center justify-center text-xl text-white/60 hover:text-white"
          >
            ›
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Карточка сценария */}
        <div className="glass rounded-2xl p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="text-2xl font-bold flex items-center gap-2">
                {dayScenario ? (
                  <>
                    <span className="text-white">{scenarioInfo?.name}</span>
                    <span className="text-sm font-normal text-white/40">в очереди</span>
                  </>
                ) : (
                  <span className="text-white/40">Выбери сценарий</span>
                )}
              </div>
              {scenarioInfo && (
                <div className="text-sm text-white/50">{scenarioInfo.desc}</div>
              )}
            </div>
            <div
              className="px-3 py-1.5 rounded-xl text-sm font-medium"
              style={{ backgroundColor: CONTEXTS[dashContext]?.color + '33', color: CONTEXTS[dashContext]?.color }}
            >
              {CONTEXTS[dashContext]?.emoji} {CONTEXTS[dashContext]?.name}
            </div>
          </div>

          {/* Выбор сценария */}
          <div className="flex gap-2 mb-4">
            {Object.entries(SCENARIOS).map(([k, s]) => (
              <button
                key={k}
                onClick={() => setScenarioForDate(dashDateKey, k)}
                className={`flex-1 py-2 rounded-xl text-xs transition-all ${
                  dayScenario === k
                    ? 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30'
                    : 'glass-btn'
                }`}
              >
                <div className="font-bold text-white">{s.name}</div>
                <div className="text-white/50" style={{ fontSize: '9px' }}>{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Ключевые метрики дня */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-dark rounded-xl p-3 text-center">
              <div className="text-xs text-white/40 mb-1">Подъём</div>
              <div className="text-2xl font-bold text-indigo-400">{wakeUpTime}</div>
            </div>
            <div className="glass-dark rounded-xl p-3 text-center">
              <div className="text-xs text-white/40 mb-1">Сон</div>
              <div className="text-2xl font-bold text-indigo-400">{sleepStartTime}</div>
            </div>
          </div>

          {/* Ключевые факты */}
          <div className="flex flex-wrap gap-2 mt-4">
            {dayScenario === '3' && (
              <div className="px-3 py-1.5 bg-red-500/20 border border-red-500/30 text-red-300 rounded-xl text-sm backdrop-blur-sm">
                ⚠️ Позвонить! Может быть 15:00
              </div>
            )}
            {homeWindow && (
              <div className="px-3 py-1.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-xl text-sm backdrop-blur-sm">
                🏠 Окно: {Math.floor(homeWindow.duration / 60)}-{Math.ceil(homeWindow.duration / 60)} часа
              </div>
            )}
            {(sportBlock || dayScenario === '4') && (
              <div className="px-3 py-1.5 bg-green-500/20 border border-green-500/30 text-green-300 rounded-xl text-sm backdrop-blur-sm">
                🏋️ Можно в зал
              </div>
            )}
            {dashDayOfWeek === 2 && (
              <div className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-xl text-sm backdrop-blur-sm">
                🏢 Офис Полечат
              </div>
            )}
            {dashDayOfWeek === 4 && (
              <div className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 rounded-xl text-sm backdrop-blur-sm">
                🏢 Офис Лаб
              </div>
            )}
            {dashDayOfWeek === 0 && (
              <div className="px-3 py-1.5 bg-orange-500/20 border border-orange-500/30 text-orange-300 rounded-xl text-sm backdrop-blur-sm">
                📊 21:00 Отчёт
              </div>
            )}
          </div>
        </div>

        {/* Таймлайн дня */}
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-medium mb-4 text-white/40 uppercase tracking-wider">Таймлайн дня</div>

          {timelineEvents.length > 0 ? (
            <div className="relative">
              <div className="absolute left-[52px] top-2 bottom-2 w-0.5 bg-white/10"></div>

              <div className="space-y-4">
                {timelineEvents.map((event, idx) => (
                  <div key={idx} className={`flex items-start gap-3 ${event.optional ? 'opacity-50' : ''}`}>
                    <div className="w-12 text-right text-sm text-white/40 pt-1 shrink-0 font-mono">
                      {event.time}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 z-10 shadow-lg ${
                        event.highlight ? 'ring-2 ring-offset-2 ring-offset-transparent animate-pulse' : ''
                      }`}
                      style={{
                        backgroundColor: event.color,
                        boxShadow: `0 0 20px ${event.color}66`
                      }}
                    >
                      {event.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-medium ${event.highlight ? 'text-yellow-300' : 'text-white'}`}>
                        {event.title}
                      </div>
                      {event.subtitle && (
                        <div className="text-xs text-white/40">{event.subtitle}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-3 opacity-50">📅</div>
              <div className="text-white/40 mb-4">Нет событий на этот день</div>
              <button
                onClick={() => onGoToTab('plan')}
                className="px-4 py-2 accent-orange rounded-xl text-sm font-medium"
              >
                Создать план
              </button>
            </div>
          )}
        </div>

        {/* Цели */}
        {(dayGoals.length > 0 || weekGoal || weekFocus) && (
          <div className="glass rounded-2xl p-4">
            <div className="text-sm font-medium mb-3 text-white/40 uppercase tracking-wider">🎯 Цели</div>

            {weekFocus && (
              <div className="glass-light border border-orange-500/30 rounded-xl p-3 mb-3">
                <div className="text-xs text-orange-400 mb-1">Фокус недели</div>
                <div className="text-sm text-white">{weekFocus}</div>
              </div>
            )}

            {weekGoal && (
              <div className="flex items-center gap-3 glass-dark rounded-xl p-3 mb-2">
                <span className="text-xs text-white/40">📆</span>
                <span className="text-sm flex-1 text-white/80">{weekGoal.text}</span>
              </div>
            )}

            {dayGoals.map(g => (
              <div
                key={g.id}
                onClick={() => toggleGoal(g.id)}
                className="flex items-center gap-3 glass-dark rounded-xl p-3 mb-2 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="w-5 h-5 rounded-full border-2 border-white/30 hover:border-green-400 transition-colors"></div>
                <span className="text-sm flex-1 text-white">{g.text}</span>
                {g.project && (
                  <span
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ backgroundColor: PROJECTS[g.project]?.color + '44' }}
                  >
                    {PROJECTS[g.project]?.emoji}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Контекст — где ты сейчас */}
        <div className="glass rounded-2xl p-4">
          <div className="text-sm font-medium mb-3 text-white/40 uppercase tracking-wider">📍 Где ты сейчас?</div>

          {!showLocationPicker ? (
            <button
              onClick={() => setShowLocationPicker(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-white/20 hover:border-white/40 transition-colors"
            >
              {currentLocation ? (
                <div className="flex items-center gap-4">
                  <div className="text-3xl">{LOCATION_CONTEXTS[currentLocation]?.emoji}</div>
                  <div className="text-left flex-1">
                    <div className="font-medium text-white">{LOCATION_CONTEXTS[currentLocation]?.name}</div>
                    <div className="text-xs text-white/50">{LOCATION_CONTEXTS[currentLocation]?.works}</div>
                  </div>
                  <div className="text-white/40">✏️</div>
                </div>
              ) : (
                <div className="text-white/40">Нажми, чтобы выбрать</div>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {Object.values(LOCATION_CONTEXTS).map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => { setCurrentLocation(loc.id); setShowLocationPicker(false); }}
                    className={`p-3 rounded-xl text-center transition-all glass-btn ${
                      currentLocation === loc.id ? 'ring-2 ring-orange-500' : ''
                    }`}
                  >
                    <div className="text-2xl mb-1">{loc.emoji}</div>
                    <div className="text-xs truncate text-white/70">{loc.name.split(' ')[0]}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowLocationPicker(false)}
                className="w-full py-2 text-sm text-white/40 hover:text-white/60"
              >
                Отмена
              </button>
            </div>
          )}

          {/* Детали выбранного контекста */}
          {currentLocation && !showLocationPicker && (() => {
            const loc = LOCATION_CONTEXTS[currentLocation];
            const projectTasks = Object.entries(loc.tasks || {});
            return (
              <div className="mt-4 space-y-3">
                {loc.warning && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-sm text-red-300">
                    ⚠️ {loc.warning}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="glass-dark rounded-xl p-3">
                    <span className="text-white/40">Время:</span> <span className="text-white/80">{loc.time}</span>
                  </div>
                  <div className="glass-dark rounded-xl p-3">
                    <span className="text-white/40">Прерывания:</span> <span className="text-white/80">{loc.interrupt}</span>
                  </div>
                  <div className="glass-dark rounded-xl p-3">
                    <span className="text-white/40">Энергия:</span> <span className="text-white/80">{loc.energy}</span>
                  </div>
                  <div className="glass-dark rounded-xl p-3">
                    <span className="text-white/40">Инструменты:</span> <span className="text-white/80">{loc.tools}</span>
                  </div>
                </div>

                <div className="glass-dark rounded-xl p-3">
                  <div className="text-xs text-white/40 mb-1">Что работает:</div>
                  <div className="text-sm text-white/80">{loc.works}</div>
                </div>

                {loc.bundle && (
                  <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-3">
                    <div className="text-xs text-yellow-400 mb-1">🎁 Связка:</div>
                    <div className="text-sm text-yellow-200">{loc.bundle}</div>
                  </div>
                )}

                {projectTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs text-white/40">По проектам:</div>
                    {projectTasks.map(([proj, task]) => (
                      <div key={proj} className="flex items-center gap-3 glass-dark rounded-xl p-3">
                        <span style={{ color: PROJECTS[proj]?.color }}>{PROJECTS[proj]?.emoji}</span>
                        <span className="text-xs text-white/50">{PROJECTS[proj]?.name}:</span>
                        <span className="text-sm flex-1 text-white/80">{task}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        {/* Калькулятор Алмазова */}
        <div className="glass rounded-2xl overflow-hidden">
          <button
            onClick={() => setShowAlmCalc(!showAlmCalc)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🏥</span>
              <span className="font-medium text-white">Калькулятор ожидания</span>
            </div>
            <span className="text-white/40 text-xs">{showAlmCalc ? '▼ свернуть' : '▶ развернуть'}</span>
          </button>

          {showAlmCalc && (
            <div className="px-4 pb-4 space-y-4">
              <div className="glass-dark rounded-xl p-4">
                <div className="flex items-center gap-6 justify-center">
                  <div className="text-center">
                    <div className="text-xs text-white/40 mb-2">Сейчас идёт</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAlmCalc({...almCalc, currentOp: Math.max(1, (parseInt(almCalc.currentOp) || 1) - 1).toString()})}
                        className="w-8 h-8 glass-btn rounded-lg"
                      >−</button>
                      <div className="w-14 h-14 bg-red-500/30 border-2 border-red-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-red-300">
                        {almCalc.currentOp || '?'}
                      </div>
                      <button
                        onClick={() => setAlmCalc({...almCalc, currentOp: Math.min(10, (parseInt(almCalc.currentOp) || 0) + 1).toString()})}
                        className="w-8 h-8 glass-btn rounded-lg"
                      >+</button>
                    </div>
                  </div>

                  <div className="text-3xl text-white/20">→</div>

                  <div className="text-center">
                    <div className="text-xs text-white/40 mb-2">Я в очереди</div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAlmCalc({...almCalc, myOp: Math.max(1, (parseInt(almCalc.myOp) || 1) - 1).toString()})}
                        className="w-8 h-8 glass-btn rounded-lg"
                      >−</button>
                      <div className="w-14 h-14 bg-orange-500/30 border-2 border-orange-500 rounded-2xl flex items-center justify-center text-2xl font-bold text-orange-300">
                        {almCalc.myOp || '?'}
                      </div>
                      <button
                        onClick={() => setAlmCalc({...almCalc, myOp: Math.min(10, (parseInt(almCalc.myOp) || 0) + 1).toString()})}
                        className="w-8 h-8 glass-btn rounded-lg"
                      >+</button>
                    </div>
                  </div>
                </div>
              </div>

              {almResult && (
                almResult.isMyTurn ? (
                  <div className="bg-gradient-to-r from-green-500/30 to-emerald-500/30 border border-green-500/50 rounded-2xl p-6 text-center">
                    <div className="text-5xl mb-3">🚨</div>
                    <div className="text-2xl font-bold text-green-300">Твоя очередь!</div>
                    <div className="text-sm text-green-400 mt-2">Готовься к операции</div>
                  </div>
                ) : almResult.avgWait !== undefined && almResult.minWait !== undefined && almResult.maxWait !== undefined && almResult.opsToWait !== undefined ? (
                  <div className="glass-dark rounded-2xl p-6 text-center">
                    <div className="text-4xl font-bold text-orange-400 mb-2">
                      ~{formatDuration(almResult.avgWait)}
                    </div>
                    <div className="text-sm text-white/50">
                      {formatDuration(almResult.minWait)} — {formatDuration(almResult.maxWait)}
                    </div>
                    <div className="text-xs text-white/30 mt-3">
                      Ещё {almResult.opsToWait} операци{almResult.opsToWait === 1 ? 'я' : almResult.opsToWait < 5 ? 'и' : 'й'} до тебя
                    </div>
                  </div>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
