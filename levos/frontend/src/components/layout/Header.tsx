import type { User } from 'firebase/auth';

interface HeaderProps {
  user: User | null;
  syncStatus: 'connecting' | 'synced' | 'offline';
  onSignIn: () => void;
  onSignOut: () => void;
}

export function Header({ user, syncStatus, onSignIn, onSignOut }: HeaderProps) {
  const syncConfig = {
    connecting: { icon: '🔄', color: 'text-yellow-400', pulse: true },
    synced: { icon: '☁️', color: 'text-green-400', pulse: false },
    offline: { icon: '📴', color: 'text-gray-500', pulse: false },
  }[syncStatus];

  return (
    <header className="glass border-b border-white/10 px-4 py-3 flex items-center justify-between safe-top">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <span className="text-xl">🦁</span>
        </div>
        <div>
          <span className="font-bold text-white text-lg tracking-tight">LEV OS</span>
          <span className="text-xs text-white/40 ml-1">2.0</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`text-sm ${syncConfig.color} ${syncConfig.pulse ? 'animate-pulse' : ''}`}
          title={`Sync: ${syncStatus}`}
        >
          {syncConfig.icon}
        </span>

        {user ? (
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-3 py-1.5 glass-btn rounded-full text-sm text-white/80 hover:text-white"
          >
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt=""
                className="w-6 h-6 rounded-full ring-2 ring-white/20"
              />
            )}
            <span className="max-w-[80px] truncate">{user.displayName || 'User'}</span>
          </button>
        ) : (
          <button
            onClick={onSignIn}
            className="px-4 py-1.5 accent-blue rounded-full text-sm text-white font-medium hover:scale-105 transition-transform"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
