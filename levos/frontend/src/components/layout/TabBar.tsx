type Tab = 'dash' | 'plan' | 'triggers' | 'goals' | 'dump';

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: { id: Tab; emoji: string; label: string }[] = [
  { id: 'dash', emoji: '📊', label: 'Dash' },
  { id: 'plan', emoji: '📅', label: 'Plan' },
  { id: 'triggers', emoji: '⚡', label: 'Triggers' },
  { id: 'goals', emoji: '🎯', label: 'Goals' },
  { id: 'dump', emoji: '🧠', label: 'Dump' },
];

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-4 left-4 right-4 z-50 glass rounded-2xl flex justify-around px-2 py-1 shadow-lg shadow-black/30 safe-bottom">
      {TABS.map(({ id, emoji, label }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={`relative flex-1 py-2 text-center transition-all duration-300 rounded-xl mx-0.5 ${
            activeTab === id
              ? 'text-white'
              : 'text-white/40 hover:text-white/60'
          }`}
        >
          {activeTab === id && (
            <div className="absolute inset-0 glass-light rounded-xl" />
          )}
          <div className="relative">
            <div className={`text-xl mb-0.5 transition-transform duration-200 ${
              activeTab === id ? 'scale-110' : ''
            }`}>
              {emoji}
            </div>
            <div className={`text-[10px] font-medium tracking-wide ${
              activeTab === id ? 'text-white' : ''
            }`}>
              {label}
            </div>
          </div>
        </button>
      ))}
    </nav>
  );
}

export type { Tab };
