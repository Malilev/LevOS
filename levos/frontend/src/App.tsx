import { useState, useCallback } from 'react';
import { useAuth } from './hooks/useAuth';
import { useFirebaseSync, useSyncedState } from './hooks/useFirebaseSync';
import { useSchedule } from './hooks/useSchedule';
import { Header, TabBar, AuthScreen, type Tab } from './components/layout';
import { PlanTab } from './components/plan';
import { DashboardTab } from './components/dashboard';
import { TriggersTab } from './components/triggers';
import { GoalsTab } from './components/goals';
import { BrainDumpTab } from './components/brainDump';
import { DEFAULT_WEEK_CONTEXTS } from './constants';
import type { Goal, BrainDumpItem, ScheduleBlock } from './types';
import { genId } from './utils';

function App() {
  const { user, loading: authLoading, signIn, signOut, isAuthenticated } = useAuth();
  const { syncStatus } = useSyncedState(user?.uid || null);

  const [tab, setTab] = useState<Tab>('plan');

  // Schedule state with Firebase sync
  const {
    value: savedSchedules,
    setValue: _setSavedSchedules,
  } = useFirebaseSync<Record<string, ScheduleBlock[]>>({
    key: 'schedules',
    userId: user?.uid || null,
    defaultValue: {},
  });

  const {
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
  } = useSchedule({ initialSchedules: savedSchedules });

  // Sync schedules to Firebase (for future use)
  // const syncSchedules = useCallback(
  //   (newSchedules: Record<string, ScheduleBlock[]>) => {
  //     setSchedules(newSchedules);
  //     setSavedSchedules(newSchedules);
  //   },
  //   [setSchedules, setSavedSchedules]
  // );

  // Goals state
  const { value: goals, setValue: setGoals } = useFirebaseSync<Goal[]>({
    key: 'goals',
    userId: user?.uid || null,
    defaultValue: [],
  });

  // Brain dump state
  const { value: brainDump, setValue: setBrainDump } = useFirebaseSync<BrainDumpItem[]>({
    key: 'brainDump',
    userId: user?.uid || null,
    defaultValue: [],
  });

  // Day scenarios state
  const { value: dayScenarios, setValue: setDayScenarios } = useFirebaseSync<Record<string, string>>({
    key: 'dayScenarios',
    userId: user?.uid || null,
    defaultValue: {},
  });

  // Day contexts state (per specific date)
  const { value: dayContexts, setValue: setDayContexts } = useFirebaseSync<Record<string, string>>({
    key: 'dayContexts',
    userId: user?.uid || null,
    defaultValue: {},
  });

  // Week contexts state (default template per day of week)
  const { value: weekContexts } = useFirebaseSync<Record<number, string>>({
    key: 'weekContexts',
    userId: user?.uid || null,
    defaultValue: DEFAULT_WEEK_CONTEXTS,
  });

  // Week focus state
  const { value: weekFocus, setValue: setWeekFocus } = useFirebaseSync<string>({
    key: 'weekFocus',
    userId: user?.uid || null,
    defaultValue: '',
  });

  // Checked triggers state
  const { value: checkedTriggers, setValue: setCheckedTriggers } = useFirebaseSync<Record<string, boolean>>({
    key: 'checkedTriggers',
    userId: user?.uid || null,
    defaultValue: {},
  });

  // Current location state
  const { value: currentLocation, setValue: setCurrentLocation } = useFirebaseSync<string | null>({
    key: 'currentLocation',
    userId: user?.uid || null,
    defaultValue: null,
  });

  // Metrics state
  const { value: metrics, setValue: setMetrics } = useFirebaseSync<Record<string, Record<string, number | string | boolean>>>({
    key: 'metrics',
    userId: user?.uid || null,
    defaultValue: {},
  });

  // Goal handlers
  const handleAddGoal = useCallback(
    (goal: Omit<Goal, 'id'>) => {
      setGoals((prev) => [...prev, { ...goal, id: genId() }]);
    },
    [setGoals]
  );

  const handleToggleGoal = useCallback(
    (id: string) => {
      setGoals((prev) =>
        prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
      );
    },
    [setGoals]
  );

  const handleDeleteGoal = useCallback(
    (id: string) => {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    },
    [setGoals]
  );

  // Metrics handler
  const handleUpdateMetric = useCallback(
    (project: string, key: string, value: number | string | boolean) => {
      setMetrics((prev) => ({
        ...prev,
        [project]: {
          ...prev[project],
          [key]: value,
        },
      }));
    },
    [setMetrics]
  );

  // Brain dump handlers
  const handleAddDumpItem = useCallback(
    (item: BrainDumpItem) => {
      setBrainDump((prev) => [item, ...prev]);
    },
    [setBrainDump]
  );

  const handleDeleteDumpItem = useCallback(
    (id: string) => {
      setBrainDump((prev) => prev.filter((d) => d.id !== id));
    },
    [setBrainDump]
  );

  const handleConvertToGoal = useCallback(
    (item: BrainDumpItem) => {
      handleAddGoal({
        text: item.text,
        project: item.project,
        period: 'D',
        done: false,
      });
      handleDeleteDumpItem(item.id);
    },
    [handleAddGoal, handleDeleteDumpItem]
  );

  // Block click handler for moving
  const handleBlockClick = useCallback(
    (dateKey: string, blockId: string) => {
      const schedule = schedules[dateKey] || [];
      const block = schedule.find((b) => b.id === blockId);
      if (!block || block.auto) return;

      if (movingBlock?.id === blockId && movingBlock?.dateKey === dateKey) {
        setMovingBlock(null);
      } else {
        setMovingBlock({ id: blockId, dateKey });
      }
    },
    [schedules, movingBlock, setMovingBlock]
  );

  // Apply scenario handler
  const handleApplyScenario = useCallback(
    (dateKey: string, scenario: string, opCount: number, context: string) => {
      applyScenario(dateKey, scenario, opCount, context);
    },
    [applyScenario]
  );

  // Clear day handler
  const handleClearDay = useCallback(
    (dateKey: string) => {
      setSchedules((prev) => ({ ...prev, [dateKey]: [] }));
      setDayScenarios((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
      setDayContexts((prev) => {
        const next = { ...prev };
        delete next[dateKey];
        return next;
      });
    },
    [setSchedules, setDayScenarios, setDayContexts]
  );

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-8 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center animate-pulse">
            <span className="text-2xl">🦁</span>
          </div>
          <div className="text-white/60">Loading...</div>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <AuthScreen onSignIn={signIn} loading={authLoading} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        user={user}
        syncStatus={syncStatus}
        onSignIn={signIn}
        onSignOut={signOut}
      />

      <main className="flex-1 flex flex-col overflow-hidden pb-20">
        {tab === 'dash' && (
          <DashboardTab
            todayKey={todayKey}
            schedules={schedules}
            dayScenarios={dayScenarios}
            weekContexts={weekContexts}
            goals={goals}
            weekFocus={weekFocus}
            currentLocation={currentLocation}
            setCurrentLocation={setCurrentLocation}
            setDayScenarios={setDayScenarios}
            onGoToTab={(t) => setTab(t as Tab)}
            toggleGoal={handleToggleGoal}
          />
        )}

        {tab === 'plan' && (
          <PlanTab
            schedules={schedules}
            selectedBlock={selectedBlock}
            movingBlock={movingBlock}
            draggingBlock={draggingBlock}
            dayScenarios={dayScenarios}
            dayContexts={dayContexts}
            weekContexts={weekContexts}
            onSelectBlock={setSelectedBlock}
            onPlaceBlock={placeBlock}
            onMoveBlock={moveBlock}
            onShiftBlock={shiftBlock}
            onResizeBlock={resizeBlock}
            onRemoveBlock={removeBlock}
            onBlockClick={handleBlockClick}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
            onApplyScenario={handleApplyScenario}
            onClearDay={handleClearDay}
            setDayScenarios={setDayScenarios}
            setDayContexts={setDayContexts}
          />
        )}

        {tab === 'triggers' && (
          <TriggersTab
            todayKey={todayKey}
            schedules={schedules}
            dayScenarios={dayScenarios}
            weekContexts={weekContexts}
            goals={goals}
            brainDump={brainDump}
            checkedTriggers={checkedTriggers}
            weekFocus={weekFocus}
            metrics={metrics}
            setCheckedTriggers={setCheckedTriggers}
            setWeekFocus={setWeekFocus}
            setDayScenarios={setDayScenarios}
            toggleGoal={handleToggleGoal}
          />
        )}

        {tab === 'goals' && (
          <GoalsTab
            goals={goals}
            metrics={metrics}
            onAddGoal={handleAddGoal}
            onToggleGoal={handleToggleGoal}
            onDeleteGoal={handleDeleteGoal}
            onUpdateMetric={handleUpdateMetric}
          />
        )}

        {tab === 'dump' && (
          <BrainDumpTab
            items={brainDump}
            onAddItem={handleAddDumpItem}
            onDeleteItem={handleDeleteDumpItem}
            onConvertToGoal={handleConvertToGoal}
          />
        )}
      </main>

      <TabBar activeTab={tab} onTabChange={setTab} />
    </div>
  );
}

export default App;
