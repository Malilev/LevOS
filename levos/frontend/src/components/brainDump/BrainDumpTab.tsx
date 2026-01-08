import { useState, useMemo } from 'react';
import type { BrainDumpItem } from '../../types';
import { PROJECTS } from '../../constants';
import { genId } from '../../utils';

interface BrainDumpTabProps {
  items: BrainDumpItem[];
  onAddItem: (item: BrainDumpItem) => void;
  onDeleteItem: (id: string) => void;
  onConvertToGoal?: (item: BrainDumpItem) => void;
}

export function BrainDumpTab({ items, onAddItem, onDeleteItem, onConvertToGoal }: BrainDumpTabProps) {
  const [newText, setNewText] = useState('');
  const [newProject, setNewProject] = useState('');
  const [filter, setFilter] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    onAddItem({
      id: genId(),
      text: newText.trim(),
      project: newProject || '',
      createdAt: new Date().toISOString(),
    });

    setNewText('');
  };

  const filteredItems = useMemo(() => {
    if (!filter) return items;
    return items.filter(item => item.project === filter);
  }, [items, filter]);

  const itemsByProject = useMemo(() => {
    const grouped: Record<string, BrainDumpItem[]> = { _none: [] };
    Object.keys(PROJECTS).forEach(k => grouped[k] = []);

    items.forEach(item => {
      const key = item.project || '_none';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(item);
    });

    return grouped;
  }, [items]);

  return (
    <div className="flex-1 overflow-auto">
      {/* Заголовок */}
      <div className="glass border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-white">🧠 Brain Dump</div>
          <div className="text-sm text-white/50">{items.length} мыслей</div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Быстрый ввод */}
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-4">
          <div className="text-sm font-medium mb-3 text-white/40 uppercase tracking-wider">Записать мысль</div>
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Что прилетело в голову?"
            className="w-full glass-input rounded-xl px-4 py-3 text-sm mb-3 resize-none text-white placeholder-white/30"
            rows={2}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <div className="flex gap-2">
            <select
              value={newProject}
              onChange={(e) => setNewProject(e.target.value)}
              className="flex-1 glass-input rounded-xl px-3 py-2 text-xs text-white"
            >
              <option value="">📁 Без проекта</option>
              {Object.entries(PROJECTS).map(([key, proj]) => (
                <option key={key} value={key}>
                  {proj.emoji} {proj.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={!newText.trim()}
              className="px-5 py-2 accent-orange rounded-xl text-sm font-bold disabled:opacity-30 transition-all hover:scale-105 active:scale-95"
            >
              +
            </button>
          </div>
        </form>

        {/* Фильтры */}
        <div className="glass rounded-2xl p-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                filter === ''
                  ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/30'
                  : 'glass-btn text-white/60'
              }`}
            >
              Все ({items.length})
            </button>
            {Object.entries(PROJECTS).map(([k, v]) => {
              const count = itemsByProject[k]?.length || 0;
              if (count === 0) return null;
              return (
                <button
                  key={k}
                  onClick={() => setFilter(k)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                    filter === k ? 'shadow-lg' : 'glass-btn'
                  }`}
                  style={{
                    backgroundColor: filter === k ? v.color : `${v.color}22`,
                    color: filter === k ? 'white' : v.color,
                    boxShadow: filter === k ? `0 4px 15px ${v.color}44` : undefined,
                  }}
                >
                  {v.emoji} {count}
                </button>
              );
            })}
            {(itemsByProject['_none']?.length || 0) > 0 && (
              <button
                onClick={() => setFilter('_none')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                  filter === '_none'
                    ? 'bg-gray-500 text-white shadow-lg shadow-gray-500/30'
                    : 'glass-btn text-white/60'
                }`}
              >
                📌 {itemsByProject['_none'].length}
              </button>
            )}
          </div>
        </div>

        {/* Список мыслей */}
        {filteredItems.length > 0 ? (
          <div className="space-y-3">
            {filteredItems.map((item) => {
              const project = item.project ? PROJECTS[item.project] : null;
              const createdDate = new Date(item.createdAt);
              const timeAgo = getTimeAgo(createdDate);

              return (
                <div
                  key={item.id}
                  className="glass rounded-2xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm whitespace-pre-wrap text-white/90">{item.text}</p>
                      <div className="flex items-center gap-2 mt-3">
                        {project && (
                          <span
                            className="text-xs px-2 py-1 rounded-lg"
                            style={{ backgroundColor: project.color + '33', color: project.color }}
                          >
                            {project.emoji} {project.name}
                          </span>
                        )}
                        <span className="text-xs text-white/30">{timeAgo}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      {onConvertToGoal && (
                        <button
                          onClick={() => onConvertToGoal(item)}
                          className="w-9 h-9 glass-btn rounded-xl text-sm flex items-center justify-center hover:bg-green-500/30 transition-colors"
                          title="В цель"
                        >
                          🎯
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="w-9 h-9 glass-btn rounded-xl text-sm flex items-center justify-center hover:bg-red-500/30 transition-colors"
                        title="Удалить"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass rounded-2xl p-8 text-center">
            <div className="text-5xl mb-4 opacity-50">🧠</div>
            <div className="text-white/40 text-lg mb-2">
              {filter ? 'Нет мыслей по этому проекту' : 'Голова свободна!'}
            </div>
            <div className="text-white/30 text-sm">
              Записывай всё что прилетает — разберёшь потом
            </div>
          </div>
        )}

        {/* Подсказка */}
        <div className="glass-dark rounded-2xl p-4 text-center">
          <div className="text-xs text-white/30 italic">
            "Прилетела мысль → записал → вернулся к работе"
          </div>
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} д назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}
