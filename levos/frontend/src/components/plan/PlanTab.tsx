import { useState, useMemo, useCallback } from 'react';
import type { BlockDefinition, Schedules } from '../../types';
import { DEFAULT_BLOCKS } from '../../constants';
import { formatDate, getWeekStart, getWeekDays } from '../../utils';
import { TimeLabels } from './TimeLabels';
import { DayColumn } from './DayColumn';
import { BlockLibrary } from './BlockLibrary';
import { ScenarioModal } from './ScenarioModal';

interface PlanTabProps {
  schedules: Schedules;
  blocks?: Record<string, BlockDefinition>;
  selectedBlock: string | null;
  movingBlock: { id: string; dateKey: string } | null;
  draggingBlock: { id: string; dateKey: string; blockId: string } | null;
  dayScenarios: Record<string, string>;
  dayContexts: Record<string, string>;
  weekContexts: Record<number, string>;
  onSelectBlock: (blockId: string | null) => void;
  onPlaceBlock: (dateKey: string, hour: number) => void;
  onMoveBlock: (dateKey: string, hour: number) => void;
  onShiftBlock: (dateKey: string, blockId: string, delta: number) => void;
  onResizeBlock: (dateKey: string, blockId: string, delta: number) => void;
  onRemoveBlock: (dateKey: string, blockId: string) => void;
  onBlockClick: (dateKey: string, blockId: string) => void;
  onDragStart: (e: React.DragEvent, id: string, dateKey: string, blockId: string) => void;
  onDragEnd: () => void;
  onDrop: (dateKey: string, hour: number) => void;
  onApplyScenario: (dateKey: string, scenario: string, opCount: number, context: string) => void;
  onClearDay: (dateKey: string) => void;
  setDayScenarios: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
  setDayContexts: (fn: (prev: Record<string, string>) => Record<string, string>) => void;
}

