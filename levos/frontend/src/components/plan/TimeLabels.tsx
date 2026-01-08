import { TIME_SLOTS, SLOT_HEIGHT } from '../../constants';

export function TimeLabels() {
  return (
    <div className="sticky left-0 z-20 w-8 flex-shrink-0" style={{ backgroundColor: 'rgba(15, 12, 41, 0.95)' }}>
      {/* Corner cell */}
      <div className="h-[52px] sticky top-0 z-30" style={{ backgroundColor: 'rgba(15, 12, 41, 0.95)' }} />

      {/* Time slots */}
      {TIME_SLOTS.map((slot) => (
        <div
          key={slot.hour}
          className={`text-xs text-white/40 pr-1 text-right ${
            slot.isMidnight ? 'bg-indigo-950/50' : slot.isNight ? 'bg-indigo-950/30' : ''
          }`}
          style={{ height: SLOT_HEIGHT }}
        >
          {slot.label}
        </div>
      ))}
    </div>
  );
}
