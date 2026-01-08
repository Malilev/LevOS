import type { BlockDefinition } from '../types';

export const DEFAULT_BLOCKS: Record<string, BlockDefinition> = {
  OP_1: { id: 'OP_1', name: '1 операция', emoji: '🏥', category: 'OP', color: '#EF4444', duration: 180, minDur: 120, maxDur: 240 },
  OP_2: { id: 'OP_2', name: '2 операции', emoji: '🏥🏥', category: 'OP', color: '#DC2626', duration: 300, minDur: 240, maxDur: 420 },
  OP_3: { id: 'OP_3', name: '3 операции', emoji: '🏥🏥🏥', category: 'OP', color: '#B91C1C', duration: 420, minDur: 360, maxDur: 540 },
  BUFFER: { id: 'BUFFER', name: 'Буфер', emoji: '⏳', category: 'BUFFER', color: '#6B7280', duration: 30, minDur: 15, maxDur: 60 },
  ROAD: { id: 'ROAD', name: 'Дорога', emoji: '🚶', category: 'BUFFER', color: '#4B5563', duration: 25, minDur: 20, maxDur: 40 },
  FAM: { id: 'FAM', name: '50 мин Май', emoji: '👨‍👩‍👧', category: 'SACRED', color: '#A855F7', duration: 50, minDur: 30, maxDur: 120 },
  WALK: { id: 'WALK', name: 'Прогулка Май', emoji: '🚶‍♂️', category: 'SACRED', color: '#9333EA', duration: 90, minDur: 60, maxDur: 120 },
  POLECHAT: { id: 'POLECHAT', name: 'Полечат', emoji: '💼', category: 'POLECHAT', color: '#3B82F6', duration: 120, minDur: 30, maxDur: 300 },
  CALL_P: { id: 'CALL_P', name: 'Звонок Полечат', emoji: '📞💼', category: 'POLECHAT', color: '#2563EB', duration: 60, minDur: 30, maxDur: 90 },
  SOMALAB: { id: 'SOMALAB', name: 'Сомалаб', emoji: '⚡', category: 'SOMALAB', color: '#F97316', duration: 90, minDur: 30, maxDur: 180 },
  CALL_S: { id: 'CALL_S', name: 'Звонок Сомалаб', emoji: '📞⚡', category: 'SOMALAB', color: '#EA580C', duration: 60, minDur: 30, maxDur: 90 },
  LAB: { id: 'LAB', name: 'Лаборатория', emoji: '🔬', category: 'LAB', color: '#8B5CF6', duration: 120, minDur: 60, maxDur: 240 },
  SPORT: { id: 'SPORT', name: 'Спорт', emoji: '🏋️', category: 'CARE', color: '#22C55E', duration: 90, minDur: 60, maxDur: 150 },
  SPORT_SPA: { id: 'SPORT_SPA', name: 'Спорт+СПА', emoji: '🏋️🧖', category: 'CARE', color: '#16A34A', duration: 150, minDur: 120, maxDur: 180 },
  NAP: { id: 'NAP', name: 'Power Nap', emoji: '💤', category: 'CARE', color: '#14B8A6', duration: 30, minDur: 20, maxDur: 45 },
  SLEEP: { id: 'SLEEP', name: 'Сон', emoji: '😴', category: 'NIGHT', color: '#6366F1', duration: 480, minDur: 360, maxDur: 540 },
  HYPER: { id: 'HYPER', name: 'Гиперфокус', emoji: '🔥', category: 'FREE', color: '#F59E0B', duration: 180, minDur: 120, maxDur: 360 },
  FREE: { id: 'FREE', name: 'Свободное', emoji: '🎨', category: 'FREE', color: '#EAB308', duration: 60, minDur: 30, maxDur: 180 },
};

export const isOperationBlock = (blockId: string): boolean => {
  return blockId.startsWith('OP_');
};
