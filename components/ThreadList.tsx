
import React from 'react';
import { Thread, SortMode } from '../types';

interface ThreadListProps {
  threads: Thread[];
  sortMode: SortMode;
  onSortChange: (mode: SortMode) => void;
  onThreadClick: (thread: Thread) => void;
  onShowImage: (src: string) => void;
  onRate: (id: string, type: 'like' | 'dislike') => void;
}

const ThreadList: React.FC<ThreadListProps> = ({ 
  threads, sortMode, onSortChange, onThreadClick, onShowImage, onRate 
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-lg font-bold text-slate-800">スレッド一覧</h2>
        <select 
          value={sortMode}
          onChange={(e) => onSortChange(e.target.value as SortMode)}
          className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none shadow-sm"
        >
          <option value="new">新着順</option>
          <option value="old">古い順</option>
          <option value="latestPost">最新投稿順</option>
          <option value="high">高評価順</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {threads.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center text-slate-400 border border-slate-100 card-shadow">
            <div className="text-4xl mb-4">📭</div>
            スレッドがまだありません
          </div>
        ) : (
          threads.map(thread => (
            <div 
              key={thread.id}
              onClick={() => onThreadClick(thread)}
              className="bg-white rounded-2xl p-4 border border-slate-100 card-shadow hover:shadow-lg transition-all cursor-pointer group relative flex flex-col sm:flex-row gap-4"
              style={{ borderLeft: `6px solid ${thread.color}` }}
            >
              <div className="flex-1">
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {thread.locked && <span className="text-slate-400">🔒</span>}
                    {thread.password && <span className="text-slate-400">🔑</span>}
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                      {thread.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRate(thread.id, 'like'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold hover:bg-blue-100"
                    >
                      👍 {thread.likes || 0}
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRate(thread.id, 'dislike'); }}
                      className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-bold hover:bg-red-100"
                    >
                      👎 {thread.dislikes || 0}
                    </button>
                  </div>
                </div>

                <p className="text-slate-500 text-sm line-clamp-2 mb-3">
                  {thread.detail}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-400">
                  <div className="flex items-center gap-1">
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                      {thread.postCount || 0}
                    </span>
                    <span>投稿</span>
                  </div>
                  <span>•</span>
                  <span>{thread.memberId}</span>
                  <span>•</span>
                  <span>{thread.created_at?.toDate().toLocaleDateString()}</span>
                </div>

                {thread.image && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); onShowImage(thread.image!); }}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
                  >
                    🖼️ 画像を表示
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ThreadList;
