import type { ScheduleBlock as ScheduleBlockType, BlockDefinition } from '../../types';
import { SLOT_HEIGHT, TIME_SLOTS } from '../../constants';

interface ScheduleBlockProps {
  block: ScheduleBlockType;
  blockDef: BlockDefinition;
  isMoving: boolean;
  isDragging: boolean;
  displayDuration?: number;
  isOverflow?: boolean;
  sleepHours?: number;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onClick: () => void;
  onShift: (delta: number) => void;
  onResize: (delta: number) => void;
  onRemove: () => void;
}

export function ScheduleBlock({
  block,
  blockDef,
  isMoving,
  isDragging,
  displayDuration,
  isOverflow,
  sleepHours,
  onDragStart,
  onDragEnd,
  onClick,
  onShift,
  onResize,
  onRemove,
}: ScheduleBlockProps) {
  const startIdx = TIME_SLOTS.findIndex((s) => s.hour === block.startHour);
  const duration = displayDuration || block.duration;
  const top = startIdx * SLOT_HEIGHT;
  const height = (duration / 30) * SLOT_HEIGHT - 1;

  const isSleep = block.blockId === 'SLEEP';

  return (
    <div
      draggable={!block.auto}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute left-0.5 right-0.5 rounded-lg overflow-hidden backdrop-blur-sm ${
        block.auto ? '' : 'cursor-grab active:cursor-grabbing'
      } ${isDragging ? 'ring-2 ring-white shadow-lg' : ''} ${
        isMoving ? 'ring-2 ring-yellow-400 z-10 shadow-xl shadow-yellow-500/30' : ''
      } ${isOverflow ? 'border-t-2 border-dashed border-indigo-400' : ''}`}
      style={{
        top,
        height,
        backgroundColor: blockDef.color + 'dd',
        boxShadow: `0 2px 8px ${blockDef.color}44`,
        opacity: block.auto ? 0.6 : isDragging || isMoving ? 0.5 : isOverflow ? 0.7 : 1,
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      <div className="p-0.5 text-white h-full flex flex-col" style={{ fontSize: '8px' }}>
        <div className="flex items-center gap-0.5 truncate">
          <span>{blockDef.emoji}</span>
          {height > 16 && (
            <span className="truncate">
              {blockDef.name}
              {isSleep && sleepHours ? ` (${sleepHours}h)` : ''}
            </span>
          )}
        </div>

        {height >= 32 && (
          <div className="flex items-center justify-between mt-auto">
            <span className="opacity-70">{block.duration}m</span>
            <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
              {/* Shift buttons */}
              <button
                onClick={() => onShift(-0.5)}
                className="w-3.5 h-3.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                ↑
              </button>
              <button
                onClick={() => onShift(0.5)}
                className="w-3.5 h-3.5 bg-white/20 hover:bg-white/30 rounded text-xs transition-colors"
              >
                ↓
              </button>
              {/* Resize buttons */}
              <button
                onClick={() => onResize(-30)}
                disabled={block.duration <= blockDef.minDur}
                className="w-3.5 h-3.5 bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 transition-colors"
              >
                −
              </button>
              <button
                onClick={() => onResize(30)}
                disabled={block.duration >= blockDef.maxDur}
                className="w-3.5 h-3.5 bg-white/20 hover:bg-white/30 rounded disabled:opacity-30 transition-colors"
              >
                +
              </button>
              {/* Remove button */}
              <button
                onClick={onRemove}
                className="w-3.5 h-3.5 bg-red-500/40 hover:bg-red-500/60 rounded transition-colors"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
