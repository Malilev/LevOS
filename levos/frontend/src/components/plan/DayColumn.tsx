import { useMemo } from 'react';
import type { ScheduleBlock as ScheduleBlockType, BlockDefinition } from '../../types';
import { TIME_SLOTS, SLOT_HEIGHT, DEFAULT_BLOCKS, SCENARIOS, CONTEXTS } from '../../constants';
import { getDayName, getDayNumber, isToday } from '../../utils';
import { ScheduleBlock } from './ScheduleBlock';

interface DayColumnProps {
  date: Date;
  dateKey: string;
  schedule: ScheduleBlockType[];
  blocks: Record<string, BlockDefinition>;
  selectedBlock: string | null;
  movingBlock: { id: string; dateKey: string } | null;
  draggingBlock: { id: string; dateKey: string; blockId: string } | null;
  prevDaySleepOverflow: ScheduleBlockType | null;
  dayScenario?: string | null;
  weekContext?: string;
  onSlotClick: (hour: number) => void;
  onBlockClick: (blockId: string) => void;
  onDragStart: (e: React.DragEvent, blockId: string, blockType: string) => void;
  onDragEnd: () => void;
  onDrop: (hour: number) => void;
  onShiftBlock: (blockId: string, delta: number) => void;
  onResizeBlock: (blockId: string, delta: number) => void;
  onRemoveBlock: (blockId: string) => void;
  onHeaderClick: () => void;
}

