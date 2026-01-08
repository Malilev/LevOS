import { DEFAULT_BLOCKS, CATEGORIES } from '../../constants';

interface BlockLibraryProps {
  selectedBlock: string | null;
  onSelectBlock: (blockId: string | null) => void;
  onClose: () => void;
}

export function BlockLibrary({ selectedBlock, onSelectBlock, onClose }: BlockLibraryProps) {
  // Group blocks by category
  const blocksByCategory = Object.entries(DEFAULT_BLOCKS).reduce(
    (acc, [id, block]) => {
      const cat = block.category;
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push({ ...block, id });
      return acc;
    },
    {} as Record<string, typeof DEFAULT_BLOCKS[keyof typeof DEFAULT_BLOCKS][]>
  );

  return (
    <div className="absolute bottom-20 left-3 right-3 glass rounded-2xl p-4 shadow-2xl max-h-[60vh] overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <span className="text-white font-medium text-lg">Block Library</span>
        <button
          onClick={onClose}
          className="w-8 h-8 glass-btn rounded-lg flex items-center justify-center text-white/60 hover:text-white"
        >
          ×
        </button>
      </div>

      {Object.entries(blocksByCategory).map(([categoryId, blocks]) => {
        const category = CATEGORIES[categoryId];
        if (!category) return null;

        return (
          <div key={categoryId} className="mb-4">
            <div
              className="text-xs font-medium mb-2 px-1 uppercase tracking-wider"
              style={{ color: category.color }}
            >
              {category.name}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {blocks.map((block) => (
                <button
                  key={block.id}
                  onClick={() => {
                    onSelectBlock(selectedBlock === block.id ? null : block.id);
                  }}
                  className={`p-3 rounded-xl text-left transition-all ${
                    selectedBlock === block.id
                      ? 'ring-2 ring-white/50 bg-white/20'
                      : 'glass-btn hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{block.emoji}</span>
                    <span className="text-white text-xs truncate">{block.name}</span>
                  </div>
                  <div className="text-white/40 text-xs mt-1">{block.duration}m</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {selectedBlock && (
        <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-xl text-center text-blue-300 text-sm backdrop-blur-xl">
          Click on a time slot to place block
        </div>
      )}
    </div>
  );
}
