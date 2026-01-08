import type { Project, MetricConfig } from '../types';

export const PROJECTS: Record<string, Project> = {
  POLECHAT: { name: 'Полечат', color: '#3B82F6', emoji: '💼' },
  SOMALAB: { name: 'Сомалаб', color: '#F97316', emoji: '⚡' },
  LAB: { name: 'Лаб', color: '#8B5CF6', emoji: '🔬' },
  FAMILY: { name: 'Семья', color: '#A855F7', emoji: '👨‍👩‍👧' },
  PERSONAL: { name: 'Личное', color: '#EAB308', emoji: '🎯' },
};

export const METRICS_CONFIG: Record<string, MetricConfig[]> = {
  POLECHAT: [
    { key: 'contacts', label: 'Контактов с врачами', emoji: '👨‍⚕️', target: 5 },
    { key: 'pilots', label: 'Пилотов/платящих', emoji: '💰' },
    { key: 'legal', label: 'Юр. вопросов закрыто', emoji: '📜' },
  ],
  LAB: [
    { key: 'grants', label: 'Заявок на гранты', emoji: '📝' },
    { key: 'publications', label: 'Публикаций в работе', emoji: '📄' },
    { key: 'talks', label: 'Выступлений', emoji: '🎤' },
  ],
  SOMALAB: [
    { key: 'revenue', label: 'Выручка', emoji: '💵' },
    { key: 'b2cProgress', label: 'Прогресс B2C', emoji: '📊' },
  ],
  PERSONAL: [
    { key: 'workouts', label: 'Тренировок', emoji: '🏋️', target: 2 },
    { key: 'maiTime', label: '50 мин с Май сегодня', emoji: '👨‍👩‍👧' },
  ],
};