export function PlanTab({
  schedules,
  blocks = DEFAULT_BLOCKS,
  selectedBlock,
  movingBlock,
  draggingBlock,
  dayScenarios,
  dayContexts,
  weekContexts,
  onSelectBlock,
  onPlaceBlock,
  onMoveBlock,
  onShiftBlock,
  onResizeBlock,
  onRemoveBlock,
  onBlockClick,
  onDragStart,
  onDragEnd,
  onDrop,
  onApplyScenario,
  onClearDay,
  setDayScenarios,
  setDayContexts,
}: PlanTabProps) {
  const [weekStart, setWeekStart] = useState(() => getWeekStart());
  const [showBlockLibrary, setShowBlockLibrary] = useState(false);
  const [scenarioModal, setScenarioModal] = useState<{ dateKey: string; dayOfWeek: number } | null>(null);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const prevWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - 7);
      return d;
    });
  }, []);

  const nextWeek = useCallback(() => {
    setWeekStart((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + 7);
      return d;
    });
  }, []);

  const goToToday = useCallback(() => {
    setWeekStart(getWeekStart());
  }, []);

  // Get sleep overflow from previous day
  const getSleepOverflow = useCallback(
    (_dateKey: string, dayIndex: number) => {
      if (dayIndex === 0) return null;

      const prevDate = weekDays[dayIndex - 1];
      const prevDateKey = formatDate(prevDate);
      const prevSchedule = schedules[prevDateKey] || [];

      const sleepBlock = prevSchedule.find(
        (b) => b.blockId === 'SLEEP' && b.startHour >= 24
      );

      return sleepBlock || null;
    },
    [weekDays, schedules]
  );

  const handleSlotClick = useCallback(
    (dateKey: string, hour: number) => {
      if (movingBlock) {
        onMoveBlock(dateKey, hour);
      } else if (selectedBlock) {
        onPlaceBlock(dateKey, hour);
        setShowBlockLibrary(false);
      }
    },
    [movingBlock, selectedBlock, onMoveBlock, onPlaceBlock]
  );

  const handleDayHeaderClick = useCallback((dateKey: string) => {
    const date = new Date(dateKey);
    setScenarioModal({ dateKey, dayOfWeek: date.getDay() });
  }, []);

  const handleApplyScenario = useCallback(
    (scenario: string, opCount: number, context: string) => {
      if (!scenarioModal) return;

      const { dateKey } = scenarioModal;

      // Save scenario for this date
      setDayScenarios((prev) => ({ ...prev, [dateKey]: scenario }));

      // Save context for this date
      setDayContexts((prev) => ({ ...prev, [dateKey]: context }));

      // Apply scenario
      onApplyScenario(dateKey, scenario, opCount, context);

      setScenarioModal(null);
    },
    [scenarioModal, onApplyScenario, setDayScenarios, setDayContexts]
  );

  const handleClearDay = useCallback(() => {
    if (!scenarioModal) return;
    onClearDay(scenarioModal.dateKey);
    setScenarioModal(null);
  }, [scenarioModal, onClearDay]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Week navigation */}
      <div className="glass border-b border-white/10 flex items-center justify-between px-2 py-1.5 shrink-0">
        <button
          onClick={prevWeek}
          className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center text-white/60 hover:text-white text-lg"
        >
          ‹
        </button>
        <button
          onClick={goToToday}
          className="text-sm text-white/70 hover:text-white transition-colors font-medium"
        >
          {weekStart.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })} — {weekDays[6].toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
        </button>
        <button
          onClick={nextWeek}
          className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center text-white/60 hover:text-white text-lg"
        >
          ›
        </button>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto timeline-scroll">
        <div className="flex h-full">
          <TimeLabels />

          {weekDays.map((date, index) => {
            const dateKey = formatDate(date);
            const schedule = schedules[dateKey] || [];
            const sleepOverflow = getSleepOverflow(dateKey, index);
            const dayOfWeek = date.getDay();
            const dayScenario = dayScenarios[dateKey] || null;
            // Use day-specific context, or fall back to week template
            const dayContext = dayContexts[dateKey] || weekContexts[dayOfWeek] || 'POLECHAT';

            return (
              <DayColumn
                key={dateKey}
                date={date}
                dateKey={dateKey}
                schedule={schedule}
                blocks={blocks}
                selectedBlock={selectedBlock}
                movingBlock={movingBlock}
                draggingBlock={draggingBlock}
                prevDaySleepOverflow={sleepOverflow}
                dayScenario={dayScenario}
                weekContext={dayContext}
                onSlotClick={(hour) => handleSlotClick(dateKey, hour)}
                onBlockClick={(blockId) => onBlockClick(dateKey, blockId)}
                onDragStart={(e, id, blockType) => onDragStart(e, id, dateKey, blockType)}
                onDragEnd={onDragEnd}
                onDrop={(hour) => onDrop(dateKey, hour)}
                onShiftBlock={(blockId, delta) => onShiftBlock(dateKey, blockId, delta)}
                onResizeBlock={(blockId, delta) => onResizeBlock(dateKey, blockId, delta)}
                onRemoveBlock={(blockId) => onRemoveBlock(dateKey, blockId)}
                onHeaderClick={() => handleDayHeaderClick(dateKey)}
              />
            );
          })}
        </div>
      </div>

      {/* Floating action button */}
      <button
        onClick={() => setShowBlockLibrary(!showBlockLibrary)}
        className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-xl text-white transition-all z-20 ${
          showBlockLibrary
            ? 'bg-red-500 rotate-45 shadow-red-500/30'
            : 'bg-gradient-to-br from-orange-500 to-amber-600 hover:scale-105 shadow-orange-500/30'
        }`}
      >
        {showBlockLibrary ? '×' : '＋'}
      </button>

      {/* Block library overlay */}
      {showBlockLibrary && (
        <BlockLibrary
          selectedBlock={selectedBlock}
          onSelectBlock={onSelectBlock}
          onClose={() => setShowBlockLibrary(false)}
        />
      )}

      {/* Scenario modal */}
      {scenarioModal && (
        <ScenarioModal
          dateKey={scenarioModal.dateKey}
          dayOfWeek={scenarioModal.dayOfWeek}
          currentScenario={dayScenarios[scenarioModal.dateKey] || null}
          currentContext={dayContexts[scenarioModal.dateKey] || weekContexts[scenarioModal.dayOfWeek] || 'POLECHAT'}
          onApply={handleApplyScenario}
          onClear={handleClearDay}
          onClose={() => setScenarioModal(null)}
        />
      )}
    </div>
  );
}
