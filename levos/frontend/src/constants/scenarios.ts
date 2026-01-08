import type { Scenario } from '../types';

export const SCENARIOS: Record<string, Scenario> = {
  '1': { name: '1-й', desc: 'к 8:30', wakeUp: 7.5, opStart: 8.5, arriveBy: '8:30-8:40' },
  '2': { name: '2-й', desc: 'к 10:00', wakeUp: 8.5, opStart: 10, homeWindow: { start: 9, dur: 30 }, arriveBy: '10:00' },
  '3': { name: '3-й', desc: 'к 12:00', wakeUp: 10, opStart: 12, homeWindow: { start: 10.5, dur: 60 }, arriveBy: '12:00', note: 'Позвонить уточнить! Может быть 15:00' },
  '4': { name: '4+', desc: 'к 15:00', wakeUp: 11, opStart: 15, homeWindow: { start: 11.5, dur: 180 }, canGym: true, arriveBy: '15:00' },
  'w': { name: '🏠', desc: 'выходной', wakeUp: 11, isWeekend: true },
};

export const detectScenarioFromSchedule = (schedule: { startHour: number; blockId: string }[]): string | null => {
  const opBlock = schedule.find(b => b.blockId.startsWith('OP_'));
  if (!opBlock) return null;

  const opStart = opBlock.startHour;

  if (opStart <= 9) return '1';
  if (opStart <= 11) return '2';
  if (opStart <= 13) return '3';
  return '4';
};
