// Schedule types
export interface ScheduleBlock {
  id: string;
  blockId: string;
  startHour: number;
  duration: number;
  auto?: boolean;
}

export interface BlockDefinition {
  id: string;
  name: string;
  emoji: string;
  category: string;
  color: string;
  duration: number;
  minDur: number;
  maxDur: number;
}

export interface TimeSlot {
  hour: number;
  label: string;
  isHalf: boolean;
  isMidnight?: boolean;
  isNight?: boolean;
}

// Category types
export interface Category {
  name: string;
  color: string;
}

// Context types
export interface Context {
  name: string;
  color: string;
  emoji: string;
  blockId: string;
}

// Scenario types
export interface Scenario {
  name: string;
  desc: string;
  wakeUp: number;
  opStart?: number;
  homeWindow?: { start: number; dur: number };
  canGym?: boolean;
  arriveBy?: string;
  note?: string;
  isWeekend?: boolean;
}

// Project types
export interface Project {
  name: string;
  color: string;
  emoji: string;
}

// Location context types
export interface LocationContext {
  id: string;
  name: string;
  emoji: string;
  color: string;
  time: string;
  interrupt: string;
  energy: string;
  tools: string;
  works: string;
  bundle: string;
  tasks: Record<string, string>;
  warning?: string;
}

// Goal types
export interface Goal {
  id: string;
  text: string;
  project: string;
  period: 'D' | 'W' | 'M' | 'Q' | '';
  done: boolean;
}

// Brain dump types
export interface BrainDumpItem {
  id: string;
  text: string;
  project: string;
  createdAt: string;
}

// Metrics types
export interface MetricConfig {
  key: string;
  label: string;
  emoji: string;
  target?: number;
}

export interface ProjectMetrics {
  [key: string]: number;
}

export interface Metrics {
  POLECHAT: ProjectMetrics;
  LAB: ProjectMetrics;
  SOMALAB: ProjectMetrics;
  PERSONAL: ProjectMetrics;
}

// Trigger types
export interface TriggerItem {
  key: string;
  title: string;
  desc: string;
  anchor?: string;
  next?: string | null;
  isChoice?: boolean;
  indent?: boolean;
  highlight?: boolean;
}

export interface TriggerSection {
  id: string;
  title: string;
  subtitle?: string;
  items: TriggerItem[];
}

// Schedule state
export type Schedules = Record<string, ScheduleBlock[]>;
export type DayScenarios = Record<string, string>;
export type WeekContexts = Record<number, string>;
export type CheckedTriggers = Record<string, boolean>;