export function DayColumn({
  date,
  dateKey,
  schedule,
  blocks = DEFAULT_BLOCKS,
  selectedBlock,
  movingBlock,
  draggingBlock,
  prevDaySleepOverflow,
  dayScenario,
  weekContext = 'POLECHAT',
  onSlotClick,
  onBlockClick,
  onDragStart,
  onDragEnd,
  onDrop,
  onShiftBlock,
  onResizeBlock,
  onRemoveBlock,
  onHeaderClick,
}: DayColumnProps) {
  const today = isToday(date);
  const dayOfWeek = date.getDay();
  const dayName = getDayName(date);
  const dayNum = getDayNumber(date);
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const scenarioInfo = dayScenario ? SCENARIOS[dayScenario] : null;
  const contextInfo = CONTEXTS[weekContext];

  // Calculate sleep overflow from previous day
  const sleepOverflowBlock = useMemo(() => {
    if (!prevDaySleepOverflow) return null;

    const sleepDurationHours = prevDaySleepOverflow.duration / 60;
    const endHourNextDay = prevDaySleepOverflow.startHour - 24 + sleepDurationHours;

    if (endHourNextDay > 6) {
      return {
        ...prevDaySleepOverflow,
        id: `${prevDaySleepOverflow.id}-overflow`,
        startHour: 6,
        duration: (endHourNextDay - 6) * 60,
        isOverflow: true,
      };
    }
    return null;
  }, [prevDaySleepOverflow]);

  // Calculate display duration for sleep blocks that extend past 06:00
  const getDisplayDuration = (item: ScheduleBlockType) => {
    if (item.blockId !== 'SLEEP' || item.startHour < 24) return item.duration;

    const endHour = item.startHour + item.duration / 60;
    if (endHour > 30) {
      return (30 - item.startHour) * 60;
    }
    return item.duration;
  };

  // Night background position (00:00 - 06:00, which is hours 24-30)
  const nightStartIdx = TIME_SLOTS.findIndex((s) => s.hour === 24);
  const nightTop = nightStartIdx * SLOT_HEIGHT;
  const nightHeight = 13 * SLOT_HEIGHT;

  return (
    <div className="flex-1 min-w-0 border-r border-white/10 last:border-r-0">
      {/* Day header */}
      <div
        onClick={onHeaderClick}
        className={`sticky top-0 z-10 p-1 text-center cursor-pointer transition-all border-b border-white/10 ${
          today
            ? 'bg-gradient-to-br from-orange-500/80 to-amber-600/80 backdrop-blur-xl'
            : 'glass'
        }`}
        style={{ height: '52px' }}
      >
        <div className="flex items-center justify-center gap-1">
          <span className={`font-bold ${isWeekend ? 'text-orange-300' : today ? 'text-white' : 'text-white/70'}`} style={{ fontSize: '11px' }}>
            {dayName}
          </span>
          <span className={`${today ? 'text-orange-200' : 'text-white/50'}`} style={{ fontSize: '11px' }}>
            {dayNum}
          </span>
          {scenarioInfo && (
            <span
              className="px-1 rounded text-white bg-gradient-to-r from-orange-500 to-amber-500"
              style={{ fontSize: '8px' }}
            >
              {scenarioInfo.name}
            </span>
          )}
        </div>
        {contextInfo && (
          <div
            className="px-1 py-0.5 rounded mx-0.5 mt-0.5"
            style={{
              backgroundColor: contextInfo.color + '33',
              color: contextInfo.color,
              fontSize: '9px',
            }}
          >
            {contextInfo.emoji} {contextInfo.name}
          </div>
        )}
      </div>

      {/* Schedule area */}
      <div className="relative" style={{ height: TIME_SLOTS.length * SLOT_HEIGHT }}>
        {/* Night background */}
        <div
          className="absolute left-0 right-0 bg-indigo-950/40 pointer-events-none"
          style={{ top: nightTop, height: nightHeight }}
        />

        {/* Midnight divider */}
        <div
          className="absolute left-0 right-0 bg-indigo-500 z-10 pointer-events-none"
          style={{ top: nightStartIdx * SLOT_HEIGHT, height: 2 }}
        />

        {/* Time slots */}
        {TIME_SLOTS.map((slot, idx) => (
          <div
            key={slot.hour}
            className={`absolute left-0 right-0 border-b ${
              slot.isHalf ? 'border-white/5 border-dashed' : 'border-white/10'
            } ${selectedBlock || movingBlock ? 'hover:bg-green-500/20 cursor-pointer' : ''} ${
              draggingBlock ? 'hover:bg-blue-500/20' : ''
            }`}
            style={{ top: idx * SLOT_HEIGHT, height: SLOT_HEIGHT }}
            onClick={() => onSlotClick(slot.hour)}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={() => onDrop(slot.hour)}
          />
        ))}

        {/* Sleep overflow from previous day */}
        {sleepOverflowBlock && (
          <ScheduleBlock
            block={sleepOverflowBlock}
            blockDef={blocks.SLEEP || DEFAULT_BLOCKS.SLEEP}
            isMoving={false}
            isDragging={false}
            isOverflow={true}
            sleepHours={Math.round(prevDaySleepOverflow!.duration / 60)}
            onDragStart={() => {}}
            onDragEnd={() => {}}
            onClick={() => {}}
            onShift={() => {}}
            onResize={() => {}}
            onRemove={() => {}}
          />
        )}

        {/* Schedule blocks */}
        {schedule.map((item) => {
          const blockDef = blocks[item.blockId] || DEFAULT_BLOCKS[item.blockId];
          if (!blockDef) return null;

          const isMovingThis = movingBlock?.id === item.id && movingBlock?.dateKey === dateKey;
          const isDraggingThis = draggingBlock?.id === item.id && draggingBlock?.dateKey === dateKey;
          const displayDuration = getDisplayDuration(item);
          const sleepHours = item.blockId === 'SLEEP' ? Math.round(item.duration / 60) : undefined;

          return (
            <ScheduleBlock
              key={item.id}
              block={item}
              blockDef={blockDef}
              isMoving={isMovingThis}
              isDragging={isDraggingThis}
              displayDuration={displayDuration !== item.duration ? displayDuration : undefined}
              sleepHours={sleepHours}
              onDragStart={(e) => onDragStart(e, item.id, item.blockId)}
              onDragEnd={onDragEnd}
              onClick={() => onBlockClick(item.id)}
              onShift={(delta) => onShiftBlock(item.id, delta)}
              onResize={(delta) => onResizeBlock(item.id, delta)}
              onRemove={() => onRemoveBlock(item.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
