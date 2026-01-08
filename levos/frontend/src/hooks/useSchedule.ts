import { useState, useCallback, useMemo, useRef } from 'react';
import type { ScheduleBlock, BlockDefinition, Schedules } from '../types';
import { DEFAULT_BLOCKS, roundToHalfHour, SCENARIOS, CONTEXTS } from '../constants';
import { formatDate } from '../utils';

interface UseScheduleOptions {
  initialSchedules?: Schedules;
  blocks?: Record<string, BlockDefinition>;
}

interface MovingBlock {
  id: string;
  dateKey: string;
}

interface DraggingBlock {
  id: string;
  dateKey: string;
  blockId: string;
}

export function useSchedule({ initialSchedules = {}, blocks = DEFAULT_BLOCKS }: UseScheduleOptions = {}) {
  const [schedules, setSchedules] = useState<Schedules>(initialSchedules);
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [movingBlock, setMovingBlock] = useState<MovingBlock | null>(null);
  const [draggingBlock, setDraggingBlock] = useState<DraggingBlock | null>(null);

  // Ref for drag data (avoids timing issues between onDrop and onDragEnd)
  const dragDataRef = useRef<DraggingBlock | null>(null);

  // Today's key
  const todayKey = useMemo(() => formatDate(new Date()), []);

  // Check for collision
  const hasCollision = useCallback(
    (schedule: ScheduleBlock[], newStart: number, newDuration: number, excludeIds: string[] = []) => {
      const newEnd = newStart + newDuration / 60;
      return schedule.some(
        (b) =>
          !excludeIds.includes(b.id) &&
          newStart < b.startHour + b.duration / 60 &&
          newEnd > b.startHour
      );
    },
    []
  );

  // Generate auto-blocks for operations
  const generateAutoBlocks = useCallback((opStart: number, opDuration: number): ScheduleBlock[] => {
    const opEnd = opStart + opDuration / 60;
    const result: ScheduleBlock[] = [];
    const ts = Date.now();

    // ROAD before operation
    const roadStart = roundToHalfHour(opStart - 0.5);
    if (roadStart >= 7) {
      result.push({ id: `ROAD-${ts}`, blockId: 'ROAD', startHour: roadStart, duration: 25, auto: true });
    }

    // BUFFER after operation
    result.push({ id: `BUFFER-${ts}`, blockId: 'BUFFER', startHour: roundToHalfHour(opEnd), duration: 30, auto: true });

    // FAM after buffer
    const famStart = roundToHalfHour(opEnd + 0.5);
    if (famStart < 22) {
      result.push({ id: `FAM-${ts}`, blockId: 'FAM', startHour: famStart, duration: 50, auto: true });
    }

    return result;
  }, []);

  // Place a new block
  const placeBlock = useCallback(
    (dateKey: string, hour: number) => {
      if (!selectedBlock) return;

      const blockDef = blocks[selectedBlock];
      if (!blockDef) return;

      // OP blocks can't be placed after 21:00
      if (selectedBlock.startsWith('OP') && hour >= 21) return;

      const schedule = schedules[dateKey] || [];
      if (hasCollision(schedule, hour, blockDef.duration)) return;

      let newSchedule: ScheduleBlock[] = [
        ...schedule,
        {
          id: `${selectedBlock}-${Date.now()}`,
          blockId: selectedBlock,
          startHour: hour,
          duration: blockDef.duration,
        },
      ];

      // Add auto-blocks for operations
      if (selectedBlock.startsWith('OP')) {
        newSchedule = [...newSchedule, ...generateAutoBlocks(hour, blockDef.duration)];
      }

      setSchedules((prev) => ({ ...prev, [dateKey]: newSchedule }));
      setSelectedBlock(null);
    },
    [selectedBlock, schedules, blocks, hasCollision, generateAutoBlocks]
  );

  // Drag & Drop handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, id: string, dateKey: string, blockId: string) => {
      dragDataRef.current = { id, dateKey, blockId };
      setDraggingBlock({ id, dateKey, blockId });
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ id, dateKey }));
    },
    []
  );

  const handleDragEnd = useCallback(() => {
    dragDataRef.current = null;
    setDraggingBlock(null);
  }, []);

  const handleDrop = useCallback(
    (toDateKey: string, newHour: number) => {
      const dragData = dragDataRef.current;
      if (!dragData) return;

      const { id, dateKey: fromDateKey } = dragData;
      const fromSchedule = schedules[fromDateKey] || [];
      const block = fromSchedule.find((b) => b.id === id);

      if (!block) return;
      if (block.blockId.startsWith('OP') && newHour >= 21) return;

      const toSchedule = fromDateKey === toDateKey ? fromSchedule : schedules[toDateKey] || [];
      const excludeIds = block.blockId.startsWith('OP')
        ? [id, ...fromSchedule.filter((b) => b.auto).map((b) => b.id)]
        : [id];

      const targetSchedule = toSchedule.filter(
        (b) => fromDateKey !== toDateKey || !excludeIds.includes(b.id)
      );

      if (hasCollision(targetSchedule, newHour, block.duration)) return;

      let newFromSchedule = fromSchedule.filter((b) => b.id !== id);
      if (block.blockId.startsWith('OP')) {
        newFromSchedule = newFromSchedule.filter((b) => !b.auto);
      }

      let newToSchedule = fromDateKey === toDateKey ? newFromSchedule : [...toSchedule];
      newToSchedule = [...newToSchedule, { ...block, startHour: newHour }];

      if (block.blockId.startsWith('OP')) {
        newToSchedule = [...newToSchedule, ...generateAutoBlocks(newHour, block.duration)];
      }

      setSchedules((prev) => ({
        ...prev,
        [fromDateKey]: newFromSchedule,
        [toDateKey]: newToSchedule,
      }));

      dragDataRef.current = null;
      setDraggingBlock(null);
    },
    [schedules, hasCollision, generateAutoBlocks]
  );

  // Click-to-move
  const moveBlock = useCallback(
    (toDateKey: string, newHour: number) => {
      if (!movingBlock) return;

      const { id, dateKey: fromDateKey } = movingBlock;
      const fromSchedule = schedules[fromDateKey] || [];
      const block = fromSchedule.find((b) => b.id === id);

      if (!block) return;
      if (block.blockId.startsWith('OP') && newHour >= 21) return;

      const toSchedule = fromDateKey === toDateKey ? fromSchedule : schedules[toDateKey] || [];
      const excludeIds = block.blockId.startsWith('OP')
        ? [id, ...fromSchedule.filter((b) => b.auto).map((b) => b.id)]
        : [id];

      const targetSchedule = toSchedule.filter(
        (b) => fromDateKey !== toDateKey || !excludeIds.includes(b.id)
      );

      if (hasCollision(targetSchedule, newHour, block.duration)) return;

      let newFromSchedule = fromSchedule.filter((b) => b.id !== id);
      if (block.blockId.startsWith('OP')) {
        newFromSchedule = newFromSchedule.filter((b) => !b.auto);
      }

      let newToSchedule = fromDateKey === toDateKey ? newFromSchedule : [...toSchedule];
      newToSchedule = [...newToSchedule, { ...block, startHour: newHour }];

      if (block.blockId.startsWith('OP')) {
        newToSchedule = [...newToSchedule, ...generateAutoBlocks(newHour, block.duration)];
      }

      setSchedules((prev) => ({
        ...prev,
        [fromDateKey]: newFromSchedule,
        [toDateKey]: newToSchedule,
      }));

      setMovingBlock(null);
    },
    [movingBlock, schedules, hasCollision, generateAutoBlocks]
  );

  // Shift block by ±30 min
  const shiftBlock = useCallback(
    (dateKey: string, blockId: string, delta: number) => {
      const schedule = schedules[dateKey] || [];
      const block = schedule.find((b) => b.id === blockId);
      if (!block) return;

      const newHour = block.startHour + delta;
      if (newHour < 6 || newHour > 30) return;
      if (block.blockId.startsWith('OP') && newHour >= 21) return;

      const excludeIds = block.blockId.startsWith('OP')
        ? [blockId, ...schedule.filter((b) => b.auto).map((b) => b.id)]
        : [blockId];

      if (hasCollision(schedule, newHour, block.duration, excludeIds)) return;

      let newSchedule = schedule.map((b) => (b.id === blockId ? { ...b, startHour: newHour } : b));

      if (block.blockId.startsWith('OP')) {
        newSchedule = newSchedule.filter((b) => !b.auto);
        newSchedule = [...newSchedule, ...generateAutoBlocks(newHour, block.duration)];
      }

      setSchedules((prev) => ({ ...prev, [dateKey]: newSchedule }));
    },
    [schedules, hasCollision, generateAutoBlocks]
  );

  // Resize block
  const resizeBlock = useCallback(
    (dateKey: string, blockId: string, delta: number) => {
      const schedule = schedules[dateKey] || [];
      const block = schedule.find((b) => b.id === blockId);
      if (!block) return;

      const blockDef = blocks[block.blockId];
      if (!blockDef) return;

      const newDuration = block.duration + delta;
      if (newDuration < blockDef.minDur || newDuration > blockDef.maxDur) return;

      const excludeIds = block.blockId.startsWith('OP')
        ? [blockId, ...schedule.filter((b) => b.auto).map((b) => b.id)]
        : [blockId];

      if (hasCollision(schedule, block.startHour, newDuration, excludeIds)) return;

      let newSchedule = schedule.map((b) => (b.id === blockId ? { ...b, duration: newDuration } : b));

      if (block.blockId.startsWith('OP')) {
        newSchedule = newSchedule.filter((b) => !b.auto);
        const opBlock = newSchedule.find((b) => b.id === blockId)!;
        newSchedule = [...newSchedule, ...generateAutoBlocks(opBlock.startHour, newDuration)];
      }

      setSchedules((prev) => ({ ...prev, [dateKey]: newSchedule }));
    },
    [schedules, blocks, hasCollision, generateAutoBlocks]
  );

  // Remove block
  const removeBlock = useCallback(
    (dateKey: string, blockId: string) => {
      const schedule = schedules[dateKey] || [];
      const block = schedule.find((b) => b.id === blockId);
      if (!block) return;

      let newSchedule = schedule.filter((b) => b.id !== blockId);

      // Remove auto-blocks if removing an OP
      if (block.blockId.startsWith('OP')) {
        newSchedule = newSchedule.filter((b) => !b.auto);
      }

      setSchedules((prev) => ({ ...prev, [dateKey]: newSchedule }));
    },
    [schedules]
  );

  // Apply scenario
  const applyScenario = useCallback(
    (dateKey: string, scenarioKey: string, opCount: number, contextKey: string) => {
      const scenario = SCENARIOS[scenarioKey];
      const context = CONTEXTS[contextKey];
      if (!scenario) return;

      const schedule: ScheduleBlock[] = [];
      const ts = Date.now();

      const opBlockId = opCount === 1 ? 'OP_1' : opCount === 2 ? 'OP_2' : 'OP_3';
      const opDuration = blocks[opBlockId]?.duration || 180;

      if (scenario.isWeekend) {
        schedule.push({ id: `SLEEP-${ts}`, blockId: 'SLEEP', startHour: 27, duration: 480 });
        schedule.push({ id: `FAM-${ts}`, blockId: 'FAM', startHour: 12, duration: 120 });
        schedule.push({ id: `WALK-${ts}`, blockId: 'WALK', startHour: 14.5, duration: 90 });
        schedule.push({ id: `SPORT-${ts}`, blockId: 'SPORT_SPA', startHour: 16.5, duration: 150 });
        schedule.push({ id: `HYPER-${ts}`, blockId: 'HYPER', startHour: 20, duration: 180 });
      } else if (scenario.opStart) {
        // Sleep
        const sleepStart = scenario.wakeUp - 8 + 24;
        schedule.push({ id: `SLEEP-${ts}`, blockId: 'SLEEP', startHour: sleepStart, duration: 480 });

        // Home window work
        if (scenario.homeWindow && context) {
          schedule.push({
            id: `HOME-${ts}`,
            blockId: context.blockId,
            startHour: scenario.homeWindow.start,
            duration: scenario.homeWindow.dur,
          });
        }

        // Gym for 4th scenario
        if (scenario.canGym) {
          schedule.push({ id: `SPORT-${ts}`, blockId: 'SPORT', startHour: 12.5, duration: 90 });
        }

        // Road and operations
        schedule.push({ id: `ROAD-${ts}`, blockId: 'ROAD', startHour: scenario.opStart - 0.5, duration: 25, auto: true });
        schedule.push({ id: `OP-${ts}`, blockId: opBlockId, startHour: scenario.opStart, duration: opDuration });

        const opEnd = scenario.opStart + opDuration / 60;
        schedule.push({ id: `BUFFER-${ts}`, blockId: 'BUFFER', startHour: roundToHalfHour(opEnd), duration: 30, auto: true });
        schedule.push({ id: `ROAD2-${ts}`, blockId: 'ROAD', startHour: roundToHalfHour(opEnd + 0.5), duration: 25, auto: true });

        // Family after return
        const famStart = roundToHalfHour(opEnd + 1);
        if (famStart < 22) {
          schedule.push({ id: `FAM-${ts}`, blockId: 'FAM', startHour: famStart, duration: 50, auto: true });
        }

        // Evening work
        const eveStart = roundToHalfHour(famStart + 1);
        if (eveStart < 23 && context) {
          schedule.push({
            id: `EVE-${ts}`,
            blockId: context.blockId,
            startHour: eveStart,
            duration: Math.min(180, (24 - eveStart) * 60),
          });
        }
      }

      setSchedules((prev) => ({ ...prev, [dateKey]: schedule }));
    },
    [blocks]
  );

  return {
    schedules,
    setSchedules,
    selectedBlock,
    setSelectedBlock,
    movingBlock,
    setMovingBlock,
    draggingBlock,
    todayKey,
    placeBlock,
    moveBlock,
    shiftBlock,
    resizeBlock,
    removeBlock,
    applyScenario,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    hasCollision,
  };
}
